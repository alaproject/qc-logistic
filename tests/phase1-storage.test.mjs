import assert from 'node:assert/strict';

const store = {};
globalThis.localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};

const { parseBackup } = await import('../js/dashboard.js');

await assert.rejects(
  () => parseBackup(JSON.stringify({
    version: 99,
    exportedAt: '2026-09-10T00:00:00.000Z',
    records: [{ batchId: 'B-001', tenant: 'Tenant A', items: [{ nama: 'Kain', jumlah: 1, satuan: 'rol', kategori: 'Bahan Baku', kondisi: 'Baik' }] }]
  })),
  /schema version|tidak didukung/i
);

console.log('phase1 storage regression checks passed');
