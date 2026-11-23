# Standar Video Konten Foreverse v1

Berlaku untuk semua video TikTok & Instagram @foreverse.id. Tujuannya: setiap video terasa dari merek yang sama.

## Ukuran & durasi
- 1080×1920, 30 fps, H.264 + AAC, kenyaringan sekitar -14 LUFS.
- **Durasi 20–35 detik**, target 25–30. `susun.mjs` memberi peringatan kalau keluar batas.
- 5–7 adegan isi (masing-masing 3–5 detik) + penutup merek 3,5–4,5 detik.

## Susunan layar (tetap di semua video)
- Label kecil (Plus Jakarta Sans, huruf kapital, violet, titik coral) di y≈236: `<Momen> · <Nama tema>`. Titik adegan di kanan.
- Judul Fraunces 78 px, **maks. 7 kata**, satu frasa disorot (miring, coral) dengan `*…*`.
- Subjudul Plus Jakarta Sans 34 px: satu kalimat pendek, isinya sejalan dengan narasi (untuk yang menonton tanpa suara).
- Bingkai HP di tengah berisi **rekaman tema asli** (`rekam/rekam.mjs`). Rekaman boleh dipercepat (laju ≤3,5×) dan diperbesar ke bagian penting; isinya tidak pernah diubah.
- 230 px terbawah dibiarkan kosong untuk teks bawaan TikTok/Instagram; teks tidak masuk 150 px kanan (tombol aplikasi).
- Frame pertama sudah berisi judul utuh + produk (jadi sampul).
- Penutup: logo + **foreverse** (Fraunces) + "Surat digital yang bisa dimainkan."

## Suara
- Narasi dari `suara.py` (suara bahasa Indonesia, tidak perlu merekam sendiri), tempo 0,94. Kalimat pendek, maks. sekitar 10 kata per adegan.
- Musik latar dari `musik.py` (dibuat dari kode, bebas hak cipta, sama di semua video), otomatis mengecil saat narasi.
- Bunyi "wus" halus di setiap pergantian adegan.
- Nama merek ditulis "Forever vers" di naskah supaya diucapkan benar.

## Isi
- Nama contoh selalu Amira & Adriel. Tidak ada harga, promo, tanggal, atau "pesan sekarang" di dalam video: semua itu di caption.
- Tidak ada klaim berlebihan, tidak menyebut AI, tanpa tanda pisah panjang.
- Konten yang bukan demo produk (tips kado, cerita relatable) tetap memakai susunan layar ini; bingkai HP boleh diganti kartu teks atau b-roll suasana, tapi tampilan produk yang muncul selalu rekaman asli.

## Cara membuat satu konten
1. `node rekam/rekam.mjs <tema>` (rekaman tema asli).
2. Tulis `video/konten/<id>.json`: tiap adegan punya `judul`, `sub`, `naskah`, `rekaman {dari, laju}`, opsional `zoom {x, y, s, mulai, lama}` dan `durasi`.
3. `tts/bin/python video/suara.py video/konten/<id>.json rekaman/video/<id>` (narasi).
4. `SAMPEL=1 node video/susun.mjs video/konten/<id>.json` → periksa `lembar.jpg`.
5. `node video/susun.mjs video/konten/<id>.json` → `rekaman/video/<id>.mp4` + sampul.
