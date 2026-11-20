/* Langit Harapan (Birthday) — layar kunci, bintang angka umur, galeri,
   kuis "seberapa kenal", tiga bintang harapan, puzzle foto, surat. */
export const berkas = "langit-harapan-demo.html";

export async function main(a){
  const { page, jeda } = a;
  a.bagian("layar-kunci");
  await jeda(1500);
  for (const k of "1010") await a.ketuk(`#keypad button[data-k="${k}"]`, { tunggu:350 });
  await jeda(1800);

  a.bagian("bintang-umur");
  const lilin = page.locator("#cakeStage .ly-old .fStar");
  for (let i = 0; i < await lilin.count(); i++) await a.ketuk(lilin.nth(i), { tunggu:600 });
  await page.locator("#cakeReplay:not([hidden])").waitFor({ timeout:15000 });

  a.bagian("galeri");
  await a.baca("#bento");

  a.bagian("kuis");
  for (let i = 0; i < 3; i++){
    const q = page.locator("#quizGame .quiz-q"); await a.baca(q); await a.baca("#quizGame .quiz-opts");
    await a.ketuk(page.locator("#quizGame .quiz-opt").first(), { tunggu:1500 });
  }
  await page.locator("#tagQuiz.on").waitFor({ timeout:8000 });

  a.bagian("bintang-harapan");
  for (let i = 0; i < 3; i++) await a.ketuk(`#sky .st[data-i="${i}"]`, { tunggu:600 });
  await a.baca("#wishList");

  a.bagian("puzzle");
  for (let pos = 0; pos < 9; pos++){
    const urut = await page.locator("#pzGame .pz-tile").evaluateAll(t => t.map(b => { const [x, y] = getComputedStyle(b).backgroundPosition.split(" ").map(v => Math.round(parseFloat(v) / 50)); return y * 3 + x; }));
    if (urut[pos] === pos) continue;
    const j = urut.indexOf(pos);
    await a.ketuk(page.locator("#pzGame .pz-tile").nth(pos), { tunggu:250 });
    await a.ketuk(page.locator("#pzGame .pz-tile").nth(j), { tunggu:350 });
  }
  await page.locator("#tagPz.on").waitFor({ timeout:8000 });

  a.bagian("surat");
  await a.ketuk("#openLetter:not([disabled])", { tunggu:300 });
  const mulai = Date.now();
  await page.locator("#ltEnd.show").waitFor({ timeout:60000 });
  await a.bacaSisa("#ltPars", mulai);
  await a.ketuk("#toEnd", { tunggu:1500 });
}
