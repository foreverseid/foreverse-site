/* Loker Terakhir (Graduation) — gembok kombinasi tanggal wisuda, pintu loker,
   foto di balik pintu, kemasi barang (tiap barang menyimpan sepotong surat),
   pindah kuncir toga, buket wisuda (tiga kartu bangga), lempar toga. */
export const berkas = "loker-terakhir-demo.html";

async function putarKe(a, target){
  const { page, jeda } = a;
  const c = await page.locator("#cakram").boundingBox(), cx = c.x + c.width/2, cy = c.y + c.height/2, R = c.width * .38;
  const kini = +(await page.locator("#angkaKini").innerText()) || 0;
  const arah = ((kini - target + 40) % 40) <= 20 ? 1 : -1;      // nomor turun = putar searah jarum jam
  let sudut = -Math.PI/2;
  a.stat.aksi++;
  await page.mouse.move(cx + R*Math.cos(sudut), cy + R*Math.sin(sudut), { steps:4 }); await page.mouse.down();
  for (let i = 0; i < 400; i++){
    if (+(await page.locator("#angkaKini").innerText()) === target) break;
    sudut += arah * 0.05; await page.mouse.move(cx + R*Math.cos(sudut), cy + R*Math.sin(sudut)); await jeda(12);
  }
  await jeda(550); await page.mouse.up(); await jeda(500);
}

export async function main(a){
  const { page, jeda } = a;
  const U = await page.evaluate(() => Math.min(innerWidth/100, innerHeight/200));
  a.bagian("gembok");
  await jeda(1500);
  await a.baca("#kode");
  const kode = await page.locator("#kode b").allInnerTexts();
  for (const k of kode) await putarKe(a, +k);
  await jeda(1000);

  a.bagian("pintu-foto");
  await a.seretEl("#gagang", { dx:-U*14, dy:0 }, { tunggu:1500 });
  const n = await page.locator(".tempel").count();
  for (let i = 0; i < n; i++){ await a.ketuk(page.locator(".tempel").nth(i), { tunggu:600 }); await a.baca("#lihatKet"); await a.ketuk("#lihat", { tunggu:500 }); }

  a.bagian("kemasi-barang");
  for (let i = 0; i < 3; i++){
    await a.seretEl(page.locator("#barangWadah .barang").first(), "#kardus", { langkah:25, tunggu:900 });
    if (await page.locator("#lihat.tampil").isVisible()){ await a.baca("#lihatTeks"); await a.ketuk("#lihat", { tunggu:500 }); }
  }
  await a.lanjut();

  a.bagian("kuncir-toga");
  await a.seretEl("#kuncir .rumbai", { dx:-U*60, dy:0 }, { tunggu:1200 });
  await a.baca("#rahasiaTeks");
  await a.lanjut();

  a.bagian("buket-wisuda");
  await jeda(900);
  const nk = await page.locator(".kartu-b").count();
  for (let i = 0; i < nk; i++){
    await a.seretEl(page.locator(".kartu-b:not(.dicabut)").first(), { dx:0, dy:-U*22 }, { tunggu:700 });
    await a.baca(`#daftarBangga li >> nth=${i}`);
  }
  await a.lanjut();

  a.bagian("lempar-toga");
  await a.seretEl("#lempar", { dx:0, dy:-U*24 }, { tunggu:2500 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
