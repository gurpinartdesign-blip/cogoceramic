/* =========================
   COGO Ceramic — app.js
   (tek dosya)
   ========================= */
(() => {
  "use strict";

  // =========================
  // Ayarlar
  // =========================
  const WHATSAPP_NUMBER = "905529341223";
  const COGO_AI_URL = "https://cogo-ai.gurpinartdesign.workers.dev/ai";
  const PAYTR_URL = "https://cogo-ai.gurpinartdesign.workers.dev/paytr";
  const AUTH_URL = "https://cogo-ai.gurpinartdesign.workers.dev";

  // =========================
  // ÜYELİK SİSTEMİ
  // =========================
  const Auth = {
    getToken() { return localStorage.getItem("cogo_token"); },
    getUser() { try { return JSON.parse(localStorage.getItem("cogo_user")); } catch(e) { return null; } },
    setSession(token, user) {
      localStorage.setItem("cogo_token", token);
      localStorage.setItem("cogo_user", JSON.stringify(user));
    },
    clearSession() {
      localStorage.removeItem("cogo_token");
      localStorage.removeItem("cogo_user");
    },
    isLoggedIn() { return !!this.getToken(); },
    async register(email, name, password) {
      const r = await fetch(AUTH_URL + "/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password })
      });
      return r.json();
    },
    async login(email, password) {
      const r = await fetch(AUTH_URL + "/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      return r.json();
    },
    async getProfile() {
      const token = this.getToken();
      if (!token) return null;
      const r = await fetch(AUTH_URL + "/auth/me", { headers: { "Authorization": "Bearer " + token } });
      return r.json();
    },
    async redeemPoints() {
      const r = await fetch(AUTH_URL + "/auth/redeem", {
        method: "POST",
        headers: { "Authorization": "Bearer " + this.getToken(), "Content-Type": "application/json" }
      });
      return r.json();
    }
  };

  function updateAuthButton() {
    const btn = document.getElementById("authBtn");
    if (!btn) return;
    const user = Auth.getUser();
    if (user) {
      btn.textContent = "\u{1F464} " + user.name.split(" ")[0];
      btn.style.cssText = "background:#b87333;color:#fff;border:1px solid #b87333;padding:7px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-family:Arial,sans-serif;white-space:nowrap;";
    } else {
      btn.textContent = "\xDCye Ol / Giri\u015F";
      btn.style.cssText = "background:none;color:#1f1a17;border:1px solid #d4b896;padding:7px 14px;border-radius:20px;cursor:pointer;font-size:12px;font-family:Arial,sans-serif;white-space:nowrap;";
    }
  }

  function openAuthModal(tab) {
    tab = tab || "login";
    const old = document.getElementById("cogoAuthModal");
    if (old) old.remove();
    const modal = document.createElement("div");
    modal.id = "cogoAuthModal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
    const user = Auth.getUser();

    if (Auth.isLoggedIn() && user) {
      const pts = user.points || 0;
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:28px;max-width:420px;width:100%;position:relative;max-height:90vh;overflow-y:auto;">
          <button onclick="document.getElementById('cogoAuthModal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;">&#x2715;</button>
          <h2 style="font-family:serif;margin:0 0 4px;">Merhaba, ${escapeHtml(user.name)} &#x1F44B;</h2>
          <p style="color:#888;margin:0 0 20px;font-size:13px;">${escapeHtml(user.email)}</p>
          <div style="background:#fdf8f4;border-radius:10px;padding:16px;text-align:center;margin-bottom:20px;">
            <div style="font-size:32px;font-weight:bold;color:#b87333;" id="authPoints">${pts}</div>
            <div style="font-size:12px;color:#888;margin-bottom:4px;">Puan</div>
            <div style="font-size:11px;color:#aaa;">Her 10&#x20BA; = 1 puan &bull; 100 puan = %10 indirim</div>
            <button onclick="window._redeemPoints()" style="margin-top:12px;background:#1f1a17;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:12px;">&#x1F381; Kod Al (100 puan)</button>
          </div>
          <div id="authCodes"></div>
          <div><h3 style="font-size:14px;margin:0 0 10px;">Son Sipari&#x15F;lerim</h3>
          <div id="authOrders" style="font-size:13px;color:#aaa;">Y\xFCkleniyor...</div></div>
          <button onclick="window._logoutUser()" style="width:100%;margin-top:20px;background:#f5f5f5;border:none;padding:10px;border-radius:8px;cursor:pointer;color:#666;font-size:13px;">&#x1F6AA; \xC7\u0131k\u0131\u015F Yap</button>
        </div>`;

      setTimeout(async () => {
        const data = await Auth.getProfile();
        if (!data || !data.ok) return;
        const ptsEl = document.getElementById("authPoints");
        if (ptsEl) ptsEl.textContent = data.user.points || 0;
        const ol = document.getElementById("authOrders");
        if (ol) {
          ol.innerHTML = (data.orders && data.orders.length > 0)
            ? data.orders.map(o => `<div style="border:1px solid #eee;border-radius:8px;padding:10px;margin-bottom:8px;"><div style="font-weight:bold;font-size:12px;">${escapeHtml(o.product_name || "Seramik \xDCr\xFCn")}</div><div style="color:#aaa;font-size:11px;">${(o.created_at||"").slice(0,10)} &bull; ${o.amount}&#x20BA;</div></div>`).join("")
            : "Hen\xFCz sipari\u015Fin yok.";
        }
        const cs = document.getElementById("authCodes");
        if (cs && data.discount_codes && data.discount_codes.length > 0) {
          cs.innerHTML = `<h3 style="font-size:14px;margin:0 0 10px;">&#x1F3AB; \u0130ndirim Kodlar\u0131m</h3>` +
            data.discount_codes.map(c => `<div style="background:#f0fff0;border:1px dashed #4caf50;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;letter-spacing:2px;">${escapeHtml(c.code)}</span><span style="color:#4caf50;font-size:12px;">%${c.discount_pct} \u0130ndirim</span></div>`).join("");
        }
      }, 50);

    } else {
      const isReg = (tab === "register");
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:28px;max-width:400px;width:100%;position:relative;">
          <button onclick="document.getElementById('cogoAuthModal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;">&#x2715;</button>
          <h2 style="font-family:serif;text-align:center;margin:0 0 20px;">&#x1FAB4; COGO \xDCyelik</h2>
          <div style="display:flex;border-bottom:2px solid #eee;margin-bottom:20px;">
            <button onclick="window._switchTab('login')" style="flex:1;padding:10px;background:none;border:none;font-weight:bold;cursor:pointer;color:${isReg ? "#aaa" : "#b87333"};border-bottom:${isReg ? "none" : "2px solid #b87333"};margin-bottom:-2px;">Giri\u015F Yap</button>
            <button onclick="window._switchTab('register')" style="flex:1;padding:10px;background:none;border:none;font-weight:bold;cursor:pointer;color:${isReg ? "#b87333" : "#aaa"};border-bottom:${isReg ? "2px solid #b87333" : "none"};margin-bottom:-2px;">\xDCye Ol</button>
          </div>
          ${isReg ? `<input id="aName" placeholder="Ad\u0131n Soyad\u0131n" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px;font-size:14px;">` : ""}
          <input id="aEmail" type="email" placeholder="E-posta" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px;font-size:14px;">
          <input id="aPass" type="password" placeholder="\u015Eifre" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;font-size:14px;">
          <div id="aErr" style="color:#e74c3c;font-size:12px;margin-bottom:10px;display:none;"></div>
          <button onclick="window._submitAuth('${tab}')" style="width:100%;background:#1f1a17;color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:bold;">
            ${isReg ? "\xDCye Ol &#x2014; 50 Puan Kazan &#x1F381;" : "Giri\u015F Yap"}
          </button>
          ${!isReg ? `<p style="text-align:center;font-size:12px;color:#aaa;margin-top:12px;">Hesab\u0131n yok mu? <a href="#" onclick="window._switchTab('register');return false;" style="color:#b87333;">\xDCye ol</a></p>` : ""}
        </div>`;
    }

    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  }

  window._switchTab = tab => openAuthModal(tab);

  window._submitAuth = async function(tab) {
    const email = (document.getElementById("aEmail") || {}).value || "";
    const pass  = (document.getElementById("aPass")  || {}).value || "";
    const errEl = document.getElementById("aErr");
    if (!email.trim() || !pass) {
      if (errEl) { errEl.textContent = "L\xFCtfen t\xFCm alanlar\u0131 doldurun."; errEl.style.display = "block"; }
      return;
    }
    let result;
    if (tab === "register") {
      const name = (document.getElementById("aName") || {}).value || "";
      if (!name.trim()) { if (errEl) { errEl.textContent = "Ad\u0131n\u0131z\u0131 girin."; errEl.style.display = "block"; } return; }
      result = await Auth.register(email.trim(), name.trim(), pass);
    } else {
      result = await Auth.login(email.trim(), pass);
    }
    if (result && result.ok && result.token) {
      Auth.setSession(result.token, result.user);
      document.getElementById("cogoAuthModal").remove();
      updateAuthButton();
      showToast(tab === "register" ? "\u{1F389} Ho\u015F geldin! 50 puan kazand\u0131n." : "\u2713 Giri\u015F yap\u0131ld\u0131.");
    } else {
      if (errEl) { errEl.textContent = (result && result.error) || "Bir hata olu\u015Ftu."; errEl.style.display = "block"; }
    }
  };

  window._logoutUser = function() {
    Auth.clearSession();
    const m = document.getElementById("cogoAuthModal");
    if (m) m.remove();
    updateAuthButton();
    showToast("\xC7\u0131k\u0131\u015F yap\u0131ld\u0131.");
  };

  window._redeemPoints = async function() {
    const result = await Auth.redeemPoints();
    if (result && result.ok) {
      showToast("🎁 " + result.code + " kodu haz\u0131r! %" + result.discount_pct + " indirim.");
      openAuthModal("panel");
    } else {
      showToast((result && result.error) || "Hata olu\u015Ftu.");
    }
  };

  // =========================
  // Ürünler
  // =========================
  const products = [
    {
      id: "aski", name: "Askı", price: 720, cat: "askilik",
      desc: "El yapımı seramik duvar askısı. Anahtarlık, takı veya hafif aksesuarlar için şık bir çözüm.",
      size: "15x8 cm", slug: "aski"
    },
    {
      id: "boga", name: "Boğa", price: 720, cat: "kupalar",
      desc: "Güç ve kararlılık arketipinden ilham alan el yapımı kupa. Her parça kendine özgü doku taşır.",
      size: "350 ml", slug: "boga"
    },
    {
      id: "buhur", name: "Tütsülük", price: 848, cat: "buhurdan",
      desc: "Meditasyon ve rahatlama ritüelleri için el yapımı seramik tütsülük. Çubuk ve koni tütsü uyumlu.",
      size: "12x5 cm", slug: "buhur"
    },
    {
      id: "elizi", name: "El İzi", price: 720, cat: "kupalar",
      desc: "Sanatçının el izinden ilham alınan kupa. Her parça biricik bir doku taşır — dünyada bir tane.",
      size: "20x15 cm", slug: "elizi"
    },
    {
      id: "fin", name: "Fincan", price: 848, cat: "mumluk",
      desc: "Çay veya kahve fincanı formunda romantik mumluk. Tealight mum ile kullanılır.",
      size: "8x7 cm", slug: "fin"
    },
    {
      id: "jpn", name: "Japon Kupa", price: 848, cat: "mumluk",
      desc: "Wabi-sabi estetiğinden ilham alınan el yapımı seramik mumluk. Doğal dokusuyla huzur ve sadelik yayar.",
      size: "300 ml", slug: "jpn"
    },
    {
      id: "kartal", name: "Kartal", price: 720, cat: "kupalar",
      desc: "Kartal figürlü el yapımı seramik kupa. Güç ve özgürlük enerjisi taşıyan, her sabah ilham veren özel bir parça.",
      size: "18x14 cm", slug: "kartal"
    },
    {
      id: "koku", name: "Oda Kokusu", price: 720, cat: "koku",
      desc: "Gözenekli seramik yapısıyla oda kokusunu yavaşça yayan el yapımı difüzör. Esans ile kullanılır.",
      size: "10x10 cm", slug: "koku"
    },
    {
      id: "pal2", name: "Bohem Buhurdan", price: 848, cat: "buhurdan",
      desc: "Bohem geometrik motiflerle bezeli premium buhurdanlık. Mum veya tütsü ile kullanılır.",
      size: "14x10 cm", slug: "pal2"
    },
    {
      id: "palet", name: "Palet", price: 618, cat: "palet",
      desc: "Sanatçılar için el yapımı seramik boya paleti. Renkleri karıştırmak için ideal yüzey dokusu.",
      size: "20x12 cm", slug: "palet"
    },
    {
      id: "stm", name: "Mumluk", price: 848, cat: "mumluk",
      desc: "Sade ve zarif el yapımı seramik mumluk. Standart tealight uyumlu, sofra veya raf için ideal.",
      size: "8x6 cm", slug: "stm"
    },
    {
      id: "takiset", name: "Takı Seti", price: 720, cat: "taki",
      desc: "Toprak tonlarında el yapımı seramik takı koleksiyonu. Küpe ve kolye içerir, her set özgün.",
      size: "Standart", slug: "takiset"
    },
    {
      id: "vint", name: "Vintage Kupa", price: 848, cat: "mumluk",
      desc: "Vintage estetikten ilham alınan el yapımı seramik mumluk. Tealight mum ile sıcak bir atmosfer yaratır.",
      size: "320 ml", slug: "vint"
    },
    {
      id: "yilan", name: "Yılan Kupa", price: 720, cat: "kupalar",
      desc: "Dönüşüm ve yenilenme sembolü yılan figürlü kupa. Güçlü bir karakter, sofrada konuşma başlatır.",
      size: "350 ml", slug: "yilan"
    },
    {
      id: "ev-buhur", name: "Ev Buhurdanlık", price: 848, cat: "buhurdan",
      desc: "Ev formunda dekoratif seramik buhurdanlık. Sıcaklık ve huzur hissi veren raf dekoru.",
      size: "10x10 cm", slug: "ev-buhur"
    },
    {
      id: "yin-yang-mum", name: "Yin Yang Mumluk", price: 848, cat: "mumluk",
      desc: "Siyah & beyaz dengeyi temsil eden el yapımı dekoratif mumluk. Meditasyon köşesi için ideal.",
      size: "9x6 cm", slug: "yin-yang-mum"
    },
    {
      id: "fircalik", name: "Seramik Fırçalık & Kalemlik", price: 720, cat: "kalemlik",
      desc: "Mavi mermer dokulu çok amaçlı organizer. Masa düzeni için şık ve işlevsel seramik kap.",
      size: "12x8 cm", slug: "fircalik"
    },
    {
      id: "nazar-duvar", name: "Nazar Duvar Süsü", price: 680, cat: "duvar",
      desc: "Etnik bohem stil, nazar boncuğu temalı seramik duvar dekoru. Enerji koruma sembolü.",
      size: "10 cm", slug: "nazar-duvar"
    },
    {
      id: "flora-yuzuk", name: "Flora Seramik Yüzük", price: 720, cat: "taki",
      desc: "Toprak tonlarında çiçek detaylı el yapımı yüzük. Doğa ile bağlantı kuran zarif aksesuar.",
      size: "Ayarlanabilir", slug: "flora-yuzuk"
    },
    {
      id: "vanilya-mum-spiral", name: "Vanilya Mum — Spiral", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Spiral desen işlemeli, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-spiral"
    },
    {
      id: "vanilya-mum-nazar", name: "Vanilya Mum — Nazar", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Nazar motifli, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-nazar"
    },
    {
      id: "vanilya-mum-bulut", name: "Vanilya Mum — Bulut", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Bulut & yağmur motifli, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-bulut"
    },
    {
      id: "vanilya-mum-flamingo", name: "Vanilya Mum — Flamingo", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Flamingo figürlü, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-flamingo"
    },
    {
      id: "vanilya-mum-cicek", name: "Vanilya Mum — Çiçek", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Nazar çiçek motifli, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-cicek"
    },
    {
      id: "vanilya-mum-sembol", name: "Vanilya Mum — Sembol", price: 848, cat: "mumluk",
      desc: "El yapımı seramik mumluk içinde vanilya aromalı doğal balmumu mum. Şamanik sembol işlemeli, 7x8 cm.",
      size: "7x8 cm", slug: "vanilya-mum-sembol"
    },
    {
      id: "sukulent-saksisi", name: "Sukulent Saksısı", price: 618, cat: "palet",
      desc: "El yapımı minimalist seramik sukulent saksısı. Doğal doku, sade tasarım.",
      size: "10x8 cm", slug: "sukulent-saksisi"
    },
    {
      id: "espresso-kupa", name: "Stoneware Espresso Kupası", price: 720, cat: "kupalar",
      desc: "Ergonomik tasarımlı stoneware espresso kupası. Isıyı uzun süre tutar, el yapımı.",
      size: "200 ml", slug: "espresso-kupa"
    },
    {
      id: "elsokmal-kupa", name: "El Sokmalı Stoneware Kupa", price: 720, cat: "kupalar",
      desc: "El sokmalı ergonomik stoneware kupa. Isıyı tutar, benzersiz kavrama tasarımı.",
      size: "350 ml", slug: "elsokmal-kupa"
    },
    {
      id: "kibrit-kutusu", name: "Kibrit Kutusu", price: 849, cat: "duvar",
      desc: "Geyik & orman rölyefli el yapımı seramik kibrit kutusu. Dekoratif ve fonksiyonel.",
      size: "10x6 cm", slug: "kibrit-kutusu"
    },
    {
      id: "seramik-kolye", name: "Seramik Kolye", price: 720, cat: "taki",
      desc: "El yapımı mavi seramik kolye. Doğal ip askılı, özgün tasarım.",
      size: "3 cm çap", slug: "seramik-kolye"
    },
    {
      id: "nazar-mum", name: "Nazar Mumluk", price: 848, cat: "mumluk",
      desc: "Nazarlık sembollü el yapımı seramik mumluk. Vanilya aromalı balmumu mum içerir. 8x8 cm.",
      size: "8x8 cm", slug: "nazmum"
    },
    {
      id: "cay-kupasi", name: "Çay Kupası", price: 720, cat: "kupalar",
      desc: "Çiçek desenli vintage el yapımı çay kupası. Nostaljik estetik, modern el işçiliği. 8x7.5 cm.",
      size: "8x7.5 cm", slug: "cay"
    },
    {
      id: "boho-mum", name: "Boho Mumluk", price: 848, cat: "mumluk",
      desc: "Bohem tarzı el yapımı seramik mumluk. Vanilya aromalı balmumu mum içerir. 8x8 cm.",
      size: "8x8 cm", slug: "boho"
    },
    {
      id: "ceylan-saksi", name: "Ceylan Saksı", price: 618, cat: "palet",
      desc: "El yapımı dekoratif seramik saksı. Teşhir ve sukulent için ideal. 8x10 cm.",
      size: "8x10 cm", slug: "ceylan"
    },
    {
      id: "salyangoz-saksi", name: "Salyangoz Saksı", price: 618, cat: "palet",
      desc: "Salyangoz figürlü el yapımı dekoratif seramik saksı. 8x10 cm.",
      size: "8x10 cm", slug: "salyangoz"
    },
    {
      id: "nazar-saksi", name: "Nazar Saksı", price: 618, cat: "palet",
      desc: "Nazar motifli el yapımı dekoratif seramik saksı. 8x10 cm.",
      size: "8x10 cm", slug: "nazar"
    }
  ];

  // =========================
  // Helpers
  // =========================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function formatTL(n) {
    return "₺" + (Number(n) || 0).toLocaleString("tr-TR");
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // =========================
  // Görsel yardımcıları
  // =========================
  function buildCandidates(base) {
    const exts = [".jpg", ".jpeg", ".jpg.jpeg", ".png", ".webp"];
    return exts.map((ext) => `images/${base}${ext}`);
  }

  function setImgWithFallback(imgEl, base) {
    const list = buildCandidates(base);
    let i = 0;
    function tryNext() {
      if (i >= list.length) { imgEl.remove(); return; }
      imgEl.src = list[i];
      i += 1;
    }
    imgEl.onerror = tryNext;
    tryNext();
  }

  function galleryBases(slug) {
    return [`${slug}-1`, `${slug}-2`, `${slug}-3`, `${slug}`];
  }

  // =========================
  // DOM
  // =========================
  const overlay = $("#overlay");
  const drawer = $("#drawer");
  const menuBtn = $("#menuBtn");
  const drawerClose = $("#drawerClose");
  const cart = $("#cart");
  const cartBtn = $("#cartBtn");
  const cartClose = $("#cartClose");
  const cartItemsEl = $("#cartItems");
  const cartCountEl = $("#cartCount");
  const cartTotalEl = $("#cartTotal");
  const checkoutWA = $("#checkoutWA"); // artık kullanılmıyor
  const clearCartBtn = $("#clearCart");
  const grid = $("#productGrid");
  const searchInput = $("#searchInput");
  const waDrawer = $("#waDrawer");
  const waBottom = $("#waBottom");
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  const aiFab = $("#cogoAiFab");
  const aiPanel = $("#cogoAiPanel");
  const aiClose = $("#cogoAiClose");
  const aiMsgs = $("#cogoAiMsgs");
  const aiForm = $("#cogoAiForm");
  const aiInput = $("#cogoAiInput");

  if (!grid) return;

  // =========================
  // Genel state
  // =========================
  let filterCat = "all";
  let searchQ = "";
  let cartState = JSON.parse(localStorage.getItem("cogo_cart") || "[]");

  // =========================
  // Panel yardımcıları
  // =========================
  function aiPanelOpen() {
    return aiPanel && aiPanel.getAttribute("aria-hidden") === "false";
  }

  function maybeCloseOverlay() {
    const anyOpen =
      drawer?.classList.contains("isOpen") ||
      cart?.classList.contains("isOpen") ||
      aiPanelOpen() ||
      lb?.classList.contains("open");
    if (!anyOpen && overlay) {
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }

  // =========================
  // Toast
  // =========================
  function showToast(msg, type = "success") {
    let toast = $("#cogoToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cogoToast";
      toast.style.cssText = `
        position:fixed; bottom:84px; left:50%; transform:translateX(-50%) translateY(20px);
        background:${type === "success" ? "#1f1a17" : "#c0392b"};
        color:#fff; padding:10px 20px; border-radius:999px;
        font-size:13px; font-weight:700; z-index:99999;
        opacity:0; transition:all 0.25s ease; pointer-events:none;
        white-space:nowrap; box-shadow:0 8px 24px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === "success" ? "#1f1a17" : "#c0392b";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
    }, 2500);
  }

  // =========================
  // Drawer
  // =========================
  function openDrawer() {
    drawer?.classList.add("isOpen");
    drawer?.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }

  function closeDrawer() {
    drawer?.classList.remove("isOpen");
    drawer?.setAttribute("aria-hidden", "true");
    maybeCloseOverlay();
  }

  menuBtn?.addEventListener("click", openDrawer);
  drawerClose?.addEventListener("click", closeDrawer);

  if (drawer) {
    $$("[data-cat]", drawer).forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        filterCat = a.dataset.cat || "all";
        setActivePill(filterCat);
        render();
        closeDrawer();
        $("#urunler")?.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // =========================
  // Cart
  // =========================
  function saveCart() {
    localStorage.setItem("cogo_cart", JSON.stringify(cartState));
    updateCartUI();
  }

  function openCart() {
    cart?.classList.add("isOpen");
    cart?.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }

  function closeCart() {
    cart?.classList.remove("isOpen");
    cart?.setAttribute("aria-hidden", "true");
    maybeCloseOverlay();
  }

  cartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  function addToCart(pid) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    const found = cartState.find((x) => x.id === pid);
    if (found) found.qty += 1;
    else cartState.push({ id: pid, qty: 1 });
    saveCart();
    showToast(`✓ ${p.name} sepete eklendi`);
    openCart();
  }

  function changeQty(pid, delta) {
    const found = cartState.find((x) => x.id === pid);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) cartState = cartState.filter((x) => x.id !== pid);
    saveCart();
  }

  function getCartTotal() {
    return cartState.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function updateCartUI() {
    if (!cartItemsEl || !cartCountEl || !cartTotalEl || !checkoutWA) return;
    const count = cartState.reduce((s, x) => s + x.qty, 0);
    cartCountEl.textContent = String(count);
    const rows = cartState.map((item) => {
      const p = products.find((x) => x.id === item.id);
      if (!p) return "";
      return `
        <div class="cartRow">
          <div class="cartRow__img"><img data-base="${escapeHtml(p.slug)}" alt="${escapeHtml(p.name)}"></div>
          <div class="cartRow__info">
            <div class="cartRow__name">${escapeHtml(p.name)}</div>
            <div class="cartRow__muted">${formatTL(p.price)} • ${escapeHtml(String(p.cat).toUpperCase())}</div>
            <div class="qty">
              <button class="qtyBtn" data-dec="${escapeHtml(p.id)}">−</button>
              <span class="qtyNum">${item.qty}</span>
              <button class="qtyBtn" data-inc="${escapeHtml(p.id)}">+</button>
            </div>
          </div>
          <div class="cartRow__sum">${formatTL(p.price * item.qty)}</div>
        </div>`;
    }).join("");
    cartItemsEl.innerHTML = rows || `<div class="empty">Sepetin boş. Ürün ekleyelim 🙂</div>`;
    $$("img[data-base]", cartItemsEl).forEach((img) => setImgWithFallback(img, img.dataset.base));
    $$("[data-inc]", cartItemsEl).forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.inc, 1)));
    $$("[data-dec]", cartItemsEl).forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.dec, -1)));
    const total = getCartTotal();
    cartTotalEl.textContent = formatTL(total);
    const lines = cartState.map((item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? `• ${p.name} x${item.qty} — ${formatTL(p.price * item.qty)}` : "";
    }).filter(Boolean);
    const msg = `Merhaba COGO Ceramic,\nSipariş vermek istiyorum:\n\n${lines.join("\n")}\n\nToplam: ${formatTL(total)}\nAd Soyad:\nAdres:\nNot:`;
    if (checkoutWA) checkoutWA.href = waLink(msg);
  }

  clearCartBtn?.addEventListener("click", () => {
    cartState = [];
    saveCart();
    showToast("Sepet temizlendi");
  });

  // =========================
  // Filter / Search
  // =========================
  function setActivePill(cat) {
    $$(".catPill").forEach((b) => b.classList.toggle("isActive", b.dataset.filter === cat));
  }

  $$(".catPill").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterCat = btn.dataset.filter || "all";
      setActivePill(filterCat);
      render();
    });
  });

  searchInput?.addEventListener("input", () => {
    searchQ = (searchInput.value || "").trim().toLowerCase();
    render();
  });

  // =========================
  // Render
  // =========================
  function render() {
    const list = products
      .filter((p) => (filterCat === "all" ? true : p.cat === filterCat))
      .filter((p) => {
        if (!searchQ) return true;
        const blob = `${p.name} ${p.desc || ""} ${p.cat}`.toLowerCase();
        return blob.includes(searchQ);
      });

    grid.innerHTML = list.map((p) => `
      <article class="pCard" data-cat="${escapeHtml(p.cat)}">
        <div class="pImg">
          <div class="galeri" data-gallery="${escapeHtml(p.slug)}"></div>
          <div class="pTag">${escapeHtml(String(p.cat).toUpperCase())}</div>
        </div>
        <div class="pBody">
          <h3>${escapeHtml(p.name)}</h3>
          ${p.desc ? `<p class="muted">${escapeHtml(p.desc)}</p>` : ""}
          <div class="pMeta">
            ${p.size ? `<span class="meta">${escapeHtml(p.size)}</span>` : `<span class="meta"></span>`}
            <strong class="price">${formatTL(p.price)}</strong>
          </div>
          <div class="taksit-wrapper" style="margin-top:8px;">
            <style>
              #paytr_taksit_tablosu_${p.id}{clear:both;font-size:11px;max-width:100%;text-align:center;font-family:Arial,sans-serif;}
              #paytr_taksit_tablosu_${p.id} .taksit-tablosu-wrapper{margin:3px;width:120px;padding:6px;cursor:default;text-align:center;display:inline-block;border:1px solid #e1e1e1;}
              #paytr_taksit_tablosu_${p.id} .taksit-logo img{max-height:20px;padding-bottom:6px;}
              #paytr_taksit_tablosu_${p.id} .taksit-tutari-text{float:left;width:54px;color:#a2a2a2;margin-bottom:3px;font-size:10px;}
              #paytr_taksit_tablosu_${p.id} .taksit-tutar-wrapper{display:inline-block;background-color:#f7f7f7;}
              #paytr_taksit_tablosu_${p.id} .taksit-tutari{float:left;width:54px;padding:4px 0;color:#474747;border:2px solid #fff;font-size:10px;}
              #paytr_taksit_tablosu_${p.id} .taksit-tutari-bold{font-weight:bold;}
            </style>
            <div id="paytr_taksit_tablosu_${p.id}"></div>
            <script src="https://www.paytr.com/odeme/taksit-tablosu/v2?token=b57bb099e5bc39f11466174b64338e64a7fc1b62a77c95e4c81bec9572fc6e54&merchant_id=678861&amount=${p.price}&taksit=0&tumu=0&element_id=paytr_taksit_tablosu_${p.id}"><\/script>
          </div>
          <div class="pActions">
            <button class="btn btn--soft" data-add="${escapeHtml(p.id)}">Sepete Ekle</button>
            <button class="btn ask-cogo" data-product="${escapeHtml(p.name)}" data-price="${escapeHtml(String(p.price))}" data-cat="${escapeHtml(p.cat)}">
              <span class="desktop-label">✨ CoGo AI'a Sor</span>
              <span class="mobile-label">✨ AI</span>
            </button>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-add]", grid).forEach((btn) => btn.addEventListener("click", () => addToCart(btn.dataset.add)));

    $$("[data-gallery]", grid).forEach((gal) => {
      const slug = gal.dataset.gallery;
      const bases = galleryBases(slug);
      bases.forEach((base) => {
        const img = document.createElement("img");
        img.alt = slug;
        img.loading = "lazy";
        setImgWithFallback(img, base);
        gal.appendChild(img);
      });
    });

    wireGalleries();
  }

  // =========================
  // Lightbox
  // =========================
  let lbList = [];
  let lbIndex = 0;

  function openLightbox(list, index) {
    if (!lb || !lbImg || !list.length) return;
    lbList = list; lbIndex = index;
    lbImg.src = lbList[lbIndex];
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }

  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    maybeCloseOverlay();
  }

  function stepLightbox(dir) {
    if (!lbList.length || !lbImg) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
  }

  lbClose?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", () => stepLightbox(-1));
  lbNext?.addEventListener("click", () => stepLightbox(1));
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

  function wireGalleries() {
    $$(".galeri").forEach((gal) => {
      const imgs = $$("img", gal).filter((im) => im && im.src);
      imgs.forEach((img, i) => {
        img.addEventListener("click", () => openLightbox(imgs.map((x) => x.src), i));
      });
    });
  }

  // =========================
  // CoGo AI
  // =========================
  function addUserMsg(text) {
    if (!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "aiMsg me";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  function addBotMsg(text) {
    if (!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "aiMsg";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  function openAiPanel() {
    if (!aiPanel) return;
    aiPanel.classList.add("isOpen");
    aiPanel.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
    if (aiMsgs && aiMsgs.childElementCount === 0) {
      addBotMsg("Selam ✨ Ben CoGo AI. Ürün öneri, hediye fikri veya anlamı hakkında yaz!");
    }
  }

  function closeAiPanel() {
    if (!aiPanel) return;
    aiPanel.classList.remove("isOpen");
    aiPanel.setAttribute("aria-hidden", "true");
    maybeCloseOverlay();
  }

  aiFab?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); openAiPanel(); });
  aiClose?.addEventListener("click", (e) => { e.preventDefault(); closeAiPanel(); });

  async function askAI(text) {
    if (!text) return;
    openAiPanel();
    addUserMsg(text);
    addBotMsg("✨ düşünüyorum...");
    try {
      const res = await fetch(COGO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      aiMsgs?.lastChild?.remove();
      addBotMsg(data?.reply || data?.text || "Şu an cevap veremedim. Bir daha dener misin?");
    } catch (err) {
      aiMsgs?.lastChild?.remove();
      addBotMsg("CoGo AI şu an cevap veremedi.");
    }
  }

  aiForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (aiInput?.value || "").trim();
    if (!q) return;
    if (aiInput) aiInput.value = "";
    askAI(q);
  });

  document.addEventListener("click", (e) => {
    const quickBtn = e.target.closest(".cogoAI__chip");
    if (quickBtn) { const q = quickBtn.dataset.aiquick; if (q) askAI(q); return; }
    const askBtn = e.target.closest(".ask-cogo");
    if (askBtn) {
      askAI(`Bu ürün hakkında kısa bilgi ver, kime hediye edilir ve 3 farklı öneri sun:\nÜrün: ${askBtn.dataset.product}\nKategori: ${askBtn.dataset.cat}\nFiyat: ${askBtn.dataset.price} TL`);
    }
  });

  // =========================
  // PayTR Modal
  // =========================
  function injectPaymentModal() {
    if (document.getElementById("cogoPayModal")) return;
    const modal = document.createElement("div");
    modal.id = "cogoPayModal";
    modal.style.cssText = `position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;padding:20px;`;
    modal.innerHTML = `
      <div style="background:#fff;border-radius:24px;padding:28px;width:min(440px,100%);box-shadow:0 24px 60px rgba(0,0,0,0.2);position:relative;">
        <button id="cogoPayModalClose" style="position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:12px;border:1px solid rgba(0,0,0,0.1);background:rgba(0,0,0,0.04);cursor:pointer;font-size:16px;">✕</button>
        <div style="font-weight:900;font-size:1.2rem;margin-bottom:6px;">Teslimat Bilgileri</div>
        <div style="color:#7a6e65;font-size:0.88rem;margin-bottom:20px;">Siparişini tamamlamak için bilgilerini gir.</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label style="font-size:12px;font-weight:800;color:#7a6e65;display:block;margin-bottom:5px;">Ad Soyad *</label>
          <input id="payName" type="text" placeholder="Ahmet Yılmaz" style="width:100%;height:44px;border-radius:12px;border:1px solid rgba(0,0,0,0.12);padding:0 14px;font-size:14px;outline:none;"></div>
          <div><label style="font-size:12px;font-weight:800;color:#7a6e65;display:block;margin-bottom:5px;">Telefon *</label>
          <input id="payPhone" type="tel" placeholder="05XX XXX XX XX" style="width:100%;height:44px;border-radius:12px;border:1px solid rgba(0,0,0,0.12);padding:0 14px;font-size:14px;outline:none;"></div>
          <div><label style="font-size:12px;font-weight:800;color:#7a6e65;display:block;margin-bottom:5px;">E-posta *</label>
          <input id="payEmail" type="email" placeholder="ornek@mail.com" style="width:100%;height:44px;border-radius:12px;border:1px solid rgba(0,0,0,0.12);padding:0 14px;font-size:14px;outline:none;"></div>
          <div><label style="font-size:12px;font-weight:800;color:#7a6e65;display:block;margin-bottom:5px;">Adres *</label>
          <textarea id="payAddress" placeholder="Mahalle, cadde, sokak, kapı no, şehir" style="width:100%;height:90px;border-radius:12px;border:1px solid rgba(0,0,0,0.12);padding:10px 14px;font-size:14px;outline:none;resize:none;font-family:inherit;"></textarea></div>
        </div>
        <div id="payFormError" style="color:#c0392b;font-size:12px;margin-top:8px;display:none;">Lütfen tüm alanları doldurun.</div>
        <button id="cogoPayConfirm" style="width:100%;height:48px;margin-top:16px;border-radius:999px;border:none;background:#1f1a17;color:#fff;font-size:14px;font-weight:800;cursor:pointer;">Ödemeye Geç →</button>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById("cogoPayModalClose").addEventListener("click", closePayModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closePayModal(); });
    document.getElementById("cogoPayConfirm").addEventListener("click", submitPayment);
  }

  function openPayModal() {
    injectPaymentModal();
    const modal = document.getElementById("cogoPayModal");
    if (modal) { modal.style.display = "flex"; document.body.classList.add("noScroll"); }
    // Giriş yapmış kullanıcının bilgilerini otomatik doldur
    const user = Auth.getUser();
    if (user) {
      const nameEl = document.getElementById("payName");
      const emailEl = document.getElementById("payEmail");
      if (nameEl && !nameEl.value) nameEl.value = user.name || "";
      if (emailEl && !emailEl.value) emailEl.value = user.email || "";
    }
  }

  function closePayModal() {
    const modal = document.getElementById("cogoPayModal");
    if (modal) { modal.style.display = "none"; document.body.classList.remove("noScroll"); }
  }

  async function submitPayment() {
    const name = document.getElementById("payName")?.value.trim();
    const phone = document.getElementById("payPhone")?.value.trim();
    const email = document.getElementById("payEmail")?.value.trim();
    const address = document.getElementById("payAddress")?.value.trim();
    const errEl = document.getElementById("payFormError");
    const confirmBtn = document.getElementById("cogoPayConfirm");
    if (!name || !phone || !email || !address) { if (errEl) errEl.style.display = "block"; return; }
    if (errEl) errEl.style.display = "none";
    const totalText = document.getElementById("cartTotal")?.textContent || "₺0";
    const totalPrice = Number(totalText.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    if (!totalPrice || totalPrice <= 0) { showToast("Sepet boş görünüyor.", "error"); closePayModal(); return; }
    const cartItems = cartState.map((item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? [p.name, p.price.toFixed(2), item.qty] : null;
    }).filter(Boolean);
    confirmBtn.textContent = "İşleniyor...";
    confirmBtn.disabled = true;
    try {
      const user = Auth.getUser();
      const response = await fetch(PAYTR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: totalPrice, email, user_name: name, user_address: address, user_phone: phone,
          cart_items: cartItems, user_id: user ? user.id : null
        }),
      });
      const data = await response.json();
      if (!response.ok) { showToast("Ödeme başlatılamadı. Tekrar dene.", "error"); confirmBtn.textContent = "Ödemeye Geç →"; confirmBtn.disabled = false; return; }
      const token = data?.paytr_response?.token;
      const status = data?.paytr_response?.status;
      if (status !== "success" || !token) { showToast("PayTR hatası. WhatsApp ile sipariş ver.", "error"); confirmBtn.textContent = "Ödemeye Geç →"; confirmBtn.disabled = false; return; }
      closePayModal();
      window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`;
    } catch (err) {
      showToast("Bağlantı hatası. Tekrar dene.", "error");
      confirmBtn.textContent = "Ödemeye Geç →";
      confirmBtn.disabled = false;
    }
  }

  window.startPayment = function() {
    if (cartState.length === 0) { showToast("Sepet boş. Önce ürün ekle.", "error"); return; }
    openPayModal();
  };

  // =========================
  // Overlay + WhatsApp + ESC
  // =========================
  overlay?.addEventListener("click", () => { closeDrawer(); closeCart(); closeAiPanel(); closeLightbox(); });
  if (waDrawer) waDrawer.href = waLink("Merhaba COGO Ceramic, ürünler hakkında bilgi almak istiyorum.");
  if (waBottom) waBottom.href = waLink("Merhaba COGO Ceramic, sipariş vermek istiyorum.");

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeDrawer(); closeCart(); closeAiPanel(); closeLightbox(); closePayModal(); }
    if (lb?.classList.contains("open")) {
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    }
  });

  // Auth butonu
  const authBtnEl = document.getElementById("authBtn");
  if (authBtnEl) authBtnEl.addEventListener("click", () => openAuthModal("login"));

  // =========================
  // İlk yükleme
  // =========================
  render();
  updateCartUI();
  updateAuthButton();
})();