/* Kertas dari Bangku Belakang (Confess) — ketuk kertas, oper 3 kali saat guru menghadap
   papan, tarik laci & ambil 4 foto, buka 2 lipatan (surat), centang jawaban. */
export const berkas = "bangku-belakang-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("kelas");
  await jeda(1500); await a.baca("#judulKelas");
  await a.ketuk("#kertasK", { tunggu:1200 });
  for (let i = 0; i < 3; i++){
    await page.waitForFunction(() => { const s = document.querySelector("#status"); return s && !s.classList.contains("bahaya") && !s.classList.contains("awas"); }, null, { timeout:15000 });
    await jeda(500);
    await page.waitForFunction(() => { const s = document.querySelector("#status"); return s && !s.classList.contains("bahaya") && !s.classList.contains("awas"); }, null, { timeout:15000 });
    await a.ketuk("#oper", { tunggu:900 }); await a.baca(`#catatanL li >> nth=${i}`);
  }
  await a.lanjut();

  a.bagian("laci");
  await jeda(1000);
  const g = await pusat("#gagang"); await a.seret(g.x, g.y, g.x, g.y + 90, { langkah:10 }); await jeda(1100);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#dalam button >> nth=${i}`, { tunggu:700 }); await a.baca(`#fotoG .ft >> nth=${i} >> p`); }
  await a.lanjut();

  a.bagian("kertas");
  await jeda(1000);
  let k = await pusat("#kertas"); await a.seret(k.x, k.y, k.x + 90, k.y, { langkah:10 }); await jeda(1000);
  k = await pusat("#kertas"); await a.seret(k.x, k.y, k.x, k.y + 90, { langkah:10 }); await jeda(1000);
  await page.locator("#ttdS.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiS p >> nth=${i}`);
  await a.lanjut();

  a.bagian("ps");
  await jeda(1200); await a.baca("#judulAkhir"); await a.baca("#pilihan");
  await a.ketuk("#pilihan .utama", { tunggu:1400 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
