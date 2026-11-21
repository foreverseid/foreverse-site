/* Tombol "Kirim balasan" versi contoh, untuk demo tema dan pratinjau
   di formulir. Di surat sungguhan (/s/<kode>) server sudah memasang
   window.fvBalas yang asli lebih dulu (worker.js · balasanPenerima),
   jadi skrip ini diam dan tidak mengganti apa pun. Tombol contoh tidak
   mengirim apa-apa; ketukannya hanya menjelaskan ke mana balasan asli
   akan pergi, supaya calon pembeli tahu fitur ini ada. */
(function(){
  if(window.fvBalas || /^\/s\//.test(location.pathname)) return;
  function pengirim(){
    try{ return JSON.parse(document.getElementById("foreverse-data").textContent).pengirim || "pengirim"; }
    catch(e){ return "pengirim"; }
  }
  window.fvBalas = {
    contoh: true,
    kirim: function(){ return Promise.resolve({ ok: true, contoh: true }); },
    tombol: function(sumber, contoh, label){
      var b = document.createElement(contoh && contoh.tagName === "BUTTON" ? "button" : "a");
      b.className = (contoh && contoh.className) || "";
      if(b.tagName === "A"){ b.href = "#"; b.setAttribute("role", "button"); } else b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function(e){
        e.preventDefault(); if(b.dataset.s) return; b.dataset.s = "1";
        b.textContent = "Contoh saja. Di surat asli, ini masuk ke email " + pengirim();
        setTimeout(function(){ b.textContent = label; delete b.dataset.s; }, 3200);
      });
      return b;
    }
  };
})();
