/* Paket Titipan (Get Well Soon) — bel, pintu, dua tutup kardus, angkat 3
   barang ke kasur, pecahkan plastik gelembung (foto), kartu (surat), tanda terima. */
export const berkas = "titipan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("pintu");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#bel", { tunggu:1200 }); await a.ketuk("#daunP", { tunggu:1600 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("kardus");
  await jeda(1000);
  await a.ketuk("#flapA", { tunggu:800 }); await a.ketuk("#flapB", { tunggu:1200 });
  for (let i = 0; i < 3; i++){ const b = await pusat("#barangR .barang"), k = await kotak("#kasur"); await a.seret(b.x, b.y, k.x + k.width/2, k.y + k.height*.6, { langkah:16 }); await jeda(600); await a.baca(`#kasur .tag >> nth=${i}`); }
  await a.lanjut();

  a.bagian("gelembung");
  await jeda(900);
  for (let i = 0; i < 4; i++){
    for (const k of [0, 2, 4, 6, 8]){ const g = page.locator(`#fotoG .fb >> nth=${i} >> .plastik i >> nth=${k}`); if (await g.evaluate(x => !x.classList.contains("pecah"))) await a.ketuk(`#fotoG .fb >> nth=${i} >> .plastik i >> nth=${k}`, { tunggu:180 }); }
    for (let k = 0; k < 9; k++){ const g = page.locator(`#fotoG .fb >> nth=${i} >> .plastik i >> nth=${k}`); if (await g.evaluate(x => !x.classList.contains("pecah"))) await a.ketuk(`#fotoG .fb >> nth=${i} >> .plastik i >> nth=${k}`, { tunggu:180 }); }
    await jeda(300); await a.baca(`#fotoG .fb >> nth=${i} >> p`);
  }
  await a.lanjut();

  a.bagian("kartu");
  await jeda(900);
  await a.ketuk("#amplopK", { tunggu:800 });
  await page.locator("#ttdK.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiK p >> nth=${i}`);
  await a.lanjut();

  a.bagian("terima");
  await jeda(900);
  { const k = await pusat("#kenopT"), g = await kotak("#geserT"); await a.seret(k.x, k.y, g.x + g.width + 10, k.y, { langkah:18 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
