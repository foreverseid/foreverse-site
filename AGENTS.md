# Foreverse — panduan untuk AI coding agent

Foreverse (foreverse.id) menjual surat digital interaktif: satu halaman web
yang dipersonalisasi dan DIMAINKAN penerimanya. Pemilik: Morfhi, satu-satunya
pengelola. Konteks lengkap: Google Drive "Foreverse — Arsip Project".

## Aturan keras
- Push/merge ke `main` = langsung tayang. Jangan merge sebelum `node uji.mjs` lulus.
- Nama contoh di demo, data uji, konten: selalu **Amira & Adriel**. Tidak ada nama orang sungguhan.
- Tidak ada secret (kunci DOKU/Resend, password, token) atau data pembeli di kode, PR, atau komentar.
- Teks pembeli dipakai persis apa adanya, termasuk salah ketik. Jangan "merapikan".
- Jangan ubah berkas tema (`<tema>.html`, `<tema>-demo.html`) kecuali tugasnya memang itu.
- Jangan ganti nama `functions/api/[[jalur]].js` (kurung ganda wajib).
- Blok `<script id="foreverse-data">` di berkas tema harus diakhiri `}` + baris baru + `</script>`.
- Tidak ada yang menganggur: kode, berkas, kelas CSS yang tidak terpakai dihapus.
- Satu tugas, satu PR. Jangan menambah perubahan yang tidak diminta.
- Undangan pernikahan BUKAN bagian repo ini (proyek terpisah).

## Struktur
- `worker.js` — Cloudflare Worker (rute, sisip data surat).
- `functions/api/[[jalur]].js` — API: pesanan, DOKU QRIS, email Resend, D1, R2.
- `<tema>.html` — mesin tiap tema; `<tema>-demo.html` — demo Amira & Adriel.
- `pesan.html` formulir · `index.html` katalog · `developer.html` panel pemilik.
- `uji.mjs` + `sim.mjs` — uji otomatis dengan simulator (tanpa kunci sungguhan).
- `rekam/` — perekam video 9:16 untuk konten (tidak ikut tayang).
  `node rekam/rekam.mjs <tema>` → `rekaman/<tema>.mp4` + potongan per bagian.
  Skrip per tema di `rekam/tema/<tema>.mjs`; contoh: `kasus-pengirim.mjs`.
  Mainkan dengan sentuhan sungguhan (klik/seret), jangan memanggil fungsi internal.

## Uji
- `node uji.mjs` wajib lulus sebelum PR (Node 22+). Tambah uji untuk perilaku baru.
- Perubahan tampilan: ambil tangkapan layar di 412×900 dan 1280×800, lalu periksa.
- `node_modules/` dan `rekaman/` tidak pernah di-commit.

## Bahasa
- Teks untuk pengguna: Bahasa Indonesia, hangat, kalimat pendek, tidak lebay.
- Ringkasan PR: apa yang berubah, apa yang terbukti, apa yang belum teruji.
