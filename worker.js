/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · pintu masuk Worker

   File ini yang membuat Cloudflare mengenali project sebagai Worker
   yang punya kode — bukan cuma kumpulan file statis. Tanpa ini,
   Bindings dan Secrets tidak bisa dipasang.

   Tugasnya cuma mengarahkan:
     /api/...      → logika sistem pesanan
     /f/...        → foto pelanggan
     /s/<kode>     → halaman surat
     /edit/<kode>  → halaman ubah surat
     selain itu    → file biasa (index.html, gambar, dll)
   ══════════════════════════════════════════════════════════════════ */

import { onRequest as tanganiApi, rawatHarian, infoGerbang, isiUntukPenerima } from "./functions/api/[[jalur]].js";
import { halamanGerbang } from "./functions/gerbang.js";
import { onRequestGet as tanganiFoto } from "./functions/f/[[jalur]].js";

/* Ambil satu halaman statis TANPA membiarkan pengalihan sampai ke browser.

   Cloudflare menjawab permintaan "/surat.html" dengan pengalihan 307 ke
   "/surat". Kalau pengalihan itu diteruskan ke browser, alamat berubah dari
   "/s/nyk67z" menjadi "/surat" — kodenya hilang, dan suratnya tidak bisa
   dibuka. Jadi pengalihannya diikuti di sini, di server, dan browser hanya
   menerima isi halamannya. */
async function ambilHalaman(env, asal, nama, request) {
  async function minta(alamat) {
    let r = await env.ASSETS.fetch(new Request(alamat, request));
    for (let i = 0; i < 3 && r.status >= 300 && r.status < 400; i++) {
      const tujuan = r.headers.get("location");
      if (!tujuan) break;
      r = await env.ASSETS.fetch(new Request(new URL(tujuan, asal).toString(), request));
    }
    return r;
  }

  let r = await minta(asal + "/" + nama);
  if (r.status !== 200) r = await minta(asal + "/" + nama + ".html");

  const kepala = new Headers(r.headers);
  kepala.delete("location");
  kepala.set("cache-control", "no-store");
  kepala.set("content-type", "text/html; charset=utf-8");
  return new Response(r.body, { status: r.status, headers: kepala });
}

/* ── header keamanan untuk SEMUA jawaban ──
   CSP sengaja dibatasi ke yang tidak bisa merusak tema: tema memakai
   skrip & gaya sebaris, Google Fonts, foto blob/data, dan audio unggahan. */
const KEAMANAN = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "content-security-policy": "base-uri 'self'; object-src 'none'; frame-ancestors 'self'"
};
function pasangKeamanan(r, jalur) {
  const kepala = new Headers(r.headers);
  for (const [k, v] of Object.entries(KEAMANAN)) kepala.set(k, v);
  /* lapis kedua di samping robots.txt & meta noindex: halaman pribadi tidak diindeks */
  if (/^\/(s|edit|f|api|developer)(\/|$|\.)|^\/(pesan|selesai)/.test(jalur || ""))
    kepala.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(r.body, { status: r.status, statusText: r.statusText, headers: kepala });
}

/* Skrip kecil yang disisipkan ke setiap /s/<kode>: mengabari server bahwa
   surat dibuka, kecuali di perangkat yang baru saja membayar surat itu
   (penanda "fv-edit-<kode>" dipasang pesan.html saat memesan atau membuka tautan edit),
   dan kecuali dibuka dari /developer (alamat berakhiran ?pratinjau=1). */
function sisipDibuka(html, kode) {
  const skrip = "<script>(function(){if(/[?&]pratinjau=1/.test(location.search))return;try{if(localStorage.getItem(\"fv-edit-" + kode +
    "\"))return}catch(_){}fetch(\"/api/dibuka\",{method:\"POST\",headers:{\"content-type\":\"application/json\"}," +
    "body:JSON.stringify({kode:\"" + kode + "\"}),keepalive:true}).catch(function(){})})()</script>";
  const i = html.lastIndexOf("</body>");
  return i < 0 ? html + skrip : html.slice(0, i) + skrip + html.slice(i);
}

export default {
  async fetch(request, env, ctx) {
    return pasangKeamanan(await tangani(request, env, ctx), new URL(request.url).pathname);
  },
  /* Cron Trigger harian (wrangler.jsonc → triggers.crons): pengingat masa
     simpan, penghapusan surat yang masanya habis, dan pembersihan draf. */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(rawatHarian(env));
  }
};

async function tangani(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;

    try {
      /* ── sistem pesanan ── */
      if (p === "/api" || p.startsWith("/api/")) {
        return await tanganiApi({
          request,
          env,
          params: {},
          waitUntil: (janji) => ctx.waitUntil(janji)
        });
      }

      /* ── foto pelanggan ── */
      if (p.startsWith("/f/")) {
        return await tanganiFoto({
          request,
          env,
          params: { jalur: p.slice(3).split("/").filter(Boolean) }
        });
      }

      /* ── www.foreverse.id → foreverse.id ──
         Satu alamat saja, supaya Cloudflare Access (yang memagari
         /developer di foreverse.id) tidak bisa dilewati lewat www. */
      if (url.hostname.startsWith("www.")) {
        url.hostname = url.hostname.slice(4);
        return Response.redirect(url.toString(), 301);
      }

      /* ── halaman beranda yang terpisah: satu berkas index.html ── */
      if (/^\/(template|momen|contoh|cara-pesan|harga|faq)\/?$/.test(p))
        return await ambilHalaman(env, url.origin, "index", request);

      /* ── alamat pendek: /edit/<token> ── */
      if (/^\/edit\/[A-Za-z0-9]{8,40}\/?$/.test(p))
        return await ambilHalaman(env, url.origin, "pesan", request);

      /* ── alamat pendek: /s/<kode> ──
         Semua mesin tema (surat.html = Bait, kado-riang.html,
         langit-harapan.html, peta-perjalanan.html, zona-waktu.html,
         graduation-benih.html, confess-kunang.html, getwell-365.html,
         pasar-malam.html, lewat-duluan.html, kasus-pengirim.html, rumah-contoh.html,
         rekonstruksi.html)
         berbagi alamat /s/<kode> yang sama. Temanya dilihat dulu di D1,
         baru file yang cocok disajikan. Bait tetap mengambil datanya
         sendiri lewat fetch client-side (lihat surat.html) — mesin-mesin
         lain datanya ditulis langsung di sini, karena mesinnya membaca
         data secara serentak (tanpa fetch) saat halamannya baru dibuka. */
      if (/^\/s\/[A-Za-z0-9]{4,16}\/?$/.test(p)) {
        const kode = p.split("/")[2];
        let baris = null;
        try { baris = env.DB && await env.DB.prepare("SELECT tema,isi,status,aktif,simpan_sampai FROM pesanan WHERE kode=?").bind(kode).first(); }
        catch (_) { baris = null; }

        if (!baris || baris.status !== "lunas" || !baris.aktif) {
          return new Response(
            "<!doctype html><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\">" +
            "<body style=\"font-family:system-ui;background:#FAF3E8;color:#1B1B2F;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center\">" +
            "<p>" + (baris && baris.simpan_sampai && baris.simpan_sampai <= Date.now()
              ? "Masa simpan surat ini sudah habis, jadi isi dan fotonya sudah kami hapus untuk menjaga privasi kalian."
              : "Surat ini tidak ditemukan atau belum aktif.") + "</p></body>",
            { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
          );
        }

        /* kunci pembuka: selama belum terbuka, yang disajikan hanya gerbangnya */
        let isiPenuh = {};
        try { isiPenuh = JSON.parse(baris.isi || "{}"); } catch (_) {}
        const gerbang = infoGerbang(isiPenuh, request.headers.get("cookie"), kode);
        if (gerbang)
          return new Response(halamanGerbang(gerbang, kode), {
            headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
          });

        const tema = baris.tema;
        const nama = tema === "kado-riang" ? "kado-riang"
          : tema === "langit-harapan" ? "langit-harapan"
          : tema === "peta-perjalanan" ? "peta-perjalanan"
          : tema === "zona-waktu" ? "zona-waktu"
          : tema === "graduation-benih" ? "graduation-benih"
          : tema === "confess-kunang" ? "confess-kunang"
          : tema === "getwell-365" ? "getwell-365"
          : tema === "pasar-malam" ? "pasar-malam"
          : tema === "lewat-duluan" ? "lewat-duluan"
          : tema === "kasus-pengirim" ? "kasus-pengirim"
          : tema === "rekonstruksi" ? "rekonstruksi"
          : tema === "rumah-contoh" ? "rumah-contoh"
          : "surat";
        const r = await ambilHalaman(env, url.origin, nama, request);

        const html = await r.text();
        if (nama === "surat")   // Bait: ambil datanya sendiri lewat /api/surat
          return new Response(sisipDibuka(html, kode), { status: r.status, headers: new Headers(r.headers) });

        const aman = JSON.stringify(isiUntukPenerima(isiPenuh)).replace(/<\/script/gi, "<\\/script");
        const ditulis = html.replace(
          /(<script id="foreverse-data" type="application\/json">\n)[\s\S]*?(\n<\/script>)/,
          "$1" + aman + "$2"
        );
        const kepala = new Headers(r.headers);
        return new Response(sisipDibuka(ditulis, kode), { status: r.status, headers: kepala });
      }

      /* ── sisanya: file biasa ── */
      return await env.ASSETS.fetch(request);

    } catch (e) {
      return new Response(
        JSON.stringify({ ok: false, pesan: (e && e.message) || "Kesalahan tak terduga." }),
        { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
      );
    }
}
