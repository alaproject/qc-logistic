const DATA_KEY = "qc_logistic_batches";
export const DATA_VERSION = 1;

function isValidRecord(record) {
  return record && typeof record === "object" && typeof record.batchId === "string" && record.batchId.trim() && typeof record.tenant === "string" && Array.isArray(record.items);
}

function validRecords(records) {
  return Array.isArray(records) ? records.filter(isValidRecord) : [];
}

export function getRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
    return validRecords(Array.isArray(parsed) ? parsed : parsed.records);
  } catch { return []; }
}
export function saveRecord(record) {
  const records = getRecords();
  records.unshift({ ...record, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), createdAt: new Date().toISOString() });
  localStorage.setItem(DATA_KEY, JSON.stringify(records));
  return records;
}
export function deleteRecord(id) {
  const records = getRecords().filter(record => record.id !== id);
  localStorage.setItem(DATA_KEY, JSON.stringify(records));
  return records;
}
export function createBackup(records = getRecords()) {
  return { version: DATA_VERSION, exportedAt: new Date().toISOString(), records: validRecords(records) };
}
export function parseBackup(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const records = Array.isArray(parsed) ? parsed : parsed?.records;
  if (!Array.isArray(records)) throw new Error("Format backup tidak valid.");
  const valid = validRecords(records);
  if (valid.length !== records.length) throw new Error("Backup berisi record yang tidak valid.");
  return valid;
}
export function replaceRecords(records) {
  const valid = validRecords(records);
  localStorage.setItem(DATA_KEY, JSON.stringify(valid));
  return valid;
}
export function statusClass(status) { return status === "Lolos QC" ? "status-pass" : status === "Perlu Catatan" ? "status-note" : "status-hold"; }
export function escapeHtml(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }
export function renderDashboard(records, onDetail, onDelete) {
  const query = document.getElementById("search-batch").value.toLowerCase().trim();
  const filter = document.getElementById("status-filter").value;
  const dateFrom = document.getElementById("date-from")?.value || "";
  const dateTo = document.getElementById("date-to")?.value || "";
  const tenant = document.getElementById("tenant-filter")?.value || "Semua tenant";
  const filtered = records.filter(record => {
    const text = [record.batchId, record.tenant, record.plate, record.driver].join(" ").toLowerCase();
    return (!query || text.includes(query)) && (filter === "Semua" || record.status === filter) && (!dateFrom || record.date >= dateFrom) && (!dateTo || record.date <= dateTo) && (tenant === "Semua tenant" || record.tenant === tenant);
  }).sort((first, second) => new Date(second.createdAt || second.date || 0) - new Date(first.createdAt || first.date || 0));
  document.getElementById("stat-total").textContent = records.length;
  document.getElementById("stat-pass").textContent = records.filter(record => record.status === "Lolos QC").length;
  document.getElementById("stat-note").textContent = records.filter(record => record.status === "Perlu Catatan").length;
  document.getElementById("stat-pending").textContent = records.filter(record => !record.verified).length;
  const list = document.getElementById("batch-list");
  list.innerHTML = filtered.map(record => `<article class="batch-card"><div class="batch-top"><div><div class="batch-id">${escapeHtml(record.batchId)}</div><h3>${escapeHtml(record.tenant)}</h3></div><span class="status-badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><p class="batch-meta">${escapeHtml(record.vehicle)} · ${escapeHtml(record.plate)} · ${escapeHtml(record.date)}</p><p class="batch-meta mt-1">Pengemudi: ${escapeHtml(record.driver)}</p><div class="batch-actions"><span class="batch-meta">${record.verified ? "✓ Terverifikasi" : "○ Menunggu verifikasi"}</span><div><button class="link-button detail-button" data-id="${record.id}" type="button">Lihat detail</button><button class="danger-button delete-button ml-3" data-id="${record.id}" type="button" aria-label="Hapus batch"><span class="material-icons-round">delete</span></button></div></div></article>`).join("");
  const emptyState = document.getElementById("empty-state");
  emptyState.querySelector("p").textContent = records.length === 0 ? "Belum ada batch yang tersimpan." : "Tidak ada batch yang cocok dengan pencarian atau filter.";
  emptyState.classList.toggle("hidden", filtered.length > 0);
  list.querySelectorAll(".detail-button").forEach(button => button.addEventListener("click", () => onDetail(records.find(record => record.id === button.dataset.id))));
  list.querySelectorAll(".delete-button").forEach(button => button.addEventListener("click", () => onDelete(button.dataset.id)));
}
