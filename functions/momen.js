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
  "bait": { nama: "Bait", ringkas: "Seharian dia menerima pos darimu. Kotak posnya dibuka, amplop dirobek, perangko umur barunya ditempel, sampai bendera balasan dinaikkan." },
  "kado-riang": { nama: "Kado Riang", ringkas: "Pesta kecil yang riuh untuk ulang tahunnya. Dia menyobek tiket, menyalakan lilin di kue, lalu menukar kupon hadiah darimu." },
  "langit-harapan": { nama: "Langit Harapan", ringkas: "Ulang tahun yang hangat dan pelan: galeri kenangan, kuis seberapa kenal kamu, bintang harapan untuk umur barunya, lalu surat di langit senja." },
  "kapal-botol": { nama: "Kapal dalam Botol", ringkas: "Kapal kecil di dalam botol yang dia rakit sendiri. Tiap layar yang terbuka berisi foto kalian, dan tiap tahun bersama jadi satu simpul." },
  "rekonstruksi": { nama: "Rekonstruksi Hari Pertama", ringkas: "Hari pertama kalian tinggal sketsa pensil. Dia menyusun ulang kejadiannya jam demi jam, sampai semuanya berwarna lagi." },
  "pemutaran-perdana": { nama: "Pemutaran Perdana", ringkas: "Kisah kalian diputar di bioskop dengan satu penonton. Tiketnya disobek, foto kalian tayang di layar lebar, lalu namamu muncul di kredit film." },
  "zona-waktu": { nama: "Dua Jendela", ringkas: "Layar terbelah jadi kota kalian masing-masing, lengkap dengan jam aslinya. Dia menebak kamu lagi apa di jam segini, sampai dua kamar itu jadi satu." },
  "loker-terakhir": { nama: "Loker Terakhir", ringkas: "Hari terakhir di kampus. Gembok lokernya dibuka dengan tanggal wisuda, kenangan bertahun-tahun dikemasi, lalu toganya dilempar ke udara." },
  "lewat-duluan": { nama: "Dia Lewat Sini Duluan", ringkas: "Satu hari biasa yang dia jalani, dan di tiap tempat ternyata kamu sudah lewat duluan, meninggalkan hal-hal kecil untuknya." },
  "pasar-malam": { nama: "Pasar Malam", ringkas: "Ajak dia ke pasar malam. Main lempar gelang, gulung gula kapas, naik bianglala bersama foto kalian, lalu dia menjawab ajakanmu di papan lampu." },
  "confess-kunang": { nama: "Toples Kunang-Kunang", ringkas: "Hal-hal kecil yang diam-diam kamu perhatikan darinya, dilepas seperti kunang-kunang dari toples, sampai dia tahu sejak kapan kamu suka." },
  "kasus-pengirim": { nama: "Kasus Pengirim Tanpa Nama", ringkas: "Dia jadi detektif di kafe langganannya. Kumpulkan bukti, coret tersangka, sampai ketahuan siapa yang selama ini menaruh kertas tanpa nama." },
  "getwell-365": { nama: "36,5", ringkas: "Kamar yang panas dan buram. Tiap hal kecil yang dia lakukan, dari minum sampai mengatur napas, menurunkan suhunya sampai 36,5." },
  "rumah-contoh": { nama: "Rumah Contoh", ringkas: "Tur rumah yang kalian bayangkan. Tiap ruangan menyimpan satu janji darimu, dan di kamar terakhir ada kotak cincin." },
  "kotak-musik": { nama: "Kotak Musik Diservis", ringkas: "Kotak musik kesayangannya rusak gara-gara kamu. Dia ikut memperbaikinya, dan tiap bagian yang beres memperlihatkan satu hal yang kamu sadari." },
  "garis-finis": { nama: "Garis Finis", ringkas: "Seratus meter terakhir menuju pencapaiannya. Dia berlari diiringi sorakanmu, naik podium, lalu membaca pesanmu di papan skor stadion." },
  "stasiun-terakhir": { nama: "Stasiun Terakhir", ringkas: "Perjalanan kereta terakhir berdua. Kereta singgah di stasiun-stasiun kenangan, lalu kalian berangkat ke arah masing-masing dengan baik." },
  "rumah-menyala": { nama: "Rumah yang Menyala", ringkas: "Rumah yang belum terang di malam Natal. Dia merangkai lampunya sampai menyala, menggantung harapanmu di ornamen, lalu memilih ucapannya." },
  "hitung-mundur": { nama: "Hitung Mundur di Atap", ringkas: "Malam tahun baru di atap. Hitung mundur bersama, baca rencana kalian untuk tahun depan, lalu kembang api membentuk hati." },
  "pabrik-cokelat": { nama: "Cokelat Buatan Sendiri", ringkas: "Cokelat Valentine yang dia bikin sendiri. Tiap cetakan menyimpan alasanmu sayang dia, lalu cokelatnya dibagi dua untuk kalian." },
  "celengan": { nama: "Celengan Rindu", ringkas: "Celengan ayam untuk tabungan ketemu. Tiga koin terakhir membawa rencana kalian, lalu celengannya dipecah dan isinya foto serta suratmu." },
  "radio": { nama: "Radio Tengah Malam", ringkas: "Kamu jadi penyiar, dia satu-satunya pendengar. Dia mencari frekuensi kalian, mendengar salam-salammu, lalu suratmu dibacakan ON AIR." },
  "sulam": { nama: "Sulaman Dua Kota", ringkas: "Jarak kalian dijahit titik demi titik dari kotanya sampai kotamu, dan ujung jahitannya membentuk hati. Di tiap simpul ada hal yang bikin kamu kuat." },
  "persembahan": { nama: "Halaman Persembahan", ringkas: "Skripsinya dibuka sampai halaman yang paling sering dilewati orang: halaman persembahan. Revisi dicoret, pengesahan ditandatangani, dan suratmu ada di sana." },
  "studio": { nama: "Studio Foto Wisuda", ringkas: "Kamu jadi fotografer di hari wisudanya. Aba-abamu muncul di tiap jepretan, lalu cetakan besarnya keluar membawa suratmu." },
  "prosesi": { nama: "Prosesi Wisuda", ringkas: "Prosesi wisuda dari pintu aula sampai halaman kampus. Namanya dipanggil, dia naik panggung, dan papan bunga darimu sudah menunggu di luar." },
  "meja-dua": { nama: "Makan Malam Pertama", ringkas: "Meja sudah dipesan atas namanya. Dia menyalakan lilin, membuka menu kenangan kalian, lalu menjawab ajakan makan malammu dengan stempel." },
  "payung": { nama: "Payung Berdua", ringkas: "Sore hujan di halte. Dia mengusap embun di kaca sampai kalimatmu terbaca, lalu bus datang membawa ajakanmu." },
  "tumpeng": { nama: "Tumpeng Syukuran", ringkas: "Syukuran kecil untuk pencapaiannya. Lauk di sekeliling tumpeng membawa alasanmu bangga, dan pucuknya dia potong sendiri." },
  "pengumuman": { nama: "Papan Pengumuman", ringkas: "Untuk yang lolos atau diterima. Dia mencari namanya sendiri di papan pengumuman, menstabilonya, lalu membuka amplop resmi berisi suratmu." },
  "bubur": { nama: "Semangkuk Bubur", ringkas: "Kamu memasakkan bubur untuknya dari jauh. Tiap putaran adukan membawa pesan penyemangat, dan suratmu tertulis di serbet." },
  "titipan": { nama: "Paket Titipan", ringkas: "Paket cepat sembuh sampai di depan pintunya. Isinya teh jahe, kaus kaki tebal, dan jeruk, masing-masing dengan pesan darimu." },
  "tanaman": { nama: "Tanaman yang Layu", ringkas: "Tanaman yang layu karena kamu lupa merawatnya. Dia menyiramnya, memetik daun kering berisi janjimu, lalu dia sendiri yang menentukan jawabannya." },
  "cangkir": { nama: "Cangkir yang Retak", ringkas: "Cangkir kesayangannya retak karena kamu. Retakannya dia rekatkan dengan garis emas, sambil membaca hal-hal yang akhirnya kamu sadari." },
  "bekal": { nama: "Bekal Makan Siang", ringkas: "Surat cinta di dalam kotak bekal. Tiap lauk punya bendera kecil berisi pesanmu, dan ada memo yang ditempel di balik tutupnya." },
  "jemuran": { nama: "Tali Jemuran", ringkas: "Untuk hari yang biasa saja. Di antara cucian ada catatan kecil darimu, polaroid kalian dikibaskan sampai jadi, dan suratmu terbang tertiup angin." },
  "pesawat": { nama: "Pesawat Kertas", ringkas: "Pamit dari atap gedung. Terima kasihmu dilipat jadi pesawat kertas, dibaca sekali lagi, lalu diterbangkan." },
  "kunci-cadangan": { nama: "Kunci Cadangan", ringkas: "Mengembalikan kunci cadangan dengan baik. Tiap kunci membawa satu terima kasih, dan suratmu masuk ke kotak surat." },
  "seserahan": { nama: "Seserahan", ringkas: "Lamaran lewat tiga baki seserahan. Tiap baki membawa satu janji, dan di akhir ada kotak cincin bersama pertanyaanmu." },
  "lukis": { nama: "Melukis Bersama", ringkas: "Lukisan yang belum selesai, dan dia yang mewarnainya. Tiap warna membuka alasanmu ingin seumur hidup bersamanya, sampai pertanyaanmu tertulis dengan kuas." },
  "selamanya": { nama: "Selamanya", ringkas: "Tema khas Foreverse. Dia menggambar lingkaran tak hingga dengan jarinya sampai bait-baitmu muncul, lalu membuka suratmu lipatan demi lipatan." },
  "sampai-ketemu": { nama: "Sampai Ketemu", ringkas: "Tema khas Foreverse untuk yang beda kota. Jarak kalian dalam kilometer sungguhan dia perpendek dengan jarinya, sampai tinggal memutuskan siapa yang datang." },
  "bangku-belakang": { nama: "Kertas dari Bangku Belakang", ringkas: "Kertas yang dioper diam-diam dari bangku belakang sampai ke mejanya, cuma saat guru menghadap papan. Tiap lipatan membawa pesanmu, lalu dia menjawab dengan mencentang kotak." },
  "mesin-capit": { nama: "Mesin Capit", ringkas: "Arcade di mal, versi kalian. Lama hubungan kalian tampil sebagai level, dia mengarahkan capit sendiri untuk mengambil kapsul kenangan, menukar tiket dengan foto-foto kalian, lalu menarik boneka hadiah utama yang membawa suratmu." },
  "koper": { nama: "Koper ke Kotamu", ringkas: "Dia berkemas untuk terbang ke kotamu. Titipanmu masuk koper, ragu-ragu ditinggal di rumah, dan suratmu tertulis di balik boarding pass." },
  "herbarium": { nama: "Herbarium Kecil", ringkas: "Buku herbarium kecil untuk perempuan yang kamu kagumi. Tiap bunga kering yang dia tempel membuka satu hal yang kamu kagumi darinya." },
  "malam-takbiran": { nama: "Malam Takbiran", ringkas: "Malam takbiran berdua. Dia menganyam ketupat sampai maaf-maafmu terbaca, membuka amplop Lebaran, lalu memilih ucapannya." }
};

export const MOMEN = {
  "ulang-tahun": {
    judul: "Kado Ulang Tahun Digital untuk Pacar",
    deskripsi: "Kado ulang tahun digital yang bisa dimainkan: surat interaktif berisi ucapan, foto, dan lagu kalian. Dibuat 5 menit, tautannya langsung jadi.",
    h1: "Kado ulang tahun yang dia buka pelan-pelan.",
    lede: "Lebih berkesan dari ucapan di chat yang cepat tenggelam. Dia menyalakan lilin, membuka amplop, memainkan permainan kecil, lalu sampai di surat yang kamu tulis sendiri.",
    tema: ["bait", "kado-riang", "langit-harapan"],
    ide: [
      "Selamat ulang tahun. Terima kasih sudah jadi bagian paling tenang dari hariku.",
      "Umurmu nambah satu, sabarku ke kamu juga. Semoga tahun ini lebih ramah sama kamu.",
      "Aku tidak bisa kasih semua yang kamu mau, tapi aku bisa terus ada di tiap ulang tahunmu."
    ],
    faq: [
      ["Bisa dikirim tepat jam 12 malam?", "Bisa. Pakai kunci waktu: suratnya baru terbuka di jam yang kamu pilih, dengan hitung mundur sebelum waktunya."],
      ["Umurnya bisa disembunyikan?", "Bisa. Di formulir ada pilihan untuk tidak menampilkan umur."],
      ["Fotonya berapa?", "Tergantung tema, 4 sampai 5 foto. Semuanya kamu pilih sendiri, dan bagian yang mau ditonjolkan bisa kamu geser."]
    ]
  },
  "anniversary": {
    judul: "Kado Anniversary Digital untuk Pacar",
    deskripsi: "Kado anniversary digital: surat interaktif tentang perjalanan kalian, lengkap dengan foto, tanggal jadian, dan pesan pribadi.",
    h1: "Untuk hari jadi kalian, ceritakan ulang perjalanannya.",
    lede: "Tanggal jadian, tempat-tempat yang pernah kalian datangi, foto-foto yang cuma kalian yang paham. Semuanya dirangkai jadi satu surat yang dia jelajahi sendiri.",
    tema: ["kapal-botol", "rekonstruksi", "pemutaran-perdana", "mesin-capit"],
    ide: [
      "Sudah sekian hari, dan aku masih memilih kamu setiap paginya.",
      "Terima kasih sudah bertahan di hari-hari yang tidak gampang. Ayo lanjut jalan.",
      "Hari pertama itu masih aku ingat sampai jam-jamnya."
    ],
    faq: [
      ["Jumlah harinya dihitung otomatis?", "Ya. Isi tanggal jadian, jumlah hari bersama dihitung saat surat dibuka. Bisa juga disembunyikan."],
      ["Bisa untuk anniversary pernikahan?", "Bisa. Pilih jenis hari jadinya di formulir."],
      ["Bisa diingatkan tahun depan?", "Bisa. Pakai \"Ingetin aku\" di halaman selesai, nanti kami kirim satu email seminggu sebelum harinya."]
    ]
  },
  "ldr": {
    judul: "Kado untuk Pacar LDR · Surat Digital Dua Kota",
    deskripsi: "Kado untuk pacar LDR: surat digital yang menampilkan jam asli dua kota kalian, lengkap dengan foto dan pesan. Tinggal kirim tautannya.",
    h1: "Jauh di peta, dekat di layar.",
    lede: "Enam cara bilang kangen dari kota yang berbeda: memperpendek jarak kalian kilometer demi kilometer, menebak kamu lagi apa di jam segini, menabung rindu, sampai menyiarkan salam lewat radio tengah malam.",
    tema: ["sampai-ketemu", "zona-waktu", "celengan", "koper", "radio", "sulam"],
    ide: [
      "Jam kita beda, tapi aku selalu tahu kamu lagi di jam berapa.",
      "Hitung mundurnya jalan terus. Sebentar lagi kita di kota yang sama.",
      "Jauhnya cuma di peta. Di sini kamu dekat terus."
    ],
    faq: [
      ["Kalau beda zona waktu?", "Tidak masalah. Kamu pilih kota masing-masing, dan jam di surat mengikuti waktu aslinya saat dibuka."],
      ["Jaraknya dihitung sungguhan?", "Ya. Pilih kota kamu dan kota dia, jarak dan jam di surat mengikuti kota aslinya. Di tema Dua Jendela kamu juga bisa menambahkan hitung mundur ketemuan."],
      ["Dia harus pasang aplikasi?", "Tidak. Cukup buka tautannya di browser HP."]
    ]
  },
  "wisuda": {
    judul: "Ucapan Wisuda Digital · Kado Kelulusan Interaktif",
    deskripsi: "Ucapan wisuda digital yang bisa dimainkan: surat interaktif untuk merayakan kelulusannya, dengan foto dan pesan darimu.",
    h1: "Ucapan wisuda yang tidak tenggelam di antara ratusan chat.",
    lede: "Rayakan kelulusannya dengan cara yang dia mainkan sendiri: loker terakhir di kampus, halaman persembahan di skripsinya, sesi foto di studio, sampai prosesi wisuda dan papan bunga berisi harapanmu.",
    tema: ["loker-terakhir", "persembahan", "studio", "prosesi"],
    ide: [
      "Semua malam begadangmu akhirnya terbayar. Selamat lulus.",
      "Aku ikut bangga, dan aku tahu ini baru awal.",
      "Terima kasih sudah tidak menyerah. Sekarang waktunya tumbuh."
    ],
    faq: [
      ["Bisa untuk teman atau saudara?", "Bisa. Isi nama dan pesannya sesuai hubungan kalian."],
      ["Bisa dibuka tepat setelah wisuda?", "Bisa, pakai kunci waktu."],
      ["Harus pakai lagu?", "Tidak. Ada kotak musik bawaan, atau unggah lagumu sendiri."]
    ]
  },
  "surat-cinta": {
    judul: "Surat Cinta Digital untuk Pacar",
    deskripsi: "Surat cinta digital yang bisa dimainkan, untuk bilang sayang tanpa menunggu momen. Isi pesan, foto, dan lagumu, tautannya langsung jadi.",
    h1: "Bilang sayang, tanpa nunggu momen.",
    lede: "Untuk hari biasa: jejak kecil yang kamu tinggalkan di jalannya, bekal makan siang dengan bendera berisi pesanmu, atau catatan yang terjepit di tali jemuran.",
    tema: ["selamanya", "lewat-duluan", "bekal", "jemuran"],
    ide: [
      "Tidak ada acara apa-apa hari ini. Aku cuma lagi kepikiran kamu.",
      "Hal-hal kecil darimu itu yang bikin hariku enteng.",
      "Kalau kamu baca ini, berarti hari ini kamu sudah bikin aku senyum."
    ],
    faq: [
      ["Tanpa momen khusus juga boleh?", "Justru itu gunanya. Kirim kapan saja."],
      ["Bisa dibalas?", "Bisa. Di akhir surat dia bisa menulis balasan yang langsung masuk ke emailmu."]
    ]
  },
  "ajak-kencan": {
    judul: "Cara Unik Ngajak Kencan · Undangan Jalan Digital",
    deskripsi: "Cara unik ngajak dia jalan: undangan kencan digital yang bisa dimainkan, dari pasar malam, meja makan untuk dua, sampai payung berdua di halte, lengkap dengan cara dia menjawab.",
    h1: "Ajak dia jalan, dengan cara yang susah dilupakan.",
    lede: "Ajak dia jalan dengan cara yang dia mainkan sendiri: pasar malam yang cuma buka satu malam, meja makan yang sudah dipesan atas namanya, atau payung berdua di halte saat hujan. Di akhir, dia menjawab ajakanmu.",
    tema: ["pasar-malam", "meja-dua", "payung"],
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
    judul: "Cara Nyatakan Perasaan dengan Unik · Confess Digital",
    deskripsi: "Cara menyatakan perasaan yang beda: surat confess digital interaktif berisi hal-hal kecil yang kamu simpan tentang dia.",
    h1: "Nyatakan perasaanmu, pelan-pelan.",
    lede: "Hal-hal kecil yang selama ini kamu perhatikan tentang dia, disampaikan satu per satu, sampai akhirnya dia tahu siapa yang menyimpannya.",
    tema: ["confess-kunang", "kasus-pengirim", "bangku-belakang"],
    ide: [
      "Aku sudah lama memperhatikan caramu tertawa. Mungkin sudah waktunya kamu tahu.",
      "Ini bukan kebetulan. Dari dulu memang aku.",
      "Tidak perlu dijawab sekarang. Aku cuma tidak mau terus menyimpannya."
    ],
    faq: [
      ["Bisa anonim dulu?", "Bisa. Tema Kasus Pengirim Tanpa Nama membuat dia menebak siapa pengirimnya."],
      ["Jawabannya bagaimana?", "Dia bisa memilih jawaban di akhir surat, dan jawabannya masuk ke emailmu."],
      ["Bisa dikunci?", "Bisa, dengan PIN atau pertanyaan yang cuma dia tahu jawabannya."]
    ]
  },
  "cepat-sembuh": {
    judul: "Ucapan Cepat Sembuh untuk Pacar · Surat Digital",
    deskripsi: "Ucapan cepat sembuh untuk pacar yang lagi sakit: surat digital interaktif yang menemaninya istirahat, dengan pesan dan foto darimu.",
    h1: "Untuk yang lagi sakit, temani dari jauh.",
    lede: "Pilih cara menemaninya: turunkan suhunya sampai 36,5, masakkan semangkuk bubur dari jauh, atau kirim paket titipan ke depan pintunya.",
    tema: ["getwell-365", "bubur", "titipan"],
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
    judul: "Ide Lamaran Unik · Surat Lamaran Digital",
    deskripsi: "Ide lamaran yang unik: tur rumah impian, tiga baki seserahan, atau lukisan yang kalian selesaikan berdua. Tiap tema menyimpan janjimu dan satu pertanyaan.",
    h1: "Pertanyaan paling penting, dengan cara yang paling kalian.",
    lede: "Pilih caranya: tur rumah yang kalian bayangkan, seserahan yang dibuka satu per satu, atau lukisan yang dia selesaikan sendiri. Di akhir, ada pertanyaan yang sudah lama kamu siapkan.",
    tema: ["rumah-contoh", "seserahan", "lukis"],
    ide: [
      "Rumahnya belum ada. Tapi aku tahu siapa yang mau aku ajak pulang.",
      "Aku mau bangun hari-hari biasa yang panjang, sama kamu.",
      "Pertanyaannya sederhana, jawabannya aku tunggu."
    ],
    faq: [
      ["Bisa dipakai sebelum lamaran langsung?", "Bisa, sebagai pembuka atau sebagai kenang-kenangan setelahnya."],
      ["Jawabannya sampai ke aku?", "Ya, lewat email, atau WhatsApp kalau kamu mengisi nomornya."],
      ["Bisa dikunci tanggal?", "Bisa, pakai kunci waktu atau kunci tanggal."]
    ]
  },
  "minta-maaf": {
    judul: "Cara Minta Maaf ke Pacar · Surat Maaf Digital",
    deskripsi: "Surat maaf digital yang bisa dimainkan: dia ikut memperbaiki yang rusak, membaca hal-hal yang kamu sadari, lalu menentukan sendiri jawabannya.",
    h1: "Minta maaf yang bukan cuma kata-kata.",
    lede: "Pilih caranya: memperbaiki kotak musik yang rusak, merawat lagi tanaman yang layu, atau merekatkan cangkir yang retak dengan emas. Di akhir, dia yang menentukan jawabannya.",
    tema: ["kotak-musik", "tanaman", "cangkir"],
    ide: [
      "Aku tidak mau cuma bilang maaf. Aku mau benerin.",
      "Kamu tidak harus maafin sekarang. Aku cuma pengin kamu tahu aku dengar.",
      "Yang salah aku. Yang aku pelajari, aku tulis di sini."
    ],
    faq: [
      ["Kalau dia belum mau memaafkan?", "Di akhir surat dia bisa memilih \"Sudah dimaafkan\" atau \"Butuh waktu\". Dua-duanya sama-sama jawaban yang dihormati."],
      ["Bisa dibalas?", "Bisa. Balasannya langsung masuk ke emailmu."]
    ]
  },
  "selamat": {
    judul: "Ucapan Selamat atas Pencapaian · Kado Digital",
    deskripsi: "Ucapan selamat digital yang bisa dimainkan: lomba lari ke garis finis, syukuran tumpeng, atau namanya di papan pengumuman. Isinya pesan dan foto darimu.",
    h1: "Ikut bangga, dengan cara yang dia ingat.",
    lede: "Pilih cara merayakannya: dia berlari ke garis finis diiringi sorakanmu, memotong pucuk tumpeng syukuran, atau menemukan namanya sendiri di papan pengumuman.",
    tema: ["garis-finis", "tumpeng", "pengumuman"],
    ide: [
      "Kamu tidak pernah berhenti, dan hari ini kebayar.",
      "Aku penonton paling berisik buat kamu.",
      "Selamat. Rayain yang besar, istirahat yang cukup."
    ],
    faq: [
      ["Pencapaian apa saja yang cocok?", "Apa saja: lulus, diterima kerja, naik jabatan, menang lomba, atau selesai sesuatu yang berat."],
      ["Bisa dibalas?", "Bisa. Balasannya langsung masuk ke emailmu."]
    ]
  },
  "selesai-baik-baik": {
    judul: "Pamit dengan Baik · Surat Perpisahan Digital",
    deskripsi: "Surat perpisahan digital yang hangat: perjalanan kereta terakhir, pesawat kertas yang diterbangkan, atau kunci cadangan yang dikembalikan dengan baik.",
    h1: "Selesai, tapi dengan baik.",
    lede: "Pilih caranya pamit: naik kereta terakhir bersama, melipat terima kasihmu jadi pesawat kertas, atau mengembalikan kunci cadangan dengan sebuah surat.",
    tema: ["stasiun-terakhir", "pesawat", "kunci-cadangan"],
    ide: [
      "Makasih buat semua perjalanan yang pernah kita naiki bareng.",
      "Kita berhenti bukan karena tidak sayang, tapi karena arah kita beda.",
      "Semoga perjalananmu ke depan selalu ketemu orang baik."
    ],
    faq: [
      ["Apakah ini untuk putus saja?", "Untuk semua pamit yang ingin dijaga baik: putus, pindah kota, atau berpisah dengan sahabat."],
      ["Bisa dibalas?", "Bisa. Balasannya langsung masuk ke emailmu."]
    ]
  },
  "natal": {
    judul: "Ucapan Natal untuk Pacar · Kartu Natal Digital",
    deskripsi: "Ucapan Natal untuk pacar yang bisa dimainkan: dia menarik lonceng pintu, merangkai lampu sampai pohon menyala, dan membaca harapan-harapanmu di ornamennya.",
    h1: "Ucapan Natal yang bikin rumahnya menyala.",
    lede: "Satu malam Natal di rumahnya. Satu per satu menyala, dari lampu pohon, perapian, sampai bintang di puncak, dan di tiap bagian ada sesuatu darimu.",
    tema: ["rumah-menyala"],
    ide: [
      "Selamat Natal. Semoga damainya tinggal lama di hatimu.",
      "Makasih udah jadi orang yang bikin tahun ini terasa hangat.",
      "Natal kali ini aku pengin kamu ngerasa rumah itu dekat."
    ],
    faq: [
      ["Ucapannya bisa diganti?", "Bisa. Pilih \"Selamat Natal\" atau \"Merry Christmas\" di formulir."],
      ["Kapan sebaiknya dikirim?", "Kapan saja menjelang Natal. Kalau mau tepat di malam Natal, pakai kunci waktu supaya suratnya baru terbuka di jam yang kamu pilih."]
    ]
  },
  "tahun-baru": {
    judul: "Ucapan Tahun Baru untuk Pacar · Kartu Tahun Baru Digital",
    deskripsi: "Ucapan tahun baru yang bisa dimainkan: hitung mundur dari 10, kembang api yang mengganti angka tahunnya, tiga rencana tahun depan, dan bersulang di atap.",
    h1: "Hitung mundur bareng, walau dari jauh.",
    lede: "Malam pergantian tahun di atap gedung. Dia menghitung mundur, meluncurkan kembang api sampai tahunnya berganti, lalu membaca rencana kalian untuk tahun depan.",
    tema: ["hitung-mundur"],
    ide: [
      "Makasih udah nemenin setahun ini, yang bagus maupun yang berantakan.",
      "Tahun depan aku pengin lebih banyak hadir, bukan cuma di pesan.",
      "Ayo jalanin rencana kita satu per satu."
    ],
    faq: [
      ["Angka tahunnya ikut berganti otomatis?", "Ya. Surat menghitung tahun baru yang akan datang dari tanggal saat dibuka."],
      ["Kapan sebaiknya dikirim?", "Menjelang malam pergantian tahun. Pakai kunci waktu kalau mau suratnya baru terbuka tepat tengah malam."]
    ]
  },
  "valentine": {
    judul: "Ucapan Valentine untuk Pacar · Kado Valentine Digital",
    deskripsi: "Kado Valentine digital yang bisa dimainkan: dia membuat cokelatnya sendiri, membaca alasan kamu sayang dia di tiap cokelat, lalu membagi cokelatnya berdua.",
    h1: "Valentine yang manisnya dia bikin sendiri.",
    lede: "Dia mengelupas foil, menuang cokelat ke cetakan sampai pas, dan menemukan alasan kamu sayang dia tertulis di atas tiap cokelat.",
    tema: ["pabrik-cokelat"],
    ide: [
      "Setiap hari sama kamu rasanya manis.",
      "Makasih udah ingat hal-hal kecil tentang aku.",
      "Separuh cokelatnya buat kamu, separuh lagi kita makan bareng."
    ],
    faq: [
      ["Kapan sebaiknya dikirim?", "Menjelang 14 Februari. Pakai kunci waktu kalau mau suratnya baru terbuka di jam yang kamu pilih."],
      ["Harus pacaran dulu?", "Tidak. Cocok juga untuk pasangan suami-istri atau gebetan yang mau dikasih kejutan manis."]
    ]
  },
  "lebaran": {
    judul: "Ucapan Idulfitri untuk Pacar · Kartu Lebaran Digital",
    deskripsi: "Ucapan Lebaran yang bisa dimainkan: dia mencari hilal, menganyam ketupat yang membuka maaf-maafmu, membaca suratmu di malam takbiran, lalu bersalaman denganmu.",
    h1: "Mohon maaf lahir dan batin, dengan cara yang dia ingat.",
    lede: "Malam terakhir Ramadan sampai pagi Lebaran. Tiap baris ketupat yang dia anyam membuka satu maaf darimu, dan suratmu terbaca di antara suara beduk takbiran.",
    tema: ["malam-takbiran"],
    ide: [
      "Ramadan ini terasa lebih ringan karena ada kamu.",
      "Kalau ada kata-kataku yang nyakitin, aku minta maaf dari hati.",
      "Semoga Lebaran berikutnya kita rayakan bareng."
    ],
    faq: [
      ["Ucapannya bisa diganti?", "Bisa. Pilih \"Selamat Hari Raya Idulfitri\", \"Mohon Maaf Lahir dan Batin\", atau \"Minal ’Aidin wal Faizin\" di formulir."],
      ["Kapan sebaiknya dikirim?", "Malam takbiran atau pagi Idulfitri. Pakai kunci waktu kalau mau suratnya baru terbuka di jam yang kamu pilih."]
    ]
  },
  "hari-perempuan": {
    judul: "Ucapan Hari Perempuan untuk Pacar · Kado Hari Perempuan Digital",
    deskripsi: "Ucapan Hari Perempuan yang bisa dimainkan: buku herbarium kecil berisi hal-hal yang kamu kagumi darinya, foto kalian, dan suratmu yang dipres supaya awet.",
    h1: "Bilang ke dia, apa yang kamu kagumi darinya.",
    lede: "Buku herbarium kecil yang masih terikat pita. Tiap bunga kering yang dia cocokkan membuka satu hal yang kamu kagumi darinya, dan suratmu keluar dari alat pres bunga.",
    tema: ["herbarium"],
    ide: [
      "Aku bangga sama kamu, dan aku jarang bilang langsung.",
      "Kamu kuat dengan caramu sendiri.",
      "Hari ini hari kamu. Sisanya biar aku yang urus."
    ],
    faq: [
      ["Kapan sebaiknya dikirim?", "Menjelang 8 Maret, Hari Perempuan Internasional. Pakai kunci waktu kalau mau suratnya baru terbuka di jam yang kamu pilih."],
      ["Harus untuk pacar?", "Tidak. Cocok juga untuk istri, ibu, kakak, sahabat, atau perempuan mana pun yang kamu kagumi."]
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
    .map(([s, x]) => `<a href="/${s}">${esc(x.judul.split(" · ")[0])}</a>`).join("");

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
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>
:root{--ink:#16161A;--soft:#4A4852;--faint:#83808C;--cream:#FBFAF7;--paper:#fff;--stone:#E4E2DC;--violet:#3B3168;--violet-tint:#EEEBF7;--coral:#E8734A;--blush:#E8A5B0;
  --serif:'Fraunces',Georgia,serif;--sans:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
*{box-sizing:border-box}
body{margin:0;background:var(--cream);color:var(--ink);font-family:var(--sans);line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1000px;margin:0 auto;padding:0 clamp(16px,5vw,40px)}
header{position:sticky;top:0;z-index:60;background:rgba(251,250,247,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--stone)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:18px;height:64px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:var(--serif);font-size:22px;letter-spacing:-.01em}
.brand img{height:26px;width:auto}
.nav{display:none;gap:26px}.nav a{font-size:14.5px;text-decoration:none;color:var(--soft);font-weight:500}.nav a:hover{color:var(--ink)}
.nav-m{display:flex;gap:6px;overflow-x:auto;padding:0 clamp(16px,5vw,40px) 10px;scrollbar-width:none}.nav-m::-webkit-scrollbar{display:none}
.nav-m a{flex:none;font-size:12.5px;text-decoration:none;color:var(--soft);padding:6px 11px;border-radius:100px;border:1px solid var(--stone);background:var(--paper)}
@media(min-width:900px){.nav{display:flex}.nav-m{display:none}}
@media(max-width:699px){.bar{height:56px}.brand{font-size:19px}.brand img{height:22px}}
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:600;text-decoration:none;padding:13px 22px;border-radius:999px;background:var(--violet);color:#fff}
.btn.garis{background:var(--paper);color:var(--ink);border:1px solid var(--stone)}
.btn.kecil{padding:9px 16px;font-size:.9rem}
.hero{padding:clamp(28px,6vw,64px) 0 clamp(24px,4vw,40px)}
.label{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--violet);font-weight:600}
h1{font-family:var(--serif);font-weight:400;font-size:clamp(2rem,6vw,3.4rem);line-height:1.08;margin:10px 0 16px;max-width:18ch;letter-spacing:-.015em}
h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.5rem,4vw,2.1rem);line-height:1.15;margin:0 0 16px}
.lede{color:var(--soft);font-size:1.06rem;max-width:56ch;margin:0 0 22px}
.aksi{display:flex;gap:10px;flex-wrap:wrap}
section{padding:clamp(32px,6vw,56px) 0}
.segera{background:#fff;border:1.5px dashed #3B3168;border-radius:18px;padding:22px}.segera .lbl{display:inline-block;background:#3B3168;color:#fff;font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:99px;margin-bottom:10px}.segera p{margin:.4em 0 1em}
.tema{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.kartu{background:var(--paper);border:1px solid var(--stone);border-radius:18px;overflow:hidden;display:flex;flex-direction:column}
.kartu .cov{display:block;aspect-ratio:1/1;background:#F5F3EE center/cover no-repeat}
@media(max-width:699px){.kartu .cov{aspect-ratio:4/3}}
.kartu .isi{padding:18px 20px 20px;display:flex;flex-direction:column;gap:10px;flex:1}
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
<header>
  <div class="wrap bar">
    <a href="/" class="brand"><img src="/foreverse-logo.png" alt=""><span>foreverse</span></a>
    <nav class="nav" aria-label="Navigasi utama"><a href="/">Beranda</a><a href="/template">Template</a><a href="/cara-pesan">Cara pesan &amp; harga</a><a href="/faq">FAQ</a></nav>
    <a class="btn kecil" href="/template">Pilih momen</a>
  </div>
  <nav class="nav-m" aria-label="Navigasi utama (HP)"><a href="/">Beranda</a><a href="/template">Template</a><a href="/cara-pesan">Cara pesan &amp; harga</a><a href="/faq">FAQ</a></nav>
</header>
<div class="wrap">

<section class="hero">
  <div class="label">Surat digital yang bisa dimainkan</div>
  <h1>${esc(m.h1)}</h1>
  <p class="lede">${tema.length ? esc(m.lede) : "Temanya sedang disiapkan dan segera hadir."}</p>
  <div class="aksi">${tema[0] ? `<a class="btn" href="/pesan?tema=${esc(tema[0])}">Buat sekarang</a><a class="btn garis" href="/tema/${esc(tema[0])}">Lihat contohnya</a>` : `<a class="btn" href="/template">Lihat tema lain</a>`}</div>
</section>

${tema.length ? `<section>
  <h2>${tema.length > 1 ? "Pilihan tema" : "Temanya"}</h2>
  <div class="tema">${tema.map(t => `<article class="kartu"><a class="cov" href="/tema/${esc(t)}" aria-label="Contoh ${esc(TEMA[t].nama)}" style="background-image:url('/cover-${esc(t)}.jpg')"></a><div class="isi"><h3>${esc(TEMA[t].nama)}</h3><p>${esc(TEMA[t].ringkas)}</p>
    <div class="aksi"><a class="btn kecil" href="/pesan?tema=${esc(t)}">Pakai tema ini</a><a class="btn kecil garis" href="/tema/${esc(t)}">Lihat contoh</a></div></div></article>`).join("")}</div>
</section>` : `<section>
  <div class="segera" role="status"><span class="lbl">Segera hadir</span>
  <h2>Tema untuk momen ini sedang kami siapkan</h2>
  <p>Untuk sementara belum ada tema yang bisa dipesan di momen ini. Kalau kamu butuh, kabari kami lewat WhatsApp. Momen yang paling banyak diminta kami kerjakan duluan.</p>
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
  <p class="catat">Pakai, ubah, atau tulis versimu sendiri. Pesanmu ditampilkan persis seperti yang kamu tulis.</p>
</section>

<section>
  <h2>Yang sering ditanyakan</h2>
  ${m.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
  <details><summary>Apakah suratnya privat?</summary><p>Ya. Tautannya berisi kode acak, tidak muncul di Google, dan bisa dikunci PIN. Surat bisa dibuka selama 2 bulan dan bisa diperpanjang.</p></details>
</section>

<section>
  ${tema[0] ? `<div class="harga"><div><h2>Siap bikin punyamu?</h2><p>Cukup 5 menit. Lihat hasilnya dulu, bayar paling akhir, dan tautannya langsung jadi.</p></div>
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
<script src="/sumber.js"></script>
<script src="/bantuan.js" defer></script>
</body></html>`;
}
