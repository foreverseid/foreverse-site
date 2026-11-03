/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · halaman per momen (untuk Google)

   Satu halaman per momen di alamat yang biasa diketik orang:
   foreverse.id/ulang-tahun, /anniversary, /ldr, dst. Isinya disajikan
   langsung dari server (bukan dirakit JavaScript) supaya mesin pencari
   membaca teksnya utuh. Data tema diambil dari sini; tema yang
   dimatikan di /developer otomatis tidak ditampilkan.

   Menambah momen baru: tambahkan satu entri di MOMEN, lalu daftarkan
   alamatnya di wrangler.jsonc → run_worker_first dan di sitemap.xml.
   ══════════════════════════════════════════════════════════════════ */

const TEMA = {
  "bait": { nama: "Bait", demo: "/bait-demo.html", ringkas: "Satu hari menerima pos: kotak pos dibuka, amplop dirobek pisau surat, perangko umur baru ditempel, kertas tipis diterawang, dan paket balasan ditimbang pas umurnya." },
  "kado-riang": { nama: "Kado Riang", demo: "/kado-riang-demo.html", ringkas: "Riang dan ramai: tiket disobek, lilin umur baru dinyalakan, dan kupon ulang tahun bisa ditukar langsung." },
  "langit-harapan": { nama: "Langit Harapan", demo: "/langit-harapan-demo.html", ringkas: "Hangat dan lembut: galeri kenangan, kuis seberapa kenal, bintang harapan, lalu ditutup surat senja." },
  "peta-perjalanan": { nama: "Peta Perjalanan", demo: "/peta-perjalanan-demo.html", ringkas: "Peta yang digulung dibuka, rute kalian disusun, dan foto disingkap lewat teropong — rutenya memanjang tiap tahun." },
  "rekonstruksi": { nama: "Rekonstruksi Hari Pertama", demo: "/rekonstruksi-demo.html", ringkas: "Hari pertama kalian tinggal sketsa pensil. Dia mengumpulkan bukti dan menyusun jamnya sampai harinya berwarna lagi." },
  "zona-waktu": { nama: "Dua Jendela", demo: "/zona-waktu-demo.html", ringkas: "Layar terbelah dua kota dengan jam aslinya masing-masing — sampai dua kamar itu jadi satu." },
  "graduation-benih": { nama: "Benih & Pohon Cita-Cita", demo: "/graduation-benih-demo.html", ringkas: "Kelulusan sebagai benih yang baru ditanam: disiram, dirawat, tumbuh satu lingkar tahun." },
  "lewat-duluan": { nama: "Dia Lewat Sini Duluan", demo: "/lewat-duluan-demo.html", ringkas: "Satu hari biasa yang dijalani pakai joystick — dan di tiap tempat ternyata kamu sudah lewat duluan." },
  "pasar-malam": { nama: "Pasar Malam", demo: "/pasar-malam-demo.html", ringkas: "Ajakan jalan berbentuk pasar malam satu malam: lempar gelang, gula kapas, bianglala, dan papan lampu untuk menjawab." },
  "confess-kunang": { nama: "Toples Kunang-Kunang", demo: "/confess-kunang-demo.html", ringkas: "Kunang-kunang di toples membawa hal-hal kecil yang kamu simpan tentang dia, sampai pengakuannya terbang jadi hati." },
  "kasus-pengirim": { nama: "Kasus Pengirim Tanpa Nama", demo: "/kasus-pengirim-demo.html", ringkas: "Dia jadi detektif di kafe langganannya, mengumpulkan bukti sampai ketahuan siapa pengirim kertas tanpa nama itu." },
  "getwell-365": { nama: "36,5", demo: "/getwell-365-demo.html", ringkas: "Satu kamar yang panas dan buram. Tiap hal kecil yang kamu lakukan menurunkan suhunya sampai 36,5." },
  "rumah-contoh": { nama: "Rumah Contoh", demo: "/rumah-contoh-demo.html", ringkas: "Tur rumah dari sudut pandang orang pertama. Tiap ruangan menyimpan satu janji, dan di kamar ada kotak cincin." }
};

export const MOMEN = {
  "ulang-tahun": {
    judul: "Kado Ulang Tahun Digital untuk Pacar",
    deskripsi: "Kado ulang tahun digital yang bisa dimainkan: surat interaktif berisi ucapan, foto, dan lagu kalian. Dibuat 5 menit, tautannya langsung jadi.",
    h1: "Kado ulang tahun yang bisa dia mainkan.",
    lede: "Bukan sekadar ucapan di chat. Dia meniup lilin, membuka amplop, memainkan game kecil — lalu sampai di surat yang kamu tulis sendiri.",
    tema: ["bait", "kado-riang", "langit-harapan"],
    ide: [
      "Selamat ulang tahun. Terima kasih sudah jadi bagian paling tenang dari hariku.",
      "Umurmu nambah satu, sabarku ke kamu juga. Semoga tahun ini lebih ramah sama kamu.",
      "Aku nggak bisa kasih semua yang kamu mau, tapi aku bisa terus ada di tiap ulang tahunmu."
    ],
    faq: [
      ["Bisa dikirim tepat jam 12 malam?", "Bisa. Pakai kunci waktu: suratnya baru terbuka di jam yang kamu pilih, dengan hitung mundur sebelum waktunya."],
      ["Umurnya bisa disembunyikan?", "Bisa. Di formulir ada pilihan untuk tidak menampilkan umur."],
      ["Fotonya berapa?", "Tergantung tema, biasanya 3–4 foto. Semuanya kamu pilih sendiri."]
    ]
  },
  "anniversary": {
    judul: "Kado Anniversary Digital untuk Pacar",
    deskripsi: "Kado anniversary digital: surat interaktif tentang perjalanan kalian, lengkap dengan foto, tanggal jadian, dan pesan pribadi.",
    h1: "Untuk hari jadi kalian, ceritakan ulang perjalanannya.",
    lede: "Tanggal jadian, tempat-tempat yang pernah kalian datangi, foto-foto yang cuma kalian yang paham — dirangkai jadi satu surat yang dia jelajahi sendiri.",
    tema: ["peta-perjalanan", "rekonstruksi"],
    ide: [
      "Sudah sekian hari, dan aku masih memilih kamu setiap paginya.",
      "Terima kasih sudah bertahan di hari-hari yang nggak gampang. Ayo lanjut jalan.",
      "Hari pertama itu masih aku ingat sampai jam-jamnya."
    ],
    faq: [
      ["Jumlah harinya dihitung otomatis?", "Ya. Isi tanggal jadian, jumlah hari bersama dihitung saat surat dibuka. Bisa juga disembunyikan."],
      ["Bisa untuk anniversary pernikahan?", "Bisa. Pilih jenis hari jadinya di formulir."],
      ["Bisa diingatkan tahun depan?", "Bisa. Pakai \"Ingetin aku\" di halaman selesai — kami kirim satu email seminggu sebelum harinya."]
    ]
  },
  "ldr": {
    judul: "Kado untuk Pacar LDR — Surat Digital Dua Kota",
    deskripsi: "Kado untuk pacar LDR: surat digital yang menampilkan jam asli dua kota kalian, lengkap dengan foto dan pesan. Tinggal kirim tautannya.",
    h1: "Untuk yang lagi jauh, tetap satu layar.",
    lede: "Dua jendela, dua kota, jam aslinya masing-masing. Dia menebak kamu lagi apa di jam segini, membuka paket yang menyeberang, sampai dua kamar itu jadi satu.",
    tema: ["zona-waktu"],
    ide: [
      "Jam kita beda, tapi aku selalu tahu kamu lagi di jam berapa.",
      "Hitung mundurnya jalan terus. Sebentar lagi kita di kota yang sama.",
      "Jauhnya cuma di peta. Di sini kamu dekat terus."
    ],
    faq: [
      ["Kalau beda zona waktu?", "Kamu pilih kota masing-masing; jam di surat mengikuti jam aslinya saat dibuka."],
      ["Bisa ada hitung mundur ketemuan?", "Bisa. Isi tanggal kalian akan bertemu."],
      ["Dia harus pasang aplikasi?", "Tidak. Cukup buka tautannya di browser HP."]
    ]
  },
  "wisuda": {
    judul: "Ucapan Wisuda Digital — Kado Kelulusan Interaktif",
    deskripsi: "Ucapan wisuda digital yang bisa dimainkan: surat interaktif untuk merayakan kelulusannya, dengan foto dan pesan darimu.",
    h1: "Selamat lulus — dalam bentuk yang bisa dia rawat.",
    lede: "Kelulusan sebagai benih yang baru ditanam. Dia menyiram, merawat, dan melihatnya tumbuh — sambil membaca pesanmu tentang perjalanan yang sudah dia lewati.",
    tema: ["graduation-benih"],
    ide: [
      "Semua malam begadangmu akhirnya punya nama. Selamat, sarjana.",
      "Aku ikut bangga — dan aku tahu ini baru awal.",
      "Terima kasih sudah nggak menyerah. Sekarang waktunya tumbuh."
    ],
    faq: [
      ["Bisa untuk teman atau saudara?", "Bisa. Isi nama dan pesannya sesuai hubungan kalian."],
      ["Bisa dibuka tepat setelah wisuda?", "Bisa, pakai kunci waktu."],
      ["Harus pakai lagu?", "Tidak. Ada kotak musik bawaan, atau unggah lagumu sendiri."]
    ]
  },
  "surat-cinta": {
    judul: "Surat Cinta Digital untuk Pacar",
    deskripsi: "Surat cinta digital yang bisa dimainkan — untuk bilang sayang tanpa nunggu momen. Isi pesan, foto, dan lagumu, tautannya langsung jadi.",
    h1: "Bilang sayang, tanpa nunggu momen.",
    lede: "Satu hari biasa yang dia jalani sendiri — dan di tiap tempat ternyata kamu sudah lewat duluan, meninggalkan hal-hal kecil untuknya.",
    tema: ["lewat-duluan"],
    ide: [
      "Nggak ada acara apa-apa hari ini. Aku cuma lagi kepikiran kamu.",
      "Hal-hal kecil darimu itu yang bikin hariku enteng.",
      "Kalau kamu baca ini, berarti hari ini kamu sudah bikin aku senyum."
    ],
    faq: [
      ["Tanpa momen khusus juga boleh?", "Justru itu gunanya. Kirim kapan saja."],
      ["Bisa dibalas?", "Bisa. Di akhir surat dia bisa menulis balasan yang langsung masuk ke emailmu."],
      ["Apakah privat?", "Ya. Tautannya acak dan tidak muncul di Google."]
    ]
  },
  "ajak-kencan": {
    judul: "Cara Unik Ngajak Kencan — Undangan Jalan Digital",
    deskripsi: "Cara unik ngajak dia jalan: undangan kencan digital berbentuk pasar malam, lengkap dengan pilihan acara dan papan lampu untuk menjawab.",
    h1: "Ngajak dia jalan, tapi jangan lewat chat biasa.",
    lede: "Pasar malam yang cuma buka satu malam. Dia memilih acara lewat permainan, naik bianglala melihat foto kalian, lalu menjawab ajakanmu di papan lampu.",
    tema: ["pasar-malam"],
    ide: [
      "Malam minggu ini kosong? Aku punya rencana, tinggal kamu.",
      "Aku sudah pilih tempatnya. Kamu cukup bilang iya.",
      "Gula kapas, lampu-lampu, dan kamu. Kedengarannya pas."
    ],
    faq: [
      ["Jawabannya sampai ke aku?", "Ya. Jawabannya bisa dikirim ke emailmu, atau lewat WhatsApp kalau kamu mengisi nomornya."],
      ["Bisa sebut tempat dan jam?", "Bisa. Isi titik temu dan jamnya di formulir."],
      ["Kalau dia belum siap?", "Ada pilihan jawaban \"nanti dulu\" yang tetap sopan."]
    ]
  },
  "nyatakan-perasaan": {
    judul: "Cara Nyatakan Perasaan dengan Unik — Confess Digital",
    deskripsi: "Cara menyatakan perasaan yang beda: surat confess digital interaktif berisi hal-hal kecil yang kamu simpan tentang dia.",
    h1: "Nyatakan perasaanmu, pelan-pelan.",
    lede: "Hal-hal kecil yang selama ini kamu perhatikan tentang dia, disampaikan satu per satu — sampai akhirnya dia tahu siapa yang menyimpannya.",
    tema: ["confess-kunang", "kasus-pengirim"],
    ide: [
      "Aku sudah lama memperhatikan caramu tertawa. Mungkin sudah waktunya kamu tahu.",
      "Ini bukan kebetulan. Dari dulu memang aku.",
      "Nggak perlu dijawab sekarang. Aku cuma nggak mau terus menyimpannya."
    ],
    faq: [
      ["Bisa anonim dulu?", "Bisa. Tema Kasus Pengirim Tanpa Nama membuat dia menebak siapa pengirimnya."],
      ["Jawabannya bagaimana?", "Dia bisa memilih jawaban di akhir surat, dan jawabannya masuk ke emailmu."],
      ["Bisa dikunci?", "Bisa, dengan PIN atau pertanyaan yang cuma dia tahu jawabannya."]
    ]
  },
  "cepat-sembuh": {
    judul: "Ucapan Cepat Sembuh untuk Pacar — Surat Digital",
    deskripsi: "Ucapan cepat sembuh untuk pacar yang lagi sakit: surat digital interaktif yang menemaninya istirahat, dengan pesan dan foto darimu.",
    h1: "Untuk yang lagi sakit, temani dari jauh.",
    lede: "Satu kamar yang panas dan buram. Tiap hal kecil yang dia lakukan — membuka jendela, minum, mengatur napas — menurunkan suhunya sampai 36,5.",
    tema: ["getwell-365"],
    ide: [
      "Istirahat dulu. Dunia bisa nunggu, aku juga.",
      "Minum obatnya, minum airnya, terus kabari aku ya.",
      "Cepat pulih. Aku kangen kamu yang bawel."
    ],
    faq: [
      ["Cocok untuk keluarga atau teman?", "Cocok. Pesannya kamu tulis sendiri sesuai hubungan kalian."],
      ["Dia harus main game?", "Interaksinya ringan dan pelan, pas untuk yang sedang istirahat."],
      ["Bisa dibuka berkali-kali?", "Bisa, selama masa simpan surat."]
    ]
  },
  "lamaran": {
    judul: "Ide Lamaran Unik — Surat Lamaran Digital",
    deskripsi: "Ide lamaran yang unik: surat digital berbentuk tur rumah, tiap ruangan menyimpan satu janji, dan di kamar ada kotak cincin.",
    h1: "Ajak dia pulang ke rumah yang kalian bayangkan.",
    lede: "Tur rumah dari sudut pandangnya sendiri. Tiap ruangan menyimpan satu janji darimu, dan di kamar terakhir ada pertanyaan yang sudah lama kamu siapkan.",
    tema: ["rumah-contoh"],
    ide: [
      "Rumahnya belum ada. Tapi aku tahu siapa yang mau aku ajak pulang.",
      "Aku mau bangun hari-hari biasa yang panjang, sama kamu.",
      "Pertanyaannya sederhana, jawabannya aku tunggu."
    ],
    faq: [
      ["Bisa dipakai sebelum lamaran langsung?", "Bisa — sebagai pembuka, atau sebagai kenang-kenangan setelahnya."],
      ["Jawabannya sampai ke aku?", "Ya, lewat email, atau WhatsApp kalau kamu mengisi nomornya."],
      ["Bisa dikunci tanggal?", "Bisa, pakai kunci waktu atau kunci tanggal."]
    ]
  }
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function halamanMomen(slug, temaMati) {
  const m = MOMEN[slug];
  if (!m) return null;
  const mati = temaMati || [];
  const tema = m.tema.filter(t => !mati.includes(t) && TEMA[t]);
  const url = "https://foreverse.id/" + slug;
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: m.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Foreverse", item: "https://foreverse.id/" },
      { "@type": "ListItem", position: 2, name: m.judul, item: url } ] }
  ];
  const lain = Object.entries(MOMEN).filter(([s]) => s !== slug)
    .map(([s, x]) => `<a href="/${s}">${esc(x.judul.split(" — ")[0])}</a>`).join("");

  return `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(m.judul)} · Foreverse</title>
<meta name="description" content="${esc(m.deskripsi)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(m.judul)}"><meta property="og:description" content="${esc(m.deskripsi)}">
<meta property="og:image" content="https://foreverse.id/og-${esc(tema[0] || "beranda")}.png">
<meta name="theme-color" content="#FBFAF7">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>
:root{--ink:#16161A;--soft:#4A4852;--faint:#83808C;--cream:#FBFAF7;--paper:#fff;--stone:#E4E2DC;--violet:#3B3168;--violet-tint:#EEEBF7;--coral:#E8734A;--blush:#E8A5B0;
  --serif:'Fraunces',Georgia,serif;--sans:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--sans);line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1000px;margin:0 auto;padding:0 clamp(16px,5vw,40px)}
header{display:flex;justify-content:space-between;align-items:center;padding:18px 0}
.merk{display:flex;align-items:center;gap:9px;text-decoration:none;font-weight:600}
.merk img{width:24px;height:24px}
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:600;text-decoration:none;padding:13px 22px;border-radius:999px;background:var(--violet);color:#fff}
.btn.garis{background:var(--paper);color:var(--ink);border:1px solid var(--stone)}
.btn.kecil{padding:9px 16px;font-size:.9rem}
.hero{padding:clamp(28px,6vw,64px) 0 clamp(24px,4vw,40px)}
.label{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--coral);font-weight:600}
h1{font-family:var(--serif);font-weight:400;font-size:clamp(2rem,6vw,3.4rem);line-height:1.08;margin:10px 0 16px;max-width:18ch;letter-spacing:-.015em}
h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.5rem,4vw,2.1rem);line-height:1.15;margin:0 0 16px}
.lede{color:var(--soft);font-size:1.06rem;max-width:56ch;margin:0 0 22px}
.aksi{display:flex;gap:10px;flex-wrap:wrap}
section{padding:clamp(32px,6vw,56px) 0}
.segera{background:#fff;border:1.5px dashed #3B3168;border-radius:18px;padding:22px}.segera .lbl{display:inline-block;background:#3B3168;color:#fff;font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:99px;margin-bottom:10px}.segera p{margin:.4em 0 1em}
.tema{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.kartu{background:var(--paper);border:1px solid var(--stone);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:10px}
.kartu h3{font-family:var(--serif);font-weight:500;font-size:1.25rem;margin:0}
.kartu p{margin:0;color:var(--soft);font-size:.95rem;flex:1}
.kartu .aksi{margin-top:4px}
.langkah{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;counter-reset:n;padding:0;margin:0;list-style:none}
.langkah li{background:var(--paper);border:1px solid var(--stone);border-radius:16px;padding:16px 16px 16px 54px;position:relative;color:var(--soft);font-size:.95rem}
.langkah li::before{counter-increment:n;content:counter(n);position:absolute;left:16px;top:15px;width:26px;height:26px;border-radius:50%;background:var(--violet-tint);color:var(--violet);font-weight:600;display:flex;align-items:center;justify-content:center;font-size:.85rem}
.langkah b{display:block;color:var(--ink)}
.ide{display:grid;gap:10px}
.ide blockquote{margin:0;background:var(--paper);border-left:3px solid var(--blush);border-radius:0 14px 14px 0;padding:14px 18px;font-family:var(--serif);font-size:1.08rem}
.catat{color:var(--faint);font-size:.88rem;margin-top:10px}
details{background:var(--paper);border:1px solid var(--stone);border-radius:14px;padding:14px 18px;margin-bottom:8px}
summary{cursor:pointer;font-weight:600}
details p{margin:8px 0 0;color:var(--soft)}
.harga{background:var(--violet);color:#fff;border-radius:22px;padding:clamp(22px,5vw,36px);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.harga h2{color:#fff;margin:0 0 6px}
.harga p{margin:0;color:rgba(255,255,255,.82)}
.harga .btn{background:#fff;color:var(--violet)}
.lain{display:flex;flex-wrap:wrap;gap:8px}
.lain a{text-decoration:none;font-size:.9rem;padding:8px 14px;border-radius:999px;border:1px solid var(--stone);background:var(--paper)}
footer{padding:32px 0 48px;color:var(--faint);font-size:.88rem;display:flex;gap:16px;flex-wrap:wrap}
footer a{text-decoration:none}
</style></head><body>
<div class="wrap">
<header><a class="merk" href="/"><img src="/favicon.svg" alt="">Foreverse</a><a class="btn kecil" href="/template">Lihat semua tema</a></header>

<section class="hero">
  <div class="label">Surat digital yang bisa dimainkan</div>
  <h1>${esc(m.h1)}</h1>
  <p class="lede">${tema.length ? esc(m.lede) : "Temanya sedang disiapkan dan segera hadir."}</p>
  <div class="aksi">${tema[0] ? `<a class="btn" href="/pesan?tema=${esc(tema[0])}">Buat sekarang</a><a class="btn garis" href="${esc(TEMA[tema[0]].demo)}">Coba contohnya</a>` : `<a class="btn" href="/template">Lihat tema lain</a>`}</div>
</section>

${tema.length ? `<section>
  <h2>${tema.length > 1 ? "Pilihan tema" : "Temanya"}</h2>
  <div class="tema">${tema.map(t => `<article class="kartu"><h3>${esc(TEMA[t].nama)}</h3><p>${esc(TEMA[t].ringkas)}</p>
    <div class="aksi"><a class="btn kecil" href="/pesan?tema=${esc(t)}">Pakai tema ini</a><a class="btn kecil garis" href="${esc(TEMA[t].demo)}">Coba contoh</a></div></article>`).join("")}</div>
</section>` : `<section>
  <div class="segera" role="status"><span class="lbl">Segera hadir</span>
  <h2>Tema untuk momen ini sedang kami siapkan</h2>
  <p>Untuk sementara belum ada tema yang bisa dipesan di momen ini. Kalau kamu butuh, kabari kami lewat WhatsApp — momen yang paling banyak diminta kami kerjakan duluan.</p>
  <div class="aksi"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/6289512385393?text=${encodeURIComponent("Halo Foreverse, saya butuh tema untuk momen ini: foreverse.id/" + slug)}">Kabari saya</a><a class="btn garis" href="/template">Lihat momen lain</a></div></div>
</section>`}

<section>
  <h2>Cara membuatnya</h2>
  <ol class="langkah">
    <li><b>Pilih tema</b>Coba dulu contohnya, gratis.</li>
    <li><b>Isi pesan &amp; foto</b>Nama, pesan, foto, dan lagu. Pratinjaunya langsung kelihatan.</li>
    <li><b>Bayar</b><span data-v="harga">Rp15.000</span>, rinciannya tampil sebelum bayar.</li>
    <li><b>Kirim tautannya</b>Lewat WhatsApp, atau kode QR yang bisa dicetak.</li>
  </ol>
</section>

<section>
  <h2>Ide kata-kata</h2>
  <div class="ide">${m.ide.map(x => `<blockquote>${esc(x)}</blockquote>`).join("")}</div>
  <p class="catat">Pakai, ubah, atau tulis versimu sendiri — pesanmu ditampilkan persis seperti yang kamu tulis.</p>
</section>

<section>
  <h2>Yang sering ditanyakan</h2>
  ${m.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
  <details><summary>Apakah suratnya privat?</summary><p>Ya. Tautannya berisi kode acak, tidak muncul di Google, dan bisa dikunci PIN. Surat bisa dibuka selama 2 bulan dan bisa diperpanjang.</p></details>
</section>

<section>
  ${tema[0] ? `<div class="harga"><div><h2>Siap bikin punyamu?</h2><p>Dibuat sekitar 5 menit. Tautannya langsung jadi setelah bayar.</p></div>
  <a class="btn" href="/pesan?tema=${esc(tema[0])}">Mulai sekarang</a></div>` : `<div class="harga"><div><h2>Temanya segera hadir</h2><p>Sambil menunggu, lihat tema untuk momen lain.</p></div>
  <a class="btn" href="/template">Lihat semua tema</a></div>`}
</section>

<section>
  <h2>Momen lainnya</h2>
  <div class="lain">${lain}</div>
</section>

<footer><span>© Foreverse</span><a href="/faq">FAQ</a><a href="/kreator">Program kreator</a><a href="/syarat-ketentuan">Syarat &amp; Ketentuan</a><a href="/kebijakan-privasi">Kebijakan Privasi</a><a href="mailto:halo@foreverse.id">halo@foreverse.id</a></footer>
</div>
<script>
fetch("/api/info").then(function(r){ return r.json(); }).then(function(i){
  if(!i || !i.ok) return;
  var h = i.harga > 0 ? "Rp" + Number(i.harga).toLocaleString("id-ID") : "Gratis";
  document.querySelectorAll('[data-v="harga"]').forEach(function(el){ el.textContent = h; });
}).catch(function(){});
</script>
</body></html>`;
}
