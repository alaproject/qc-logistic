Saya ingin membuat aplikasi Mobile Web App Single-Page Application (SPA) untuk QC Logistik & Ekspedisi Barang Tenant tanpa backend framework (pure HTML, CSS, JavaScript Vanilla, dan Tailwind CSS via CDN).

Tolong tuliskan kode lengkap beserta struktur file berikut:

index.html:

Menggunakan Tailwind CSS CDN & FontAwesome/Heroicons CDN.

Library html2pdf.js via CDN untuk cetak PDF.

Struktur layar SPA dengan 3 tampilan (view) yang bisa berganti tanpa reload:

View 1: Login Administrator (Username & Password).

View 2: Dashboard History & Ringkasan Batch QC.

View 3: Form Input QC Logistik (Header, Data Armada, Dynamic Items, Approval Mandiri, & Tombol Action).

Modal/Container Hidden: Template Surat Jalan/Manifes QC A4 untuk dirender jadi PDF.

css/style.css & css/components.css:

Styling khusus mobile-first layout agar nyaman diisi di HP/Tablet petugas lapangan.

Custom styling untuk tanda tangan/checkbox approval, badge status QC (Passed/Pending), dan tampilan cetak A4.

js/auth.js:

Logika autentikasi sederhana (hardcoded credential untuk admin) dan menyimpan status login di localStorage.

js/form.js:

Fitur tambah/hapus baris barang bawaan secara dinamis (Dynamic Form).

Pilihan Kategori (Bahan Baku / Alat Perkakas), Jumlah, Satuan, dan Checkbox Kondisi Physical QC (Baik / Rusak).

Catatan QC dan Tanda Tangan/Persetujuan QC Mandiri.

js/dashboard.js:

Menyimpan data transaksi di localStorage.

Menampilkan tabel/card riwayat muatan tenant, fitur search/filter, serta tombol "Cetak PDF".

js/pdf-generator.js:

Mengambil data dari form/history, memetakan ke template Surat Jalan A4 (lengkap dengan QR Code dummy/SVG, data armada, tabel barang, dan tanda tangan), lalu mengunduhnya otomatis sebagai file PDF.

Mohon berikan kode per file secara rapi dan siap dijalankan langsung di browser.
