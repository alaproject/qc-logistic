import assert from 'node:assert/strict';

const target = {
  id: 'manifest-print',
  innerHTML: '',
  classList: {
    add() {},
    remove() {}
  },
  querySelector(selector) {
    if (selector === '.manifest-sheet') return this;
    return null;
  }
};

globalThis.document = {
  getElementById(id) {
    if (id === 'manifest-print') return target;
    return null;
  }
};

globalThis.window = {
  html2pdf() {
    return {
      set() { return this; },
      from() { return { save: async () => {} }; },
      save() { return Promise.resolve(); }
    };
  }
};

const { generateManifest } = await import('../js/pdf-generator.js');

const record = {
  batchId: 'QC-2026-001',
  date: '2026-09-10',
  tenant: 'Tenant A',
  officer: 'Budi',
  vehicle: 'Mobil Box',
  plate: 'B 1234 XYZ',
  driver: 'Samsul',
  phone: '08123456789',
  status: 'Lolos QC',
  notes: 'Barang aman',
  verified: true,
  items: [{ nama: 'Kain', jumlah: 12, satuan: 'roll', kategori: 'Bahan Baku', kondisi: 'Baik' }]
};

await generateManifest(record);

assert.match(target.innerHTML, /manifest-sheet/i, 'PDF renderer should create a dedicated manifest sheet wrapper');
assert.match(target.innerHTML, /QC-2026-001/i, 'PDF should include batch code');
assert.match(target.innerHTML, /Tenant A/i, 'PDF should include tenant');
assert.match(target.innerHTML, /Kain/i, 'PDF should include item detail');

console.log('pdf manifest regression checks passed');
