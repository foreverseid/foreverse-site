/* Perekam konten 9:16 — memainkan demo tema ASLI (data Amira & Adriel)
   dengan sentuhan sungguhan, lalu menyimpan:
     rekaman/<tema>.mp4          satu video utuh 1080×1920
     rekaman/<tema>-<bagian>.mp4 potongan per bagian, siap disusun di CapCut
     rekaman/<tema>.json         daftar bagian + detik mulai/selesai
   Pakai:  node rekam/rekam.mjs kasus-pengirim   (atau: semua)
   Isi layar tidak pernah diubah — skrip hanya menyentuh, seperti jari. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, rename, writeFile, readdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, resolve } from "node:path";

const AKAR = resolve(new URL("..", import.meta.url).pathname);
const KELUAR = join(AKAR, "rekaman");
const LEBAR = 540, TINGGI = 960;              // CSS px; video diskalakan ke 1080×1920
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
export function alat(page, t0, bagian){
  const jeda = ms => page.waitForTimeout(ms);
  return {
    page, jeda,
    /* tandai awal bagian untuk dipotong nanti */
    bagian(nama){ const d = (Date.now() - t0) / 1000; if (bagian.length) bagian.at(-1).selesai = d; bagian.push({ nama, mulai:d }); },
    /* ketuk elemen yang terlihat, dengan kursor bergerak dulu seperti jari */
    async ketuk(sel, { tunggu = 700 } = {}){
      const el = typeof sel === "string" ? page.locator(sel).first() : sel;
      await el.waitFor({ state:"visible", timeout:15000 });
      await el.scrollIntoViewIfNeeded();
      const b = await el.boundingBox();
      await page.mouse.move(b.x + b.width/2, b.y + b.height/2, { steps:8 });
      await page.mouse.down(); await jeda(70); await page.mouse.up();
      await jeda(tunggu);
    },
    async ketukTeks(teks, opsi){ return this.ketuk(page.getByRole("button", { name:teks }).filter({ visible:true }).first(), opsi); },
    async seret(x1, y1, x2, y2, { langkah = 25, tahan = 0 } = {}){
      await page.mouse.move(x1, y1); await page.mouse.down();
      if (tahan) await jeda(tahan);
      await page.mouse.move(x2, y2, { steps:langkah }); await page.mouse.up();
    },
  };
}

async function rekam(tema){
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
  await mkdir(sementara, { recursive:true });
  const cdp = await ctx.newCDPSession(page), frame = [];
  cdp.on("Page.screencastFrame", async f => {
    const n = join(sementara, String(frame.length).padStart(6, "0") + ".jpg");
    frame.push({ n, t:f.metadata.timestamp });
    writeFile(n, Buffer.from(f.data, "base64"));
    cdp.send("Page.screencastFrameAck", { sessionId:f.sessionId }).catch(() => {});
  });
  const galat = [];
  page.on("pageerror", e => galat.push(e.message));
  await page.goto(`http://localhost:${srv.address().port}/${modul.berkas}`, { waitUntil:"networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await cdp.send("Page.startScreencast", { format:"jpeg", quality:92, maxWidth:LEBAR*2, maxHeight:TINGGI*2, everyNthFrame:1 });
  await page.waitForTimeout(300);
  const t0 = Date.now(), bagian = [];
  await modul.main(alat(page, t0, bagian));
  await page.waitForTimeout(1500);
  bagian.at(-1).selesai = (Date.now() - t0) / 1000;
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
const minta = process.argv[2];
const daftar = minta === "semua"
  ? (await readdir(join(AKAR, "rekam/tema"))).map(f => f.replace(".mjs",""))
  : [minta];
if (!minta) { console.log("pakai: node rekam/rekam.mjs <tema>|semua"); process.exit(1); }
for (const t of daftar) await rekam(t);
