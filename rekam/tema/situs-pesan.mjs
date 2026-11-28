/* Formulir /pesan diisi untuk tema Pemutaran Perdana — untuk konten video "cara bikin".
   Bukan tema: halamannya asli dari situs, dijalankan lewat simulator (`node sim.mjs`, port 8787)
   dan dibuka di alamat foreverse.id. Isiannya sama persis dengan data demo Pemutaran Perdana,
   diketik dan dipilih dengan sentuhan sungguhan. Halaman pembayaran tidak direkam. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
export const berkas = "foreverse-logo.png";   // halaman kosong dulu; formulir dibuka di main()

const SIM = process.env.SIM || "http://localhost:8787";
const AKAR = new URL("../..", import.meta.url).pathname;

export async function main(a){
  const { page, jeda } = a;
  const demo = JSON.parse(readFileSync(join(AKAR, "pemutaran-perdana-demo.html"), "utf8")
    .match(/<script id="foreverse-data"[^>]*>([\s\S]*?)\n<\/script>/)[1]);
  await page.route("https://foreverse.id/**", async r => {
    const u = new URL(r.request().url());
    const res = await r.fetch({ url: SIM + u.pathname + u.search });
    const kepala = { ...res.headers() }; delete kepala["content-security-policy"];
    return r.fulfill({ response:res, headers:kepala });
  });
  await page.goto("https://foreverse.id/pesan?tema=pemutaran-perdana", { waitUntil:"networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const ketik = async (sel, teks, jedaHuruf = 55) => {
    await page.locator(sel).scrollIntoViewIfNeeded(); await page.locator(sel).click();
    await page.locator(sel).pressSequentially(teks, { delay:jedaHuruf });
  };

  a.bagian("nama");
  await jeda(900);
  await ketik("#penerima", demo.penerima, 110);
  await ketik("#pengirim", demo.pengirim, 110);
  await jeda(500);

  a.bagian("surat");
  for (let i = 0; i < 3; i++) await ketik("#surat" + (i + 1), demo.surat[i], 4);
  await jeda(400);

  a.bagian("foto");
  await a.ketuk('[data-ke="2"]', { tunggu:900 });
  for (const [i, f] of demo.foto.entries()){
    const kotak = page.locator(`[data-file="${i}"]`);
    await page.locator(`.fotokartu[data-i="${i}"]`).scrollIntoViewIfNeeded();
    await kotak.setInputFiles(join(AKAR, f.src));
    await jeda(700);
    await page.locator(`[data-caption="${i}"]`).fill(f.caption);
    await jeda(250);
  }

  a.bagian("detail");
  await a.ketuk('[data-ke="3"]', { tunggu:900 });
  await page.locator("#jenisHariJadi").selectOption(demo.jenisHariJadi);
  await page.locator("#mulai").fill(demo.tanggalMulai);
  await ketik("#judulFilm", demo.judulFilm, 90);
  await jeda(500);
  for (let i = 0; i < 3; i++) await ketik("#lokasiF" + i, demo.lokasi[i], 8);
  for (let i = 0; i < 3; i++) await ketik("#dialogF" + i, demo.dialog[i], 4);
  await jeda(400);

  a.bagian("pratinjau");
  await a.ketuk('[data-ke="5"]', { tunggu:600 });
  await page.locator("#pvFrame").waitFor({ state:"visible", timeout:15000 }).catch(() => {});
  await page.locator("#pvFrame").scrollIntoViewIfNeeded().catch(() => {});
  await jeda(5000);
}
