/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · API sistem pesanan
   Satu file ini menangani semua alamat /api/...
   Berjalan di Cloudflare Pages Functions.

   Sambungan yang harus ada di Cloudflare (Settings → Bindings):
     DB    → D1 database  foreverse-db      (wajib)
     FOTO  → R2 bucket    foreverse-foto    (opsional; kalau tidak ada,
                                             foto disimpan di D1)

   Kunci rahasia (Settings → Variables and Secrets):
     DOKU_CLIENT_ID, DOKU_SECRET_KEY, DOKU_MODE,
     RESEND_API_KEY, ADMIN_PASSWORD, EMAIL_PENGIRIM
   ══════════════════════════════════════════════════════════════════ */

const HARGA = 15000;                 // rupiah, bersih yang masuk ke Foreverse
/* Biaya transaksi DOKU (QRIS, Rp500 + PPN 12%) dibebankan ke pembeli,
   ditambahkan di atas HARGA saat checkout — bukan dipotong dari HARGA.
   Sumber: balasan email DOKU 20-10-2026 ("DOKU Fee Rp500 per transaksi,
   belum termasuk PPN"). PPN 12% adalah tarif umum berlaku 2026, belum
   dikonfirmasi langsung oleh DOKU untuk biaya ini — perlu dicek ulang
   di nota transaksi sungguhan nanti.                                  */
const BIAYA_TRANSAKSI = 560;
const HARI_EDIT = 3;                 // masa berlaku tautan edit
const JAM_DRAF = 24;
const BULAN_SIMPAN = 2;               // surat & foto disimpan sekian bulan sejak dibayar
const HARI_PENGINGAT = 14;            // email pengingat sekian hari sebelum masa simpan habis
const PANJANG_KODE = 10;             // kode surat baru (/s/<kode>); kode lama 6 huruf tetap berlaku
/* Batas laju per alamat IP: [maks permintaan, jendela detik].
   Alamat IP tidak disimpan mentah — hanya sidik SHA-256 pendeknya. */
const LAJU = {
  draf: [12, 600], simpan: [30, 600], bayar: [20, 600], catat: [80, 600],
  status: [150, 600], surat: [150, 600], dibuka: [40, 600], developer: [25, 600],
  buka: [12, 600], ingat: [10, 600], promo: [20, 600], perpanjang: [20, 600]
};                 // draf belum dibayar dihapus setelah ini
const MAKS_FOTO = 3 * 1024 * 1024;   // batas satu foto setelah dikecilkan
const MAKS_LAGU = 10 * 1024 * 1024;  // batas file lagu yang diunggah

/* ── batas karakter; dijaga di server juga, bukan cuma di formulir ──
   Isian dasar sama untuk semua tema Birthday (lihat claude/bait-
   birthday-panduan.md untuk Bait). Isian khas tema (rahasia / kupon /
   kuis+harapan) beda per tema — lihat TEMA_SKEMA di bawah.            */
const BATAS = {
  penerima: 20, pengirim: 20,
  surat: 220, caption: 40, rahasia: 120,
  kupon: 50, harapan: 90, kuisTanya: 70, kuisPilihan: 30,
  dosis: 90, aturanDosis: 40, enakan: 60, airPesan: 80,
  kegiatan: 24, alasan: 90, titikTemu: 40, catatanTunda: 90,
  kebiasaan: 90, kangen: 70, barang: 24, penutup: 120,
  catatan: 90, pesanan: 40, tahu: 90,
  kunangKu: 70, sejak: 50, janji: 90,
  tempatKj: 24, ceritaKj: 90,
  kegiatanRut: 50, oleh: 50,
  email: 120, whatsapp: 24, judulLagu: 80, artisLagu: 80
};

const UCAPAN_SAH = ["selamat", "barakallah", "happy"];
const JENIS_HARI_SAH = ["pacaran", "tunangan", "menikah"];
const JENJANG_SAH = ["sma", "d3", "s1", "s2", "s3"];
/* Tampilan tokoh yang mewakili penerima di tema dunia-dijalani. */
const KARAKTER_SAH = ["perempuan", "laki"];

/* Kota yang bisa dipilih untuk momen LDR (tema Zona Waktu). Zona IANA
   dipakai di mesin tema untuk menghitung jam & selisihnya secara hidup
   (tahan DST) — bukan angka GMT tetap. Daftar ini harus sama dengan
   KOTA di zona-waktu.html dan di pesan.html. */
const KOTA_SAH = [
  "jakarta","medan","surabaya","denpasar","makassar","manado","jayapura",
  "kualalumpur","singapura","bangkok","manila","hongkong","taipei","tokyo",
  "seoul","shanghai","dubai","doha","riyadh","istanbul","kairo","london",
  "amsterdam","paris","berlin","roma","sydney","melbourne","perth","auckland",
  "newyork","losangeles","toronto","vancouver"
];

/* Tema yang bisa dipesan, jumlah foto wajibnya, dan momen dasarnya.
   `momen` menentukan isian DASAR yang dipakai (lihat rapikanIsi()):
     "birthday"    → ucapan, tanggalLahir, sembunyikanUmur
     "anniversary" → jenisHariJadi, tanggalMulai, sembunyikanTahun
   Tema baru = tambah satu baris di sini, lalu tangani isian khasnya
   (kalau ada, di luar isian dasar momennya) di rapikanIsi(). */
const TEMA_SKEMA = {
  "bait":              { nfoto: 3, momen: "birthday" },
  "kado-riang":        { nfoto: 3, momen: "birthday" },
  "langit-harapan":    { nfoto: 4, momen: "birthday" },
  "peta-perjalanan":   { nfoto: 3, momen: "anniversary" },
  "zona-waktu":        { nfoto: 3, momen: "ldr" },
  "graduation-benih":  { nfoto: 3, momen: "graduation" },
  "confess-kunang":    { nfoto: 3, momen: "confess" },
  "getwell-365":       { nfoto: 3, momen: "getwell" },
  "pasar-malam":       { nfoto: 3, momen: "askout" },
  "lewat-duluan":      { nfoto: 3, momen: "lovenote" },
  "kasus-pengirim":    { nfoto: 3, momen: "confess" },
  "rekonstruksi":      { nfoto: 3, momen: "anniversary" },
  "rumah-contoh":      { nfoto: 3, momen: "proposal" }
};
function temaSah(t){ return TEMA_SKEMA[t] ? t : "bait"; }

/* ══════════════════ alat bantu ══════════════════ */

const ABJAD = "abcdefghjkmnpqrstuvwxyz23456789"; // tanpa i l o 0 1, biar tidak salah baca

function acak(n) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  let s = "";
  for (let i = 0; i < n; i++) s += ABJAD[b[i] % ABJAD.length];
  return s;
}

function jwb(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function salah(pesan, status = 400) { return jwb({ ok: false, pesan }, status); }

function teks(v, maks) {
  if (v == null) return "";
  let s = String(v).replace(/\r\n/g, "\n").trim();
  if (maks && s.length > maks) s = s.slice(0, maks);
  return s;
}

function tanggalSah(v) {
  const s = teks(v, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

/* Jam ajakan (momen Ask Out) — "HH:MM" 24 jam. Dipakai mesin tema untuk
   jarum jam menara di puncak bianglala, jadi harus benar-benar jam. */
function jamSah(v) {
  const s = teks(v, 5);
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "";
  const j = +m[1], n = +m[2];
  if (j > 23 || n > 59) return "";
  return ("0" + j).slice(-2) + ":" + m[2];
}

/* ══════════════════ DOKU ══════════════════
   Semua yang mungkin perlu disesuaikan ada di sini, di satu tempat.
   Jangan menyebar nilai-nilai ini ke bawah.                        */

const DOKU = {
  /* Metode pembayaran yang boleh muncul di halaman DOKU.
     Dikunci ke QRIS saja. QRIS sudah bisa dibayar dari DANA, OVO,
     ShopeePay, GoPay, dan semua m-banking, jadi menambah e-wallet
     terpisah tidak menambah satu pembeli pun — hanya menambah biaya. */
  metode: ["QRIS"],

  /* Cadangan, belum dipakai. Catatan: identifier ShopeePay berbeda di
     dua halaman dokumentasi DOKU (EMONEY_SHOPEEPAY di contoh request,
     EMONEY_SHOPEE_PAY di daftar metode). Kalau nanti diaktifkan, uji
     satu per satu di Sandbox dulu sebelum dipakai sungguhan.         */
  ewallet: ["EMONEY_DANA", "EMONEY_OVO"],

  jatuhTempoMenit: 60,                    // umur halaman pembayaran
  jalurCheckout: "/checkout/v1/payment",
  jalurStatus: "/orders/v1/status/",
  jalurNotifikasi: "/api/notifikasi-doku", // harus sama dengan yang diisi di Back Office

  /* Batas umur notifikasi yang masih diterima. Sengaja longgar:
     DOKU mencoba ulang pada menit ke-30, jam ke-6, dan jam ke-12
     kalau balasan kita gagal. Jendela sempit justru akan menolak
     percobaan ulang yang sah. Perlindungan dari pengiriman ulang
     datang dari idempotensi di bawah, bukan dari jendela waktu ini. */
  maksUsiaJam: 25
};

/* Mode ditentukan oleh DOKU_MODE, tidak pernah ditebak dari kuncinya.
   Kunci DOKU tidak punya awalan yang bisa dipercaya. Kalau DOKU_MODE
   belum diisi, kita jatuh ke Sandbox — bukan Production. Salah ke
   Sandbox hanya membuat pembayaran gagal dan ketahuan langsung;
   salah ke Production membuat uji coba memotong uang sungguhan.     */
function modeSandbox(env) {
  if (env.STAGING) return true;          // staging tidak pernah menagih uang sungguhan
  const m = String(env.DOKU_MODE || "").trim().toLowerCase();
  if (["production", "produksi", "live", "sungguhan"].includes(m)) return false;
  return true;
}

function modeDitegaskan(env) {
  const m = String(env.DOKU_MODE || "").trim().toLowerCase();
  return ["sandbox","uji","ujicoba","uji coba","test","production","produksi","live","sungguhan"].includes(m);
}

function basisDoku(env) {
  return modeSandbox(env) ? "https://api-sandbox.doku.com" : "https://api.doku.com";
}

/* ── tanda tangan DOKU ──
   Susunannya: Client-Id, Request-Id, Request-Timestamp, Request-Target,
   lalu Digest khusus POST. Digabung dengan \n, TANPA newline di akhir.
   Hasilnya "HMACSHA256=" + base64. Rumus ini sama untuk permintaan
   yang kita kirim maupun notifikasi yang kita terima.               */

function keBase64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

async function digestDoku(badanMentah) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(badanMentah || ""));
  return keBase64(new Uint8Array(h));
}

async function hmacDoku(rahasia, pesan) {
  const kunci = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(rahasia),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const t = await crypto.subtle.sign("HMAC", kunci, new TextEncoder().encode(pesan));
  return "HMACSHA256=" + keBase64(new Uint8Array(t));
}

function rangkaiTandaTangan(clientId, requestId, stempel, sasaran, digest) {
  const baris = [
    "Client-Id:" + clientId,
    "Request-Id:" + requestId,
    "Request-Timestamp:" + stempel,
    "Request-Target:" + sasaran
  ];
  if (digest) baris.push("Digest:" + digest);
  return baris.join("\n");
}

/* ISO8601 UTC tanpa milidetik, persis seperti contoh DOKU. */
function stempelUtc() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/* Perbandingan waktu-konstan: lamanya tidak bergantung pada isi, jadi
   tidak bocor berapa karakter awal yang kebetulan sudah benar.      */
function samaAman(a, b) {
  const x = new TextEncoder().encode(String(a == null ? "" : a));
  const y = new TextEncoder().encode(String(b == null ? "" : b));
  if (x.length !== y.length) return false;
  let beda = 0;
  for (let i = 0; i < x.length; i++) beda |= x[i] ^ y[i];
  return beda === 0;
}

/* Satu pintu untuk semua panggilan ke DOKU. Secret Key tidak pernah
   ikut keluar dari fungsi ini — tidak ke log, tidak ke respons.     */
async function panggilDoku(env, pilihan) {
  const metode = pilihan.metode, sasaran = pilihan.sasaran;
  const clientId = env.DOKU_CLIENT_ID;
  const requestId = crypto.randomUUID();
  const stempel = stempelUtc();
  const mentah = pilihan.badan ? JSON.stringify(pilihan.badan) : "";
  const digest = metode === "POST" ? await digestDoku(mentah) : "";
  const tanda = await hmacDoku(env.DOKU_SECRET_KEY,
    rangkaiTandaTangan(clientId, requestId, stempel, sasaran, digest));

  const kepala = {
    "Client-Id": clientId,
    "Request-Id": requestId,
    "Request-Timestamp": stempel,
    "Signature": tanda,
    accept: "application/json"
  };
  if (metode === "POST") kepala["content-type"] = "application/json";

  const r = await fetch(basisDoku(env) + sasaran, {
    method: metode,
    headers: kepala,
    body: metode === "POST" ? mentah : undefined
  });
  const hasil = await r.json().catch(() => ({}));
  /* DOKU membungkus jawabannya di "response" pada sebagian endpoint
     dan tidak pada sebagian lain. Terima dua-duanya.                */
  return { ok: r.ok, isi: (hasil && hasil.response) || hasil, asli: hasil };
}

/* ══════════════════ database ══════════════════ */

let tabelSiap = false;

async function siapkan(db) {
  if (tabelSiap) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS pesanan(
      kode TEXT PRIMARY KEY, token TEXT, tema TEXT, momen TEXT,
      email TEXT, whatsapp TEXT, isi TEXT,
      status TEXT DEFAULT 'draf', order_id TEXT, jumlah INTEGER,
      dibuat INTEGER, dibayar INTEGER, batas_edit INTEGER,
      aktif INTEGER DEFAULT 1, email_terkirim INTEGER DEFAULT 0,
      dibuka INTEGER, n_buka INTEGER DEFAULT 0, simpan_sampai INTEGER, pengingat INTEGER,
      promo TEXT, potongan INTEGER DEFAULT 0, n_panjang INTEGER DEFAULT 0)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_order ON pesanan(order_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_token ON pesanan(token)`),
    /* hitungan kunjungan per tema per hari: "demo" = contohnya dibuka di
       beranda, "form" = formulir pesan untuk tema itu dibuka */
    db.prepare(`CREATE TABLE IF NOT EXISTS kunjungan(
      hari TEXT, tema TEXT, jenis TEXT, n INTEGER DEFAULT 0, PRIMARY KEY(hari,tema,jenis))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS foto(
      kunci TEXT PRIMARY KEY, kode TEXT, mime TEXT, isi BLOB, dibuat INTEGER)`),
    /* hitungan batas laju per sidik IP per jendela waktu */
    db.prepare(`CREATE TABLE IF NOT EXISTS laju(
      kunci TEXT PRIMARY KEY, sampai INTEGER, n INTEGER)`),
    /* catatan kegagalan untuk tab Sistem di /developer */
    /* "Ingetin aku": hanya tanggal & bulan, nama panggilan penerima, email pembeli.
       Terpisah dari isi surat; dihapus begitu pengingatnya terkirim. */
    db.prepare(`CREATE TABLE IF NOT EXISTS pengingat(
      id TEXT PRIMARY KEY, kode TEXT UNIQUE, email TEXT, nama TEXT, jenis TEXT, bulan INTEGER, hari INTEGER, dibuat INTEGER)`),
    /* pengaturan yang bisa diubah dari /developer tanpa deploy ulang */
    db.prepare(`CREATE TABLE IF NOT EXISTS pengaturan(kunci TEXT PRIMARY KEY, nilai TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS promo(
      kode TEXT PRIMARY KEY, jenis TEXT, nilai INTEGER, kuota INTEGER, terpakai INTEGER DEFAULT 0,
      sampai INTEGER, aktif INTEGER DEFAULT 1, dibuat INTEGER)`),
    /* pembayaran perpanjangan masa simpan (faktur berawalan FP-) */
    db.prepare(`CREATE TABLE IF NOT EXISTS perpanjangan(
      order_id TEXT PRIMARY KEY, kode TEXT, jumlah INTEGER, status TEXT, dibuat INTEGER, dibayar INTEGER)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS pakai(hari TEXT, jenis TEXT, n INTEGER DEFAULT 0, PRIMARY KEY(hari,jenis))`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_status_dibuat ON pesanan(status,dibuat)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_dibayar ON pesanan(dibayar)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS kejadian(
      id INTEGER PRIMARY KEY AUTOINCREMENT, waktu INTEGER, jenis TEXT, pesan TEXT, kode TEXT)`)
  ]);
  /* tabel pesanan yang sudah ada di produksi dibuat sebelum kolom ini ada */
  for (const kolom of ["dibuka INTEGER", "n_buka INTEGER DEFAULT 0", "simpan_sampai INTEGER", "pengingat INTEGER",
                       "promo TEXT", "potongan INTEGER DEFAULT 0", "n_panjang INTEGER DEFAULT 0"]) {
    try { await db.prepare("ALTER TABLE pesanan ADD COLUMN " + kolom).run(); } catch (_) { /* sudah ada */ }
  }
  tabelSiap = true;
}

/* draf yang tidak dibayar dibersihkan sendiri */
async function bersihkan(db, env) {
  const batas = Date.now() - JAM_DRAF * 3600 * 1000;
  const lama = await db.prepare(
    `SELECT kode FROM pesanan WHERE status='draf' AND dibuat < ?`).bind(batas).all();
  for (const r of (lama.results || [])) await hapusFoto(env, db, r.kode);
  await db.prepare(`DELETE FROM pesanan WHERE status='draf' AND dibuat < ?`).bind(batas).run();
}

/* ══════════════════ pintu tunggal email ══════════════════
   Semua email lewat sini: dihitung per hari (untuk memantau kuota Resend),
   dan di staging dialihkan seluruhnya ke email pemilik supaya pembeli
   sungguhan tidak pernah menerima email uji. */
const BATAS_EMAIL_BAWAAN = 100;      // kuota harian Resend paket gratis (cek dashboard Resend)
async function kirimResend(env, opsi) {
  if (env.STAGING) {
    try {
      const d = JSON.parse(opsi.body);
      d.to = [env.EMAIL_PEMILIK || env.EMAIL_PENGIRIM || "halo@foreverse.id"];
      d.subject = "[STAGING] " + d.subject;
      opsi = Object.assign({}, opsi, { body: JSON.stringify(d) });
    } catch (_) {}
  }
  const r = await fetch("https://api.resend.com/emails", opsi);
  try {
    if (env.DB && r.ok) {
      const hari = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
      await env.DB.prepare(`INSERT INTO pakai(hari,jenis,n) VALUES(?, 'email', 1)
        ON CONFLICT(hari,jenis) DO UPDATE SET n=n+1`).bind(hari).run();
      const batas = Number(env.BATAS_EMAIL_HARIAN) || BATAS_EMAIL_BAWAAN;
      const b = await env.DB.prepare(`SELECT n FROM pakai WHERE hari=? AND jenis='email'`).bind(hari).first();
      if (b && b.n === Math.ceil(batas * 0.8))
        await catatKejadian(env, env.DB, "kuota email hampir habis", "Hari ini sudah " + b.n + " dari " + batas + " email. Pertimbangkan naik paket Resend.", "");
    }
  } catch (_) {}
  return r;
}

/* ══════════════════ batas laju ══════════════════
   Di Cloudflare, header cf-connecting-ip selalu ada. Tanpa header itu
   (simulator lokal) pembatasan dilewati. */
async function sidikIp(request) {
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip) return null;
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fv|" + ip)));
  return Array.from(h.slice(0, 8), b => b.toString(16).padStart(2, "0")).join("");
}

async function lewatBatas(db, request, nama) {
  const aturan = LAJU[nama];
  const sidik = aturan && await sidikIp(request);
  if (!sidik) return false;
  const [maks, detik] = aturan;
  const skr = Date.now(), kunci = nama + ":" + sidik;
  const b = await db.prepare(`SELECT sampai,n FROM laju WHERE kunci=?`).bind(kunci).first();
  if (!b || b.sampai < skr) {
    await db.prepare(`INSERT OR REPLACE INTO laju(kunci,sampai,n) VALUES(?,?,1)`).bind(kunci, skr + detik * 1000).run();
    if (Math.random() < 0.02) await db.prepare(`DELETE FROM laju WHERE sampai < ?`).bind(skr).run();
    return false;
  }
  if (b.n >= maks) return true;
  await db.prepare(`UPDATE laju SET n=n+1 WHERE kunci=?`).bind(kunci).run();
  return false;
}

/* ══════════════════ catatan kegagalan ══════════════════
   Disimpan untuk tab Sistem, dan dikabarkan ke email pemilik — paling
   sering satu email per jenis kegagalan per jam, supaya tidak banjir. */
async function catatKejadian(env, db, jenis, pesan, kode) {
  try {
    const skr = Date.now();
    const terakhir = await db.prepare(
      `SELECT waktu FROM kejadian WHERE jenis=? ORDER BY waktu DESC LIMIT 1`).bind(jenis).first();
    await db.prepare(`INSERT INTO kejadian(waktu,jenis,pesan,kode) VALUES(?,?,?,?)`)
      .bind(skr, jenis, String(pesan || "").slice(0, 300), kode || "").run();
    await db.prepare(`DELETE FROM kejadian WHERE waktu < ?`).bind(skr - 60 * 86400000).run();
    const tujuan = env.EMAIL_PEMILIK || env.EMAIL_PENGIRIM || "halo@foreverse.id";
    if (env.RESEND_API_KEY && (!terakhir || skr - terakhir.waktu > 3600000)) {
      await kirimResend(env, {
        method: "POST",
        headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          from: "Foreverse Sistem <" + (env.EMAIL_PENGIRIM || "halo@foreverse.id") + ">",
          to: [tujuan],
          subject: "[Foreverse] Ada kegagalan: " + jenis,
          text: "Jenis: " + jenis + "\nKode pesanan: " + (kode || "-") + "\nKeterangan: " + pesan +
                "\n\nRinciannya ada di /developer → tab Sistem. Email jenis ini paling sering dikirim sekali per jam."
        })
      });
    }
  } catch (_) { /* pencatatan tidak boleh menggagalkan alur pembeli */ }
}

/* ══════════════════ foto ══════════════════ */

function dariBase64(s) {
  const murni = String(s).replace(/^data:[^,]*,/, "");
  const bin = atob(murni);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function simpanFoto(env, kode, urutan, dataUrl, mime) {
  const bytes = dariBase64(dataUrl);
  if (bytes.length > MAKS_FOTO) throw new Error("Foto " + urutan + " terlalu besar.");
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const kunci = kode + "/" + urutan + "-" + acak(6) + "." + ext;

  if (env.FOTO) {
    await env.FOTO.put(kunci, bytes, { httpMetadata: { contentType: mime } });
  } else {
    await env.DB.prepare(`INSERT OR REPLACE INTO foto(kunci,kode,mime,isi,dibuat) VALUES(?,?,?,?,?)`)
      .bind(kunci, kode, mime, bytes, Date.now()).run();
  }
  return "/f/" + kunci;
}

async function hapusFoto(env, db, kode) {
  if (env.FOTO) {
    const daftar = await env.FOTO.list({ prefix: kode + "/" });
    for (const o of daftar.objects) await env.FOTO.delete(o.key);
  }
  await db.prepare(`DELETE FROM foto WHERE kode=?`).bind(kode).run();
}

/* ══════════════════ isi surat ══════════════════ */

/* ══════════════════ lagu ══════════════════
   Dua kemungkinan saja, tidak lebih:
     1. Pembeli tidak mengunggah apa pun → surat memakai kotak musik
        bawaan Foreverse, yang dibangkitkan browser sendiri tanpa
        berkas. Tidak ada lisensi yang bisa bermasalah, tidak ada
        berkas yang bisa hilang, dan halamannya tidak bertambah berat.
     2. Pembeli mengunggah MP3/M4A miliknya → disimpan di R2.
   Mulai/Selesai = potongan lagu yang diputar berulang, dalam detik. */

const JENIS_LAGU = {
  "audio/mpeg": ["mp3", "audio/mpeg"], "audio/mp3": ["mp3", "audio/mpeg"],
  "audio/mp4": ["m4a", "audio/mp4"], "audio/x-m4a": ["m4a", "audio/mp4"], "audio/m4a": ["m4a", "audio/mp4"],
  "audio/aac": ["aac", "audio/aac"]
};

async function hapusUnggahanLama(env, kode, lama) {
  var jalurLama = lama && (lama.src || lama.file);
  if (env.FOTO && typeof jalurLama === "string" && jalurLama.startsWith("/f/" + kode + "/")) {
    try { await env.FOTO.delete(jalurLama.slice(3)); } catch (_) {}
  }
}

/* Skema lagu: {src, judul, artis, mulai, selesai} — src kosong berarti
   kotak musik bawaan. Semua mesin tema (surat.html, kado-riang.html,
   langit-harapan.html) membaca field ini. */
async function rapikanLagu(env, kode, masuk, lama) {
  const m = masuk || {};
  const detik = v => { const n = Math.round((+v || 0) * 10) / 10; return n > 0 && n < 3600 ? n : 0; };
  const mulai = detik(m.mulai);
  let selesai = detik(m.selesai);
  if (selesai && selesai < mulai + 3) selesai = 0;   // potongan terlalu pendek → putar sampai habis
  const artis = teks(m.artis, BATAS.artisLagu);
  const kosong = { src: "", judul: "", artis: "", mulai: 0, selesai: 0 };

  /* berkas baru diunggah */
  if (m.data && String(m.data).length > 32) {
    if (!env.FOTO) throw new Error("Unggah lagu sedang tidak bisa dipakai. Kosongkan saja — suratnya tetap bermusik.");
    const jenis = JENIS_LAGU[String(m.mime || "").toLowerCase()];
    if (!jenis) throw new Error("Format lagu harus MP3 atau M4A.");
    const bytes = dariBase64(m.data);
    if (bytes.length > MAKS_LAGU) throw new Error("File lagu terlalu besar. Maksimal 10 MB.");
    const kunci = kode + "/lagu-" + acak(6) + "." + jenis[0];
    await env.FOTO.put(kunci, bytes, { httpMetadata: { contentType: jenis[1] } });
    await hapusUnggahanLama(env, kode, lama);
    return { judul: teks(m.judul, BATAS.judulLagu), artis, src: "/f/" + kunci, mulai, selesai };
  }

  /* mengedit tanpa mengganti berkas: lagu yang lama dipertahankan */
  var srcLama = lama && (lama.src || lama.file);
  if (m.pakaiLama && srcLama)
    return { judul: (lama && lama.judul) || "", artis: (lama && lama.artis) || artis, src: srcLama, mulai, selesai };

  await hapusUnggahanLama(env, kode, lama);
  return kosong;
}

/* ══════════════════ kunci pembuka ══════════════════
   jenis: "pin" (4–6 angka) · "tanya" (pertanyaan + jawaban) · "tanggal"
   (YYYY-MM-DD), ditambah opsional "buka" = waktu paling cepat surat bisa
   dibuka (milidetik). Kunci TIDAK PERNAH dikirim ke penerima: worker.js
   menyajikan halaman gerbang, dan isi surat baru dikirim setelah kuncinya
   benar (cookie berisi tiket acak per surat).                              */
const JENIS_KUNCI = ["pin", "tanya", "tanggal"];
function normalJawab(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function rapikanKunci(masuk, lama) {
  const k = masuk || {};
  const hasil = {};
  const jenis = JENIS_KUNCI.includes(k.jenis) ? k.jenis : "";
  if (jenis === "pin") {
    const pin = String(k.pin || "").replace(/\D/g, "");
    if (pin.length < 4 || pin.length > 6) throw new Error("PIN kunci harus 4–6 angka.");
    hasil.jenis = "pin"; hasil.pin = pin;
  } else if (jenis === "tanya") {
    const tanya = teks(k.tanya, 120), jawab = teks(k.jawab, 60);
    if (!tanya || !normalJawab(jawab)) throw new Error("Pertanyaan rahasia dan jawabannya belum lengkap.");
    hasil.jenis = "tanya"; hasil.tanya = tanya; hasil.jawab = jawab;
  } else if (jenis === "tanggal") {
    const tgl = tanggalSah(k.tanggal);
    if (!tgl) throw new Error("Tanggal kunci belum diisi.");
    hasil.jenis = "tanggal"; hasil.tanggal = tgl;
  }
  if (hasil.jenis) hasil.petunjuk = teks(k.petunjuk, 90);
  const buka = Number(k.buka) || 0;
  if (buka) {
    if (buka > Date.now() + 366 * 86400000) throw new Error("Waktu buka paling lambat satu tahun dari sekarang.");
    hasil.buka = buka;
  }
  if (!hasil.jenis && !hasil.buka) return null;
  hasil.tiket = (lama && lama.tiket) || acak(24);
  return hasil;
}
/* isi surat yang aman dikirim ke penerima: tanpa kunci */
export function isiUntukPenerima(isi) {
  const salin = Object.assign({}, isi || {});
  delete salin.kunci;
  return salin;
}
export function cocokKunci(kunci, jawab) {
  if (!kunci || !kunci.jenis) return true;
  if (kunci.jenis === "pin") return String(jawab || "").replace(/\D/g, "") === kunci.pin;
  if (kunci.jenis === "tanggal") return tanggalSah(jawab) === kunci.tanggal;
  return normalJawab(jawab) === normalJawab(kunci.jawab);
}
/* gerbang perlu ditampilkan? null = tidak; selain itu info aman untuk gerbang */
export function infoGerbang(isi, cookie, kode) {
  const k = isi && isi.kunci;
  if (!k) return null;
  const terbuka = !k.jenis || bacaCookie(cookie, "fvk_" + kode) === k.tiket;
  const tunggu = k.buka && Date.now() < k.buka;
  if (terbuka && !tunggu) return null;
  return {
    jenis: terbuka ? "" : k.jenis, tanya: k.tanya || "", petunjuk: k.petunjuk || "",
    panjangPin: k.pin ? k.pin.length : 0, buka: tunggu ? k.buka : 0, penerima: (isi && isi.penerima) || ""
  };
}
function bacaCookie(cookie, nama) {
  const m = String(cookie || "").match(new RegExp("(?:^|;\\s*)" + nama + "=([^;]+)"));
  return m ? m[1] : "";
}

async function rapikanIsi(env, kode, badan, lamaIsi, tema) {
  const p = badan.isi || {};
  const skema = TEMA_SKEMA[tema] || TEMA_SKEMA.bait;
  const isi = {
    penerima: teks(p.penerima, BATAS.penerima),
    pengirim: teks(p.pengirim, BATAS.pengirim),
    surat: [0, 1, 2].map(i => teks((p.surat || [])[i], BATAS.surat)),
    lagu: null,
    foto: []
  };

  if (!isi.penerima) throw new Error("Nama penerima belum diisi.");
  if (!isi.pengirim) throw new Error("Nama pengirim belum diisi.");
  if (!isi.surat[0]) throw new Error("Surat bagian 1 belum diisi.");

  /* ── isian DASAR, beda per momen ──
     Birthday: ucapan + tanggal lahir + sembunyikan umur.
     Anniversary: jenis hari jadi + tanggal mulai + sembunyikan tahun.
     LDR: kota pengirim + kota penerima (dipakai tema Zona Waktu untuk
     menghitung jam & jarak live — tidak ada angka berulang di sini,
     beda struktur dari birthday/anniversary dengan sengaja).
     Graduation: jenjang + tanggal wisuda + sembunyikan tahun. */
  if (skema.momen === "anniversary") {
    isi.jenisHariJadi = JENIS_HARI_SAH.includes(p.jenisHariJadi) ? p.jenisHariJadi : "pacaran";
    isi.tanggalMulai = tanggalSah(p.tanggalMulai);
    isi.sembunyikanTahun = !!p.sembunyikanTahun;
    if (!isi.tanggalMulai) throw new Error("Tanggal mulai belum diisi.");
  } else if (skema.momen === "ldr") {
    isi.kotaPengirim = KOTA_SAH.includes(p.kotaPengirim) ? p.kotaPengirim : "";
    isi.kotaPenerima = KOTA_SAH.includes(p.kotaPenerima) ? p.kotaPenerima : "";
    if (!isi.kotaPengirim) throw new Error("Kota kamu belum dipilih.");
    if (!isi.kotaPenerima) throw new Error("Kota dianya belum dipilih.");
  } else if (skema.momen === "graduation") {
    isi.jenjang = JENJANG_SAH.includes(p.jenjang) ? p.jenjang : "s1";
    isi.tanggalWisuda = tanggalSah(p.tanggalWisuda);
    isi.sembunyikanTahun = !!p.sembunyikanTahun;
    if (!isi.tanggalWisuda) throw new Error("Tanggal wisuda belum diisi.");
  } else if (skema.momen === "getwell") {
    /* Get Well Soon: tanggal mulai sakit dipakai mesin tema untuk
       menghitung "hari ke-N" secara hidup — bukan angka tahunan yang
       berulang seperti birthday/anniversary/graduation. */
    isi.tanggalSakit = tanggalSah(p.tanggalSakit);
    isi.sembunyikanHari = !!p.sembunyikanHari;
    if (!isi.tanggalSakit) throw new Error("Tanggal mulai sakit belum diisi.");
  } else if (skema.momen === "askout") {
    /* Ask Out: tidak ada angka berulang (bukan umur/tahun jadian).
       Angka pribadinya justru tanggal & jam ajakan itu sendiri —
       dipakai mesin tema untuk jam menara dan tiga pilihan malam.
       Titik temu opsional: tidak semua ajakan punya tempat jemput. */
    isi.tanggalAjak = tanggalSah(p.tanggalAjak);
    isi.jamAjak = jamSah(p.jamAjak);
    isi.titikTemu = teks(p.titikTemu, BATAS.titikTemu);
    if (!isi.tanggalAjak) throw new Error("Tanggal ajakannya belum diisi.");
    if (!isi.jamAjak) throw new Error("Jam ajakannya belum diisi.");
  } else if (skema.momen === "lovenote" || skema.momen === "proposal") {
    /* Love Note: tidak butuh tanggal atau angka apa pun — surat sayang
       yang bisa dikirim hari apa saja. Hanya nama, foto, surat, dan isian
       khas temanya. */
  } else if (skema.momen === "confess") {
    /* Confess sengaja TIDAK punya isian dasar tambahan — tidak ada
       tanggal atau angka berulang yang masuk akal untuk satu
       pengakuan (beda dari birthday/anniversary/graduation yang
       semuanya berulang tahunan). Hanya nama, foto, surat, dan pesan
       rahasia di bawah. */
  } else {
    isi.ucapan = UCAPAN_SAH.includes(p.ucapan) ? p.ucapan : "selamat";
    isi.tanggalLahir = tanggalSah(p.tanggalLahir);
    isi.sembunyikanUmur = !!p.sembunyikanUmur;
    if (!isi.tanggalLahir) throw new Error("Tanggal lahir belum diisi.");
  }

  /* ── isian khas tema ──
     waPengirim dipakai semua tema untuk tombol balas WhatsApp
     penerima di penutup. Diisi dari nomor WA pembeli (kolom
     "whatsapp" di pesanan) — pembeli hampir selalu juga pengirimnya
     sendiri. */
  if (tema === "kado-riang") {
    isi.kupon = [0, 1, 2].map(i => teks((p.kupon || [])[i], BATAS.kupon));
    if (!isi.kupon[0] || !isi.kupon[1] || !isi.kupon[2]) throw new Error("Ketiga kupon belum diisi.");
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "langit-harapan") {
    isi.kuis = [0, 1, 2].map(i => {
      const q = (p.kuis || [])[i] || {};
      return {
        tanya: teks(q.tanya, BATAS.kuisTanya),
        pilihan: [0, 1, 2].map(j => teks((q.pilihan || [])[j], BATAS.kuisPilihan)),
        benar: [0, 1, 2].includes(+q.benar) ? +q.benar : 0
      };
    });
    if (isi.kuis.some(q => !q.tanya || !q.pilihan[0] || !q.pilihan[1] || !q.pilihan[2]))
      throw new Error("Kuis belum lengkap — tiap soal perlu pertanyaan dan 3 pilihan.");
    isi.harapan = [0, 1, 2].map(i => teks((p.harapan || [])[i], BATAS.harapan));
    if (!isi.harapan[0] || !isi.harapan[1] || !isi.harapan[2]) throw new Error("Ketiga harapan belum diisi.");
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "getwell-365") {
    /* "36,5": tiap dosis punya teks + aturan pakainya, dibuka dari sekat
       kotak obat. `enakan` = 3 hal yang bikin penerima enakan, disusun
       jadi rutinitas malam. `airPesan` = tulisan di dasar gelas.
       `rahasia` = notifikasi di ponsel saat lampunya dimatikan. */
    isi.dosis = [0, 1, 2].map(i => {
      const d = (p.dosis || [])[i] || {};
      return {
        teks: teks(d.teks, BATAS.dosis),
        aturan: teks(d.aturan, BATAS.aturanDosis)
      };
    });
    if (isi.dosis.some(d => !d.teks)) throw new Error("Ketiga dosisnya belum diisi.");
    isi.enakan = [0, 1, 2].map(i => teks((p.enakan || [])[i], BATAS.enakan));
    if (isi.enakan.some(x => !x)) throw new Error("Ketiga hal yang bikin enakan belum diisi.");
    isi.airPesan = teks(p.airPesan, BATAS.airPesan);
    isi.rahasia = teks(p.rahasia, BATAS.rahasia);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "pasar-malam") {
    /* "Pasar Malam": `kegiatan` jadi label di leher empat botol lempar
       gelang (yang meleset berdiri lagi di kios pancing), `alasan` jadi
       tiga lapis gula kapas, `catatanTunda` jadi kalimat untuk pilihan
       "kapan pun kamu siap" di papan lampu. */
    isi.kegiatan = [0, 1, 2, 3].map(i => teks((p.kegiatan || [])[i], BATAS.kegiatan));
    if (isi.kegiatan.some(k => !k)) throw new Error("Keempat rencana di botolnya belum diisi.");
    isi.alasan = [0, 1, 2].map(i => teks((p.alasan || [])[i], BATAS.alasan));
    if (isi.alasan.some(a => !a)) throw new Error("Ketiga alasannya belum diisi.");
    isi.catatanTunda = teks(p.catatanTunda, BATAS.catatanTunda);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "zona-waktu") {
    /* "Dua Jendela" (menggantikan Zona Waktu lama, id tetap): `rutinitas`
       = 3 kebiasaan harian pengirim dengan jam di KOTANYA — dipakai kuis
       "jam segini aku lagi apa" & game samakan jadwal, jadi jamnya wajib
       jam sungguhan. `oleh` = isi paket 3 lapis. `tanggalKetemu`
       opsional (hitung mundur di penutup). */
    isi.rutinitas = [0, 1, 2].map(i => {
      const r = (p.rutinitas || [])[i] || {};
      return { jam: jamSah(r.jam), kegiatan: teks(r.kegiatan, BATAS.kegiatanRut) };
    });
    isi.rutinitas.forEach((r, i) => {
      if (!r.jam) throw new Error("Jam rutinitas " + (i + 1) + " belum diisi.");
      if (!r.kegiatan) throw new Error("Kegiatan rutinitas " + (i + 1) + " belum diisi.");
    });
    isi.oleh = [0, 1, 2].map(i => teks((p.oleh || [])[i], BATAS.oleh));
    if (isi.oleh.some(o => !o)) throw new Error("Ketiga isi paketnya belum diisi.");
    isi.tanggalKetemu = tanggalSah(p.tanggalKetemu);
    isi.penutup = teks(p.penutup, BATAS.penutup);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "rekonstruksi") {
    /* "Rekonstruksi Hari Pertama": empat kejadian di hari pertama —
       tempat (jadi nama bangunan di sketsa), jam (jadi jawaban game garis
       waktu & urutan pemutaran ulang, jadi WAJIB jam sungguhan), dan
       cerita singkat. `karakterPenerima`/`karakterPengirim` = tampilan
       dua sosok "dulu"; nilai asing jatuh ke bawaan. */
    isi.karakterPenerima = KARAKTER_SAH.includes(p.karakterPenerima) ? p.karakterPenerima : "perempuan";
    isi.karakterPengirim = KARAKTER_SAH.includes(p.karakterPengirim) ? p.karakterPengirim : "laki";
    isi.kejadian = [0, 1, 2, 3].map(i => {
      const k = (p.kejadian || [])[i] || {};
      return { tempat: teks(k.tempat, BATAS.tempatKj), jam: jamSah(k.jam), cerita: teks(k.cerita, BATAS.ceritaKj) };
    });
    isi.kejadian.forEach((k, i) => {
      if (!k.tempat) throw new Error("Tempat kejadian " + (i + 1) + " belum diisi.");
      if (!k.jam) throw new Error("Jam kejadian " + (i + 1) + " belum diisi.");
      if (!k.cerita) throw new Error("Cerita kejadian " + (i + 1) + " belum diisi.");
    });
    isi.penutup = teks(p.penutup, BATAS.penutup);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "rumah-contoh") {
    /* "Rumah Contoh": `janji` = satu janji per ruangan (teras, ruang tamu,
       dapur, halaman belakang); kamar membawa surat & kotak cincin.
       `penutup` = kalimat di bawah pertanyaan lamaran, opsional. */
    isi.janji = [0, 1, 2, 3].map(i => teks((p.janji || [])[i], BATAS.janji));
    if (isi.janji.some(j => !j)) throw new Error("Keempat janji untuk tiap ruangan belum diisi.");
    isi.penutup = teks(p.penutup, BATAS.penutup);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "confess-kunang") {
    /* "Toples Kunang-Kunang": `kunang` = tiga hal kecil yang pengirim
       simpan tentang penerima, satu per kunang-kunang yang ditampung
       (game 1); `sejak` = sejak kapan suka, tersusun dari pasangan nyala
       (game 2); `rahasia` = kalimat penutup, opsional. */
    isi.kunang = [0, 1, 2].map(i => teks((p.kunang || [])[i], BATAS.kunangKu));
    if (isi.kunang.some(k => !k)) throw new Error("Ketiga hal kecil untuk kunang-kunangnya belum diisi.");
    isi.sejak = teks(p.sejak, BATAS.sejak);
    if (!isi.sejak) throw new Error("Sejak kapan kamu suka dia belum diisi.");
    isi.rahasia = teks(p.rahasia, BATAS.rahasia);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "kasus-pengirim") {
    /* "Kasus Pengirim Tanpa Nama": `catatan` = kertas tanpa nama di meja
       langganan (bukti 1), `pesanan` = kebiasaan pesanan si pengirim yang
       diceritakan barista (bukti 2), `tahu` = tulisan di balik foto, satu
       hal yang cuma pengirim tahu tentang penerima (bukti penentu).
       `karakter` = tampilan detektifnya; di luar daftar jatuh ke
       perempuan. Inisial di kertas dihitung mesin tema dari nama
       pengirim, jadi tidak perlu diisi. */
    isi.karakter = KARAKTER_SAH.includes(p.karakter) ? p.karakter : "perempuan";
    isi.catatan = teks(p.catatan, BATAS.catatan);
    if (!isi.catatan) throw new Error("Isi kertas tanpa namanya belum diisi.");
    isi.pesanan = teks(p.pesanan, BATAS.pesanan);
    if (!isi.pesanan) throw new Error("Pesanan langgananmu belum diisi.");
    isi.tahu = teks(p.tahu, BATAS.tahu);
    if (!isi.tahu) throw new Error("Hal kecil yang cuma kamu tahu belum diisi.");
    isi.penutup = teks(p.penutup, BATAS.penutup);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else if (tema === "lewat-duluan") {
    /* "Dia Lewat Sini Duluan": `kebiasaan` = tulisan di rak mug dapur,
       `kangen` = tiga kertas di tas yang menyisakan kursi halte,
       `barang` = tiga barang kesukaan penerima di rak minimarket (game),
       `penutup` = kalimat terakhir saat lampu jalan menyala. */
    isi.kebiasaan = teks(p.kebiasaan, BATAS.kebiasaan);
    if (!isi.kebiasaan) throw new Error("Kebiasaan kecilnya belum diisi.");
    isi.kangen = [0, 1, 2].map(i => teks((p.kangen || [])[i], BATAS.kangen));
    if (isi.kangen.some(k => !k)) throw new Error("Ketiga hal yang kamu kangenin belum diisi.");
    isi.barang = [0, 1, 2].map(i => teks((p.barang || [])[i], BATAS.barang));
    if (isi.barang.some(b => !b)) throw new Error("Ketiga barang kesukaannya belum diisi.");
    isi.penutup = teks(p.penutup, BATAS.penutup);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  } else {
    /* bait, peta-perjalanan & graduation-benih: satu pesan rahasia,
       diungkap di balik lapisan interaktif tema masing-masing. */
    isi.rahasia = teks(p.rahasia, BATAS.rahasia);
    isi.waPengirim = teks(badan.whatsapp, BATAS.whatsapp);
  }

  const nfoto = skema.nfoto;
  const fotoLama = (lamaIsi && lamaIsi.foto) || [];
  const masuk = Array.isArray(badan.foto) ? badan.foto : [];

  for (let i = 0; i < nfoto; i++) {
    const f = masuk[i] || {};
    const caption = teks(f.caption, BATAS.caption);
    if (f.data && String(f.data).length > 32) {
      const mime = /^image\/(png|webp|jpeg)$/.test(f.mime || "") ? f.mime : "image/jpeg";
      isi.foto.push({ src: await simpanFoto(env, kode, i + 1, f.data, mime), caption });
    } else if (fotoLama[i] && fotoLama[i].src) {
      isi.foto.push({ src: fotoLama[i].src, caption });
    }
  }
  if (isi.foto.length < 1) throw new Error("Minimal satu foto harus diunggah.");
  isi.lagu = await rapikanLagu(env, kode, p.lagu, lamaIsi && lamaIsi.lagu);
  const kunci = rapikanKunci(p.kunci, lamaIsi && lamaIsi.kunci);
  if (kunci) isi.kunci = kunci;
  return isi;
}

/* ══════════════════ email ══════════════════ */

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function badanEmail(o) {
  const tautan = o.asal + "/s/" + o.kode;
  const edit = o.asal + "/edit/" + o.token;
  return `<!doctype html><html lang="id"><body style="margin:0;background:#FAF3E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1B1B2F">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A8598;margin-bottom:24px">Foreverse</div>
  <p style="margin:0 0 14px;font-size:15px;color:#4E4A5E">Hai, Forevers!</p>
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">Suratmu sudah jadi.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#4E4A5E">
      Surat untuk <strong>${esc(o.penerima)}</strong> sudah aktif. Tinggal kirim tautan di bawah ini ke dia.
      Suratnya bisa dibuka selama ${BULAN_SIMPAN} bulan; kami ingatkan lewat email ${HARI_PENGINGAT} hari sebelum masanya habis, dan kamu bisa <a href="${esc(o.asal + "/perpanjang/" + o.token)}" style="color:#3B3168">memperpanjangnya kapan saja</a>.
    </p>
    <a href="${esc(tautan)}" style="display:block;background:#E8734A;color:#fff;text-decoration:none;text-align:center;padding:14px 18px;border-radius:12px;font-weight:600;font-size:15px">Buka suratnya</a>
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#8A8598;word-break:break-all">${esc(tautan)}</p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6"><a href="${esc(o.asal + "/selesai?kode=" + o.kode + "#qr")}" style="color:#3B3168">Buat kode QR berbentuk hati atau amplop</a> untuk dikirim bersama tautannya.</p>
  </div>

  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:22px 24px;margin-top:14px">
    <h2 style="margin:0 0 8px;font-size:15px;font-weight:600">Mau mengubah isinya?</h2>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4E4A5E">
      Tautan di bawah ini khusus untukmu, berlaku ${HARI_EDIT} hari dan boleh dipakai berkali-kali.
      Jangan dikirim ke dia, ya.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;word-break:break-all"><a href="${esc(edit)}" style="color:#3B3168">${esc(edit)}</a></p>
  </div>

  <p style="margin:22px 2px 0;font-size:12.5px;line-height:1.7;color:#8A8598">
    Kode pesanan <strong>${esc(o.kode)}</strong>. Ada kendala? Balas email ini atau hubungi kami lewat WhatsApp.
  </p>
</div></body></html>`;
}

async function kirimEmail(env, o) {
  if (!env.RESEND_API_KEY || !o.email) return { ok: false, pesan: "Email tidak dikirim." };
  const dari = env.EMAIL_PENGIRIM || "halo@foreverse.id";
  const r = await kirimResend(env, {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Foreverse <" + dari + ">",
      to: [o.email],
      reply_to: dari,
      subject: "Suratmu untuk " + o.penerima + " sudah jadi",
      html: badanEmail(o)
    })
  });
  if (!r.ok) return { ok: false, pesan: "Resend menolak: " + (await r.text()).slice(0, 200) };
  return { ok: true };
}

async function kirimEmailKode(env, db, kode, asal) {
  const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
  if (!b) return { ok: false, pesan: "Pesanan tidak ditemukan." };
  const isi = JSON.parse(b.isi || "{}");
  const hasil = await kirimEmail(env, {
    email: b.email, kode: b.kode, token: b.token, penerima: isi.penerima || "", asal
  });
  if (hasil.ok) await db.prepare(`UPDATE pesanan SET email_terkirim=1 WHERE kode=?`).bind(kode).run();
  else if (b.email) await catatKejadian(env, db, "email gagal", hasil.pesan, kode);
  return hasil;
}

/* Kabar ke pembeli saat suratnya pertama kali dibuka — dikirim sekali saja. */
async function kirimEmailDibuka(env, b, asal) {
  if (!env.RESEND_API_KEY || !b.email) return;
  const isi = JSON.parse(b.isi || "{}");
  const dari = env.EMAIL_PENGIRIM || "halo@foreverse.id";
  await kirimResend(env, {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Foreverse <" + dari + ">", to: [b.email], reply_to: dari,
      subject: "Suratmu untuk " + (isi.penerima || "dia") + " sudah dibuka",
      html: `<!doctype html><html lang="id"><body style="margin:0;background:#FAF3E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1B1B2F">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A8598;margin-bottom:24px">Foreverse</div>
  <p style="margin:0 0 14px;font-size:15px;color:#4E4A5E">Hai, Forevers!</p>
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">Suratmu sudah sampai.</h1>
    <p style="margin:0;font-size:15px;line-height:1.65;color:#4E4A5E">
      Surat untuk <strong>${esc(isi.penerima || "")}</strong> baru saja dibuka untuk pertama kalinya.
    </p>
  </div>
  <p style="margin:22px 2px 0;font-size:12.5px;line-height:1.7;color:#8A8598">Kode pesanan <strong>${esc(b.kode)}</strong>.</p>
</div></body></html>`
    })
  }).catch(() => {});
}

/* ══════════════════ pelunasan ══════════════════ */

async function lunasi(env, db, kode, asal) {
  const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
  if (!b || b.status === "lunas") return;
  const skr = Date.now();
  await db.prepare(`UPDATE pesanan SET status='lunas', dibayar=?, batas_edit=?, simpan_sampai=? WHERE kode=?`)
    .bind(skr, skr + HARI_EDIT * 86400000, tambahBulan(skr, BULAN_SIMPAN), kode).run();
  if (b.promo) await db.prepare(`UPDATE promo SET terpakai=terpakai+1 WHERE kode=?`).bind(b.promo).run();
  await kirimEmailKode(env, db, kode, asal);
}

/* ══════════════════ masa simpan ══════════════════ */

function tambahBulan(ms, n) { const d = new Date(ms); d.setUTCMonth(d.getUTCMonth() + n); return d.getTime(); }
function tglPanjang(ms) {
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
}

/* Dijalankan sekali sehari oleh Cron Trigger (lihat worker.js & wrangler.jsonc):
   1. email pengingat ke pembeli 14 hari sebelum masa simpan habis — sekali saja;
   2. surat yang masa simpannya habis: foto & lagu dihapus, isi dan kontak dikosongkan,
      tautan dinonaktifkan. Yang tersisa hanya catatan transaksi (kode, tema, jumlah, tanggal).
   Pesanan lunas sebelum aturan ini dibuat (simpan_sampai masih kosong) ikut
   diberi masa simpan: BULAN_SIMPAN bulan sejak tanggal bayarnya, paling cepat 30 hari
   dari sekarang supaya pembelinya tetap sempat menerima pengingat. */
export async function rawatHarian(env) {
  if (!env.DB) return { ok: false };
  const db = env.DB;
  await siapkan(db);
  await bersihkan(db, env);
  const skr = Date.now();
  let diingatkan = 0, dihapus = 0;

  /* aturan masa simpan diperpendek (6 → 2 bulan, 31-10-2026): pesanan yang
     belum pernah diperpanjang ikut aturan baru, tetap minimal 30 hari dari sekarang */
  const kepanjangan = await db.prepare(`SELECT kode,dibayar,dibuat,simpan_sampai FROM pesanan
    WHERE status='lunas' AND simpan_sampai IS NOT NULL AND COALESCE(n_panjang,0)=0`).all();
  for (const b of (kepanjangan.results || [])) {
    const seharusnya = Math.max(tambahBulan(b.dibayar || b.dibuat || skr, BULAN_SIMPAN), skr + 30 * 86400000);
    if (b.simpan_sampai > seharusnya + 86400000)
      await db.prepare(`UPDATE pesanan SET simpan_sampai=? WHERE kode=?`).bind(seharusnya, b.kode).run();
  }
  const lama = await db.prepare(`SELECT kode,dibayar,dibuat FROM pesanan
    WHERE status='lunas' AND simpan_sampai IS NULL`).all();
  for (const b of (lama.results || [])) {
    const sampai = Math.max(tambahBulan(b.dibayar || b.dibuat || skr, BULAN_SIMPAN), skr + 30 * 86400000);
    await db.prepare(`UPDATE pesanan SET simpan_sampai=? WHERE kode=?`).bind(sampai, b.kode).run();
  }

  const atur = await bacaPengaturan(db);
  const ingat = await db.prepare(`SELECT kode,token,email,isi,simpan_sampai FROM pesanan
    WHERE status='lunas' AND aktif=1 AND pengingat IS NULL AND simpan_sampai IS NOT NULL
      AND simpan_sampai > ? AND simpan_sampai <= ?`).bind(skr, skr + HARI_PENGINGAT * 86400000).all();
  for (const b of (ingat.results || [])) {
    if (env.RESEND_API_KEY && b.email) {
      const isi = JSON.parse(b.isi || "{}");
      const dari = env.EMAIL_PENGIRIM || "halo@foreverse.id";
      const r = await kirimResend(env, {
        method: "POST",
        headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          from: "Foreverse <" + dari + ">", to: [b.email], reply_to: dari,
          subject: "Surat untuk " + (isi.penerima || "dia") + " disimpan sampai " + tglPanjang(b.simpan_sampai),
          html: `<!doctype html><html lang="id"><body style="margin:0;background:#FAF3E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1B1B2F">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A8598;margin-bottom:24px">Foreverse</div>
  <p style="margin:0 0 14px;font-size:15px;color:#4E4A5E">Hai, Forevers!</p>
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">Simpan kenangannya, ya.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4E4A5E">
      Surat untuk <strong>${esc(isi.penerima || "")}</strong> masih bisa dibuka sampai <strong>${esc(tglPanjang(b.simpan_sampai))}</strong>.
      Setelah itu foto dan isinya kami hapus untuk menjaga privasi kalian.
    </p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#4E4A5E">Kalau ada foto atau kalimat yang ingin kamu simpan, buka suratnya dan simpan sekarang.</p>
    <a href="https://foreverse.id/s/${esc(b.kode)}?pratinjau=1" style="display:block;background:#E8734A;color:#fff;text-decoration:none;text-align:center;padding:14px 18px;border-radius:12px;font-weight:600;font-size:15px">Buka suratnya</a>
    ${b.token ? `<a href="https://foreverse.id/perpanjang/${esc(b.token)}" style="display:block;margin-top:10px;border:1.5px solid #3B3168;color:#3B3168;text-decoration:none;text-align:center;padding:12px 18px;border-radius:12px;font-weight:600;font-size:15px">Perpanjang ${BULAN_PERPANJANG} bulan · Rp${atur.hargaPerpanjang.toLocaleString("id-ID")}</a>` : ""}
  </div>
  <p style="margin:22px 2px 0;font-size:12.5px;line-height:1.7;color:#8A8598">Kode pesanan <strong>${esc(b.kode)}</strong>.</p>
</div></body></html>`
        })
      }).catch(() => null);
      if (!r || !r.ok) { await catatKejadian(env, db, "email pengingat gagal", r ? String(r.status) : "jaringan", b.kode); continue; }
    }
    await db.prepare(`UPDATE pesanan SET pengingat=? WHERE kode=?`).bind(skr, b.kode).run();
    diingatkan++;
  }

  const habis = await db.prepare(`SELECT kode FROM pesanan WHERE status IN ('lunas','refund')
    AND simpan_sampai IS NOT NULL AND simpan_sampai <= ? AND isi != '{}'`).bind(skr).all();
  for (const b of (habis.results || [])) {
    await hapusFoto(env, db, b.kode);
    await db.prepare(`UPDATE pesanan SET isi='{}', email='', whatsapp='', token=NULL, aktif=0 WHERE kode=?`).bind(b.kode).run();
    dihapus++;
  }
  const ingatMomen = await kirimPengingatJatuhTempo(env, db);
  let cadangan = null;
  try { cadangan = await cadangkanHarian(env, db); }
  catch (e) { await catatKejadian(env, db, "cadangan harian gagal", e && e.message, ""); }
  return { ok: true, diingatkan, dihapus, ingatMomen, cadangan };
}

/* ══════════════════ "Ingetin aku" ══════════════════ */
const HARI_SEBELUM_INGAT = 7;
const NAMA_BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function tanggalIngat(isi) {
  if (isi.tanggalLahir) return { jenis: "ultah", tgl: isi.tanggalLahir };
  if (isi.tanggalMulai) return { jenis: "jadian", tgl: isi.tanggalMulai };
  return null;
}
/* hari ini menurut WIB, sebagai Date UTC tengah malam */
function hariIniWib() { const d = new Date(Date.now() + 7 * 3600000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
function berikutnya(bulan, hari, dari) {
  const y0 = new Date(dari).getUTCFullYear();
  for (const y of [y0, y0 + 1]) {
    const kabisat = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const h = bulan === 2 && hari === 29 && !kabisat ? 28 : hari;
    const t = Date.UTC(y, bulan - 1, h);
    if (t >= dari) return t;
  }
}
function judulIngat(r) {
  return r.jenis === "ultah" ? "Ulang tahun " + (r.nama || "dia") : "Hari jadi kalian";
}
async function kirimEmailIngat(env, r, asal, konfirmasi) {
  if (!env.RESEND_API_KEY || !r.email) return false;
  const dari = env.EMAIL_PENGIRIM || "halo@foreverse.id";
  const tgl = r.hari + " " + NAMA_BULAN[r.bulan - 1];
  const batal = asal + "/api/ingat/batal?id=" + r.id;
  const momen = r.jenis === "ultah" ? "Birthday" : "Anniversary";
  const judul = konfirmasi
    ? "Siap, kami ingatkan menjelang " + judulIngat(r).toLowerCase().replace(/^ulang/, "ulang")
    : judulIngat(r) + " tinggal " + HARI_SEBELUM_INGAT + " hari lagi";
  const isi = konfirmasi
    ? `Kami akan mengirim satu email ${HARI_SEBELUM_INGAT} hari sebelum <strong>${esc(tgl)}</strong>, supaya kamu sempat menyiapkan sesuatu. Hanya itu — tidak ada promosi lain.`
    : `<strong>${esc(tgl)}</strong> sebentar lagi. Mau menyiapkan surat baru untuknya? Masih ada waktu untuk menulis pelan-pelan.`;
  const r2 = await kirimResend(env, {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      from: "Foreverse <" + dari + ">", to: [r.email], reply_to: dari, subject: judul,
      html: `<!doctype html><html lang="id"><body style="margin:0;background:#FAF3E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1B1B2F">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A8598;margin-bottom:24px">Foreverse</div>
  <p style="margin:0 0 14px;font-size:15px;color:#4E4A5E">Hai, Forevers!</p>
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">${esc(judul)}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#4E4A5E">${isi}</p>
    ${konfirmasi ? "" : `<a href="${esc(asal + "/template?momen=" + momen)}" style="display:block;background:#E8734A;color:#fff;text-decoration:none;text-align:center;padding:14px 18px;border-radius:12px;font-weight:600;font-size:15px">Lihat tema ${momen}</a>`}
  </div>
  <p style="margin:22px 2px 0;font-size:12.5px;line-height:1.7;color:#8A8598">Tidak mau diingatkan? <a href="${esc(batal)}" style="color:#8A8598">Hapus pengingat ini</a> — tanggal dan namanya langsung kami hapus.</p>
</div></body></html>`
    })
  }).catch(() => null);
  return !!(r2 && r2.ok);
}
async function kirimPengingatJatuhTempo(env, db) {
  const hariIni = hariIniWib();
  const semua = await db.prepare(`SELECT * FROM pengingat`).all();
  let n = 0;
  for (const r of (semua.results || [])) {
    const t = berikutnya(r.bulan, r.hari, hariIni);
    if (Math.round((t - hariIni) / 86400000) !== HARI_SEBELUM_INGAT) continue;
    if (await kirimEmailIngat(env, r, "https://foreverse.id", false)) {
      await db.prepare(`DELETE FROM pengingat WHERE id=?`).bind(r.id).run();
      n++;
    } else await catatKejadian(env, db, "email pengingat momen gagal", r.jenis, r.kode);
  }
  return n;
}

/* ══════════════════ pengaturan dari /developer ══════════════════ */
const HARGA_PERPANJANG = 5000;      // bawaan; bisa diubah di /developer
const BULAN_PERPANJANG = 2;
async function bacaPengaturan(db) {
  const r = await db.prepare(`SELECT kunci,nilai FROM pengaturan`).all();
  const m = {};
  for (const x of (r.results || [])) m[x.kunci] = x.nilai;
  let mati = [];
  try { mati = JSON.parse(m.tema_mati || "[]").filter(t => TEMA_SKEMA[t]); } catch (_) {}
  return {
    harga: Number(m.harga) > 0 ? Number(m.harga) : HARGA,
    hargaPerpanjang: Number(m.harga_perpanjang) > 0 ? Number(m.harga_perpanjang) : HARGA_PERPANJANG,
    temaMati: mati,
    tutup: m.tutup || ""                 // kosong = buka; berisi pesan = pesanan baru ditutup sementara
  };
}
async function simpanPengaturan(db, kunci, nilai) {
  await db.prepare(`INSERT OR REPLACE INTO pengaturan(kunci,nilai) VALUES(?,?)`).bind(kunci, String(nilai)).run();
}

/* ══════════════════ kode promo ══════════════════ */
const MIN_SETELAH_PROMO = 1000;      // DOKU perlu nominal; promo tidak bisa menggratiskan
function normalKodePromo(k) { return String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20); }
async function hitungPromo(db, kode, harga) {
  const k = normalKodePromo(kode);
  if (!k) return { ok: true, kode: "", potongan: 0, harga };
  const p = await db.prepare(`SELECT * FROM promo WHERE kode=?`).bind(k).first();
  if (!p || !p.aktif) return { ok: false, pesan: "Kode promo tidak dikenal." };
  if (p.sampai && Date.now() > p.sampai) return { ok: false, pesan: "Kode promo ini sudah berakhir." };
  if (p.kuota && p.terpakai >= p.kuota) return { ok: false, pesan: "Kuota kode promo ini sudah habis." };
  let pot = p.jenis === "persen" ? Math.round(harga * Math.min(100, p.nilai) / 100) : p.nilai;
  pot = Math.max(0, Math.min(pot, harga - MIN_SETELAH_PROMO));
  return { ok: true, kode: k, potongan: pot, harga: harga - pot };
}

/* ══════════════════ cadangan data ══════════════════
   Salinan JSON seluruh data penting (pesanan non-draf, pengingat, promo,
   pengaturan, perpanjangan, kunjungan 90 hari). Dibuat tiap hari ke R2
   (cadangan/YYYY-MM-DD.json, disimpan 30 hari) dan bisa diunduh dari
   /developer. Foto & lagu tidak disalin ulang — sudah tersimpan di R2,
   dan alamatnya ada di dalam isi tiap pesanan. */
const HARI_CADANGAN = 30;
async function buatCadangan(db) {
  const ambil = async (sql, ...a) => ((await db.prepare(sql).bind(...a).all()).results || []);
  return {
    dibuat: new Date().toISOString(),
    versi: 1,
    pesanan: await ambil(`SELECT * FROM pesanan WHERE status!='draf'`),
    pengingat: await ambil(`SELECT * FROM pengingat`),
    promo: await ambil(`SELECT * FROM promo`),
    pengaturan: await ambil(`SELECT * FROM pengaturan`),
    perpanjangan: await ambil(`SELECT * FROM perpanjangan`),
    kunjungan: await ambil(`SELECT * FROM kunjungan WHERE hari >= ?`,
      new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10))
  };
}
async function cadangkanHarian(env, db) {
  if (!env.FOTO) return null;
  const data = await buatCadangan(db);
  const nama = "cadangan/" + new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10) + ".json";
  await env.FOTO.put(nama, JSON.stringify(data), { httpMetadata: { contentType: "application/json" } });
  const batas = new Date(Date.now() + 7 * 3600000 - HARI_CADANGAN * 86400000).toISOString().slice(0, 10);
  const daftar = await env.FOTO.list({ prefix: "cadangan/" });
  for (const o of (daftar.objects || [])) if (o.key.slice(9, 19) < batas) await env.FOTO.delete(o.key);
  return { nama, pesanan: data.pesanan.length };
}

/* ══════════════════ perpanjangan masa simpan ══════════════════ */
async function lunasiPerpanjangan(env, db, orderId) {
  const row = await db.prepare(`SELECT * FROM perpanjangan WHERE order_id=?`).bind(orderId).first();
  if (!row || row.status === "lunas") return;
  const b = await db.prepare(`SELECT kode,email,isi,simpan_sampai FROM pesanan WHERE kode=?`).bind(row.kode).first();
  if (!b) return;
  const dasar = Math.max(Number(b.simpan_sampai) || 0, Date.now());
  const baru = tambahBulan(dasar, BULAN_PERPANJANG);
  await db.batch([
    db.prepare(`UPDATE perpanjangan SET status='lunas', dibayar=? WHERE order_id=?`).bind(Date.now(), orderId),
    db.prepare(`UPDATE pesanan SET simpan_sampai=?, pengingat=NULL, n_panjang=COALESCE(n_panjang,0)+1, aktif=1 WHERE kode=?`).bind(baru, row.kode)
  ]);
  if (env.RESEND_API_KEY && b.email) {
    const isi = JSON.parse(b.isi || "{}");
    const dari = env.EMAIL_PENGIRIM || "halo@foreverse.id";
    await kirimResend(env, {
      method: "POST",
      headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Foreverse <" + dari + ">", to: [b.email], reply_to: dari,
        subject: "Surat untuk " + (isi.penerima || "dia") + " diperpanjang sampai " + tglPanjang(baru),
        html: `<!doctype html><html lang="id"><body style="margin:0;background:#FAF3E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1B1B2F">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
  <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8A8598;margin-bottom:24px">Foreverse</div>
  <p style="margin:0 0 14px;font-size:15px;color:#4E4A5E">Hai, Forevers!</p>
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">Masa simpannya sudah diperpanjang.</h1>
    <p style="margin:0;font-size:15px;line-height:1.65;color:#4E4A5E">Surat untuk <strong>${esc(isi.penerima || "")}</strong> sekarang bisa dibuka sampai <strong>${esc(tglPanjang(baru))}</strong>, di tautan yang sama. Kami ingatkan lagi 14 hari sebelum masanya habis.</p>
  </div>
  <p style="margin:22px 2px 0;font-size:12.5px;line-height:1.7;color:#8A8598">Kode pesanan <strong>${esc(b.kode)}</strong>.</p>
</div></body></html>`
      })
    }).catch(() => {});
  }
}

/* ══════════════════ pekerjaan rutin tiap 15 menit ══════════════════
   Jaring pengaman kalau ada yang luput:
   1. pembayaran yang notifikasinya tidak sampai → tanya DOKU, lunasi;
   2. perpanjangan yang notifikasinya tidak sampai → sama;
   3. email tautan yang gagal terkirim → coba kirim ulang (maks. 3 hari). */
export async function rawatSering(env) {
  if (!env.DB) return { ok: false };
  const db = env.DB;
  await siapkan(db);
  const asal = env.ASAL_SITUS || "https://foreverse.id";
  const skr = Date.now();
  const hasil = { lunas: 0, perpanjang: 0, email: 0 };
  if (env.DOKU_CLIENT_ID && env.DOKU_SECRET_KEY) {
    const tunggu = await db.prepare(`SELECT kode,order_id,jumlah FROM pesanan
      WHERE status='draf' AND order_id IS NOT NULL AND dibuat > ? ORDER BY dibuat DESC LIMIT 20`).bind(skr - 24 * 3600000).all();
    for (const b of (tunggu.results || [])) {
      const r = await panggilDoku(env, { metode: "GET", sasaran: DOKU.jalurStatus + encodeURIComponent(b.order_id) });
      const t = (r.isi && r.isi.transaction) || {}, o = (r.isi && r.isi.order) || {};
      if (t.status === "SUCCESS" && Number(o.amount) === (Number(b.jumlah) || HARGA) + BIAYA_TRANSAKSI) {
        await lunasi(env, db, b.kode, asal); hasil.lunas++;
      }
    }
    const pj = await db.prepare(`SELECT order_id,jumlah FROM perpanjangan WHERE status='menunggu' AND dibuat > ? LIMIT 20`).bind(skr - 24 * 3600000).all();
    for (const row of (pj.results || [])) {
      const r = await panggilDoku(env, { metode: "GET", sasaran: DOKU.jalurStatus + encodeURIComponent(row.order_id) });
      const t = (r.isi && r.isi.transaction) || {}, o = (r.isi && r.isi.order) || {};
      if (t.status === "SUCCESS" && Number(o.amount) === row.jumlah + BIAYA_TRANSAKSI) { await lunasiPerpanjangan(env, db, row.order_id); hasil.perpanjang++; }
    }
  }
  const gagal = await db.prepare(`SELECT kode FROM pesanan WHERE status='lunas' AND email_terkirim=0 AND COALESCE(email,'')!=''
    AND dibayar > ? LIMIT 10`).bind(skr - 3 * 86400000).all();
  for (const b of (gagal.results || [])) { const r = await kirimEmailKode(env, db, b.kode, asal); if (r.ok) hasil.email++; }
  return hasil;
}

/* ══════════════════ pulihkan dari cadangan ══════════════════
   Mode "cek": hanya menghitung. Mode "isi": menambahkan baris yang HILANG
   saja (yang sudah ada tidak disentuh). Mode "timpa": menimpa baris yang
   sama kuncinya dengan isi cadangan. Sebelum menulis apa pun, keadaan
   sekarang dicadangkan dulu ke R2 (cadangan/…-sebelum-pulih.json). */
const KUNCI_TABEL = {
  pesanan: ["kode"], pengingat: ["id"], promo: ["kode"], pengaturan: ["kunci"],
  perpanjangan: ["order_id"], kunjungan: ["hari", "tema", "jenis"]
};
async function pulihkan(env, db, data, mode) {
  if (!data || typeof data !== "object" || !Array.isArray(data.pesanan)) throw new Error("Berkas ini bukan cadangan Foreverse.");
  const laporan = {};
  if (mode !== "cek" && env.FOTO) {
    const nama = "cadangan/" + new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 19).replace(/:/g, "") + "-sebelum-pulih.json";
    await env.FOTO.put(nama, JSON.stringify(await buatCadangan(db)), { httpMetadata: { contentType: "application/json" } });
    laporan._cadanganSebelum = nama;
  }
  for (const [tabel, kunci] of Object.entries(KUNCI_TABEL)) {
    const baris = Array.isArray(data[tabel]) ? data[tabel] : [];
    const kolomAda = ((await db.prepare(`PRAGMA table_info(${tabel})`).all()).results || []).map(c => c.name);
    let baru = 0, sama = 0, ditulis = 0;
    for (const r of baris) {
      const where = kunci.map(k => k + "=?").join(" AND ");
      const ada = await db.prepare(`SELECT 1 FROM ${tabel} WHERE ${where}`).bind(...kunci.map(k => r[k])).first();
      if (ada) sama++; else baru++;
      if (mode === "cek" || (ada && mode !== "timpa")) continue;
      const kol = Object.keys(r).filter(k => kolomAda.includes(k));
      await db.prepare(`INSERT OR REPLACE INTO ${tabel}(${kol.join(",")}) VALUES(${kol.map(() => "?").join(",")})`)
        .bind(...kol.map(k => r[k] === undefined ? null : r[k])).run();
      ditulis++;
    }
    laporan[tabel] = { di_cadangan: baris.length, belum_ada: baru, sudah_ada: sama, ditulis };
  }
  return laporan;
}

/* ══════════════════ router ══════════════════ */

export async function onRequest(ctx) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const asal = url.origin;
  const jalur = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");

  if (!env.DB) return salah("Database belum tersambung. Di Cloudflare: Settings → Bindings → tambah D1 dengan nama DB.", 500);

  try {
    await siapkan(env.DB);
    const db = env.DB;
    /* Badan mentah disimpan karena Digest notifikasi DOKU dihitung
       dari teks aslinya, bukan dari hasil JSON.stringify ulang.    */
    const mentah = request.method === "POST" ? await request.text() : "";
    let badan = {};
    if (mentah) { try { badan = JSON.parse(mentah) || {}; } catch (_) { badan = {}; } }

    const namaLaju = jalur === "admin" ? "developer" : jalur;
    if (await lewatBatas(db, request, namaLaju))
      return salah("Terlalu banyak permintaan dalam waktu singkat. Coba lagi beberapa menit lagi, ya.", 429);

    /* ── cek kesehatan untuk pemantau (UptimeRobot dll.) ───────── */
    if (jalur === "sehat") {
      const cek = { d1: false, r2: false, doku: !!(env.DOKU_CLIENT_ID && env.DOKU_SECRET_KEY), email: !!env.RESEND_API_KEY };
      try { await db.prepare("SELECT 1").first(); cek.d1 = true; } catch (_) {}
      try { if (env.FOTO) { await env.FOTO.list({ limit: 1 }); cek.r2 = true; } } catch (_) {}
      const sehat = cek.d1 && cek.r2 && cek.doku && cek.email;
      return new Response(JSON.stringify({ ok: sehat, cek, waktu: new Date().toISOString() }),
        { status: sehat ? 200 : 503, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }

    /* ── info publik: harga & tema yang sedang dibuka ───────────── */
    if (jalur === "info") {
      const a = await bacaPengaturan(db);
      return new Response(JSON.stringify({ ok: true, harga: a.harga, biaya: BIAYA_TRANSAKSI, tema_mati: a.temaMati,
        harga_perpanjang: a.hargaPerpanjang, bulan_perpanjang: BULAN_PERPANJANG, tutup: a.tutup, staging: !!env.STAGING }),
        { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" } });
    }

    /* ── cek kode promo ─────────────────────────────────────────── */
    if (jalur === "promo" && request.method === "POST") {
      const a = await bacaPengaturan(db);
      const pr = await hitungPromo(db, badan.kode, a.harga);
      if (!pr.ok) return salah(pr.pesan, 400);
      return jwb({ ok: true, kode: pr.kode, potongan: pr.potongan, harga: pr.harga, biaya: BIAYA_TRANSAKSI, total: pr.harga + BIAYA_TRANSAKSI });
    }

    /* ── perpanjangan masa simpan (pemilik, lewat token edit) ──── */
    if (jalur === "perpanjang/info" || jalur === "perpanjang/status") {
      const token = teks(url.searchParams.get("token"), 30);
      const b = token && await db.prepare(`SELECT kode,isi,status,simpan_sampai,order_id FROM pesanan WHERE token=?`).bind(token).first();
      if (!b || b.status !== "lunas") return salah("Tautan perpanjangan tidak dikenal atau suratnya sudah dihapus.", 404);
      const a = await bacaPengaturan(db);
      let menunggu = await db.prepare(`SELECT order_id FROM perpanjangan WHERE kode=? AND status='menunggu' ORDER BY dibuat DESC LIMIT 1`).bind(b.kode).first();
      /* cadangan kalau notifikasi DOKU telat: tanya langsung */
      if (jalur === "perpanjang/status" && menunggu && env.DOKU_CLIENT_ID && env.DOKU_SECRET_KEY) {
        const r = await panggilDoku(env, { metode: "GET", sasaran: DOKU.jalurStatus + encodeURIComponent(menunggu.order_id) });
        const t = (r.isi && r.isi.transaction) || {}, o = (r.isi && r.isi.order) || {};
        const row = await db.prepare(`SELECT jumlah FROM perpanjangan WHERE order_id=?`).bind(menunggu.order_id).first();
        if (t.status === "SUCCESS" && row && Number(o.amount) === row.jumlah + BIAYA_TRANSAKSI) {
          await lunasiPerpanjangan(env, db, menunggu.order_id);
          menunggu = null;
        }
      }
      const kini = await db.prepare(`SELECT simpan_sampai FROM pesanan WHERE kode=?`).bind(b.kode).first();
      return jwb({ ok: true, kode: b.kode, penerima: JSON.parse(b.isi || "{}").penerima || "",
        simpan_sampai: kini.simpan_sampai, harga: a.hargaPerpanjang, biaya: BIAYA_TRANSAKSI, bulan: BULAN_PERPANJANG,
        menunggu: !!menunggu });
    }
    if (jalur === "perpanjang" && request.method === "POST") {
      if (!env.DOKU_CLIENT_ID || !env.DOKU_SECRET_KEY) return salah("Pembayaran belum siap.", 500);
      const token = teks(badan.token, 30);
      const b = token && await db.prepare(`SELECT kode,email,whatsapp,isi,status FROM pesanan WHERE token=?`).bind(token).first();
      if (!b || b.status !== "lunas") return salah("Tautan perpanjangan tidak dikenal atau suratnya sudah dihapus.", 404);
      const a = await bacaPengaturan(db);
      const orderId = "FP-" + b.kode + "-" + Date.now().toString(36);
      const isiP = JSON.parse(b.isi || "{}");
      const r = await panggilDoku(env, {
        metode: "POST", sasaran: DOKU.jalurCheckout,
        badan: {
          order: {
            amount: a.hargaPerpanjang + BIAYA_TRANSAKSI, invoice_number: orderId, currency: "IDR",
            callback_url: asal + "/perpanjang/" + token + "?bayar=1", auto_redirect: true,
            line_items: [
              { name: "Perpanjang masa simpan " + BULAN_PERPANJANG + " bulan", quantity: 1, price: a.hargaPerpanjang },
              { name: "Biaya transaksi", quantity: 1, price: BIAYA_TRANSAKSI }
            ]
          },
          payment: { payment_due_date: DOKU.jatuhTempoMenit, payment_method_types: DOKU.metode },
          customer: { name: (isiP.pengirim || "Pembeli").slice(0, 50), email: b.email || undefined, phone: b.whatsapp || undefined }
        }
      });
      const urlBayar = r.isi && r.isi.payment && r.isi.payment.url;
      if (!r.ok || !urlBayar) {
        const kabar = (r.asli && (r.asli.error_messages || r.asli.message)) || r.asli;
        await catatKejadian(env, db, "DOKU menolak pembayaran", "perpanjangan: " + JSON.stringify(kabar).slice(0, 250), b.kode);
        return salah("Pembayaran belum bisa dibuat. Coba lagi sebentar lagi, ya.", 502);
      }
      await db.prepare(`INSERT INTO perpanjangan(order_id,kode,jumlah,status,dibuat) VALUES(?,?,?,'menunggu',?)`)
        .bind(orderId, b.kode, a.hargaPerpanjang, Date.now()).run();
      return jwb({ ok: true, url: urlBayar, order_id: orderId });
    }

    /* ── "Ingetin aku": hanya pemilik (memegang token edit) ──────── */
    if (jalur === "ingat" && request.method === "POST") {
      const b = await db.prepare(`SELECT kode,token,email,isi,status FROM pesanan WHERE kode=?`).bind(teks(badan.kode, 16)).first();
      if (!b || b.status !== "lunas" || !b.token || !samaAman(teks(badan.token, 30), b.token)) return salah("Pesanan tidak dikenali.", 403);
      if (!b.email) return salah("Pesanan ini tidak punya email.", 400);
      const isi = JSON.parse(b.isi || "{}");
      const t = tanggalIngat(isi);
      if (!t) return salah("Surat ini tidak punya tanggal yang berulang tiap tahun.", 400);
      const [, bln, hr] = t.tgl.split("-").map(Number);
      const lama = await db.prepare(`SELECT id FROM pengingat WHERE kode=?`).bind(b.kode).first();
      const r = { id: (lama && lama.id) || acak(20), kode: b.kode, email: b.email,
        nama: t.jenis === "ultah" ? teks(isi.penerima, 30) : "", jenis: t.jenis, bulan: bln, hari: hr };
      await db.prepare(`INSERT OR REPLACE INTO pengingat(id,kode,email,nama,jenis,bulan,hari,dibuat) VALUES(?,?,?,?,?,?,?,?)`)
        .bind(r.id, r.kode, r.email, r.nama, r.jenis, r.bulan, r.hari, Date.now()).run();
      if (!lama) ctx.waitUntil(kirimEmailIngat(env, r, asal, true));
      return jwb({ ok: true, tanggal: hr + " " + NAMA_BULAN[bln - 1], jenis: t.jenis, hari_sebelum: HARI_SEBELUM_INGAT });
    }
    if (jalur === "ingat/batal") {
      const id = teks(url.searchParams.get("id"), 30);
      if (id) await db.prepare(`DELETE FROM pengingat WHERE id=?`).bind(id).run();
      return new Response(`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex>
<title>Pengingat dihapus · Foreverse</title><body style="font-family:system-ui;background:#FAF3E8;color:#1B1B2F;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center">
<div><h1 style="font-weight:500;font-size:22px">Pengingatnya sudah dihapus.</h1><p style="color:#5A5668">Tanggal dan nama yang tersimpan untuk pengingat ini sudah tidak ada di sistem kami.</p>
<p><a href="/" style="color:#3B3168">Kembali ke Foreverse</a></p></div></body>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }

    /* ── coba membuka kunci surat ─────────────────────────────── */
    if (jalur === "buka" && request.method === "POST") {
      const kode = teks(badan.kode, 16);
      const b = await db.prepare(`SELECT isi,status,aktif FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b || b.status !== "lunas" || !b.aktif) return salah("Surat tidak ditemukan.", 404);
      const k = JSON.parse(b.isi || "{}").kunci;
      if (!k) return jwb({ ok: true });
      if (k.buka && Date.now() < k.buka) return salah("Suratnya belum boleh dibuka. Sabar sebentar lagi, ya.", 403);
      if (!cocokKunci(k, badan.jawab)) return salah("Belum tepat. Coba lagi, ya.", 401);
      return new Response(JSON.stringify({ ok: true }), { headers: {
        "content-type": "application/json; charset=utf-8",
        "set-cookie": "fvk_" + kode + "=" + k.tiket + "; Path=/; Max-Age=15552000; HttpOnly; Secure; SameSite=Lax"
      } });
    }

    /* ── surat dibuka penerima ───────────────────────────────────
       Dipanggil skrip kecil yang disisipkan worker.js ke /s/<kode>.
       Perangkat yang baru saja membayar (penanda di selesai.html)
       tidak ikut dihitung, supaya pembeli yang mengecek suratnya
       sendiri tidak memicu kabar "sudah dibuka".                   */
    if (jalur === "dibuka" && request.method === "POST") {
      const kode = teks(badan.kode, 16);
      const b = await db.prepare(`SELECT kode,email,isi,status,aktif,dibuka FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b || b.status !== "lunas" || !b.aktif) return jwb({ ok: true });
      await db.prepare(`UPDATE pesanan SET n_buka=COALESCE(n_buka,0)+1, dibuka=COALESCE(dibuka,?) WHERE kode=?`)
        .bind(Date.now(), kode).run();
      if (!b.dibuka) ctx.waitUntil(kirimEmailDibuka(env, b, asal));
      return jwb({ ok: true });
    }

    /* ── catat kunjungan tema (tanpa data pribadi apa pun) ───── */
    if (jalur === "catat" && request.method === "POST") {
      const tema = teks(badan.tema, 40), jenis = teks(badan.jenis, 10);
      if (!TEMA_SKEMA[tema] || !["demo", "form"].includes(jenis)) return salah("Catatan tidak sah.");
      const hari = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);   // tanggal WIB
      await db.prepare(`INSERT INTO kunjungan(hari,tema,jenis,n) VALUES(?,?,?,1)
        ON CONFLICT(hari,tema,jenis) DO UPDATE SET n=n+1`).bind(hari, tema, jenis).run();
      return jwb({ ok: true });
    }

    /* ── buat atau perbarui draf ─────────────────────────────── */
    if (jalur === "draf" && request.method === "POST") {
      ctx.waitUntil(bersihkan(db, env));
      const kode = acak(PANJANG_KODE), token = acak(22), skr = Date.now();
      const tema = temaSah(teks(badan.tema, 40));
      const atur = await bacaPengaturan(db);
      if (atur.tutup) return salah(atur.tutup, 503);
      if (atur.temaMati.includes(tema)) return salah("Tema ini sedang tidak tersedia. Coba tema lain, ya.", 409);
      const pr = await hitungPromo(db, badan.promo, atur.harga);
      if (!pr.ok) return salah(pr.pesan, 400);
      const isi = await rapikanIsi(env, kode, badan, null, tema);
      await db.prepare(`INSERT INTO pesanan
        (kode,token,tema,momen,email,whatsapp,isi,status,jumlah,dibuat,aktif,promo,potongan)
        VALUES(?,?,?,?,?,?,?, 'draf', ?,?,1,?,?)`).bind(
        kode, token,
        tema,
        teks(badan.momen, 40),
        teks(badan.email, BATAS.email),
        teks(badan.whatsapp, BATAS.whatsapp),
        JSON.stringify(isi), pr.harga, skr, pr.kode || null, pr.potongan
      ).run();
      return jwb({ ok: true, kode, token, jumlah: pr.harga, potongan: pr.potongan });
    }

    /* ── minta halaman pembayaran DOKU ───────────────────────── */
    if (jalur === "bayar" && request.method === "POST") {
      if (!env.DOKU_CLIENT_ID || !env.DOKU_SECRET_KEY)
        return salah("Kunci DOKU belum dipasang di Cloudflare.", 500);

      const kode = teks(badan.kode, 16);
      const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Pesanan tidak ditemukan.", 404);
      if (b.status === "lunas") return jwb({ ok: true, sudah: true, kode });
      const aturB = await bacaPengaturan(db);
      if (aturB.tutup) return salah(aturB.tutup, 503);
      if (b.promo) {
        const p = await db.prepare(`SELECT kuota,terpakai,aktif,sampai FROM promo WHERE kode=?`).bind(b.promo).first();
        if (!p || !p.aktif || (p.sampai && Date.now() > p.sampai) || (p.kuota && p.terpakai >= p.kuota))
          return salah("Kode promo yang dipakai sudah tidak berlaku. Isi ulang formulirnya tanpa kode itu, ya.", 409);
      }
      const hargaB = Number(b.jumlah) || HARGA;

      const isi = JSON.parse(b.isi || "{}");
      const orderId = "FV-" + kode + "-" + Date.now().toString(36);

      const r = await panggilDoku(env, {
        metode: "POST",
        sasaran: DOKU.jalurCheckout,
        badan: {
          order: {
            amount: hargaB + BIAYA_TRANSAKSI,
            invoice_number: orderId,
            currency: "IDR",
            /* tempat pembeli mendarat setelah membayar */
            callback_url: asal + "/selesai?kode=" + kode,
            auto_redirect: true,
            line_items: [
              { name: "Surat digital Foreverse" + (b.promo ? " (promo " + b.promo + ")" : ""), quantity: 1, price: hargaB },
              { name: "Biaya transaksi", quantity: 1, price: BIAYA_TRANSAKSI }
            ]
          },
          payment: {
            payment_due_date: DOKU.jatuhTempoMenit,
            /* lapis kedua pengunci metode, selain centang di Back Office */
            payment_method_types: DOKU.metode
          },
          customer: {
            name: (isi.pengirim || "Pembeli").slice(0, 50),
            email: b.email || undefined,
            phone: b.whatsapp || undefined
          }
        }
      });

      const urlBayar = r.isi && r.isi.payment && r.isi.payment.url;
      if (!r.ok || !urlBayar) {
        const kabar = (r.asli && (r.asli.error_messages || r.asli.message)) || r.asli;
        await catatKejadian(env, db, "DOKU menolak pembayaran", JSON.stringify(kabar).slice(0, 300), kode);
        return salah("DOKU menolak: " + JSON.stringify(kabar).slice(0, 300), 502);
      }

      await db.prepare(`UPDATE pesanan SET order_id=? WHERE kode=?`).bind(orderId, kode).run();
      return jwb({ ok: true, url: urlBayar, order_id: orderId });
    }

    /* ── ketukan pemeriksaan dari DOKU ───────────────────────────
       Back Office DOKU menguji alamat notifikasi sebelum mau
       menyimpannya, dan ketukan itu tidak bertanda tangan. Dijawab
       200 di sini supaya lolos pemeriksaan. Tidak ada apa pun yang
       diproses: pelunasan hanya terjadi lewat jalur bertanda tangan
       di bawah, dan itu tidak berubah sedikit pun.                 */
    if (jalur === "notifikasi-doku" &&
        (request.method !== "POST" || !request.headers.get("Signature"))) {
      return jwb({ ok: true, layanan: "notifikasi-doku", siap: true });
    }

    /* ── pemberitahuan dari DOKU (webhook) ───────────────────────
       Alamat ini yang diisi di Back Office DOKU sebagai Notification
       URL: https://foreverse.id/api/notifikasi-doku                 */
    if (jalur === "notifikasi-doku" && request.method === "POST") {
      if (!env.DOKU_CLIENT_ID || !env.DOKU_SECRET_KEY) return salah("Belum siap.", 500);

      const kepalaId    = request.headers.get("Client-Id") || "";
      const kepalaReq   = request.headers.get("Request-Id") || "";
      const kepalaWaktu = request.headers.get("Request-Timestamp") || "";
      const kepalaTanda = request.headers.get("Signature") || "";

      if (!samaAman(kepalaId, env.DOKU_CLIENT_ID))
        return salah("Client-Id tidak dikenal.", 403);

      const waktu = Date.parse(kepalaWaktu);
      if (!waktu || Math.abs(Date.now() - waktu) > DOKU.maksUsiaJam * 3600 * 1000)
        return salah("Waktu notifikasi di luar batas.", 403);

      /* Digest dihitung dari teks asli badan, bukan dari hasil
         JSON.stringify ulang — satu spasi beda pun akan menggagalkan. */
      const digest = await digestDoku(mentah);
      const harusnya = await hmacDoku(env.DOKU_SECRET_KEY,
        rangkaiTandaTangan(kepalaId, kepalaReq, kepalaWaktu, url.pathname, digest));
      if (!samaAman(kepalaTanda, harusnya)) {
        await catatKejadian(env, db, "notifikasi DOKU ditolak", "Tanda tangan tidak cocok.", "");
        return salah("Tanda tangan tidak cocok.", 403);
      }

      const pesananDoku = badan.order || {};
      const transaksi   = badan.transaction || {};
      const faktur = teks(pesananDoku.invoice_number, 64);
      if (!faktur) return jwb({ ok: true, catatan: "Tanpa nomor faktur." });

      /* pembayaran perpanjangan masa simpan */
      if (faktur.startsWith("FP-")) {
        const row = await db.prepare(`SELECT * FROM perpanjangan WHERE order_id=?`).bind(faktur).first();
        if (!row) return jwb({ ok: true, catatan: "Perpanjangan tidak dikenal." });
        if (transaksi.status !== "SUCCESS") return jwb({ ok: true, catatan: "Belum lunas." });
        if (Number(pesananDoku.amount) !== row.jumlah + BIAYA_TRANSAKSI) {
          await catatKejadian(env, db, "notifikasi DOKU ditolak", "Jumlah perpanjangan " + pesananDoku.amount + " tidak sesuai.", row.kode);
          return salah("Jumlah pembayaran tidak sesuai harga.", 403);
        }
        await lunasiPerpanjangan(env, db, faktur);
        return jwb({ ok: true });
      }

      const b = await db.prepare(`SELECT kode,status,jumlah FROM pesanan WHERE order_id=?`)
        .bind(faktur).first();
      if (!b) return jwb({ ok: true, catatan: "Pesanan tidak dikenal." });
      const totalB = (Number(b.jumlah) || HARGA) + BIAYA_TRANSAKSI;

      /* Hanya SUCCESS yang diproses. FAILED diabaikan: di Checkout,
         pembeli masih boleh mencoba lagi di halaman yang sama, jadi
         menandai pesanan gagal justru akan salah.                    */
      if (transaksi.status !== "SUCCESS")
        return jwb({ ok: true, catatan: "Belum lunas." });

      if (Number(pesananDoku.amount) !== totalB) {
        await catatKejadian(env, db, "notifikasi DOKU ditolak", "Jumlah " + pesananDoku.amount + " tidak sama dengan " + totalB + ".", b.kode);
        return salah("Jumlah pembayaran tidak sesuai harga.", 403);
      }

      /* Idempoten: lunasi() berhenti sendiri kalau sudah lunas, jadi
         notifikasi dobel tidak pernah mengirim email dua kali.       */
      await lunasi(env, db, b.kode, asal);
      return jwb({ ok: true });
    }

    /* ── cek status; kalau perlu, tanya langsung ke DOKU ───────
       Catatan penting: kode surat itu umum — dikirim ke penerima.
       Jadi jawaban di sini TIDAK BOLEH memuat token edit.        */
    if (jalur === "status") {
      const kode = teks(url.searchParams.get("kode"), 16);
      const b = await db.prepare(`SELECT kode,status,order_id,isi,jumlah FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Pesanan tidak ditemukan.", 404);

      const penerima = (JSON.parse(b.isi || "{}").penerima) || "";

      /* Cadangan kalau notifikasi telat atau tidak sampai: tanya
         langsung ke DOKU. Dokumentasi menyarankan menunggu 60 detik
         setelah pembayaran sebelum jawabannya bisa dipercaya.      */
      if (b.status !== "lunas" && b.order_id && env.DOKU_CLIENT_ID && env.DOKU_SECRET_KEY) {
        const r = await panggilDoku(env, {
          metode: "GET",
          sasaran: DOKU.jalurStatus + encodeURIComponent(b.order_id)
        });
        const t = (r.isi && r.isi.transaction) || {};
        const o = (r.isi && r.isi.order) || {};
        if (t.status === "SUCCESS" && Number(o.amount) === (Number(b.jumlah) || HARGA) + BIAYA_TRANSAKSI) {
          await lunasi(env, db, b.kode, asal);
          const isiSt2 = JSON.parse(b.isi || "{}");
          return jwb({ ok: true, status: "lunas", kode: b.kode, penerima, bisa_ingat: !!tanggalIngat(isiSt2), dikunci: !!isiSt2.kunci });
        }
      }
      const isiSt = JSON.parse(b.isi || "{}");
      return jwb({ ok: true, status: b.status, kode: b.kode, penerima: b.status === "lunas" ? penerima : "",
        bisa_ingat: b.status === "lunas" && !!tanggalIngat(isiSt), dikunci: b.status === "lunas" && !!isiSt.kunci });
    }

    /* ── isi surat untuk ditampilkan ke penerima ─────────────── */
    if (jalur === "surat") {
      const kode = teks(url.searchParams.get("kode"), 16);
      const b = await db.prepare(`SELECT tema,isi,status,aktif FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Surat tidak ditemukan.", 404);
      if (b.status !== "lunas") return salah("Surat ini belum aktif.", 404);
      if (!b.aktif) return salah("Surat ini sudah dinonaktifkan.", 410);
      const isiS = JSON.parse(b.isi || "{}");
      if (infoGerbang(isiS, request.headers.get("cookie"), kode)) return salah("Surat ini masih terkunci.", 403);
      return new Response(JSON.stringify({ ok: true, tema: b.tema, isi: isiUntukPenerima(isiS) }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" }
      });
    }

    /* ── ambil isi untuk diedit pemiliknya ───────────────────── */
    if (jalur === "draf" && request.method === "GET") {
      const token = teks(url.searchParams.get("token"), 30);
      const b = await db.prepare(`SELECT * FROM pesanan WHERE token=?`).bind(token).first();
      if (!b) return salah("Tautan edit tidak dikenal.", 404);
      if (b.status !== "lunas") return salah("Pesanan ini belum lunas.", 403);
      if (b.batas_edit && Date.now() > b.batas_edit)
        return salah("Masa edit sudah lewat. Hubungi kami lewat WhatsApp kalau masih perlu diubah.", 403);
      return jwb({
        ok: true, kode: b.kode, tema: b.tema, momen: b.momen,
        email: b.email, whatsapp: b.whatsapp,
        isi: JSON.parse(b.isi || "{}"), batas_edit: b.batas_edit, simpan_sampai: b.simpan_sampai
      });
    }

    /* ── simpan hasil edit ───────────────────────────────────── */
    if (jalur === "simpan" && request.method === "POST") {
      const token = teks(badan.token, 30);
      const b = await db.prepare(`SELECT * FROM pesanan WHERE token=?`).bind(token).first();
      if (!b) return salah("Tautan edit tidak dikenal.", 404);
      if (b.status !== "lunas") return salah("Pesanan ini belum lunas.", 403);
      if (b.batas_edit && Date.now() > b.batas_edit) return salah("Masa edit sudah lewat.", 403);

      const lama = JSON.parse(b.isi || "{}");
      /* tema dikunci dari pesanan asli, bukan dari badan kiriman klien —
         tema tidak boleh berubah lewat edit. */
      const isi = await rapikanIsi(env, b.kode, badan, lama, temaSah(b.tema));
      await db.prepare(`UPDATE pesanan SET isi=?, email=? WHERE kode=?`)
        .bind(JSON.stringify(isi), teks(badan.email, BATAS.email) || b.email, b.kode).run();
      return jwb({ ok: true, kode: b.kode });
    }

    /* ── halaman pengawasan (/developer) ─────────────────────── */
    if ((jalur === "developer" || jalur === "admin") && request.method === "POST") {
      if (!env.ADMIN_PASSWORD) return salah("ADMIN_PASSWORD belum dipasang di Cloudflare.", 500);
      if (teks(badan.sandi, 200) !== env.ADMIN_PASSWORD) {
        await new Promise(r => setTimeout(r, 1200));   // perlambat tebakan beruntun
        return salah("Password salah.", 401);
      }

      const aksi = teks(badan.aksi, 20);

      if (aksi === "daftar") {
        /* Periode: dari–sampai (milidetik). Kosong = sejak hari pertama.
           Pesanan dihitung masuk periode menurut tanggal dibuat; penjualan
           (lunas & pendapatan) menurut tanggal dibayar. Periode sebelumnya
           yang sama panjang ikut dihitung untuk perbandingan.            */
        const skr = Date.now();
        const sampai = Number(badan.sampai) > 0 ? Number(badan.sampai) : skr;
        const dari = Number(badan.dari) > 0 ? Number(badan.dari) : 0;
        const panjang = sampai - dari;
        const cari = teks(badan.cari, 60).toLowerCase();
        const kolom = `SELECT kode,token,tema,momen,email,whatsapp,status,jumlah,dibuat,dibayar,batas_edit,aktif,email_terkirim,dibuka,n_buka,simpan_sampai,promo,potongan,n_panjang,isi FROM pesanan`;
        const pola = "%" + cari.replace(/[%_\\]/g, "\\$&") + "%";
        const syaratCari = cari
          ? ` AND (lower(kode) LIKE ?3 ESCAPE '\\' OR lower(COALESCE(email,'')) LIKE ?3 ESCAPE '\\'
              OR lower(COALESCE(whatsapp,'')) LIKE ?3 ESCAPE '\\' OR lower(COALESCE(isi,'')) LIKE ?3 ESCAPE '\\')`
          : "";
        const q = db.prepare(kolom + ` WHERE dibuat >= ?1 AND dibuat <= ?2` + syaratCari + ` ORDER BY dibuat DESC LIMIT 2000`);
        const r = cari ? await q.bind(dari, sampai, pola).all() : await q.bind(dari, sampai).all();
        const ringkas = (b) => {
          const i = JSON.parse(b.isi || "{}");
          const l = i.lagu || {};
          delete b.isi;
          return {
            ...b,
            penerima: i.penerima || "",
            pengirim: i.pengirim || "",
            foto_n: Array.isArray(i.foto) ? i.foto.length : 0,
            surat_n: Array.isArray(i.surat) ? i.surat.filter(x => x).length : 0,
            tema: b.tema || "bait",
            lagu_sumber: l.src ? "unggah" : "",       // "unggah" | "" (kotak musik bawaan)
            lagu_judul: l.judul || "",
            punya_rahasia: !!i.rahasia,
            sembunyikan_umur: !!i.sembunyikanUmur
          };
        };
        const baris = (r.results || []).map(ringkas);

        const jual = async (a, b) => db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(jumlah),0) rp FROM pesanan
          WHERE status='lunas' AND COALESCE(dibayar,dibuat) >= ? AND COALESCE(dibayar,dibuat) <= ?`).bind(a, b).first();
        const hit = await jual(dari, sampai);
        const lalu = dari > 0 ? await jual(Math.max(0, dari - panjang), dari - 1) : null;
        const masukLalu = dari > 0 ? await db.prepare(`SELECT COUNT(*) n FROM pesanan WHERE dibuat >= ? AND dibuat < ?`)
          .bind(Math.max(0, dari - panjang), dari).first() : null;
        const semua = await db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(CASE WHEN status='lunas' THEN jumlah END),0) rp,
          SUM(CASE WHEN status='lunas' THEN 1 ELSE 0 END) lunas FROM pesanan`).first();

        /* penjualan per tema & per momen dalam periode */
        const perTema = await db.prepare(`SELECT COALESCE(tema,'bait') tema, COUNT(*) n, COALESCE(SUM(jumlah),0) rp FROM pesanan
          WHERE status='lunas' AND COALESCE(dibayar,dibuat) BETWEEN ? AND ? GROUP BY 1 ORDER BY n DESC`).bind(dari, sampai).all();
        const perMomen = await db.prepare(`SELECT COALESCE(momen,'') momen, COUNT(*) n, COALESCE(SUM(jumlah),0) rp FROM pesanan
          WHERE status='lunas' AND COALESCE(dibayar,dibuat) BETWEEN ? AND ? GROUP BY 1 ORDER BY n DESC`).bind(dari, sampai).all();

        /* minat per tema dalam periode (tanggal WIB) */
        const hariWib = (ms) => new Date(ms + 7 * 3600000).toISOString().slice(0, 10);
        const kj = await db.prepare(`SELECT tema, jenis, SUM(n) n FROM kunjungan WHERE hari >= ? AND hari <= ? GROUP BY tema, jenis`)
          .bind(hariWib(dari), hariWib(sampai)).all();
        const minat = {};
        for (const t of Object.keys(TEMA_SKEMA)) minat[t] = { demo: 0, form: 0, lunas: 0 };
        for (const x of (kj.results || [])) if (minat[x.tema]) minat[x.tema][x.jenis] = x.n;
        for (const x of (perTema.results || [])) if (minat[x.tema]) minat[x.tema].lunas = x.n;

        /* hal yang perlu tindakan — selalu dari SEMUA pesanan, tidak ikut periode */
        const perlu = await db.prepare(kolom + ` WHERE
            (status='lunas' AND email_terkirim=0 AND COALESCE(email,'')!='')
            OR (status='lunas' AND aktif=0 AND isi!='{}')
            OR (status='lunas' AND batas_edit > ?1 AND batas_edit < ?1 + 172800000)
            OR (status='lunas' AND aktif=1 AND simpan_sampai IS NOT NULL AND simpan_sampai < ?1 + ?2)
          ORDER BY dibuat DESC LIMIT 200`).bind(skr, HARI_PENGINGAT * 86400000).all();
        const draf = await db.prepare(`SELECT COUNT(*) n FROM pesanan WHERE status!='lunas'`).first();

        return jwb({
          ok: true, cari, dari, sampai, baris,
          lunas: hit.n, pendapatan: hit.rp,
          lalu: lalu ? { lunas: lalu.n, pendapatan: lalu.rp, masuk: masukLalu.n } : null,
          semua: { total: semua.n, lunas: semua.lunas || 0, pendapatan: semua.rp },
          per_tema: perTema.results || [], per_momen: perMomen.results || [],
          minat, perlu: (perlu.results || []).map(ringkas), draf: draf.n,
          sekarang: skr
        });
      }

      if (aksi === "email") return jwb(await kirimEmailKode(env, db, teks(badan.kode, 16), asal));

      /* ── harga & tema yang dibuka ── */
      if (aksi === "atur") {
        if (badan.harga !== undefined) {
          const h = Math.round(Number(badan.harga));
          if (!(h >= 1000 && h <= 1000000)) return salah("Harga harus antara Rp1.000 dan Rp1.000.000.");
          await simpanPengaturan(db, "harga", h);
        }
        if (badan.harga_perpanjang !== undefined) {
          const h = Math.round(Number(badan.harga_perpanjang));
          if (!(h >= 1000 && h <= 1000000)) return salah("Harga perpanjangan harus antara Rp1.000 dan Rp1.000.000.");
          await simpanPengaturan(db, "harga_perpanjang", h);
        }
        if (Array.isArray(badan.tema_mati))
          await simpanPengaturan(db, "tema_mati", JSON.stringify(badan.tema_mati.filter(t => TEMA_SKEMA[t])));
        const a = await bacaPengaturan(db);
        return jwb({ ok: true, harga: a.harga, harga_perpanjang: a.hargaPerpanjang, tema_mati: a.temaMati, semua_tema: Object.keys(TEMA_SKEMA) });
      }

      /* ── kode promo ── */
      if (aksi === "promo_daftar") {
        const r = await db.prepare(`SELECT * FROM promo ORDER BY dibuat DESC`).all();
        return jwb({ ok: true, promo: r.results || [] });
      }
      if (aksi === "promo_simpan") {
        const kode = normalKodePromo(badan.kode);
        if (kode.length < 3) return salah("Kode promo minimal 3 huruf/angka.");
        const jenis = badan.jenis === "persen" ? "persen" : "rupiah";
        const nilai = Math.round(Number(badan.nilai));
        if (!(nilai > 0) || (jenis === "persen" && nilai > 100)) return salah("Besar potongan belum benar.");
        const lama = await db.prepare(`SELECT terpakai,dibuat FROM promo WHERE kode=?`).bind(kode).first();
        await db.prepare(`INSERT OR REPLACE INTO promo(kode,jenis,nilai,kuota,terpakai,sampai,aktif,dibuat) VALUES(?,?,?,?,?,?,?,?)`)
          .bind(kode, jenis, nilai, Math.max(0, Math.round(Number(badan.kuota) || 0)), lama ? lama.terpakai : 0,
            Number(badan.sampai) || null, badan.aktif === false ? 0 : 1, lama ? lama.dibuat : Date.now()).run();
        return jwb({ ok: true, kode });
      }
      if (aksi === "promo_aktif") {
        await db.prepare(`UPDATE promo SET aktif=? WHERE kode=?`).bind(badan.nilai ? 1 : 0, normalKodePromo(badan.kode)).run();
        return jwb({ ok: true });
      }
      if (aksi === "promo_hapus") {
        await db.prepare(`DELETE FROM promo WHERE kode=?`).bind(normalKodePromo(badan.kode)).run();
        return jwb({ ok: true });
      }

      /* ── buka/tutup pesanan sementara ── */
      if (aksi === "tutup") {
        await simpanPengaturan(db, "tutup", badan.nilai ? teks(badan.pesan, 200) || "Pemesanan sedang ditutup sebentar. Coba lagi nanti, ya." : "");
        return jwb({ ok: true, tutup: (await bacaPengaturan(db)).tutup });
      }

      /* ── pulihkan dari cadangan ── */
      if (aksi === "pulihkan") {
        const mode = ["cek", "isi", "timpa"].includes(badan.mode) ? badan.mode : "cek";
        return jwb({ ok: true, mode, laporan: await pulihkan(env, db, badan.data, mode) });
      }
      if (aksi === "cadangan_ambil") {
        const nama = teks(badan.nama, 80);
        if (!/^cadangan\/[\w.-]+\.json$/.test(nama) || !env.FOTO) return salah("Nama cadangan tidak sah.");
        const o = await env.FOTO.get(nama);
        if (!o) return salah("Cadangan tidak ditemukan.", 404);
        return jwb({ ok: true, data: JSON.parse(await o.text()) });
      }

      /* ── refund: tandai, matikan surat, keluarkan dari pendapatan ── */
      if (aksi === "refund") {
        const kode = teks(badan.kode, 16);
        await db.prepare(`UPDATE pesanan SET status='refund', aktif=0 WHERE kode=? AND status='lunas'`).bind(kode).run();
        await catatKejadian(env, db, "refund dicatat", "Pesanan ditandai refund dari /developer. Kembalikan dananya lewat DOKU/transfer.", kode);
        return jwb({ ok: true });
      }

      /* ── permintaan hapus data (UU PDP): isi & kontak dihapus, catatan transaksi tetap ── */
      if (aksi === "anonimkan") {
        const kode = teks(badan.kode, 16);
        await hapusFoto(env, db, kode);
        await db.prepare(`UPDATE pesanan SET isi='{}', email='', whatsapp='', token=NULL, aktif=0 WHERE kode=?`).bind(kode).run();
        await db.prepare(`DELETE FROM pengingat WHERE kode=?`).bind(kode).run();
        return jwb({ ok: true });
      }

      /* ── cadangan ── */
      if (aksi === "cadangan") return jwb({ ok: true, data: await buatCadangan(db) });
      if (aksi === "cadangan_daftar") {
        const d = env.FOTO ? await env.FOTO.list({ prefix: "cadangan/" }) : { objects: [] };
        return jwb({ ok: true, daftar: (d.objects || []).map(o => ({ nama: o.key, ukuran: o.size })).sort((a, b) => a.nama < b.nama ? 1 : -1) });
      }
      if (aksi === "cadangan_sekarang") return jwb({ ok: true, hasil: await cadangkanHarian(env, db) });

      /* ── tambah masa simpan tanpa bayar (mis. kompensasi) ── */
      if (aksi === "tambah_simpan") {
        const b = await db.prepare(`SELECT simpan_sampai FROM pesanan WHERE kode=?`).bind(teks(badan.kode, 16)).first();
        if (!b) return salah("Pesanan tidak ditemukan.", 404);
        await db.prepare(`UPDATE pesanan SET simpan_sampai=?, pengingat=NULL WHERE kode=?`)
          .bind(tambahBulan(Math.max(Number(b.simpan_sampai) || 0, Date.now()), BULAN_PERPANJANG), teks(badan.kode, 16)).run();
        return jwb({ ok: true });
      }

      if (aksi === "aktif") {
        await db.prepare(`UPDATE pesanan SET aktif=? WHERE kode=?`)
          .bind(badan.nilai ? 1 : 0, teks(badan.kode, 16)).run();
        return jwb({ ok: true });
      }

      if (aksi === "perpanjang") {
        await db.prepare(`UPDATE pesanan SET batas_edit=? WHERE kode=?`)
          .bind(Date.now() + HARI_EDIT * 86400000, teks(badan.kode, 16)).run();
        return jwb({ ok: true });
      }

      if (aksi === "hapus") {
        const kode = teks(badan.kode, 16);
        await hapusFoto(env, db, kode);
        await db.prepare(`DELETE FROM pesanan WHERE kode=?`).bind(kode).run();
        return jwb({ ok: true });
      }

      if (aksi === "periksa") {
        return jwb({
          ok: true,
          d1: true,
          r2: !!env.FOTO,
          resend: !!env.RESEND_API_KEY,
          doku: !!env.DOKU_CLIENT_ID && !!env.DOKU_SECRET_KEY,
          metode: DOKU.metode.join(", "),
          mode: (modeSandbox(env) ? "Sandbox (uji coba)" : "Production (sungguhan)")
                + (modeDitegaskan(env) ? "" : " — DOKU_MODE belum diisi, dianggap Sandbox"),
          sandbox: modeSandbox(env),
          mode_tegas: modeDitegaskan(env),
          pengirim: env.EMAIL_PENGIRIM || "(belum diisi)",
          harga: (await bacaPengaturan(db)).harga,
          jam_draf: JAM_DRAF,
          hari_edit: HARI_EDIT,
          bulan_simpan: BULAN_SIMPAN,
          email_hari_ini: ((await db.prepare(`SELECT n FROM pakai WHERE hari=? AND jenis='email'`)
            .bind(new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)).first()) || { n: 0 }).n,
          batas_email: Number(env.BATAS_EMAIL_HARIAN) || BATAS_EMAIL_BAWAAN,
          tutup: (await bacaPengaturan(db)).tutup,
          staging: !!env.STAGING,
          kejadian: ((await db.prepare(
            `SELECT waktu,jenis,pesan,kode FROM kejadian ORDER BY waktu DESC LIMIT 20`).all()).results || [])
        });
      }

      return salah("Aksi tidak dikenal.");
    }

    return salah("Alamat tidak dikenal: /api/" + jalur, 404);

  } catch (e) {
    return salah(e && e.message ? e.message : "Terjadi kesalahan di server.", 400);
  }
}
