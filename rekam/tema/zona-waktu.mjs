/* Dua Jendela (LDR) — panggilan masuk, tebak kegiatannya jam segini,
   pesan masuk, samakan jadwal dua ronde, paket tiga lapis, satu ruangan. */
export const berkas = "zona-waktu-demo.html";
const menit = s => { const [h, m] = s.split(/[.:]/).map(Number); return h*60 + m; };

export async function main(a){
  const { page, jeda } = a;
  const tbl = t => page.locator("#kartu button").filter({ hasText:t }).filter({ visible:true }).first();
  a.bagian("panggilan");
  await jeda(1500);
  await a.baca("#kartu");
  await a.ketuk(tbl("Angkat"), { tunggu:1200 });

  a.bagian("jam-segini");
  await a.ketuk("#pikirA", { tunggu:700 });
  await a.baca("#kartu");
  const pilihan = page.locator("#kartu .pilih button");
  for (let i = 0; i < await pilihan.count(); i++){
    await a.ketuk(pilihan.nth(i), { tunggu:500 });
    if (await page.locator("#kartu .pilih button.benar").count()) break;
  }
  await a.ketuk(tbl("Lanjut"), { tunggu:800 });

  a.bagian("pesan-masuk");
  await a.ketuk("#ponselB", { tunggu:500 });
  const mulai = Date.now();
  await tbl("lanjut dulu").waitFor({ timeout:30000 });
  await a.bacaSisa("#kartu .hp", mulai);
  await a.ketuk(tbl("lanjut dulu"), { tunggu:800 });

  a.bagian("samakan-jadwal");
  await a.ketuk("#jamBendaB", { tunggu:700 });
  let d = null;
  for (let ronde = 0; ronde < 2; ronde++){
    await a.baca("#kartu p");
    if (d === null){
      await a.ketuk(tbl("Cocokkan"), { tunggu:400 });
      const t = await page.locator("#toast").innerText(), j = t.match(/(\d{2}[.:]\d{2})/g) || [];
      d = j.length >= 2 ? ((menit(j[0]) - menit(j[1]) + 1440 + 720) % 1440) - 720 : 0;
      await jeda(1200);
    }
    const n = Math.round(Math.abs(d) / 60);
    for (let i = 0; i < n; i++) await a.ketuk(tbl(d > 0 ? "+1 jam" : "−1 jam"), { tunggu:300 });
    await a.ketuk(tbl("Cocokkan"), { tunggu:1400 });
  }

  a.bagian("paket");
  await a.ketuk("#mejaPaketA", { tunggu:1900 });
  for (let i = 0; i < 3; i++){ await a.ketuk("#kartu .kertasKado", { tunggu:500 }); await a.baca(page.locator("#kartu .lapis").last()); }
  await a.ketuk(tbl("Simpan semuanya"), { tunggu:3000 });

  a.bagian("satu-ruangan");
  await a.baca("#kartu");
}
