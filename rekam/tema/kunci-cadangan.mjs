/* Kunci Cadangan (Parting Ways) — ketuk gantungan, lepas 3 kunci, ketuk 4 magnet
   kulkas (foto), buka amplop (surat), masukkan amplop ke kotak surat. */
export const berkas = "kunci-cadangan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("gantungan");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#cincin0", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("kunci");
  await jeda(1000);
  for (let i = 0; i < 3; i++){ const b = await kotak("#cincin1 .kunci"); const x = b.x + b.width/2, y = b.y + b.height*.7; await a.seret(x, y, x + (i-1)*60, y + 120, { langkah:10 }); await jeda(700); await a.baca(`#gantunganL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("kulkas");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#kulkas .tempel-f >> nth=${i} >> .magnet`, { tunggu:1000 }); await a.baca("#fotoK p"); }
  await a.lanjut();

  a.bagian("amplop");
  await jeda(900);
  await a.ketuk("#amplopC", { tunggu:800 });
  await page.locator("#ttdK.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiK p >> nth=${i}`);
  await a.lanjut();

  a.bagian("kotak-pos");
  await jeda(1000);
  { const am = await pusat("#amplop4"), kp = await kotak("#kotakPos"); await a.seret(am.x, am.y, kp.x + kp.width/2, kp.y + kp.height*.25, { langkah:16 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
