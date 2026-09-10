# TODO Assets dan Artefak Download

## Status Folder

- Folder ini belum memiliki logo resmi perusahaan.
- PDF manifes dan backup JSON dapat muncul di sini jika folder download browser diarahkan ke `assets`.
- Artefak hasil pengujian tidak menjadi source asset aplikasi.

## Pekerjaan Aset

- [ ] Tambahkan `logo.svg` atau `logo.png` resmi perusahaan.
- [ ] Ganti placeholder logo `QC` pada manifes PDF dengan logo resmi.
- [ ] Tambahkan versi logo untuk header aplikasi jika diperlukan.
- [ ] Tambahkan stempel atau tanda verifikasi resmi jika operasional membutuhkannya.
- [ ] Pisahkan artefak hasil download ke folder `assets/downloads/` bila jumlah file mulai banyak.
- [ ] Tetapkan kebijakan penamaan dan retensi PDF manifes.
- [ ] Tentukan apakah backup JSON perlu disimpan di luar folder project.
- [ ] Pastikan logo resmi tetap memiliki kontras pada light mode dan dark mode.
- [ ] Pastikan logo resmi tidak mengubah dokumen PDF menjadi dark; PDF harus tetap light.

## Catatan Teknis

Browser tidak dapat dipaksa oleh JavaScript untuk menulis file ke folder tertentu tanpa konfigurasi browser atau izin File System Access API. Folder `assets` dapat menjadi lokasi download pada environment development, tetapi bukan storage server terpusat.

## Perubahan Akses Aplikasi

- [x] Form input batch tersedia sebagai halaman default tanpa login.
- [x] Dashboard dan fitur administrasi memerlukan login administrator.
- [x] Logout mengembalikan aplikasi ke mode input guest.

## Tema UI

- [x] Toggle tema sun/moon tersedia pada header aplikasi.
- [x] Preferensi tema mengikuti OS saat pertama dibuka.
- [x] Preferensi tema tersimpan pada localStorage key `theme`.
- [x] PDF dipaksa tetap light selama generate.
