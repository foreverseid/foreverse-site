/* Koper ke Kotamu (LDR) — kancing, isi koper, ritsleting, X-ray,
   boarding pass, jendela pesawat. */
export const berkas = "koper-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("buka-koper");
  await jeda(1500);
  await a.ketuk(".kancing.k1", { tunggu:300 });
  await a.ketuk(".kancing.k2", { tunggu:1400 });

  a.bagian("isi-koper");
  await a.seretEl(page.locator("#kasur .barang.berat").first(), "#dasar", { langkah:25, tunggu:1000 });
  for (let k = 0; k < 3; k++){
    const b = page.locator("#kasur .barang:not(.berat):not(.masuk)").first();
    await a.baca(b.locator(".label"));
    await a.seretEl(b, "#dasar", { langkah:25, tunggu:800 });
  }
  await jeda(1500);
  const rel = await page.locator("#rel").boundingBox();
  await a.seretEl("#tarikan", { dx:rel.width + 10, dy:0 }, { langkah:30, tunggu:1500 });
  await a.lanjut();

  a.bagian("x-ray");
  await jeda(2300);
  const n = await page.evaluate(() => JSON.parse(document.getElementById("foreverse-data").textContent).foto.length);
  for (let k = 0; k < n; k++){ await a.ketuk("#monitor", { tunggu:1900 }); await a.baca("#tickerKet"); }
  await a.lanjut();

  a.bagian("boarding-pass");
  await a.ketuk("#cetak", { tunggu:1900 });
  await a.ketuk("#passAmbil", { tunggu:800 });
  await a.baca("#passMuka");
  await a.ketuk("#pass", { tunggu:1000 });
  await a.baca("#passTulis");
  await a.lanjut();

  a.bagian("terbang");
  await a.lanjut();

  a.bagian("ban-bagasi");
  await jeda(1500);
  for (let i = 0; i < 3; i++){
    const p = await page.evaluate(() => { const vw = innerWidth;
      const t = [...document.querySelectorAll("#banBagasi .tas.milik:not(.ambil)")].map(e => e.getBoundingClientRect()).filter(r => r.left > 10 && r.right < vw - 10).sort((a, b) => b.left - a.left)[0];
      return t ? { x:t.x + t.width/2, y:t.y + t.height*0.6 } : null; });
    if (!p){ await jeda(400); i--; continue; }
    a.stat.aksi++; await page.mouse.click(p.x, p.y); await jeda(700);
    await a.baca(`#daftarSiap li >> nth=${i}`);
  }
  await a.jepret("ban-bagasi-isi");
  await a.lanjut();

  a.bagian("kedatangan");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
