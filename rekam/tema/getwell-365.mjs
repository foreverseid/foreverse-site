/* 36,5 (Get Well Soon) — termometer, kompres, tuang sirup, segelas air,
   tirai jendela (foto), blok resep (surat), matikan lampu. */
export const berkas = "getwell-365-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const U = await page.evaluate(() => Math.min(innerWidth/100, innerHeight/200));
  a.bagian("termometer");
  await jeda(1500);
  await a.tahan("#termometer", 1500, { tunggu:2000 });
  await a.lanjut();

  a.bagian("kompres");
  await a.seretEl("#handuk", "#baskom", { langkah:20, tunggu:700 });
  await a.seretEl("#handuk", "#bantal", { langkah:20, tunggu:1200 });
  await a.baca("#catatan");
  await a.lanjut();

  a.bagian("sirup");
  const n = await page.evaluate(() => (JSON.parse(document.getElementById("foreverse-data").textContent).dosis || []).length || 1);
  for (let r = 0; r < n; r++){ await a.tahan("#tuang", Math.round(67 / (55 + r*20) * 1000), { tunggu:900 }); }
  await a.baca("#resepDosis");
  await a.lanjut();

  a.bagian("segelas-air");
  const g = await page.locator("#gelas").boundingBox(), gx = g.x + g.width/2, gy = g.y + g.height/2;
  a.stat.aksi++; await page.mouse.move(gx, gy, { steps:4 }); await page.mouse.down();
  await page.mouse.move(gx, gy - U*32, { steps:10 });
  for (let i = 0; i < 160 && !(await page.locator("#judulAir.tampil").isVisible()); i++){ await page.mouse.move(gx + (i % 2 ? 2 : -2), gy - U*32); await jeda(20); }
  await page.mouse.up(); await jeda(600);
  await a.baca("#pesanAir");
  await a.lanjut();

  if (await page.locator("#s4").count() && await page.evaluate(() => JSON.parse(document.getElementById("foreverse-data").textContent).foto.length)){
    a.bagian("tirai-jendela");
    for (let i = 0; i < 6 && !(await page.locator("#lanjut.tampil").isVisible()); i++){
      await a.seretEl("#tali", { dx:0, dy:U*22 }, { tunggu:1300 });
      await a.baca("#jdKet");
    }
    await a.lanjut();
  }

  a.bagian("resep");
  const lb = page.locator("#blokResep .lembar");
  const m = await lb.count();
  for (let i = m - 1; i >= 0; i--){
    await a.baca(lb.nth(i).locator("p"));
    if (i > 0) await a.seretEl(lb.nth(i), { dx:0, dy:U*30 }, { tunggu:600 });
  }
  await a.lanjut();

  a.bagian("lampu");
  await a.ketuk("#lampu", { tunggu:3500 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
