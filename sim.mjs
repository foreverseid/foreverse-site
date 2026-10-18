/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · simulator lokal

   Menjalankan worker.js di Node, lengkap dengan tiruan D1, R2, ASSETS,
   dan DOKU — supaya seluruh alur pembayaran bisa diuji tanpa
   menyentuh akun sungguhan dan tanpa biaya.

   Jalankan uji:   node uji.mjs
   Jalankan server: node sim.mjs            (lalu buka http://localhost:8787)
   ══════════════════════════════════════════════════════════════════ */

import { DatabaseSync } from "node:sqlite";
import { createHmac, createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export const AKAR = path.dirname(new URL(import.meta.url).pathname);

export const KUNCI = {
  DOKU_CLIENT_ID: "MCH-0001-SIMULASI",
  DOKU_SECRET_KEY: "SK-SIMULASI-rahasia-jangan-dipakai-sungguhan",
  DOKU_MODE: "sandbox",
  RESEND_API_KEY: "re_simulasi",
  ADMIN_PASSWORD: "sandi-simulasi",
  EMAIL_PENGIRIM: "halo@foreverse.id"
};

/* ══════════════ tiruan D1 ══════════════ */

function rapi(v) {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  return v;
}

class Pernyataan {
  constructor(db, sql, args = []) { this.db = db; this.sql = sql; this.args = args; }
  bind(...a) { return new Pernyataan(this.db, this.sql, a.map(rapi)); }
  async first() { return this.db.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: this.db.prepare(this.sql).all(...this.args) }; }
  async run() { this.db.prepare(this.sql).run(...this.args); return { success: true }; }
}

/* Skema diambil langsung dari siapkan() di functions/api/[[jalur]].js,
   bukan disalin ke sini. Dua alasan: skema simulator tidak akan pernah
   menyimpang dari yang sungguhan, dan setiap uji tetap dapat database
   kosong sendiri walau flag `tabelSiap` di modul API hanya menyala
   sekali per proses Node.                                            */
let skemaTersimpan = null;
async function skema() {
  if (skemaTersimpan) return skemaTersimpan;
  const sumber = await readFile(path.join(AKAR, "functions/api/[[jalur]].js"), "utf8");
  const awal = sumber.indexOf("async function siapkan(");
  const akhir = sumber.indexOf("\n}", awal);
  if (awal < 0 || akhir < 0) throw new Error("Simulator: siapkan() tidak ditemukan di kode API.");
  skemaTersimpan = sumber.slice(awal, akhir)
    .match(/CREATE (?:TABLE|INDEX) IF NOT EXISTS[\s\S]*?(?=`)/g) || [];
  if (!skemaTersimpan.length) throw new Error("Simulator: tidak ada CREATE TABLE di siapkan().");
  return skemaTersimpan;
}

export async function buatD1() {
  const mentah = new DatabaseSync(":memory:");
  for (const sql of await skema()) mentah.exec(sql);
  return {
    prepare: (sql) => new Pernyataan(mentah, sql),
    batch: async (daftar) => { for (const p of daftar) await p.run(); },
    _mentah: mentah
  };
}

/* ══════════════ tiruan R2 ══════════════ */

export function buatR2() {
  const isi = new Map();
  return {
    async put(k, bytes, opt) { isi.set(k, { bytes, opt }); },
    async get(k) {
      const o = isi.get(k);
      return o ? { body: o.bytes, httpMetadata: o.opt?.httpMetadata || {} } : null;
    },
    async delete(k) { isi.delete(k); },
    async list({ prefix }) {
      return { objects: [...isi.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })) };
    },
    _isi: isi
  };
}

/* ══════════════ tiruan ASSETS ══════════════ */

export function buatAssets() {
  return {
    async fetch(req) {
      const u = new URL(req.url);
      let p = decodeURIComponent(u.pathname);

      /* Cloudflare mengalihkan "/x.html" ke "/x" — ditiru supaya
         worker.js diuji pada perilaku yang sama dengan produksi. */
      if (p.endsWith(".html")) {
        return new Response(null, { status: 307, headers: { location: p.slice(0, -5) } });
      }
      if (p === "/") p = "/index.html";

      for (const calon of [p + ".html", p]) {
        const berkas = path.join(AKAR, calon);
        if (!berkas.startsWith(AKAR)) break;
        if (existsSync(berkas) && !berkas.endsWith("/")) {
          const isi = await readFile(berkas);
          const jenis = calon.endsWith(".html") ? "text/html; charset=utf-8"
            : calon.endsWith(".json") ? "application/json"
            : calon.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
          return new Response(isi, { status: 200, headers: { "content-type": jenis } });
        }
      }
      return new Response("tidak ada", { status: 404 });
    }
  };
}

/* ══════════════ tiruan DOKU + Resend ══════════════
   Tanda tangan diperiksa ulang di sini memakai node:crypto — bukan
   Web Crypto yang dipakai kode kita. Dua pustaka berbeda, satu
   spesifikasi: kalau cocok, susunan tanda tangannya memang benar.  */

export function rangkaiBebas(clientId, requestId, stempel, sasaran, digest) {
  const baris = [
    "Client-Id:" + clientId,
    "Request-Id:" + requestId,
    "Request-Timestamp:" + stempel,
    "Request-Target:" + sasaran
  ];
  if (digest) baris.push("Digest:" + digest);
  return baris.join("\n");
}

export function tandaBebas(rahasia, pesan) {
  return "HMACSHA256=" + createHmac("sha256", rahasia).update(pesan, "utf8").digest("base64");
}

export function digestBebas(badan) {
  return createHash("sha256").update(badan || "", "utf8").digest("base64");
}

export function buatDoku(catatan) {
  return async function (alamat, pilihan = {}) {
    const u = new URL(alamat);
    const metode = (pilihan.method || "GET").toUpperCase();
    const badan = pilihan.body || "";
    const kepala = new Headers(pilihan.headers || {});

    /* ── Resend ── */
    if (u.hostname === "api.resend.com") {
      catatan.email.push(JSON.parse(badan));
      return new Response(JSON.stringify({ id: "email-" + catatan.email.length }), { status: 200 });
    }

    if (!/^api(-sandbox)?\.doku\.com$/.test(u.hostname)) {
      throw new Error("Simulator: panggilan tak terduga ke " + u.hostname);
    }
    catatan.sandbox = u.hostname === "api-sandbox.doku.com";

    /* ── periksa tanda tangan yang DIKIRIM kode kita ── */
    const digest = metode === "POST" ? digestBebas(badan) : "";
    const harusnya = tandaBebas(KUNCI.DOKU_SECRET_KEY, rangkaiBebas(
      kepala.get("Client-Id"), kepala.get("Request-Id"),
      kepala.get("Request-Timestamp"), u.pathname, digest));

    const sah = harusnya === kepala.get("Signature");
    catatan.panggilan.push({
      metode, jalur: u.pathname, badan: badan ? JSON.parse(badan) : null,
      tandaSah: sah, stempel: kepala.get("Request-Timestamp"),
      requestId: kepala.get("Request-Id"), clientId: kepala.get("Client-Id")
    });
    if (!sah) return new Response(JSON.stringify({ message: ["Signature tidak cocok"] }), { status: 401 });

    /* ── buat transaksi ── */
    if (u.pathname === "/checkout/v1/payment" && metode === "POST") {
      const b = JSON.parse(badan);
      catatan.faktur = b.order.invoice_number;
      return new Response(JSON.stringify({
        message: ["SUCCESS"],
        response: {
          order: { amount: b.order.amount, invoice_number: b.order.invoice_number },
          payment: {
            url: "https://sandbox.doku.com/checkout/link/" + b.order.invoice_number,
            token_id: "tok-" + b.order.invoice_number,
            expired_date: "20261018235959",
            payment_method_types: b.payment.payment_method_types
          }
        }
      }), { status: 200 });
    }

    /* ── cek status ── */
    if (u.pathname.startsWith("/orders/v1/status/") && metode === "GET") {
      const faktur = decodeURIComponent(u.pathname.slice("/orders/v1/status/".length));
      const st = catatan.status[faktur] || "PENDING";
      return new Response(JSON.stringify({
        response: {
          order: { invoice_number: faktur, amount: catatan.jumlah[faktur] ?? 15000 },
          transaction: { status: st, date: new Date().toISOString() }
        }
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: ["jalur tak dikenal"] }), { status: 404 });
  };
}

/* ══════════════ rakit lingkungan ══════════════ */

export async function buatLingkungan(ubah = {}) {
  const catatan = { panggilan: [], email: [], status: {}, jumlah: {}, faktur: null, sandbox: null };
  const env = { ...KUNCI, ...ubah, DB: await buatD1(), FOTO: buatR2(), ASSETS: buatAssets() };
  globalThis.fetch = buatDoku(catatan);

  const { default: worker } = await import("./worker.js?v=" + Math.random());
  const tunggu = [];
  const panggil = (jalan, pilihan) =>
    worker.fetch(new Request("http://localhost:8787" + jalan, pilihan), env,
      { waitUntil: (j) => tunggu.push(j) });

  return {
    env, catatan, panggil,
    tunggu: () => Promise.allSettled(tunggu),
    /* kirim notifikasi DOKU yang ditandatangani dengan benar */
    async notifikasi(isi, { rahasia = KUNCI.DOKU_SECRET_KEY, clientId = KUNCI.DOKU_CLIENT_ID,
                            stempel = new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
                            jalur = "/api/notifikasi-doku", rusak = false } = {}) {
      const badan = JSON.stringify(isi);
      const requestId = "notif-" + Math.random().toString(36).slice(2);
      let tanda = tandaBebas(rahasia, rangkaiBebas(clientId, requestId, stempel, jalur, digestBebas(badan)));
      if (rusak) tanda = tanda.slice(0, -4) + "AAAA";
      return panggil(jalur, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Client-Id": clientId, "Request-Id": requestId,
          "Request-Timestamp": stempel, "Signature": tanda
        },
        body: badan
      });
    }
  };
}

/* ══════════════ server untuk uji manual ══════════════ */

if (process.argv[1] && process.argv[1].endsWith("sim.mjs")) {
  const { panggil } = await buatLingkungan();
  createServer(async (req, res) => {
    const potong = [];
    for await (const c of req) potong.push(c);
    const r = await panggil(req.url, {
      method: req.method,
      headers: req.headers,
      body: potong.length ? Buffer.concat(potong) : undefined
    });
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  }).listen(8787, () => console.log("Simulator jalan di http://localhost:8787"));
}
