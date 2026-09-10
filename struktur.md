# Struktur Project dan Ownership Modul

```text
qc-logistic/
|
|-- index.html
|-- README.md
|-- requirement.md
|-- struktur.md
|-- TODO.md
|-- assets/
|   |-- README.md
|   `-- generated PDF/JSON artifacts (bergantung konfigurasi download browser)
|-- css/
|   |-- style.css
|   |-- components.css
|   |-- pdf.css
|   `-- accessibility.css
`-- js/
    |-- app.js
    |-- auth.js
    |-- form.js
    |-- dashboard.js
    `-- pdf-generator.js
```

## Entry Point

### `index.html`

Memuat:

- Login view.
- Dashboard view.
- Form input QC.
- Detail modal.
- Container template PDF.
- Tailwind CSS CDN.
- Google Fonts dan Material Icons Round.
- `html2pdf.js` CDN.
- Module entry `js/app.js`.

HTML tidak memiliki backend atau framework runtime. Versi query pada module digunakan untuk menghindari cache browser saat development.

## CSS

### `css/style.css`

Berisi tema global, variable warna, layout halaman, header, login shell, dan animasi dasar.

### `css/components.css`

Berisi komponen aplikasi:

- Panel.
- Form dan fieldset.
- Button.
- Statistik dashboard.
- Batch card.
- Status badge.
- Search/filter.
- Modal.
- Detail table.

### `css/pdf.css`

Berisi style khusus template manifes A4:

- Header dokumen.
- Placeholder logo.
- QR SVG.
- Tabel muatan.
- Catatan QC.
- Area tanda tangan/verifikasi.
- Page break.
- Ukuran render A4.

### `css/accessibility.css`

Berisi focus-visible, disabled/loading state, target sentuh mobile, dan batas modal pada viewport kecil.

## JavaScript

### `js/app.js`

Orchestrator aplikasi:

- Inisialisasi view.
- Navigation dashboard/form.
- Login/logout event.
- Form submit dan validasi bisnis.
- Input limits dan maksimal 20 item.
- Detail modal dan focus trap.
- Backup export/import controls.
- Dashboard filter setup.
- Pemanggilan generator PDF.

### `js/auth.js`

Auth MVP:

- Credential hardcode.
- Login.
- Logout.
- Cek session.
- Membaca current user.

Session key: `qc_logistic_session`.

### `js/form.js`

Form dynamic items:

- Tambah item.
- Hapus item.
- Kumpulkan data item.
- Reset item rows.
- Limit `MAX_ITEM_ROWS = 20`.
- Limit panjang nama/satuan item.

### `js/dashboard.js`

Data dan dashboard:

- CRUD record melalui `localStorage`.
- Validasi struktur record saat membaca data.
- Backup schema version 1.
- Parse dan replace backup.
- Statistik batch.
- Search/filter.
- Sorting terbaru berdasarkan `createdAt`.
- Empty state.
- Render history cards.

Data key: `qc_logistic_batches`.

### `js/pdf-generator.js`

Generator manifes:

- Membangun template A4 dari record batch.
- Escape data user.
- Membuat QR SVG dummy berdasarkan ID batch.
- Menampilkan logo placeholder.
- Menampilkan tabel item, status, catatan, dan verifikasi.
- Mengatur html2pdf dan page break.
- Membersihkan template setelah proses selesai/gagal.

## Alur Data

```text
Login
  -> auth.js
  -> app.js menampilkan dashboard

Form QC
  -> form.js mengumpulkan item
  -> app.js memvalidasi record
  -> dashboard.js menyimpan ke localStorage
  -> dashboard.js merender history

Detail Batch
  -> dashboard.js mengirim record ke app.js
  -> app.js membuka modal
  -> pdf-generator.js membuat template manifes
  -> html2pdf.js mengunduh PDF
```

## CDN dan Runtime

- Tailwind CSS: utility layout.
- Google Material Icons Round: ikon interface.
- Google Fonts: DM Sans dan Space Mono.
- html2pdf.js: render HTML ke PDF.

Aplikasi direkomendasikan dijalankan lewat `http://localhost:5500`, bukan `file://`.
