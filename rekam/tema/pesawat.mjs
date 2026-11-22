/* Pesawat Kertas (Parting Ways) — ketuk kertas, 3 lipatan mengikuti panah,
   teropong menemukan 4 jendela (foto), buka pesawat (surat), lempar ke atas. */
export const berkas = "pesawat-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("kertas");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#kertas0", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("lipat");
  await jeda(1000);
  const k = await kotak("#kertas1");
  const gerak = [[.15,.15,.5,.5],[.85,.15,.5,.5],[.5,.3,.5,.85]];
  for (let i = 0; i < 3; i++){ const g = gerak[i]; await a.seret(k.x + k.width*g[0], k.y + k.height*g[1], k.x + k.width*g[2], k.y + k.height*g[3], { langkah:12 }); await jeda(800); await a.baca(`#lipatL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("teropong");
  await jeda(1000);
  for (let i = 0; i < 4; i++){ const l = await pusat("#lensa"), t = await pusat(`#kota .target >> nth=${i}`); a.stat.aksi++;
    await page.mouse.move(l.x, l.y); await page.mouse.down();
    for (let s = 1; s <= 16; s++){ await page.mouse.move(l.x + (t.x - l.x)*s/16, l.y + (t.y - l.y)*s/16); await jeda(25); }
    await jeda(800); await page.mouse.up(); await jeda(400); await a.baca("#fotoT p"); }
  await a.lanjut();

  a.bagian("surat");
  await jeda(900);
  await a.ketuk("#pesawat3", { tunggu:800 });
  await page.locator("#ttdP.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiP p >> nth=${i}`);
  await a.lanjut();

  a.bagian("terbang");
  await jeda(1000);
  { const p = await pusat("#pesawat4"); await a.seret(p.x, p.y, p.x + 30, p.y - 160, { langkah:8 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
