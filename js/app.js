import { currentUser, isLoggedIn, login, logout } from "./auth.js";
import { addItemRow, collectItems, resetItems } from "./form.js";
import { deleteRecord, escapeHtml, getRecords, renderDashboard, saveRecord, statusClass } from "./dashboard.js";
import { generateManifest } from "./pdf-generator.js";

let records = getRecords();
let selectedRecord = null;
const $ = id => document.getElementById(id);

function setView(viewId) {
  document.querySelectorAll(".sub-view").forEach(view => view.classList.toggle("hidden", view.id !== viewId));
  document.querySelectorAll(".tab-button").forEach(button => button.classList.toggle("active", button.dataset.view === viewId));
}
function showApp() {
  $("login-view").classList.add("hidden");
  $("app-view").classList.remove("hidden");
  $("session-user").textContent = `Admin: ${currentUser()}`;
  render();
}
function showLogin() { $("app-view").classList.add("hidden"); $("login-view").classList.remove("hidden"); }
function render() { records = getRecords(); renderDashboard(records, openDetail, removeBatch); }
function showMessage(element, text, tone = "") { element.textContent = text; element.className = `form-message ${tone}`; }
function resetForm() { $("qc-form").reset(); $("tanggal").value = new Date().toISOString().slice(0, 10); resetItems(); }
function openDetail(record) {
  if (!record) return;
  selectedRecord = record;
  $("detail-title").textContent = record.batchId;
  $("detail-content").innerHTML = `<div class="flex items-center justify-between gap-3"><strong class="text-lg">${escapeHtml(record.tenant)}</strong><span class="status-badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><div class="detail-grid mt-6"><div><div class="detail-label">Tanggal QC</div><div class="detail-value">${escapeHtml(record.date)}</div></div><div><div class="detail-label">Petugas</div><div class="detail-value">${escapeHtml(record.officer)}</div></div><div><div class="detail-label">Armada</div><div class="detail-value">${escapeHtml(record.vehicle)}</div></div><div><div class="detail-label">Plat nomor</div><div class="detail-value">${escapeHtml(record.plate)}</div></div><div><div class="detail-label">Pengemudi</div><div class="detail-value">${escapeHtml(record.driver)}</div></div><div><div class="detail-label">No. HP</div><div class="detail-value">${escapeHtml(record.phone)}</div></div></div><div class="detail-items"><table><thead><tr><th>Barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead><tbody>${record.items.map(item => `<tr><td>${escapeHtml(item.nama)}</td><td>${escapeHtml(item.jumlah)} ${escapeHtml(item.satuan)}</td><td>${escapeHtml(item.kategori)}</td><td>${escapeHtml(item.kondisi)}</td></tr>`).join("")}</tbody></table></div><div class="mt-5 rounded-lg bg-slate-50 p-4 text-sm"><strong>Catatan QC</strong><p class="mt-2 whitespace-pre-wrap">${escapeHtml(record.notes || "Tidak ada catatan.")}</p></div><p class="mt-4 text-sm font-bold ${record.verified ? "text-teal-700" : "text-slate-500"}">${record.verified ? "✓ Data telah diverifikasi QC" : "○ Data belum diverifikasi QC"}</p>`;
  $("detail-modal").classList.remove("hidden");
}
function closeDetail() { $("detail-modal").classList.add("hidden"); selectedRecord = null; }
function removeBatch(id) { if (confirm("Hapus batch ini?")) { deleteRecord(id); render(); } }

$("login-form").addEventListener("submit", event => { event.preventDefault(); const ok = login($("login-username").value.trim(), $("login-password").value); if (ok) { showApp(); } else showMessage($("login-message"), "Username atau password salah.", "error"); });
$("logout-button").addEventListener("click", () => { logout(); showLogin(); $("login-form").reset(); });
$("new-batch-button").addEventListener("click", () => { resetForm(); setView("form-view"); });
document.querySelectorAll(".tab-button").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$("add-item-button").addEventListener("click", () => addItemRow());
$("qc-form").addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; if (!form.checkValidity()) { form.reportValidity(); return; } const record = { batchId: $("batch-id").value.trim(), date: $("tanggal").value, tenant: $("tenant").value.trim(), officer: $("petugas-qc").value.trim(), vehicle: $("jenis-kendaraan").value, plate: $("plat-nomor").value.trim(), driver: $("nama-pengemudi").value.trim(), phone: $("no-hp").value.trim(), items: collectItems(), notes: $("catatan-qc").value.trim(), status: $("status-qc").value, verified: $("verifikasi-qc").checked }; saveRecord(record); showMessage($("form-message"), "Batch berhasil disimpan di perangkat ini.", "success"); resetForm(); render(); setView("dashboard-view"); });
$("search-batch").addEventListener("input", render);
$("status-filter").addEventListener("change", render);
$("close-detail").addEventListener("click", closeDetail);
$("detail-modal").addEventListener("click", event => { if (event.target === event.currentTarget) closeDetail(); });
$("print-detail").addEventListener("click", () => selectedRecord && generateManifest(selectedRecord));

$("tanggal").value = new Date().toISOString().slice(0, 10);
addItemRow();
if (isLoggedIn()) showApp();
