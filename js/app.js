import { currentUser, isLoggedIn, login, logout } from "./auth.js";
import { addItemRow, collectItems, resetItems } from "./form.js";
import { createBackup, deleteRecord, escapeHtml, getRecords, parseBackup, renderDashboard, replaceRecords, saveRecord, statusClass } from "./dashboard.js";
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
  setupBackupActions();
  setupDashboardTools();
  render();
}
function showLogin() { $("app-view").classList.add("hidden"); $("login-view").classList.remove("hidden"); }
function render() { records = getRecords(); updateTenantFilter(records); renderDashboard(records, openDetail, removeBatch); renderTenantSummary(records); }
function showMessage(element, text, tone = "") { element.textContent = text; element.className = `form-message ${tone}`; }
function dashboardFeedback() {
  let feedback = $("dashboard-feedback");
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.id = "dashboard-feedback";
    feedback.setAttribute("aria-live", "polite");
    $("dashboard-view").prepend(feedback);
  }
  return feedback;
}
function setupBackupActions() {
  if ($("storage-actions")) return;
  const actions = document.createElement("div");
  actions.id = "storage-actions";
  actions.className = "storage-actions flex flex-wrap justify-end gap-2 mb-4";
  actions.innerHTML = `<button id="export-backup" class="secondary-button" type="button"><span class="material-icons-round">download</span>Export backup</button><button id="import-backup-button" class="secondary-button" type="button"><span class="material-icons-round">upload_file</span>Import backup</button><input id="import-backup" type="file" accept="application/json" hidden>`;
  $("dashboard-view").prepend(actions);
  $("export-backup").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(createBackup(getRecords()), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qc-logistic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showMessage(dashboardFeedback(), "Backup JSON berhasil dibuat.", "success");
  });
  $("import-backup-button").addEventListener("click", () => $("import-backup").click());
  $("import-backup").addEventListener("change", async event => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = parseBackup(await file.text());
      if (!confirm(`Pulihkan ${imported.length} batch dari backup? Data lokal saat ini akan diganti.`)) return;
      replaceRecords(imported);
      render();
      showMessage(dashboardFeedback(), `${imported.length} batch berhasil dipulihkan.`, "success");
    } catch (error) {
      showMessage(dashboardFeedback(), error.message || "Backup tidak dapat dipulihkan.", "error");
    }
  });
}
function setupDashboardTools() {
  if ($("dashboard-filters")) return;
  const filters = document.createElement("div");
  filters.id = "dashboard-filters";
  filters.className = "flex flex-wrap items-end gap-3 mb-4";
  filters.innerHTML = `<div><label for="date-from">Dari tanggal</label><input id="date-from" type="date"></div><div><label for="date-to">Sampai tanggal</label><input id="date-to" type="date"></div><div><label for="tenant-filter">Tenant</label><select id="tenant-filter"><option>Semua tenant</option></select></div><button id="clear-dashboard-filters" class="secondary-button" type="button"><span class="material-icons-round">filter_alt_off</span>Reset filter</button>`;
  const panel = $("dashboard-view").querySelector(".panel");
  panel.parentElement.insertBefore(filters, panel);
  const summary = document.createElement("div");
  summary.id = "tenant-summary";
  summary.className = "tenant-summary mt-5 border-y border-[#d8e3df] py-4";
  $("dashboard-view").querySelector(".stats-grid").after(summary);
  ["date-from", "date-to", "tenant-filter"].forEach(id => $(id).addEventListener("change", render));
  $("clear-dashboard-filters").addEventListener("click", () => { $("date-from").value = ""; $("date-to").value = ""; $("tenant-filter").value = "Semua tenant"; render(); });
}
function updateTenantFilter(batchRecords) {
  const select = $("tenant-filter");
  if (!select) return;
  const selected = select.value;
  select.innerHTML = `<option>Semua tenant</option>${[...new Set(batchRecords.map(record => record.tenant).filter(Boolean))].sort().map(tenant => `<option>${escapeHtml(tenant)}</option>`).join("")}`;
  select.value = [...select.options].some(option => option.value === selected) ? selected : "Semua tenant";
}
function renderTenantSummary(batchRecords) {
  const summary = $("tenant-summary");
  if (!summary) return;
  const totals = batchRecords.reduce((result, record) => { result[record.tenant] = (result[record.tenant] || 0) + 1; return result; }, {});
  const entries = Object.entries(totals).sort((first, second) => second[1] - first[1]);
  summary.innerHTML = entries.length ? `<div class="eyebrow text-teal-700">RINGKASAN PER TENANT</div><div class="tenant-summary-list grid gap-2 mt-3 sm:grid-cols-2 lg:grid-cols-4">${entries.map(([tenant, total]) => `<div class="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"><span>${escapeHtml(tenant)}</span><strong class="mono">${total}</strong></div>`).join("")}</div>` : "";
}
function resetForm() { $("qc-form").reset(); $("tanggal").value = new Date().toISOString().slice(0, 10); resetItems(); showMessage($("form-message"), ""); }
function openDetail(record) {
  if (!record) return;
  selectedRecord = record;
  $("detail-title").textContent = record.batchId;
  $("detail-content").innerHTML = `<div class="flex items-center justify-between gap-3"><strong class="text-lg">${escapeHtml(record.tenant)}</strong><span class="status-badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><div class="detail-grid mt-6"><div><div class="detail-label">Tanggal QC</div><div class="detail-value">${escapeHtml(record.date)}</div></div><div><div class="detail-label">Petugas</div><div class="detail-value">${escapeHtml(record.officer)}</div></div><div><div class="detail-label">Armada</div><div class="detail-value">${escapeHtml(record.vehicle)}</div></div><div><div class="detail-label">Plat nomor</div><div class="detail-value">${escapeHtml(record.plate)}</div></div><div><div class="detail-label">Pengemudi</div><div class="detail-value">${escapeHtml(record.driver)}</div></div><div><div class="detail-label">No. HP</div><div class="detail-value">${escapeHtml(record.phone)}</div></div></div><div class="detail-items"><table><thead><tr><th>Barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead><tbody>${record.items.map(item => `<tr><td>${escapeHtml(item.nama)}</td><td>${escapeHtml(item.jumlah)} ${escapeHtml(item.satuan)}</td><td>${escapeHtml(item.kategori)}</td><td>${escapeHtml(item.kondisi)}</td></tr>`).join("")}</tbody></table></div><div class="mt-5 rounded-lg bg-slate-50 p-4 text-sm"><strong>Catatan QC</strong><p class="mt-2 whitespace-pre-wrap">${escapeHtml(record.notes || "Tidak ada catatan.")}</p></div><p class="mt-4 text-sm font-bold ${record.verified ? "text-teal-700" : "text-slate-500"}">${record.verified ? "✓ Data telah diverifikasi QC" : "○ Data belum diverifikasi QC"}</p>`;
  $("detail-modal").classList.remove("hidden");
}
function closeDetail() { $("detail-modal").classList.add("hidden"); selectedRecord = null; }
function removeBatch(id) { if (confirm("Hapus batch ini?")) { deleteRecord(id); render(); } }

$("login-form").addEventListener("submit", event => { event.preventDefault(); const username = $("login-username"); const password = $("login-password"); const ok = login(username.value.trim(), password.value); if (ok) { username.removeAttribute("aria-invalid"); password.removeAttribute("aria-invalid"); showApp(); } else { username.setAttribute("aria-invalid", "true"); password.setAttribute("aria-invalid", "true"); $("login-message").setAttribute("role", "alert"); showMessage($("login-message"), "Username atau password salah.", "error"); } });
$("login-username").addEventListener("input", () => { $("login-username").removeAttribute("aria-invalid"); $("login-password").removeAttribute("aria-invalid"); $("login-message").removeAttribute("role"); showMessage($("login-message"), ""); });
$("login-password").addEventListener("input", () => { $("login-username").removeAttribute("aria-invalid"); $("login-password").removeAttribute("aria-invalid"); $("login-message").removeAttribute("role"); showMessage($("login-message"), ""); });
$("logout-button").addEventListener("click", () => { logout(); showLogin(); $("login-form").reset(); });
$("new-batch-button").addEventListener("click", () => { resetForm(); setView("form-view"); });
document.querySelectorAll(".tab-button").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$("add-item-button").addEventListener("click", () => addItemRow());
$("qc-form").addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; const formMessage = $("form-message"); if (!form.checkValidity()) { form.reportValidity(); return; } const record = { batchId: $("batch-id").value.trim(), date: $("tanggal").value, tenant: $("tenant").value.trim(), officer: $("petugas-qc").value.trim(), vehicle: $("jenis-kendaraan").value, plate: $("plat-nomor").value.trim(), driver: $("nama-pengemudi").value.trim(), phone: $("no-hp").value.trim(), items: collectItems(), notes: $("catatan-qc").value.trim(), status: $("status-qc").value, verified: $("verifikasi-qc").checked }; const invalidItem = record.items.find(item => !item.nama || !item.jumlah || Number(item.jumlah) <= 0 || !item.satuan || !item.kategori); const needsNote = record.status === "Perlu Catatan" || record.items.some(item => item.kondisi === "Perlu Catatan" || item.kondisi === "Rusak"); if (invalidItem) { showMessage(formMessage, "Lengkapi nama, jumlah, satuan, dan kategori setiap barang.", "error"); return; } if (!/^\+?[0-9 ()-]{8,20}$/.test(record.phone)) { showMessage(formMessage, "Nomor HP belum valid.", "error"); return; } if (needsNote && !record.notes) { showMessage(formMessage, "Tambahkan catatan QC untuk status atau kondisi yang perlu perhatian.", "error"); return; } if (getRecords().some(existing => existing.batchId.toLowerCase() === record.batchId.toLowerCase())) { showMessage(formMessage, "ID batch sudah digunakan. Gunakan ID yang berbeda.", "error"); return; } showMessage(formMessage, "Menyimpan batch...", "normal"); saveRecord(record); resetForm(); render(); setView("dashboard-view"); showMessage(dashboardFeedback(), "Batch berhasil disimpan di perangkat ini.", "success"); });
$("search-batch").addEventListener("input", render);
$("status-filter").addEventListener("change", render);
$("close-detail").addEventListener("click", closeDetail);
$("detail-modal").addEventListener("click", event => { if (event.target === event.currentTarget) closeDetail(); });
$("print-detail").addEventListener("click", () => selectedRecord && generateManifest(selectedRecord));

$("tanggal").value = new Date().toISOString().slice(0, 10);
addItemRow();
if (isLoggedIn()) showApp();
