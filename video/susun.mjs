/* Penyusun video konten Foreverse — satu gaya untuk semua konten.
   Isi layar produk selalu rekaman tema asli dari rekam/rekam.mjs; panggung.html hanya
   menambah kemasan (judul, subjudul, bingkai HP, penutup merek).
   Pakai:
     node rekam/rekam.mjs <tema>                       (sekali, kalau rekamannya belum ada)
     node video/susun.mjs video/konten/<id>.json       → rekaman/video/<id>.mp4 + <id>-sampul.jpg
     SAMPEL=1 node video/susun.mjs …                   → hanya lembar frame untuk diperiksa
     SUARA_SAJA=1 node video/susun.mjs …               → gambar tetap, hanya suara dicampur ulang
   Narasi: berkas rekaman/video/<id>/baris-NN.wav (dibuat video/suara.py), musik: video/musik.py. */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, rm, readdir, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { extname, join, resolve } from "node:path";

const AKAR = resolve(new URL("..", import.meta.url).pathname);
const FPS = 30;
const K = JSON.parse(await readFile(process.argv[2], "utf8"));
const KERJA = join(AKAR, "rekaman/video", K.id);
const SUMBER = join(AKAR, "rekaman", K.tema + ".mp4");
const ff = (...a) => execFileSync("ffmpeg", ["-y", "-v", "error", ...a]);
const durasi = f => +execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0", f]).toString();
const ENC = ["-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-r",String(FPS)];

if (!existsSync(SUMBER)) throw new Error(`rekaman belum ada: jalankan node rekam/rekam.mjs ${K.tema}`);
await mkdir(KERJA, { recursive:true });

/* 1. durasi tiap adegan: ikut narasi (+jeda), minimal K.adegan[i].durasi */
let mulai = 0;
for (const [i, A] of K.adegan.entries()){
  const wav = join(KERJA, `baris-${String(i+1).padStart(2,"0")}.wav`);
  A.wav = existsSync(wav) ? wav : null;
  A.lamaSuara = A.wav ? durasi(A.wav) / (K.tempoSuara || 1) : 0;
  A.mulaiSuara = A.suaraMulai ?? K.suaraMulai ?? .2;
  /* penutup: selesai 0,6 detik setelah tagline (standar: ≤0,8) */
  A.d = Math.max(A.durasi || 0, A.lamaSuara + (A.penutup ? .6 : (A.sisa ?? K.sisa ?? .7)) + A.mulaiSuara);
  A.t0 = mulai; mulai += A.d;
}
const TOTAL = mulai;
console.log(`durasi ${TOTAL.toFixed(1)} detik · ${K.adegan.length} adegan`);
if (TOTAL < 25 || TOTAL > 35) console.log("⚠ di luar standar 25–35 detik");

/* 2. potong frame rekaman tiap adegan (laju >1 = dipercepat, isi layar tetap asli) */
for (const [i, A] of K.adegan.entries()){
  A.dir = join(KERJA, "f" + i);
  if (!A.rekaman) continue;
  await rm(A.dir, { recursive:true, force:true }); await mkdir(A.dir);
  const r = A.rekaman, laju = r.laju || 1;
  ff("-ss", String(r.dari), "-t", String(A.d * laju + .2), "-i", SUMBER,
     "-vf", `setpts=PTS/${laju},fps=${FPS},scale=720:-2`, "-q:v", "3", join(A.dir, "%05d.jpg"));
  A.frame = (await readdir(A.dir)).sort();
}

/* 3. gambar tiap frame di panggung, kirim langsung ke ffmpeg (satu berkas per adegan) */
const srv = await new Promise(ok => { const s = createServer(async (q, r) => {
  try { const p = join(AKAR, decodeURIComponent(new URL(q.url, "http://x").pathname)); if (!p.startsWith(AKAR)) throw 0;
    r.writeHead(200, { "content-type": { ".html":"text/html", ".png":"image/png", ".jpg":"image/jpeg" }[extname(p)] || "application/octet-stream" });
    r.end(await readFile(p)); } catch { r.writeHead(404); r.end(); } }).listen(0, () => ok(s)); });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{ width:1080, height:1920 }, deviceScaleFactor:1 });
await page.goto(`http://localhost:${srv.address().port}/video/panggung.html`, { waitUntil:"networkidle" });
await page.evaluate(k => window.siapkan(k), K);
const url = f => "/" + f.slice(AKAR.length + 1);
let terakhir = null;
const srcPada = (A, f) => { if (!A.frame) return terakhir; terakhir = url(join(A.dir, A.frame[Math.min(f, A.frame.length - 1)])); return terakhir; };

if (process.env.SAMPEL){
  /* lembar periksa: awal, tengah, akhir tiap adegan */
  const keping = [];
  for (const [i, A] of K.adegan.entries()) for (const p of [.02, .5, .97]){
    const t = A.d * p; await page.evaluate(([i, t, s]) => window.gambar(i, t, s), [i, t, srcPada(A, Math.floor(t * FPS))]);
    const n = join(KERJA, `sampel-${i}-${p}.jpg`); await page.screenshot({ path:n, type:"jpeg", quality:85 }); keping.push(n);
  }
  const kolom = 6, baris = Math.ceil(keping.length / kolom);
  ff(...keping.flatMap(k => ["-i", k]), "-filter_complex",
     keping.map((_, j) => `[${j}]scale=360:640[s${j}]`).join(";") + ";" + keping.map((_, j) => `[s${j}]`).join("") +
     `xstack=inputs=${keping.length}:layout=` + keping.map((_, j) => `${(j % kolom) * 360}_${Math.floor(j / kolom) * 640}`).join("|") + `:fill=white`,
     "-frames:v", "1", join(KERJA, "lembar.jpg"));
  console.log("✓ lembar periksa:", join(KERJA, "lembar.jpg"), `(${baris} baris)`);
  await browser.close(); srv.close(); process.exit(0);
}

const bagian = [];
if (!process.env.SUARA_SAJA) for (const [i, A] of K.adegan.entries()){
  const keluar = join(KERJA, `a${i}.mp4`), sementara = join(KERJA, `a${i}.tmp.mp4`);
  const p = spawn("ffmpeg", ["-y","-v","error","-f","image2pipe","-framerate",String(FPS),"-c:v","mjpeg","-i","-", ...ENC, sementara], { stdio:["pipe","inherit","inherit"] });
  const n = Math.round(A.d * FPS);
  for (let f = 0; f < n; f++){
    await page.evaluate(([i, t, s]) => window.gambar(i, t, s), [i, f / FPS, srcPada(A, f)]);
    const buf = await page.screenshot({ type:"jpeg", quality:92 });
    if (!p.stdin.write(buf)) await new Promise(ok => p.stdin.once("drain", ok));
    if (i === 0 && f === 0) await writeFile(join(AKAR, "rekaman/video", K.id + "-sampul.jpg"), buf);
  }
  p.stdin.end(); await new Promise((ok, no) => p.on("close", c => c ? no(new Error("ffmpeg " + c)) : ok()));
  await rename(sementara, keluar); bagian.push(keluar);
  console.log(`  adegan ${i+1}: ${A.d.toFixed(2)} s`);
}
await browser.close(); srv.close();
if (!process.env.SUARA_SAJA) await writeFile(join(KERJA, "daftar.txt"), bagian.map(b => `file '${b}'`).join("\n"));
const bisu = join(KERJA, "bisu.mp4");
if (!process.env.SUARA_SAJA) ff("-f","concat","-safe","0","-i",join(KERJA,"daftar.txt"),"-c","copy",bisu);

/* 4. suara: musik (diredam saat narasi) + narasi + efek pindah adegan */
const musik = join(KERJA, "musik.wav");
execFileSync("python3", [join(AKAR, "video/musik.py"), String(TOTAL + .5), musik, String(K.bpm || 84)]);
const masuk = ["-i", musik], saring = [], suara = [];
let n = 2;                                   /* [0] video, [1] musik, [2…] narasi */
for (const A of K.adegan){
  if (!A.wav) continue;
  const ms = Math.round((A.t0 + A.mulaiSuara) * 1000);
  masuk.push("-i", A.wav);
  saring.push(`[${n}]aresample=44100,atempo=${K.tempoSuara || 1},highpass=f=80,acompressor=threshold=0.1:ratio=3,volume=1.6,adelay=${ms}|${ms},apad[v${n}]`);
  suara.push(`[v${n}]`); n++;
}
for (const [i, A] of K.adegan.entries()) if (i > 0){
  const ms = Math.max(0, Math.round((A.t0 - .12) * 1000));
  saring.push(`anoisesrc=d=0.35:c=pink:a=0.35,highpass=f=900,lowpass=f=5000,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.23,aresample=44100,adelay=${ms}|${ms},apad[w${i}]`);
  suara.push(`[w${i}]`);
}
saring.push(`${suara.filter(s => s.startsWith("[v")).join("")}amix=inputs=${suara.filter(s => s.startsWith("[v")).length}:normalize=0[narasi]`,
  `[narasi]asplit=2[nar1][nar2]`,
  `[1]volume=0.42[m]`, `[m][nar1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[md]`,
  `[md][nar2]${suara.filter(s => s.startsWith("[w")).join("")}amix=inputs=${2 + suara.filter(s => s.startsWith("[w")).length}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=44100,atrim=0:${TOTAL.toFixed(3)}[a]`);
const hasil = join(AKAR, "rekaman/video", K.id + ".mp4"), tmp = hasil.replace(".mp4", ".tmp.mp4");
ff("-i", bisu, ...masuk, "-filter_complex", saring.join(";"), "-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","192k","-ar","44100","-shortest", tmp);
await rename(tmp, hasil);
console.log(`✓ ${hasil} (${durasi(hasil).toFixed(1)} s)`);
