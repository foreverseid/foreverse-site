/* Hitung Mundur di Atap (Tahun Baru) — gesek korek, angka 10→1, ketapel
   kembang api (rencana), sumbu foto, telusuri hati (surat), bersulang. */
export const berkas = "hitung-mundur-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const aktif = n => page.locator(`#s${n}.aktif`).waitFor({ timeout:30000 });   // maju otomatis
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("korek");
  await aktif(0); await jeda(1200);
  { const k = await kotak("#korek"), g = await kotak("#geseran");
    const U = await page.evaluate(() => Math.min(innerWidth, innerHeight) / 100);
    const px = k.x + k.width/2, py = k.y + k.height/2, hx = k.x + U*3 - px, hy = k.height/2 - k.height/2;
    const gy = g.y + g.height/2 - hy;
    a.stat.aksi++; await page.mouse.move(px, py); await page.mouse.down();
    await page.mouse.move(g.x + 6 - hx, gy, { steps:8 }); await jeda(80);
    await page.mouse.move(g.x + g.width - 6 - hx, gy, { steps:5 }); await page.mouse.up(); }
  await page.locator("#judulAwal.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAwal");

  a.bagian("hitung-mundur");
  await aktif(1); await jeda(800);
  for (let n = 10; n >= 1; n--){
    const p = await page.evaluate(n => { const b = [...document.querySelectorAll("#arena .angka")].find(e => e.querySelector("b").textContent === String(n)).getBoundingClientRect(); return { x:b.x + b.width/2, y:b.y + b.height/2 }; }, n);
    a.stat.aksi++; await page.mouse.click(p.x, p.y); await jeda(350);
  }

  a.bagian("ketapel");
  await aktif(2); await jeda(900);
  { const r = await pusat("#roket"); await a.seret(r.x, r.y, r.x, r.y + 200, { langkah:15 }); }
  await page.waitForFunction(() => { const l = document.querySelectorAll("#janji li"); return l.length && [...l].every(x => x.classList.contains("tampil")); }, null, { timeout:15000 });
  await a.baca("#janji");

  a.bagian("foto-kembang-api");
  await aktif(3); await jeda(800);
  const n = await page.locator("#langitFoto .sumbu").count();
  for (let i = 0; i < n; i++){
    await a.ketuk("#langitFoto .sumbu:not(.terpakai)", { tunggu:400 });
    await page.locator("#ketLedak.tampil").waitFor({ timeout:5000 }); await jeda(400); await a.baca("#ketLedak");
    const l = await kotak("#langitFoto"); a.stat.aksi++; await page.mouse.click(l.x + 20, l.y + 20); await jeda(500);
  }

  a.bagian("hati");
  await aktif(4); await jeda(1400);
  { const t = await page.evaluate(() => { const p = document.getElementById("hatiPandu"), m = document.getElementById("hatiSvg").getScreenCTM(), L = p.getTotalLength(), r = [];
      for (let i = 0; i <= 140; i += 2){ const q = p.getPointAtLength(L*i/140), s = new DOMPoint(q.x, q.y).matrixTransform(m); r.push({ x:s.x, y:s.y }); } return r; });
    a.stat.aksi++; await page.mouse.move(t[0].x, t[0].y); await page.mouse.down();
    for (const p of t) await page.mouse.move(p.x, p.y, { steps:2 });
    await page.mouse.up(); }
  await page.locator("#surat.tampil").waitFor({ timeout:8000 }); await a.baca("#surat");

  a.bagian("bersulang");
  await aktif(5); await jeda(800);
  { const k = await pusat("#gelasKu"), d = await pusat("#gelasDia"); await a.seret(k.x, k.y, d.x, k.y, { langkah:20 }); }
  await page.locator("#judulAkhir.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAkhir");
}
