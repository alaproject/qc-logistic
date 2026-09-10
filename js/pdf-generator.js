import { escapeHtml } from "./dashboard.js";

function qrSvg(value) {
  let seed = [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
  const cells = [];
  const size = 21;
  const finder = (x, y, originX, originY) => x >= originX && x < originX + 7 && y >= originY && y < originY + 7 && (x === originX || x === originX + 6 || y === originY || y === originY + 6 || (x >= originX + 2 && x <= originX + 4 && y >= originY + 2 && y <= originY + 4));
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const filled = finder(x, y, 0, 0) || finder(x, y, 14, 0) || finder(x, y, 0, 14) || seed % 3 === 0;
      if (filled) cells.push(`<rect x="${x + 2}" y="${y + 2}" width="1" height="1"/>`);
    }
  }
  return `<svg class="manifest-qr" viewBox="0 0 25 25" role="img" aria-label="QR batch ${escapeHtml(value)}"><rect width="25" height="25" fill="#fff"/>${cells.join("")}</svg>`;
}

export function generateManifest(record) {
  if (!record || typeof record !== "object") {
    throw new Error("Pilih batch yang valid sebelum membuat PDF.");
  }
  const target = document.getElementById("manifest-print");
  if (!target) {
    throw new Error("Template manifest PDF tidak tersedia.");
  }
  if (!window.html2pdf) {
    throw new Error("Library PDF belum siap. Silakan muat ulang halaman dan coba lagi.");
  }

  const itemRows = (record.items || []).map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item?.nama || "-")}</td><td>${escapeHtml(item?.jumlah ?? 0)} ${escapeHtml(item?.satuan || "unit")}</td><td>${escapeHtml(item?.kategori || "-")}</td><td>${escapeHtml(item?.kondisi || "-")}</td></tr>`).join("");
  const batchId = String(record.batchId || "").trim();
  const date = String(record.date || "").trim();
  const tenant = String(record.tenant || "").trim();
  const officer = String(record.officer || "").trim();
  const vehicle = String(record.vehicle || "").trim();
  const plate = String(record.plate || "").trim();
  const driver = String(record.driver || "").trim();
  const phone = String(record.phone || "").trim();
  const status = String(record.status || "").trim();
  const notes = String(record.notes || "Tidak ada catatan.");

  target.innerHTML = `
    <div class="manifest-sheet">
      <div class="manifest-head">
        <div class="manifest-brand">
          <div class="manifest-logo">QC</div>
          <div>
            <p class="manifest-kicker">QC LOGISTIK TENANT</p>
            <h1>SURAT JALAN / MANIFES QC</h1>
            <p class="manifest-subtitle">Dokumen pemeriksaan kualitas muatan</p>
          </div>
        </div>
        <div class="manifest-code">${qrSvg(batchId)}<strong>${escapeHtml(batchId)}</strong><span>${escapeHtml(date)}</span></div>
      </div>
      <div class="manifest-info">
        <div><strong>Tenant</strong><br>${escapeHtml(tenant)}<br><br><strong>Petugas QC</strong><br>${escapeHtml(officer)}</div>
        <div><strong>Armada</strong><br>${escapeHtml(vehicle)} / ${escapeHtml(plate)}<br><br><strong>Pengemudi</strong><br>${escapeHtml(driver)} (${escapeHtml(phone)})</div>
      </div>
      <table>
        <thead><tr><th>No.</th><th>Nama barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead>
        <tbody>${itemRows || `<tr><td colspan="5">Tidak ada data barang untuk batch ini.</td></tr>`}</tbody>
      </table>
      <div class="manifest-note"><strong>Status: ${escapeHtml(status)}</strong><br>Catatan: ${escapeHtml(notes)}</div>
      <div class="manifest-signatures">
        <div><span>Petugas QC</span><div class="signature-line"></div><strong>${escapeHtml(officer)}</strong></div>
        <div><span>Verifikasi Mandiri</span><div class="signature-line"></div><strong>${record.verified ? "Terverifikasi" : "Belum diverifikasi"}</strong></div>
      </div>
      <p class="manifest-footer">Dokumen dibuat dari QC Logistik Tenant · ${escapeHtml(new Date().toLocaleString("id-ID"))}</p>
    </div>`;

  target.classList.add("visible");
  const source = target.querySelector(".manifest-sheet") || target;
  const filename = `Manifes-QC-${batchId || "batch"}.pdf`;
  const options = { margin: 0, filename, image: { type: "jpeg", quality: .98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" }, pagebreak: { mode: ["css", "legacy"] }, jsPDF: { unit: "pt", format: "a4", orientation: "portrait" } };
  const cleanup = () => {
    target.classList.remove("visible");
    target.innerHTML = "";
  };

  return window.html2pdf().set(options).from(source).save().then(() => { cleanup(); }, error => { cleanup(); throw error; });
}
