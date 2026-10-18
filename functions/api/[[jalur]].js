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

const HARGA = 15000;                 // rupiah, sudah bersih untuk pembeli
const HARI_EDIT = 3;                 // masa berlaku tautan edit
const JAM_DRAF = 24;                 // draf belum dibayar dihapus setelah ini
const MAKS_FOTO = 3 * 1024 * 1024;   // batas satu foto setelah dikecilkan
const MAKS_LAGU = 10 * 1024 * 1024;  // batas file lagu yang diunggah

/* ── batas karakter; dijaga di server juga, bukan cuma di formulir ── */
const BATAS = {
  penerima: 20, pengirim: 20,
  pesan: 220, ket: 40, harapan: 80, rahasia: 120,
  email: 120, whatsapp: 24, judulLagu: 80
};

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
      aktif INTEGER DEFAULT 1, email_terkirim INTEGER DEFAULT 0)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_order ON pesanan(order_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS i_token ON pesanan(token)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS foto(
      kunci TEXT PRIMARY KEY, kode TEXT, mime TEXT, isi BLOB, dibuat INTEGER)`)
  ]);
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
  if (env.FOTO && lama && typeof lama.file === "string"
      && lama.file.startsWith("/f/" + kode + "/")) {
    try { await env.FOTO.delete(lama.file.slice(3)); } catch (_) {}
  }
}

async function rapikanLagu(env, kode, masuk, lama) {
  const m = masuk || {};
  const detik = v => { const n = Math.round((+v || 0) * 10) / 10; return n > 0 && n < 3600 ? n : 0; };
  const mulai = detik(m.mulai);
  let selesai = detik(m.selesai);
  if (selesai && selesai < mulai + 3) selesai = 0;   // potongan terlalu pendek → putar sampai habis
  const kosong = { sumber: "", file: "", judul: "", mulai: 0, selesai: 0 };

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
    return { sumber: "unggah", judul: teks(m.judul, BATAS.judulLagu), file: "/f/" + kunci, mulai, selesai };
  }

  /* mengedit tanpa mengganti berkas: lagu yang lama dipertahankan */
  if (m.pakaiLama && lama && lama.file)
    return { sumber: "unggah", judul: lama.judul || "", file: lama.file, mulai, selesai };

  await hapusUnggahanLama(env, kode, lama);
  return kosong;
}

async function rapikanIsi(env, kode, badan, lamaIsi) {
  const p = badan.isi || {};
  const isi = {
    penerima: teks(p.penerima, BATAS.penerima),
    pengirim: teks(p.pengirim, BATAS.pengirim),
    pesan: [0, 1, 2].map(i => teks((p.pesan || [])[i], BATAS.pesan)),
    tanggalLahir: tanggalSah(p.tanggalLahir),
    tanggalKenal: tanggalSah(p.tanggalKenal),
    harapan: teks(p.harapan, BATAS.harapan),
    rahasia: teks(p.rahasia, BATAS.rahasia),
    lagu: null,
    foto: []
  };

  if (!isi.penerima) throw new Error("Nama penerima belum diisi.");
  if (!isi.pengirim) throw new Error("Nama pengirim belum diisi.");
  if (!isi.pesan[0]) throw new Error("Pesan bagian 1 belum diisi.");
  if (!isi.tanggalLahir) throw new Error("Tanggal lahir belum diisi.");

  const fotoLama = (lamaIsi && lamaIsi.foto) || [];
  const masuk = Array.isArray(badan.foto) ? badan.foto : [];

  for (let i = 0; i < 3; i++) {
    const f = masuk[i] || {};
    const ket = teks(f.ket, BATAS.ket);
    if (f.data && String(f.data).length > 32) {
      const mime = /^image\/(png|webp|jpeg)$/.test(f.mime || "") ? f.mime : "image/jpeg";
      isi.foto.push({ src: await simpanFoto(env, kode, i + 1, f.data, mime), ket });
    } else if (fotoLama[i] && fotoLama[i].src) {
      isi.foto.push({ src: fotoLama[i].src, ket });
    }
  }
  if (isi.foto.length < 1) throw new Error("Minimal satu foto harus diunggah.");
  isi.lagu = await rapikanLagu(env, kode, p.lagu, lamaIsi && lamaIsi.lagu);
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
  <div style="background:#FFFDF8;border:1px solid #EFE4D4;border-radius:18px;padding:28px 24px">
    <h1 style="margin:0 0 12px;font-size:21px;font-weight:600;line-height:1.35">Suratmu sudah jadi.</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#4E4A5E">
      Surat untuk <strong>${esc(o.penerima)}</strong> sudah aktif. Tinggal kirim tautan di bawah ini ke dia.
    </p>
    <a href="${esc(tautan)}" style="display:block;background:#E8734A;color:#fff;text-decoration:none;text-align:center;padding:14px 18px;border-radius:12px;font-weight:600;font-size:15px">Buka suratnya</a>
    <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#8A8598;word-break:break-all">${esc(tautan)}</p>
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
  const r = await fetch("https://api.resend.com/emails", {
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
  return hasil;
}

/* ══════════════════ pelunasan ══════════════════ */

async function lunasi(env, db, kode, asal) {
  const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
  if (!b || b.status === "lunas") return;
  const skr = Date.now();
  await db.prepare(`UPDATE pesanan SET status='lunas', dibayar=?, batas_edit=? WHERE kode=?`)
    .bind(skr, skr + HARI_EDIT * 86400000, kode).run();
  await kirimEmailKode(env, db, kode, asal);
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

    /* ── buat atau perbarui draf ─────────────────────────────── */
    if (jalur === "draf" && request.method === "POST") {
      ctx.waitUntil(bersihkan(db, env));
      const kode = acak(6), token = acak(22), skr = Date.now();
      const isi = await rapikanIsi(env, kode, badan, null);
      await db.prepare(`INSERT INTO pesanan
        (kode,token,tema,momen,email,whatsapp,isi,status,jumlah,dibuat,aktif)
        VALUES(?,?,?,?,?,?,?, 'draf', ?,?,1)`).bind(
        kode, token,
        teks(badan.tema, 40) || "kotak-kejutan",
        teks(badan.momen, 40),
        teks(badan.email, BATAS.email),
        teks(badan.whatsapp, BATAS.whatsapp),
        JSON.stringify(isi), HARGA, skr
      ).run();
      return jwb({ ok: true, kode, token, jumlah: HARGA });
    }

    /* ── minta halaman pembayaran DOKU ───────────────────────── */
    if (jalur === "bayar" && request.method === "POST") {
      if (!env.DOKU_CLIENT_ID || !env.DOKU_SECRET_KEY)
        return salah("Kunci DOKU belum dipasang di Cloudflare.", 500);

      const kode = teks(badan.kode, 12);
      const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Pesanan tidak ditemukan.", 404);
      if (b.status === "lunas") return jwb({ ok: true, sudah: true, kode });

      const isi = JSON.parse(b.isi || "{}");
      const orderId = "FV-" + kode + "-" + Date.now().toString(36);

      const r = await panggilDoku(env, {
        metode: "POST",
        sasaran: DOKU.jalurCheckout,
        badan: {
          order: {
            amount: HARGA,
            invoice_number: orderId,
            currency: "IDR",
            /* tempat pembeli mendarat setelah membayar */
            callback_url: asal + "/selesai?kode=" + kode,
            auto_redirect: true,
            line_items: [{ name: "Surat digital Foreverse", quantity: 1, price: HARGA }]
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
      if (!samaAman(kepalaTanda, harusnya))
        return salah("Tanda tangan tidak cocok.", 403);

      const pesananDoku = badan.order || {};
      const transaksi   = badan.transaction || {};
      const faktur = teks(pesananDoku.invoice_number, 64);
      if (!faktur) return jwb({ ok: true, catatan: "Tanpa nomor faktur." });

      const b = await db.prepare(`SELECT kode,status FROM pesanan WHERE order_id=?`)
        .bind(faktur).first();
      if (!b) return jwb({ ok: true, catatan: "Pesanan tidak dikenal." });

      /* Hanya SUCCESS yang diproses. FAILED diabaikan: di Checkout,
         pembeli masih boleh mencoba lagi di halaman yang sama, jadi
         menandai pesanan gagal justru akan salah.                    */
      if (transaksi.status !== "SUCCESS")
        return jwb({ ok: true, catatan: "Belum lunas." });

      if (Number(pesananDoku.amount) !== HARGA)
        return salah("Jumlah pembayaran tidak sesuai harga.", 403);

      /* Idempoten: lunasi() berhenti sendiri kalau sudah lunas, jadi
         notifikasi dobel tidak pernah mengirim email dua kali.       */
      await lunasi(env, db, b.kode, asal);
      return jwb({ ok: true });
    }

    /* ── cek status; kalau perlu, tanya langsung ke DOKU ───────
       Catatan penting: kode surat itu umum — dikirim ke penerima.
       Jadi jawaban di sini TIDAK BOLEH memuat token edit.        */
    if (jalur === "status") {
      const kode = teks(url.searchParams.get("kode"), 12);
      const b = await db.prepare(`SELECT kode,status,order_id,isi FROM pesanan WHERE kode=?`).bind(kode).first();
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
        if (t.status === "SUCCESS" && Number(o.amount) === HARGA) {
          await lunasi(env, db, b.kode, asal);
          return jwb({ ok: true, status: "lunas", kode: b.kode, penerima });
        }
      }
      return jwb({ ok: true, status: b.status, kode: b.kode, penerima: b.status === "lunas" ? penerima : "" });
    }

    /* ── isi surat untuk ditampilkan ke penerima ─────────────── */
    if (jalur === "surat") {
      const kode = teks(url.searchParams.get("kode"), 12);
      const b = await db.prepare(`SELECT tema,isi,status,aktif FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Surat tidak ditemukan.", 404);
      if (b.status !== "lunas") return salah("Surat ini belum aktif.", 404);
      if (!b.aktif) return salah("Surat ini sudah dinonaktifkan.", 410);
      return new Response(JSON.stringify({ ok: true, tema: b.tema, isi: JSON.parse(b.isi || "{}") }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60" }
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
        isi: JSON.parse(b.isi || "{}"), batas_edit: b.batas_edit
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
      const isi = await rapikanIsi(env, b.kode, badan, lama);
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
        const r = await db.prepare(
          `SELECT kode,token,tema,momen,email,whatsapp,status,jumlah,dibuat,dibayar,batas_edit,aktif,email_terkirim,isi
           FROM pesanan ORDER BY dibuat DESC LIMIT 200`).all();
        const baris = (r.results || []).map(b => {
          const i = JSON.parse(b.isi || "{}");
          const l = i.lagu || {};
          delete b.isi;
          return {
            ...b,
            penerima: i.penerima || "",
            pengirim: i.pengirim || "",
            foto_n: Array.isArray(i.foto) ? i.foto.length : 0,
            pesan_n: Array.isArray(i.pesan) ? i.pesan.filter(x => x).length : 0,
            lagu_sumber: l.sumber || "",              // "unggah" | "" (kotak musik bawaan)
            lagu_judul: l.judul || "",
            punya_rahasia: !!i.rahasia,
            punya_harapan: !!i.harapan
          };
        });
        const hit = await db.prepare(
          `SELECT COUNT(*) n, COALESCE(SUM(jumlah),0) rp FROM pesanan WHERE status='lunas'`).first();
        const semua = await db.prepare(`SELECT COUNT(*) n FROM pesanan`).first();
        return jwb({ ok: true, baris, lunas: hit.n, pendapatan: hit.rp, total: semua.n, sekarang: Date.now() });
      }

      if (aksi === "email") return jwb(await kirimEmailKode(env, db, teks(badan.kode, 12), asal));

      if (aksi === "aktif") {
        await db.prepare(`UPDATE pesanan SET aktif=? WHERE kode=?`)
          .bind(badan.nilai ? 1 : 0, teks(badan.kode, 12)).run();
        return jwb({ ok: true });
      }

      if (aksi === "perpanjang") {
        await db.prepare(`UPDATE pesanan SET batas_edit=? WHERE kode=?`)
          .bind(Date.now() + HARI_EDIT * 86400000, teks(badan.kode, 12)).run();
        return jwb({ ok: true });
      }

      if (aksi === "hapus") {
        const kode = teks(badan.kode, 12);
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
          harga: HARGA,
          jam_draf: JAM_DRAF,
          hari_edit: HARI_EDIT
        });
      }

      return salah("Aksi tidak dikenal.");
    }

    return salah("Alamat tidak dikenal: /api/" + jalur, 404);

  } catch (e) {
    return salah(e && e.message ? e.message : "Terjadi kesalahan di server.", 400);
  }
}
