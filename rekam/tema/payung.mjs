/* Payung Berdua (Ask Out) — ketuk payung, dorong rangkanya ke atas,
   usap embun kaca (3 kalimat), ketuk 4 genangan (foto), angkat perahu
   kertas (surat), bus datang, pilih jawaban. */
export const berkas = "payung-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("payung");
  await jeda(1500); await a.baca("#judulAwal");
  { const b = await kotak("#kanopi"); a.stat.aksi++; await page.mouse.click(b.x + b.width/2, b.y + b.height/2); await jeda(900); }
  { const r = await pusat("#runner"); await a.seret(r.x, r.y, r.x, r.y - 200, { langkah:20 }); }
  await jeda(800); await a.baca("#judulAwal"); await a.jepret("payung-buka");
  await a.lanjut();

  a.bagian("embun");
  await jeda(1100);
  const li = await page.locator("#kalimatK li").count();
  for (let i = 0; i < li; i++){
    const b = await kotak(`#kalimatK li >> nth=${i}`); a.stat.aksi++;
    await page.mouse.move(b.x + 4, b.y + b.height*.3); await page.mouse.down();
    for (let r = 0; r < 3; r++) for (let s = 0; s <= 14; s++){ await page.mouse.move(b.x + 4 + (r%2 ? (14-s) : s) * (b.width-8)/14, b.y + b.height*(.2 + r*.3)); await jeda(14); }
    await page.mouse.up(); await jeda(500); await a.baca(`#kalimatK li >> nth=${i}`);
  }
  await a.jepret("embun-isi");
  await a.lanjut();

  a.bagian("genangan");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#genanganG .gn >> nth=${i} >> .air`, { tunggu:1000 }); await a.baca(`#genanganG .gn >> nth=${i} >> p`); }
  await a.jepret("genangan-isi");
  await a.lanjut();

  a.bagian("perahu");
  await jeda(900);
  { const p = await pusat("#perahu"); await a.seret(p.x, p.y, p.x, p.y - 120, { langkah:12 }); }
  await page.locator("#ttdS.tampil").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiS p >> nth=${i}`);
  await a.jepret("surat-isi");
  await a.lanjut();

  a.bagian("bus");
  await jeda(2400); await a.baca("#papanT");
  await a.ketuk("#pilihB .naik", { tunggu:600 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulBus");
}
