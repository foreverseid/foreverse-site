/* Dia Lewat Sini Duluan (Love Note) — dunia-jelajah: kos (mug, laci foto),
   halte (kursi), minimarket (keranjang, rak, kasir), pintu kos (surat). */
export const berkas = "lewat-duluan-demo.html";

/* salinan peta dari lewat-duluan.html untuk mencari jalan */
const COLS = 46, ROWS = 12, G = [], BLOK = new Set();
for (let r = 0; r < ROWS; r++){ G.push([]); for (let c = 0; c < COLS; c++) G[r].push(r <= 5 ? "B" : (r <= 8 ? "s" : "a")); }
function ruang(c0, c1, din, lan, pintu){ for (let r = 0; r <= 5; r++) for (let c = c0; c <= c1; c++) G[r][c] = (r === 0 || r === 5 || c === c0 || c === c1) ? din : lan; pintu.forEach(c => { G[5][c] = "D" + lan; }); }
ruang(0, 10, "W", "f", [5,6]); ruang(27, 38, "M", "m", [32,33]);
const blok = (c, r) => BLOK.add(r*COLS + c);
blok(2,1); blok(6,2); blok(7,2); blok(17,6); blok(18,6); blok(19,6); blok(28,4);
[[29,2],[30,2],[32,2],[33,2],[35,2],[36,2],[36,4],[37,4]].forEach(([c, r]) => blok(c, r));
[3, 9, 14, 23, 26, 35, 41, 44].forEach(c => blok(c, 8));
const padat = (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || ["W","M","B","a"].includes(G[r][c]) || BLOK.has(r*COLS + c);

export async function main(a){
  const { page, jeda } = a;
  const tbl = t => page.locator("#kartu button").filter({ hasText:t }).filter({ visible:true }).first();
  const aksi = async () => { await a.ketuk("#aksi", { tunggu:700 }); await page.locator("#tirai:not([hidden])").waitFor({ timeout:5000 }).catch(() => {}); };
  a.bagian("pembuka");
  await jeda(1500);
  await a.baca("#pembuka").catch(() => {});
  await a.ketuk("#mulai", { tunggu:1500 });

  a.bagian("kos-pagi");
  await a.jalan({ x:3.5, y:1.6 }, padat); await aksi();
  await a.baca("#kartu"); await a.ketuk(tbl("Taruh lagi"), { tunggu:600 });
  await a.jalan({ x:7.0, y:3.5 }, padat); await aksi();
  const fk = page.locator("#kartu .fk");
  for (let i = 0; i < await fk.count(); i++){ await a.ketuk(fk.nth(i), { tunggu:500 }); }
  await a.baca("#kartu .laci");
  await a.ketuk(tbl("Tutup lacinya"), { tunggu:1200 });

  a.bagian("halte-siang");
  await a.jalan({ x:18.5, y:7.5 }, padat); await aksi();
  for (let i = 0; i < 6; i++){
    const b = tbl("Tunggu bisnya").or(tbl("Bisnya datang"));
    if (!(await b.count())) break;
    const teks = await b.innerText(); await a.ketuk(b, { tunggu:500 });
    if (teks.includes("datang")) break;
    if (!(await tbl("Tunggu bisnya").count())) await a.baca("#kartu .daftar");
    if (i === 0) await jeda(200);
  }

  a.bagian("minimarket-sore");
  await a.jalan({ x:29.5, y:4.5 }, padat); await a.ketuk("#aksi", { tunggu:900 });
  const s = await page.evaluate(() => ({ rak: window.__fv().rak, benar: JSON.parse(document.getElementById("foreverse-data").textContent).barang }));
  const posisi = [{ x:30.5, y:3.5 }, { x:33.5, y:3.5 }, { x:36.0, y:3.5 }];
  for (let i = 0; i < 3; i++){
    if (await page.locator("#tirai:not([hidden]) .struk").count()) break;
    const ada = s.rak[i].filter(n => s.benar.includes(n)); if (!ada.length) continue;
    await a.jalan(posisi[i], padat); await aksi();
    await a.baca("#kartu .rak");
    for (const n of ada){ await a.ketuk(page.locator("#kartu .barang").filter({ hasText:n }).first(), { tunggu:700 }); }
    await jeda(900);
    if (await page.locator("#kartu .struk").count()) break;
    await a.ketuk(tbl("Lanjut ke rak lain"), { tunggu:600 });
  }
  await page.locator("#kartu .struk").waitFor({ timeout:5000 });
  await a.baca("#kartu"); await a.ketuk(tbl("Bawa pulang"), { tunggu:1200 });

  a.bagian("pintu-kos-malam");
  await a.jalan({ x:6.0, y:6.5 }, padat); await aksi();
  for (let i = 0; i < 6; i++){ const b = page.locator("#kartu .tbl").last(); const t = await b.innerText(); if (t.includes("Selesai")) break; await a.ketuk(b, { tunggu:400 }); }
  await a.baca("#kartu .surat");
  await a.ketuk(tbl("Selesai baca"), { tunggu:600 });

  a.bagian("jalan-terang");
  await page.locator("#tirai:not([hidden])").waitFor({ timeout:12000 });
  await a.baca("#kartu");
}
