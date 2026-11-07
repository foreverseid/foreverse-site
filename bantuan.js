/* FOREVERSE · tombol WhatsApp mengambang
   Dipasang di: index.html, pesan.html, selesai.html, syarat-ketentuan.html,
   kebijakan-privasi.html  →  <script src="/bantuan.js" defer></script>
   Tidak dipasang di halaman surat (/s/<kode>).
   Pertanyaan umum ada di FAQ (index.html #faq). */
(function () {
  "use strict";
  if (window.__fvBantuan) return;
  window.__fvBantuan = true;
  var WA = "6289512385393";
  var teks = "Halo Foreverse, saya mau tanya: ";

  var css = document.createElement("style");
  css.textContent =
    ".fv-wa{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:9000;" +
    "display:flex;align-items:center;gap:8px;height:52px;padding:0 18px 0 14px;border-radius:999px;" +
    "background:#25D366;color:#fff;font:600 15px/1 'Plus Jakarta Sans',system-ui,sans-serif;text-decoration:none;" +
    "box-shadow:0 10px 24px rgba(22,22,26,.22);transition:transform .2s}" +
    ".fv-wa:active{transform:scale(.96)}.fv-wa svg{width:24px;height:24px;flex:none}" +
    "@media (max-width:520px){.fv-wa{width:52px;padding:0;justify-content:center}.fv-wa span{display:none}}";
  document.head.appendChild(css);

  var a = document.createElement("a");
  a.className = "fv-wa";
  a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(teks);
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Tanya lewat WhatsApp");
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z"/></svg><span>Tanya kami</span>';
  function pasang() { document.body.appendChild(a); }
  if (document.body) pasang(); else document.addEventListener("DOMContentLoaded", pasang);
})();
