/* Studio Foto Wisuda (Graduation) — saklar lampu, 4 kali: baca aba-aba,
   putar cincin fokus sampai tajam, tekan rana; pilih satu hasil; tarik cetakan besar
   (surat), timer foto bareng. */
export const berkas = "studio-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();

  a.bagian("lampu");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#saklar", { tunggu:900 });
  await a.lanjut();

  a.bagian("pemotretan");
  for (let i = 0; i < 4; i++){
    await jeda(700); await a.baca("#aba");
    const b = await kotak("#cincin"), y = b.y + b.height/2;
    /* geser pelan sampai tajam (cari arah: coba ke kanan dulu, lalu ke kiri) */
    a.stat.aksi++;
    let tajam = false;
    for (const arah of [1, -1]){
      await page.mouse.move(b.x + b.width/2, y); await page.mouse.down();
      for (let s = 1; s <= 40 && !tajam; s++){ await page.mouse.move(b.x + b.width/2 + arah * s * b.width/40, y); await jeda(30); tajam = await page.locator("#lcd.tajam").count() > 0; }
      await page.mouse.up(); if (tajam) break; await jeda(300);
    }
    await jeda(400);
    if (i === 0) await a.jepret("fokus-tajam");
    await a.ketuk("#rana.siap", { tunggu:1200 });
  }
  await a.jepret("baki-isi");
  await a.lanjut();

  a.bagian("pilih");
  await jeda(900); await a.baca("#judulPilih");
  for (let i = 0; i < 4; i++) await a.baca(`#mejaC .pil-c >> nth=${i} >> span`);
  await a.ketuk("#mejaC .pil-c >> nth=1", { tunggu:600 });
  await a.jepret("pilih-isi");
  await a.lanjut();

  a.bagian("cetakan");
  await jeda(900);
  { const b = await kotak("#kertas"); await a.seret(b.x + b.width/2, b.y + b.height - 6, b.x + b.width/2, b.y + b.height + 700, { langkah:30 }); }
  await jeda(700);
  for (let i = 0; i < 3; i++) await a.baca(`#tulis p >> nth=${i}`);
  await a.jepret("cetakan-isi");
  await a.lanjut();

  a.bagian("foto-bareng");
  await jeda(900);
  await a.ketuk("#timer", { tunggu:3500 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
  await a.baca("#judulAkhir");
}
