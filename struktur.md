# Struktur Project dan Ownership Modul

```text
qc-logistic/
|
|-- index.html
|-- README.md
|-- requirement.md
|-- struktur.md
|-- assets/
|   |-- README.md
|   |-- TODO.md
|   `-- generated PDF/JSON artifacts (bergantung konfigurasi download browser)
|-- css/
|   |-- style.css
|   |-- components.css
|   |-- pdf.css
|   |-- accessibility.css
|   `-- theme.css
`-- js/
    |-- app.js
    |-- auth.js
    |-- form.js
    |-- dashboard.js
    |-- pdf-generator.js
    `-- theme.js
```

## Entry Point: `index.html`

Memuat login view, dashboard view, form input QC, detail modal, container template PDF, CDN styling, dan module entry `js/app.js`.

Mode awal aplikasi adalah form input guest. Dashboard, history, backup, detail, delete, dan PDF hanya tersedia setelah session administrator aktif.

HTML tidak memiliki backend atau framework runtime. Query version pada module digunakan untuk menghindari cache browser saat development.

## CSS Modules

### `css/style.css`

Tema global, variable warna, layout halaman, header, login shell, dan animasi dasar.

### `css/components.css`

Panel, form, buttons, statistik dashboard, batch card, status badge, search/filter, modal, dan detail table.

### `css/pdf.css`

Template manifes A4: header dokumen, placeholder logo, QR SVG, tabel muatan, catatan QC, tanda tangan/verifikasi, dan page break.

### `css/accessibility.css`

Focus-visible, disabled/loading state, target sentuh mobile, dan batas modal pada viewport kecil.

### `css/theme.css`

Class-based dark mode untuk body, panel, form, card, tabel, modal, status card, dan kontrol tema. PDF tetap memakai style light dengan latar putih.

## JavaScript Modules

### `js/app.js`

Orchestrator aplikasi: routing guest/admin, navigation, login/logout, form submit, validasi bisnis, input limits, detail modal, focus trap, backup controls, dashboard filters, dan pemanggilan PDF.

### `js/auth.js`

Credential hardcode MVP, login, logout, session check, dan current user.

### `js/form.js`

Dynamic item rows, collect/reset items, limit `MAX_ITEM_ROWS = 20`, serta limit panjang nama/satuan item.

### `js/dashboard.js`

CRUD localStorage, validasi struktur record, backup schema version 1, search/filter, sorting terbaru, empty state, statistik, dan history cards.

### `js/pdf-generator.js`

Template manifes A4, escaping data, QR SVG dummy berdasarkan ID batch, placeholder logo, tabel item, status, catatan, verifikasi, dan html2pdf page break.

### `js/theme.js`

Auto-detect `prefers-color-scheme`, toggle sun/moon, persistence key `theme`, dan helper `withLightTheme()` untuk mengunci PDF ke light mode sementara.

## Data Flow

```text
Guest membuka aplikasi
  -> form input QC
  -> app.js memvalidasi record
  -> dashboard.js menyimpan ke localStorage

Guest memilih Dashboard
  -> app.js mengarahkan ke login
  -> auth.js memvalidasi credential
  -> dashboard dan fitur administrasi terbuka

Detail batch
  -> app.js membuka modal
  -> theme.js mengunci light sementara
  -> pdf-generator.js membuat manifes
  -> html2pdf.js mengunduh PDF
  -> theme sebelumnya dipulihkan
```

## CDN dan Runtime

- Tailwind CSS: utility layout.
- Google Material Icons Round: ikon interface dan toggle tema.
- Google Fonts: DM Sans dan Space Mono.
- html2pdf.js: render HTML ke PDF.

Aplikasi direkomendasikan dijalankan melalui `http://localhost:5500`, bukan `file://`.
