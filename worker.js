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

      /* ── alamat pendek: /s/<kode> dan /edit/<kode> ── */
      let halaman = null;
      if (/^\/s\/[A-Za-z0-9]{4,16}\/?$/.test(p)) halaman = "/surat.html";
      else if (/^\/edit\/[A-Za-z0-9]{8,40}\/?$/.test(p)) halaman = "/pesan.html";

      if (halaman) {
        const r = await env.ASSETS.fetch(new Request(url.origin + halaman, request));
        return new Response(r.body, {
          status: r.status,
          headers: { ...Object.fromEntries(r.headers), "cache-control": "no-store" }
        });
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
