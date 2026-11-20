/* Herbarium Kecil (Hari Spesial · Hari Perempuan) — pita, tiga spesimen,
   kertas minyak di atas foto, alat pres, pembatas buku. */
export const berkas = "herbarium-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("sampul-pita");
  await jeda(1500);
  await a.ketuk("#simpul", { tunggu:2400 });
  await a.lanjut();

  a.bagian("tiga-spesimen");
  for (let k = 0; k < 3; k++){
    const f = page.locator("#baki .bunga").first(), j = await f.getAttribute("data-jenis");
    await a.seretEl(f, `.slot[data-jenis="${j}"]`, { langkah:25, tunggu:800 });
  }
  await a.baca("#labelKagum");
  await a.lanjut();

  a.bagian("kertas-minyak");
  const n = await page.evaluate(() => JSON.parse(document.getElementById("foreverse-data").textContent).foto.length);
  for (let k = 0; k < n; k++){
    const m = page.locator(".lembaran:last-child .minyak"); await m.waitFor({ timeout:8000 }); const r = await m.boundingBox();
    await a.seretEl(m, { dx:0, dy:-r.height*.6 }, { tunggu:1300 });
    await a.baca(".lembaran:last-child .ket-spesimen");
    await a.lanjut();
  }

  a.bagian("alat-pres");
  for (let k = 0; k < 2; k++) await a.ketuk(page.locator(".mur:not(.rapat)").first(), { tunggu:500 });
  await page.locator("#catatanTtd.tampil").waitFor({ timeout:20000 });
  await a.baca("#catatanIsi");
  await a.lanjut();

  a.bagian("pembatas");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
