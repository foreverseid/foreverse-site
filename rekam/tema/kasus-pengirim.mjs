/* Kasus Pengirim Tanpa Nama — dimainkan lewat joystick & tombol aksi sungguhan. */
export const berkas = "kasus-pengirim-demo.html";

/* salinan peta dari kasus-pengirim.html (bagian PETA) untuk mencari jalan */
const COLS = 24, ROWS = 16, BLOK = new Set();
const blok = (c, r) => BLOK.add(r*COLS + c);
[[3,2],[4,2],[7,3],[8,3],[8,4],[15,1],[15,2],[10,6],[11,6],[15,9],[16,9],[9,11],[10,11],
 [19,12],[20,12],[14,13],[15,13],[1,6],[22,14],[1,14]].forEach(([c,r]) => blok(c,r));
for (let c = 15; c <= 22; c++) blok(c, 3);
const padat = (c, r) => c <= 0 || r <= 0 || c >= COLS-1 || r >= ROWS-1 || (r === 8 && c <= 7) || BLOK.has(r*COLS + c);

function jalan(dari, ke){
  const s = [Math.floor(dari.x), Math.floor(dari.y)], t = [Math.floor(ke.x), Math.floor(ke.y)];
  const asal = new Map([[s.join(), null]]), q = [s];
  while (q.length){
    const [c, r] = q.shift();
    if (c === t[0] && r === t[1]) break;
    for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const n = [c+dc, r+dr];
      if (!padat(...n) && !asal.has(n.join())){ asal.set(n.join(), [c, r]); q.push(n); }
    }
  }
  const rute = []; let k = t;
  while (k){ rute.unshift({ x:k[0]+0.5, y:k[1]+0.5 }); k = asal.get(k.join()); }
  rute[rute.length-1] = ke;
  return rute.slice(1);
}

async function ke(a, tujuan){
  const { page } = a;
  const joy = await page.locator("#joy").boundingBox();
  const cx = joy.x + joy.width/2, cy = joy.y + joy.height/2;
  const fv = () => page.evaluate(() => window.__fv());
  const rute = jalan(await fv(), tujuan);
  await page.mouse.move(cx, cy, { steps:6 }); await page.mouse.down();
  for (const titik of rute){
    for (let i = 0; i < 200; i++){
      const p = await fv();
      const dx = titik.x - p.x, dy = titik.y - p.y, d = Math.hypot(dx, dy);
      if (d < 0.18) break;
      await page.mouse.move(cx + dx/d*44, cy + dy/d*44);
      await page.waitForTimeout(30);
    }
  }
  await page.mouse.move(cx, cy, { steps:4 }); await page.mouse.up();
  await page.waitForTimeout(400);
  const akhir = await fv();
  if (!akhir.dekat) throw new Error('tidak sampai: ' + JSON.stringify([akhir.x, akhir.y, tujuan]));
}

export async function main(a){
  const { page, jeda } = a;
  a.bagian("pembuka");
  await jeda(2200);
  await a.ketuk("#mulai", { tunggu:1800 });

  a.bagian("meja-langganan");
  await ke(a, { x:4.5, y:3.6 });
  await a.ketuk("#aksi", { tunggu:1600 });
  await a.ketukTeks("Periksa pojok kertasnya", { tunggu:2200 });
  await a.ketukTeks("Masukkan ke kantong bukti", { tunggu:1500 });

  a.bagian("barista");
  await ke(a, { x:18.5, y:4.6 });
  await a.ketuk("#aksi", { tunggu:1400 });
  await a.ketuk(page.locator(".tanya button").nth(0), { tunggu:1300 });
  await a.ketuk(page.locator(".tanya button").nth(2), { tunggu:2200 });
  await a.ketukTeks("Catat kesaksiannya", { tunggu:1500 });

  a.bagian("papan-foto");
  await ke(a, { x:4.5, y:9.6 });
  await a.ketuk("#aksi", { tunggu:1400 });
  const n = await page.locator(".papan .paku").count();
  for (let i = 0; i < n; i++) await a.ketuk(page.locator(".papan .paku").nth(i), { tunggu:1500 });
  await a.ketuk(page.locator(".balik-foto"), { tunggu:1800 });
  await a.ketukTeks("Masukkan ke kantong bukti", { tunggu:1500 });

  a.bagian("coret-tersangka");
  await ke(a, { x:20.0, y:13.6 });
  await a.ketuk("#aksi", { tunggu:1600 });
  const bukti = page.locator(".bukti-baris .bukti"), ts = page.locator(".tersangka .ts");
  await a.ketuk(bukti.nth(0), { tunggu:500 }); await a.ketuk(ts.nth(0), { tunggu:1400 });
  await a.ketuk(bukti.nth(1), { tunggu:500 }); await a.ketuk(ts.nth(1), { tunggu:1400 });

  a.bagian("pelakunya-kamu");
  await a.ketuk(bukti.nth(2), { tunggu:500 }); await a.ketuk(ts.nth(2), { tunggu:3200 });

  a.bagian("surat");
  await a.ketukTeks("Baca pernyataannya", { tunggu:1500 });
  const kartu = page.locator("#kartu");
  for (let i = 0; i < 6; i++){ await kartu.evaluate(k => k.scrollBy({ top:140, behavior:"smooth" })); await jeda(1100); }

  a.bagian("stempel-penutup");
  await a.ketuk(page.locator(".stempel button").nth(0), { tunggu:1200 });
  await kartu.evaluate(k => k.scrollTo({ top:k.scrollHeight, behavior:"smooth" }));
  await jeda(2500);
}
