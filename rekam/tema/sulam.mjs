/* Sulam Jarak (LDR) — kencangkan sekrup, jahit 15 titik antar kota
   (tiga simpul membuka isian jahitan), cabut 4 peniti, balik pamidangan
   untuk surat, gunting benang. */
export const berkas = "sulam-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("kencangkan");
  await jeda(1500); await a.baca("#judulAwal");
  for (let i = 0; i < 3; i++) await a.ketuk("#sekrup", { tunggu:500 });

  a.bagian("jahit");
  await jeda(700);
  for (let j = 1; j <= 15; j++){
    const p = await pusat(`#pola .lubang >> nth=${j-1}`); a.stat.aksi++;
    await page.mouse.click(p.x, p.y); await jeda(420);
    if (j % 5 === 0) await a.baca(`#catatanJ li >> nth=${j/5-1}`);
  }
  await a.jepret("jahit-isi");
  await a.lanjut();

  a.bagian("tambalan");
  await jeda(900);
  for (let i = 0; i < 4; i++){
    await a.ketuk(`#papan .tambal >> nth=${i} >> .peniti`, { tunggu:900 });
    await a.baca(`#papan .tambal >> nth=${i} >> p`);
  }
  await a.jepret("tambalan-isi");
  await a.lanjut();

  a.bagian("balik");
  await jeda(900);
  { const p = await pusat("#balik"); await a.seret(p.x - 60, p.y, p.x + 160, p.y, { langkah:20 }); }
  await page.locator("#suratK .ttd:not(:empty)").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#suratK p >> nth=${i}`);
  await a.jepret("surat-isi");
  await a.lanjut();

  a.bagian("gunting");
  await jeda(900);
  { const g = await pusat("#gunting"), u = await pusat("#ujungG"); await a.seret(g.x, g.y, u.x, u.y, { langkah:20 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
