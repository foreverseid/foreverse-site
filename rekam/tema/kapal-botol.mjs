/* Kapal dalam Botol (Anniversary) — gabus, kapal masuk botol, benang layar,
   simpul per tahun (tahan), gulungan surat, tinta jeruk nipis. */
export const berkas = "kapal-botol-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const U = await page.evaluate(() => { const p = document.createElement("div"); p.style.cssText = "position:fixed;width:calc(var(--u)*100)"; document.body.appendChild(p); const w = p.getBoundingClientRect().width / 100; p.remove(); return w; });
  a.bagian("botol");
  await jeda(1500);
  await a.seretEl("#gabus", { dx:U*16, dy:0 }, { tunggu:1000 });
  await a.seretEl("#kapal", "#mulut", { langkah:30, tunggu:1500 });
  for (let i = 0; i < 12; i++){
    if (await page.locator("#lanjut.tampil").isVisible()) break;
    if (await page.locator("#lihat.tampil").isVisible()){ await a.baca("#lihatKet"); await a.ketuk("#lihat", { tunggu:600 }); continue; }
    await a.seretEl("#cincin", { dx:U*12, dy:0 }, { tunggu:1300 });
  }
  await a.lanjut();

  a.bagian("simpul-tahun");
  const n = await page.locator("#tali .simpul").count();
  for (let i = 0; i < n; i++) await a.tahan("#ikat", 1250, { tunggu:500 });
  await a.lanjut();

  a.bagian("kompas");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    const k = await page.locator("#kompas").boundingBox(), cx = k.x + k.width/2, cy = k.y + k.height/2, R = k.width*0.3;
    const sudut = await page.locator("#jarumK").evaluate(e => parseFloat(e.style.getPropertyValue("--r")) || 0);
    const target = [70,205,315][i];
    let d = ((target - sudut) % 360 + 540) % 360 - 180;
    a.stat.aksi++; let s = sudut;
    const xy = deg => [cx + Math.sin(deg*Math.PI/180)*R, cy - Math.cos(deg*Math.PI/180)*R];
    await page.mouse.move(...xy(s)); await page.mouse.down();
    const langkah = Math.ceil(Math.abs(d)/6);
    for (let j = 1; j <= langkah; j++){ await page.mouse.move(...xy(s + d*j/langkah)); await jeda(14); }
    await page.mouse.up(); await jeda(700);
    await a.baca(`#logKapal li >> nth=${i}`);
    if (i === 2) await a.jepret("kompas-isi");
  }
  await a.lanjut();

  a.bagian("gulungan-surat");
  for (let i = 0; i < 8 && !(await page.locator("#lanjut.tampil").isVisible()); i++){
    const b = await page.locator("#rolBawah").boundingBox();
    await a.seret(b.x + b.width/2, b.y + b.height/2, b.x + b.width/2, b.y + b.height/2 + 260); await jeda(500);
  }
  await a.baca("#kertasIsi");
  await a.lanjut();

  if (await page.locator("#tinta").count() && await page.locator("#s5").isVisible()){
    a.bagian("tinta-rahasia");
    const t = await page.locator("#tinta").boundingBox(), l = await page.locator("#lentera").boundingBox();
    const lx = l.x + l.width/2, ly = l.y + l.height/2;
    a.stat.aksi++; await page.mouse.move(lx, ly, { steps:5 }); await page.mouse.down();
    for (let r = 0; r <= 4; r++){ const y = t.y + t.height * r / 4 + l.height * .3;
      await page.mouse.move(r % 2 ? t.x + t.width : t.x, y, { steps:16 }); }
    await page.mouse.up(); await jeda(800);
    await a.baca("#tinta");
    await a.lanjut();
  }
  a.bagian("penutup");
  await jeda(1500);
}
