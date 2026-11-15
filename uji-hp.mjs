/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · uji HP (peramban sungguhan, sentuhan sungguhan)

   Melengkapi uji.mjs: yang diuji di sini hanya bisa dibuktikan di
   peramban, yaitu seretan, zoom, suara, tata letak HP, dan alur formulir.
   Butuh Playwright (tidak ikut di-commit):  npm i playwright
   Jalankan:  node uji-hp.mjs
   Simulator (sim.mjs) dinyalakan dan dimatikan sendiri.

   Yang TIDAK bisa dibuktikan di sini: iPhone sungguhan (Safari/Chrome iOS).
   Aturan suara iPhone ditiru (play() ditolak sampai ada ketukan), dan
   gangguan seretan ditiru (akhir seretan dijatuhkan ke elemen lain).
   ══════════════════════════════════════════════════════════════════ */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const jalurPw = ["playwright", "/opt/npm-tools/node_modules/playwright/index.mjs"];
let chromium = null;
for (const j of jalurPw) { try { ({ chromium } = await import(j)); break; } catch (_) {} }
if (!chromium) { console.error("Playwright belum terpasang. Jalankan: npm i playwright"); process.exit(2); }

const AKAR = new URL(".", import.meta.url).pathname, ASAL = "http://localhost:8787";
const sim = spawn(process.execPath, ["sim.mjs"], { cwd: AKAR, stdio: "ignore" });
process.on("exit", () => sim.kill());
for (let i = 0; i < 40; i++) { try { if ((await fetch(ASAL + "/api/info")).ok) break; } catch (_) {} await new Promise(r => setTimeout(r, 150)); }

const b = await chromium.launch({ args: ["--autoplay-policy=document-user-activation-required"] });
let lulus = 0; const gagal = [];
const cek = (nama, ok, info) => { console.log((ok ? "  ✓ " : "  ✗ ") + nama + (ok || !info ? "" : "  → " + info)); ok ? lulus++ : gagal.push(nama); };
const judul = t => console.log("\n" + t);

/* WAV 2 detik sebagai "lagu unggahan" */
function wav() { const sr = 8000, n = sr * 2, f = Buffer.alloc(44 + n); f.write("RIFF", 0); f.writeUInt32LE(36 + n, 4); f.write("WAVEfmt ", 8); f.writeUInt32LE(16, 16); f.writeUInt16LE(1, 20); f.writeUInt16LE(1, 22); f.writeUInt32LE(sr, 24); f.writeUInt32LE(sr, 28); f.writeUInt16LE(1, 32); f.writeUInt16LE(8, 34); f.write("data", 36); f.writeUInt32LE(n, 40); for (let i = 0; i < n; i++) f[44 + i] = 128 + Math.round(20 * Math.sin(i / 6)); return f; }

async function hp(opsi = {}) {
  const ctx = await b.newContext({ viewport: { width: opsi.w || 390, height: opsi.h || 700 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: opsi.diam ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.on("pageerror", e => { console.log("    galat halaman:", e.message); gagal.push("galat JS: " + e.message.slice(0, 60)); });
  await p.addInitScript(tiruIphone => {
    window.__ctx = []; window.__audio = []; window.__nada = 0;
    const C = window.AudioContext; window.AudioContext = function (o) { const c = o === undefined ? new C() : new C(o); window.__ctx.push(c); return c; }; window.AudioContext.prototype = C.prototype;
    const osc = C.prototype.createOscillator; C.prototype.createOscillator = function () { window.__nada++; return osc.apply(this, arguments); };
    const A = window.Audio; window.Audio = function (s) { const a = s === undefined ? new A() : new A(s); window.__audio.push(a); return a; }; window.Audio.prototype = A.prototype;
    if (tiruIphone) { /* iPhone: play() baru diizinkan setelah ada KETUKAN, seretan tidak dihitung */
      window.__izin = false; window.addEventListener("click", () => { window.__izin = true; }, true);
      const main = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { return window.__izin ? main.apply(this, arguments) : Promise.reject(new DOMException("belum ada ketukan", "NotAllowedError")); };
    }
  }, !!opsi.tiruIphone);
  await p.route("**/uji-lagu.wav", r => r.fulfill({ status: 200, contentType: "audio/wav", body: wav() }));
  if (opsi.bait) await p.route("**/bait-demo.html*", async r => {
    const res = await r.fetch(); let t = await res.text();
    t = t.replace("var MASUK={}, kini=-1;", "var MASUK={}, kini=-1; window.__ke=function(n){ke(n)};");
    if (opsi.lagu) t = t.replace(/"lagu":\s*\{[^}]*\}/, '"lagu": {"src": "/uji-lagu.wav", "mulai": 0, "selesai": 0}');
    await r.fulfill({ response: res, body: t });
  });
  const cdp = await ctx.newCDPSession(p);
  const jari = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const seret = async (a, z, n = 14) => { await jari("touchStart", a.x, a.y); for (let i = 1; i <= n; i++) { await jari("touchMove", a.x + (z.x - a.x) * i / n, a.y + (z.y - a.y) * i / n); await p.waitForTimeout(16); } await jari("touchEnd"); };
  const tengah = async sel => { const r = await p.locator(sel).first().boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };
  const buka = async jalur => { await p.goto(ASAL + jalur, { waitUntil: "networkidle" }); await p.waitForTimeout(600); };
  return { ctx, p, jari, seret, tengah, buka };
}

/* ───────── 1 · seretan & zoom ───────── */
judul("Seretan dan zoom");
{
  const { ctx, p, seret, tengah, buka } = await hp({ bait: true });
  await buka("/bait-demo.html");
  await p.evaluate(() => { document.body.classList.add("di-meja"); window.__ke(6); }); await p.waitForTimeout(1400);
  let dari = await tengah("#nampan .brg"), ke = await tengah("#piring");
  await seret(dari, ke); await p.waitForTimeout(500);
  let s = await p.evaluate(() => ({ melayang: document.querySelectorAll(".brg.terbang").length, piring: document.querySelectorAll("#tumpuk .brg").length }));
  cek("Bait · timbangan: barang diseret ke piring dan mendarat", s.melayang === 0 && s.piring === 1, JSON.stringify(s));
  /* tiruan gangguan iPhone: tangkapan pointer lepas, akhir seretan jatuh ke elemen di bawahnya */
  await p.evaluate(() => document.querySelectorAll("#nampan .brg").forEach(x => x.addEventListener("pointerdown", e => { try { x.releasePointerCapture(e.pointerId); } catch (_) {} x.style.pointerEvents = "none"; setTimeout(() => x.style.pointerEvents = "", 1500); })));
  dari = await tengah("#nampan .brg"); await seret(dari, ke); await p.waitForTimeout(500);
  s = await p.evaluate(() => ({ melayang: document.querySelectorAll(".brg.terbang").length, piring: document.querySelectorAll("#tumpuk .brg").length }));
  cek("Bait · timbangan: akhir seretan nyasar pun barang tidak tertinggal melayang", s.melayang === 0 && s.piring === 2, JSON.stringify(s));
  await ctx.close();
}
{
  const { ctx, p, jari, buka } = await hp();
  await buka("/kado-riang-demo.html");
  for (let i = 0; i < 2; i++) { await jari("touchStart", 195, 420); await p.waitForTimeout(30); await jari("touchEnd"); await p.waitForTimeout(80); }
  await p.waitForTimeout(600);
  const z = await p.evaluate(() => ({ skala: visualViewport.scale, aksi: getComputedStyle(document.documentElement).touchAction }));
  cek("ketuk ganda tidak membesarkan layar tema", z.skala === 1 && z.aksi === "pan-x pan-y", JSON.stringify(z));
  await ctx.close();
}

/* ───────── 2 · suara ───────── */
judul("Suara");
const bunyi = async (p, nama) => { await p.waitForTimeout(800); const a = await p.evaluate(() => window.__nada); await p.waitForTimeout(2000); const z = await p.evaluate(() => window.__nada); cek(nama + ": kotak musik bawaan berbunyi terus", z - a >= 3, (z - a) + " nada dalam 2 detik"); };
{ const { ctx, p, buka } = await hp(); await buka("/garis-finis-demo.html"); await p.locator(".calon").first().tap(); await bunyi(p, "Garis Finis"); await ctx.close(); }
{ const { ctx, p, seret, tengah, buka } = await hp(); await buka("/stasiun-terakhir-demo.html"); await seret(await tengah("#karcis"), await tengah("#celah")); await bunyi(p, "Stasiun Terakhir"); await ctx.close(); }
{ const { ctx, p, seret, tengah, buka } = await hp(); await buka("/pemutaran-perdana-demo.html"); const s = await tengah("#sobekan"); await seret(s, { x: s.x, y: s.y + 220 }); await bunyi(p, "Pemutaran Perdana"); await ctx.close(); }
{ const { ctx, p, seret, tengah, buka } = await hp(); await buka("/kado-riang-demo.html"); const s = await tengah(".tk-stub"); await seret(s, { x: s.x + 240, y: s.y }); await bunyi(p, "Kado Riang"); await ctx.close(); }
{ const { ctx, p, buka } = await hp(); await buka("/langit-harapan-demo.html"); for (const c of "1010") { await p.locator('[data-k="' + c + '"]').first().tap(); await p.waitForTimeout(120); } await bunyi(p, "Langit Harapan"); await ctx.close(); }
{
  const { ctx, p, seret, tengah, buka } = await hp({ bait: true, lagu: true, tiruIphone: true });
  await buka("/bait-demo.html");
  const pintu = await tengah("#pintu0");
  await seret({ x: pintu.x, y: pintu.y - 10 }, { x: pintu.x, y: pintu.y + 190 }); await p.waitForTimeout(700);
  const lagu = () => p.evaluate(() => window.__audio.filter(a => /uji-lagu/.test(a.src)).map(a => ({ jeda: a.paused, vol: +a.volume.toFixed(2), t: +a.currentTime.toFixed(2), bisu: a.muted }))[0]);
  let l = await lagu();
  cek("lagu unggahan (aturan iPhone): seretan pembuka belum boleh membunyikan lagu", !!l && l.jeda, JSON.stringify(l));
  await p.touchscreen.tap(195, 640); await p.waitForTimeout(2600); l = await lagu();
  cek("lagu unggahan (aturan iPhone): ketukan pertama memutar lagu dan volumenya naik", !!l && !l.jeda && l.vol > .5 && l.t > 0, JSON.stringify(l));
  await p.locator("#suara").click(); await p.waitForTimeout(300); await p.touchscreen.tap(195, 300); await p.waitForTimeout(500);
  const m = await p.evaluate(() => ({ bisu: window.__audio.every(a => a.muted), ctx: window.__ctx.map(c => c.state) }));
  cek("tombol suara: tetap bisu walau layar disentuh lagi", m.bisu && m.ctx.every(x => x !== "running"), JSON.stringify(m));
  await p.locator("#suara").click(); await p.waitForTimeout(400);
  const tampak = v => p.evaluate(v => { Object.defineProperty(document, "hidden", { configurable: true, get: () => v }); document.dispatchEvent(new Event("visibilitychange")); }, v);
  await tampak(true); await p.waitForTimeout(300); l = await lagu();
  cek("halaman ditinggal: lagu dijeda", l.jeda);
  await tampak(false); await p.waitForTimeout(600); l = await lagu();
  cek("kembali ke halaman: lagu lanjut", !l.jeda);
  await ctx.close();
}

/* ───────── 3 · tata letak HP ───────── */
judul("Tata letak HP");
{
  let buruk = [];
  for (const w of [320, 360, 390, 430, 540, 699]) {
    const { ctx, p, buka } = await hp({ w, h: 800, diam: true }); await buka("/");
    const r = await p.evaluate(() => { const kotak = s => [...document.querySelectorAll(s)].map(e => e.getBoundingClientRect()), kena = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
      const chip = kotak(".scene .chip"), kado = kotak(".gb-lid, .gb-body, .gb-bow, .gb-tag"); let n = 0;
      chip.forEach((c, i) => { kado.forEach(k => { if (kena(c, k)) n++; }); chip.slice(i + 1).forEach(d => { if (kena(c, d)) n++; }); if (c.left < -1 || c.right > innerWidth + 1) n++; });
      return { n, melebar: document.documentElement.scrollWidth - innerWidth }; });
    if (r.n || r.melebar > 0) buruk.push(w + "px");
    await ctx.close();
  }
  cek("beranda: kado dan label momen tidak saling menimpa (320–699px)", !buruk.length, buruk.join(", "));
  buruk = [];
  for (const [w, h] of [[390, 664], [360, 640], [320, 568], [412, 780], [430, 932]]) {
    const { ctx, p, buka } = await hp({ w, h }); await buka("/tema/rekonstruksi");
    const r = await p.evaluate(() => { const ph = document.querySelector(".hal-tema .phone").getBoundingClientRect(), bar = document.querySelector(".tm-bar").getBoundingClientRect(), hd = document.querySelector("header").getBoundingClientRect(); return ph.top >= hd.bottom - 1 && ph.bottom <= bar.top + 1; });
    if (!r) buruk.push(w + "×" + h); await ctx.close();
  }
  cek("halaman tema: ponsel contoh muat utuh di layar HP", !buruk.length, buruk.join(", "));
}

/* ───────── 4 · formulir pemesanan ───────── */
judul("Formulir pemesanan (390×700)");
{
  const { ctx, p, buka } = await hp();
  const api = []; p.on("response", r => { if (r.url().includes("/api/")) api.push(r.url().split("/api/")[1].split("?")[0] + ":" + r.status()); });
  await buka("/pesan?tema=kado-riang");
  const posisi = () => p.evaluate(() => { const w = document.getElementById("wizard").getBoundingClientRect(), sisi = document.getElementById("sisi"), a = document.querySelector("#form section.wz-aktif").getBoundingClientRect(); const s = getComputedStyle(sisi).display !== "none" ? sisi.getBoundingClientRect() : a; return { bilah: Math.round(w.bottom), isi: Math.round(Math.min(a.top, s.top)) }; });
  const diAtas = a => a.isi >= a.bilah - 2 && a.isi <= a.bilah + 40;
  const lanjut = async () => { const t = p.locator(".wz-nav.wz-aktif button.tbl-utama"); await t.scrollIntoViewIfNeeded(); await t.tap(); await p.waitForTimeout(500); };
  cek("pratinjau tidak tampil di langkah 1, dan tidak ada tombol pratinjau mengambang", !(await p.locator("#sisi").isVisible()) && (await p.locator(".buka-pv").count()) === 0);
  await p.fill("#penerima", "Amira"); await p.fill("#pengirim", "Adriel"); await p.fill("#surat1", "Selamat ulang tahun, Amira.");
  await lanjut(); let a = await posisi(); cek("langkah 2 (foto) mulai dari atas", diAtas(a), JSON.stringify(a));
  const k = await p.evaluate(() => { const r = [...document.querySelectorAll(".fotokartu")].map(x => x.getBoundingClientRect()); return { n: r.length, tinggi: Math.round(r[0].height), sebaris: Math.abs(r[0].top - r[1].top) < 4 }; });
  cek("kartu foto ringkas: dua per baris, tinggi di bawah 300px", k.sebaris && k.tinggi < 300, JSON.stringify(k));
  const foto = ["vespa-p.jpg", "pantai-p.jpg", "bukit-p.jpg", "wisuda-p.jpg", "sofa-l.jpg", "vespa-l.jpg"];
  for (let i = 0; i < k.n; i++) { await p.setInputFiles(`[data-file="${i}"]`, AKAR + "foto-contoh/" + foto[i]); await p.waitForTimeout(350); }
  await p.waitForTimeout(500);
  cek("semua foto terpasang", (await p.locator(".fotokartu.isi").count()) === k.n);
  await lanjut(); a = await posisi(); cek("langkah 3 (detail & lagu) mulai dari atas", diAtas(a), JSON.stringify(a));
  const m = p.locator("#cobaMusik"); await m.scrollIntoViewIfNeeded(); await m.tap(); await p.waitForTimeout(1500);
  const n1 = await p.evaluate(() => window.__nada);
  cek("tombol \"Dengarkan musik bawaan\" membunyikan musiknya", n1 >= 3 && (await m.textContent()).includes("Hentikan"), n1 + " nada");
  await m.tap(); await p.waitForTimeout(400); const n2 = await p.evaluate(() => window.__nada); await p.waitForTimeout(1200);
  cek("ketuk lagi: musiknya berhenti", (await p.evaluate(() => window.__nada)) === n2);
  await p.evaluate(() => { document.querySelectorAll("#blokDasar input[type=date], #blokKhusus input[type=date]").forEach(i => { i.value = "2002-10-12"; i.dispatchEvent(new Event("input", { bubbles: true })); }); document.querySelectorAll("#blokDasar input[type=text], #blokKhusus input[type=text], #blokDasar textarea, #blokKhusus textarea").forEach((i, n) => { if (!i.value) { i.value = "Isi " + (n + 1); i.dispatchEvent(new Event("input", { bubbles: true })); } }); });
  await lanjut(); a = await posisi(); cek("langkah 4 (kunci & kontak) mulai dari atas", diAtas(a), JSON.stringify(a));
  await p.fill("#email", "adriel@example.com");
  await lanjut(); a = await posisi(); await p.waitForTimeout(1800); cek("langkah 5 (lihat & bayar) mulai dari atas", diAtas(a), JSON.stringify(a));
  const pv = await p.evaluate(() => { const f = document.getElementById("pvFrame"), s = document.getElementById("sisi").getBoundingClientRect(), b = document.querySelector(".kirim").getBoundingClientRect(); return !f.hidden && /#pratinjau/.test(f.src) && s.top < b.top; });
  const isi = await p.frameLocator("#pvFrame").locator("body").innerText().catch(() => "");
  cek("langkah 5: pratinjau tampil di atas kotak bayar dan memakai isian pembeli", pv && /Amira/.test(isi));
  cek("halaman tidak melebar ke samping", (await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  await p.locator("#setuju").check(); const tb = p.locator("#tblKirim"); await tb.scrollIntoViewIfNeeded(); await tb.tap(); await p.waitForTimeout(2500);
  cek("pesanan terkirim: draf dibuat dan pembayaran disiapkan", api.some(x => x === "draf:200") && api.some(x => x === "bayar:200"), api.filter(x => /draf|bayar/.test(x)).join(" "));
  await ctx.close();
}

await b.close();
console.log("\n" + "─".repeat(58));
console.log(gagal.length ? `${lulus} lulus, ${gagal.length} GAGAL:\n  - ` + gagal.join("\n  - ") : `SEMUA LULUS — ${lulus} uji HP.`);
console.log("─".repeat(58));
process.exit(gagal.length ? 1 : 0);
