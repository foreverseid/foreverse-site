/* ══════════════════════════════════════════════════════════════════
   FOREVERSE · dasar tema

   Dimuat oleh SEMUA berkas tema (mesin dan demo), sebelum skrip tema.
   Isinya hal-hal yang harus sama di setiap tema dan di setiap HP, supaya
   tidak ditulis ulang (dan tidak meleset) di tiap tema:

   1. Layar tidak membesar sendiri: ketuk ganda dan cubit dimatikan.
   2. Suara: iPhone hanya mengizinkan suara dimulai dari KETUKAN
      (jari diangkat tanpa bergeser), bukan dari sentuhan pertama atau
      seretan. Lagu yang ditolak disimpan, lalu diputar begitu ada
      ketukan. Suara dijeda saat halaman ditinggal dan lanjut saat kembali.
   3. Seretan tidak macet: kalau browser mengirim akhir seretan ke elemen
      lain (atau tidak mengirimnya sama sekali), akhirnya diteruskan ke
      benda yang sedang diseret, supaya benda itu tidak tertinggal melayang.

   Tema tidak perlu memanggil apa pun dari berkas ini.
   ══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
if (window.__fvDasar) return;
window.__fvDasar = true;
var W = window, D = document;

/* ── 1 · layar ── */
var gaya = D.createElement('style');
gaya.textContent = 'html{touch-action:pan-x pan-y;-webkit-text-size-adjust:100%;text-size-adjust:100%}';
(D.head || D.documentElement).appendChild(gaya);
['gesturestart', 'gesturechange', 'gestureend'].forEach(function(n){
  D.addEventListener(n, function(e){ e.preventDefault(); }, { passive: false });
});

/* ── 2 · suara ── */
var konteks = [];   // semua AudioContext yang dibuat tema
var antre = [];     // lagu yang ditolak browser, menunggu ketukan: {el, ok, gagal}
var berbunyi = [];  // elemen audio yang sedang diputar tema
var dijeda = [];    // elemen audio yang dijeda karena halaman ditinggal

/* iPhone: tanpa ini, suara buatan browser (kotak musik bawaan) ikut bisu
   saat tombol senyap di samping HP menyala. Lagu unggahan tidak terpengaruh. */
function sesiPutar(){ try{ if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; }catch(_){} }
sesiPutar();

var KonteksAsli = W.AudioContext || W.webkitAudioContext;
if (KonteksAsli) {
  var KonteksBaru = function(opsi){
    var c = opsi === undefined ? new KonteksAsli() : new KonteksAsli(opsi);
    var tidur = c.suspend, bangun = c.resume;
    c.__diam = false;                                   // true = dimatikan tema (tombol suara)
    c.__bangun = function(){ return bangun.call(c); };
    c.__tidur = function(){ return tidur.call(c); };
    c.suspend = function(){ c.__diam = true; return tidur.apply(c, arguments); };
    c.resume = function(){ c.__diam = false; return bangun.apply(c, arguments); };
    konteks.push(c);
    return c;
  };
  KonteksBaru.prototype = KonteksAsli.prototype;
  if (W.AudioContext) W.AudioContext = KonteksBaru;
  if (W.webkitAudioContext) W.webkitAudioContext = KonteksBaru;
}

var Media = W.HTMLMediaElement && W.HTMLMediaElement.prototype, putarAsli = null, jedaAsli = null;
function buang(daftar, el){ var i = daftar.indexOf(el); if (i > -1) daftar.splice(i, 1); }
function lepasAntre(el){
  for (var i = antre.length - 1; i >= 0; i--) if (antre[i].el === el) {
    var a = antre.splice(i, 1)[0], galat;
    try{ galat = new DOMException('Pemutaran dibatalkan.', 'AbortError'); }catch(_){ galat = new Error('AbortError'); }
    a.gagal(galat);
  }
}
if (Media && Media.play) {
  putarAsli = Media.play; jedaAsli = Media.pause;
  /* play() yang ditolak karena belum ada ketukan TIDAK langsung gagal:
     janjinya ditahan, lalu dipenuhi saat lagu sungguh berputar. Jadi alur
     tema sesudah play() (menaikkan volume, menandai "sedang main") tetap jalan. */
  Media.play = function(){
    var el = this, janji;
    buang(dijeda, el);
    try{ janji = putarAsli.apply(el, arguments); }catch(e){ return Promise.reject(e); }
    if (!janji || !janji.then) return janji;
    return janji.then(function(v){ if (berbunyi.indexOf(el) < 0) berbunyi.push(el); return v; }, function(e){
      if (!e || e.name !== 'NotAllowedError') throw e;
      return new Promise(function(ok, gagal){ lepasAntre(el); antre.push({ el: el, ok: ok, gagal: gagal }); });
    });
  };
  Media.pause = function(){ lepasAntre(this); buang(berbunyi, this); buang(dijeda, this); return jedaAsli.apply(this, arguments); };
}

function cobaAntre(){
  antre.splice(0).forEach(function(a){
    var janji;
    try{ janji = putarAsli.call(a.el); }catch(e){ a.gagal(e); return; }
    janji.then(function(v){ if (berbunyi.indexOf(a.el) < 0) berbunyi.push(a.el); a.ok(v); },
      function(e){ if (e && e.name === 'NotAllowedError') antre.push(a); else a.gagal(e); });
  });
}
function bangunkan(){
  konteks.forEach(function(c){
    if (c.__diam || c.state === 'running' || c.state === 'closed') return;
    try{ var j = c.__bangun(); if (j && j.catch) j.catch(function(){}); }catch(_){}
  });
}
/* dipanggil pada setiap sentuhan yang selesai: murah, dan hanya bekerja kalau ada yang tertunda */
function sentuhan(){
  if (D.hidden) return;
  sesiPutar(); bangunkan();
  if (antre.length) cobaAntre();
}
['pointerup', 'touchend', 'click', 'keydown'].forEach(function(n){ W.addEventListener(n, sentuhan, true); });

/* halaman ditinggal (pindah aplikasi, layar dikunci): suara berhenti; kembali: lanjut */
D.addEventListener('visibilitychange', function(){
  if (D.hidden) {
    konteks.forEach(function(c){ if (!c.__diam && c.state === 'running') { try{ c.__tidur(); }catch(_){} } });
    berbunyi.slice().forEach(function(el){ if (!el.paused) { try{ jedaAsli.call(el); }catch(_){} if (dijeda.indexOf(el) < 0) dijeda.push(el); } });
  } else {
    bangunkan();
    dijeda.splice(0).forEach(function(el){
      var janji; try{ janji = putarAsli.call(el); }catch(_){ return; }
      if (janji && janji.catch) janji.catch(function(e){
        if (e && e.name === 'NotAllowedError') antre.push({ el: el, ok: function(){}, gagal: function(){} });
      });
    });
  }
});

/* ── 3 · seretan ── */
var jari = {};   // pointerId → { t: elemen yang disentuh, x, y }
function tersampaikan(e, j){
  var t = e.target;
  if (t === j.t || (j.t.contains && j.t.contains(t))) return true;
  /* tema sengaja menangkap pointer di elemen lain: itu bukan nyasar */
  try{ if (t && t.hasPointerCapture && t.hasPointerCapture(e.pointerId)) return true; }catch(_){}
  return false;
}
function teruskan(jenis, id, j, asli){
  var tiruan;
  try{
    tiruan = new PointerEvent(jenis, { bubbles: true, cancelable: true, composed: true, pointerId: id,
      pointerType: asli ? asli.pointerType : 'touch', isPrimary: true, clientX: j.x, clientY: j.y,
      buttons: jenis === 'pointermove' ? 1 : 0 });
  }catch(_){ return; }
  /* berhenti sebelum leluhur bersama, supaya pendengar di atasnya tidak jalan dua kali */
  var batas = null, sasaran = asli && asli.target;
  if (sasaran && sasaran.nodeType && j.t.isConnected) {
    var n = j.t;
    while (n.parentNode && n.parentNode !== sasaran && !(n.parentNode.contains && n.parentNode.contains(sasaran))) n = n.parentNode;
    if (n.parentNode) batas = n;
  }
  function henti(ev){ if (ev === tiruan) ev.stopPropagation(); }
  if (batas) batas.addEventListener(jenis, henti);
  try{ j.t.dispatchEvent(tiruan); }catch(_){}
  if (batas) batas.removeEventListener(jenis, henti);
}
W.addEventListener('pointerdown', function(e){
  if (!e.isTrusted || e.pointerType !== 'touch' || !e.target || !e.target.nodeType) return;
  jari[e.pointerId] = { t: e.target, x: e.clientX, y: e.clientY };
}, true);
W.addEventListener('pointermove', function(e){
  var j = jari[e.pointerId]; if (!j || !e.isTrusted) return;
  j.x = e.clientX; j.y = e.clientY;
  if (!tersampaikan(e, j)) teruskan('pointermove', e.pointerId, j, e);
}, true);
function akhir(e){
  var j = jari[e.pointerId]; if (!j || !e.isTrusted) return;
  delete jari[e.pointerId];
  if (e.type === 'pointerup') { j.x = e.clientX; j.y = e.clientY; }
  if (!tersampaikan(e, j)) teruskan(e.type, e.pointerId, j, e);
}
W.addEventListener('pointerup', akhir, true);
W.addEventListener('pointercancel', akhir, true);
/* jari sudah tidak ada di layar tetapi akhir seretan tidak pernah dikabarkan */
function sapu(e){
  if (e.touches && e.touches.length) return;
  setTimeout(function(){
    Object.keys(jari).forEach(function(id){ var j = jari[id]; delete jari[id]; teruskan('pointercancel', +id, j, null); });
  }, 0);
}
W.addEventListener('touchend', sapu, true);
W.addEventListener('touchcancel', sapu, true);
})();
