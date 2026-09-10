# Requirement dan Keputusan Implementasi

## Tujuan

Membangun Mobile Web App SPA untuk QC Logistik dan Ekspedisi Barang Tenant. Aplikasi membantu administrator atau petugas QC mencatat batch muatan, menilai kondisi barang, memantau history, dan membuat manifes PDF.

## Keputusan MVP

| Area | Keputusan |
| --- | --- |
| Arsitektur | SPA tanpa reload menggunakan HTML, CSS, dan JavaScript Vanilla |
| Backend | Belum ada backend; data lokal memakai `localStorage` |
| Autentikasi | Hardcode untuk MVP: `admin` / `qc12345` |
| Session | `localStorage` pada key `qc_logistic_session` |
| Ikon | Google Material Icons Round |
| Styling | CSS custom dan Tailwind CSS CDN |
| PDF | `html2pdf.js` CDN dengan template A4 |
| QR | SVG dummy deterministik berdasarkan ID batch |
| Logo | Placeholder `QC` sampai logo brand tersedia |
| Approval | Checkbox verifikasi mandiri, tanpa tanda tangan digital |
| Download | File dikirim ke folder download default browser, bukan otomatis ke `assets` |

## View dan Alur User

### View 1: Login Administrator

- Input username dan password.
- Menampilkan feedback error yang dapat dibaca screen reader.
- Menyimpan session setelah credential benar.
- Menyediakan tombol logout.

### View 2: Dashboard History dan Ringkasan

- Menampilkan total batch.
- Menampilkan jumlah `Lolos QC`, `Perlu Catatan`, dan batch belum diverifikasi.
- Menampilkan history batch terbaru lebih dahulu.
- Search berdasarkan ID batch, tenant, plat nomor, dan pengemudi.
- Filter status, tanggal, dan tenant.
- Menampilkan ringkasan jumlah batch per tenant.
- Membuka detail batch.
- Menghapus batch dengan konfirmasi.
- Export/import backup JSON.

### View 3: Form Input QC

#### Identitas Batch

- ID batch.
- Tanggal QC.
- Tenant.
- Petugas QC.

#### Data Armada

- Jenis kendaraan: Motor Box, Mobil Box, Pick Up, Truk, Kontainer.
- Plat nomor.
- Nama pengemudi.
- Nomor HP.

#### Detail Muatan

Setiap baris barang memiliki:

- Nama barang.
- Jumlah.
- Satuan.
- Kategori: `Bahan Baku` atau `Alat Perkakas`.
- Kondisi: `Baik`, `Perlu Catatan`, atau `Rusak`.

Fitur form:

- Tambah dan hapus baris barang.
- Minimal satu baris barang.
- Maksimal 20 item per batch.
- Catatan QC maksimal 1.000 karakter.
- Checkbox verifikasi mandiri.
- Status batch: `Lolos QC`, `Perlu Catatan`, atau `Ditahan`.

## Validasi Bisnis

- Field utama wajib diisi.
- Jumlah barang harus lebih besar dari nol.
- Nomor HP harus memiliki format yang masuk akal.
- Kategori barang wajib dipilih.
- Status `Perlu Catatan` membutuhkan catatan QC.
- Kondisi item `Perlu Catatan` atau `Rusak` membutuhkan catatan QC.
- ID batch tidak boleh duplikat tanpa memperhatikan kapitalisasi.
- Data user di-escape sebelum dirender ke HTML.
- Data localStorage invalid tidak boleh membuat aplikasi crash.

## Penyimpanan dan Backup

Record disimpan pada `localStorage` key `qc_logistic_batches`. Setiap record memiliki data batch, item, status, verifikasi, `id`, dan `createdAt`.

Backup memakai schema:

```json
{
  "version": 1,
  "exportedAt": "ISO timestamp",
  "records": []
}
```

Import backup mengganti data lokal setelah konfirmasi user. Backup invalid ditolak.

## PDF Manifes A4

Template manifes harus memuat:

- Identitas QC Logistik Tenant.
- ID batch dan tanggal.
- QR SVG dummy berisi ID batch.
- Placeholder logo.
- Tenant dan petugas QC.
- Data kendaraan, plat, dan pengemudi.
- Tabel semua barang.
- Status batch dan catatan QC.
- Area Petugas QC dan Verifikasi Mandiri.
- Page break control untuk item banyak.
- Feedback loading, sukses, dan gagal.

PDF dibuat saat user membuka detail batch dan menekan `Generate PDF`. File diunduh oleh browser menggunakan nama `Manifes-QC-[ID-BATCH].pdf`.

## UX dan Aksesibilitas

- Mobile-first untuk petugas lapangan.
- Tidak ada overflow horizontal pada viewport mobile yang diuji.
- Label tersedia untuk field utama.
- Focus-visible tersedia pada kontrol interaktif.
- Tombol PDF memiliki state loading dan disabled.
- Pesan status menggunakan semantics `alert` atau `status`.
- Modal detail dapat ditutup dengan Escape.
- Focus trap aktif di dalam modal.
- Fokus dikembalikan ke tombol pembuka setelah modal ditutup.

## Batasan dan Pekerjaan Lanjutan

- Draft form sementara belum tersedia.
- Preview PDF sebelum download belum tersedia.
- Generate ulang dari kartu history belum menjadi tombol terpisah.
- Download aktual ke folder project `assets` tidak dapat dipaksa oleh browser.
- User acceptance test dengan petugas QC nyata masih diperlukan.
- Autentikasi dan penyimpanan produksi memerlukan backend.
