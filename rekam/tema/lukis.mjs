/* Melukis Bersama (Proposal) — ketuk & tarik kain, warnai 4 bidang bernomor,
   balik 4 bingkai (foto), geser kanvas (surat), seret kuas menulis pertanyaan, jawab. */
export const berkas = "lukis-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("kain");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#kainT", { tunggu:700 });
  { const k = await pusat("#kainT"); await a.seret(k.x, k.y - 40, k.x, k.y + 200, { langkah:14 }); }
  await jeda(900); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("lukis");
  await jeda(1000);
  const titik = [[.5,.25],[.3,.85],[.74,.25],[.4,.82]];
  for (let i = 0; i < 4; i++){ await a.ketuk(`#palet .cat >> nth=${i}`, { tunggu:500 });
    const k = await kotak("#kanvas1"); a.stat.aksi++; await page.mouse.click(k.x + k.width*titik[i][0], k.y + k.height*titik[i][1]); await jeda(900);
    if (i < 3) await a.baca(`#warnaL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("bingkai");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#dinding .bk >> nth=${i}`, { tunggu:1100 }); await a.baca(`#dinding .bk >> nth=${i} >> p`); }
  await a.lanjut();

  a.bagian("surat");
  await jeda(900);
  { const k = await pusat("#kanvasB"); await a.seret(k.x - 60, k.y, k.x + 140, k.y, { langkah:14 }); }
  await page.locator("#ttdL.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiL p >> nth=${i}`);
  await a.lanjut();

  a.bagian("pertanyaan");
  await jeda(1000);
  { const k = await pusat("#kuas"), p = await kotak("#papanT"); await a.seret(k.x, k.y, p.x + p.width + 40, k.y, { langkah:24 }); }
  await jeda(2800); await a.baca("#tanyaB");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
