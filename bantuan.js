/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · Tanya Vera (asisten bantuan mengambang)

   Jawaban sudah disiapkan di daftar TANYA di bawah — tidak ada AI,
   tidak ada server, tidak ada biaya per pesan. Pertanyaan yang diketik
   dicocokkan dengan kata kunci; kalau tidak ada yang cocok, pembeli
   diarahkan ke WhatsApp atau email.

   Dipasang di: index.html, pesan.html, selesai.html, syarat-ketentuan.html,
   kebijakan-privasi.html  →  <script src="/bantuan.js" defer></script>
   TIDAK dipasang di halaman surat (/s/<kode>), supaya pengalaman penerima
   tidak terganggu.

   Mengubah jawaban: cukup edit teks di TANYA. Kata kunci ditulis huruf
   kecil tanpa tanda baca; satu kata kunci boleh lebih dari satu kata.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.__fvBantuan) return;
  window.__fvBantuan = true;

  var WA = "6289512385393";
  var EMAIL = "halo@foreverse.id";

  var TANYA = [
    { id: "harga", t: "Berapa harganya?",
      k: ["harga", "berapa", "biaya", "bayar berapa", "mahal", "murah", "rp", "15000", "15560", "ongkos", "tarif"],
      j: "Satu surat <b>Rp15.000</b>, tema apa pun. Di halaman pembayaran ada tambahan biaya transaksi QRIS Rp560, jadi totalnya <b>Rp15.560</b>. Rinciannya selalu tampil sebelum kamu membayar." },
    { id: "bayar", t: "Bayarnya pakai apa?",
      k: ["bayar pakai", "metode", "qris", "dana", "ovo", "gopay", "shopeepay", "transfer", "rekening", "bank", "kartu kredit", "va", "virtual account", "indomaret", "alfamart"],
      j: "Pembayaran lewat <b>QRIS</b>, diproses DOKU. QRIS bisa dibayar dari DANA, OVO, ShopeePay, GoPay, atau aplikasi m-banking mana pun. Kami <b>tidak pernah</b> meminta transfer ke rekening pribadi lewat chat." },
    { id: "jadi", t: "Kapan tautannya jadi?",
      k: ["kapan", "berapa lama", "jadi", "selesai", "dikirim", "proses", "langsung", "nunggu", "menunggu"],
      j: "Beberapa saat setelah pembayaran berhasil, tautan surat langsung <b>muncul di layar</b> dan <b>dikirim ke email</b> yang kamu isi. Tidak perlu menunggu admin — semuanya otomatis." },
    { id: "belum", t: "Sudah bayar, tapi tautannya belum muncul",
      k: ["belum muncul", "belum masuk", "belum dapat", "belum dikirim", "tautan tidak muncul", "tautan tidak masuk", "email tidak masuk", "spam", "tautan hilang", "gagal", "error", "sudah bayar", "sudah lunas", "padahal lunas", "terpotong"],
      j: "Tunggu 1–2 menit, lalu cek email (termasuk folder <b>spam/promosi</b>). Kalau tetap belum ada, kirim <b>kode pesananmu</b> ke WhatsApp kami. Uangmu aman — kalau karena kendala di pihak kami tautannya tidak sampai dalam 1×24 jam, dana dikembalikan penuh." },
    { id: "ubah", t: "Bisa mengubah isinya setelah bayar?",
      k: ["ubah", "edit", "ganti", "revisi", "salah ketik", "typo", "salah", "perbaiki", "koreksi", "ganti foto", "tukar"],
      j: "Bisa. Kamu dapat <b>tautan edit pribadi</b> (di layar dan di email) yang berlaku <b>3 hari</b> dan boleh dipakai berkali-kali. Perubahan langsung berlaku di tautan surat yang sama. Isi suratmu dipasang persis seperti yang kamu tulis, jadi baca ulang sebelum menyimpan, ya." },
    { id: "lama", t: "Suratnya bisa dibuka sampai kapan?",
      k: ["sampai kapan", "selamanya", "masa", "berlaku", "aktif", "kedaluwarsa", "expired", "dihapus", "hapus", "2 bulan", "dua bulan", "perpanjang", "permanen"],
      j: "Surat bisa dibuka selama <b>2 bulan</b> sejak dibayar. 14 hari sebelum masanya habis, kami kirim email pengingat. Mau lebih lama? <b>Perpanjang 2 bulan</b> lewat tautan di email itu atau di halaman edit — bisa berkali-kali. Kalau tidak diperpanjang, isi dan fotonya dihapus untuk menjaga privasi kalian." },
    { id: "refund", t: "Bisa dibatalkan atau refund?",
      k: ["refund", "batal", "pembatalan", "uang kembali", "kembalikan", "pengembalian", "cancel"],
      j: "Setelah pembayaran berhasil, pesanan tidak bisa dibatalkan karena suratnya langsung dibuat dari isimu. Kalau kesalahannya di pihak kami — tautan tidak sampai dalam 1×24 jam, atau surat rusak dan tidak bisa kami perbaiki — dana <b>dikembalikan penuh</b>. Makanya ada contoh gratis untuk dicoba dulu." },
    { id: "kirim", t: "Cara mengirim suratnya ke dia?",
      k: ["kirim", "cara kirim", "share", "bagikan", "kasih", "ngirim", "whatsapp dia", "qr", "barcode", "scan", "pindai", "cetak", "print"],
      j: "Setelah bayar kamu dapat satu tautan. Kirim lewat <b>WhatsApp</b> (ada tombolnya), salin tautannya, atau buat <b>kode QR berbentuk hati atau amplop</b> — gambarnya bisa dikirim atau dicetak dan diselipkan di kado. Dia cukup memindainya dengan kamera HP." },
    { id: "hp", t: "Dia perlu pasang aplikasi?",
      k: ["aplikasi", "install", "pasang", "download", "unduh", "hp", "iphone", "android", "browser", "laptop", "buka di"],
      j: "Tidak perlu. Suratnya halaman web biasa — dibuka langsung di browser HP mana pun (iPhone atau Android) atau laptop. Paling nyaman dibuka di HP dengan suara menyala." },
    { id: "dibuka", t: "Aku bisa tahu kalau suratnya sudah dibuka?",
      k: ["sudah dibuka", "dibuka", "dibaca", "notifikasi", "tahu kalau", "kabar", "read"],
      j: "Bisa. Saat suratnya <b>pertama kali dibuka</b>, kami kirim satu email ke kamu. Bukaan dari HP yang kamu pakai memesan tidak dihitung, jadi mengecek suratmu sendiri tidak memicu kabar itu." },
    { id: "lagu", t: "Bisa pakai lagu sendiri?",
      k: ["lagu", "musik", "mp3", "m4a", "spotify", "youtube", "suara", "audio"],
      j: "Bisa. Unggah berkas <b>MP3 atau M4A</b> milikmu (maks. 10 MB) dan pilih detik mulai–selesainya. Kalau dikosongkan, surat memakai kotak musik lembut bawaan Foreverse. Tautan Spotify/YouTube belum bisa dipakai." },
    { id: "foto", t: "Berapa foto yang bisa dipasang?",
      k: ["foto", "gambar", "berapa foto", "ukuran foto", "video", "jumlah foto"],
      j: "Tergantung tema — jumlahnya tertulis di formulir pesan. Fotonya dikecilkan otomatis di HP-mu sebelum dikirim, jadi tidak perlu diedit dulu. Video belum didukung." },
    { id: "tema", t: "Bedanya tiap tema apa?",
      k: ["tema", "beda", "bedanya", "pilih tema", "rekomendasi", "bagus", "momen", "ulang tahun", "anniversary", "ldr", "wisuda"],
      j: "Tiap tema adalah dunia kecil yang dimainkan — ada yang digulir, ada yang dijelajah pakai joystick, ada tur ruangan. Isi tulisanmu dibawa masuk ke dalam permainannya. Cara terbaik memilih: buka <b>contohnya gratis</b> di beranda, lalu pilih yang paling terasa seperti kalian." },
    { id: "coba", t: "Bisa lihat contohnya dulu?",
      k: ["contoh", "demo", "coba", "lihat dulu", "preview", "pratinjau", "sampel"],
      j: "Bisa. Setiap tema punya contoh lengkap yang bisa dimainkan gratis di beranda. Saat mengisi formulir pun ada <b>pratinjau langsung</b> yang berubah sesuai isianmu." },
    { id: "privasi", t: "Data dan fotoku aman?",
      k: ["aman", "privasi", "data", "rahasia", "orang lain", "tebak", "bocor", "pribadi"],
      j: "Tautan surat memakai kode acak yang panjang, jadi tidak bisa ditebak. Mau lebih aman lagi? Pasang <b>kunci pembuka</b> (PIN, pertanyaan rahasia, atau tanggal). Data hanya dipakai untuk membuat dan mengirim suratmu, tidak dijual atau dibagikan, dan dihapus otomatis setelah masa simpannya habis. Rinciannya di Kebijakan Privasi." },
    { id: "jadwal", t: "Bisa dijadwalkan terbuka jam 00.00?",
      k: ["jadwal", "terjadwal", "tengah malam", "jam 12", "00 00", "0000", "kirim otomatis", "nanti"],
      j: "Bisa, pakai <b>kunci waktu</b> di formulir. Tautannya boleh kamu kirim lebih dulu — sebelum waktunya, dia hanya melihat hitung mundur, lalu suratnya terbuka tepat di jam yang kamu pilih (WIB)." },
    { id: "pengirim", t: "Dia tahu ini dari siapa?",
      k: ["anonim", "nama pengirim", "siapa pengirim", "rahasia nama", "tanpa nama", "dari siapa"],
      j: "Nama pengirim yang tampil adalah nama yang <b>kamu tulis sendiri</b> di formulir — boleh nama asli, nama panggilan, atau sebutan sayang. Beberapa tema (misalnya Kasus Pengirim Tanpa Nama) memang dirancang supaya dia menebak dulu." }
    ,{ id: "kunci", t: "Suratnya bisa dikunci?",
      k: ["kunci", "pin", "password", "sandi", "kata sandi", "pertanyaan rahasia", "dikunci", "gembok", "lock"],
      j: "Bisa. Di formulir ada <b>kunci pembuka</b>: PIN 4–6 angka, pertanyaan rahasia, atau tanggal penting kalian — plus petunjuk kalau perlu. Jawabannya dicek di server, jadi tidak bisa diintip. Bisa juga ditambah <b>kunci waktu</b> supaya baru terbuka di jam tertentu." },
    { id: "ingat", t: "Bisa diingatkan tahun depan?",
      k: ["ingetin", "ingatkan", "pengingat", "reminder", "tahun depan", "lupa"],
      j: "Bisa, untuk surat ulang tahun dan anniversary. Setelah bayar, ketuk <b>Ingetin aku</b> — kami kirim satu email 7 hari sebelum harinya tahun depan. Yang disimpan hanya tanggal, bulan, dan nama panggilannya, dan bisa dihapus kapan saja." },
    { id: "vera", t: "Vera itu siapa?",
      k: ["vera", "kamu siapa", "siapa kamu", "bot", "robot", "ai", "manusia", "admin", "chatgpt"],
      j: "Aku Vera, asisten otomatis Foreverse 👋 Aku menjawab dari daftar pertanyaan yang sudah disiapkan tim — bukan AI, dan pertanyaanmu tidak dikirim ke mana-mana. Kalau aku belum bisa bantu, tim kami siap lewat WhatsApp." }
  ];
  var POPULER = ["harga", "jadi", "kunci", "ubah", "kirim"];

  /* ── gaya ── */
  var css =
    ".fvb-tbl{position:fixed;right:16px;bottom:16px;z-index:70;display:inline-flex;align-items:center;gap:9px;border:0;cursor:pointer;" +
    "background:#3B3168;color:#fff;font:600 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:12px 17px 12px 14px;" +
    "border-radius:999px;box-shadow:0 12px 30px rgba(22,22,26,.22);transition:transform .16s ease,opacity .2s ease;-webkit-tap-highlight-color:transparent}" +
    ".fvb-tbl:hover{transform:translateY(-2px)}.fvb-tbl svg{width:34px;height:34px;flex:none;margin:-6px 0 -6px -6px}" +
    ".fvb-ava{width:34px;height:34px;border-radius:50%;flex:none;display:block}.fvb-ava svg{width:100%;height:100%}" +
    ".fvb-tbl.fvb-sembunyi{opacity:0;pointer-events:none}" +
    "@media(max-width:699px){.fvb-tbl{padding:9px}.fvb-tbl svg{margin:0;width:40px;height:40px}.fvb-tbl .fvb-tt{display:none}}" +
    ".fvb-panel{position:fixed;right:16px;bottom:16px;z-index:90;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100dvh - 32px));" +
    "display:flex;flex-direction:column;margin:0;padding:0;box-sizing:border-box;background:#FBFAF7;color:#16161A;border:1px solid #E4E2DC;border-radius:20px;overflow:hidden;" +
    "box-shadow:0 24px 60px rgba(22,22,26,.25);font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}" +
    ".fvb-panel[hidden]{display:none}" +
    "@media(max-width:520px){.fvb-panel{right:0;bottom:0;width:100vw;height:min(88dvh,640px);border-radius:20px 20px 0 0;border-bottom:0}}" +
    ".fvb-kepala{display:flex;align-items:center;gap:10px;padding:14px 14px 12px 16px;background:#3B3168;color:#fff}" +
    ".fvb-kepala b{display:block;font-size:15px}.fvb-kepala small{display:block;font-size:12px;opacity:.75}" +
    ".fvb-tutup{margin-left:auto;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:20px;cursor:pointer}" +
    ".fvb-isi{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}" +
    ".fvb-b{max-width:88%;padding:10px 13px;border-radius:16px;font-size:14.5px;word-wrap:break-word}" +
    ".fvb-b.kami{background:#fff;border:1px solid #E4E2DC;border-bottom-left-radius:5px;align-self:flex-start}" +
    ".fvb-b.kamu{background:#EEEBF7;color:#2C2450;border-bottom-right-radius:5px;align-self:flex-end}" +
    ".fvb-b a{color:#3B3168;font-weight:600}" +
    ".fvb-pil{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:100%}" +
    ".fvb-pil button,.fvb-pil a{font:inherit;font-size:13px;padding:7px 11px;border-radius:999px;border:1px solid #CFCAE6;background:#fff;color:#3B3168;" +
    "cursor:pointer;text-decoration:none;min-height:34px;display:inline-flex;align-items:center}" +
    ".fvb-pil .wa{border-color:#25D366;color:#128C4A}" +
    ".fvb-kaki{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #E4E2DC;background:#fff}" +
    ".fvb-kaki input{flex:1;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border:1px solid #E4E2DC;border-radius:12px;background:#FBFAF7;color:inherit}" +
    ".fvb-kaki button{border:0;border-radius:12px;background:#E8734A;color:#fff;font-weight:600;font-size:14px;padding:0 14px;cursor:pointer;min-width:64px}" +
    ".fvb-kurang{align-self:flex-start;border:0;background:none;color:#83808C;font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;padding:0 4px}" +
    ".fvb-ketik{align-self:flex-start;color:#83808C;font-size:13px;padding:2px 6px}";
  var gaya = document.createElement("style");
  gaya.textContent = css;
  document.head.appendChild(gaya);

  /* Avatar Vera: amplop kecil bermata — gaya "benda yang diberi wajah" khas tema Foreverse */
  var VERA = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#FAF3E8"/>' +
    '<rect x="9" y="14" width="30" height="22" rx="5" fill="#E8A5B0"/><path d="M10 16l14 11 14-11" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>' +
    '<circle cx="19" cy="29" r="1.8" fill="#2C2450"/><circle cx="29" cy="29" r="1.8" fill="#2C2450"/>' +
    '<path d="M21.5 32.2q2.5 2 5 0" fill="none" stroke="#2C2450" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="15.5" cy="31.5" r="1.6" fill="#E8734A" opacity=".55"/><circle cx="32.5" cy="31.5" r="1.6" fill="#E8734A" opacity=".55"/>' +
    '<path d="M34 8.5c-.5 0-3.5-2-3.5-4 0-1 .7-1.7 1.6-1.7.7 0 1.3.4 1.6.9.3-.5.9-.9 1.6-.9.9 0 1.6.7 1.6 1.7 0 2-3 4-3.3 4z" fill="#E8734A"/></svg>';
  var IKON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
             '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3M12 16.5h.01"/></svg>';

  var tbl = document.createElement("button");
  tbl.type = "button";
  tbl.className = "fvb-tbl";
  tbl.setAttribute("aria-label", "Tanya Vera, asisten Foreverse");
  tbl.setAttribute("aria-expanded", "false");
  tbl.innerHTML = VERA + '<span class="fvb-tt">Tanya Vera</span>';

  var panel = document.createElement("div");   /* div, bukan section: gaya section halaman tidak boleh ikut */
  panel.className = "fvb-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Tanya Vera");
  panel.innerHTML =
    '<div class="fvb-kepala"><span class="fvb-ava">' + VERA + '</span>' +
      '<div><b>Vera</b><small>Asisten Foreverse · menjawab otomatis</small></div>' +
      '<button class="fvb-tutup" type="button" aria-label="Tutup">×</button></div>' +
    '<div class="fvb-isi" aria-live="polite"></div>' +
    '<form class="fvb-kaki"><input type="text" placeholder="Ketik pertanyaanmu…" aria-label="Pertanyaan" maxlength="200" enterkeyhint="send">' +
      '<button type="submit">Kirim</button></form>';

  function pasang() {
    document.body.appendChild(tbl);
    document.body.appendChild(panel);
    /* sembunyikan tombol saat bagian kontak di beranda terlihat (ada tombol WA di sana) */
    var kontak = document.getElementById("kontak");
    if (kontak && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { tbl.classList.toggle("fvb-sembunyi", es[0].isIntersecting && panel.hidden); },
        { threshold: .25 }).observe(kontak);
    }
  }
  if (document.body) pasang(); else document.addEventListener("DOMContentLoaded", pasang);

  var isi = panel.querySelector(".fvb-isi");
  var masukan = panel.querySelector("input");
  var sudahSapa = false;

  function gulir() { isi.scrollTop = isi.scrollHeight; }
  function gelembung(html, siapa) {
    var b = document.createElement("div");
    b.className = "fvb-b " + siapa;
    if (siapa === "kamu") b.textContent = html; else b.innerHTML = html;
    isi.appendChild(b); gulir();
    return b;
  }
  function wa(teks) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(teks); }
  function pilihan(ids, denganWa, teksWa) {
    var p = document.createElement("div");
    p.className = "fvb-pil";
    ids.forEach(function (id) {
      var q = TANYA.filter(function (x) { return x.id === id; })[0];
      if (!q) return;
      var b = document.createElement("button");
      b.type = "button"; b.textContent = q.t; b.dataset.id = id;
      p.appendChild(b);
    });
    if (denganWa) {
      var a = document.createElement("a");
      a.className = "wa"; a.target = "_blank"; a.rel = "noopener";
      a.href = wa(teksWa || "Halo Foreverse, saya mau tanya.");
      a.textContent = "Tanya lewat WhatsApp";
      p.appendChild(a);
    }
    isi.appendChild(p); gulir();
  }

  function sapa() {
    if (sudahSapa) return;
    sudahSapa = true;
    gelembung("Hai, Forevers! Aku Vera 👋 Ini yang paling sering ditanyakan. Pilih salah satu, atau ketik pertanyaanmu sendiri.", "kami");
    pilihan(POPULER, false);
  }

  /* ── pencocokan pertanyaan ──
     Pertanyaan dipecah jadi kata, bahasa gaul dibakukan (gak → tidak, link →
     tautan, gmn → bagaimana), akhiran -nya/-kah/-lah dibuang, lalu tiap
     kata dicocokkan dengan kata kunci secara longgar: sama persis, salah
     satu awalan yang lain (min. 4 huruf), atau beda satu huruf (salah ketik).
     Kalau yakin → langsung dijawab; kalau ragu → ditawarkan 2–3 pertanyaan
     yang paling mirip ("Mungkin maksudmu…"); kalau sama sekali tidak ada
     yang mirip → diarahkan ke WhatsApp/email. */
  var BAKU = {
    gak: "tidak", ga: "tidak", gk: "tidak", nggak: "tidak", ngga: "tidak", enggak: "tidak", engga: "tidak", tdk: "tidak", ndak: "tidak",
    gmn: "bagaimana", gimana: "bagaimana", gmna: "bagaimana", bgmn: "bagaimana", caranya: "cara",
    brp: "berapa", berapaan: "berapa", udh: "sudah", udah: "sudah", sdh: "sudah", dah: "sudah", blm: "belum", blum: "belum",
    bs: "bisa", bsa: "bisa", yg: "yang", dgn: "dengan", krn: "karena", tp: "tapi", kalo: "kalau", klo: "kalau", kl: "kalau",
    link: "tautan", linknya: "tautan", url: "tautan", lnk: "tautan", gimanakah: "bagaimana", ngasih: "kasih", ngirim: "kirim", ngirimin: "kirim", kasihkan: "kasih", dibaca: "baca", membaca: "baca",
    expire: "expired", exp: "expired", kadaluarsa: "kedaluwarsa", kadaluwarsa: "kedaluwarsa",
    pacar: "dia", ayang: "dia", doi: "dia", pasangan: "dia", cewek: "dia", cowok: "dia",
    hp: "hp", handphone: "hp", ponsel: "hp", gratisan: "gratis", ongkir: "biaya", duit: "uang", wa: "whatsapp", whatsap: "whatsapp"
  };
  var BUANG = { kak: 1, ka: 1, kakak: 1, min: 1, admin: 1, mimin: 1, sis: 1, gan: 1, bang: 1, mas: 1, mbak: 1, dong: 1, ya: 1, yah: 1,
    nih: 1, sih: 1, deh: 1, kok: 1, apa: 1, apakah: 1, ada: 1, aku: 1, saya: 1, gue: 1, gw: 1, ini: 1, itu: 1, nya: 1, mau: 1, tanya: 1,
    halo: 1, hai: 1, hi: 1, permisi: 1, the: 1, di: 1, ke: 1, dan: 1, atau: 1, untuk: 1, buat: 1, yang: 1, kalau: 1, tolong: 1 };
  /* kata yang muncul di banyak topik: tidak dihitung untuk kecocokan sebagian */
  var UMUM = { tidak: 1, bisa: 1, sudah: 1, belum: 1, berapa: 1, dibuka: 1, buka: 1, cara: 1, lama: 1, masih: 1, surat: 1,
    tautan: 1, email: 1, bayar: 1, setelah: 1, ganti: 1, kirim: 1, bagaimana: 1, dari: 1, siapa: 1 };
  var TAMBAH = {
    harga: ["15rb", "15 ribu", "termasuk", "sudah semua", "harganya", "price", "pricelist", "bayarnya berapa", "kena berapa", "total"],
    bayar: ["e wallet", "ewallet", "m banking", "mbanking", "cash", "cod", "pembayaran"],
    jadi: ["berapa menit", "lama tidak", "otomatis", "instan", "admin manual"],
    belum: ["sudah transfer", "belum ada", "tidak ada email", "belum terima", "tidak terkirim", "pending", "nyangkut", "kepotong"],
    ubah: ["edit foto", "setelah bayar", "update", "salah tulis", "salah nama", "salah foto", "keliru", "rubah", "diganti"],
    lama: ["beberapa bulan", "hilang sendiri", "masih bisa dibuka", "expired", "kedaluwarsa", "hangus", "batas waktu", "berapa lama bisa dibuka", "bisa dibuka lagi", "tahun depan", "simpan"],
    refund: ["dana kembali", "balikin uang", "tidak jadi"],
    kirim: ["kasih", "qr code", "kode qr", "kirimnya", "caranya kirim", "lewat apa", "ig", "instagram", "dm"],
    hp: ["perlu apa", "dibuka pakai apa", "ios", "pc", "komputer"],
    dibuka: ["baca", "sudah baca", "dikabari", "sudah buka", "dia buka", "udah dibuka", "notif", "pemberitahuan", "seen"],
    lagu: ["ganti lagu", "ganti musik", "backsound", "lagunya", "playlist", "upload lagu"],
    foto: ["fotonya", "berapa gambar", "upload foto", "resolusi"],
    tema: ["template", "desain", "model", "pilihan", "yang mana"],
    coba: ["gratis", "trial", "free"],
    privasi: ["keamanan", "orang lain bisa buka", "disebar", "dijual"],
    jadwal: ["timer", "tepat waktu", "jam tertentu", "hari h"],
    pengirim: ["namaku", "nama aku", "nama saya", "nama pengirim", "ketahuan", "identitas", "nama samaran"]
  };
  TANYA.forEach(function (q) { if (TAMBAH[q.id]) q.k = q.k.concat(TAMBAH[q.id]); });

  function kata(s) {
    var t = String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ").split(/\s+/);
    var hasil = [];
    t.forEach(function (w) {
      if (!w) return;
      if (BAKU[w]) w = BAKU[w];
      else {
        var w2 = w.replace(/(nya|kah|lah|pun)$/, "");
        if (w2.length >= 3) w = w2;
        if (BAKU[w]) w = BAKU[w];
      }
      if (!BUANG[w]) hasil.push(w);
    });
    return hasil;
  }
  function jarak1(a, b) {                       // beda paling banyak satu huruf?
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, beda = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++beda > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return beda + (a.length - i) + (b.length - j) <= 1;
  }
  function samaKata(a, b) {
    if (a === b) return true;
    var p = a.length < b.length ? a : b, q = a.length < b.length ? b : a;
    if (p.length >= 4 && q.indexOf(p) === 0) return true;
    return p.length >= 5 && jarak1(a, b);
  }
  var KUNCI = TANYA.map(function (q) {
    var lihat = {};
    return q.k.map(function (k) { return kata(k); }).filter(function (k) {
      var id = k.join(" ");
      if (!k.length || lihat[id]) return false;     // "foto" dan "fotonya" dihitung sekali
      return (lihat[id] = true);
    });
  });
  function nilaiSemua(teks) {
    var t = kata(teks);
    return TANYA.map(function (q, i) {
      var n = 0, sebagian = 0;
      KUNCI[i].forEach(function (k) {
        var semua = k.every(function (w) { return t.some(function (x) { return samaKata(x, w); }); });
        if (semua) n += k.length > 1 ? 3 : 2;
        else if (k.length > 1 && k.some(function (w) {
          return w.length >= 4 && !UMUM[w] && t.some(function (x) { return samaKata(x, w); }); })) sebagian = 1;
      });
      /* kecocokan sebagian paling banyak bernilai 1 — tidak pernah cukup
         untuk menjawab sendiri, hanya untuk saran "Mungkin maksudmu…" */
      return { q: q, n: n + sebagian };
    }).sort(function (a, b) { return b.n - a.n; });
  }
  function cocokkan(teks) {
    var r = nilaiSemua(teks);
    return r[0].n >= 2 ? r[0].q : null;
  }
  function jawab(q, saran) {
    var ketik = document.createElement("div");
    ketik.className = "fvb-ketik"; ketik.textContent = "mengetik…";
    isi.appendChild(ketik); gulir();
    setTimeout(function () {
      ketik.remove();
      if (q) {
        gelembung(q.j, "kami");
        var lain = POPULER.concat(TANYA.map(function (x) { return x.id; }))
          .filter(function (id, i, a) { return id !== q.id && a.indexOf(id) === i; }).slice(0, 3);
        var kp = document.createElement("button");
        kp.type = "button"; kp.className = "fvb-kurang"; kp.textContent = "Jawaban ini kurang pas";
        kp.addEventListener("click", function () {
          kp.remove();
          gelembung("Maaf ya, jawabanku belum pas 🙏 Tim kami bisa bantu lebih lengkap lewat WhatsApp.", "kami");
          pilihan([], true, "Halo Foreverse, saya mau tanya soal: " + q.t + " — ");
        });
        isi.appendChild(kp);
        pilihan(lain, true, "Halo Foreverse, saya mau tanya soal: " + q.t);
      } else if (saran && saran.length) {
        gelembung("Aku belum yakin maksudnya. Mungkin salah satu ini?", "kami");
        pilihan(saran, true, "Halo Foreverse, saya mau tanya: ");
      } else {
        gelembung("Maaf, aku belum punya jawaban untuk itu. Tim kami bisa bantu langsung lewat WhatsApp, atau email ke <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>.", "kami");
        pilihan(["harga", "belum", "ubah"], true, "Halo Foreverse, saya mau tanya: ");
      }
    }, 420);
  }

  function buka() {
    panel.hidden = false; tbl.classList.add("fvb-sembunyi"); tbl.setAttribute("aria-expanded", "true");
    sapa();
    if (window.matchMedia("(min-width:700px)").matches) masukan.focus();
  }
  function tutup() {
    panel.hidden = true; tbl.classList.remove("fvb-sembunyi"); tbl.setAttribute("aria-expanded", "false");
    tbl.focus();
  }
  tbl.addEventListener("click", buka);
  panel.querySelector(".fvb-tutup").addEventListener("click", tutup);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) tutup(); });

  isi.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-id]"); if (!b) return;
    var q = TANYA.filter(function (x) { return x.id === b.dataset.id; })[0];
    gelembung(q.t, "kamu");
    jawab(q);
  });
  panel.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = masukan.value.trim(); if (!t) return;
    masukan.value = "";
    gelembung(t, "kamu");
    var q = cocokkan(t);
    if (q) jawab(q);
    else jawab(null, nilaiSemua(t).filter(function (x) { return x.n >= 1; }).slice(0, 3).map(function (x) { return x.q.id; }));
  });

  /* untuk uji otomatis */
  window.__fvCocokkan = function (t) { var q = cocokkan(t); return q ? q.id : null; };
  window.__fvNilai = function (t) { return nilaiSemua(t).slice(0, 3).map(function (x) { return x.q.id + ":" + x.n; }).join(" "); };
})();
