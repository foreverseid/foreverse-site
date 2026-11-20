/* Rekonstruksi Hari Pertama (Anniversary) — dunia-jelajah alun-alun:
   empat barang bukti, susun garis waktu, pemutaran ulang, laporan, hari ini. */
export const berkas = "rekonstruksi-demo.html";

const COLS = 22, ROWS = 14, SOLID = new Set(), blok = (c, r) => SOLID.add(r*COLS + c);
for (let c = 0; c < COLS; c++){ blok(c, 0); blok(c, ROWS-1); }
for (let r = 0; r < ROWS; r++){ blok(0, r); blok(COLS-1, r); }
[[1,6,1,4],[15,20,1,4],[15,20,9,12],[1,6,9,12],[10,11,6,7]].forEach(([c0, c1, r0, r1]) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) blok(c, r); });
[[8,2],[13,2],[8,12],[14,12]].forEach(([c, r]) => blok(c, r));
const padat = (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || SOLID.has(r*COLS + c);
const PINTU = [[3.5,5.5],[18.5,5.5],[18.5,8.5],[3.5,8.5]];

export async function main(a){
  const { page, jeda } = a;
  const tbl = t => page.locator("#kartu button").filter({ hasText:t }).filter({ visible:true }).first();
  const panel = (t = 15000) => page.locator("#tirai:not([hidden])").waitFor({ timeout:t });
  a.bagian("pembuka");
  await jeda(1500);
  await a.ketuk("#mulai", { tunggu:1500 });

  for (let i = 0; i < 4; i++){
    a.bagian("bukti-" + (i+1));
    await a.jalan({ x:PINTU[i][0], y:PINTU[i][1] }, padat);
    await a.ketuk("#aksi", { tunggu:700 }); await panel();
    await a.baca("#kartu .bukti");
    await a.ketuk(tbl("Simpan ke berkas"), { tunggu:700 });
  }

  a.bagian("garis-waktu");
  await a.jalan({ x:11.0, y:8.4 }, padat);
  await a.ketuk("#aksi", { tunggu:700 }); await panel();
  const kj = await page.evaluate(() => JSON.parse(document.getElementById("foreverse-data").textContent).kejadian);
  const m = s => { const [h, n] = s.split(/[.:]/).map(Number); return h*60 + n; };
  const urut = kj.slice().sort((p, q) => m(p.jam) - m(q.jam));
  await a.baca("#kartu .kartu-bukti");
  for (let n = 0; n < urut.length; n++){
    await a.ketuk(page.locator("#kartu .kb").filter({ hasText:urut[n].tempat }).first(), { tunggu:400 });
    await a.ketuk(page.locator("#kartu .pasak").nth(n), { tunggu:500 });
  }
  await a.ketuk(tbl("Putar ulang"), { tunggu:500 });

  a.bagian("putar-ulang");
  await panel(90000);
  a.bagian("laporan");
  await a.baca("#kartu .laporan");
  await a.ketuk(tbl("Kembali ke hari ini"), { tunggu:500 });

  a.bagian("hari-ini");
  await panel(60000);
  await a.baca("#kartu");
}
