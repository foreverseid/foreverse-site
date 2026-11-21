/* Radio Tengah Malam (LDR) — nyalakan, putar kenop tala ke frekuensi
   kalian, tiga fader salam, kaset foto ke deck, mikrofon ON AIR, tutup siaran. */
export const berkas = "radio-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("nyalakan");
  await jeda(1500);
  await a.ketuk("#kenopDaya", { tunggu:1200 });

  a.bagian("cari-frekuensi");
  { const k = await kotak("#kenopTala"), cx = k.x + k.width/2, cy = k.y + k.height/2, R = k.width*0.42;
    const xy = d => [cx + Math.sin(d*Math.PI/180)*R, cy - Math.cos(d*Math.PI/180)*R];
    a.stat.aksi++; let d = 0; await page.mouse.move(...xy(d)); await page.mouse.down();
    for (let i = 0; i < 900 && !(await page.locator("#radio.terkunci").count()); i++){ d += 6; await page.mouse.move(...xy(d)); if (i % 15 === 14){ await page.mouse.up(); await jeda(250); a.stat.aksi++; await page.mouse.move(...xy(d)); await page.mouse.down(); } }
    await page.mouse.up(); }
  await jeda(600); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("salam");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    const t = await pusat(`#mixer .jalur >> nth=${i} >> .tuas-f`), r = await kotak(`#mixer .jalur >> nth=${i} >> .rel-f`);
    await a.seret(t.x, t.y, t.x, r.y - 20, { langkah:18 }); await jeda(600);
    await a.baca(`#transkrip li >> nth=${i}`);
    if (i === 2) await a.jepret("salam-isi");
  }
  await a.lanjut();

  a.bagian("kaset");
  await jeda(900);
  const n = await page.locator("#rak .kaset").count();
  for (let i = 0; i < n; i++){
    const k = await pusat("#rak .kaset:not(.dipakai)"), c = await pusat("#celahK");
    await a.seret(k.x, k.y, c.x, c.y, { langkah:20 });
    await page.locator("#sampul.tampil").waitFor({ timeout:5000 }); await jeda(700);
    if (i === 0) await a.jepret("kaset-sampul");
    await a.baca("#inlayKet");
    await a.ketuk("#keluar", { tunggu:700 });
  }
  await a.lanjut();

  a.bagian("on-air");
  await jeda(900);
  for (let i = 0; i < 3; i++){
    await a.ketuk("#mik", { tunggu:300 });
    await page.waitForFunction(i => { const p = document.querySelectorAll("#naskah p")[i]; return p && !p.classList.contains("ketik"); }, i, { timeout:20000 });
    await a.baca(`#naskah p >> nth=${i}`);
  }
  await a.jepret("on-air-isi");
  await a.lanjut();

  a.bagian("tutup-siaran");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
