/* Malam Takbiran (Idulfitri) — teropong hilal, anyam ketupat (maaf),
   toples kue (foto), beduk membuka surat, bersalaman. */
export const berkas = "malam-takbiran-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  const lanjut = async () => { await page.locator("#lanjut.tampil").waitFor({ timeout:30000 }); await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("hilal");
  await jeda(1500);
  { const l = await pusat("#lensa"), h = await pusat("#hilal"); a.stat.aksi++;
    await page.mouse.move(l.x, l.y); await page.mouse.down();
    await page.mouse.move(l.x + (h.x - l.x)*0.5, l.y + (h.y - l.y)*0.3, { steps:12 }); await jeda(200);
    await page.mouse.move(h.x, h.y, { steps:12 }); await jeda(800); await page.mouse.up(); }
  await page.locator("#judulAwal.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAwal");
  await lanjut();

  a.bagian("ketupat");
  for (let r = 0; r < 3; r++){
    await jeda(500);
    while (await page.locator("#anyaman .lungsin.nyala").count()) await a.ketuk("#anyaman .lungsin.nyala", { tunggu:300 });
    await page.locator(`#daftarMaaf li >> nth=${r}`).waitFor({ timeout:5000 }); await a.baca(`#daftarMaaf li >> nth=${r}`);
  }
  await lanjut();

  a.bagian("toples");
  const n = await page.locator("#rak .toples").count();
  for (let i = 0; i < n; i++){
    const t = await kotak(`#rak .toples >> nth=${i} >> .tutup`), cx = t.x + t.width/2, cy = t.y + t.height/2, R = Math.min(t.width, t.height)*0.4;
    a.stat.aksi++; await page.mouse.move(cx + R, cy); await page.mouse.down();
    for (let d = 0; d <= 360; d += 12){ const s = -d*Math.PI/180; await page.mouse.move(cx + R*Math.cos(s), cy + R*Math.sin(s)); await jeda(10); }
    await page.mouse.up();
    await page.locator("#fotoNaik.tampil").waitFor({ timeout:5000 }); await jeda(400); await a.baca("#fnKet");
    await a.ketuk("#fotoNaik", { tunggu:600 });
  }
  await lanjut();

  a.bagian("beduk");
  await jeda(800);
  const b = await pusat("#beduk"), bagian = await page.locator("#untai .pelita").count() / 3;
  for (let k = 0; k < bagian; k++){
    for (let i = 0; i < 3; i++){ a.stat.aksi++; await page.mouse.click(b.x, b.y); await jeda(330); }
    await jeda(500); await a.baca("#ksPar");
  }
  await lanjut();

  a.bagian("salaman");
  await jeda(600);
  { const k = await pusat("#tanganKanan"); await a.seret(k.x, k.y, k.x - 200, k.y, { langkah:20 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAkhir");
}
