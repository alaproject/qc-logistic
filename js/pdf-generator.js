import { escapeHtml } from "./dashboard.js";

export function generateManifest(record) {
  const target = document.getElementById("manifest-print");
  const items = record.items.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.nama)}</td><td>${escapeHtml(item.jumlah)} ${escapeHtml(item.satuan)}</td><td>${escapeHtml(item.kategori)}</td><td>${escapeHtml(item.kondisi)}</td></tr>`).join("");
  target.innerHTML = `<div class="manifest-head"><div><p style="font:700 11px Space Mono,monospace;letter-spacing:2px;color:#19756b">QC LOGISTIK TENANT</p><h1>SURAT JALAN / MANIFES QC</h1><p style="font-size:12px;margin-top:8px">Dokumen pemeriksaan kualitas muatan</p></div><div style="text-align:right;font-size:12px"><strong>${escapeHtml(record.batchId)}</strong><br>${escapeHtml(record.date)}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px;font-size:12px"><div><strong>Tenant</strong><br>${escapeHtml(record.tenant)}<br><br><strong>Petugas QC</strong><br>${escapeHtml(record.officer)}</div><div><strong>Armada</strong><br>${escapeHtml(record.vehicle)} / ${escapeHtml(record.plate)}<br><br><strong>Pengemudi</strong><br>${escapeHtml(record.driver)} (${escapeHtml(record.phone)})</div></div><table><thead><tr><th>No.</th><th>Nama barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead><tbody>${items}</tbody></table><div style="margin-top:22px;padding:12px;background:#eff8f5;font-size:12px"><strong>Status: ${escapeHtml(record.status)}</strong><br>Catatan: ${escapeHtml(record.notes || "Tidak ada catatan.")}</div><div class="sign"><div>Petugas QC<br><br><br><strong>${escapeHtml(record.officer)}</strong></div><div>Verifikasi Mandiri<br><br><br><strong>${record.verified ? "Terverifikasi" : "Belum diverifikasi"}</strong></div></div>`;
  target.classList.add("visible");
  const filename = `Manifes-QC-${record.batchId}.pdf`;
  const options = { margin: 0, filename, image: { type: "jpeg", quality: .98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "pt", format: "a4", orientation: "portrait" } };
  return window.html2pdf().set(options).from(target).save().finally(() => target.classList.remove("visible"));
}
