/* Halaman "Suratnya sudah jadi" (selesai) dengan pilihan kode QR — untuk konten video.
   Bukan tema: halamannya asli dari situs, dijalankan lewat simulator (`node sim.mjs`, port 8787)
   dan dibuka di alamat foreverse.id supaya tautan yang tampil sama dengan aslinya.
   Hanya jawaban /api/status yang diganti pesanan contoh berstatus lunas (pesanan Amira). */
export const berkas = "foreverse-logo.png";   // halaman kosong dulu; halaman situs dibuka di main()

const SIM = process.env.SIM || "http://localhost:8787";
const KODE = "k7m2qa9xfe";

export async function main(a){
  const { page, jeda } = a;
  await page.route("https://foreverse.id/**", async r => {
    const u = new URL(r.request().url());
    if (u.pathname === "/api/status")
      return r.fulfill({ json:{ ok:true, status:"lunas", kode:KODE, penerima:"Amira", bisa_ingat:false } });
    const res = await r.fetch({ url: SIM + u.pathname + u.search });
    /* situs asli menyajikan halaman ini langsung dari Assets tanpa header CSP worker
       (dicek dengan curl 28 Nov 2026), jadi pustaka QR dari cdnjs boleh dimuat */
    const kepala = { ...res.headers() }; delete kepala["content-security-policy"];
    return r.fulfill({ response:res, headers:kepala });
  });
  await page.goto("https://foreverse.id/selesai?kode=" + KODE, { waitUntil:"networkidle" });
  await page.evaluate(() => document.fonts.ready);

  a.bagian("jadi");
  await page.locator("#tJadi.on").waitFor({ timeout:15000 });
  await jeda(1600);

  a.bagian("qr");
  await a.ketuk("#qrBuka", { tunggu:900 });
  await page.locator("#qrKanvas").scrollIntoViewIfNeeded();
  await jeda(1400);
  for (const b of ["amplop", "sederhana", "hati"]){
    await a.ketuk(`[data-bentuk="${b}"]`, { tunggu:1300 });
  }
  await jeda(800);
}
