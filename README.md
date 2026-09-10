# QC Logistik Tenant

QC Logistik Tenant adalah Mobile Web App berbasis SPA untuk membantu petugas lapangan mencatat pemeriksaan kualitas muatan ekspedisi tenant. Website ini mengelola data batch QC, armada, pengemudi, daftar barang, kondisi fisik barang, catatan pemeriksaan, dan status verifikasi dalam satu alur kerja.

## Tujuan Website

Aplikasi ini dibuat untuk menggantikan pencatatan QC yang tersebar dengan alur yang lebih terstruktur:

1. Administrator masuk ke aplikasi.
2. Petugas membuat batch QC baru.
3. Data tenant, armada, pengemudi, dan barang dicatat.
4. Setiap barang diberi kategori dan kondisi fisik.
5. Batch diberi status dan dapat diverifikasi.
6. Data tersimpan di browser dan muncul pada history dashboard.
7. Detail batch dapat dirender menjadi manifes PDF A4.

Aplikasi ini cocok untuk MVP, demo operasional, atau penggunaan lokal terbatas. Aplikasi belum memakai backend sehingga data belum dibagikan antarperangkat atau antarpetugas.

## Fitur Saat Ini

- Login administrator hardcode dan logout.
- Session login menggunakan `localStorage`.
- Form QC dengan tiga kelompok data:
  - Identitas batch.
  - Data armada.
  - Detail pemeriksaan muatan.
- Dynamic item rows dengan tambah/hapus barang.
- Kategori `Bahan Baku` dan `Alat Perkakas`.
- Kondisi `Baik`, `Perlu Catatan`, dan `Rusak`.
- Checkbox verifikasi mandiri.
- Validasi ID batch duplikat, nomor HP, jumlah barang, catatan QC, panjang input, dan jumlah maksimum item.
- Dashboard history dengan statistik status QC.
- Search batch, tenant, plat nomor, dan pengemudi.
- Filter status, tanggal, dan tenant.
- Urutan batch terbaru di posisi teratas.
- Ringkasan jumlah batch per tenant.
- Empty state untuk data kosong atau filter tanpa hasil.
- Export dan import backup JSON dengan schema version.
- Detail batch dalam modal keyboard-accessible.
- Generate manifes PDF A4 menggunakan `html2pdf.js`.
- QR SVG dummy berdasarkan ID batch.
- Logo placeholder dan area verifikasi/tanda tangan.
- Responsive layout untuk mobile, tablet, dan desktop.
- Google Material Icons Round.

## Tech Stack

- HTML5.
- CSS3.
- JavaScript Vanilla ES Modules.
- Tailwind CSS via CDN untuk utility layout.
- Google Material Icons Round via Google Fonts CDN.
- `html2pdf.js` via CDN untuk PDF.
- `localStorage` untuk penyimpanan MVP.
- Python `http.server` atau Live Server untuk development lokal.

## Menjalankan Project

Pastikan Python tersedia, lalu jalankan dari folder project:

```powershell
python -m http.server 5500
```

Buka alamat berikut di browser:

```text
http://localhost:5500/index.html
```

Local server disarankan karena aplikasi menggunakan ES Modules dan library CDN. Membuka langsung dengan `file://` dapat menyebabkan perilaku berbeda pada module import dan download PDF.

## Credential MVP

- Username: `admin`
- Password: `qc12345`

Credential ini hanya untuk demo/MVP. Jangan gunakan untuk sistem produksi atau data sensitif.

## Penyimpanan Data

Data batch disimpan pada key localStorage:

```text
qc_logistic_batches
```

Session login disimpan pada key:

```text
qc_logistic_session
```

Backup JSON memiliki struktur umum:

```json
{
  "version": 1,
  "exportedAt": "2026-09-10T00:00:00.000Z",
  "records": []
}
```

Export menghasilkan file JSON ke folder download browser. Import backup mengganti data lokal setelah user mengonfirmasi.

## PDF

PDF dibuat dari detail batch melalui tombol `Generate PDF`. File menggunakan nama:

```text
Manifes-QC-[ID-BATCH].pdf
```

Browser mengunduh file ke folder download yang dikonfigurasi browser. Pada workspace ini folder download telah diarahkan ke `assets`, sehingga beberapa artefak PDF dan backup hasil pengujian dapat terlihat di folder tersebut. JavaScript browser sendiri tidak memaksa lokasi itu tanpa konfigurasi browser atau izin File System Access API.

## Struktur Dokumentasi

- [TODO.md](TODO.md): checklist per part, acceptance criteria, status implementasi, dan Definition of Done.
- [requirement.md](requirement.md): requirement awal dan keputusan implementasi MVP.
- [struktur.md](struktur.md): struktur file, ownership modul, dan alur data.

## Batasan Keamanan dan Produksi

Credential masih hardcode di JavaScript dan data disimpan di `localStorage`. Siapa pun yang memiliki akses ke browser atau source code dapat melihat atau mengubahnya. Untuk produksi diperlukan backend, password hashing, session aman, otorisasi berbasis role, database terpusat, audit log, dan backup server.

PDF juga belum disimpan ke server. Jika dokumen harus terpusat atau otomatis masuk ke folder/server tertentu, generator perlu dipindahkan atau diintegrasikan dengan backend.

## Status Proyek

Fondasi, login, form QC, localStorage, dashboard, PDF template, aksesibilitas dasar, hardening input, acceptance test, dan verifikasi artefak download PDF sudah dikerjakan. Pekerjaan tersisa adalah user acceptance test dengan petugas QC nyata, draft form sementara, preview PDF, review kontras manual, dan opsi backend produksi.
