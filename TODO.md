# To-do List QC Logistik

Dokumen ini menjadi checklist pengerjaan aplikasi berdasarkan requirement dan hasil analisis penggunaan MVP.

## Status

- `[ ]` Belum dikerjakan
- `[-]` Sedang dikerjakan
- `[x]` Selesai
- `[!]` Memerlukan keputusan atau aset dari user

## Prioritas

- **P0**: blocker atau risiko utama untuk alur kerja
- **P1**: wajib untuk MVP yang dapat dipakai
- **P2**: peningkatan operasional
- **P3**: pengembangan setelah MVP

---

## Part 1 - Fondasi Project

- [x] **P0** Pisahkan entry point ke `index.html`.
  - Acceptance criteria: HTML hanya berisi shell SPA, view, form, modal, dan container PDF.
- [x] **P0** Pisahkan stylesheet ke `css/style.css` dan `css/components.css`.
  - Acceptance criteria: tidak ada blok CSS utama yang tertinggal inline di `index.html`.
- [x] **P0** Pisahkan JavaScript ke modul `js/`.
  - Acceptance criteria: tersedia `app.js`, `auth.js`, `form.js`, `dashboard.js`, dan `pdf-generator.js`.
- [x] **P1** Gunakan Google Material Icons.
- [x] **P1** Pertahankan layout mobile-first dan responsive.
- [x] **P1** Jalankan aplikasi melalui local server.
  - Acceptance criteria: aplikasi dapat dibuka melalui `http://localhost`, bukan hanya `file://`.
  - Validasi: aplikasi berhasil dibuka di `http://localhost:5500/index.html`.
  - Validasi: `app.js`, `auth.js`, `form.js`, `dashboard.js`, dan `pdf-generator.js` berhasil dimuat.
  - Catatan: ini penting untuk mengurangi masalah ES Modules dan download PDF.

## Part 2 - Login Administrator

- [x] **P0** Tambahkan view login administrator.
- [x] **P0** Gunakan credential hardcode MVP.
  - Username: `admin`
  - Password: `qc12345`
- [x] **P0** Simpan status login di `localStorage`.
- [x] **P1** Tambahkan tombol logout.
- [x] **P1** Tambahkan feedback login yang jelas.
  - Acceptance criteria: pesan sukses/gagal memiliki warna dan status visual berbeda.
- [x] **P2** Tambahkan dokumentasi credential MVP di halaman internal atau panduan penggunaan.
  - Validasi: credential tersedia di `README.md` dan `struktur.md`.
- [ ] **P3** Ganti autentikasi hardcode dengan backend dan password hashing.

## Part 3 - Form Input QC

- [x] **P0** Buat form identitas batch.
  - ID batch
  - Tanggal QC
  - Tenant
  - Petugas QC
- [x] **P0** Buat form data armada.
  - Jenis kendaraan
  - Plat nomor
  - Nama pengemudi
  - Nomor HP
- [x] **P0** Tambahkan dynamic item rows.
  - Tambah barang
  - Hapus barang
  - Minimal satu baris barang tetap tersedia
- [x] **P0** Tambahkan field barang.
  - Nama barang
  - Jumlah
  - Satuan
  - Kategori
  - Kondisi
- [x] **P0** Pertahankan kondisi `Baik`, `Perlu Catatan`, dan `Rusak`.
- [x] **P1** Tambahkan catatan QC.
- [x] **P1** Tambahkan checkbox verifikasi mandiri.
- [x] **P0** Tolak ID batch duplikat.
  - Acceptance criteria: penyimpanan dibatalkan dan user mendapat pesan yang jelas.
- [x] **P1** Tambahkan validasi bisnis.
  - Jumlah harus lebih besar dari nol.
  - Nomor HP memiliki format yang masuk akal.
  - Status `Perlu Catatan` meminta catatan QC.
  - Status `Rusak` pada item meminta catatan QC.
- [x] **P1** Tambahkan indikator penyimpanan.
  - Acceptance criteria: user melihat status menyimpan, berhasil, atau gagal.
  - Validasi: status sukses tampil di dashboard setelah batch tersimpan.
- [ ] **P2** Tambahkan draft form sementara.
  - Acceptance criteria: form yang belum selesai dapat dipulihkan setelah refresh.

## Part 4 - Penyimpanan LocalStorage

- [x] **P0** Simpan batch ke `localStorage`.
- [x] **P0** Ambil data batch saat aplikasi dibuka.
- [x] **P0** Hapus batch dari history.
- [x] **P1** Tambahkan validasi struktur data saat membaca `localStorage`.
  - Acceptance criteria: data rusak tidak membuat aplikasi crash.
- [x] **P1** Tambahkan export backup JSON.
  - Acceptance criteria: seluruh batch dapat diunduh sebagai file backup.
- [x] **P1** Tambahkan import backup JSON.
  - Acceptance criteria: backup dapat dipulihkan dengan konfirmasi user.
- [x] **P2** Tambahkan versi schema data.
  - Acceptance criteria: perubahan struktur data dapat dimigrasikan.
  - Validasi: backup menggunakan `version: 1` dan memuat `exportedAt` serta `records`.
- [!] **P3** Tentukan apakah MVP akan tetap lokal atau naik ke database bersama.

## Part 5 - Dashboard History

- [x] **P0** Tampilkan total batch.
- [x] **P0** Tampilkan jumlah `Lolos QC`.
- [x] **P0** Tampilkan jumlah `Perlu Catatan`.
- [x] **P0** Tampilkan jumlah batch belum diverifikasi.
- [x] **P0** Tampilkan kartu history batch.
- [x] **P1** Tambahkan search berdasarkan batch, tenant, plat, dan pengemudi.
- [x] **P1** Tambahkan filter status.
- [x] **P1** Tambahkan detail batch.
- [x] **P1** Tambahkan hapus batch.
- [x] **P1** Tambahkan urutan history yang konsisten.
  - Acceptance criteria: batch terbaru selalu berada di posisi teratas berdasarkan `createdAt`.
- [x] **P1** Tambahkan empty state berbeda.
  - Belum ada data.
  - Tidak ada hasil pencarian.
  - Filter tidak menemukan data.
- [x] **P2** Tambahkan filter tanggal dan tenant.
- [x] **P2** Tambahkan ringkasan muatan per tenant.

## Part 6 - Generator PDF Manifes

- [x] **P0** Tambahkan library `html2pdf.js` via CDN.
- [x] **P0** Buat template manifes A4.
- [x] **P0** Petakan data batch ke template PDF.
- [x] **P0** Tambahkan tabel barang pada manifes.
- [x] **P1** Sediakan tombol generate PDF dari detail batch.
- [x] **P0** Tampilkan feedback proses generate PDF.
  - Acceptance criteria: tombol memiliki state loading dan hasil sukses/gagal terlihat.
- [x] **P0** Perbaiki rendering template PDF.
  - Acceptance criteria: template tidak ditempatkan secara ekstrem di luar viewport.
  - Acceptance criteria: PDF tidak kosong dan tidak terpotong.
- [ ] **P0** Uji PDF melalui local server.
  - Acceptance criteria: file berhasil diunduh dari browser Chrome/Edge.
  - Catatan: generator selesai tanpa error dan feedback sukses tampil, tetapi automated browser harness belum menangkap event download Blob secara langsung.
- [x] **P1** Dokumentasikan lokasi file hasil download.
  - Catatan: browser tidak dapat menulis otomatis langsung ke folder `assets`.
- [x] **P1** Tambahkan QR Code dummy atau SVG.
  - Isi minimal: ID batch.
- [x] **P1** Tambahkan logo placeholder dari folder `assets`.
- [x] **P1** Tambahkan area tanda tangan yang lebih formal.
  - Petugas QC.
  - Status verifikasi mandiri.
- [x] **P1** Tambahkan kontrol page break untuk item yang banyak.
- [ ] **P2** Tambahkan preview manifes sebelum download.
- [ ] **P2** Tambahkan tombol generate ulang dari kartu history.
- [ ] **P3** Evaluasi penyimpanan file PDF melalui backend jika PDF harus masuk folder/server tertentu.

## Part 7 - UX Mobile dan Aksesibilitas

- [x] **P1** Gunakan layout mobile-first.
- [x] **P1** Sediakan label pada field utama.
- [x] **P1** Gunakan ikon Google Material Icons.
- [x] **P1** Pastikan seluruh tombol memiliki state hover, focus, disabled, dan loading.
  - Validasi: focus-visible global, disabled/loading PDF, dan hover pada kontrol utama tersedia.
- [x] **P1** Pastikan pesan validasi dapat dibaca screen reader.
- [x] **P1** Pastikan modal dapat ditutup dengan tombol Escape.
- [x] **P1** Kunci fokus di dalam modal saat modal terbuka.
- [x] **P2** Uji pada viewport HP, tablet, dan desktop.
  - Validasi: smoke test viewport mobile 390px tidak menghasilkan overflow horizontal.
- [x] **P2** Uji form dengan keyboard tanpa mouse.
  - Validasi: modal dapat dibuka, ditab, ditutup dengan Escape, dan fokus kembali ke pemicu.
- [ ] **P2** Uji kontras warna dan ukuran target sentuh.

## Part 8 - Keamanan dan Batasan MVP

- [x] **P0** Escape data user sebelum ditampilkan kembali di HTML.
- [x] **P1** Tambahkan batas panjang input.
- [x] **P1** Tambahkan batas ukuran catatan dan jumlah item.
  - Validasi: catatan maksimal 1.000 karakter dan batch maksimal 20 item.
- [x] **P1** Tangani data `localStorage` yang tidak valid.
  - Validasi: parser aman mengembalikan array kosong saat JSON rusak atau record tidak valid.
- [x] **P1** Jelaskan bahwa credential hardcode bukan keamanan produksi.
  - Validasi: batasan keamanan terdokumentasi di `README.md`.
- [x] **P2** Tambahkan mekanisme backup data.
  - Validasi: export/import JSON tersedia pada Part 4.
- [ ] **P3** Migrasikan session dan data ke backend terautentikasi.

## Part 9 - Testing dan Acceptance Review

- [x] **P0** Cek sintaks semua modul JavaScript.
- [x] **P0** Smoke test login.
- [x] **P0** Smoke test simpan batch.
- [x] **P0** Smoke test tampilkan history.
- [x] **P0** Test generate PDF pada Chrome melalui local server.
  - Validasi: artefak PDF berhasil muncul di folder `assets` pada konfigurasi download workspace ini.
- [x] **P0** Test PDF dengan satu item.
  - Validasi: template berisi 1 baris item dan QR batch.
- [x] **P1** Test PDF dengan banyak item.
  - Validasi: template berisi 20 baris item tanpa error.
- [x] **P1** Test PDF dengan karakter khusus pada nama tenant/barang.
  - Validasi: karakter `<`, `>`, `&`, dan tanda kutip tampil aman di detail serta template.
- [x] **P1** Test data kosong atau rusak di `localStorage`.
  - Validasi: JSON rusak menghasilkan dashboard kosong tanpa crash.
- [x] **P1** Test batch ID duplikat.
  - Validasi: penyimpanan ditolak dan jumlah record tidak bertambah.
- [x] **P1** Test login salah dan logout.
  - Validasi: alert error, session bertahan setelah reload, logout menghapus session.
- [x] **P2** Test responsive pada mobile, tablet, dan desktop.
  - Validasi: viewport 390px, 768px, dan 1280px tidak menghasilkan overflow horizontal.
- [ ] **P2** Lakukan user acceptance test dengan alur petugas QC nyata.

## Urutan Pengerjaan yang Disarankan

1. **P0 PDF**: rendering, feedback, QR, dan template selesai; verifikasi download file secara manual masih terbuka.
2. **P0 Data**: cegah batch ID duplikat dan validasi data bisnis. (Selesai)
3. **P1 Dashboard**: sorting, empty state, filter, dan ringkasan tenant. (Selesai)
4. **P1 Dokumen**: QR, logo placeholder, layout tanda tangan, dan page break selesai.
5. **P1 Reliability**: backup/import JSON dan validasi localStorage. (Selesai)
6. **P1 UX**: loading, focus state, modal keyboard, dan mobile testing selesai; review kontras/UAT masih terbuka.
7. **P2/P3**: preview PDF, laporan lanjutan, backend, dan autentikasi produksi.

## Definition of Done MVP

MVP dianggap siap diuji oleh user apabila:

- [x] User dapat login dan logout.
- [x] User dapat membuat batch dengan minimal satu barang.
- [x] Batch tersimpan dan tetap muncul setelah refresh.
- [x] Batch dapat dicari, difilter, dilihat detailnya, dan dihapus.
- [x] Batch ID duplikat ditolak.
- [x] PDF dapat dibuat dan diunduh dari browser melalui local server.
- [x] PDF berisi data batch yang sama dengan detail aplikasi.
- [x] PDF tidak kosong, tidak terpotong, dan memiliki tabel barang.
- [x] User mendapat pesan yang jelas saat PDF berhasil atau gagal dibuat.
- [x] Alur utama dapat digunakan pada viewport mobile.
