/* Bait (Birthday) — kotak pos, pisau surat, perangko umur, rak kartu pos,
   kertas tipis, kartu ucapan, timbangan pos, bendera kotak pos. */
export const berkas = "bait-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const U = await page.evaluate(() => Math.min(innerWidth/100, innerHeight/200));
  const lanjut = () => a.ketuk("button.lanjut.tampil", { tunggu:1200 });

  a.bagian("kotak-pos");
  await jeda(1500);
  await a.seretEl("#pintu0", { dx:0, dy:U*44 }, { tunggu:900 });
  await a.seretEl("#ampDalam", { dx:0, dy:U*60 }, { tunggu:1500 });

  a.bagian("pisau-surat");
  const p = await page.evaluate(() => {
    const ps = document.getElementById("pisau"), am = document.getElementById("ampl"), w = document.getElementById("amplWrap").getBoundingClientRect(), u = Math.min(innerWidth/100, innerHeight/200);
    const r = ps.getBoundingClientRect();
    return { x:r.left + r.width/2, y:r.top + r.height/2, px:w.left + parseFloat(ps.style.left), py:w.top + parseFloat(ps.style.top) + ps.offsetHeight/2,
      ax:w.left + am.offsetLeft + u*1.5, ay:w.top + am.offsetTop + u*1.55, akhir:w.left + am.offsetLeft + am.offsetWidth };
  });
  a.stat.aksi++;
  await page.mouse.move(p.x, p.y, { steps:6 }); await page.mouse.down();
  await page.mouse.move(p.x + (p.ax - p.px), p.y + (p.ay - p.py), { steps:20 }); await jeda(300);
  await page.mouse.move(p.x + (p.akhir - p.px) + 20, p.y + (p.ay - p.py), { steps:30 }); await page.mouse.up();
  await jeda(3000);

  a.bagian("perangko-umur");
  await a.seretEl(page.locator("#lembar .prk").first(), "#slotBaru", { langkah:30, tunggu:3200 });
  await lanjut();

  a.bagian("rak-kartu-pos");
  const n = await page.locator("#rakPutar .rak-muka").count();
  const rk = await page.locator("#rakPutar").boundingBox(), rx = rk.x + rk.width/2, ry = rk.y + rk.height/2;
  for (let i = 0; i < n; i++){
    if (i){ await a.seret(rx, ry, rx - 120, ry, { langkah:22 }); await jeda(800); }
    a.stat.aksi++; await page.mouse.click(rx, ry); await jeda(900);
    await a.ketuk("#lihatKartu", { tunggu:900 });
    await a.baca("#lkKet");
    const k = await page.locator("#lihat").boundingBox();
    a.stat.aksi++; await page.mouse.click(k.x + 12, k.y + 12); await jeda(700);
  }
  await lanjut();

  if (await page.locator("#tipis").isVisible()){
    a.bagian("kertas-tipis");
    await a.seretEl("#tipis", "#cahaya", { langkah:30, tunggu:1200 });
    await a.baca("#tipisTeks");
    await lanjut();
  }

  a.bagian("kartu-ucapan");
  const lbr = page.locator("#kartu .lbr");
  const m = await lbr.count();
  for (let i = 0; i < m; i++){
    await a.baca(lbr.nth(i));
    if (i < m - 1) await a.seretEl(lbr.nth(i), { dx:0, dy:-(await lbr.nth(i).boundingBox()).height*.6 }, { tunggu:900 });
  }
  await lanjut();

  a.bagian("timbangan-pos");
  const pilih = await page.evaluate(() => {
    const b = [...document.querySelectorAll("#nampan .brg")], g = b.map(x => x._g);
    b.forEach((x, i) => x.dataset.uji = i);
    const T = +document.querySelector("#syarat b").textContent.replace(/\D/g, "");
    for (let s = 1; s < 1 << g.length; s++){ let t = 0; g.forEach((v, i) => { if (s & 1 << i) t += v; }); if (t === T) return g.map((v, i) => s & 1 << i ? i : -1).filter(i => i >= 0); }
    return [];
  });
  await a.baca("#syarat");
  for (const i of pilih) await a.seretEl(`.brg[data-uji="${i}"]`, "#piring", { langkah:25, tunggu:900 });
  await jeda(1400);
  await lanjut();

  a.bagian("bendera-penutup");
  await jeda(1800);
  const bd = await page.locator("#bendera").boundingBox();
  const ln = await page.locator("#lengan").boundingBox();
  a.stat.aksi++;
  await page.mouse.move(ln.x + ln.width/2, ln.y + ln.height/2, { steps:6 }); await page.mouse.down();
  await page.mouse.move(bd.x + bd.width/2 + 40, bd.y + bd.height/2 - 30, { steps:10 });
  await page.mouse.move(bd.x + bd.width/2, bd.y + bd.height/2 - 120, { steps:14 }); await page.mouse.up();
  await jeda(1500);
  await page.locator("#balas.tampil").waitFor({ timeout:8000 });
}
