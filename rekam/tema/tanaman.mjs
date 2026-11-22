/* Tanaman yang Layu (Apology) — ketuk tanaman, siram (tahan gembor di atas pot),
   petik 3 daun kering, tarik tali krai, ketuk 4 kuncup (foto), cabut patok (surat), jawab. */
export const berkas = "tanaman-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  a.bagian("layu");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#tanaman0", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("siram");
  await jeda(1000);
  { const g = await pusat("#gembor"), t = await kotak("#tanaman1"); a.stat.aksi++;
    await page.mouse.move(g.x, g.y); await page.mouse.down();
    for (let s = 1; s <= 15; s++){ await page.mouse.move(g.x + (t.x + t.width*.5 - g.x)*s/15, g.y + (t.y + t.height*.35 - g.y)*s/15); await jeda(20); }
    for (let s = 0; s < 60; s++){ await page.mouse.move(t.x + t.width*.5 + (s%2), t.y + t.height*.35); await jeda(60); if (await page.locator("#gembor").evaluate(x => x.style.visibility === "hidden")) break; }
    await page.mouse.up(); }
  await jeda(900);
  for (let i = 0; i < 3; i++){ const k = await pusat("#tanaman1 .kering"); await a.seret(k.x, k.y, k.x + 120, k.y - 40, { langkah:10 }); await jeda(500); await a.baca(`#janjiL li >> nth=${i}`); }
  await a.lanjut();

  a.bagian("krai");
  await jeda(900);
  { const t = await pusat("#tarikan"); await a.seret(t.x, t.y, t.x, t.y + 260, { langkah:20 }); }
  await jeda(800);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#kuncupR .kuncup >> nth=${i}`, { tunggu:900 }); await a.baca("#fotoJ p"); }
  await a.lanjut();

  a.bagian("label");
  await jeda(900);
  { const p = await pusat("#patok"); await a.seret(p.x, p.y, p.x, p.y - 140, { langkah:12 }); }
  await page.locator("#ttdT.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiT p >> nth=${i}`);
  await a.lanjut();

  a.bagian("jawab");
  await jeda(1200); await a.baca("#judulAkhir");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
