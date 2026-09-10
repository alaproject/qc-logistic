# Roadmap Perbaikan QC Logistik

Dokumen ini adalah daftar kerja lanjutan berdasarkan urutan dependensi. Kerjakan dari atas ke bawah agar setiap perubahan memiliki dasar data, validasi, dan pengujian yang jelas.

## Cara Membaca

- `[ ]` Belum dikerjakan.
- `[-]` Sedang dikerjakan.
- `[x]` Selesai.
- `[!]` Membutuhkan keputusan atau aset dari user.
- **P0** Blocker atau risiko kehilangan data/operasional.
- **P1** Penting untuk MVP yang stabil.
- **P2** Peningkatan UX dan efisiensi.
- **P3** Kebutuhan produksi atau pengembangan lanjutan.

---

## Urutan Kerja Singkat

1. Lindungi dan pulihkan data.
2. Amankan alur akses dan status penyimpanan.
3. Perbaiki validasi dan pemulihan form.
4. Perbaiki import, filter, dan operasi dashboard.
5. Perbaiki pengalaman PDF dan aset dokumen.
6. Audit tema, mobile, aksesibilitas, dan user acceptance.
7. Siapkan keputusan backend produksi.

---

## Fase 1 - Lindungi Data dan Storage

Kerjakan lebih dahulu karena kegagalan pada fase ini dapat menyebabkan batch hilang.

- [ ] **P0.1** Tangani kegagalan `localStorage` saat menyimpan.
  - Tangani `QuotaExceededError` dan exception lainnya.
  - Tampilkan pesan yang menjelaskan bahwa data belum tersimpan.
  - Sediakan langkah pemulihan: export backup atau hapus data lama.
  - Acceptance criteria: kegagalan storage tidak dianggap sebagai penyimpanan berhasil.

- [ ] **P0.2** Tambahkan draft form guest.
  - Simpan draft secara terpisah dari batch tersimpan.
  - Pulihkan draft setelah refresh.
  - Tampilkan pilihan `Pulihkan draft` atau `Buang draft`.
  - Jangan mencampur draft dengan history batch.

- [ ] **P0.3** Tambahkan backup otomatis sebelum operasi replace.
  - Berlaku sebelum import backup.
  - Simpan backup sementara atau tawarkan download terlebih dahulu.
  - Acceptance criteria: import yang salah masih dapat dibatalkan/dipulihkan.

- [ ] **P1.1** Perketat validasi record localStorage.
  - Validasi field wajib, status, tanggal, item, dan tipe data.
  - Tampilkan jumlah record yang ditolak saat import.
  - Tolak schema version yang tidak didukung.

- [ ] **P1.2** Tambahkan batas ukuran payload.
  - Batas total ukuran catatan dan jumlah item sudah tersedia; ukur juga total JSON record.
  - Acceptance criteria: aplikasi memberi peringatan sebelum storage penuh.

### Output Fase 1

- Draft aman setelah refresh.
- Kegagalan storage terlihat oleh user.
- Import tidak menghapus data tanpa recovery.
- Data invalid tidak masuk ke history.

---

## Fase 2 - Akses, Identitas, dan Status Operasi

Kerjakan setelah storage memiliki jalur recovery.

- [ ] **P0.4** Jelaskan identitas pembuat batch.
  - Mode guest harus menyimpan metadata sumber input.
  - Tampilkan status bahwa batch dibuat dari mode guest.
  - Tentukan apakah petugas wajib mengisi nama sebagai identitas minimum.

- [ ] **P0.5** Tegaskan batas keamanan dashboard.
  - Dokumentasikan bahwa guard UI/localStorage bukan keamanan produksi.
  - Jangan menganggap session browser sebagai otorisasi server.
  - Acceptance criteria: README menjelaskan risiko ini secara eksplisit.

- [ ] **P1.3** Tambahkan status penyimpanan yang konsisten.
  - State: `menyimpan`, `berhasil`, `gagal`.
  - Hindari pesan sukses jika `localStorage.setItem()` gagal.
  - Sediakan `aria-live` untuk semua status.

- [ ] **P1.4** Tampilkan status mode aplikasi.
  - `Mode input guest`.
  - `Admin dashboard`.
  - `Data lokal`.
  - Backup terakhir jika tersedia.

- [ ] **P3.1** Rancang migrasi autentikasi produksi.
  - Backend.
  - Password hashing.
  - Session/token aman.
  - Role petugas dan administrator.
  - Audit trail.

### Output Fase 2

- User memahami siapa yang membuat data.
- User memahami data masih lokal.
- Status operasi tidak menyesatkan.
- Batas MVP dan produksi terdokumentasi.

---

## Fase 3 - Validasi Form dan Input Lapangan

Kerjakan setelah data dan status penyimpanan siap.

- [ ] **P1.5** Tambahkan ringkasan validasi per kelompok form.
  - Identitas batch.
  - Armada.
  - Daftar barang.
  - Approval/status.
  - Fokus otomatis ke field invalid pertama.

- [ ] **P1.6** Validasi bisnis tambahan.
  - Status `Perlu Catatan` wajib memiliki catatan.
  - Kondisi item `Rusak` wajib memiliki catatan.
  - Tanggal QC tidak boleh invalid.
  - Nomor HP dan plat nomor memiliki format yang konsisten.

- [ ] **P1.7** Cegah submit ganda.
  - Nonaktifkan tombol saat proses simpan.
  - Cegah double click atau Enter berulang.
  - Kembalikan tombol setelah proses selesai/gagal.

- [ ] **P2.1** Perbaiki layout item pada mobile.
  - Gunakan stacked card atau accordion.
  - Hindari baris dengan terlalu banyak kolom horizontal.
  - Pastikan tombol hapus mudah disentuh.

- [ ] **P2.2** Tambahkan draft form dengan expiry.
  - Tampilkan waktu draft terakhir.
  - Hapus draft yang sudah kedaluwarsa.
  - Jangan pulihkan draft secara diam-diam.

### Output Fase 3

- Petugas tahu field mana yang harus diperbaiki.
- Submit ganda tidak membuat batch ganda.
- Form lebih nyaman dipakai di HP.

---

## Fase 4 - Dashboard dan Import Data

Kerjakan setelah record yang masuk sudah valid dan dapat dipulihkan.

- [ ] **P1.8** Validasi rentang tanggal.
  - Tolak atau koreksi kondisi `tanggal dari > tanggal sampai`.
  - Tampilkan pesan yang dapat ditindaklanjuti.

- [ ] **P1.9** Tingkatkan import backup.
  - Preview nama file, versi, jumlah batch, tanggal export, dan duplicate ID.
  - Sediakan pilihan `Replace` atau `Merge`.
  - Tampilkan hasil import: berhasil, duplicate, invalid, dan dilewati.

- [ ] **P1.10** Ganti konfirmasi hapus native.
  - Buat confirmation modal yang konsisten dengan aplikasi.
  - Tambahkan focus trap, Escape, dan label yang jelas.

- [ ] **P2.3** Tambahkan filter status verifikasi.
  - `Semua`.
  - `Terverifikasi`.
  - `Belum diverifikasi`.

- [ ] **P2.4** Tentukan scope guest setelah submit.
  - Pilihan A: guest hanya dapat input.
  - Pilihan B: guest dapat melihat ringkasan batch miliknya.
  - Dokumentasikan keputusan privasi dan operasional.

### Output Fase 4

- Filter tidak menghasilkan kondisi ambigu.
- Import aman dan dapat dipahami.
- Hapus data memiliki konfirmasi accessible.

---

## Fase 5 - PDF dan Dokumen Operasional

Kerjakan setelah data yang dirender sudah tervalidasi.

- [ ] **P1.11** Tambahkan preview manifes A4.
  - Tampilkan preview sebelum download.
  - Sediakan tombol `Download PDF` terpisah.
  - Pastikan preview tidak mengubah data batch.

- [ ] **P1.12** Tambahkan generate PDF langsung pada kartu history.
  - Tetap membutuhkan login administrator.
  - Tampilkan loading/success/error state.

- [ ] **P1.13** Stabilkan lokasi hasil download.
  - Jangan menjanjikan folder `assets` pada browser umum.
  - Tampilkan nama file yang dibuat.
  - Sediakan link download bila browser mendukung.
  - Evaluasi backend jika file harus tersimpan terpusat.

- [ ] **P1.14** Tambahkan logo resmi.
  - Ganti placeholder `QC` pada header dan manifes.
  - Uji logo pada light mode, dark mode, dan PDF light mode.

- [ ] **P1.15** Tambahkan tanda verifikasi resmi bila dibutuhkan.
  - Stempel.
  - Nama approver.
  - Tanda tangan digital atau gambar tanda tangan.

- [ ] **P2.5** Tetapkan aturan dokumen.
  - Penamaan file.
  - Retensi PDF.
  - Lokasi backup.
  - Hak akses dokumen.

### Output Fase 5

- User dapat memeriksa dokumen sebelum download.
- PDF dapat dibuat dari history dengan lebih cepat.
- Dokumen memiliki identitas brand dan aturan penyimpanan yang jelas.

---

## Fase 6 - Tema, Mobile, dan Aksesibilitas

Kerjakan setelah fungsi utama stabil.

- [ ] **P1.16** Perbaiki auto-detect theme.
  - Jangan menyimpan hasil auto-detect sebagai pilihan manual.
  - Simpan localStorage hanya setelah user menekan toggle.
  - Perubahan OS hanya mengikuti jika user belum memilih manual.

- [ ] **P1.17** Sediakan toggle tema pada login screen.
  - Toggle tetap dapat digunakan sebelum login.
  - Label dan tooltip tetap jelas di HP.

- [ ] **P1.18** Audit kontras light/dark mode.
  - Body.
  - Form.
  - Card.
  - Status badge.
  - Tabel.
  - Modal.
  - Focus ring.

- [ ] **P2.6** Uji perangkat nyata.
  - HP Android.
  - Tablet.
  - Desktop Chrome/Edge.
  - Brightness rendah dan penggunaan outdoor.

- [ ] **P2.7** Uji keyboard dan screen reader.
  - Login.
  - Form.
  - Filter.
  - Modal.
  - Import/export.
  - Generate PDF.

### Output Fase 6

- Tema konsisten dan terbaca.
- Alur utama nyaman di perangkat lapangan.
- Kontrol utama dapat digunakan tanpa mouse.

---

## Fase 7 - Acceptance Test dan Produksi

Kerjakan terakhir setelah fase sebelumnya selesai.

- [ ] **P0.6** Jalankan regression test seluruh alur.
  - Guest input.
  - Login dashboard.
  - History.
  - Filter.
  - Detail.
  - Delete.
  - Backup.
  - PDF.
  - Logout.

- [ ] **P1.19** Jalankan UAT dengan petugas QC nyata.
  - Gunakan HP nyata.
  - Gunakan data batch nyata yang sudah disamarkan.
  - Catat waktu input, error, dan kebingungan user.

- [ ] **P1.20** Verifikasi PDF manual pada Chrome/Edge.
  - Pastikan file benar-benar ditemukan.
  - Buka PDF hasil download.
  - Cocokkan data dengan detail batch.

- [ ] **P2.8** Buat laporan UAT dan daftar keputusan.
  - Masalah yang ditemukan.
  - Perbaikan yang diterima/ditunda.
  - Keputusan guest access.
  - Keputusan localStorage/backend.

- [ ] **P3.2** Siapkan roadmap produksi.
  - Backend dan database.
  - Auth dan role.
  - Storage PDF.
  - Monitoring.
  - Backup terjadwal.
  - Audit log.

## Checklist Aset

- [ ] Tambahkan `logo.svg` atau `logo.png` resmi perusahaan.
- [ ] Ganti placeholder logo `QC` pada manifes PDF.
- [ ] Tambahkan versi logo untuk header aplikasi.
- [ ] Tambahkan stempel/verifikasi resmi jika diperlukan.
- [ ] Pisahkan artefak hasil download ke `assets/downloads/`.
- [ ] Tetapkan kebijakan penamaan dan retensi PDF manifes.
- [ ] Tentukan apakah backup JSON disimpan di luar folder project.
- [ ] Uji kontras logo pada light dan dark mode.
- [ ] Pastikan PDF tetap light walaupun logo memiliki asset berwarna.

## Definition of Done Per Fase

- [ ] Fase 1: data tidak hilang tanpa pesan atau recovery.
- [ ] Fase 2: identitas dan status penyimpanan dipahami user.
- [ ] Fase 3: form valid, tidak double-submit, dan nyaman di HP.
- [ ] Fase 4: dashboard/filter/import aman.
- [ ] Fase 5: PDF dapat dipreview, diunduh, dan ditemukan.
- [ ] Fase 6: tema, aksesibilitas, dan responsive lulus audit.
- [ ] Fase 7: UAT nyata selesai dan keputusan produksi terdokumentasi.

## Catatan Teknis

Browser tidak dapat dipaksa oleh JavaScript untuk menulis file ke folder tertentu tanpa konfigurasi browser atau izin File System Access API. Folder `assets` dapat menjadi lokasi download pada environment development, tetapi bukan storage server terpusat.
