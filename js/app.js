import { currentUser, isLoggedIn, login, logout } from "./auth.js";
import { addItemRow, collectItems, MAX_ITEM_ROWS, resetItems } from "./form.js?v=2";
import { clearGuestDraft, clearImportBackup, createBackup, createImportBackup, deleteRecord, escapeHtml, getGuestDraft, getRecords, parseBackup, renderDashboard, replaceRecords, restoreImportBackup, saveGuestDraft, saveRecord, statusClass } from "./dashboard.js";
import { generateManifest } from "./pdf-generator.js";
import { withLightTheme } from "./theme.js?v=1";

const $ = id => document.getElementById(id);
let selectedRecord = null;
let detailTrigger = null;
let pendingView = "dashboard-view";

function setView(viewId) {
  document.querySelectorAll(".sub-view").forEach(view => view.classList.toggle("hidden", view.id !== viewId));
  document.querySelectorAll(".tab-button").forEach(button => button.classList.toggle("active", button.dataset.view === viewId));
}
function showMessage(element, text, tone = "") {
  if (!element) return;
  element.textContent = text;
  element.className = `form-message ${tone}`;
  if (tone === "error") element.setAttribute("role", "alert");
  else if (text) element.setAttribute("role", "status");
  else element.removeAttribute("role");
}
function dashboardFeedback() {
  let element = $("dashboard-feedback");
  if (!element) {
    element = document.createElement("p");
    element.id = "dashboard-feedback";
    element.setAttribute("aria-live", "polite");
    $("dashboard-view").prepend(element);
  }
  return element;
}
function updateSessionUI() {
  const loggedIn = isLoggedIn();
  $("session-user").textContent = loggedIn ? `Admin: ${currentUser()}` : "Mode input guest";
  $("session-user").classList.remove("hidden");
  $("logout-button").querySelector(".material-icons-round").textContent = loggedIn ? "logout" : "login";
  $("session-action-label").textContent = loggedIn ? "Logout" : "Login Dashboard";
}
function render() {
  const records = getRecords();
  const tenantFilter = $("tenant-filter");
  if (tenantFilter) {
    const selected = tenantFilter.value;
    tenantFilter.innerHTML = `<option>Semua tenant</option>${[...new Set(records.map(record => record.tenant))].sort().map(tenant => `<option>${escapeHtml(tenant)}</option>`).join("")}`;
    tenantFilter.value = [...tenantFilter.options].some(option => option.value === selected) ? selected : "Semua tenant";
  }
  renderDashboard(records, openDetail, removeBatch);
  const summary = $("tenant-summary");
  if (summary) summary.innerHTML = Object.entries(records.reduce((result, record) => { result[record.tenant] = (result[record.tenant] || 0) + 1; return result; }, {})).map(([tenant, total]) => `<span>${escapeHtml(tenant)} <strong>${total}</strong></span>`).join("");
}
function showApp() {
  $("login-view").classList.add("hidden");
  $("app-view").classList.remove("hidden");
  updateSessionUI();
  if (isLoggedIn()) { setupDashboardTools(); setupBackupActions(); render(); }
  setView(isLoggedIn() ? pendingView : "form-view");
  if (!isLoggedIn()) restoreDraftIfAvailable();
}
function showLogin(view = "dashboard-view") {
  pendingView = view;
  $("app-view").classList.add("hidden");
  $("login-view").classList.remove("hidden");
  $("login-username").focus();
}
function formState() {
  return { batchId: $("batch-id").value.trim(), date: $("tanggal").value, tenant: $("tenant").value.trim(), officer: $("petugas-qc").value.trim(), vehicle: $("jenis-kendaraan").value, plate: $("plat-nomor").value.trim(), driver: $("nama-pengemudi").value.trim(), phone: $("no-hp").value.trim(), notes: $("catatan-qc").value.trim(), status: $("status-qc").value, verified: $("verifikasi-qc").checked, items: collectItems() };
}
function syncGuestDraft() {
  const state = formState();
  const hasContent = Object.values(state).some(value => Array.isArray(value) ? value.some(item => Object.values(item).some(entry => String(entry).trim())) : typeof value === "string" ? value.trim() : Boolean(value));
  if (!hasContent) { clearGuestDraft(); return; }
  try { saveGuestDraft(state); } catch (error) { showMessage($("form-message"), error.message, "error"); }
}
function restoreDraftIfAvailable() {
  const draft = getGuestDraft();
  if (!draft) return;
  const actions = document.createElement("div");
  actions.id = "draft-actions";
  actions.className = "flex flex-wrap gap-2 mt-3";
  actions.innerHTML = '<button id="restore-draft-button" class="secondary-button" type="button">Pulihkan draft</button><button id="discard-draft-button" class="ghost-button" type="button">Buang draft</button>';
  $("form-message").after(actions);
  $("restore-draft-button").addEventListener("click", () => {
    for (const [id, value] of [["batch-id", draft.batchId], ["tanggal", draft.date], ["tenant", draft.tenant], ["petugas-qc", draft.officer], ["jenis-kendaraan", draft.vehicle], ["plat-nomor", draft.plate], ["nama-pengemudi", draft.driver], ["no-hp", draft.phone], ["catatan-qc", draft.notes], ["status-qc", draft.status]]) $(id).value = value || "";
    $("verifikasi-qc").checked = Boolean(draft.verified);
    resetItems();
    (draft.items || []).slice(0, MAX_ITEM_ROWS).forEach(item => addItemRow(item));
    actions.remove();
    showMessage($("form-message"), "Draft berhasil dipulihkan.", "success");
  });
  $("discard-draft-button").addEventListener("click", () => { clearGuestDraft(); actions.remove(); showMessage($("form-message"), "Draft dibuang.", "success"); });
  showMessage($("form-message"), "Terdapat draft form yang belum disimpan. Pulihkan atau buang draft.");
}
function resetForm() { $("qc-form").reset(); $("tanggal").value = new Date().toISOString().slice(0, 10); resetItems(); clearGuestDraft(); document.getElementById("draft-actions")?.remove(); showMessage($("form-message"), ""); }
function setupDashboardTools() {
  if ($("dashboard-filters")) return;
  const filters = document.createElement("div");
  filters.id = "dashboard-filters";
  filters.innerHTML = '<label>Dari tanggal <input id="date-from" type="date"></label><label>Sampai tanggal <input id="date-to" type="date"></label><label>Tenant <select id="tenant-filter"><option>Semua tenant</option></select></label><button id="clear-dashboard-filters" class="secondary-button" type="button">Reset filter</button>';
  const panel = $("dashboard-view").querySelector(".panel");
  panel.parentElement.insertBefore(filters, panel);
  const summary = document.createElement("div");
  summary.id = "tenant-summary";
  $("dashboard-view").querySelector(".stats-grid").after(summary);
  ["date-from", "date-to", "tenant-filter"].forEach(id => $(id).addEventListener("change", render));
  $("clear-dashboard-filters").addEventListener("click", () => { $("date-from").value = ""; $("date-to").value = ""; $("tenant-filter").value = "Semua tenant"; render(); });
}
function setupBackupActions() {
  if ($("storage-actions")) return;
  const actions = document.createElement("div");
  actions.id = "storage-actions";
  actions.innerHTML = '<button id="export-backup" class="secondary-button" type="button">Export backup</button><button id="import-backup-button" class="secondary-button" type="button">Import backup</button><button id="restore-import-backup" class="secondary-button" type="button">Pulihkan backup</button><input id="import-backup" type="file" accept="application/json" hidden>';
  $("dashboard-view").prepend(actions);
  $("export-backup").addEventListener("click", () => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([JSON.stringify(createBackup(), null, 2)], { type: "application/json" })); link.download = `qc-logistic-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); showMessage(dashboardFeedback(), "Backup JSON berhasil dibuat.", "success"); });
  $("import-backup-button").addEventListener("click", () => $("import-backup").click());
  $("restore-import-backup").addEventListener("click", () => { const backup = restoreImportBackup(); if (!backup) return; replaceRecords(backup); clearImportBackup(); render(); showMessage(dashboardFeedback(), "Backup berhasil dipulihkan.", "success"); });
  $("import-backup").addEventListener("change", async event => { const file = event.target.files[0]; event.target.value = ""; if (!file) return; try { const imported = parseBackup(await file.text()); if (!createImportBackup() || !confirm(`Import ${imported.length} batch?`)) return; replaceRecords(imported); clearImportBackup(); render(); showMessage(dashboardFeedback(), "Backup berhasil diimpor.", "success"); } catch (error) { showMessage(dashboardFeedback(), error.message, "error"); } });
}
function openDetail(record, trigger) {
  selectedRecord = record;
  detailTrigger = trigger;
  $("detail-title").textContent = record.batchId;
  $("detail-content").innerHTML = `<strong>${escapeHtml(record.tenant)}</strong><span class="status-badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span><div class="detail-grid"><div>Tanggal QC<br>${escapeHtml(record.date)}</div><div>Petugas<br>${escapeHtml(record.officer)}</div><div>Armada<br>${escapeHtml(record.vehicle)} / ${escapeHtml(record.plate)}</div><div>Pengemudi<br>${escapeHtml(record.driver)} (${escapeHtml(record.phone)})</div></div><table><thead><tr><th>Barang</th><th>Jumlah</th><th>Kategori</th><th>Kondisi</th></tr></thead><tbody>${record.items.map(item => `<tr><td>${escapeHtml(item.nama)}</td><td>${escapeHtml(item.jumlah)} ${escapeHtml(item.satuan)}</td><td>${escapeHtml(item.kategori)}</td><td>${escapeHtml(item.kondisi)}</td></tr>`).join("")}</tbody></table><p>Catatan: ${escapeHtml(record.notes || "Tidak ada catatan.")}</p>`;
  $("detail-modal").classList.remove("hidden");
  $("close-detail").focus();
}
function closeDetail() { $("detail-modal").classList.add("hidden"); selectedRecord = null; if (detailTrigger?.isConnected) detailTrigger.focus(); detailTrigger = null; }
function removeBatch(id) { if (confirm("Hapus batch ini?")) { deleteRecord(id); render(); } }
async function generateSelectedPdf() {
  if (!selectedRecord) return;
  const button = $("print-detail");
  button.disabled = true;
  try { await withLightTheme(() => generateManifest(selectedRecord)); showMessage(dashboardFeedback(), `PDF ${selectedRecord.batchId} berhasil dibuat.`, "success"); } catch (error) { showMessage(dashboardFeedback(), error.message, "error"); } finally { button.disabled = false; }
}

$("login-form").addEventListener("submit", event => { event.preventDefault(); if (login($("login-username").value.trim(), $("login-password").value)) { $("login-form").reset(); showApp(); } else showMessage($("login-message"), "Username atau password salah.", "error"); });
$("guest-input-button").addEventListener("click", () => { showApp(); $("batch-id").focus(); });
$("logout-button").addEventListener("click", () => { if (isLoggedIn()) { logout(); pendingView = "form-view"; showApp(); } else showLogin(); });
$("new-batch-button").addEventListener("click", () => { resetForm(); setView("form-view"); });
document.querySelectorAll(".tab-button").forEach(button => button.addEventListener("click", () => { if (button.dataset.view === "dashboard-view" && !isLoggedIn()) showLogin("dashboard-view"); else setView(button.dataset.view); }));
$("add-item-button").addEventListener("click", () => { if ($("item-rows").children.length < MAX_ITEM_ROWS) { addItemRow(); syncGuestDraft(); } });
$("qc-form").addEventListener("input", syncGuestDraft);
$("qc-form").addEventListener("change", syncGuestDraft);
$("qc-form").addEventListener("submit", event => {
  event.preventDefault();
  const record = formState();
  const invalidItem = record.items.some(item => !item.nama || Number(item.jumlah) <= 0 || !item.satuan || !item.kategori);
  const needsNote = record.status === "Perlu Catatan" || record.items.some(item => ["Perlu Catatan", "Rusak"].includes(item.kondisi));
  if (!event.currentTarget.checkValidity() || invalidItem || record.items.length > MAX_ITEM_ROWS || (needsNote && !record.notes)) { event.currentTarget.reportValidity(); showMessage($("form-message"), "Lengkapi data QC dan catatan yang diperlukan.", "error"); return; }
  try { saveRecord(record); resetForm(); render(); setView(isLoggedIn() ? "dashboard-view" : "form-view"); showMessage(isLoggedIn() ? dashboardFeedback() : $("form-message"), "Batch berhasil disimpan.", "success"); } catch (error) { showMessage($("form-message"), error.message, "error"); }
});
$("search-batch").addEventListener("input", render);
$("status-filter").addEventListener("change", render);
$("close-detail").addEventListener("click", closeDetail);
$("detail-modal").addEventListener("click", event => { if (event.target === event.currentTarget) closeDetail(); });
$("print-detail").addEventListener("click", generateSelectedPdf);
$("tanggal").value = new Date().toISOString().slice(0, 10);
addItemRow();
clearImportBackup();
showApp();
