const DATA_KEY = "qc_logistic_batches";
const DRAFT_KEY = "qc_logistic_guest_draft";
const TEMP_BACKUP_KEY = "qc_logistic_import_backup";
export const DATA_VERSION = 1;
export const DATA_LIMIT_BYTES = 5 * 1024 * 1024;
export const MAX_RECORD_ITEMS = 20;

const VALID_STATUSES = ["Lolos QC", "Perlu Catatan", "Ditahan"];
const VALID_ITEM_CATEGORIES = ["Bahan Baku", "Alat Perkakas"];
const VALID_ITEM_CONDITIONS = ["Baik", "Perlu Catatan", "Rusak"];

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function bytesFor(value) {
  if (typeof Blob !== "undefined") return new Blob([value]).size;
  return new TextEncoder().encode(value).length;
}

function ensureStorageBounds(records) {
  const json = JSON.stringify(records);
  const totalBytes = bytesFor(json);
  if (totalBytes > DATA_LIMIT_BYTES) {
    throw new Error(`Kapasitas penyimpanan lokal hampir penuh (${(totalBytes / (1024 * 1024)).toFixed(1)} MB). Export backup atau hapus batch lama sebelum menyimpan.`);
  }
  const itemTotal = records.reduce((sum, record) => sum + (Array.isArray(record.items) ? record.items.length : 0), 0);
  if (itemTotal > MAX_RECORD_ITEMS * 25) {
    throw new Error("Jumlah item terlalu besar untuk data lokal. Hapus beberapa batch atau export backup untuk membebaskan ruang.");
  }
}

function isValidRecord(record) {
  if (!record || typeof record !== "object") return false;
  if (typeof record.batchId !== "string" || !record.batchId.trim()) return false;
  if (typeof record.tenant !== "string" || !record.tenant.trim()) return false;
  if (typeof record.officer !== "string" || !record.officer.trim()) return false;
  if (typeof record.date !== "string" || !isDateString(record.date)) return false;
  if (typeof record.status !== "string" || !VALID_STATUSES.includes(record.status)) return false;
  if (typeof record.verified !== "boolean") return false;
  if (!Array.isArray(record.items) || record.items.length === 0 || record.items.length > MAX_RECORD_ITEMS) return false;
  if (typeof record.vehicle !== "string" || !record.vehicle.trim()) return false;
  if (typeof record.plate !== "string" || !record.plate.trim()) return false;
  if (typeof record.driver !== "string" || !record.driver.trim()) return false;
  if (typeof record.phone !== "string" || !record.phone.trim()) return false;
  if (typeof record.notes !== "string") return false;
  return record.items.every(item => item && typeof item === "object" && typeof item.nama === "string" && item.nama.trim() && typeof item.jumlah === "number" && Number.isFinite(item.jumlah) && item.jumlah > 0 && typeof item.satuan === "string" && item.satuan.trim() && VALID_ITEM_CATEGORIES.includes(item.kategori) && VALID_ITEM_CONDITIONS.includes(item.kondisi));
}

function validRecords(records) {
  return Array.isArray(records) ? records.filter(isValidRecord) : [];
}

export function getRecords() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : parsed?.records;
    return validRecords(source);
  } catch {
    return [];
  }
}

export function saveRecord(record) {
  const next = [{ ...record, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), createdAt: new Date().toISOString() }, ...getRecords()];
  if (!isValidRecord(next[0])) {
    throw new Error("Data batch tidak valid. Periksa field wajib, status, tanggal, dan daftar barang sebelum menyimpan.");
  }
  try {
    ensureStorageBounds(next);
    localStorage.setItem(DATA_KEY, JSON.stringify(next));
    clearGuestDraft();
    return next;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Data belum tersimpan. Export backup atau hapus data lama, lalu coba lagi.";
    throw new Error(message);
  }
}

export function deleteRecord(id) {
  const records = getRecords().filter(record => record.id !== id);
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(records));
    return records;
  } catch {
    throw new Error("Data belum terhapus. Kapasitas penyimpanan penuh. Export backup atau hapus data lama terlebih dahulu.");
  }
}

export function createBackup(records = getRecords()) {
  const valid = validRecords(records);
  return { version: DATA_VERSION, exportedAt: new Date().toISOString(), records: valid };
}

export function parseBackup(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const records = Array.isArray(parsed) ? parsed : parsed?.records;
  if (!parsed || typeof parsed !== "object") throw new Error("Format backup tidak valid.");
  if (!("version" in parsed) || parsed.version !== DATA_VERSION) {
    throw new Error(`Schema version backup tidak didukung. Versi yang diterima: ${DATA_VERSION}.`);
  }
  if (!Array.isArray(records)) throw new Error("Format backup tidak valid.");
  const valid = validRecords(records);
  const result = valid;
  result.rejectedCount = Math.max(records.length - valid.length, 0);
  if (result.rejectedCount > 0) {
    const message = `Backup berisi ${result.rejectedCount} record yang ditolak karena data tidak valid.`;
    console.warn(message);
  }
  return result;
}

export function replaceRecords(records) {
  const valid = validRecords(records);
  try {
    ensureStorageBounds(valid);
    localStorage.setItem(DATA_KEY, JSON.stringify(valid));
    return valid;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Data belum tersimpan. Export backup atau hapus data lama, lalu coba lagi.";
    throw new Error(message);
  }
}

export function getGuestDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGuestDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    throw new Error("Draft belum tersimpan. Data form mungkin terlalu besar untuk localStorage.");
  }
}

export function clearGuestDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore cleanup errors when storage is already unstable
  }
}

export function createImportBackup() {
  const backup = createBackup(getRecords());
  try {
    localStorage.setItem(TEMP_BACKUP_KEY, JSON.stringify(backup));
    return true;
  } catch {
    return false;
  }
}

export function restoreImportBackup() {
  try {
    const raw = localStorage.getItem(TEMP_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.records) ? parseBackup(parsed) : null;
  } catch {
    return null;
  }
}

export function clearImportBackup() {
  try {
    localStorage.removeItem(TEMP_BACKUP_KEY);
  } catch {
    // ignore cleanup errors when storage is already unstable
  }
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
  list.querySelectorAll(".detail-button").forEach(button => button.addEventListener("click", () => onDetail(records.find(record => record.id === button.dataset.id), button)));
  list.querySelectorAll(".delete-button").forEach(button => button.addEventListener("click", () => onDelete(button.dataset.id)));
}
