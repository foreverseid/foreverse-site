/* Garis Finis (Congrats) — pilih pelari, peniti nomor dada, lari 100 m
   (sorakan pembeli), foto finis, tayangan ulang (perjuangan), medali (pencapaian), papan skor (surat). */
export const berkas = "garis-finis-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const aktif = n => page.locator(`#s${n}.aktif`).waitFor({ timeout:30000 });  // maju otomatis (LANJUT_OTOMATIS)
  const pusat = async sel => { const b = await page.locator(sel).first().boundingBox(); return { x:b.x + b.width/2, y:b.y + b.height/2 }; };

  a.bagian("persiapan");
  await aktif(0); await jeda(1200);
  await a.ketuk(".calon >> nth=0", { tunggu:900 });
  for (const lb of ["#lubangK", "#lubangN"]){
    const p = await pusat("#penitiWadah .peniti:not(.terpasang)"), l = await pusat(lb);
    await a.seret(p.x, p.y, l.x, l.y, { langkah:22 }); await jeda(700);
  }

  a.bagian("lari");
  await aktif(1); await jeda(1500);
  const kiri = await pusat("#kiri"), kanan = await pusat("#kanan");
  for (let n = 0; n < 400 && !(await page.locator("#pitaFinis.putus").count()); n++){
    const p = n % 2 ? kanan : kiri; a.stat.aksi++;
    await page.mouse.move(p.x, p.y); await page.mouse.down(); await jeda(40); await page.mouse.up(); await jeda(150);
  }

  a.bagian("foto-finis");
  await aktif(2); await jeda(900);
  for (let i = 0; i < 6; i++){
    const no = await page.locator("#finisNo").textContent(); const [k, n] = no.split("/").map(Number);
    const b = await page.locator("#bingkai").boundingBox(), p = await pusat("#pindai");
    await a.seret(p.x, p.y, b.x + b.width + 10, p.y, { langkah:25 });
    await page.locator("#finisKet.tampil").waitFor({ timeout:5000 }); await a.baca("#finisKet");
    if (k >= n) break;
    await page.waitForFunction(x => document.getElementById("finisNo").textContent !== x, no, { timeout:8000 });
  }

  a.bagian("tayangan-ulang");
  await aktif(6); await jeda(900);
  for (let i = 0; i < 4; i++){
    const j = await pusat("#jarum"), r = await page.locator("#relUlang").boundingBox();
    await a.seret(j.x, j.y, Math.min(r.x + r.width + 20, j.x + r.width*0.45), j.y, { langkah:30 }); await jeda(500);
    if (i < 3){ await page.locator(`#ulangKet li >> nth=${i}`).waitFor({ timeout:4000 }); await a.baca(`#ulangKet li >> nth=${i}`); if (i === 2) await a.jepret("tayangan-ulang-isi"); }
  }

  a.bagian("podium");
  await aktif(3); await jeda(900);
  { const m = await pusat("#medali"), l = await pusat("#leher"); await a.seret(m.x, m.y, l.x, l.y, { langkah:25 }); }
  await page.locator("#ukiran.tampil").waitFor({ timeout:8000 }); await a.baca("#ukiran");

  a.bagian("papan-skor");
  await aktif(4);
  for (;;){
    const no = await page.locator("#papanNo").textContent(); const [k, n] = no.split("/").map(Number);
    await page.waitForFunction(() => { const i = document.getElementById("papanIsi"); const a = i.textContent.length; return new Promise(r => setTimeout(() => r(i.textContent.length === a && a > 0), 200)); }, null, { timeout:20000 });
    await a.baca("#papanIsi");
    if (k >= n) break;
    await a.ketuk("#papan", { tunggu:300 });
  }

  a.bagian("penutup");
  await aktif(5); await jeda(800);
  await a.baca("#s5");
}
