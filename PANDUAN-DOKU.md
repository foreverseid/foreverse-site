# Foreverse — Panduan Pasang & Cutover ke DOKU

18 Oktober 2026 · 64 uji lulus di simulator

Midtrans sudah dicabut sepenuhnya. Tidak ada sisa kodenya di mana pun.

---

## Yang berubah

| Berkas | Apa yang berubah |
|---|---|
| `functions/api/[[jalur]].js` | Seluruh bagian pembayaran ditulis ulang ke DOKU Checkout |
| `pesan.html` | Snap.js dicabut; pembeli dialihkan ke halaman pembayaran DOKU |
| `selesai.html` | Tombol **Lanjutkan pembayaran** untuk pembeli yang menutup tab |
| `developer.html` | Tab Sistem menyebut DOKU, bukan Midtrans |
| `syarat-ketentuan.html` | DOKU sebagai pemroses; metode QRIS |
| `kebijakan-privasi.html` | DOKU sebagai pemroses; butir lagu disesuaikan |
| `surat.html` | Pemutar YouTube dicabut; kotak musik bawaan jadi lagu bawaan; potongan mulai–selesai dihormati |
| `.assetsignore` | `sim.mjs` & `uji.mjs` tidak ikut tersaji ke publik |
| `sim.mjs`, `uji.mjs` | **Baru.** Simulator & uji otomatis, hanya untuk di komputer |

Nama berkas `[[jalur]].js` dengan kurung ganda **harus persis**. Jangan diganti.

---

## Satu keputusan yang perlu kamu tahu

**Hanya QRIS yang diaktifkan.** QRIS sudah bisa dibayar dari DANA, OVO, ShopeePay, GoPay, dan semua m-banking — jadi menambah e-wallet terpisah tidak menambah satu pembeli pun, tapi menambah biaya (DANA 1,5%, OVO sampai 3,18%). Virtual Account, minimarket, dan kartu kredit dimatikan: biayanya Rp4.000–Rp6.500 flat, dari harga Rp15.000 itu 27–43%.

Penguncian ini **dua lapis**, supaya tidak bergantung pada satu tempat saja:
1. Centang di Back Office DOKU.
2. `payment_method_types` di dalam kode (`DOKU.metode` di atas berkas API).

---

## Yang masih belum bisa dipastikan

Dua hal ini tidak ada jawabannya di dokumentasi mana pun. Jangan dianggap sudah beres.

**1. Biaya QRIS sesungguhnya untuk transaksi ≤Rp100.000.**
Aturan Bank Indonesia MDR QRIS 0% untuk transaksi ≤Rp100.000 berlaku sejak 1 Oktober 2026 untuk semua kategori merchant. Tapi itu MDR. Halaman harga DOKU menulis "biaya DOKU tetap berlaku" tanpa menyebut angka — artinya DOKU bisa memungut biaya layanannya sendiri di atas MDR. **Ini baru terbukti di langkah 6**, saat kamu membeli satu surat sungguhan dan melihat berapa yang benar-benar dipotong. Kalau ternyata ada potongan flat yang besar, harga Rp15.000 perlu dihitung ulang.

**2. Apakah kredensial Production butuh review website.**
Dokumentasi DOKU tidak menyebutnya sama sekali. Midtrans dulu menolakmu di tahap ini, jadi jangan anggap langkah 5 pasti lancar.

Satu hal kecil lagi: identifier ShopeePay berbeda di dua halaman dokumentasi DOKU (`EMONEY_SHOPEEPAY` vs `EMONEY_SHOPEE_PAY`). Tidak masalah sekarang karena kita QRIS saja, dan catatannya sudah ditulis di dalam kode kalau suatu saat perlu.

---

## Urutan cutover — satu langkah per kali

Jangan loncat. Selesaikan satu langkah, kabari saya, baru lanjut.

### Langkah 1 — Back Office DOKU (mode Sandbox)

1. Masuk ke Back Office DOKU, pastikan di **mode Sandbox**.
2. **Setting → Checkout Page → Payment Method Settings**: centang **QRIS saja**. Hilangkan centang Virtual Account, minimarket (Alfamart/Indomaret), dan kartu kredit. Simpan.
3. **Setting → Payment Settings**: cari kanal QRIS, klik **CONFIGURE**, isi Notification URL:
   ```
   https://foreverse.id/api/notifikasi-doku
   ```
   Alamat ini **harus persis**. Salah satu huruf saja, pembayaran masuk tapi surat tidak pernah aktif.
4. Ambil **Client ID** dan **Secret Key** Sandbox.

Return URL tidak perlu diisi di sini — sudah dikirim dari dalam kode setiap kali pesanan dibuat.

> **Secret Key jangan pernah ditempel ke chat**, ke GitHub, atau ke mana pun selain kotak Secret di Cloudflare. Kalau pernah terlanjur terkirim di mana saja, buat ulang kuncinya di Back Office.

### Langkah 2 — Cloudflare

**Workers & Pages → proyek foreverse → Settings → Variables and Secrets**, tambah tiga ini:

| Nama | Jenis | Isi |
|---|---|---|
| `DOKU_CLIENT_ID` | Secret | Client ID Sandbox |
| `DOKU_SECRET_KEY` | Secret | Secret Key Sandbox |
| `DOKU_MODE` | Plaintext | `sandbox` |

Variabel `MIDTRANS_*` **dibiarkan dulu**. Baru dihapus di langkah 7, setelah semuanya terbukti jalan.

Kalau `DOKU_MODE` lupa diisi, sistem jatuh ke **Sandbox**, bukan Production. Ini disengaja: salah ke Sandbox hanya membuat pembayaran gagal dan langsung ketahuan, sedangkan salah ke Production membuat uji coba memotong uang sungguhan.

### Langkah 3 — Unggah ke GitHub

Saya tidak punya akses push, jadi ini kamu sendiri lewat web GitHub. Ganti 6 berkas ini:

```
functions/api/[[jalur]].js
pesan.html
surat.html
selesai.html
developer.html
syarat-ketentuan.html
kebijakan-privasi.html
.assetsignore
```

Delapan berkas. `surat.html` masuk karena perubahan lagu, bukan karena pembayaran.

`sim.mjs` dan `uji.mjs` boleh ikut diunggah (berguna kalau nanti ada perubahan), boleh juga tidak — keduanya sudah dikecualikan dari yang tersaji ke publik.

Tunggu sampai deploy Cloudflare hijau.

### Langkah 4 — Uji di Sandbox, pakai HP sungguhan

1. Buka foreverse.id/pesan, isi formulir sampai selesai.
2. Pastikan kamu **dialihkan ke halaman DOKU** (bukan pop-up), dan **yang muncul hanya QRIS**.
3. Bayar lewat simulator QRIS Sandbox DOKU.
4. Pastikan mendarat kembali di halaman selesai, lalu statusnya berubah jadi lunas sendiri.
5. Cek email masuk, tautan suratnya bisa dibuka, dan pesanannya muncul di tab **Pesanan** di `/developer`.
6. Buka tab **Sistem** di `/developer`: baris "Pembayaran (DOKU)" harus **tersambung**.

Uji juga lagunya: sekali tanpa mengunggah apa pun (harus terdengar kotak musik bawaan), sekali dengan mengunggah MP3 (harus terdengar lagumu). Coba juga isi "putar dari detik ke-" untuk memastikan potongannya benar.

Lalu uji satu kasus gagal: buat pesanan baru, sampai halaman DOKU **tutup tabnya tanpa membayar**. Buka `/selesai?kode=<kode pesananmu>` — tombol **Lanjutkan pembayaran** harus muncul dan membawamu kembali ke halaman bayar tanpa mengetik ulang apa pun.

### Langkah 5 — Kredensial Production

1. Ajukan akun Production di Back Office, ikuti apa pun yang diminta.
2. Setelah disetujui, **ulangi langkah 1 di mode Production**: centang QRIS saja, dan isi Notification URL yang sama persis. Pengaturan Sandbox **tidak ikut terbawa** ke Production.
3. Di Cloudflare: ganti `DOKU_CLIENT_ID` dan `DOKU_SECRET_KEY` dengan yang Production, dan ubah `DOKU_MODE` jadi `production`.
4. Cek tab Sistem di `/developer` — kartu modenya harus berbunyi **Production**.

### Langkah 6 — Beli satu surat sungguhan

Pesan satu surat Rp15.000 dari HP-mu sendiri, bayar lewat QRIS asli.

Yang harus kamu catat: **berapa rupiah yang benar-benar masuk ke rekeningmu.** Ini satu-satunya cara menjawab pertanyaan biaya yang belum terjawab di atas. Kalau yang masuk Rp15.000 penuh, harga aman. Kalau dipotong, kabari saya angkanya — harga perlu dihitung ulang sebelum jualan dimulai.

### Langkah 7 — Bersih-bersih

Baru setelah langkah 6 berhasil:

- Hapus `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, dan `MIDTRANS_MODE` di Cloudflare.
- Matikan atau hapus akun Midtrans kalau tidak dipakai lagi.

---

## Kalau ada yang tidak beres

| Gejala | Penyebab yang paling sering |
|---|---|
| "DOKU menolak: ..." saat menekan tombol bayar | QRIS belum dicentang di Checkout Page, atau Client ID/Secret Key salah pasang |
| Halaman DOKU terbuka tapi QRIS tidak ada | Centang di Back Office belum tersimpan |
| Sudah bayar tapi surat tidak aktif | Notification URL salah ketik. Cek **Integration → HTTP Notification** di Back Office — di situ terlihat apakah notifikasinya terkirim dan apa balasan kita |
| Surat aktif tapi telat beberapa menit | Normal. Halaman selesai juga bertanya sendiri ke DOKU sebagai cadangan |
| Notifikasi gagal terkirim | DOKU mencoba ulang 3 kali: menit ke-30, jam ke-6, jam ke-12. Bisa juga diulang manual dari Back Office |

Sistem menerima notifikasi yang umurnya sampai 25 jam, supaya percobaan ulang jam ke-12 masih diproses. Pembayaran dobel tidak akan mengirim email dua kali.

---

## Menjalankan uji sendiri

Kalau nanti ada yang diubah di bagian pembayaran, jalankan ini sebelum unggah:

```
node uji.mjs
```

64 uji harus lulus semua. Isinya antara lain: tanda tangan yang kita kirim diperiksa ulang oleh pustaka kripto yang berbeda, susunan komponennya dicocokkan dengan contoh resmi di dokumentasi DOKU, notifikasi palsu ditolak, notifikasi dobel tidak mengirim email dua kali, dan jumlah bayar yang tidak cocok ditolak.

Untuk mencoba situsnya di komputer: `node sim.mjs`, lalu buka `http://localhost:8787`.

Satu catatan jujur: unduhan browser Playwright diblokir di lingkungan tempat saya bekerja, jadi halaman tidak bisa dijalankan di browser sungguhan dari sini. Skrip di dalam halaman sudah diperiksa bisa diurai, tapi **uji di HP sungguhan di langkah 4 tetap wajib** — itu tidak tergantikan.
