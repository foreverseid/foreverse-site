/* Celengan Rindu (LDR) — koin rencana, buku tabungan, pecah celengan,
   gulungan foto, surat berkaret gelang. */
export const berkas = "celengan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("ketuk-celengan");
  await jeda(1500);
  await a.ketuk("#ayam", { tunggu:1300 });

  a.bagian("tiga-koin");
  for (let k = 0; k < 3; k++){
    const koin = page.locator(".koin:not(.dibawa)").first();
    await a.baca(koin.locator(".tag"));
    await a.seretEl(koin.locator(".bulat"), "#lubang", { langkah:25, tunggu:800 });
  }
  await a.baca("#buku");
  await a.lanjut();

  a.bagian("pecahkan");
  for (let k = 0; k < 3; k++) await a.ketuk("#ayamPecah", { tunggu:450 });
  await jeda(1600);

  a.bagian("gulungan-foto");
  const n = await page.locator(".gulung:not(.besar)").count();
  for (let k = 0; k < n; k++){
    await a.ketuk(page.locator(".gulung:not(.besar):not(.dibaca)").first(), { tunggu:600 });
    const kr = await page.locator(".lembar-foto .kertas").boundingBox();
    await a.seretEl(".lembar-foto .rol", { dx:kr.width*.9, dy:0 }, { tunggu:700 });
    await a.baca(".lembar-foto .ket");
    await a.ketuk("#taruh", { tunggu:500 });
  }

  a.bagian("surat");
  await a.ketuk(".gulung.besar", { tunggu:700 });
  await a.ketuk(".surat .karet", { tunggu:2000 });
  await a.baca(".surat .isi");
  await a.lanjut();

  a.bagian("lipatan-rindu");
  await jeda(1000);
  for (let i = 0; i < 3; i++){
    await a.ketuk(page.locator("#lipatan .lipat:not(.dibuka)").first(), { tunggu:800 });
    await a.baca(`#daftarRindu li >> nth=${i}`);
    if (i === 2) await a.jepret("lipatan-isi");
  }
  await a.lanjut();

  a.bagian("celengan-baru");
  await page.locator("#akhir.tampil").waitFor({ timeout:8000 });
}
