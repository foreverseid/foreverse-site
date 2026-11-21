/* Halaman Persembahan (Graduation) — ketuk buku, buka sampul ke kiri,
   coret 3 revisi, tanda tangan dengan jari, buka 4 lampiran, baca
   persembahan, ketuk stempel LULUS. */
export const berkas = "persembahan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();

  a.bagian("sampul");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#buku", { tunggu:1300 });
  { const b = await kotak("#sampulB"); await a.seret(b.x + b.width*.85, b.y + b.height/2, b.x - b.width*.6, b.y + b.height/2, { langkah:20 }); }
  await a.lanjut();

  a.bagian("revisi");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    const b = await kotak(`#revIsi .revisi >> nth=${i}`);
    await a.seret(b.x + 10, b.y + b.height/2, b.x + b.width - 4, b.y + b.height/2, { langkah:16 });
    await jeda(600); await a.baca(`#revIsi .revisi >> nth=${i} >> .acc p`);
  }
  await a.jepret("revisi-isi");
  await a.lanjut();

  a.bagian("pengesahan");
  await jeda(900); await a.baca("#teksSah");
  { const b = await kotak("#kanvas"); a.stat.aksi++;
    await page.mouse.move(b.x + 12, b.y + b.height*.6); await page.mouse.down();
    for (let s = 1; s <= 40; s++){ await page.mouse.move(b.x + 12 + (b.width - 24) * s / 40, b.y + b.height*(.5 + Math.sin(s/3)*.3)); await jeda(20); }
    await page.mouse.up(); }
  await jeda(800); await a.jepret("pengesahan-isi");
  await a.lanjut();

  a.bagian("lampiran");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#tabL button >> nth=${i}`, { tunggu:700 }); await a.baca("#lampIsi p"); }
  await a.jepret("lampiran-isi");
  await a.lanjut();

  a.bagian("persembahan");
  await page.locator("#ttdP.tampil").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiP p >> nth=${i}`);
  await a.jepret("persembahan-isi");
  await a.lanjut();

  a.bagian("lulus");
  await jeda(900);
  await a.ketuk("#stempel", { tunggu:600 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
