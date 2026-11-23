/* Sampai Ketemu (LDR, tema khas) — ketuk cap, geser pin KAMU mendekat (3 titik),
   angkat panggilan video + simpan 4 momen (foto), buka surat kilat, satukan hati, jawab. */
export const berkas = "sampai-ketemu-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("amplop");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#stempelP", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("jarak");
  await jeda(1100); await a.baca("#km");
  { const p = await pusat("#pinKamu"), r = await kotak("#rel"); await a.seret(p.x, p.y, r.x + r.width + 10, p.y, { langkah:40 }); }
  await jeda(700);
  for (let i = 0; i < 3; i++) await a.baca(`#dekatL li >> nth=${i}`);
  await a.lanjut();

  a.bagian("panggilan");
  await jeda(1200);
  { const k = await pusat("#knop"); await a.seret(k.x, k.y, k.x, k.y - 220, { langkah:14 }); }
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.baca("#gelembung"); await a.ketuk("#rana", { tunggu:700 }); }
  await a.lanjut();

  a.bagian("surat");
  await jeda(900);
  await a.ketuk("#amplopK2", { tunggu:800 });
  await page.locator("#ttdK.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiK p >> nth=${i}`);
  await a.lanjut();

  a.bagian("hati");
  await jeda(1000);
  { const k = await pusat("#belahKiri"), h = await kotak("#hatiW"); await a.seret(k.x, k.y, h.x + h.width + 20, k.y, { langkah:20 }); }
  await jeda(2200); await a.baca("#judulAkhir");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
