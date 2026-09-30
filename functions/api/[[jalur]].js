/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · API sistem pesanan
   Satu file ini menangani semua alamat /api/...
   Berjalan di Cloudflare Pages Functions.

   Sambungan yang harus ada di Cloudflare (Settings → Bindings):
     DB    → D1 database  foreverse-db      (wajib)
     FOTO  → R2 bucket    foreverse-foto    (opsional; kalau tidak ada,
                                             foto disimpan di D1)

   Kunci rahasia (Settings → Variables and Secrets):
     MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY,
     RESEND_API_KEY, ADMIN_PASSWORD, EMAIL_PENGIRIM
   ══════════════════════════════════════════════════════════════════ */

const HARGA = 15000;                 // rupiah, sudah bersih untuk pembeli
const HARI_EDIT = 3;                 // masa berlaku tautan edit
const JAM_DRAF = 24;                 // draf belum dibayar dihapus setelah ini
const MAKS_FOTO = 3 * 1024 * 1024;   // batas satu foto setelah dikecilkan

/* ── batas karakter; dijaga di server juga, bukan cuma di formulir ── */
const BATAS = {
  penerima: 20, pengirim: 20,
  pesan: 220, ket: 40, harapan: 80, rahasia: 120,
  email: 120, whatsapp: 24, lagu: 200
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

async function sha512(s) {
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function sandbox(kunci) { return String(kunci || "").startsWith("SB-"); }

function basisMidtrans(serverKey) {
  return sandbox(serverKey) ? "https://api.sandbox.midtrans.com" : "https://api.midtrans.com";
}

function snapJs(clientKey) {
  return sandbox(clientKey)
    ? "https://app.sandbox.midtrans.com/snap/snap.js"
    : "https://app.midtrans.com/snap/snap.js";
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
    lagu: { file: "", youtube: teks((p.lagu || {}).youtube, BATAS.lagu), mulai: 0 },
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
    const badan = request.method === "POST" ? await request.json().catch(() => ({})) : {};

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

    /* ── minta jendela pembayaran ────────────────────────────── */
    if (jalur === "bayar" && request.method === "POST") {
      const sk = env.MIDTRANS_SERVER_KEY, ck = env.MIDTRANS_CLIENT_KEY;
      if (!sk || !ck) return salah("Kunci Midtrans belum dipasang di Cloudflare.", 500);

      const kode = teks(badan.kode, 12);
      const b = await db.prepare(`SELECT * FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Pesanan tidak ditemukan.", 404);
      if (b.status === "lunas") return jwb({ ok: true, sudah: true, kode });

      const isi = JSON.parse(b.isi || "{}");
      const orderId = "FV-" + kode + "-" + Date.now().toString(36);

      const r = await fetch(basisMidtrans(sk) + "/snap/v1/transactions", {
        method: "POST",
        headers: {
          authorization: "Basic " + btoa(sk + ":"),
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({
          transaction_details: { order_id: orderId, gross_amount: HARGA },
          item_details: [{ id: b.tema || "surat", price: HARGA, quantity: 1, name: "Surat digital Foreverse" }],
          customer_details: {
            first_name: (isi.pengirim || "Pembeli").slice(0, 20),
            email: b.email || undefined,
            phone: b.whatsapp || undefined
          },
          callbacks: { finish: asal + "/selesai?kode=" + kode },
          expiry: { unit: "hour", duration: 2 }
        })
      });

      const hasil = await r.json().catch(() => ({}));
      if (!r.ok || !hasil.token) {
        return salah("Midtrans menolak: " + JSON.stringify(hasil.error_messages || hasil).slice(0, 300), 502);
      }
      await db.prepare(`UPDATE pesanan SET order_id=? WHERE kode=?`).bind(orderId, kode).run();
      return jwb({ ok: true, token: hasil.token, client_key: ck, snap: snapJs(ck), order_id: orderId });
    }

    /* ── pemberitahuan dari Midtrans (webhook) ───────────────── */
    if (jalur === "notifikasi" && request.method === "POST") {
      const sk = env.MIDTRANS_SERVER_KEY;
      if (!sk) return salah("Belum siap.", 500);

      const tandaTangan = await sha512(
        String(badan.order_id) + String(badan.status_code) + String(badan.gross_amount) + sk);
      if (tandaTangan !== badan.signature_key) return salah("Tanda tangan tidak cocok.", 403);

      const b = await db.prepare(`SELECT kode FROM pesanan WHERE order_id=?`).bind(badan.order_id).first();
      if (!b) return jwb({ ok: true, catatan: "Pesanan tidak dikenal." });

      const st = badan.transaction_status, penipuan = badan.fraud_status;
      if (st === "capture" && penipuan === "accept") await lunasi(env, db, b.kode, asal);
      else if (st === "settlement") await lunasi(env, db, b.kode, asal);
      else if (st === "pending") await db.prepare(`UPDATE pesanan SET status='menunggu' WHERE kode=? AND status='draf'`).bind(b.kode).run();
      else if (["deny", "cancel", "expire", "failure"].includes(st))
        await db.prepare(`UPDATE pesanan SET status='gagal' WHERE kode=? AND status<>'lunas'`).bind(b.kode).run();

      return jwb({ ok: true });
    }

    /* ── cek status; kalau perlu, tanya langsung ke Midtrans ───
       Catatan penting: kode surat itu umum — dikirim ke penerima.
       Jadi jawaban di sini TIDAK BOLEH memuat token edit.        */
    if (jalur === "status") {
      const kode = teks(url.searchParams.get("kode"), 12);
      const b = await db.prepare(`SELECT kode,status,order_id,isi FROM pesanan WHERE kode=?`).bind(kode).first();
      if (!b) return salah("Pesanan tidak ditemukan.", 404);

      const penerima = (JSON.parse(b.isi || "{}").penerima) || "";

      if (b.status !== "lunas" && b.order_id && env.MIDTRANS_SERVER_KEY) {
        const sk = env.MIDTRANS_SERVER_KEY;
        const r = await fetch(basisMidtrans(sk) + "/v2/" + encodeURIComponent(b.order_id) + "/status", {
          headers: { authorization: "Basic " + btoa(sk + ":"), accept: "application/json" }
        });
        const h = await r.json().catch(() => ({}));
        if (h.transaction_status === "settlement" ||
           (h.transaction_status === "capture" && h.fraud_status === "accept")) {
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

    /* ── halaman admin ───────────────────────────────────────── */
    if (jalur === "admin" && request.method === "POST") {
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
          delete b.isi;
          return { ...b, penerima: i.penerima || "", pengirim: i.pengirim || "" };
        });
        const hit = await db.prepare(
          `SELECT COUNT(*) n, COALESCE(SUM(jumlah),0) rp FROM pesanan WHERE status='lunas'`).first();
        return jwb({ ok: true, baris, lunas: hit.n, pendapatan: hit.rp });
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
          midtrans: !!env.MIDTRANS_SERVER_KEY && !!env.MIDTRANS_CLIENT_KEY,
          mode: sandbox(env.MIDTRANS_SERVER_KEY) ? "Sandbox (uji coba)" : "Production (sungguhan)",
          pengirim: env.EMAIL_PENGIRIM || "(belum diisi)"
        });
      }

      return salah("Aksi tidak dikenal.");
    }

    return salah("Alamat tidak dikenal: /api/" + jalur, 404);

  } catch (e) {
    return salah(e && e.message ? e.message : "Terjadi kesalahan di server.", 400);
  }
}
