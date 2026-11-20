/* Cokelat Buatan Sendiri (Valentine) — kelupas foil, tuang 3 cetakan
   (alasan), bendera praline (foto), lipatan bungkus (surat), patahkan berdua. */
export const berkas = "pabrik-cokelat-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  const lanjut = async () => { await page.locator("#lanjut.tampil").waitFor({ timeout:30000 }); await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("foil");
  await jeda(1200);
  { const s = await pusat("#sudutFoil"); await a.seret(s.x, s.y, s.x - 230, s.y + 230, { langkah:25 }); }
  await page.locator("#judulAwal.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAwal");
  await lanjut();

  a.bagian("tuang");
  await jeda(800);
  const U = await page.evaluate(() => { const p = document.createElement("div"); p.style.cssText = "position:fixed;width:calc(var(--u)*100)"; document.body.appendChild(p); const w = p.getBoundingClientRect().width / 100; p.remove(); return w; });
  for (let i = 0; i < 3; i++){
    for (let coba = 0; coba < 3; coba++){
      const p = await pusat("#panci"); a.stat.aksi++;
      await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + U*15, p.y, { steps:10 });
      const t0 = Date.now();
      while (Date.now() - t0 < 9000){
        const lv = await page.evaluate(i => { const d = document.querySelectorAll("#cetakanBaris .cetakan path.isi")[i].getAttribute("d") || ""; const m = d.match(/^M0 ([\d.-]+)/); return m ? (92 - +m[1]) / 92 : 0; }, i);
        if (lv >= 0.86) break; await jeda(40);
      }
      await page.mouse.up(); await jeda(600);
      if (await page.locator(`#cetakanBaris .cetakan >> nth=${i} >> .tulis.ditulis`).count()) break;
    }
    await page.locator("#alasan.tampil").waitFor({ timeout:5000 }); await a.baca("#alasan"); await jeda(800);
  }
  await lanjut();

  a.bagian("praline");
  const n = await page.locator("#kotakPraline .bendera").count();
  for (let i = 0; i < n; i++){
    const b = await pusat(`#kotakPraline .bendera >> nth=${i}`); await a.seret(b.x, b.y, b.x, b.y - 160, { langkah:15 });
    await page.locator("#kartuFoto.tampil").waitFor({ timeout:5000 }); await jeda(400); await a.baca("#kfKet");
    await a.ketuk("#kartuFoto", { tunggu:500 });
  }
  await lanjut();

  a.bagian("bonbon");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    await a.ketuk(page.locator("#kotakBonbon .bonbon:not(.gigit)").first(), { tunggu:900 });
    await a.baca(`#daftarRasa li >> nth=${i}`);
    if (i === 2) await a.jepret("bonbon-isi");
  }
  await lanjut();

  a.bagian("lipatan");
  const pn = await page.locator("#lipatan .panel").count();
  for (let i = 0; i < pn; i++){
    await a.baca(`#lipatan .panel >> nth=${i}`);
    if (i === pn - 1) break;
    const b = await kotak(`#lipatan .panel >> nth=${i}`); const y = b.y + b.height/2;
    await a.seret(b.x + b.width*0.85, y, b.x - b.width*0.2, y, { langkah:20 }); await jeda(700);
  }
  await lanjut();

  a.bagian("bagi-dua");
  { const s = await pusat("#separuhN"); await a.seret(s.x, s.y, s.x + U*18, s.y, { langkah:15 }); }
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 }); await a.baca("#judulAkhir");
}
