/* Toples Kunang-Kunang (Confess) — segel toples, tampung kunang-kunang,
   foto di tali jemuran, pasangan nyala, surat dari cahaya, tahan & lepas. */
export const berkas = "confess-kunang-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const fv = () => page.evaluate(() => window.__fv());
  const cv = await page.locator("#langit").boundingBox(), X = x => cv.x + x, Y = y => cv.y + y;
  const tbl = t => page.locator("#kartu button").filter({ hasText:t }).filter({ visible:true }).first();
  const tunggu = async f => { for (let i = 0; i < 200; i++){ if (await f(await fv())) return; await jeda(100); } throw new Error("menunggu langkah"); };

  a.bagian("pembuka");
  await jeda(1500);
  await a.ketuk("#tblMulai", { tunggu:1200 });

  a.bagian("segel-toples");
  await tunggu(s => s.langkah === 1);
  const j = (await fv()).segelJalur;
  a.stat.aksi++;
  await page.mouse.move(X(j[0].x), Y(j[0].y), { steps:4 }); await page.mouse.down();
  for (let k = 1; k < j.length; k++) await page.mouse.move(X(j[k].x), Y(j[k].y), { steps:18 });
  await page.mouse.up(); await jeda(1200);

  a.bagian("tampung-kunang");
  await tunggu(s => s.langkah === 2);
  let s = await fv(); const x0 = cv.width/2, t0 = s.toples.x;
  a.stat.aksi++;
  await page.mouse.move(X(x0), Y(s.toples.dasar - 10)); await page.mouse.down();
  while ((s = await fv()).langkah === 2){
    const k = s.jatuh.filter(q => q.y < s.toples.mulut).sort((p, q) => q.y - p.y)[0];
    if (k) await page.mouse.move(X(x0 + (k.x - t0)), Y(s.toples.dasar - 10), { steps:3 });
    await jeda(60);
  }
  await page.mouse.up();

  a.bagian("foto-jemuran");
  await tunggu(s => s.langkah === 3);
  s = await fv();
  for (let i = 0; i < s.fotoPos.length && (await fv()).langkah === 3; i++){
    const f = s.fotoPos[i]; a.stat.aksi++;
    await page.mouse.click(X(f.x), Y(f.y + s.pw * .5)); await jeda(900);
    await page.locator("#tirai:not([hidden])").waitFor({ timeout:5000 });
    await a.baca("#kartu .cap"); await jeda(200);
    await a.ketuk(page.locator("#kartu .tbl").first(), { tunggu:600 });
  }

  a.bagian("pasangan-nyala");
  await tunggu(s => s.langkah === 4);
  s = await fv(); const w = s.orbWarna, sudah = new Set();
  for (let i = 0; i < w.length; i++){
    if (sudah.has(i)) continue; const k = w.findIndex((c, x) => x !== i && c === w[i] && !sudah.has(x)); sudah.add(i); sudah.add(k);
    for (const o of [i, k]){ a.stat.aksi++; await page.mouse.click(X(s.orb[o].x), Y(s.orb[o].y)); await jeda(400); }
    await jeda(400);
  }

  a.bagian("surat-cahaya");
  await tunggu(s => s.langkah === 5);
  s = await fv(); a.stat.aksi++;
  await page.mouse.click(X(s.toples.x), Y((s.toples.mulut + s.toples.dasar) / 2)); await jeda(900);
  for (let i = 0; i < 6; i++){
    const b = page.locator("#kartu .tbl").first(); await jeda(450);
    if ((await b.innerText()).includes("Tutup")) break;
    await a.ketuk(b, { tunggu:300 });
  }
  await a.baca("#kartu");
  await a.ketuk(tbl("Tutup suratnya"), { tunggu:800 });

  a.bagian("tahan-lepas");
  await tunggu(s => s.langkah === 6);
  s = await fv(); a.stat.aksi++;
  await page.mouse.move(X(s.toples.x), Y((s.toples.mulut + s.toples.dasar) / 2)); await page.mouse.down(); await jeda(1700); await page.mouse.up();
  await page.locator("#tirai:not([hidden])").waitFor({ timeout:8000 });
  await a.baca("#kartu");
  await a.ketuk(tbl("Lanjut"), { tunggu:1200 });

  a.bagian("penutup");
  await page.locator("#tirai:not([hidden])").waitFor({ timeout:8000 });
  await a.baca("#kartu");
}
