/* Pemutaran Perdana (Anniversary) — sobek tiket, senter cari kursi E7,
   putar gulungan proyektor (foto), babak surat, kredit film. */
export const berkas = "pemutaran-perdana-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };
  const lanjut = async () => { await page.locator("#lanjut.tampil").waitFor({ timeout:30000 }); await a.ketuk("#lanjut.tampil", { tunggu:1200 }); };

  a.bagian("tiket");
  await jeda(1200); await a.baca("#tiket");
  { const s = await pusat("#sobekan"); await a.seret(s.x, s.y, s.x, s.y + 180, { langkah:15 }); }
  await lanjut();

  a.bagian("studio");
  await jeda(800);
  { const st = await kotak("#studio"), t = await pusat("#kursiGrid .kursi.cari"); a.stat.aksi++;
    await page.mouse.move(st.x + st.width*0.2, st.y + st.height*0.2); await page.mouse.down();
    await page.mouse.move(st.x + st.width*0.8, st.y + st.height*0.4, { steps:20 });
    await page.mouse.move(t.x, t.y, { steps:20 }); await jeda(1300); await page.mouse.up(); }
  await lanjut();

  a.bagian("proyektor");
  await jeda(800);
  { const g = await pusat("#gulungan"), R = (await kotak("#gulungan")).width*0.4, n = await page.evaluate(() => JSON.parse(document.getElementById("foreverse-data").textContent).foto.length);
    for (let putaran = 0; putaran <= n; putaran++){
      a.stat.aksi++; await page.mouse.move(g.x, g.y - R); await page.mouse.down();
      for (let d = 0; d <= 372; d += 12){ const t = (d - 90)*Math.PI/180; await page.mouse.move(g.x + R*Math.cos(t), g.y + R*Math.sin(t)); await jeda(10); }
      await page.mouse.up(); await jeda(600);
      if (putaran > 0) await a.baca("#subtitle");
      if (await page.locator("#lanjut.tampil").count()) break;
    } }
  await lanjut();

  a.bagian("babak");
  for (;;){
    await page.waitForFunction(() => { const i = document.getElementById("babakTeks"); const n = i.textContent.length; return new Promise(r => setTimeout(() => r(n > 0 && i.textContent.length === n), 200)); }, null, { timeout:20000 });
    await a.baca("#babakTeks");
    if (await page.locator("#babakTtd.tampil").count()) break;
    await a.ketuk("#layarSurat", { tunggu:300 });
  }
  await lanjut();

  a.bagian("di-balik-layar");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    const t = await page.locator("#tongkat").boundingBox(), x = t.x + t.width*0.8, y = t.y + t.height*0.2;
    await a.seret(x, y, x, y + 140, { langkah:12 }); await jeda(700);
    await a.baca(`#dialogL li >> nth=${i}`);
    if (i === 2) await a.jepret("klep-isi");
    else await jeda(800);
  }
  await lanjut();

  a.bagian("kredit");
  await page.locator("#akhir.tampil").waitFor({ timeout:60000 });
  await a.baca("#akhirJudul");
}
