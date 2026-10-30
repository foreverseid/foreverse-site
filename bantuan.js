/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · Tanya Foreverse (tombol bantuan mengambang)

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
      k: ["kapan", "berapa lama", "jadi", "selesai", "dikirim", "sampai", "proses", "langsung", "nunggu", "menunggu"],
      j: "Beberapa saat setelah pembayaran berhasil, tautan surat langsung <b>muncul di layar</b> dan <b>dikirim ke email</b> yang kamu isi. Tidak perlu menunggu admin — semuanya otomatis." },
    { id: "belum", t: "Sudah bayar, tapi tautannya belum muncul",
      k: ["belum muncul", "belum masuk", "belum dapat", "tidak muncul", "gak muncul", "ga muncul", "nggak muncul", "tidak masuk", "email tidak", "spam", "hilang", "gagal", "error", "sudah bayar", "udah bayar", "terpotong"],
      j: "Tunggu 1–2 menit, lalu cek email (termasuk folder <b>spam/promosi</b>). Kalau tetap belum ada, kirim <b>kode pesananmu</b> ke WhatsApp kami. Uangmu aman — kalau karena kendala di pihak kami tautannya tidak sampai dalam 1×24 jam, dana dikembalikan penuh." },
    { id: "ubah", t: "Bisa mengubah isinya setelah bayar?",
      k: ["ubah", "edit", "ganti", "revisi", "salah ketik", "typo", "salah", "perbaiki", "koreksi", "ganti foto", "tukar"],
      j: "Bisa. Kamu dapat <b>tautan edit pribadi</b> (di layar dan di email) yang berlaku <b>3 hari</b> dan boleh dipakai berkali-kali. Perubahan langsung berlaku di tautan surat yang sama. Isi suratmu dipasang persis seperti yang kamu tulis, jadi baca ulang sebelum menyimpan, ya." },
    { id: "lama", t: "Suratnya bisa dibuka sampai kapan?",
      k: ["sampai kapan", "selamanya", "masa", "berlaku", "aktif", "kedaluwarsa", "expired", "dihapus", "hapus", "6 bulan", "enam bulan", "permanen"],
      j: "Surat bisa dibuka selama <b>6 bulan</b> sejak dibayar. 14 hari sebelum masanya habis, kami kirim email pengingat supaya kamu sempat menyimpan foto atau kalimat yang ingin dikenang. Setelah itu isi dan fotonya dihapus untuk menjaga privasi kalian." },
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
      j: "Tautan surat memakai kode acak yang panjang, jadi tidak bisa ditebak. Data hanya dipakai untuk membuat dan mengirim suratmu, tidak dijual atau dibagikan, dan dihapus otomatis setelah 6 bulan. Rinciannya di Kebijakan Privasi." },
    { id: "jadwal", t: "Bisa dijadwalkan terbuka jam 00.00?",
      k: ["jadwal", "terjadwal", "tengah malam", "jam 12", "00 00", "0000", "kirim otomatis", "nanti"],
      j: "Belum ada fitur jadwal. Tautannya langsung aktif setelah dibayar, jadi kamu bebas mengirimnya tepat tengah malam sendiri. Dia tidak akan tahu isinya sebelum kamu kirim." },
    { id: "pengirim", t: "Dia tahu ini dari siapa?",
      k: ["anonim", "nama pengirim", "siapa pengirim", "rahasia nama", "tanpa nama", "dari siapa"],
      j: "Nama pengirim yang tampil adalah nama yang <b>kamu tulis sendiri</b> di formulir — boleh nama asli, nama panggilan, atau sebutan sayang. Beberapa tema (misalnya Kasus Pengirim Tanpa Nama) memang dirancang supaya dia menebak dulu." }
  ];
  var POPULER = ["harga", "jadi", "ubah", "kirim", "lama"];

  /* ── gaya ── */
  var css =
    ".fvb-tbl{position:fixed;right:16px;bottom:16px;z-index:70;display:inline-flex;align-items:center;gap:9px;border:0;cursor:pointer;" +
    "background:#3B3168;color:#fff;font:600 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:12px 17px 12px 14px;" +
    "border-radius:999px;box-shadow:0 12px 30px rgba(22,22,26,.22);transition:transform .16s ease,opacity .2s ease;-webkit-tap-highlight-color:transparent}" +
    ".fvb-tbl:hover{transform:translateY(-2px)}.fvb-tbl svg{width:20px;height:20px;flex:none}" +
    ".fvb-tbl.fvb-sembunyi{opacity:0;pointer-events:none}" +
    "@media(max-width:699px){.fvb-tbl{padding:14px}.fvb-tbl .fvb-tt{display:none}}" +
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
    ".fvb-ketik{align-self:flex-start;color:#83808C;font-size:13px;padding:2px 6px}";
  var gaya = document.createElement("style");
  gaya.textContent = css;
  document.head.appendChild(gaya);

  var IKON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
             '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.8A8 8 0 1 1 21 12z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3M12 16.5h.01"/></svg>';

  var tbl = document.createElement("button");
  tbl.type = "button";
  tbl.className = "fvb-tbl";
  tbl.setAttribute("aria-label", "Tanya Foreverse");
  tbl.setAttribute("aria-expanded", "false");
  tbl.innerHTML = IKON + '<span class="fvb-tt">Ada pertanyaan?</span>';

  var panel = document.createElement("div");   /* div, bukan section: gaya section halaman tidak boleh ikut */
  panel.className = "fvb-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Tanya Foreverse");
  panel.innerHTML =
    '<div class="fvb-kepala">' + IKON.replace("<svg ", '<svg width="22" height="22" ') +
      '<div><b>Tanya Foreverse</b><small>Jawaban cepat, kapan saja</small></div>' +
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
    gelembung("Hai! Ada yang bisa dibantu? Pilih pertanyaan di bawah, atau ketik sendiri.", "kami");
    pilihan(POPULER, false);
  }

  function rapikan(s) {
    return " " + String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  }
  function cocokkan(teks) {
    var t = rapikan(teks), terbaik = null, nilai = 0;
    TANYA.forEach(function (q) {
      var n = 0;
      q.k.forEach(function (k) {
        var kk = rapikan(k);
        if (t.indexOf(kk) >= 0) n += kk.trim().indexOf(" ") > 0 ? 3 : 2;           // frasa lebih berbobot
        else if (kk.trim().length >= 5 && t.indexOf(" " + kk.trim().slice(0, 5)) >= 0) n += 1; // awalan kata
      });
      if (n > nilai) { nilai = n; terbaik = q; }
    });
    return nilai >= 2 ? terbaik : null;
  }
  function jawab(q) {
    var ketik = document.createElement("div");
    ketik.className = "fvb-ketik"; ketik.textContent = "mengetik…";
    isi.appendChild(ketik); gulir();
    setTimeout(function () {
      ketik.remove();
      if (q) {
        gelembung(q.j, "kami");
        var lain = POPULER.concat(TANYA.map(function (x) { return x.id; }))
          .filter(function (id, i, a) { return id !== q.id && a.indexOf(id) === i; }).slice(0, 3);
        pilihan(lain, true, "Halo Foreverse, saya mau tanya soal: " + q.t);
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
    jawab(cocokkan(t));
  });

  /* untuk uji otomatis */
  window.__fvCocokkan = function (t) { var q = cocokkan(t); return q ? q.id : null; };
})();
