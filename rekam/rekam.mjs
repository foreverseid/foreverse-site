/* Perekam konten 9:16 — memainkan demo tema ASLI (data Amira & Adriel)
   dengan sentuhan sungguhan, lalu menyimpan:
     rekaman/<tema>.mp4          satu video utuh 1080×1920
     rekaman/<tema>-<bagian>.mp4 potongan per bagian, siap disusun di CapCut
     rekaman/<tema>.json         daftar bagian + detik mulai/selesai
   Pakai:  node rekam/rekam.mjs kasus-pengirim   (atau: semua)
   Ukur waktu main tanpa merekam:  node rekam/rekam.mjs ukur <tema>|semua
     Semua skrip memakai tempo yang sama: jeda reaksi tetap sesudah tiap aksi
     dan waktu baca BACA huruf per detik untuk teks yang harus dibaca, jadi
     durasi antar tema bisa dibandingkan dengan adil.
   Isi layar tidak pernah diubah — skrip hanya menyentuh, seperti jari. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, rename, writeFile, readdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, resolve } from "node:path";

const AKAR = resolve(new URL("..", import.meta.url).pathname);
const KELUAR = join(AKAR, "rekaman");
const [LEBAR, TINGGI] = (process.env.LAYAR || "540x960").split("x").map(Number);              // CSS px; video diskalakan ke 1080×1920
const JENIS = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png",
  ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".mp3":"audio/mpeg", ".json":"application/json", ".ico":"image/x-icon" };

function server(){
  return new Promise(ok => {
    const s = createServer(async (q, r) => {
      try {
        const p = join(AKAR, decodeURIComponent(new URL(q.url, "http://x").pathname));
        if (!p.startsWith(AKAR)) throw 0;
        r.writeHead(200, { "content-type": JENIS[extname(p)] || "application/octet-stream" });
        r.end(await readFile(p));
      } catch { r.writeHead(404); r.end(); }
    }).listen(0, () => ok(s));
  });
}

/* alat bantu yang dipakai skrip tiap tema */
export const BACA = 15;
/* gulir halaman sampai elemen di tengah layar (tanpa menunggu animasinya diam) */
async function gulirKe(el){
  const di = await el.evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
  if (!di){
    await el.evaluate(e => e.scrollIntoView({ block:"center" }));
    let lama = null;                                  // tunggu guliran halus berhenti
    for (let i = 0; i < 40; i++){ await el.page().waitForTimeout(80); const y = await el.evaluate(e => Math.round(e.getBoundingClientRect().top)); if (y === lama) break; lama = y; }
  }
}                          // huruf per detik, kecepatan baca santai
/* JEPRET=1 → tangkapan layar di akhir tiap bagian (rekaman/jepret/), untuk memeriksa tampilan */
function jepret(page, stat, n, nama){
  if (!process.env.JEPRET || !stat.tema) return;
  page.screenshot({ path: join(KELUAR, "jepret", `${stat.tema}-${process.env.LAYAR || "hp"}-${String(n).padStart(2,"0")}-${nama}.png`) }).catch(() => {});
}
export function alat(page, t0, bagian, stat = { aksi:0, huruf:0 }){
  const jeda = ms => page.waitForTimeout(ms);
  return {
    page, jeda, stat,
    /* waktu baca untuk teks yang memang harus dibaca penerima */
    async baca(sel){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await el.waitFor({ state:"visible", timeout:15000 });
      const n = (await el.innerText()).replace(/\s+/g, " ").trim().length;
      stat.huruf += n; await jeda(Math.max(1200, n / BACA * 1000));
    },
    /* tombol "Lanjut" bersama di tema-tema adegan */
    async lanjut(sel = "#lanjut.tampil", tunggu = 1200){ await this.ketuk(sel, { tunggu }); },
    /* tekan-tahan di tengah elemen */
    async tahan(sel, ms, { tunggu = 600 } = {}){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await el.waitFor({ state:"visible", timeout:15000 }); await gulirKe(el);
      const b = await el.boundingBox(); stat.aksi++;
      await page.mouse.move(b.x + b.width/2, b.y + b.height/2, { steps:6 }); await page.mouse.down(); await jeda(ms); await page.mouse.up(); await jeda(tunggu);
    },
    /* untuk teks yang dimunculkan tema sendiri pelan-pelan: tunggu sisa waktu bacanya saja */
    async bacaSisa(sel, sejak){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      const n = (await el.innerText()).replace(/\s+/g, " ").trim().length;
      stat.huruf += n; await jeda(Math.max(0, n / BACA * 1000 - (Date.now() - sejak)));
    },
    /* gosok (zig-zag) di atas sebuah area sampai lapisannya terbuka */
    async gosok(sel, { baris = 5 } = {}){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await gulirKe(el); const b = await el.boundingBox(); stat.aksi++;
      await page.mouse.move(b.x + 6, b.y + 6); await page.mouse.down();
      for (let i = 0; i <= baris; i++){ const y = b.y + 6 + (b.height - 12) * i / baris;
        await page.mouse.move(i % 2 ? b.x + 6 : b.x + b.width - 6, y, { steps:10 }); }
      await page.mouse.up(); await jeda(700);
    },
    /* game kartu memori: buka berpasangan seperti orang yang ingatannya bagus
       (tiap kartu dibuka sekali untuk dikenali, pasangan yang sudah dikenal langsung dicocokkan) */
    async memori(kartuSel, kunci, { jedaSalah = 1000 } = {}){
      const k = await page.locator(kartuSel).evaluateAll((x, a) => x.map(e => e.getAttribute(a)), kunci);
      const lihat = {}, cocok = new Set(), dilihat = new Set();
      const buka = async i => { await this.ketuk(page.locator(kartuSel).nth(i), { tunggu:450 }); dilihat.add(i); (lihat[k[i]] = lihat[k[i]] || new Set()).add(i); };
      const belum = () => k.findIndex((_, i) => !dilihat.has(i) && !cocok.has(i));
      const pas = (i, j) => { cocok.add(i); cocok.add(j); lihat[k[i]].delete(i); lihat[k[j]].delete(j); };
      while (cocok.size < k.length){
        const kenal = Object.keys(lihat).find(x => lihat[x].size === 2);
        if (kenal){ const [i, j] = [...lihat[kenal]]; await buka(i); await buka(j); pas(i, j); await jeda(500); continue; }
        const i = belum(); await buka(i);
        const kawan = [...lihat[k[i]]].find(x => x !== i);
        if (kawan !== undefined){ await buka(kawan); pas(i, kawan); await jeda(500); continue; }
        const j = belum(); await buka(j);
        if (k[j] === k[i]){ pas(i, j); await jeda(500); } else await jeda(jedaSalah);
      }
    },
    /* game tangkap di kanvas: geser keranjang ke benda baik terendah, hindari yang buruk */
    async tangkap(kanvasSel, baik, { selesai, batas = 90000 } = {}){
      await page.evaluate(() => {
        if (window.__ft) return; window.__ft = [];
        const asli = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function(s, x, y){ window.__ft.push([String(s), x, y, this.canvas]); if (window.__ft.length > 400) window.__ft.splice(0, 200); return asli.apply(this, arguments); };
      });
      const cv = page.locator(kanvasSel).first(), b = await cv.boundingBox(); stat.aksi++;
      await page.mouse.move(b.x + b.width/2, b.y + b.height - 20); await page.mouse.down();
      const t = Date.now();
      while (Date.now() - t < batas){
        if (await selesai()) break;
        const x = await page.evaluate(({ baik, H }) => {
          const f = window.__ft.slice(-60).filter(a => baik.includes(a[0]) && a[2] < H - 10);
          if (!f.length) return null; f.sort((p, q) => q[2] - p[2]); return f[0][1];
        }, { baik, H: b.height });
        if (x != null) await page.mouse.move(b.x + x, b.y + b.height - 20, { steps:3 });
        await jeda(60);
      }
      await page.mouse.up(); await jeda(600);
    },
    /* tema dunia-jelajah: jalan ke (x,y) dengan joystick, rute dicari di peta petak
       (padat(c,r) = petak yang tidak bisa diinjak), posisi dibaca dari window.__fv() */
    async jalan(tujuan, padat, { joy = "#joy", dekat = 0.18 } = {}){
      const fv = () => page.evaluate(() => window.__fv());
      const p0 = await fv();
      const s = [Math.floor(p0.x), Math.floor(p0.y)], g = [Math.floor(tujuan.x), Math.floor(tujuan.y)];
      const asal = new Map([[s.join(), null]]), q = [s];
      while (q.length){ const [c, r] = q.shift(); if (c === g[0] && r === g[1]) break;
        for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n = [c+dc, r+dr]; if (!padat(...n) && !asal.has(n.join())){ asal.set(n.join(), [c, r]); q.push(n); } } }
      if (!asal.has(g.join())) throw new Error("tidak ada jalan ke " + JSON.stringify(tujuan));
      const rute = []; let k = g; while (k){ rute.unshift({ x:k[0]+.5, y:k[1]+.5 }); k = asal.get(k.join()); }
      rute[rute.length-1] = tujuan; rute.shift();
      const j = await page.locator(joy).boundingBox(), cx = j.x + j.width/2, cy = j.y + j.height/2, R = j.width * .42;
      stat.aksi++;
      await page.mouse.move(cx, cy, { steps:4 }); await page.mouse.down();
      for (const ti of rute){
        for (let i = 0; i < 250; i++){
          const p = await fv(), dx = ti.x - p.x, dy = ti.y - p.y, d = Math.hypot(dx, dy);
          if (d < dekat) break;
          await page.mouse.move(cx + dx/d*R, cy + dy/d*R); await jeda(30);
        }
      }
      await page.mouse.move(cx, cy, { steps:3 }); await page.mouse.up(); await jeda(350);
    },
    /* seret sebuah elemen sejauh dx,dy atau ke tengah elemen lain */
    async seretEl(sel, ke, { langkah = 22, tunggu = 700 } = {}){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await el.waitFor({ state:"visible", timeout:15000 }); await gulirKe(el);
      const b = await el.boundingBox(), x = b.x + b.width/2, y = b.y + b.height/2;
      let tx, ty;
      if (ke && typeof ke === "object" && "dx" in ke){ tx = x + ke.dx; ty = y + (ke.dy || 0); }
      else { const t = typeof ke === "string" ? page.locator(ke).first() : ke; const c = await t.boundingBox(); tx = c.x + c.width/2; ty = c.y + c.height/2; }
      stat.aksi++;
      await page.mouse.move(x, y, { steps:6 }); await page.mouse.down();
      await page.mouse.move(tx, ty, { steps:langkah }); await page.mouse.up();
      await jeda(tunggu);
    },
    /* tandai awal bagian untuk dipotong nanti */
    bagian(nama){ const d = (Date.now() - t0) / 1000; if (bagian.length){ bagian.at(-1).selesai = d; jepret(page, stat, bagian.length, bagian.at(-1).nama); } bagian.push({ nama, mulai:d }); if (process.env.JEPRET){ const n = bagian.length; setTimeout(() => jepret(page, stat, n, nama + "-awal"), 1800); } },
    /* ketuk elemen yang terlihat, dengan kursor bergerak dulu seperti jari */
    async ketuk(sel, { tunggu = 700 } = {}){
      if (process.env.JEPRET && typeof sel === "string" && sel.startsWith("#lanjut")){ await page.locator(sel).first().waitFor({ timeout:30000 }).catch(() => {}); await jeda(400); jepret(page, stat, bagian.length, (bagian.at(-1) || {}).nama + "-akhir"); }
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await el.waitFor({ state:"visible", timeout:15000 });
      await gulirKe(el);
      const b = await el.boundingBox(); stat.aksi++;
      await page.mouse.move(b.x + b.width/2, b.y + b.height/2, { steps:8 });
      await page.mouse.down(); await jeda(70); await page.mouse.up();
      await jeda(tunggu);
    },
    async ketukTeks(teks, opsi){ return this.ketuk(page.getByRole("button", { name:teks }).filter({ visible:true }).first(), opsi); },
    async seret(x1, y1, x2, y2, { langkah = 25, tahan = 0 } = {}){
      stat.aksi++;
      await page.mouse.move(x1, y1); await page.mouse.down();
      if (tahan) await jeda(tahan);
      await page.mouse.move(x2, y2, { steps:langkah }); await page.mouse.up();
    },
  };
}

async function rekam(tema, ukur = false){
  const modul = await import("./tema/" + tema + ".mjs");
  const srv = await server();
  const sementara = join(KELUAR, ".mentah-" + tema);
  await rm(sementara, { recursive:true, force:true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport:{ width:LEBAR, height:TINGGI }, deviceScaleFactor:2, hasTouch:false, isMobile:false,
    locale:"id-ID", timezoneId:"Asia/Jakarta",
  });
  const page = await ctx.newPage();
  /* screencast CDP: frame tajam di resolusi perangkat (2×), dengan cap waktu asli */
  if (!ukur) await mkdir(sementara, { recursive:true });
  const cdp = await ctx.newCDPSession(page), frame = [];
  if (!ukur) cdp.on("Page.screencastFrame", async f => {
    const n = join(sementara, String(frame.length).padStart(6, "0") + ".jpg");
    frame.push({ n, t:f.metadata.timestamp });
    writeFile(n, Buffer.from(f.data, "base64"));
    cdp.send("Page.screencastFrameAck", { sessionId:f.sessionId }).catch(() => {});
  });
  const galat = [];
  page.on("pageerror", e => galat.push(e.message));
  await page.goto(`http://localhost:${srv.address().port}/${modul.berkas}`, { waitUntil:"networkidle" });
  await page.evaluate(() => document.fonts.ready);
  if (!ukur) await cdp.send("Page.startScreencast", { format:"jpeg", quality:92, maxWidth:LEBAR*2, maxHeight:TINGGI*2, everyNthFrame:1 });
  await page.waitForTimeout(300);
  const t0 = Date.now(), bagian = [], stat = { aksi:0, huruf:0, tema };
  if (process.env.JEPRET) await mkdir(join(KELUAR, "jepret"), { recursive:true });
  try { await modul.main(alat(page, t0, bagian, stat)); }
  catch (e) {
    if (ukur){ await page.screenshot({ path: join(KELUAR, "gagal-" + tema + ".png") }).catch(() => {});
      const ptj = await page.locator("#petunjuk, .petunjuk").first().innerText().catch(() => "");
      e.message += " · petunjuk terakhir: " + ptj.replace(/\s+/g, " ").slice(0, 120);
      await ctx.close().catch(() => {}); await browser.close().catch(() => {}); srv.close(); }
    throw e;
  }
  await page.waitForTimeout(1500);
  bagian.at(-1).selesai = (Date.now() - t0) / 1000;
  if (process.env.JEPRET) await page.screenshot({ path: join(KELUAR, "jepret", `${tema}-${process.env.LAYAR || "hp"}-${String(bagian.length).padStart(2,"0")}-${bagian.at(-1).nama}.png`) });
  if (ukur){
    await ctx.close(); await browser.close(); srv.close();
    if (galat.length) throw new Error("galat di halaman: " + galat.join(" | "));
    return { tema, detik: Math.round(bagian.at(-1).selesai), bagian: bagian.length, aksi: stat.aksi, huruf: stat.huruf };
  }
  await cdp.send("Page.stopScreencast");
  await page.waitForTimeout(500);
  await ctx.close(); await browser.close(); srv.close();
  if (galat.length) throw new Error("galat di halaman: " + galat.join(" | "));

  /* frame screencast hanya dikirim saat layar berubah → susun dengan durasi asli tiap frame */
  const awal = t0 / 1000, akhir = awal + bagian.at(-1).selesai;
  const daftar = frame.filter((f, i) => i === frame.length - 1 || frame[i+1].t > awal);
  let teks = "";
  daftar.forEach((f, i) => {
    const mulai = Math.max(f.t, awal), berikut = i < daftar.length - 1 ? daftar[i+1].t : akhir;
    teks += `file '${f.n}'\nduration ${Math.max(0.001, berikut - mulai).toFixed(4)}\n`;
  });
  teks += `file '${daftar.at(-1).n}'\n`;
  await writeFile(join(sementara, "daftar.txt"), teks);
  const utuh = join(KELUAR, tema + ".mp4");
  const kode = ["-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-r","30","-an"];
  execFileSync("ffmpeg", ["-y","-v","error","-f","concat","-safe","0","-i",join(sementara,"daftar.txt"),
    "-vf","scale=1080:1920:flags=lanczos", ...kode, utuh]);
  for (const [i, b] of bagian.entries()){
    const nama = `${tema}-${String(i+1).padStart(2,"0")}-${b.nama}.mp4`;
    execFileSync("ffmpeg", ["-y","-v","error","-ss",String(b.mulai),"-to",String(b.selesai),"-i",utuh, ...kode, join(KELUAR, nama)]);
    b.berkas = nama;
  }
  await writeFile(join(KELUAR, tema + ".json"), JSON.stringify({ tema, bagian }, null, 2));
  await rm(sementara, { recursive:true, force:true });
  console.log(`✓ ${tema}: ${bagian.length} bagian, ${bagian.at(-1).selesai.toFixed(1)} detik`);
}

await mkdir(KELUAR, { recursive:true });
const ukur = process.argv[2] === "ukur";
const minta = process.argv[ukur ? 3 : 2];
const daftar = minta === "semua"
  ? (await readdir(join(AKAR, "rekam/tema"))).map(f => f.replace(".mjs","")).sort()
  : [minta];
if (!minta) { console.log("pakai: node rekam/rekam.mjs [ukur] <tema>|semua"); process.exit(1); }
if (ukur){
  const hasil = [];
  for (const t of daftar){
    try { const h = await rekam(t, true); hasil.push(h); console.log(`✓ ${t}: ${Math.floor(h.detik/60)}m${String(h.detik%60).padStart(2,"0")}s · ${h.bagian} bagian · ${h.aksi} aksi · ${h.huruf} huruf dibaca`); }
    catch (e) { console.log(`✗ ${t}: ${e.message.split("\n")[0]}`); console.log((e.stack || "").split("\n").find(l => l.includes("rekam/tema")) || ""); }
  }
  await writeFile(join(KELUAR, "ukur.json"), JSON.stringify(hasil, null, 2));
} else for (const t of daftar) await rekam(t);
