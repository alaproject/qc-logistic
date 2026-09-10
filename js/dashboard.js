const DATA_KEY = "qc_logistic_batches";

export function getRecords() {
  try { return JSON.parse(localStorage.getItem(DATA_KEY) || "[]"); } catch { return []; }
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
export function statusClass(status) { return status === "Lolos QC" ? "status-pass" : status === "Perlu Catatan" ? "status-note" : "status-hold"; }
export function escapeHtml(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }
export function renderDashboard(records, onDetail, onDelete) {
  const query = document.getElementById("search-batch").value.toLowerCase().trim();
  const filter = document.getElementById("status-filter").value;
  const filtered = records.filter(record => {
    const text = [record.batchId, record.tenant, record.plate, record.driver].join(" ").toLowerCase();
    return (!query || text.includes(query)) && (filter === "Semua" || record.status === filter);
  });
  document.getElementById("stat-total").textContent = records.length;
  document.getElementById("stat-pass").textContent = records.filter(record => record.status === "Lolos QC").length;
  document.getElementById("stat-note").textContent = records.filter(record => record.status === "Perlu Catatan").length;
  document.getElementById("stat-pending").textContent = records.filter(record => !record.verified).length;
  const list = document.getElementById("batch-list");
  list.innerHTML = filtered.map(record => `<article class="batch-card"><div class="batch-top"><div><div class="batch-id">${escapeHtml(record.batchId)}</div><h3>${escapeHtml(record.tenant)}</h3></div><span class="status-badge ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><p class="batch-meta">${escapeHtml(record.vehicle)} · ${escapeHtml(record.plate)} · ${escapeHtml(record.date)}</p><p class="batch-meta mt-1">Pengemudi: ${escapeHtml(record.driver)}</p><div class="batch-actions"><span class="batch-meta">${record.verified ? "✓ Terverifikasi" : "○ Menunggu verifikasi"}</span><div><button class="link-button detail-button" data-id="${record.id}" type="button">Lihat detail</button><button class="danger-button delete-button ml-3" data-id="${record.id}" type="button" aria-label="Hapus batch"><span class="material-icons-round">delete</span></button></div></div></article>`).join("");
  document.getElementById("empty-state").classList.toggle("hidden", filtered.length > 0);
  list.querySelectorAll(".detail-button").forEach(button => button.addEventListener("click", () => onDetail(records.find(record => record.id === button.dataset.id))));
  list.querySelectorAll(".delete-button").forEach(button => button.addEventListener("click", () => onDelete(button.dataset.id)));
}
