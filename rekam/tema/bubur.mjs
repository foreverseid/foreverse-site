/* Semangkuk Bubur (Get Well Soon) — ketuk kenop, aduk melingkar 3 putaran,
   ketuk 4 toples topping (foto), tahan tiup (surat), balasan. */
export const berkas = "bubur-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  a.bagian("kompor");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#kenop", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("aduk");
  await jeda(1100);
  { const b = await kotak("#atasPanci"), cx = b.x + b.width/2, cy = b.y + b.height/2, r = b.width*.3; a.stat.aksi++;
    await page.mouse.move(cx + r, cy); await page.mouse.down();
    for (let s = 0; s <= 3.4*36; s++){ const t = s/36*2*Math.PI; await page.mouse.move(cx + r*Math.cos(t), cy + r*Math.sin(t)); await jeda(16); if (s % 36 === 0 && s) await jeda(500); }
    await page.mouse.up(); }
  for (let i = 0; i < 3; i++) await a.baca(`#semangatL li >> nth=${i}`);
  await a.jepret("aduk-isi");
  await a.lanjut();

  a.bagian("topping");
  await jeda(900);
  for (let i = 0; i < 4; i++){ await a.ketuk(`#toplesR .toples >> nth=${i}`, { tunggu:900 }); await a.baca("#fotoM p"); }
  await a.lanjut();

  a.bagian("tiup");
  await jeda(1000);
  { const b = await kotak("#tiup"); a.stat.aksi++; await page.mouse.move(b.x + b.width/2, b.y + b.height/2); await page.mouse.down(); await jeda(1800); await page.mouse.up(); }
  await page.locator("#ttdS.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiS p >> nth=${i}`);
  await a.lanjut();

  a.bagian("penutup");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
