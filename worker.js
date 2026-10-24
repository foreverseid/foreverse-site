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

import { onRequest as tanganiApi } from "./functions/api/[[jalur]].js";
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

export default {
  async fetch(request, env, ctx) {
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

      /* ── alamat pendek: /edit/<token> ── */
      if (/^\/edit\/[A-Za-z0-9]{8,40}\/?$/.test(p))
        return await ambilHalaman(env, url.origin, "pesan", request);

      /* ── alamat pendek: /s/<kode> ──
         Semua mesin tema (surat.html = Bait, kado-riang.html,
         langit-harapan.html, peta-perjalanan.html, zona-waktu.html,
         graduation-benih.html, confess-kunang.html, getwell-365.html,
         pasar-malam.html)
         berbagi alamat /s/<kode> yang sama. Temanya dilihat dulu di D1,
         baru file yang cocok disajikan. Bait tetap mengambil datanya
         sendiri lewat fetch client-side (lihat surat.html) — mesin-mesin
         lain datanya ditulis langsung di sini, karena mesinnya membaca
         data secara serentak (tanpa fetch) saat halamannya baru dibuka. */
      if (/^\/s\/[A-Za-z0-9]{4,16}\/?$/.test(p)) {
        const kode = p.split("/")[2];
        let baris = null;
        try { baris = env.DB && await env.DB.prepare("SELECT tema,isi,status,aktif FROM pesanan WHERE kode=?").bind(kode).first(); }
        catch (_) { baris = null; }

        if (!baris || baris.status !== "lunas" || !baris.aktif) {
          return new Response(
            "<!doctype html><meta charset=utf-8><meta name=viewport content=\"width=device-width,initial-scale=1\">" +
            "<body style=\"font-family:system-ui;background:#FAF3E8;color:#1B1B2F;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center\">" +
            "<p>Surat ini tidak ditemukan atau belum aktif.</p></body>",
            { status: 404, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
          );
        }

        const tema = baris.tema;
        const nama = tema === "kado-riang" ? "kado-riang"
          : tema === "langit-harapan" ? "langit-harapan"
          : tema === "peta-perjalanan" ? "peta-perjalanan"
          : tema === "zona-waktu" ? "zona-waktu"
          : tema === "graduation-benih" ? "graduation-benih"
          : tema === "confess-kunang" ? "confess-kunang"
          : tema === "getwell-365" ? "getwell-365"
          : tema === "pasar-malam" ? "pasar-malam"
          : "surat";
        const r = await ambilHalaman(env, url.origin, nama, request);

        if (nama === "surat") return r;   // Bait: ambil datanya sendiri lewat /api/surat

        const html = await r.text();
        const aman = JSON.stringify(JSON.parse(baris.isi || "{}")).replace(/<\/script/gi, "<\\/script");
        const ditulis = html.replace(
          /(<script id="foreverse-data" type="application\/json">\n)[\s\S]*?(\n<\/script>)/,
          "$1" + aman + "$2"
        );
        const kepala = new Headers(r.headers);
        return new Response(ditulis, { status: r.status, headers: kepala });
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
};
