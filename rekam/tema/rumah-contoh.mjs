/* Rumah Contoh (Proposal) — tur rumah: keset, kunci, bingkai foto, catatan,
   tuang teh, lampu tali, bangku, surat, kotak cincin. */
export const berkas = "rumah-contoh-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const fv = () => page.evaluate(() => window.__fv());
  const asal = async () => { const b = await page.locator("#ruang").boundingBox(); return b; };
  const tampak = async x => {           // geser ruangan supaya titik x terlihat
    const f = await fv(); if (x > 40 && x < f.W - 40) return x;
    const c = await asal(), y = c.y + f.H*0.62, d = Math.max(-f.W*0.8, Math.min(f.W*0.8, x - f.W/2));
    await a.seret(c.x + f.W/2 + d/2, y, c.x + f.W/2 - d/2, y, { langkah:20 }); await jeda(900);
    return null;
  };
  const titik = async ambil => {        // ketuk titik dari __fv, geser dulu kalau di luar layar
    for (let i = 0; i < 6; i++){
      const p = ambil(await fv()); if (await tampak(p.x) === null) continue;
      const c = await asal(); await a.seret(c.x + p.x, c.y + p.y, c.x + p.x, c.y + p.y, { langkah:1 }); await jeda(800); return;
    }
    throw new Error("titik tidak terjangkau");
  };
  const baca = async label => { await page.locator("#tirai:not([hidden])").waitFor({ timeout:15000 }); await a.baca("#kartu"); await a.ketuk(page.locator("#kartu button").filter({ hasText:label }).first(), { tunggu:600 }); };
  const pintu = async () => { await titik(f => f.sasaran); await jeda(900); };

  a.bagian("pembuka");
  await jeda(1500); await a.baca("#pembuka"); await a.ketuk("#tblMulai", { tunggu:1200 });

  a.bagian("teras");
  { const f = await fv(), c = await asal(); await tampak(f.keset.x);
    const k = (await fv()).keset; await a.seret(c.x + k.x, c.y + k.y, c.x + k.x - f.S*0.5, c.y + k.y, { langkah:25 }); await jeda(900); }
  await titik(f => f.sasaran); await baca("Simpan");
  await pintu();

  a.bagian("ruang-tamu");
  while ((await fv()).sasaran?.semua?.length){ await titik(f => f.sasaran.semua[0]); await baca("Taruh"); }
  await titik(f => f.sasaran); await baca("Simpan");
  await pintu();

  a.bagian("dapur");
  for (let n = 0; n < 4 && (await fv()).tugas === 0; n++){
    const s = (await fv()).sasaran; await tampak(s.x); const p = (await fv()).sasaran, c = await asal();
    await page.mouse.move(c.x + p.x, c.y + p.y); await page.mouse.down(); a.stat.aksi++;
    const t0 = Date.now(); while ((await fv()).air < 0.78 && Date.now() - t0 < 8000) await jeda(40);
    await page.mouse.up(); await jeda(1200);
  }
  await titik(f => f.sasaran); await baca("Simpan");
  await pintu();

  a.bagian("halaman");
  { const f = await fv(); await tampak(f.kait[0].x); }
  { const f = await fv(), c = await asal(); a.stat.aksi++;
    await page.mouse.move(c.x + f.kait[0].x, c.y + f.kait[0].y); await page.mouse.down();
    for (const k of f.kait.slice(1)) await page.mouse.move(c.x + k.x, c.y + k.y, { steps:18 });
    await page.mouse.up(); await jeda(1200); }
  await titik(f => f.sasaran); await baca("Simpan");
  await pintu();

  a.bagian("kamar");
  await titik(f => f.sasaran); await baca("Taruh suratnya");
  { const f = await fv(); await tampak(f.kotak.x); const g = await fv(), c = await asal();
    await a.seret(c.x + g.kotak.x, c.y + g.kotak.y, c.x + g.kotak.x, c.y + g.kotak.y - g.S*0.25, { langkah:20 }); }
  a.bagian("lamaran");
  await page.locator("#tirai:not([hidden])").waitFor({ timeout:15000 });
  await a.baca("#kartu");
}
