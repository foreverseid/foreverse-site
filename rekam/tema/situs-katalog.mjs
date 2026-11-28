/* Katalog tema foreverse.id/template — untuk konten video (ajakan "coba contohnya").
   Bukan tema: halamannya asli dari situs, dijalankan lewat simulator (`node sim.mjs`, port 8787)
   dan dibuka di alamat foreverse.id. Daftar tema digulir pelan dari atas. */
export const berkas = "foreverse-logo.png";   // halaman kosong dulu; halaman situs dibuka di main()

const SIM = process.env.SIM || "http://localhost:8787";

export async function main(a){
  const { page, jeda } = a;
  await page.route("https://foreverse.id/**", async r => {
    const u = new URL(r.request().url());
    const res = await r.fetch({ url: SIM + u.pathname + u.search });
    return r.fulfill({ response:res });
  });
  await page.goto("https://foreverse.id/template", { waitUntil:"networkidle" });
  await page.evaluate(() => document.fonts.ready);

  a.bagian("katalog");
  await jeda(1500);
  for (let i = 0; i < 14; i++){ await page.mouse.wheel(0, 140); await jeda(260); }
  await jeda(1200);
}
