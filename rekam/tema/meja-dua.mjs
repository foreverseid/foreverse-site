/* Makan Malam Pertama (Ask Out) — ketuk bel, gesek korek lalu bawa apinya
   ke lilin, balik 4 halaman menu (foto), angkat 3 tudung saji, buka bon
   (surat), pilih stempel jawaban. */
export const berkas = "meja-dua-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("reservasi");
  await jeda(1500); await a.baca("#judulAwal"); await a.baca("#reservasi");
  await a.ketuk("#bel", { tunggu:900 });
  await a.lanjut();

  a.bagian("lilin");
  await jeda(900);
  { const k = await kotak("#korek"), g = await kotak("#gesek"), s = await pusat("#sumbu");
    a.stat.aksi++; const sx = k.x + k.width*.3, sy = k.y + k.height/2;
    await page.mouse.move(sx, sy); await page.mouse.down();
    /* bawa kepala korek ke sisi gesek, lalu gesek kiri-kanan */
    const dx = (g.x + g.width*.5) - (k.x + k.width), dy = (g.y + g.height/2) - sy;
    for (let i = 1; i <= 12; i++){ await page.mouse.move(sx + dx*i/12, sy + dy*i/12); await jeda(25); }
    for (let i = 0; i < 6; i++){ await page.mouse.move(sx + dx + (i%2 ? -30 : 30), sy + dy); await jeda(60); }
    /* lalu ke sumbu lilin: kepala korek di ujung kanan korek */
    const ox = sx - (k.x + k.width) + 4;
    for (let i = 1; i <= 16; i++){ await page.mouse.move(sx + dx + ((s.x + ox) - (sx + dx))*i/16, sy + dy + ((s.y + 4) - (sy + dy))*i/16); await jeda(25); }
    await page.mouse.up(); }
  await jeda(900); await a.jepret("lilin-nyala");
  await a.lanjut();

  a.bagian("menu");
  await jeda(900);
  for (let i = 0; i < 4; i++){
    await a.baca("#menuB p");
    if (i < 3){ const b = await kotak("#menuB"); await a.seret(b.x + b.width*.8, b.y + b.height/2, b.x + b.width*.15, b.y + b.height/2, { langkah:12 }); await jeda(700); }
  }
  await a.lanjut();

  a.bagian("tudung-saji");
  await jeda(900);
  for (let i = 0; i < 3; i++){ await a.ketuk(`#saji .tudung >> nth=${i}`, { tunggu:900 }); await a.baca(`#saji .isi-p span >> nth=${i}`); }
  await a.jepret("saji-isi");
  await a.lanjut();

  a.bagian("bon");
  await jeda(900);
  await a.ketuk("#sampulBon", { tunggu:600 });
  await page.locator("#ttdN.tampil").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiN p >> nth=${i}`);
  await a.jepret("bon-isi");
  await a.lanjut();

  a.bagian("jawaban");
  await jeda(900); await a.baca("#judulJawab");
  await a.ketuk("#pilihJ button >> nth=0", { tunggu:600 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#balasTeks");
}
