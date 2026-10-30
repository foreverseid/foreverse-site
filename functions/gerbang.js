/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · gerbang kunci pembuka surat

   Disajikan worker.js di /s/<kode> selama surat masih terkunci (PIN,
   pertanyaan rahasia, tanggal) atau belum waktunya dibuka (kunci waktu).
   Halaman ini TIDAK berisi isi surat sama sekali — hanya nama penerima,
   pertanyaan/petunjuk yang memang ditulis pengirim untuk dibaca penerima,
   dan waktu buka. Jawaban dicek di server (/api/buka); kalau benar, server
   memasang cookie tiket dan halaman dimuat ulang menjadi suratnya.

   Tampilannya sengaja netral merek Foreverse: gerbang ini berdiri di DEPAN
   pembuka khas tiap tema, bukan menggantikannya.
   ══════════════════════════════════════════════════════════════════ */

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function halamanGerbang(info, kode) {
  /* selama kunci waktu belum lewat, yang tampil hanya hitung mundur —
     kunci lain (kalau ada) baru ditanyakan setelah waktunya tiba */
  if (info.buka) info = Object.assign({}, info, { jenis: "", petunjuk: "" });
  const judul = info.jenis === "pin" ? "Masukkan PIN-nya"
    : info.jenis === "tanya" ? esc(info.tanya)
    : info.jenis === "tanggal" ? "Tanggal berapa, hayo?"
    : "Sebentar lagi, ya";
  const ket = info.jenis === "pin" ? "Suratnya dikunci dengan " + (info.panjangPin || 4) + " angka yang cuma kalian berdua tahu."
    : info.jenis === "tanya" ? "Jawab dulu pertanyaan ini untuk membuka suratnya."
    : info.jenis === "tanggal" ? "Suratnya dikunci dengan satu tanggal penting kalian."
    : "Suratnya sudah siap, tapi baru boleh dibuka pada waktunya.";

  const masukan = info.jenis === "pin"
    ? `<input id="j" class="pin" type="password" inputmode="numeric" autocomplete="off" maxlength="${info.panjangPin || 6}" placeholder="${"•".repeat(info.panjangPin || 4)}" aria-label="PIN">`
    : info.jenis === "tanggal"
    ? `<input id="j" type="date" aria-label="Tanggal">`
    : info.jenis === "tanya"
    ? `<input id="j" type="text" autocomplete="off" maxlength="60" placeholder="Jawabanmu…" aria-label="Jawaban">`
    : "";

  return `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Ada surat untukmu</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Ada surat untukmu">
<meta property="og:description" content="Buka pelan-pelan, ya.">
<meta property="og:image" content="https://foreverse.id/og-bait.png">
<style>
:root{--ink:#1B1B2F;--soft:#5A5668;--faint:#8A8598;--cream:#FAF3E8;--paper:#FFFDF8;--violet:#3B3168;--coral:#E8734A;--blush:#E8A5B0;--stone:#E9DFD0}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--cream);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
body{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:28px 20px;
  background:radial-gradient(60% 40% at 50% 0%,rgba(232,165,176,.35),transparent 70%),var(--cream)}
.kartu{width:100%;max-width:360px;text-align:center}
.amplop{width:86px;height:62px;margin:0 auto 22px;position:relative;border-radius:10px;background:var(--blush);box-shadow:0 14px 30px rgba(59,49,104,.18)}
.amplop::before{content:"";position:absolute;inset:0;border-radius:10px;background:linear-gradient(155deg,transparent 49%,rgba(255,255,255,.35) 50%,transparent 51%),linear-gradient(205deg,transparent 49%,rgba(255,255,255,.35) 50%,transparent 51%)}
.amplop i{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:var(--coral);
  box-shadow:0 4px 10px rgba(201,90,51,.4);display:flex;align-items:center;justify-content:center;font-style:normal;color:#fff;font-size:13px}
.untuk{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint)}
.nama{font-family:Georgia,"Times New Roman",serif;font-size:30px;margin:4px 0 22px}
h1{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:21px;line-height:1.35;margin:0 0 8px}
p{margin:0;color:var(--soft);font-size:15px;line-height:1.55}
.petunjuk{margin-top:12px;font-size:14px;color:var(--violet);background:#EEEBF7;border-radius:12px;padding:9px 12px}
form{margin-top:20px;display:flex;flex-direction:column;gap:10px}
input{width:100%;font:inherit;font-size:17px;padding:14px 16px;border:1.5px solid var(--stone);border-radius:14px;background:var(--paper);color:var(--ink);text-align:center}
input:focus{outline:none;border-color:var(--violet)}
input.pin{letter-spacing:.5em;font-size:24px}
button{font:inherit;font-weight:600;font-size:16px;padding:14px;border:0;border-radius:999px;background:var(--violet);color:#fff;cursor:pointer}
button:disabled{opacity:.6}
.galat{min-height:20px;margin-top:4px;font-size:14px;color:#B33A2B}
.goyang{animation:g .35s}
@keyframes g{25%{transform:translateX(-8px)}50%{transform:translateX(7px)}75%{transform:translateX(-4px)}}
.jam{display:flex;justify-content:center;gap:10px;margin-top:20px}
.jam div{background:var(--paper);border:1px solid var(--stone);border-radius:14px;padding:10px 0;width:66px}
.jam b{display:block;font-family:Georgia,serif;font-size:26px;font-weight:400}
.jam span{font-size:11px;color:var(--faint);letter-spacing:.08em;text-transform:uppercase}
.kapan{margin-top:12px;font-size:14px;color:var(--faint)}
.merek{margin-top:34px;font-size:12px;color:var(--faint)}
</style></head><body>
<main class="kartu">
  <div class="amplop" aria-hidden="true"><i>${info.buka && !info.jenis ? "◷" : "✦"}</i></div>
  <div class="untuk">untuk</div>
  <div class="nama">${esc(info.penerima)}</div>
  <h1>${judul}</h1>
  <p>${ket}</p>
  ${info.petunjuk ? `<p class="petunjuk">Petunjuk: ${esc(info.petunjuk)}</p>` : ""}
  ${info.buka ? `<div class="jam" id="jam" aria-live="polite"><div><b id="h">0</b><span>hari</span></div><div><b id="j2">0</b><span>jam</span></div><div><b id="m">0</b><span>menit</span></div><div><b id="d">0</b><span>detik</span></div></div>
  <p class="kapan" id="kapan"></p>` : ""}
  ${info.jenis ? `<form id="f">${masukan}<button type="submit" id="b">Buka suratnya</button><div class="galat" id="g" role="alert"></div></form>` : ""}
  <div class="merek">Foreverse</div>
</main>
<script>
(function(){
  var KODE=${JSON.stringify(kode)}, BUKA=${Number(info.buka) || 0};
  if(BUKA){
    var f=document.getElementById("f"); if(f) f.style.display="none";
    document.getElementById("kapan").textContent="Bisa dibuka "+new Date(BUKA).toLocaleString("id-ID",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Jakarta"})+" WIB";
    (function detak(){
      var s=Math.max(0,Math.floor((BUKA-Date.now())/1000));
      document.getElementById("h").textContent=Math.floor(s/86400);
      document.getElementById("j2").textContent=Math.floor(s%86400/3600);
      document.getElementById("m").textContent=Math.floor(s%3600/60);
      document.getElementById("d").textContent=s%60;
      if(s<=0){ setTimeout(function(){ location.reload(); },1200); return; }
      setTimeout(detak,1000);
    })();
  }
  var form=document.getElementById("f"); if(!form) return;
  var isian=document.getElementById("j"), tombol=document.getElementById("b"), galat=document.getElementById("g");
  if(!BUKA && isian.type!=="date") isian.focus();
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var v=isian.value.trim(); if(!v){ isian.focus(); return; }
    tombol.disabled=true; galat.textContent="";
    fetch("/api/buka",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kode:KODE,jawab:v})})
      .then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j}; }); })
      .then(function(h){
        if(h.ok && h.j.ok){ tombol.textContent="Terbuka ✦"; location.reload(); return; }
        galat.textContent=(h.j && h.j.pesan) || "Belum tepat. Coba lagi, ya.";
        form.classList.remove("goyang"); void form.offsetWidth; form.classList.add("goyang");
        tombol.disabled=false; isian.select && isian.select();
      })
      .catch(function(){ galat.textContent="Koneksinya terputus. Coba lagi, ya."; tombol.disabled=false; });
  });
})();
</script>
</body></html>`;
}
