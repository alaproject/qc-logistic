let itemCounter = 0;
const itemRows = () => document.getElementById("item-rows");

export function addItemRow(item = {}) {
  itemCounter += 1;
  const row = document.createElement("div");
  row.className = "item-row";
  row.innerHTML = `<div><label for="item-name-${itemCounter}">Nama barang</label><input id="item-name-${itemCounter}" data-item="nama" required value="${escapeValue(item.nama)}"></div><div><label for="item-qty-${itemCounter}">Jumlah</label><input id="item-qty-${itemCounter}" data-item="jumlah" required min="1" type="number" value="${escapeValue(item.jumlah)}"></div><div><label for="item-unit-${itemCounter}">Satuan</label><input id="item-unit-${itemCounter}" data-item="satuan" required placeholder="pcs" value="${escapeValue(item.satuan)}"></div><div><label for="item-category-${itemCounter}">Kategori</label><select id="item-category-${itemCounter}" data-item="kategori"><option value="">Pilih kategori</option><option ${item.kategori === "Bahan Baku" ? "selected" : ""}>Bahan Baku</option><option ${item.kategori === "Alat Perkakas" ? "selected" : ""}>Alat Perkakas</option></select></div><div><label for="item-condition-${itemCounter}">Kondisi</label><select id="item-condition-${itemCounter}" data-item="kondisi"><option ${item.kondisi === "Baik" ? "selected" : ""}>Baik</option><option ${item.kondisi === "Perlu Catatan" ? "selected" : ""}>Perlu Catatan</option><option ${item.kondisi === "Rusak" ? "selected" : ""}>Rusak</option></select></div><button type="button" class="remove-item" aria-label="Hapus barang"><span class="material-icons-round">delete</span></button>`;
  row.querySelector(".remove-item").addEventListener("click", () => {
    if (itemRows().children.length > 1) row.remove();
  });
  itemRows().appendChild(row);
}

export function collectItems() {
  return [...itemRows().querySelectorAll(".item-row")].map(row => Object.fromEntries([...row.querySelectorAll("[data-item]")].map(field => [field.dataset.item, field.value.trim()])));
}

export function resetItems() {
  itemRows().innerHTML = "";
  itemCounter = 0;
  addItemRow();
}

function escapeValue(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
