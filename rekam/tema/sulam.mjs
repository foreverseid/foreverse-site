/* Sulaman Dua Kota (LDR) — pilih benang, kencangkan sekrup, seret jarum
   melewati 22 titik (rute antar kota yang berakhir jadi hati; tiga
   simpul membuka isian jahitan), tarik 4 peniti ke atas, balik
   pamidangan dan buka kertas yang terselip, gunting benang. */
export const berkas = "sulam-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  const pusat = async sel => { const b = await kotak(sel); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("benang");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#gulungan .gulung-b", { tunggu:900 });
  for (let i = 0; i < 3; i++) await a.ketuk("#sekrup", { tunggu:500 });

  a.bagian("jahit");
  await jeda(700);
  /* posisi layar tiap titik dibaca dari lubang SVG-nya */
  const titik = await page.evaluate(() => {
    const svg = document.querySelector("#pola"), r = svg.getBoundingClientRect();
    const t = [...svg.querySelectorAll(".lubang")].map(c => ({ x: r.left + c.cx.baseVal.value / 100 * r.width, y: r.top + c.cy.baseVal.value / 100 * r.height }));
    const k = svg.querySelector(".titik-k"); return { mulai: { x: r.left + k.cx.baseVal.value / 100 * r.width, y: r.top + k.cy.baseVal.value / 100 * r.height }, t };
  });
  /* tiga tarikan: sampai simpul 1, sampai kota pengirim, lalu hatinya */
  const potong = [[0, 6], [6, 10], [10, titik.t.length]];
  let dari = titik.mulai;
  for (const [i0, i1] of potong){
    a.stat.aksi++;
    await page.mouse.move(dari.x, dari.y); await page.mouse.down();
    for (let k = i0; k < i1; k++){
      const ke = titik.t[k], pr = k === i0 ? dari : titik.t[k - 1];
      for (let s = 1; s <= 6; s++){ await page.mouse.move(pr.x + (ke.x - pr.x) * s / 6, pr.y + (ke.y - pr.y) * s / 6); await jeda(28); }
    }
    await page.mouse.up(); dari = titik.t[i1 - 1];
    await jeda(500); await a.baca(`#catatanJ li >> nth=${potong.findIndex(p => p[1] === i1)}`);
  }
  await a.jepret("jahit-isi");
  await a.lanjut();

  a.bagian("tambalan");
  await jeda(900);
  for (let i = 0; i < 4; i++){
    const p = await pusat(`#papan .tambal >> nth=${i} >> .peniti`);
    await a.seret(p.x, p.y, p.x, p.y - 70, { langkah:12 }); await jeda(1500);
    await a.baca(`#papan .tambal >> nth=${i} >> p`);
  }
  await a.jepret("tambalan-isi");
  await a.lanjut();

  a.bagian("balik");
  await jeda(900);
  { const p = await pusat("#balik"); await a.seret(p.x - 60, p.y, p.x + 160, p.y, { langkah:20 }); }
  await jeda(800);
  await a.ketuk("#lipat", { tunggu:600 });
  await page.locator("#suratK .ttd:not(:empty)").waitFor({ timeout:30000 });
  for (let i = 0; i < 3; i++) await a.baca(`#suratK p >> nth=${i}`);
  await a.jepret("surat-isi");
  await a.lanjut();

  a.bagian("gunting");
  await jeda(900);
  { const g = await pusat("#gunting"), u = await pusat("#ujungG"); await a.seret(g.x, g.y, u.x, u.y, { langkah:20 }); }
  await jeda(1800); await a.jepret("gantung");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
