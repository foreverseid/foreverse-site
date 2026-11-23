/* Selamanya (Love Note, tema khas) — ketuk hati amplop, telusuri lingkaran tak hingga
   (3 bait), geser 4 kartu foto, buka 2 lipatan surat, tahan hati, jawab. */
export const berkas = "selamanya-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("amplop");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#amplopF", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("takhingga");
  await jeda(1100);
  const titik = await page.evaluate(() => { const svg = document.querySelector("#svgT"), p = document.querySelector("#jalurT"), L = p.getTotalLength(), m = svg.getScreenCTM(), o = [];
    for (let s = 0; s <= L; s += 6){ const q = p.getPointAtLength(s); o.push([q.x*m.a + m.e, q.y*m.d + m.f]); } const q = p.getPointAtLength(L); o.push([q.x*m.a + m.e, q.y*m.d + m.f]); return o; });
  a.stat.aksi++; await page.mouse.move(titik[0][0], titik[0][1]); await page.mouse.down();
  for (const [x, y] of titik){ await page.mouse.move(x, y); await jeda(20); }
  await page.mouse.up(); await jeda(600);
  for (let i = 0; i < 4; i++) await a.baca(`#baitL li >> nth=${i}`);
  await a.lanjut();

  a.bagian("kartu");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.baca(`#tumpuk .kartu-f >> nth=${3-i} >> p`); const k = await pusat(`#tumpuk .kartu-f >> nth=${3-i}`); await a.seret(k.x, k.y, k.x + (i%2 ? -170 : 170), k.y, { langkah:12 }); await jeda(500); }
  await a.lanjut();

  a.bagian("surat");
  await jeda(900); await a.baca("#lipatan .lpw >> nth=0 >> p");
  for (let i = 1; i < 3; i++){ await page.locator("#bukaL.siap").waitFor({ timeout:20000 }); await a.ketuk("#bukaL", { tunggu:1000 }); await a.baca(`#lipatan .lpw >> nth=${i} >> p`); }
  await page.locator("#bukaL.siap").waitFor({ timeout:20000 }); await a.jepret("surat-terbuka"); await a.ketuk("#bukaL", { tunggu:2800 });
  await a.lanjut();

  a.bagian("hati");
  await jeda(1000);
  { const b = await pusat("#hatiB"); a.stat.aksi++; await page.mouse.move(b.x, b.y); await page.mouse.down(); await jeda(1800); await page.mouse.up(); }
  await jeda(2000); await a.baca("#judulAkhir");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
