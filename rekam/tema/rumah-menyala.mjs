/* Rumah yang Menyala (Natal) — lonceng, kabel lampu 3×3 + ornamen harapan,
   kaus kaki berisi foto, kereta rusa ke cerobong, pita kado (surat), bintang. */
export const berkas = "rumah-menyala-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  const lanjut = async () => { await page.locator("#lanjut.tampil").waitFor({ timeout:30000 }); await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("pintu");
  await jeda(1200);
  for (let i = 0; i < 2; i++){ const p = await pusat("#pegangan"); await a.seret(p.x, p.y, p.x, p.y + 140, { langkah:15 }); await jeda(900); }
  await page.locator("#ucapAwal.tampil").waitFor(); await a.baca("#ucapAwal");
  await lanjut();

  a.bagian("lampu");
  await jeda(800);
  for (let n = 0; n < 12 && await page.locator("#papanUbin .ubin.salah").count(); n++) await a.ketuk("#papanUbin .ubin.salah", { tunggu:350 });
  await page.locator("#pohonKecil .ornamen.muncul").first().waitFor({ timeout:8000 }); await jeda(1500);
  const orn = await page.locator("#pohonKecil .ornamen").count();
  for (let i = 0; i < orn; i++){
    await a.ketuk(page.locator("#pohonKecil .ornamen").nth(i), { tunggu:500 });
    await a.baca("#bacaHarapan"); await a.ketuk("#bacaHarapan", { tunggu:500 });
  }
  await a.jepret("pohon-isi");
  await lanjut();

  a.bagian("perapian");
  const kaos = await page.locator("#kaosBaris .kaos").count();
  for (let i = 0; i < kaos; i++){
    const p = await pusat(`#kaosBaris .kaos >> nth=${i}`); await a.seret(p.x, p.y, p.x, p.y + 160, { langkah:15 }); await jeda(1100);
    await a.ketuk("#perapian .polaroid:not(.dilihat)", { tunggu:600 });
    await a.baca("#angkatKet"); await a.ketuk("#angkat", { tunggu:500 });
  }
  await lanjut();

  a.bagian("kereta-rusa");
  { const k = await kotak("#kereta"), c = await pusat("#kota .rumah:has(.nama) .cer");
    const dari = { x:k.x + k.width/2, y:k.y + k.height/2 }, dx = c.x - (k.x + k.width*0.72);
    await a.seret(dari.x, dari.y, dari.x + dx, dari.y, { langkah:25 }); }
  await lanjut();

  a.bagian("kado");
  { const e = await pusat("#ekor"); await a.seret(e.x, e.y, e.x + 40, e.y + 200, { langkah:20 }); }
  await page.locator("#kartu.tampil").waitFor(); await a.baca("#kartu");
  await lanjut();

  a.bagian("bintang");
  { const b = await pusat("#bintang"), t = await pusat("#targetBintang"); await a.seret(b.x, b.y, t.x, t.y, { langkah:25 }); }
  await page.locator("#balas.tampil").waitFor({ timeout:8000 }); await a.baca("#balasJudul");
}
