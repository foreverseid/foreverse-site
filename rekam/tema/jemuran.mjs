/* Tali Jemuran (Love Note) — ketuk keranjang, tarik tali katrol, ketuk 3 catatan,
   kibaskan 4 polaroid (foto), tangkap kertas terbang (surat), balasan. */
export const berkas = "jemuran-demo.html";

export async function main(a){
  const { page, jeda } = a;
  const kotak = sel => page.locator(sel).first().boundingBox();
  a.bagian("keranjang");
  await jeda(1500); await a.baca("#judulAwal");
  await a.ketuk("#keranjang", { tunggu:1500 }); await a.baca("#judulAwal");
  await a.lanjut();

  a.bagian("tali");
  await jeda(1100);
  const lebar = page.viewportSize().width;
  for (let i = 0; i < 3; i++){
    for (let k = 0; k < 8; k++){ const b = await kotak(`.catatan[data-i="${i}"]`); if (b.x > 10 && b.x + b.width < lebar - 10) break;
      const h = await kotak("#halaman"); await a.seret(lebar*.75, h.y + h.height*.8, lebar*.3, h.y + h.height*.8, { langkah:14 }); await jeda(300); }
    await a.ketuk(`.catatan[data-i="${i}"]`, { tunggu:700 }); await a.baca(`#pesanL li >> nth=${i}`);
  }
  await a.lanjut();

  a.bagian("polaroid");
  await jeda(900);
  for (let i = 0; i < 4; i++){ const b = await kotak(`#fotoK .pol >> nth=${i}`), x = b.x + b.width/2, y = b.y + b.height/2; a.stat.aksi++;
    await page.mouse.move(x, y); await page.mouse.down();
    for (let r = 0; r < 7; r++){ for (let s = 1; s <= 6; s++){ await page.mouse.move(x + (r%2 ? 1 : -1)*s*9, y); await jeda(14); } }
    await page.mouse.up(); await jeda(400); await a.baca(`#fotoK .pol >> nth=${i} >> p`); }
  await a.lanjut();

  a.bagian("angin");
  await jeda(1400);
  await a.ketuk("#terbang", { tunggu:900 });
  await page.locator("#ttdJ.tampil").waitFor({ timeout:40000 });
  for (let i = 0; i < 3; i++) await a.baca(`#isiJ p >> nth=${i}`);
  await a.lanjut();

  a.bagian("sore");
  await jeda(1200); await a.baca("#judulAkhir"); await a.baca("#pilihan");
  await a.ketuk("#pilihan .utama", { tunggu:1200 });
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
