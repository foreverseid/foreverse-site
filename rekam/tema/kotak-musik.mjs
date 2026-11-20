/* Kotak Musik Diservis (Apology) — kain dibuka, roda gigi dipasang (3 isian
   "yang aku sadari"), laci foto, kunci diputar, struk servis, stempel status. */
export const berkas = "kotak-musik-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = async sel => page.locator(sel).first().boundingBox();
  const lanjut = async () => { await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("tanda-terima");
  await jeda(1200); await a.baca("#tiketAwal");
  for (const [sel, arah] of [["#kainKiri", -1], ["#kainKanan", 1]]){
    const b = await kotak(sel); const x = b.x + b.width/2, y = b.y + b.height/2;
    await a.seret(x, y, x + arah*b.width*1.2, y, { langkah:20 }); await jeda(800);
  }
  await lanjut();

  a.bagian("roda-gigi");
  for (let n = 0; n < 3; n++){
    const r = await page.evaluate(() => {
      const asEl = document.querySelector(".as.kosong"), as = asEl.getBoundingClientRect();
      const r = (parseFloat(asEl.style.getPropertyValue("--d").match(/\*([\d.]+)/)[1]) - 2.2) / 2;
      const gir = [...document.querySelectorAll("#nampanGir .gir")].filter(g => !g._pasang && Math.abs(g._r - r) < .01)
        .map(g => ({ b:g.getBoundingClientRect() }));
      const g = gir[0].b; return { gx:g.x + g.width/2, gy:g.y + g.height/2, ax:as.x + as.width/2, ay:as.y + as.height/2 };
    });
    await a.seret(r.gx, r.gy, r.ax, r.ay, { langkah:25 }); await jeda(900);
    await a.baca("#slip");
  }
  await page.locator("#lanjut.tampil").waitFor({ timeout:15000 }); await lanjut();

  a.bagian("laci-foto");
  { const b = await kotak("#laci"); const x = b.x + b.width/2, y = b.y + b.height/2; await a.seret(x, y, x, y + b.height*2.5, { langkah:20 }); await jeda(1000); }
  while (await page.locator("#isiLaci .ft:not(.dilihat)").count()){
    const p = await page.evaluate(() => {
      const f = document.querySelector("#isiLaci .ft:not(.dilihat)"), b = f.getBoundingClientRect();
      for (let fy = .2; fy <= .9; fy += .1) for (let fx = .1; fx <= .9; fx += .1){
        const x = b.x + b.width*fx, y = b.y + b.height*fy, e = document.elementFromPoint(x, y);
        if (e && f.contains(e)) return { x, y };
      } return { x:b.x + b.width/2, y:b.y + b.height/2 };
    });
    await a.seret(p.x, p.y, p.x, p.y, { langkah:1 }); await jeda(900);
    await a.baca("#angkat .label");
    await a.ketuk("#angkat", { tunggu:700 });
  }
  await lanjut();

  a.bagian("kunci");
  { const b = await kotak("#kunci"), cx = b.x + b.width/2, cy = b.y + b.height/2, R = b.width*0.42;
    a.stat.aksi++; await page.mouse.move(cx, cy - R); await page.mouse.down();
    for (let d = 0; d <= 1120; d += 15){ const t = (d - 90) * Math.PI/180; await page.mouse.move(cx + R*Math.cos(t), cy + R*Math.sin(t)); await jeda(12); }
    await page.mouse.up(); }
  await page.locator("#lanjut.tampil").waitFor({ timeout:15000 }); await lanjut();

  a.bagian("struk");
  for (let n = 0; n < 8 && !(await page.locator("#lanjut.tampil").count()); n++){
    const b = await kotak("#struk"), x = b.x + b.width/2, y = b.y + Math.min(b.height - 8, 30);
    const sebelum = await page.evaluate(() => document.getElementById("struk").offsetHeight);
    await a.seret(x, y, x, Math.max(20, y - 320), { langkah:30 }); await jeda(500);
    const sesudah = await page.evaluate(() => document.getElementById("struk").offsetHeight);
    a.stat.huruf += 0; if (sesudah === sebelum) await jeda(300);
  }
  await a.baca("#strukIsi");
  await page.locator("#lanjut.tampil").waitFor({ timeout:15000 }); await lanjut();

  a.bagian("status");
  await a.baca("#tiketAkhir");
  await a.ketuk(".stempel >> nth=0", { tunggu:1500 });
  await a.baca("#balas");
}
