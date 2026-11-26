/* Mesin Capit (Anniversary) — seret koin ke slot, geser capit & AMBIL 3 kapsul,
   tukar 4 hadiah (foto), tarik boneka hadiah utama (surat), main lagi. */
export const berkas = "mesin-capit-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("mesin");
  await jeda(1500); await a.baca("#judulMesin");
  const k = await pusat("#koin"), s = await pusat("#slot");
  await a.seret(k.x, k.y, s.x, s.y, { langkah:14 }); await jeda(1500);
  for (let i = 0; i < 3; i++){
    const kp = await page.evaluate(i => { const k = document.querySelectorAll("#kaca > .kapsul")[0]; const r = k.getBoundingClientRect(); return { x:r.left + r.width/2 }; }, i);
    const c = await pusat("#capit .kpl");
    await a.seret(c.x, c.y, kp.x, c.y, { langkah:14 }); await jeda(600);
    await a.ketuk("#ambil", { tunggu:400 });
    await page.waitForFunction(n => document.querySelectorAll("#kapsulL li:not(.kosong)").length > n, i, { timeout:15000 });
    await a.baca(`#kapsulL li >> nth=${i}`);
    await page.waitForFunction(() => !document.querySelector("#capit").classList.contains("turun"), null, { timeout:8000 });
  }
  await a.lanjut();

  a.bagian("konter");
  await jeda(1000); await a.baca("#judulKonter");
  for (let i = 0; i < 4; i++){ await a.ketuk(`#rak .hadiah >> nth=${i}`, { tunggu:800 }); await a.baca(`#rak .hadiah >> nth=${i} >> p`); }
  await a.lanjut();

  a.bagian("hadiah-utama");
  await jeda(1000);
  const b = await pusat("#boneka"); await a.seret(b.x, b.y, b.x, b.y - 100, { langkah:10 });
  await page.locator("#ttdS.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiS p >> nth=${i}`);
  await a.lanjut();

  a.bagian("main-lagi");
  await jeda(1500); await a.baca("#judulAkhir"); await a.baca("#pilihan");
  await a.ketuk("#pilihan .utama", { tunggu:1400 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
