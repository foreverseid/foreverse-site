/* Prosesi Wisuda (Graduation) — ketuk undangan, seret ke pemindai,
   usap layar LED (4 foto), naik 3 anak tangga, tahan salaman, buka map ijazah (piagam),
   kelupas plastik 3 papan bunga (harapan). */
export const berkas = "prosesi-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("gerbang");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#undangan", { tunggu:900 });
  { const u = await pusat("#undangan"), p = await pusat("#pemindai"); await a.seret(u.x, u.y, p.x, p.y, { langkah:20 }); }
  await jeda(900); await a.jepret("gerbang-buka");
  await a.lanjut();

  a.bagian("layar");
  await jeda(900);
  for (let i = 0; i < 5; i++){
    await a.baca(`#jalurLed .slide >> nth=${i} >> ${i ? "p" : "b"}`);
    if (i < 4){ const b = await kotak("#led"); await a.seret(b.x + b.width*.8, b.y + b.height/2, b.x + b.width*.2, b.y + b.height/2, { langkah:14 }); await jeda(700); }
  }
  await a.jepret("layar-isi");
  await a.lanjut();

  a.bagian("salaman");
  await jeda(900); await a.baca("#mc");
  for (let i = 0; i < 3; i++) await a.ketuk(`#tangga .anak >> nth=${i}`, { tunggu:500 });
  { const s = await pusat("#salaman"); a.stat.aksi++; await page.mouse.move(s.x, s.y); await page.mouse.down(); await jeda(1800); await page.mouse.up(); }
  await jeda(500);
  await a.lanjut();

  a.bagian("ijazah");
  await jeda(900);
  await a.ketuk("#tutupM", { tunggu:600 });
  await page.locator("#ttdG.tampil").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiPiagam p >> nth=${i}`);
  await a.jepret("piagam-isi");
  await a.lanjut();

  a.bagian("papan-bunga");
  await jeda(1200);
  for (let i = 0; i < 3; i++){
    await page.locator(".papan-b:not(.masuk):not(.keluar) .plastik:not(.lepas)").waitFor({ timeout:10000 }); await jeda(400);
    const b = await kotak(".papan-b:not(.keluar) .plastik:not(.lepas)"); await a.seret(b.x + b.width/2, b.y + b.height*.7, b.x + b.width/2, b.y - 40, { langkah:12 });
    await jeda(700); await a.baca(".papan-b:not(.keluar) p");
    if (i === 0) await a.jepret("papan-isi");
  }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
