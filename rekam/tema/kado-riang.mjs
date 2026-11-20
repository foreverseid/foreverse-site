/* Kado Riang (Birthday) — tiket disobek, kue lilin angka, game memori foto,
   kupon digosok, tangkap kado, surat, kartu kado, segel. */
export const berkas = "kado-riang-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("tiket");
  await jeda(1500);
  await a.seretEl("#tkStub", { dx:110, dy:0 }, { tunggu:2200 });

  a.bagian("kue-lilin");
  const lilin = page.locator("#cakeStage .ly-old .fCandle");
  const n = await lilin.count();
  for (let i = 0; i < n; i++) await a.ketuk(lilin.nth(i), { tunggu:600 });
  await page.locator("#cakeReplay:not([hidden])").waitFor({ timeout:15000 });

  a.bagian("memori-foto");
  await a.memori("#memGame .mcard", "data-k");
  await jeda(1200);

  a.bagian("kupon");
  const kupon = page.locator("#kpList .scratch");
  for (let i = 0; i < await kupon.count(); i++){ await a.gosok(kupon.nth(i)); await a.baca(page.locator("#kpList .kp-txt").nth(i)); }

  a.bagian("tangkap-kado");
  await a.ketuk("#catchGame .catch-over button", { tunggu:300 });
  await a.tangkap("#catchGame canvas", ["🎁","🎈","🍰","🧁","🍭"], { selesai: () => page.locator("#tagCatch.on").isVisible() });

  a.bagian("surat");
  await a.ketuk("#openLetter:not([disabled])", { tunggu:300 });
  const mulai = Date.now();
  await page.locator("#ltEnd.show").waitFor({ timeout:60000 });
  await a.bacaSisa("#ltPars", mulai);
  await a.ketuk("#toCredits", { tunggu:1200 });

  a.bagian("kartu-kado");
  await a.ketuk("#crSkip", { tunggu:1500 });
  await a.seretEl("#wax", { dx:0, dy:90 }, { tunggu:2600 });
  await page.locator("#crBtns.show").waitFor({ timeout:8000 });
}
