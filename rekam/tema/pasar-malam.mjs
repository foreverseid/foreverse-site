/* Pasar Malam (Ask Out) — terpal gerbang, lempar gelang ke botol rencana,
   gula kapas (alasan), bianglala + surat berlipat, pancing botol yang
   meleset, papan lampu (pilih malam). */
export const berkas = "pasar-malam-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("gerbang");
  await jeda(1500);
  await a.seretEl("#terpalKa", { dx:230, dy:0 }, { langkah:30, tunggu:1500 });

  a.bagian("lempar-gelang");
  await page.locator("#sGelang").evaluate(e => e.scrollIntoView({ block:"center" })); await jeda(900);
  await a.baca("#stGelang");
  const W = (await page.locator("#stGelang").boundingBox()).width;
  for (const bx of [15, 38.3, 85]){
    await page.locator("#gelang").waitFor(); await jeda(300);
    await a.seretEl("#gelang", { dx: -((bx - 50) / 100 * W) / 2.3, dy:90 }, { langkah:18, tunggu:1700 });
  }
  await a.baca("#acaraList");

  a.bagian("gula-kapas");
  await page.locator("#gulaPad").evaluate(e => e.scrollIntoView({ block:"center" })); await jeda(900);
  const g = await page.locator("#gulaPad").boundingBox(), cx = g.x + g.width/2, cy = g.y + g.height/2, R = g.width * .35;
  a.stat.aksi++;
  await page.mouse.move(cx + R, cy); await page.mouse.down();
  for (let s = 0; s <= 900; s += 12){ const r = s * Math.PI / 180; await page.mouse.move(cx + R*Math.cos(r), cy + R*Math.sin(r)); await jeda(14); }
  await page.mouse.up(); await jeda(800);
  await a.baca("#lapisAlasan");

  a.bagian("bianglala-surat");
  for (let i = 0; i < 60 && !(await page.locator("#puncak").isVisible()); i++){ await page.mouse.wheel(0, 120); await jeda(80); }
  await jeda(900);
  await a.baca("#stRoda");
  await a.ketuk("#tarikSurat", { tunggu:900 });
  const flap = page.locator(".lipat:not(.buka) .flap");
  for (let i = 0; i < 4 && await flap.count(); i++) await a.seretEl(flap.first(), { dx:0, dy:60 }, { tunggu:600 });
  await a.baca("#surat");

  a.bagian("pancing");
  await page.locator("#sPancing").evaluate(e => e.scrollIntoView({ block:"center" })); await jeda(900);
  const st = await page.locator("#stPancing").boundingBox();
  const sisa = await page.locator("#stPancing .botolP").evaluateAll(b => b.filter(x => x.dataset.sisa !== "sudah").map(x => +x.dataset.x));
  for (const x of sisa){
    a.stat.aksi++;
    await page.mouse.move(st.x + st.width*x/100, st.y + st.height*.4); await page.mouse.down();
    for (let i = 0; i < 80; i++){ await jeda(60); if (await page.locator(`#stPancing .botolP[data-x="${x}"][data-sisa="sudah"]`).count()) break; }
    await page.mouse.up(); await jeda(500);
  }
  await a.baca("#pancingKet");

  a.bagian("papan-lampu");
  await a.ketuk("#bohlam", { tunggu:500 });
  await a.ketuk(page.locator("#fittingBaris .fitting").first(), { tunggu:600 });
  await a.seretEl("#fittingBaris .fitting.terisi .soket", { dx:75, dy:0 }, { langkah:16, tunggu:1500 });
  await a.baca("#hasil");
}
