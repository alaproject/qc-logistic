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
  const target = document.getElementById("manifest-print");
  const items = record.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.nama)}</td><td>${escapeHtml(item.jumlah)} ${escapeHtml(item.satuan)}</td><td>${escapeHtml(item.kategori)}</td><td>${escapeHtml(item.kondisi)}</td></tr>`).join("");
  target.innerHTML = `<div class="manifest-head"><div class="manifest-brand"><div class="manifest-logo">QC</div><div><p class="manifest-kicker">QC LOGISTIK TENANT</p><h1>SURAT JALAN / MANIFES QC</h1><p class="manifest-subtitle">Dokumen pemeriksaan kualitas muatan</p></div></div><div class="manifest-code">${qrSvg(record.batchId)}<strong>${escapeHtml(record.batchId)}</strong><span>${escapeHtml(record.date)}</span></div></div><div class="manifest-info"><div><strong>Tenant</strong><br>${escapeHtml(record.tenant)}<br><br><strong>Petugas QC</strong><br>${escapeHtml(record.officer)}</div><div><strong>Armada</strong><br>${escapeHtml(record.vehicle)} / ${escapeHtml(record.plate)}<br><br><strong>Pengemudi</strong><br>${escapeHtml(record.driver)} (${escapeHtml(record.phone)})</div></div><table><thead><tr><th>No.</th><th>Nama barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead><tbody>${items}</tbody></table><div class="manifest-note"><strong>Status: ${escapeHtml(record.status)}</strong><br>Catatan: ${escapeHtml(record.notes || "Tidak ada catatan.")}</div><div class="manifest-signatures"><div><span>Petugas QC</span><div class="signature-line"></div><strong>${escapeHtml(record.officer)}</strong></div><div><span>Verifikasi Mandiri</span><div class="signature-line"></div><strong>${record.verified ? "Terverifikasi" : "Belum diverifikasi"}</strong></div></div><p class="manifest-footer">Dokumen dibuat dari QC Logistik Tenant · ${escapeHtml(new Date().toLocaleString("id-ID"))}</p>`;
  target.classList.add("visible");
  const filename = `Manifes-QC-${record.batchId}.pdf`;
  const options = { margin: 0, filename, image: { type: "jpeg", quality: .98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" }, pagebreak: { mode: ["css", "legacy"] }, jsPDF: { unit: "pt", format: "a4", orientation: "portrait" } };
  const cleanup = () => target.classList.remove("visible");
  return window.html2pdf().set(options).from(target.querySelector(".manifest-sheet") || target).save().then(() => { cleanup(); }, error => { cleanup(); throw error; });
}
