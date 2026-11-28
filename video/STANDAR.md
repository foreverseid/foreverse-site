# Standar Konten Video Foreverse v3

Berlaku untuk semua video TikTok & Instagram @foreverse.id (diperbarui 28 Nov 2026).
Tujuannya: setiap video terasa dibuat oleh merek yang sama, dan penonton paham dalam 30 detik apa yang dijual.

---

## 1. Prinsip utama

1. **Suara dulu, baru storyboard dan animasi.** Naskah disetujui, suara dibuat, baru detik tiap adegan, storyboard, dan animasinya disusun mengikuti suara itu. Urutan ini tidak pernah dibalik; sebelum suara ada, jangan menetapkan detik.
2. **Tampilan produk selalu rekaman tema asli** (`rekam/rekam.mjs`). Boleh dipercepat (laju ≤3,5×) dan diperbesar; isi layarnya tidak pernah diubah. Narasi tidak boleh menyebut sesuatu yang tidak ada di tema.
3. **Satu kalimat, satu adegan, satu gagasan.** Tidak ada adegan yang memuat dua hal berbeda.
4. **Tanpa harga, promo, tanggal, atau ajakan membeli ("pesan sekarang") di dalam video.** Semua itu di caption. **Ajakan ringan untuk melihat atau mencoba boleh** (misalnya "Coba mainin sendiri contohnya, link-nya ada di bio"), sebagai kalimat sebelum tagline.
5. Naskah harus wajar diucapkan, jelas maksudnya, tidak ambigu, dan konsepnya tidak ganjil.
6. Konten yang bukan demo produk (tips kado, cerita relatable) tetap memakai susunan layar ini; bingkai HP boleh diganti kartu teks atau b-roll suasana, tapi tampilan produk yang muncul selalu rekaman asli.

## 2. Ukuran & durasi

- 1080×1920, 30 fps, H.264 + AAC, kenyaringan sekitar -14 LUFS.
- **Durasi 25–35 detik**, ditentukan panjang narasi. Kalau narasi lebih dari 35 detik, **naskahnya yang dipersingkat**; percepatan suara maksimal 8% (`tempoSuara` ≤1,08).
- 5–7 adegan isi + adegan tagline penutup.

### Montase (beberapa tema dalam satu video)

Montase = satu video yang menyambung potongan pendek dari beberapa tema.

- 3–5 tema, tiap potongan minimal 3 detik.
- Label di atas judul berganti mengikuti tema yang sedang tampil.
- Narasi tidak boleh menyiratkan satu cara main berlaku di semua tema.
- Video sesudah montase tidak memakai tema yang ada di montase.

## 3. Struktur cerita (sama di semua video)

| Bagian | Waktu | Isi |
|---|---|---|
| Hook | 0–3 dtk | Satu kalimat yang bikin berhenti scroll: situasi relate, pertanyaan, atau misteri. Teks + suara + produk muncul di frame pertama. |
| Alur | 3–25 dtk | 4–5 adegan, tiap adegan memperlihatkan satu interaksi tema (ketuk, seret, game, surat). Ada perubahan visual tiap 2–4 detik. |
| Puncak | sekitar 60–75% durasi | Momen paling lucu, menyentuh, atau mengejutkan; diperbesar pas kata kuncinya diucapkan. |
| Penutup cerita | 2–3 dtk | Kalimat yang menyambung ke hook (supaya penonton memutar ulang), atau ajakan ringan untuk melihat/mencoba; masih dengan rekaman produk atau situs. |
| Tagline | 2–3 dtk | Logo + tagline. Hanya tagline yang diucapkan. |

Pendekatan dipakai bergiliran; dua video berturut-turut tidak boleh sama pendekatan atau temanya: romantis-sinematik, komedi relatable, tebak/interaktif, ide kado/edukatif, satu tema banyak video, di balik layar (proses membuat surat, bukan alat pembuatnya).

## 4. Sinkronisasi suara dan gambar (wajib)

- Pergantian adegan jatuh **tepat saat kalimat berikutnya mulai diucapkan** (selisih ≤0,1 detik).
- Judul dan subjudul di layar adalah **ringkasan kalimat yang sedang diucapkan**: tidak mendahului, tidak tertinggal.
- Zoom atau momen penting dimulai **pas kata kuncinya terdengar**.
- **Logo dan tagline muncul tepat saat tagline mulai diucapkan.** Kalimat sebelumnya tetap di adegan produk.
- Video selesai paling lambat 0,8 detik setelah kata terakhir.
- Narasi dari AI Studio dipotong per kalimat dengan `rapikan_vo.py` di jeda antar kalimat; satu potongan = satu adegan.

## 5. Tagline & tanda merek

- **Tagline: "Surat digital yang bisa dimainkan."** Diucapkan di akhir setiap video dan tertulis di bawah logo.
- **Kata "Foreverse" tidak diucapkan** (pengucapan TTS-nya tidak bisa diandalkan). Merek muncul lewat logo, kata **foreverse**, dan **foreverse.id** di layar penutup.
- Label kecil di atas judul selalu menyebut momen dan nama tema, misalnya `Birthday · Kado Riang`.

## 6. Gaya bahasa

**Narasi (suara):**
- Persona tetap: **perempuan muda Jakarta yang cerita ke sahabatnya.** Bukan penyiar, bukan iklan.
- Bahasa lisan sehari-hari: *nggak, udah, abis, kirimin, deh, lho, tuh kan, eh*. Kalimat pendek, maksimal sekitar 12 kata.
- Uji baca: kalau kalimatnya tidak akan diucapkan orang ke temannya di tongkrongan, tulis ulang. Hindari kalimat yang terdengar seperti terjemahan ("Dan kamu… percaya"), puitis berlebihan, dan kata iklan ("dapatkan", "segera", "hanya", "terbaik").
- Titik tiga (…) untuk jeda dramatis; tanda seru untuk semangat; tanda tanya untuk menggoda.
- Tidak ada klaim berlebihan ("dijamin nangis", "termurah", "nomor 1"), tidak menyebut AI, tanpa tanda pisah panjang.

**Teks di layar:**
- Judul maksimal 7 kata, satu frasa disorot (miring, coral) dengan `*…*`.
- Subjudul satu kalimat pendek; boleh bahasa lisan seperti narasinya.
- Nama contoh selalu Amira & Adriel.

## 7. Suara (Google AI Studio)

- Model Gemini Flash TTS, satu blok, **suara Achernar**.
- Kolom gaya diisi dengan pola: persona + alur emosi per kalimat + "big pitch variation, never flat, never like an announcer".
- Tag yang dipakai hanya `<short pause>`, `<gasp>`, `<soft laugh>`. Jangan menaruh jeda panjang di antara kalimat; jeda diatur saat penyusunan.
- Morfhi menjalankan 2–4 kali dan mengirim hasil terbaik dalam satu WAV utuh.

Pola teks gaya:
```
Playful young woman from Jakarta telling her best friend <jenis cerita>, everyday Indonesian slang, close to the mic, natural timing like a TikTok storyteller. <emosi kalimat 1>. <emosi kalimat 2>. ... End warm and sincere on "Surat digital yang bisa dimainkan". Big pitch variation, never flat, never like an announcer.
```

## 8. Tampilan

- Label kecil violet + titik coral di y≈236, titik adegan di kanan.
- Judul Fraunces 78 px; subjudul Plus Jakarta Sans 34 px.
- Bingkai HP di tengah berisi rekaman tema; 230 px terbawah dan 150 px kanan dibiarkan kosong untuk tombol aplikasi.
- Frame pertama sudah berisi judul utuh + produk (jadi sampul).
- Penutup: logo + **foreverse** + tagline + foreverse.id.
- Musik latar dari `musik.py` (bebas hak cipta), otomatis mengecil saat narasi; bunyi "wus" halus tiap pergantian adegan. Tempo 84 untuk romantis/misteri, 92 untuk komedi.

### Gerak & transisi (wajib di setiap video)

- Animasinya harus sangat menarik, bukan sekadar bingkai HP yang berganti isi.
- Transisi bervariasi dan diturunkan dari isi adegannya (misalnya capit, adukan, jepretan, garis yang tersambung, lipatan kertas). Satu video tidak mengulang satu transisi yang sama dari awal sampai akhir.
- Bingkai HP, judul, dan label ikut bergerak (masuk, keluar, zoom, miring halus) tepat pada kata kuncinya.
- Gerak tidak boleh menutupi isi layar produk atau membuat teks sulit dibaca. Isi rekaman tetap tidak diubah.

## 9. Caption & unggahan

- **Susunan tetap:** `Untuk: yang …` → satu kalimat tentang suratnya + 💌 → `Coba contohnya di foreverse.id.` → `P.S.` berisi satu pertanyaan → tagar.
- Komentar sematan dibuka `P.P.S.`
- **4 tagar** (maks. 5): #suratdigital, #foreverse, 1 momen, 1 hubungan.
- Nama seri dan nomor tidak ditulis di sosmed; hanya untuk arsip di Google Drive.
- Tautan bio berlabel: `foreverse.id/?utm_source=tiktok&utm_campaign=bio` (Instagram: `utm_source=instagram`).
- Jam utama 19.00 WIB. 3 hari pertama unggah setiap hari, lalu tiap 2 hari.
- Catat metrik hari ke-1 dan ke-7 di spreadsheet "Kalender & Metrik Konten".
- Sistem komunikasi lengkap: dokumen `claude/sistem-komunikasi-sosmed.md`; berkas induk di Google Drive.

## 10. Alur kerja satu konten

| Langkah | Siapa | Waktu Morfhi |
|---|---|---|
| Konsep, naskah, teks gaya | Claude | 2 menit membaca dan menyetujui |
| Suara di AI Studio, kirim WAV | Morfhi | 5 menit |
| Rekam tema, potong narasi, storyboard, animasi, render, periksa | Claude | — |
| Dengarkan hasil, unggah + caption | Morfhi | 5 menit |

Perintah teknis:
1. `node rekam/rekam.mjs <tema>`
2. `video/konten/<id>.json`: tiap adegan `judul`, `sub`, `naskah`, `rekaman {dari, laju}`, opsional `zoom {x, y, s, mulai, lama}`; adegan terakhir `penutup: true` hanya berisi tagline.
3. `python3 video/rapikan_vo.py vo.wav rekaman/video/<id> <titik potong antar kalimat> 0.3`
4. `SAMPEL=1 node video/susun.mjs video/konten/<id>.json` → periksa `lembar.jpg`
5. `node video/susun.mjs video/konten/<id>.json` → `rekaman/video/<id>.mp4` + sampul

## 11. Periksa sebelum dikirim

- [ ] Durasi 25–35 detik, gambar dan suara sama panjang.
- [ ] Tiap pergantian adegan pas dengan awal kalimat; logo muncul pas tagline diucapkan.
- [ ] Teks di layar sama maksudnya dengan yang diucapkan.
- [ ] Tidak ada tampilan tema yang bertentangan dengan narasi.
- [ ] Transkrip ulang narasi terbaca utuh.
- [ ] Kenyaringan sekitar -14 LUFS.
- [ ] Gerak dan transisi bervariasi, halus, dan tidak menutupi isi layar.
