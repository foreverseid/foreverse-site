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

  a.bagian("kaca-pembesar");
  await jeda(900);
  const nt = await page.locator("#catLap .kecil-tulis").count();
  for (let i = 0; i < nt; i++){
    const l = await page.locator("#lensa").boundingBox(), t = await page.locator(`#catLap .kecil-tulis >> nth=${i}`).boundingBox();
    const lx = l.x + l.width/2, ly = l.y + l.height/2;
    a.stat.aksi++; await page.mouse.move(lx, ly); await page.mouse.down();
    await page.mouse.move(lx + (t.x + t.width/2 - lx)*0.5, ly + (t.y + t.height/2 - ly)*0.5 + 30, { steps:12 });
    await page.mouse.move(t.x + t.width/2, t.y + t.height/2, { steps:12 }); await page.mouse.up(); await jeda(600);
    await a.baca(`#daftarTerima li >> nth=${i}`);
    if (i === nt - 1) await a.jepret("kaca-pembesar-isi");
  }
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
