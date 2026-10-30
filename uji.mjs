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
  } else if (tema === "peta-perjalanan") {
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    d.isi.jenisHariJadi = "pacaran";
    d.isi.tanggalMulai = "2021-10-24";
    d.isi.sembunyikanTahun = false;
    d.isi.rahasia = "Destinasi berikutnya, kamu yang pilih.";
  } else if (tema === "zona-waktu") {
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.kotaPengirim = "tokyo";
    d.isi.kotaPenerima = "jakarta";
    d.isi.rutinitas = [{ jam: "07:30", kegiatan: "berangkat kerja" }, { jam: "12:15", kegiatan: "makan siang" }, { jam: "22:30", kegiatan: "siap tidur" }];
    d.isi.oleh = ["Gantungan kunci", "Teh", "Peluk"];
    d.isi.tanggalKetemu = "";
    d.isi.penutup = "";
  } else if (tema === "graduation-benih") {
    d.momen = "graduation";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    d.isi.jenjang = "s1";
    d.isi.tanggalWisuda = "2026-10-24";
    d.isi.sembunyikanTahun = false;
    d.isi.rahasia = "Toga ini aku simpan fotonya, buat pigura nanti.";
  } else if (tema === "confess-kunang") {
    d.momen = "confess";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    d.isi.rahasia = "Aku cuma butuh satu kesempatan buat bilang ini langsung.";
    d.isi.kunang = ["Caramu bilang bentar ya", "Satu gorengan yang disisain", "Ketawamu di ujung lorong"];
    d.isi.sejak = "kamu minjemin payung di halte";
  } else if (tema === "getwell-365") {
    d.momen = "getwell";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    d.isi.tanggalSakit = "2026-10-21";
    d.isi.sembunyikanHari = false;
    d.isi.dosis = [
      { teks: "Inget, kamu nggak sendirian.", aturan: "3x sehari setelah makan" },
      { teks: "Nggak usah balas chat siapa-siapa dulu.", aturan: "1x sehari" },
      { teks: "Kalau masih lemes, kabarin.", aturan: "bila perlu" }
    ];
    d.isi.enakan = ["Teh anget", "Lampu diredupin", "Suara hujan"];
    d.isi.airPesan = "minum dulu, pelan-pelan.";
    d.isi.rahasia = "Udah tidur? Aku di sini kalau butuh apa-apa.";
  } else if (tema === "pasar-malam") {
    d.momen = "askout";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.tanggalAjak = "2026-11-07";
    d.isi.jamAjak = "19:00";
    d.isi.titikTemu = "Depan kosan kamu";
    d.isi.kegiatan = ["mie malam-malam", "nonton", "muter nggak jelas", "ngopi"];
    d.isi.alasan = ["Alasan satu.", "Alasan dua.", "Alasan tiga."];
    d.isi.catatanTunda = "Nggak apa-apa. Aku nunggu sampai kamu siap.";
  } else if (tema === "lewat-duluan") {
    d.momen = "lovenote";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.kebiasaan = "Tiap pagi aku masih nyiapin dua mug.";
    d.isi.kangen = ["Hal satu.", "Hal dua.", "Hal tiga."];
    d.isi.barang = ["Susu stroberi", "Roti sobek", "Keripik"];
    d.isi.penutup = "Besok aku lewat sini duluan lagi.";
  } else if (tema === "rumah-contoh") {
    d.momen = "proposal";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.janji = ["Janji teras.", "Janji tamu.", "Janji dapur.", "Janji halaman."];
    d.isi.penutup = "";
  } else if (tema === "kasus-pengirim") {
    d.momen = "confess";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.karakter = "perempuan";
    d.isi.catatan = "Kamu selalu pilih kursi menghadap jendela.";
    d.isi.pesanan = "es kopi susu";
    d.isi.tahu = "Kamu nyobek bungkus gula tapi nggak dipakai.";
    d.isi.penutup = "";
  } else if (tema === "rekonstruksi") {
    d.momen = "anniversary";
    delete d.isi.ucapan;
    delete d.isi.tanggalLahir;
    delete d.isi.sembunyikanUmur;
    delete d.isi.rahasia;
    d.isi.jenisHariJadi = "pacaran";
    d.isi.tanggalMulai = "2021-03-14";
    d.isi.sembunyikanTahun = false;
    d.isi.karakterPenerima = "perempuan";
    d.isi.karakterPengirim = "laki";
    d.isi.kejadian = [
      { tempat: "Toko buku", jam: "10:15", cerita: "Satu." },
      { tempat: "Kedai mi", jam: "12:40", cerita: "Dua." },
      { tempat: "Halte", jam: "16:05", cerita: "Tiga." },
      { tempat: "Taman", jam: "19:30", cerita: "Empat." }
    ];
    d.isi.penutup = "";
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
  sama(L.catatan.email.filter(e => e.to[0] === "pembeli@contoh.id").length, 0, "tidak boleh ada email ke pembeli");
  sama(L.catatan.email.filter(e => /kegagalan/.test(e.subject)).length, 1, "pemilik harus dikabari sekali");
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

await uji("minat per tema: dibuka, mulai isi, terbayar terhitung di dasbor", async () => {
  const L = await buatLingkungan();
  const catat = b => L.panggil("/api/catat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) });
  for (let i = 0; i < 3; i++) sama((await catat({ tema: "pasar-malam", jenis: "demo" })).status, 200, "catat demo");
  await catat({ tema: "pasar-malam", jenis: "form" });
  sama((await catat({ tema: "tidak-ada", jenis: "demo" })).status, 400, "tema asing ditolak");
  sama((await catat({ tema: "bait", jenis: "klik" })).status, 400, "jenis asing ditolak");
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur)); await L.tunggu();
  const { j } = await dev(L, { aksi: "daftar" });
  sama(j.minat["pasar-malam"].demo, 3, "dibuka");
  sama(j.minat["pasar-malam"].form, 1, "mulai isi");
  sama(j.minat["bait"].lunas, 1, "terbayar");
  sama(Object.keys(j.minat).length, 13, "semua tema terdaftar");
});

await uji("rumah-contoh · pesanan lengkap diterima, momen proposal, empat janji tersimpan", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("rumah-contoh"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "rumah-contoh", "tema"); sama(b.momen, "proposal", "momen");
  const i = JSON.parse(b.isi);
  sama(i.janji[3], "Janji halaman.", "janji 4"); harus(!("tanggalLahir" in i), "isian birthday tidak boleh nyangkut");
});

await uji("rumah-contoh · janji kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("rumah-contoh"); d.isi.janji[1] = "";
  const r = await L.panggil("/api/draf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
  sama(r.status, 400, "status");
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
                      "kado-riang.html", "langit-harapan.html", "peta-perjalanan.html",
                      "peta-perjalanan-demo.html", "zona-waktu.html", "zona-waktu-demo.html",
                      "graduation-benih.html", "graduation-benih-demo.html",
                      "confess-kunang.html", "confess-kunang-demo.html",
                      "getwell-365.html", "getwell-365-demo.html",
                      "pasar-malam.html", "pasar-malam-demo.html",
                      "lewat-duluan.html", "lewat-duluan-demo.html",
                      "kasus-pengirim.html", "kasus-pengirim-demo.html",
                      "rekonstruksi.html", "rekonstruksi-demo.html",
                      "rumah-contoh.html", "rumah-contoh-demo.html",
                      "index.html"]) {
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

/* Penjaga untuk tiga bug formulir yang lolos sampai live (29-10-2026):
   (1) penghitung karakter yang melempar galat di kolom tanpa tempat angka
       mematikan seluruh formulir Langit Harapan saat dibuka;
   (2)(3) tautan edit LDR & Get Well tidak mengisi ulang isian dasarnya,
       dan 36,5 tidak mengisi ulang isian khasnya, sehingga pembeli tidak
       bisa menyimpan perubahan. */
await uji("pesan.html · penghitung karakter tidak boleh melempar galat di kolom tanpa tempat angka", async () => {
  const t = await readFile("./pesan.html", "utf8");
  const fn = t.slice(t.indexOf("function pasangHitung"), t.indexOf("function pasangHitung") + 700);
  harus(/if\(!tampil\) return;/.test(fn), "pasangHitung harus berhenti diam-diam kalau .angka tidak ada");
});

await uji("pesan.html · mode edit mengisi ulang isian dasar SETIAP momen yang punya isian dasar", async () => {
  const t = await readFile("./pesan.html", "utf8");
  const edit = t.slice(t.indexOf("siapkanTema(h.j.tema"), t.indexOf("var lagu = i.lagu"));
  const momen = [...new Set([...t.matchAll(/momen:"([a-z]+)"/g)].map(m => m[1]))];
  const tanpaIsianDasar = ["birthday", "confess", "lovenote", "proposal"];   // birthday = cabang bawaan
  for (const m of momen) {
    if (tanpaIsianDasar.includes(m)) continue;
    harus(edit.includes('MOMEN_GRUP === "' + m + '"'), "momen " + m + " tidak punya cabang isi-ulang di mode edit");
  }
});

await uji("pesan.html · mode edit mengisi ulang isian khas setiap tema yang punya isian khas sendiri", async () => {
  const t = await readFile("./pesan.html", "utf8");
  const edit = t.slice(t.indexOf("siapkanTema(h.j.tema"), t.indexOf("var lagu = i.lagu"));
  const khusus = t.slice(t.indexOf("function isiKhusus"), t.indexOf("function fotoRange"));
  const tema = [...khusus.matchAll(/TEMA === "([a-z0-9-]+)"/g)].map(m => m[1]);
  harus(tema.length >= 7, "daftar tema di isiKhusus() tidak terbaca (" + tema.length + ")");
  for (const x of tema) harus(edit.includes('TEMA === "' + x + '"'), "tema " + x + " tidak punya cabang isi-ulang di mode edit");
});

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
for (const berkas of ["kado-riang.html", "langit-harapan.html", "peta-perjalanan.html", "zona-waktu.html", "graduation-benih.html", "confess-kunang.html", "getwell-365.html", "pasar-malam.html", "lewat-duluan.html", "kasus-pengirim.html", "rekonstruksi.html", "rumah-contoh.html"]) {
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

/* ═══════════ tema Peta Perjalanan (Anniversary) ═══════════ */
judul("Tema Peta Perjalanan");

await uji("peta-perjalanan · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("peta-perjalanan"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "peta-perjalanan", "tema tersimpan");
  const isi = JSON.parse(b.isi);
  sama(isi.jenisHariJadi, "pacaran", "jenis hari jadi tersimpan");
  sama(isi.tanggalMulai, "2021-10-24", "tanggal mulai tersimpan");
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut nyangkut di momen anniversary");
});

await uji("peta-perjalanan · tanggal mulai kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("peta-perjalanan");
  d.isi.tanggalMulai = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena tanggal mulai kosong");
});

await uji("peta-perjalanan · jenisHariJadi di luar daftar jatuh ke 'pacaran'", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("peta-perjalanan");
  d.isi.jenisHariJadi = "piknik";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(JSON.parse(b.isi).jenisHariJadi, "pacaran", "jatuh ke bawaan");
});

await uji("peta-perjalanan · bukan tema birthday, jadi tidak ikut terkena skema birthday di rapikanIsi()", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("peta-perjalanan");
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus("sembunyikanTahun" in isi, "sembunyikanTahun harus ada");
  harus(!("sembunyikanUmur" in isi), "sembunyikanUmur (birthday) tidak boleh ikut");
});

/* ═══════════ tema Zona Waktu (LDR) ═══════════ */
judul("Tema Zona Waktu");

await uji("zona-waktu · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("zona-waktu"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "zona-waktu", "tema tersimpan");
  const isi = JSON.parse(b.isi);
  sama(isi.kotaPengirim, "tokyo", "kota pengirim tersimpan");
  sama(isi.kotaPenerima, "jakarta", "kota penerima tersimpan");
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut nyangkut di momen ldr");
  harus(!("jenisHariJadi" in isi) && !("tanggalMulai" in isi), "isian anniversary tidak boleh ikut nyangkut di momen ldr");
});

await uji("zona-waktu · kota pengirim kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("zona-waktu");
  d.isi.kotaPengirim = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena kota pengirim kosong");
});

await uji("zona-waktu · kota penerima kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("zona-waktu");
  d.isi.kotaPenerima = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena kota penerima kosong");
});

await uji("zona-waktu · kota di luar daftar ditolak (bukan jatuh ke bawaan — kota harus pilihan sah)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("zona-waktu");
  d.isi.kotaPengirim = "narnia";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena kota tidak dikenal");
});

await uji("zona-waktu · rutinitas & isi paket tersimpan; tanggal ketemu & penutup opsional", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("zona-waktu"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  sama(isi.rutinitas[2].jam, "22:30", "jam rutinitas tersimpan");
  sama(isi.oleh.length, 3, "tiga lapis paket");
  harus(!("rahasia" in isi), "versi baru tidak lagi memakai pesan rahasia");
});

await uji("zona-waktu · jam rutinitas ngawur ditolak (dipakai kuis & samakan jadwal)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("zona-waktu"); d.isi.rutinitas[1].jam = "30:00";
  const j = await draf(L, d);
  harus(!j.ok && /Jam rutinitas 2/.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("zona-waktu · kegiatan rutinitas & isi paket kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d1 = isiDrafTema("zona-waktu"); d1.isi.rutinitas[0].kegiatan = "";
  const j1 = await draf(L, d1);
  harus(!j1.ok && /Kegiatan rutinitas 1/.test(j1.pesan || ""), "kegiatan kosong harus ditolak");
  const d2 = isiDrafTema("zona-waktu"); d2.isi.oleh[2] = "";
  const j2 = await draf(L, d2);
  harus(!j2.ok && /paket/i.test(j2.pesan || ""), "isi paket kosong harus ditolak");
});

/* ═══════════ tema Benih & Pohon Cita-Cita (Graduation) ═══════════ */
judul("Tema Benih & Pohon Cita-Cita");

await uji("graduation-benih · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("graduation-benih"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "graduation-benih", "tema tersimpan");
  sama(b.momen, "graduation", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.jenjang, "s1", "jenjang tersimpan");
  sama(isi.tanggalWisuda, "2026-10-24", "tanggal wisuda tersimpan");
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut nyangkut di momen graduation");
});

await uji("graduation-benih · tanggal wisuda kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("graduation-benih");
  d.isi.tanggalWisuda = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena tanggal wisuda kosong");
});

await uji("graduation-benih · jenjang di luar daftar jatuh ke 's1'", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("graduation-benih");
  d.isi.jenjang = "sd";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(JSON.parse(b.isi).jenjang, "s1", "jatuh ke bawaan");
});

await uji("graduation-benih · bukan tema birthday/kado-riang/langit-harapan, jadi tidak ikut terkena skema khusus tema lain di rapikanIsi()", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("graduation-benih");
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus("sembunyikanTahun" in isi, "sembunyikanTahun harus ada");
  harus(!("sembunyikanUmur" in isi), "sembunyikanUmur (birthday) tidak boleh ikut");
  harus(!("kupon" in isi), "kupon (kado-riang) tidak boleh ikut");
  harus(!("kuis" in isi) && !("harapan" in isi), "kuis/harapan (langit-harapan) tidak boleh ikut");
});

await uji("confess-kunang · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("confess-kunang"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "confess-kunang", "tema tersimpan");
  sama(b.momen, "confess", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.rahasia, "Aku cuma butuh satu kesempatan buat bilang ini langsung.", "rahasia tersimpan");
});

await uji("confess-kunang · momen confess tidak punya isian dasar tambahan — tanggal/jenjang/kota birthday-anniversary-ldr-graduation tidak boleh ikut nyangkut", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("confess-kunang");
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi) && !("sembunyikanUmur" in isi), "isian birthday tidak boleh ikut");
  harus(!("jenisHariJadi" in isi) && !("tanggalMulai" in isi), "isian anniversary tidak boleh ikut");
  harus(!("kotaPengirim" in isi) && !("kotaPenerima" in isi), "isian ldr tidak boleh ikut");
  harus(!("jenjang" in isi) && !("tanggalWisuda" in isi), "isian graduation tidak boleh ikut");
  harus(!("sembunyikanTahun" in isi), "sembunyikanTahun (momen lain) tidak boleh ikut di confess");
});

await uji("confess-kunang · tiga kunang-kunang & 'sejak' tersimpan persis", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("confess-kunang"));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const i = JSON.parse(b.isi);
  sama(i.kunang[1], "Satu gorengan yang disisain", "kunang 2");
  sama(i.sejak, "kamu minjemin payung di halte", "sejak");
});

for (const [kunci, ubah] of [["kunang", d => { d.isi.kunang[2] = ""; }], ["sejak", d => { d.isi.sejak = " "; }]]) {
  await uji("confess-kunang · " + kunci + " kosong ditolak", async () => {
    const L = await buatLingkungan();
    const d = isiDrafTema("confess-kunang"); ubah(d);
    const r = await L.panggil("/api/draf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
    sama(r.status, 400, "status");
  });
}

await uji("confess-kunang · pesan rahasia boleh kosong (opsional, sama seperti tema lain)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("confess-kunang");
  d.isi.rahasia = "";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
});

await uji("confess-kunang · bukan tema birthday/kado-riang/langit-harapan, jadi tidak ikut terkena skema khusus tema lain di rapikanIsi()", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("confess-kunang");
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("kupon" in isi), "kupon (kado-riang) tidak boleh ikut");
  harus(!("kuis" in isi) && !("harapan" in isi), "kuis/harapan (langit-harapan) tidak boleh ikut");
});

await uji("getwell-365 · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("getwell-365"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "getwell-365", "tema tersimpan");
  sama(b.momen, "getwell", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.tanggalSakit, "2026-10-21", "tanggal mulai sakit tersimpan");
  sama(isi.dosis.length, 3, "tiga dosis tersimpan");
  sama(isi.dosis[0].aturan, "3x sehari setelah makan", "aturan pakai dosis tersimpan");
  sama(isi.enakan[1], "Lampu diredupin", "hal yang bikin enakan tersimpan");
  sama(isi.airPesan, "minum dulu, pelan-pelan.", "tulisan di dasar gelas tersimpan");
});

await uji("getwell-365 · tanggal mulai sakit kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("getwell-365");
  d.isi.tanggalSakit = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena tanggal mulai sakit kosong");
});

await uji("getwell-365 · dosis yang belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("getwell-365");
  d.isi.dosis[2].teks = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena satu dosis kosong");
});

await uji("getwell-365 · hal yang bikin enakan belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("getwell-365");
  d.isi.enakan[0] = "";
  const j = await draf(L, d);
  harus(!j.ok, "seharusnya ditolak karena satu hal enakan kosong");
});

await uji("getwell-365 · aturan pakai & tulisan gelas boleh kosong (opsional)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("getwell-365");
  d.isi.dosis.forEach(x => { x.aturan = ""; });
  d.isi.airPesan = "";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
});

await uji("getwell-365 · momen getwell tidak kena isian momen lain, dan isian khas tema lain tidak nyangkut", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("getwell-365"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut");
  harus(!("tanggalMulai" in isi) && !("jenisHariJadi" in isi), "isian anniversary tidak boleh ikut");
  harus(!("tanggalWisuda" in isi) && !("jenjang" in isi), "isian graduation tidak boleh ikut");
  harus(!("kotaPengirim" in isi), "isian ldr tidak boleh ikut");
  harus(!("kupon" in isi) && !("kuis" in isi), "isian kado-riang/langit-harapan tidak boleh ikut");
  harus("sembunyikanHari" in isi, "sembunyikanHari harus ada");
  harus(!("sembunyikanTahun" in isi) && !("sembunyikanUmur" in isi), "flag sembunyikan momen lain tidak boleh ikut");
});

await uji("pasar-malam · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("pasar-malam"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "pasar-malam", "tema tersimpan");
  sama(b.momen, "askout", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.tanggalAjak, "2026-11-07", "tanggal ajakan tersimpan");
  sama(isi.jamAjak, "19:00", "jam ajakan tersimpan");
  sama(isi.kegiatan.length, 4, "empat rencana tersimpan");
  sama(isi.alasan.length, 3, "tiga alasan tersimpan");
  sama(isi.titikTemu, "Depan kosan kamu", "titik temu tersimpan");
});

await uji("pasar-malam · tanggal ajakan kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.tanggalAjak = "";
  const j = await draf(L, d);
  harus(!j.ok && /Tanggal ajakannya/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("pasar-malam · jam ajakan kosong atau ngawur ditolak (dipakai jarum jam menara)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.jamAjak = "";
  const j1 = await draf(L, d);
  harus(!j1.ok && /Jam ajakannya/i.test(j1.pesan || ""), "jam kosong harus ditolak: " + JSON.stringify(j1));
  const d2 = isiDrafTema("pasar-malam");
  d2.isi.jamAjak = "33:99";
  const j2 = await draf(L, d2);
  harus(!j2.ok && /Jam ajakannya/i.test(j2.pesan || ""), "jam ngawur harus ditolak: " + JSON.stringify(j2));
});

await uji("pasar-malam · jam satu digit dirapikan jadi HH:MM", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.jamAjak = "9:30";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(JSON.parse(b.isi).jamAjak, "09:30", "jam dirapikan");
});

await uji("pasar-malam · rencana di botol yang belum lengkap ditolak (tiap botol wajib berlabel)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.kegiatan[2] = "";
  const j = await draf(L, d);
  harus(!j.ok && /rencana/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("pasar-malam · alasan yang belum lengkap ditolak (tiga lapis gula kapas)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.alasan[0] = "";
  const j = await draf(L, d);
  harus(!j.ok && /alasan/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("pasar-malam · titik temu & catatan tunda boleh kosong (opsional)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("pasar-malam");
  d.isi.titikTemu = "";
  d.isi.catatanTunda = "";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
});

await uji("pasar-malam · momen askout tidak kena isian momen lain, dan isian khas tema lain tidak nyangkut", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("pasar-malam"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut");
  harus(!("tanggalMulai" in isi) && !("jenisHariJadi" in isi), "isian anniversary tidak boleh ikut");
  harus(!("tanggalWisuda" in isi) && !("jenjang" in isi), "isian graduation tidak boleh ikut");
  harus(!("kotaPengirim" in isi) && !("tanggalSakit" in isi), "isian ldr/getwell tidak boleh ikut");
  harus(!("kupon" in isi) && !("kuis" in isi) && !("dosis" in isi), "isian khas tema lain tidak boleh ikut");
  harus(!("rahasia" in isi), "pasar-malam tidak memakai pesan rahasia");
  harus(!("sembunyikanTahun" in isi) && !("sembunyikanUmur" in isi) && !("sembunyikanHari" in isi), "flag sembunyikan momen lain tidak boleh ikut");
});

await uji("lewat-duluan · pesanan lengkap diterima dan tersimpan dengan tema yang benar", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("lewat-duluan"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "lewat-duluan", "tema tersimpan");
  sama(b.momen, "lovenote", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.kebiasaan, "Tiap pagi aku masih nyiapin dua mug.", "kebiasaan tersimpan");
  sama(isi.kangen.length, 3, "tiga hal kangen tersimpan");
  sama(isi.barang.length, 3, "tiga barang tersimpan");
  sama(isi.penutup, "Besok aku lewat sini duluan lagi.", "penutup tersimpan");
});

await uji("lewat-duluan · kebiasaan kosong ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("lewat-duluan");
  d.isi.kebiasaan = "";
  const j = await draf(L, d);
  harus(!j.ok && /Kebiasaan/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("lewat-duluan · hal yang dikangenin belum lengkap ditolak", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("lewat-duluan");
  d.isi.kangen[1] = "";
  const j = await draf(L, d);
  harus(!j.ok && /kangen/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("lewat-duluan · barang kesukaan belum lengkap ditolak (game minimarket butuh ketiganya)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("lewat-duluan");
  d.isi.barang[2] = "";
  const j = await draf(L, d);
  harus(!j.ok && /barang/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

await uji("lewat-duluan · kalimat penutup boleh kosong (opsional)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("lewat-duluan");
  d.isi.penutup = "";
  const j = await draf(L, d);
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
});

await uji("lewat-duluan · momen lovenote tidak kena isian momen lain, dan isian khas tema lain tidak nyangkut", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("lewat-duluan"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("ucapan" in isi) && !("tanggalLahir" in isi), "isian birthday tidak boleh ikut");
  harus(!("tanggalMulai" in isi) && !("tanggalWisuda" in isi) && !("tanggalAjak" in isi), "tanggal momen lain tidak boleh ikut");
  harus(!("kotaPengirim" in isi) && !("tanggalSakit" in isi), "isian ldr/getwell tidak boleh ikut");
  harus(!("kupon" in isi) && !("kegiatan" in isi) && !("dosis" in isi), "isian khas tema lain tidak boleh ikut");
  harus(!("rahasia" in isi), "tema ini tidak memakai pesan rahasia");
});

await uji("kasus-pengirim · pesanan lengkap diterima, momen confess, isian khas tersimpan", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("kasus-pengirim"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "kasus-pengirim", "tema tersimpan");
  sama(b.momen, "confess", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.karakter, "perempuan", "karakter tersimpan");
  sama(isi.pesanan, "es kopi susu", "pesanan tersimpan");
  harus(!!isi.catatan && !!isi.tahu, "catatan & tahu tersimpan");
});

await uji("kasus-pengirim · karakter laki-laki tersimpan; nilai di luar daftar jatuh ke perempuan", async () => {
  const L = await buatLingkungan();
  const d1 = isiDrafTema("kasus-pengirim"); d1.isi.karakter = "laki";
  const j1 = await draf(L, d1);
  const b1 = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j1.kode).first();
  sama(JSON.parse(b1.isi).karakter, "laki", "laki-laki tersimpan");
  const d2 = isiDrafTema("kasus-pengirim"); d2.isi.karakter = "robot";
  const j2 = await draf(L, d2);
  const b2 = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j2.kode).first();
  sama(JSON.parse(b2.isi).karakter, "perempuan", "nilai asing jatuh ke perempuan");
});

for (const [kunci, pola] of [["catatan", /kertas/i], ["pesanan", /Pesanan/i], ["tahu", /Hal kecil/i]]) {
  await uji("kasus-pengirim · " + kunci + " kosong ditolak (bukti wajib)", async () => {
    const L = await buatLingkungan();
    const d = isiDrafTema("kasus-pengirim"); d.isi[kunci] = "";
    const j = await draf(L, d);
    harus(!j.ok && pola.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
  });
}

await uji("kasus-pengirim · tidak ikut skema confess-kunang (tanpa pesan rahasia) dan isian tema lain tidak nyangkut", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("kasus-pengirim"));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("rahasia" in isi), "pesan rahasia confess-kunang tidak boleh ikut");
  harus(!("kangen" in isi) && !("kegiatan" in isi) && !("kupon" in isi), "isian khas tema lain tidak boleh ikut");
  harus(!("tanggalLahir" in isi) && !("tanggalAjak" in isi), "tanggal momen lain tidak boleh ikut");
});

await uji("rekonstruksi · pesanan lengkap diterima, momen anniversary, empat kejadian tersimpan", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("rekonstruksi"));
  harus(j.ok, "draf gagal: " + JSON.stringify(j));
  const b = await L.env.DB.prepare("SELECT tema,momen,isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  sama(b.tema, "rekonstruksi", "tema tersimpan");
  sama(b.momen, "anniversary", "momen tersimpan sesuai skema tema");
  const isi = JSON.parse(b.isi);
  sama(isi.kejadian.length, 4, "empat kejadian");
  sama(isi.kejadian[1].jam, "12:40", "jam tersimpan");
  sama(isi.tanggalMulai, "2021-03-14", "isian dasar anniversary tetap ada");
});

await uji("rekonstruksi · jam kejadian ngawur ditolak (jam = jawaban garis waktu)", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("rekonstruksi"); d.isi.kejadian[2].jam = "25:99";
  const j = await draf(L, d);
  harus(!j.ok && /Jam kejadian 3/i.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
});

for (const [kunci, pola] of [["tempat", /Tempat kejadian 1/], ["cerita", /Cerita kejadian 1/]]) {
  await uji("rekonstruksi · " + kunci + " kejadian kosong ditolak", async () => {
    const L = await buatLingkungan();
    const d = isiDrafTema("rekonstruksi"); d.isi.kejadian[0][kunci] = "";
    const j = await draf(L, d);
    harus(!j.ok && pola.test(j.pesan || ""), "harus ditolak: " + JSON.stringify(j));
  });
}

await uji("rekonstruksi · tampilan dua sosok tersimpan; nilai asing jatuh ke bawaan", async () => {
  const L = await buatLingkungan();
  const d = isiDrafTema("rekonstruksi"); d.isi.karakterPenerima = "laki"; d.isi.karakterPengirim = "alien";
  const j = await draf(L, d);
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  sama(isi.karakterPenerima, "laki", "pilihan sah tersimpan");
  sama(isi.karakterPengirim, "laki", "nilai asing jatuh ke bawaan");
});

await uji("rekonstruksi · tidak ikut skema peta-perjalanan (tanpa pesan rahasia) & isian tema lain tidak nyangkut", async () => {
  const L = await buatLingkungan();
  const j = await draf(L, isiDrafTema("rekonstruksi"));
  const b = await L.env.DB.prepare("SELECT isi FROM pesanan WHERE kode=?").bind(j.kode).first();
  const isi = JSON.parse(b.isi);
  harus(!("rahasia" in isi), "pesan rahasia peta-perjalanan tidak boleh ikut");
  harus(!("catatan" in isi) && !("kangen" in isi) && !("kupon" in isi), "isian khas tema lain tidak boleh ikut");
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

/* ═══════════ paket keamanan & pengawasan (31-10-2026) ═══════════ */
judul("Keamanan, batas laju, kabar dibuka, pencarian");

async function admin(L, isi) {
  return (await L.panggil("/api/developer", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ sandi: KUNCI.ADMIN_PASSWORD, ...isi })
  })).json();
}
async function lunaskan(L) {
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur));
  await L.tunggu();
  return p;
}

await uji("kode surat baru 10 huruf, kode lama 6 huruf tetap terbuka", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  sama(p.kode.length, 10, "panjang kode baru");
  await L.env.DB.prepare("UPDATE pesanan SET kode='abc234' WHERE kode=?").bind(p.kode).run();
  sama((await L.panggil("/s/abc234")).status, 200, "kode lama 6 huruf");
});

await uji("header keamanan ada di halaman, aset, dan API", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  for (const jalan of ["/", "/s/" + p.kode, "/api/status?kode=" + p.kode]) {
    const r = await L.panggil(jalan);
    sama(r.headers.get("x-frame-options"), "DENY", jalan + " x-frame-options");
    harus(/frame-ancestors 'none'/.test(r.headers.get("content-security-policy") || ""), jalan + " CSP");
    harus(/max-age=/.test(r.headers.get("strict-transport-security") || ""), jalan + " HSTS");
    sama(r.headers.get("x-content-type-options"), "nosniff", jalan + " nosniff");
  }
});

await uji("batas laju: draf ke-13 dari IP yang sama dalam 10 menit ditolak 429", async () => {
  const L = await buatLingkungan();
  const kirim = (ip) => L.panggil("/api/draf", {
    method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify(isiDraf())
  });
  for (let i = 0; i < 12; i++) sama((await kirim("203.0.113.7")).status, 200, "draf ke-" + (i + 1));
  sama((await kirim("203.0.113.7")).status, 429, "draf ke-13");
  sama((await kirim("203.0.113.8")).status, 200, "IP lain tidak ikut tertahan");
  const isiLaju = await L.env.DB.prepare("SELECT kunci FROM laju").all();
  harus(!JSON.stringify(isiLaju.results).includes("203.0.113"), "IP mentah tidak boleh tersimpan");
});

await uji("surat dibuka: skrip tersisip di semua mesin tema", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  for (const tema of ["bait", "kado-riang", "rumah-contoh"]) {
    await L.env.DB.prepare("UPDATE pesanan SET tema=? WHERE kode=?").bind(tema, p.kode).run();
    const html = await (await L.panggil("/s/" + p.kode)).text();
    harus(html.includes('"/api/dibuka"') && html.includes('fv-edit-' + p.kode), tema + ": skrip dibuka tidak tersisip");
    harus(html.indexOf("/api/dibuka") < html.lastIndexOf("</body>"), tema + ": skrip harus sebelum </body>");
  }
});

await uji("surat dibuka: email ke pembeli sekali saja, hitungan bertambah", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  const awal = L.catatan.email.length;
  for (let i = 0; i < 3; i++) {
    await L.panggil("/api/dibuka", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kode: p.kode }) });
    await L.tunggu();
  }
  const baru = L.catatan.email.slice(awal);
  sama(baru.length, 1, "email dibuka");
  harus(/sudah dibuka/.test(baru[0].subject) && baru[0].to[0] === "pembeli@contoh.id", "isi email dibuka");
  const b = await L.env.DB.prepare("SELECT n_buka,dibuka FROM pesanan WHERE kode=?").bind(p.kode).first();
  sama(b.n_buka, 3, "hitungan bukaan");
  harus(b.dibuka > 0, "waktu pertama dibuka");
  const d = await admin(L, { aksi: "daftar" });
  sama(d.baris[0].n_buka, 3, "tampil di developer");
});

await uji("surat dibuka: draf belum lunas tidak dihitung", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.panggil("/api/dibuka", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kode: p.kode }) });
  await L.tunggu();
  const b = await L.env.DB.prepare("SELECT n_buka,dibuka FROM pesanan WHERE kode=?").bind(p.kode).first();
  sama(b.n_buka, 0, "hitungan"); sama(b.dibuka, null, "dibuka");
});

await uji("pencarian pesanan: kode, email, nama, dan tanpa hasil", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  for (const cari of [p.kode.slice(2, 7), "PEMBELI@contoh", "amira"])
    sama((await admin(L, { aksi: "daftar", cari })).baris.length, 1, "cari " + cari);
  sama((await admin(L, { aksi: "daftar", cari: "tidak-ada-%" })).baris.length, 0, "cari tanpa hasil");
});

await uji("kegagalan tercatat di tab Sistem dan pemilik dikabari maks. sekali per jam", async () => {
  const L = await buatLingkungan();
  const p = await buatPesanan(L);
  await L.notifikasi(notifSukses(p.faktur), { rusak: true });
  await L.notifikasi(notifSukses(p.faktur), { rusak: true });
  const k = (await admin(L, { aksi: "periksa" })).kejadian;
  sama(k.length, 2, "dua kejadian tercatat");
  sama(k[0].jenis, "notifikasi DOKU ditolak", "jenis");
  sama(L.catatan.email.filter(e => /kegagalan/.test(e.subject)).length, 1, "email pemilik");
});

/* ═══════════ masa simpan 6 bulan ═══════════ */
judul("Masa simpan 6 bulan");
const { rawatHarian } = await import("./functions/api/[[jalur]].js");

await uji("lunas → simpan_sampai = 6 bulan setelah bayar", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  const b = await L.env.DB.prepare("SELECT dibayar,simpan_sampai FROM pesanan WHERE kode=?").bind(p.kode).first();
  const hari = (b.simpan_sampai - b.dibayar) / 86400000;
  harus(hari >= 181 && hari <= 184, "selisih hari: " + hari);
});

await uji("pengingat dikirim sekali, 14 hari sebelum habis", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  await L.env.DB.prepare("UPDATE pesanan SET simpan_sampai=? WHERE kode=?").bind(Date.now() + 10 * 86400000, p.kode).run();
  const awal = L.catatan.email.length;
  await rawatHarian(L.env); await rawatHarian(L.env);
  const baru = L.catatan.email.slice(awal);
  sama(baru.length, 1, "jumlah email pengingat");
  harus(/disimpan sampai/.test(baru[0].subject), "subjek pengingat");
  sama((await L.panggil("/s/" + p.kode)).status, 200, "surat masih terbuka");
});

await uji("belum masuk 14 hari terakhir → tidak ada pengingat", async () => {
  const L = await buatLingkungan();
  await lunaskan(L);
  const awal = L.catatan.email.length;
  await rawatHarian(L.env);
  sama(L.catatan.email.length, awal, "email");
});

await uji("masa habis → isi, kontak, token, foto dihapus; tautan menjelaskan", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  await L.env.DB.prepare("UPDATE pesanan SET simpan_sampai=? WHERE kode=?").bind(Date.now() - 1000, p.kode).run();
  const h = await rawatHarian(L.env);
  sama(h.dihapus, 1, "dihapus");
  const b = await L.env.DB.prepare("SELECT isi,email,whatsapp,token,aktif,status,jumlah FROM pesanan WHERE kode=?").bind(p.kode).first();
  sama(b.isi, "{}", "isi"); sama(b.email, "", "email"); sama(b.whatsapp, "", "wa"); sama(b.token, null, "token"); sama(b.aktif, 0, "aktif");
  sama(b.status, "lunas", "catatan transaksi tetap"); sama(b.jumlah, 15000, "jumlah tetap");
  const f = await L.env.DB.prepare("SELECT COUNT(*) n FROM foto WHERE kode=?").bind(p.kode).first();
  sama(f.n, 0, "foto");
  const r = await L.panggil("/s/" + p.kode);
  sama(r.status, 404, "status");
  harus(/Masa simpan surat ini sudah habis/.test(await r.text()), "pesan masa habis");
});

await uji("pesanan lama (tanpa simpan_sampai) tidak disentuh", async () => {
  const L = await buatLingkungan();
  const p = await lunaskan(L);
  await L.env.DB.prepare("UPDATE pesanan SET simpan_sampai=NULL WHERE kode=?").bind(p.kode).run();
  await rawatHarian(L.env);
  sama((await L.panggil("/s/" + p.kode)).status, 200, "masih terbuka");
});

/* ═══════════ hasil ═══════════ */
console.log("\n" + "─".repeat(58));
console.log(gagal === 0
  ? `SEMUA LULUS — ${lulus} uji.`
  : `${lulus} lulus, ${gagal} GAGAL:\n  - ` + kegagalan.join("\n  - "));
console.log("─".repeat(58));
process.exit(gagal === 0 ? 0 : 1);
