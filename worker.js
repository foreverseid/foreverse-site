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

      /* ── alamat pendek: /s/<kode> dan /edit/<token> ── */
      let halaman = null;
      if (/^\/s\/[A-Za-z0-9]{4,16}\/?$/.test(p)) halaman = "surat";
      else if (/^\/edit\/[A-Za-z0-9]{8,40}\/?$/.test(p)) halaman = "pesan";

      if (halaman) return await ambilHalaman(env, url.origin, halaman, request);

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
