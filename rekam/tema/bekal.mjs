/* Bekal Makan Siang (Love Note) — ketuk 2 kancing, tarik 3 tusuk bendera,
   kelupas 4 stiker (foto), balik tutup (surat), balasan. */
export const berkas = "bekal-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("kotak");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#bento0 .kancing.l", { tunggu:700 }); await a.ketuk("#bento0 .kancing.r", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("bendera");
  await jeda(1000);
  for (let i = 0; i < 3; i++){ const t = await pusat(`#sk${i} .tusuk`); await a.seret(t.x, t.y, t.x, t.y - 110, { langkah:10 }); await jeda(700); await a.baca(`#benderaL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("stiker");
  await jeda(900);
  for (let i = 0; i < 4; i++){ const b = await kotak(`#stikerG .st >> nth=${i} >> .lapis`); await a.seret(b.x + 10, b.y + b.height - 10, b.x + b.width*.8, b.y + b.height*.2, { langkah:12 }); await jeda(500); await a.baca(`#stikerG .st >> nth=${i} >> p`); }
  await a.lanjut();

  a.bagian("memo");
  await jeda(900);
  await a.ketuk("#tutup2", { tunggu:900 });
  await page.locator("#ttdM.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiM p >> nth=${i}`);
  await a.lanjut();

  a.bagian("penutup");
  await jeda(1200); await a.baca("#judulAkhir"); await a.baca("#pilihan");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
