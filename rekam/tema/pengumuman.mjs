/* Papan Pengumuman (Congrats) — ketuk papan, geser penggaris ke nama,
   stabilo, tarik 3 post-it, geser 4 brosur (foto), sobek amplop (surat), cap. */
export const berkas = "pengumuman-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("papan");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#kertasP h4", { tunggu:900 });
  { const g = await pusat("#penggaris"), d = await kotak(".baris-p.dia"); await a.seret(g.x, g.y, g.x, d.y + d.height*1.1 + 6, { langkah:24 }); }
  await jeda(700);
  { const s = await kotak("#stb"), d = await kotak(".baris-p.dia"); await a.seret(s.x + s.width*.3, s.y + s.height/2, s.x + d.width + 20, s.y + s.height/2, { langkah:20 }); }
  await jeda(900); await a.baca("#judulAwal"); await a.jepret("papan-lolos");
  await a.lanjut();

  a.bagian("catatan");
  await jeda(1100);
  for (let i = 0; i < 3; i++){ const c = await pusat("#blokN .notes.ajak"); await a.seret(c.x, c.y, c.x, c.y - 160, { langkah:12 }); await jeda(600); await a.baca(`#dindingN .tempel >> nth=${i}`); }
  await a.jepret("catatan-isi");
  await a.lanjut();

  a.bagian("brosur");
  await jeda(900);
  for (let i = 0; i < 4; i++){ const b = await pusat(`#fotoP .kartu-f >> nth=${i} >> .brosur`); await a.seret(b.x, b.y, b.x + (i%2 ? -150 : 150), b.y, { langkah:12 }); await jeda(500); await a.baca(`#fotoP .kartu-f >> nth=${i} >> p`); }
  await a.jepret("foto-isi");
  await a.lanjut();

  a.bagian("amplop");
  await jeda(1000);
  { const t = await pusat("#tabS"), m = await kotak("#amplop"); await a.seret(t.x, t.y, t.x + m.width + 10, t.y, { langkah:20 }); }
  await page.locator("#ttdR.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiR p >> nth=${i}`);
  await a.jepret("surat-isi");
  await a.lanjut();

  a.bagian("cap");
  await jeda(900);
  await a.ketuk("#stempelB", { tunggu:1500 });
  await a.jepret("cap");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
