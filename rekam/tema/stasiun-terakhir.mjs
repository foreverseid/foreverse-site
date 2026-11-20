/* Stasiun Terakhir (Parting Ways) — karcis ke gerbang, tuas wesel ke
   stasiun-stasiun kenangan, kerai jendela (foto), pengumuman (surat), lambaian. */
export const berkas = "stasiun-terakhir-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const pusat = async sel => { const b = await page.locator(sel).first().boundingBox(); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  const lanjut = async () => { await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("gerbang");
  await jeda(1200); await a.baca("#karcis");
  { const k = await pusat("#karcis"), c = await pusat("#celah"); await a.seret(k.x, k.y, c.x, c.y, { langkah:25 }); }
  await lanjut();

  a.bagian("jalur-kenangan");
  await jeda(800);
  const n = await page.locator("#peta .tuas").count();
  for (let i = 0; i < n; i++) await a.ketuk(page.locator("#peta .tuas").nth(i), { tunggu:400 });
  for (let i = 0; i < n; i++){
    await page.locator("#kenang.tampil").waitFor({ timeout:30000 });
    await a.baca("#kenang");          // kartu tampil 3,4 detik; bacanya tetap dihitung penuh
    await page.locator("#kenang:not(.tampil)").waitFor({ timeout:15000 });
  }
  await page.locator("#lanjut.tampil").waitFor({ timeout:30000 }); await lanjut();

  a.bagian("jendela");
  for (let i = 0; i < 6; i++){
    await jeda(600);
    const j = await page.locator("#jendela").boundingBox(), x = j.x + j.width/2;
    await a.seret(x, j.y + j.height*0.85, x, j.y + j.height*0.05, { langkah:22 });
    await page.locator("#stiker.tampil").waitFor({ timeout:5000 }); await a.baca("#stiker");
    const sisa = await page.locator("#stiker small").textContent(); const [k, t] = sisa.split("·")[1].trim().split("/").map(Number);
    if (k >= t) break;
    await page.locator("#stiker:not(.tampil)").waitFor({ timeout:8000 });
  }
  await page.locator("#lanjut.tampil").waitFor({ timeout:15000 }); await lanjut();

  a.bagian("pengumuman");
  await jeda(1200);
  for (let i = 0; i < 10; i++){
    await a.ketuk("#speaker:not([disabled])", { tunggu:1500 });
    await a.baca(`#pengumuman p >> nth=${i}`);
    if (!(await page.locator("#speaker:not([disabled])").count())) break;
  }
  await page.locator("#lanjut.tampil").waitFor({ timeout:15000 }); await lanjut();

  a.bagian("berangkat");
  { const b = await page.locator("#lambai").boundingBox(), y = b.y + b.height/2; a.stat.aksi++;
    await page.mouse.move(b.x + b.width*0.5, y); await page.mouse.down();
    for (let i = 0; i < 4; i++) await page.mouse.move(b.x + b.width*(i % 2 ? 0.25 : 0.75), y, { steps:12 });
    await page.mouse.up(); }
  await page.locator("#akhir.tampil").waitFor({ timeout:10000 });
  await a.baca("#penutupTeks");
}
