/* FOREVERSE · asal pengunjung (otomatis, tanpa bertanya ke pembeli)
   Dipasang di semua halaman situs yang bukan surat: index.html (beranda,
   /template, /tema/<id>), halaman momen, pesan.html, selesai.html, kreator,
   syarat, privasi. Kunjungan PERTAMA dalam 30 hari yang diingat, di
   peramban pembeli saja (localStorage "fv-sumber"). Formulir mengirimnya
   bersama draf. Yang disimpan hanya jenis sumber + sedikit rincian
   (nama kampanye atau nama situs perujuk), tidak ada data pribadi.

   Urutan penentuan: ?utm_source / ?ref / ?kreator → peramban di dalam
   aplikasi (Instagram, TikTok, …) → situs perujuk → "langsung".        */
(function () {
  "use strict";
  var KUNCI = "fv-sumber", UMUR = 30 * 86400000;
  var JENIS = ["instagram", "tiktok", "whatsapp", "facebook", "google", "x", "yt",
               "threads", "pinterest", "kreator", "surat", "email", "lain", "langsung"];

  function rapi(s, n) { return String(s || "").toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, n || 40); }

  function dariNama(s) {
    s = rapi(s);
    if (!s) return "";
    if (/^(ig|insta|instagram)/.test(s)) return "instagram";
    if (/^(tt|tiktok)/.test(s)) return "tiktok";
    if (/^(wa|whatsapp)/.test(s)) return "whatsapp";
    if (/^(fb|facebook)/.test(s)) return "facebook";
    if (/^(yt|youtube)/.test(s)) return "yt";
    if (/^(twitter|x)$/.test(s)) return "x";
    if (/^google/.test(s)) return "google";
    if (/^threads/.test(s)) return "threads";
    if (/^pinterest/.test(s)) return "pinterest";
    if (/^(email|newsletter|resend)/.test(s)) return "email";
    if (s === "surat") return "surat";
    return JENIS.indexOf(s) >= 0 ? s : "lain";
  }

  function dariHost(h) {
    h = String(h || "").toLowerCase().replace(/^www\./, "");
    if (/(^|\.)instagram\.com$|com\.instagram/.test(h)) return "instagram";
    if (/(^|\.)tiktok\.com$|musically|zhiliaoapp|com\.ss\.android/.test(h)) return "tiktok";
    if (/(^|\.)(whatsapp\.com|wa\.me)$|com\.whatsapp/.test(h)) return "whatsapp";
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$|com\.facebook/.test(h)) return "facebook";
    if (/(^|\.)threads\.net$|com\.instagram\.barcelona/.test(h)) return "threads";
    if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(h)) return "x";
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return "yt";
    if (/(^|\.)pinterest\./.test(h)) return "pinterest";
    if (/(^|\.)google\./.test(h) || /com\.google/.test(h)) return "google";
    if (/(^|\.)(mail\.google\.com|outlook\.live\.com|mail\.yahoo\.com)$/.test(h)) return "email";
    return h ? "lain" : "";
  }

  function tentukan() {
    var q = new URLSearchParams(location.search);
    var kreator = rapi(q.get("kreator"), 20);
    if (kreator) return { s: "kreator", r: kreator };
    var utm = q.get("utm_source") || q.get("ref") || q.get("src");
    if (utm) return { s: dariNama(utm), r: rapi(q.get("utm_campaign") || q.get("utm_medium") || utm) };

    var ua = navigator.userAgent || "";
    if (/Instagram/.test(ua)) return { s: "instagram", r: "aplikasi" };
    if (/musical_ly|TikTok|BytedanceWebview|trill/i.test(ua)) return { s: "tiktok", r: "aplikasi" };
    if (/FBAN|FBAV|FB_IAB/.test(ua)) return { s: "facebook", r: "aplikasi" };
    if (/Threads/.test(ua)) return { s: "threads", r: "aplikasi" };

    var ref = document.referrer || "";
    if (!ref) return { s: "langsung", r: "" };
    var u;
    try { u = new URL(ref); } catch (_) { return { s: "langsung", r: "" }; }
    if (u.host === location.host) {
      /* datang dari surat orang lain di situs ini */
      if (/^\/s\//.test(u.pathname)) return { s: "surat", r: "" };
      return null;   // pindah halaman di dalam situs: bukan kunjungan baru
    }
    var host = u.protocol === "android-app:" ? u.host : u.hostname;
    return { s: dariHost(host) || "lain", r: rapi(host.replace(/^www\./, "")) };
  }

  try {
    var lama = JSON.parse(localStorage.getItem(KUNCI) || "null");
    if (lama && lama.w && Date.now() - lama.w < UMUR) return;
    var baru = tentukan();
    if (!baru) return;
    baru.w = Date.now();
    localStorage.setItem(KUNCI, JSON.stringify(baru));
  } catch (_) { /* penyimpanan peramban tidak tersedia: lewati */ }
})();
