/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · penyaji foto
   Alamat /f/<kode>/<nama-file> mengambil foto dari R2 (kalau ada),
   atau dari database D1 (kalau R2 tidak dipakai).
   ══════════════════════════════════════════════════════════════════ */

export async function onRequestGet({ params, env, request }) {
  const kunci = (Array.isArray(params.jalur) ? params.jalur.join("/") : String(params.jalur || ""));
  if (!kunci || kunci.includes("..")) return new Response("Tidak ditemukan", { status: 404 });

  const simpanLama = { "cache-control": "public, max-age=31536000, immutable" };

  /* R2 dulu */
  if (env.FOTO) {
    const obj = await env.FOTO.get(kunci);
    if (obj) {
      const h = new Headers(simpanLama);
      obj.writeHttpMetadata(h);
      h.set("etag", obj.httpEtag);
      if (request.headers.get("if-none-match") === obj.httpEtag)
        return new Response(null, { status: 304, headers: h });
      return new Response(obj.body, { headers: h });
    }
  }

  /* cadangan: tersimpan di D1 */
  if (env.DB) {
    const b = await env.DB.prepare(`SELECT mime, isi FROM foto WHERE kunci=?`).bind(kunci).first();
    if (b && b.isi) {
      const data = b.isi instanceof ArrayBuffer ? b.isi : new Uint8Array(b.isi);
      return new Response(data, {
        headers: { ...simpanLama, "content-type": b.mime || "image/jpeg" }
      });
    }
  }

  return new Response("Foto tidak ditemukan", { status: 404 });
}
