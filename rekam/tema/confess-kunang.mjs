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
  /* dimainkan seperti orang: warna sebuah kunang baru diketahui setelah diketuk
     (sama dengan cara memori() di Kado Riang), bukan dibaca langsung semuanya */
  s = await fv();
  { const w = s.orbWarna, dilihat = new Map(), cocok = new Set();
    const ketukO = async i => { a.stat.aksi++; await page.mouse.click(X(s.orb[i].x), Y(s.orb[i].y)); await jeda(450); dilihat.set(i, w[i]); };
    const pasanganDikenal = () => { for (const [i, c] of dilihat) for (const [j, d] of dilihat) if (i < j && c === d && !cocok.has(i) && !cocok.has(j)) return [i, j]; return null; };
    while (cocok.size < w.length && (await fv()).langkah === 4){
      const p = pasanganDikenal();
      if (p){ await ketukO(p[0]); await ketukO(p[1]); p.forEach(x => cocok.add(x)); await jeda(400); continue; }
      const i = w.findIndex((_, x) => !dilihat.has(x) && !cocok.has(x)); await ketukO(i);
      const kenal = [...dilihat].find(([j, c]) => j !== i && c === w[i] && !cocok.has(j));
      if (kenal){ await ketukO(kenal[0]); cocok.add(i); cocok.add(kenal[0]); await jeda(400); continue; }
      const j = w.findIndex((_, x) => !dilihat.has(x) && !cocok.has(x)); await ketukO(j);
      if (w[i] === w[j]){ cocok.add(i); cocok.add(j); await jeda(400); } else await jeda(900);
    }
    await a.jepret("pasangan-isi");
  }

  a.bagian("surat-cahaya");
  await tunggu(s => s.langkah === 5);
  await jeda(1500); s = await fv(); a.stat.aksi++;
  await page.mouse.click(X(s.toples.x), Y((s.toples.mulut + s.toples.dasar) / 2)); await jeda(900);
  for (let i = 0; i < 6; i++){
    const b = page.locator("#kartu .tbl").first(); await jeda(450);
    if ((await b.innerText()).includes("Tutup")) break;
    await a.ketuk(b, { tunggu:300 });
  }
  await a.baca("#kartu");
  await page.evaluate(() => { const k = document.getElementById("kartu"); k.scrollTop = k.scrollHeight; }); await jeda(500);
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
