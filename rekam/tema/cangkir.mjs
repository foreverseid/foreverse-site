/* Cangkir yang Retak (Apology) — ketuk pecahan, telusuri 3 retakan (emas),
   tahan teko, geser uap ke atas 4 kali (foto), geser tatakan + buka kertas (surat), jawab. */
export const berkas = "cangkir-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("pecah");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#cangkir0", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("emas");
  await jeda(1100);
  for (let i = 0; i < 3; i++){
    const titik = await page.evaluate(i => { const svg = document.querySelector("#svgC"), p = svg.querySelectorAll(".emas-g")[i], L = p.getTotalLength(), m = svg.getScreenCTM(), o = [];
      for (let s = 0; s <= L; s += 6){ const q = p.getPointAtLength(s); o.push([q.x*m.a + m.e, q.y*m.d + m.f]); } const q = p.getPointAtLength(L); o.push([q.x*m.a + m.e, q.y*m.d + m.f]); return o; }, i);
    a.stat.aksi++; await page.mouse.move(titik[0][0], titik[0][1]); await page.mouse.down();
    for (const [x, y] of titik){ await page.mouse.move(x, y); await jeda(22); }
    await page.mouse.up(); await jeda(600); await a.baca(`#sadarL li >> nth=${i}`);
  }
  await a.lanjut();

  a.bagian("teh");
  await jeda(1000);
  { const b = await pusat("#teko"); a.stat.aksi++; await page.mouse.move(b.x, b.y); await page.mouse.down(); await jeda(1900); await page.mouse.up(); }
  for (let i = 0; i < 4; i++){ await jeda(i ? 2400 : 900); const u = await pusat("#uapF .awan"); await a.seret(u.x, u.y, u.x, u.y - 160, { langkah:12 }); await jeda(400); await a.baca("#uapF p"); }
  await a.lanjut();

  a.bagian("tatakan");
  await jeda(900);
  { const t = await pusat("#tatakan"); await a.seret(t.x, t.y, t.x + 160, t.y, { langkah:12 }); }
  await jeda(700); await a.ketuk("#kertasL", { tunggu:800 });
  await page.locator("#ttdC.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiC p >> nth=${i}`);
  await a.lanjut();

  a.bagian("jawab");
  await jeda(1200); await a.baca("#judulAkhir");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
