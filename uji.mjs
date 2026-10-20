/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · uji otomatis alur pembayaran DOKU
   Jalankan:  node uji.mjs
   ══════════════════════════════════════════════════════════════════ */

import { buatLingkungan, KUNCI, rangkaiBebas, tandaBebas, digestBebas } from "./sim.mjs";
import { readFile } from "node:fs/promises";

let lulus = 0, gagal = 0;
const kegagalan = [];

async function uji(nama, jalankan) {
  try { await jalankan(); lulus++; console.log("  ✓ " + nama); }
  catch (e) { gagal++; kegagalan.push(nama + " → " + e.message); console.log("  ✗ " + nama + "\n      " + e.message); }
}
function harus(syarat, pesan) { if (!syarat) throw new Error(pesan); }
function sama(a, b, pesan) {
  if (a !== b) throw new Error((pesan || "nilai beda") + " — dapat " + JSON.stringify(a) + ", harusnya " + JSON.stringify(b));
}
function judul(t) { console.log("\n" + t); }

const FOTO = "data:image/jpeg;base64," + Buffer.from("x".repeat(400)).toString("base64");

function isiDraf() {
  return {
    tema: "bait", momen: "birthday",
    email: "pembeli@contoh.id", whatsapp: "6281234567890",
    isi: {
      penerima: "Amira", pengirim: "Adriel", ucapan: "selamat",
      surat: ["Selamat ulang tahun.", "Semoga sehat selalu.", "Sampai jumpa."],
      tanggalLahir: "2001-05-14", sembunyikanUmur: false,
      rahasia: "Aku menunggu di halaman terakhir."
    },
    foto: [{ data: FOTO, mime: "image/jpeg", caption: "foto pertama" }]
  };
}

function isiDrafTema(tema) {
  const d = isiDraf();
  d.tema = tema;
  if (tema === "kado-riang") {
    delete d.isi.rahasia;
    d.isi.kupon = ["Kupon satu", "Kupon dua", "Kupon tiga"];
  } else if (tema === "langit-harapan") {
    delete d.isi.rahasia;
    d.isi.kuis = [
      { tanya: "Soal satu?", pilihan: ["A", "B", "C"], benar: 0 },
      { tanya: "Soal dua?", pilihan: ["A", "B", "C"], benar: 1 },
      { tanya: "Soal tiga?", pilihan: ["A", "B", "C"], benar: 2 }
    ];
    d.isi.harapan = ["Harapan satu.", "Harapan dua.", "Harapan tiga."];
  }
  return d;
}

async function buatPesanan(L) {
  const r = await L.panggil("/api/draf", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(isiDraf())
  });
  const j = await r.json();
  harus(j.ok, "draf gagal dibuat: " + JSON.stringify(j));
  const rb = await L.panggil("/api/bayar", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ kode: j.kode })
  });
  const jb = await rb.json();
  harus(jb.ok, "bayar gagal: " + JSON.stringify(jb));
  return { kode: j.kode, token: j.token, faktur: jb.order_id, url: jb.url };
}

function notifSukses(faktur, jumlah = 15560) {
  return {
    order: { invoice_number: faktur, amount: jumlah },
    transaction: { status: "SUCCESS", date: new Date().toISOString() },
    service: { id: "CHECKOUT" }, channel: { id: "QRIS" }
  };
}

/* ═══════════ a · tanda tangan permintaan keluar ═══════════ */
judul("a · Tanda tangan permintaan ke DOKU");

await uji("susunan komponen sama persis dengan contoh di dokumentasi DOKU", () => {
  const dapat = rangkaiBebas(
    "MCH-0001-10791114622547", "cc682442-6c22-493e-8121-b9ef6b3fa728",
    "2020-08-11T08:45:42Z", "/doku-virtual-account/v2/payment-code",
    "5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=");
  const harusnya = "Client-Id:MCH-0001-10791114622547\n"
    + "Request-Id:cc682442-6c22-493e-8121-b9ef6b3fa728\n"
    + "Request-Timestamp:2020-08-11T08:45:42Z\n"
    + "Request-Target:/doku-virtual-account/v2/payment-code\n"
    + "Digest:5WIYK2TJg6iiZ0d5v4IXSR0EkYEkYOezJIma3Ufli5s=";
  sama(dapat, harusnya, "rangkaian komponen");
  harus(!dapat.endsWith("\n"), "tidak boleh ada newline di akhir");
});

await uji("tanda tangan kode kita lolos pemeriksaan pustaka lain (node:crypto)", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  const p = L.catatan.panggilan.find(x => x.jalur === "/checkout/v1/payment");
  harus(p, "tidak ada panggilan ke /checkout/v1/payment");
  harus(p.tandaSah, "tanda tangan ditolak pemeriksa bebas");
});

await uji("Request-Id selalu baru tiap panggilan", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L); await buatPesanan(L);
  const id = L.catatan.panggilan.map(x => x.requestId);
  sama(new Set(id).size, id.length, "Request-Id terulang");
});

await uji("Request-Timestamp berformat ISO8601 UTC tanpa milidetik", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  const s = L.catatan.panggilan[0].stempel;
  harus(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(s), "format stempel salah: " + s);
});

await uji("metode pembayaran dikunci ke QRIS saja", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  const p = L.catatan.panggilan.find(x => x.jalur === "/checkout/v1/payment");
  sama(JSON.stringify(p.badan.payment.payment_method_types), '["QRIS"]', "daftar metode");
});

await uji("jumlah yang dikirim ke DOKU adalah harga + biaya transaksi (Rp15.560)", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  const p = L.catatan.panggilan.find(x => x.jalur === "/checkout/v1/payment");
  sama(p.badan.order.amount, 15560, "jumlah");
  sama(p.badan.order.line_items.length, 2, "jumlah rincian");
  sama(p.badan.order.line_items[0].price, 15000, "harga surat di rincian");
  sama(p.badan.order.line_items[1].price, 560, "biaya transaksi di rincian");
});

await uji("DOKU_MODE=sandbox memakai host sandbox", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  sama(L.catatan.sandbox, true, "host sandbox");
});

await uji("DOKU_MODE kosong tetap dianggap Sandbox, bukan Production", async () => {
  const L = await buatLingkungan({ DOKU_MODE: "" });
  await buatPesanan(L);
  sama(L.catatan.sandbox, true, "mode kosong harus jatuh ke sandbox");
});

await uji("DOKU_MODE=production memakai host sungguhan", async () => {
  const L = await buatLingkungan({ DOKU_MODE: "production" });
  await buatPesanan(L);
  sama(L.catatan.sandbox, false, "host production");
});

/* ═══════════ b · webhook sah ═══════════ */
judul("b · Notifikasi sah");

await uji("notifikasi SUCCESS membuat pesanan lunas", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.notifikasi(notifSukses(p.faktur));
  sama(r.status, 200, "status balasan");
  await L.tunggu();
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  sama(s.status, "lunas", "status pesanan");
});

await uji("balasan webhook 2xx dan tidak memuat Secret Key", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.notifikasi(notifSukses(p.faktur));
  const t = await r.text();
  harus(r.status >= 200 && r.status < 300, "harus 2xx, dapat " + r.status);
  harus(!t.includes(KUNCI.DOKU_SECRET_KEY), "Secret Key bocor ke respons");
});

await uji("surat baru bisa dibuka setelah lunas", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  sama((await L.panggil("/api/surat?kode=" + p.kode)).status, 404, "sebelum lunas harus 404");
  await L.notifikasi(notifSukses(p.faktur));
  await L.tunggu();
  const r = await L.panggil("/api/surat?kode=" + p.kode);
  sama(r.status, 200, "setelah lunas harus 200");
  const j = await r.json();
  sama(j.isi.penerima, "Amira", "isi surat");
});

/* ═══════════ c · tanda tangan salah ═══════════ */
judul("c · Notifikasi palsu ditolak");

await uji("tanda tangan rusak ditolak 403", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.notifikasi(notifSukses(p.faktur), { rusak: true });
  sama(r.status, 403, "status");
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  harus(s.status !== "lunas", "pesanan tidak boleh jadi lunas");
});

await uji("tanda tangan dari Secret Key lain ditolak", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.notifikasi(notifSukses(p.faktur), { rahasia: "kunci-penyerang" });
  sama(r.status, 403, "status");
});

await uji("Client-Id asing ditolak", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.notifikasi(notifSukses(p.faktur), { clientId: "MCH-PENYERANG" });
  sama(r.status, 403, "status");
});

await uji("badan diubah setelah ditandatangani ditolak (Digest tidak cocok)", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const isi = notifSukses(p.faktur);
  const badan = JSON.stringify(isi);
  const requestId = "notif-ubah";
  const stempel = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const tanda = tandaBebas(KUNCI.DOKU_SECRET_KEY, rangkaiBebas(
    KUNCI.DOKU_CLIENT_ID, requestId, stempel, "/api/notifikasi-doku", digestBebas(badan)));
  const diubah = JSON.stringify({ ...isi, order: { ...isi.order, amount: 1 } });
  const r = await L.panggil("/api/notifikasi-doku", {
    method: "POST",
    headers: { "content-type": "application/json", "Client-Id": KUNCI.DOKU_CLIENT_ID,
               "Request-Id": requestId, "Request-Timestamp": stempel, "Signature": tanda },
    body: diubah
  });
  sama(r.status, 403, "status");
});

/* ═══════════ d · notifikasi dobel ═══════════ */
judul("d · Notifikasi dobel (idempotensi)");

await uji("tiga notifikasi sama hanya mengirim satu email", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  sama(L.catatan.email.length, 1, "jumlah email terkirim");
});

await uji("notifikasi dobel tidak menggeser batas edit", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const a = await (await L.panggil("/api/draf?token=" + p.token)).json();
  await new Promise(r => setTimeout(r, 15));
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const b = await (await L.panggil("/api/draf?token=" + p.token)).json();
  sama(a.batas_edit, b.batas_edit, "batas edit");
});

/* ═══════════ e · stempel basi ═══════════ */
judul("e · Stempel waktu");

await uji("stempel 30 jam yang lalu ditolak", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const basi = new Date(Date.now() - 30 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  sama((await L.notifikasi(notifSukses(p.faktur), { stempel: basi })).status, 403, "status");
});

await uji("stempel 11 jam yang lalu DITERIMA (DOKU mencoba ulang sampai 12 jam)", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const telat = new Date(Date.now() - 11 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  sama((await L.notifikasi(notifSukses(p.faktur), { stempel: telat })).status, 200, "status");
  await L.tunggu();
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  sama(s.status, "lunas", "percobaan ulang yang sah harus tetap diproses");
});

await uji("stempel jauh di masa depan ditolak", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const depan = new Date(Date.now() + 40 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  sama((await L.notifikasi(notifSukses(p.faktur), { stempel: depan })).status, 403, "status");
});

/* ═══════════ f · status bukan SUCCESS ═══════════ */
judul("f · Status selain SUCCESS");

for (const st of ["FAILED", "PENDING", "EXPIRED"]) {
  await uji(st + " diabaikan, pesanan tidak berubah jadi lunas", async () => {
    const L = await buatLingkungan();
    const p = await buatPesanan(L);
    const isi = notifSukses(p.faktur); isi.transaction.status = st;
    const r = await L.notifikasi(isi);
    harus(r.status >= 200 && r.status < 300, "harus dibalas 2xx supaya DOKU berhenti mencoba");
    await L.tunggu();
    const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
    harus(s.status !== "lunas", "tidak boleh lunas");
    sama(L.catatan.email.length, 0, "tidak boleh ada email");
  });
}

/* ═══════════ g · jumlah tidak cocok ═══════════ */
judul("g · Jumlah pembayaran");

await uji("jumlah kurang dari harga ditolak", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  sama((await L.notifikasi(notifSukses(p.faktur, 1000))).status, 403, "status");
  await L.tunggu();
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  harus(s.status !== "lunas", "tidak boleh lunas");
  sama(L.catatan.email.length, 0, "tidak boleh ada email");
});

await uji("faktur yang tidak dikenal dibalas 2xx tanpa efek", async () => {
  const L = await buatLingkungan();
  await buatPesanan(L);
  const r = await L.notifikasi(notifSukses("FV-tidak-ada"));
  harus(r.status >= 200 && r.status < 300, "harus 2xx, dapat " + r.status);
  sama(L.catatan.email.length, 0, "tidak boleh ada email");
});

/* ═══════════ cek status sebagai cadangan ═══════════ */
judul("Cek status (cadangan kalau notifikasi tidak sampai)");

await uji("tanpa notifikasi, cek status menemukan SUCCESS dan melunasi", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  L.catatan.status[p.faktur] = "SUCCESS";
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  sama(s.status, "lunas", "status");
  await L.tunggu();
  sama(L.catatan.email.length, 1, "email terkirim sekali");
});

await uji("cek status menolak jumlah yang tidak cocok", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  L.catatan.status[p.faktur] = "SUCCESS";
  L.catatan.jumlah[p.faktur] = 500;
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  harus(s.status !== "lunas", "tidak boleh lunas");
});

await uji("cek status PENDING tidak melunasi", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const s = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  harus(s.status !== "lunas", "tidak boleh lunas");
});

await uji("status surat tidak membocorkan token edit", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const t = await (await L.panggil("/api/status?kode=" + p.kode)).text();
  harus(!t.includes(p.token), "token edit bocor di /api/status");
});

/* ═══════════ h · alur pesan.html ═══════════ */
judul("h · Alur pembeli dari ujung ke ujung");

await uji("draf → bayar → notifikasi → surat aktif", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  harus(p.url.startsWith("https://"), "url pembayaran harus https, dapat " + p.url);
  harus(p.faktur.startsWith("FV-"), "nomor faktur harus berawalan FV-");
  harus(p.faktur.length <= 64, "nomor faktur melebihi 64 karakter");
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  sama((await L.panggil("/api/surat?kode=" + p.kode)).status, 200, "surat aktif");
  sama(L.catatan.email.length, 1, "email terkirim");
});

await uji("pesan.html mengalihkan ke url DOKU, bukan membuka Snap", async () => {
  const t = await readFile("./pesan.html", "utf8");
  harus(t.includes("location.href = bayar.url"), "pengalihan ke bayar.url tidak ditemukan");
  harus(!/snap/i.test(t), "masih ada sisa Snap di pesan.html");
});

await uji("pembeli yang menutup tab bisa melanjutkan dari draf yang sama", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const sebelum = L.catatan.panggilan.length;
  const r = await L.panggil("/api/bayar", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ kode: p.kode })
  });
  const j = await r.json();
  harus(j.ok && j.url, "pembayaran kedua gagal dibuka");
  harus(L.catatan.panggilan.length > sebelum, "tidak ada panggilan baru ke DOKU");
  const t = await readFile("./selesai.html", "utf8");
  harus(t.includes("tblLanjut"), "tombol lanjutkan pembayaran tidak ada di selesai.html");
});

await uji("pesanan yang sudah lunas tidak membuat tagihan baru", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const r = await L.panggil("/api/bayar", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ kode: p.kode })
  });
  const j = await r.json();
  sama(j.sudah, true, "harus menjawab sudah lunas");
  sama(L.catatan.panggilan.filter(x => x.jalur === "/checkout/v1/payment").length, 1, "jumlah tagihan");
});

/* ═══════════ i · dasbor Developer Control ═══════════ */
judul("i · Dasbor Developer Control");

async function dev(L, isi) {
  const r = await L.panggil("/api/developer", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ sandi: KUNCI.ADMIN_PASSWORD, ...isi })
  });
  return { status: r.status, j: await r.json() };
}

await uji("panel Sistem melaporkan DOKU, bukan Midtrans", async () => {
  const L = await buatLingkungan();
  const { j } = await dev(L, { aksi: "periksa" });
  harus(j.ok, "periksa gagal");
  sama(j.doku, true, "sambungan DOKU");
  harus(!("midtrans" in j), "masih ada field midtrans");
  sama(j.metode, "QRIS", "daftar metode");
  sama(j.harga, 15000, "harga");
  sama(j.sandbox, true, "mode sandbox");
  sama(j.mode_tegas, true, "DOKU_MODE tegas");
});

await uji("DOKU_MODE kosong dilaporkan sebagai belum tegas", async () => {
  const L = await buatLingkungan({ DOKU_MODE: "" });
  const { j } = await dev(L, { aksi: "periksa" });
  sama(j.mode_tegas, false, "mode_tegas");
  harus(j.mode.includes("DOKU_MODE"), "pesan mode harus menyebut DOKU_MODE");
});

await uji("kunci DOKU belum dipasang terbaca di panel", async () => {
  const L = await buatLingkungan({ DOKU_CLIENT_ID: "", DOKU_SECRET_KEY: "" });
  const { j } = await dev(L, { aksi: "periksa" });
  sama(j.doku, false, "doku");
});

await uji("periksa tidak pernah membocorkan Secret Key", async () => {
  const L = await buatLingkungan();
  const r = await L.panggil("/api/developer", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ sandi: KUNCI.ADMIN_PASSWORD, aksi: "periksa" })
  });
  const t = await r.text();
  harus(!t.includes(KUNCI.DOKU_SECRET_KEY), "Secret Key bocor");
  harus(!t.includes("SK-SIMULASI"), "potongan Secret Key bocor");
});

await uji("daftar pesanan tampil dengan status yang benar", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const { j } = await dev(L, { aksi: "daftar" });
  sama(j.lunas, 1, "jumlah lunas");
  sama(j.pendapatan, 15000, "pendapatan");
  const baris = j.baris.find(b => b.kode === p.kode);
  sama(baris.status, "lunas", "status baris");
  sama(baris.penerima, "Amira", "penerima");
  harus(!("isi" in baris), "isi mentah tidak boleh ikut");
});

await uji("password salah ditolak", async () => {
  const L = await buatLingkungan();
  const r = await L.panggil("/api/developer", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ sandi: "salah", aksi: "periksa" })
  });
  sama(r.status, 401, "status");
});

await uji("aksi nonaktifkan surat berfungsi", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await dev(L, { aksi: "aktif", kode: p.kode, nilai: false });
  sama((await L.panggil("/api/surat?kode=" + p.kode)).status, 410, "surat harus 410");
});

await uji("kirim ulang email dari panel berfungsi", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await dev(L, { aksi: "email", kode: p.kode });
  sama(L.catatan.email.length, 2, "email kedua dikirim atas permintaan");
});

/* ═══════════ bersih dari Midtrans ═══════════ */
judul("Sisa jejak Midtrans");

for (const berkas of ["functions/api/[[jalur]].js", "pesan.html", "selesai.html",
                      "developer.html", "syarat-ketentuan.html", "kebijakan-privasi.html"]) {
  await uji(berkas + " tidak menyebut Midtrans lagi", async () => {
    const t = await readFile("./" + berkas, "utf8");
    harus(!/midtrans/i.test(t), "masih ada kata Midtrans");
  });
}


/* ═══════════ skrip di dalam halaman ═══════════
   Unduhan browser Playwright diblokir di lingkungan ini, jadi halaman
   tidak bisa dijalankan sungguhan. Yang diperiksa di sini: skrip di
   dalam halaman masih bisa diurai, dan tidak ada sisa pemanggilan ke
   fungsi yang sudah dibuang. Uji di browser sungguhan tetap wajib
   dilakukan manual di langkah 4 panduan cutover.                    */
judul("Skrip di dalam halaman");

async function skripHalaman(berkas) {
  const t = await readFile("./" + berkas, "utf8");
  const potong = [...t.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  harus(potong.length, "tidak ada skrip di " + berkas);
  return potong;
}

for (const berkas of ["pesan.html", "selesai.html", "developer.html", "surat.html",
                      "kado-riang.html", "langit-harapan.html", "index.html"]) {
  await uji(berkas + " · skrip di dalamnya masih bisa diurai", async () => {
    const { execFileSync } = await import("node:child_process");
    const { writeFileSync, rmSync } = await import("node:fs");
    const potong = await skripHalaman(berkas);
    potong.forEach((kode, i) => {
      const sementara = "/tmp/fv-periksa-" + i + ".js";
      writeFileSync(sementara, kode);
      try { execFileSync(process.execPath, ["--check", sementara], { stdio: "pipe" }); }
      catch (e) { throw new Error("skrip ke-" + (i + 1) + " rusak: " + String(e.stderr).slice(0, 200)); }
      finally { rmSync(sementara, { force: true }); }
    });
  });
}

await uji("tidak ada panggilan ke fungsi yang sudah dibuang", async () => {
  const t = await readFile("./pesan.html", "utf8");
  for (const hilang of ["muatSnap", "window.snap", "client_key", "bayar.token"])
    harus(!t.includes(hilang), "masih memanggil " + hilang);
});

/* worker.js menulis data pesanan asli ke blok <script id="foreverse-data">
   kado-riang.html & langit-harapan.html dengan regex yang mensyaratkan
   newline persis sebelum "</script>". Kalau berkasnya diedit dan baris
   penutup berubah jadi "}</script>" tanpa newline, regexnya tetap
   "match" — tapi mencaplok sampai </script> SKRIP BERIKUTNYA, menghapus
   skrip bootstrap pratinjau. Uji ini memastikan match-nya selalu pas
   satu skrip saja. */
for (const berkas of ["kado-riang.html", "langit-harapan.html"]) {
  await uji(berkas + " · pola sisip data worker.js pas satu skrip, tidak mencaplok skrip berikutnya", async () => {
    const t = await readFile("./" + berkas, "utf8");
    const re = /(<script id="foreverse-data" type="application\/json">\n)[\s\S]*?(\n<\/script>)/;
    const m = t.match(re);
    harus(!!m, "regex tidak menemukan blok data sama sekali");
    const isiBlok = m[0];
    harus(!/<script>[\s\S]*\(function/.test(isiBlok), "match mencaplok skrip berikutnya juga — baris penutup data kemungkinan hilang newline-nya");
  });
}


/* ═══════════ lagu ═══════════ */
judul("Lagu");

const MP3 = (n = 2000) => "data:audio/mpeg;base64," + Buffer.alloc(n, 7).toString("base64");

async function drafLagu(L, lagu, token) {
  const isi = isiDraf();
  isi.isi.lagu = lagu;
  if (token) {
    const r = await L.panggil("/api/simpan", { method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, ...isi }) });
    return await r.json();
  }
  const r = await L.panggil("/api/draf", { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(isi) });
  return await r.json();
}

async function laguTersimpan(L, kode) {
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(kode).first();
  return JSON.parse(b.isi).lagu;
}

await uji("tanpa unggahan, lagu kosong — surat memakai kotak musik bawaan", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { mulai: 0, selesai: 0 });
  harus(j.ok, "draf gagal");
  const l = await laguTersimpan(L, j.kode);
  sama(l.src, "", "src harus kosong");
});

await uji("MP3 yang diunggah tersimpan dan bisa diputar", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(), mime: "audio/mpeg", judul: "lagu kami" });
  harus(j.ok, "draf gagal: " + j.pesan);
  const l = await laguTersimpan(L, j.kode);
  sama(l.src.length > 0, true, "src harus terisi");
  sama(l.judul, "lagu kami", "judul");
  harus(l.src.startsWith("/f/" + j.kode + "/lagu-"), "alamat berkas salah: " + l.src);
  harus(/\.mp3$/.test(l.src), "akhiran berkas harus .mp3");
  harus([...L.env.FOTO._isi.keys()].some(k => k.includes("/lagu-")), "berkas tidak masuk ke R2");
});

await uji("M4A juga diterima", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(), mime: "audio/x-m4a", judul: "m4a" });
  harus(j.ok, "draf gagal: " + j.pesan);
  harus(/\.m4a$/.test((await laguTersimpan(L, j.kode)).src), "akhiran harus .m4a");
});

await uji("format selain MP3/M4A ditolak dengan pesan yang jelas", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(), mime: "audio/wav" });
  sama(j.ok, false, "harus ditolak");
  harus(/MP3 atau M4A/.test(j.pesan), "pesan galat kurang jelas: " + j.pesan);
});

await uji("berkas lebih dari 10 MB ditolak", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(11 * 1024 * 1024), mime: "audio/mpeg" });
  sama(j.ok, false, "harus ditolak");
  harus(/10 MB/.test(j.pesan), "pesan galat harus menyebut 10 MB: " + j.pesan);
});

await uji("potongan mulai–selesai tersimpan apa adanya", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(), mime: "audio/mpeg", mulai: 30, selesai: 75 });
  const l = await laguTersimpan(L, j.kode);
  sama(l.mulai, 30, "mulai"); sama(l.selesai, 75, "selesai");
});

await uji("potongan kurang dari 3 detik diabaikan, lagu diputar sampai habis", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { data: MP3(), mime: "audio/mpeg", mulai: 30, selesai: 31 });
  sama((await laguTersimpan(L, j.kode)).selesai, 0, "selesai harus dinolkan");
});

await uji("mengedit tanpa mengganti berkas mempertahankan lagu lama", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await drafLagu(L, { data: MP3(), mime: "audio/mpeg", judul: "asli" }, p.token);
  const sebelum = await laguTersimpan(L, p.kode);
  await drafLagu(L, { pakaiLama: true, mulai: 12, selesai: 40 }, p.token);
  const sesudah = await laguTersimpan(L, p.kode);
  sama(sesudah.src, sebelum.src, "berkas harus sama");
  sama(sesudah.judul, "asli", "judul harus ikut bertahan");
  sama(sesudah.mulai, 12, "mulai boleh berubah");
});

await uji("menghapus lagu saat edit juga membuang berkasnya dari penyimpanan", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  await drafLagu(L, { data: MP3(), mime: "audio/mpeg" }, p.token);
  harus([...L.env.FOTO._isi.keys()].some(k => k.includes("/lagu-")), "berkas belum masuk");
  await drafLagu(L, { mulai: 0, selesai: 0 }, p.token);
  sama((await laguTersimpan(L, p.kode)).src, "", "lagu harus kosong");
  harus(![...L.env.FOTO._isi.keys()].some(k => k.includes("/lagu-")), "berkas lagu masih tertinggal di R2");
});

await uji("jalur YouTube benar-benar dicabut, bukan sekadar disembunyikan", async () => {
  const L = await buatLingkungan();
  const j = await drafLagu(L, { youtube: "https://youtu.be/dQw4w9WgXcQ" });
  harus(j.ok, "draf gagal");
  const l = await laguTersimpan(L, j.kode);
  sama(l.src, "", "tidak boleh ada berkas");
  harus(!("youtube" in l), "field youtube masih tersimpan");
  for (const berkas of ["functions/api/[[jalur]].js", "pesan.html", "surat.html"]) {
    const t = await readFile("./" + berkas, "utf8");
    harus(!/youtube|ytPlayer|dockLayar/i.test(t), berkas + " masih menyebut YouTube");
  }
});

await uji("jalur galeri dicabut — folder lagu/ memang tidak pernah ada", async () => {
  const t = await readFile("./functions/api/[[jalur]].js", "utf8");
  harus(!/daftarGaleri|galeri/i.test(t), "masih ada sisa kode galeri");
});

await uji("surat.html memutar kotak musik bawaan kalau tidak ada lagu, dan menghormati potongan mulai/selesai kalau ada", async () => {
  const t = await readFile("./surat.html", "utf8");
  harus(/function musicBox\(/.test(t), "musicBox tidak didefinisikan");
  harus(/synth=musicBox\(\)/.test(t), "musicBox tidak dipanggil sebagai cadangan");
  harus(!/K\.demo/.test(t), "masih bergantung pada penanda demo");
  harus(/L\.mulai/.test(t) && /L\.selesai/.test(t), "potongan mulai/selesai tidak dibaca dari data lagu");
  harus(/audio\.currentTime=st/.test(t), "potongan mulai tidak diterapkan ke audio");
});


/* ═══════════ ketukan pemeriksaan DOKU ═══════════ */
judul("Ketukan pemeriksaan alamat notifikasi");

await uji("GET ke alamat notifikasi dijawab 200 (dipakai DOKU saat menyimpan URL)", async () => {
  const L = await buatLingkungan();
  const r = await L.panggil("/api/notifikasi-doku");
  sama(r.status, 200, "status");
  const j = await r.json();
  sama(j.ok, true, "ok");
});

await uji("POST tanpa tanda tangan dijawab 200 tapi tidak memproses apa pun", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  const r = await L.panggil("/api/notifikasi-doku", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(notifSukses(p.faktur)) });
  sama(r.status, 200, "status");
  await L.tunggu();
  const st = await (await L.panggil("/api/status?kode=" + p.kode)).json();
  harus(st.status !== "lunas", "pesanan TIDAK boleh lunas tanpa tanda tangan");
  sama(L.catatan.email.length, 0, "tidak boleh ada email");
});

await uji("tanda tangan palsu tetap ditolak 403, bukan ikut dijawab 200", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  sama((await L.notifikasi(notifSukses(p.faktur), { rusak: true })).status, 403, "status");
});

/* ═══════════ tema Kado Riang & Langit Harapan ═══════════ */
judul("Tema Kado Riang & Langit Harapan");

async function draf(L, isi) {
  const r = await L.panggil("/api/draf", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(isi)
  });
  return r.json();
}

for (const tema of ["kado-riang", "langit-harapan"]) {
  await uji(tema + " · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
    const L = await buatLingkungan();
    const j = await draf(L, isiDrafTema(tema));
    harus(j.ok, "draf gagal: " + JSON.stringify(j));
    const b = await L.env.DB.prepare("SELECT tema,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
    sama(b.tema, tema, "tema tersimpan");
    const isi = JSON.parse(b.isi);
    sama(isi.foto[0].caption, "foto pertama", "caption foto ikut tersimpan");
  });
}

await uji("kado-riang · kupon yang belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("kado-riang");
  d.isi.kupon = ["Kupon satu", "", "Kupon tiga"];
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena kupon kedua kosong");
});

await uji("langit-harapan · kuis yang belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("langit-harapan");
  d.isi.kuis[1].pilihan[2] = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena pilihan jawaban kosong");
});

await uji("langit-harapan · harapan yang belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("langit-harapan");
  d.isi.harapan[2] = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena harapan ketiga kosong");
});

await uji("tema terkunci — tidak bisa diganti lewat edit", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("kado-riang"));
  const b1 = await L.env.DB.prepare("SELECT token FROM pesanan WHERE kode=?").bind(j.kode).first();
  await L.env.DB.prepare("UPDATE pesanan SET status='lunas' WHERE kode=?").bind(j.kode).run();
  const d2 = isiDrafTema("kado-riang");
  d2.tema = "bait";                             // coba selundupkan tema lain lewat /simpan
  const r = await L.panggil("/api/simpan", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ token: b1.token }, d2))
  });
  const jr = await r.json();
  harus(jr.ok, "simpan seharusnya tetap berhasil (isian kado-riang tetap lengkap): " + JSON.stringify(jr));
  const b2 = await L.env.DB.prepare("SELECT tema,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b2.tema, "kado-riang", "tema tidak boleh berubah lewat edit");
  harus(!!JSON.parse(b2.isi).kupon, "isian kupon (milik kado-riang) harus tetap ada, bukan ketiban isian bait");
});

/* ═══════════ hasil ═══════════ */
console.log("\n" + "─".repeat(58));
console.log(gagal === 0
  ? `SEMUA LULUS — ${lulus} uji.`
  : `${lulus} lulus, ${gagal} GAGAL:\n  - ` + kegagalan.join("\n  - "));
console.log("─".repeat(58));
process.exit(gagal === 0 ? 0 : 1);
