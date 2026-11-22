/* Tumpeng Syukuran (Congrats) — ketuk tampah, geser daun, seret 3 lauk
   ke tumpeng, ketuk 4 besek (foto), potong pucuk (surat), balasan. */
export const berkas = "tumpeng-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("tampah");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#tampah0", { tunggu:900 });
  { const p = await pusat("#daunT"); await a.seret(p.x - 40, p.y, p.x + 200, p.y, { langkah:16 }); }
  await jeda(900); await a.baca("#judulAwal"); await a.jepret("tampah-buka");
  await a.lanjut();

  a.bagian("lauk");
  await jeda(1100);
  for (let i = 0; i < 3; i++){
    const l = await pusat("#laukB .lauk"), s = await pusat(`#tampah1 .slot:not(.isi)`);
    await a.seret(l.x, l.y, s.x, s.y, { langkah:16 }); await jeda(700);
    await a.baca(`#banggaL li >> nth=${i}`);
  }
  await a.jepret("lauk-isi");
  await a.lanjut();

  a.bagian("besek");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk("#tumpukan .besek.atas", { tunggu:1000 }); await a.baca("#fotoB p"); if(i === 1) await a.jepret("besek-foto"); }
  await a.lanjut();

  a.bagian("potong");
  await jeda(1000);
  { const p = await pusat("#pisau"); await a.seret(p.x, p.y, p.x + 260, p.y, { langkah:18 }); }
  await page.locator("#ttdT.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiT p >> nth=${i}`);
  await a.jepret("surat-isi");
  await a.lanjut();

  a.bagian("selamat");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
