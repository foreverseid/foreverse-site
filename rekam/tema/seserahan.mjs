/* Seserahan (Proposal) — ketuk baki, tarik 3 ekor pita, putar baki foto,
   tarik gulungan ke bawah (surat), ketuk kotak cincin, jawab. */
export const berkas = "seserahan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("baki");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#baki0", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("pita");
  await jeda(1000);
  for (let i = 0; i < 3; i++){ const e = await pusat(`#baki1 .baki >> nth=${i} >> .ekor`); await a.seret(e.x, e.y, e.x + 30, e.y + 90, { langkah:10 }); await jeda(900); await a.baca(`#janjiL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("putar");
  await jeda(1000); await a.baca("#ketF");
  for (let i = 0; i < 3; i++){ const p = await pusat("#putar"); await a.seret(p.x + 100, p.y, p.x - 100, p.y, { langkah:14 }); await jeda(700); await a.baca("#ketF"); }
  await a.lanjut();

  a.bagian("gulungan");
  await jeda(900);
  { const b = await pusat("#batangB"); await a.seret(b.x, b.y, b.x, b.y + 480, { langkah:24 }); }
  await page.locator("#ttdG.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiG p >> nth=${i}`);
  await a.lanjut();

  a.bagian("cincin");
  await jeda(1000);
  await a.ketuk("#kotakC", { tunggu:2800 }); await a.baca("#tanya");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
