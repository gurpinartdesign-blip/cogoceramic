/* =========================
   COGO Ceramic — app.js (TAMİR EDİLMİŞ VERSİYON)
   Görsel yükleme sorunları giderildi.
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
      btn.textContent = "Üye Ol / Giriş";
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
          <div><h3 style="font-size:14px;margin:0 0 10px;">Son Siparişlerim</h3>
          <div id="authOrders" style="font-size:13px;color:#aaa;">Yükleniyor...</div></div>
          <button onclick="window._logoutUser()" style="width:100%;margin-top:20px;background:#f5f5f5;border:none;padding:10px;border-radius:8px;cursor:pointer;color:#666;font-size:13px;">&#x1F6AA; Çıkış Yap</button>
        </div>`;

      setTimeout(async () => {
        const data = await Auth.getProfile();
        if (!data || !data.ok) return;
        const ptsEl = document.getElementById("authPoints");
        if (ptsEl) ptsEl.textContent = data.user.points || 0;
        const ol = document.getElementById("authOrders");
        if (ol) {
          ol.innerHTML = (data.orders && data.orders.length > 0)
            ? data.orders.map(o => `<div style="border:1px solid #eee;border-radius:8px;padding:10px;margin-bottom:8px;"><div style="font-weight:bold;font-size:12px;">${escapeHtml(o.product_name || "Seramik Ürün")}</div><div style="color:#aaa;font-size:11px;">${(o.created_at||"").slice(0,10)} &bull; ${o.amount}&#x20BA;</div></div>`).join("")
            : "Henüz siparişin yok.";
        }
        const cs = document.getElementById("authCodes");
        if (cs && data.discount_codes && data.discount_codes.length > 0) {
          cs.innerHTML = `<h3 style="font-size:14px;margin:0 0 10px;">&#x1F3AB; İndirim Kodlarım</h3>` +
            data.discount_codes.map(c => `<div style="background:#f0fff0;border:1px dashed #4caf50;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:bold;letter-spacing:2px;">${escapeHtml(c.code)}</span><span style="color:#4caf50;font-size:12px;">%${c.discount_pct} İndirim</span></div>`).join("");
        }
      }, 50);

    } else {
      const isReg = (tab === "register");
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:28px;max-width:400px;width:100%;position:relative;">
          <button onclick="document.getElementById('cogoAuthModal').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;">&#x2715;</button>
          <h2 style="font-family:serif;text-align:center;margin:0 0 20px;">&#x1FAB4; COGO Üyelik</h2>
          <div style="display:flex;border-bottom:2px solid #eee;margin-bottom:20px;">
            <button onclick="window._switchTab('login')" style="flex:1;padding:10px;background:none;border:none;font-weight:bold;cursor:pointer;color:${isReg ? "#aaa" : "#b87333"};border-bottom:${isReg ? "none" : "2px solid #b87333"};margin-bottom:-2px;">Giriş Yap</button>
            <button onclick="window._switchTab('register')" style="flex:1;padding:10px;background:none;border:none;font-weight:bold;cursor:pointer;color:${isReg ? "#b87333" : "#aaa"};border-bottom:${isReg ? "2px solid #b87333" : "none"};margin-bottom:-2px;">Üye Ol</button>
          </div>
          ${isReg ? `<input id="aName" placeholder="Adın Soyadın" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px;font-size:14px;">` : ""}
          <input id="aEmail" type="email" placeholder="E-posta" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px;font-size:14px;">
          <input id="aPass" type="password" placeholder="Şifre" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;font-size:14px;">
          <div id="aErr" style="color:#e74c3c;font-size:12px;margin-bottom:10px;display:none;"></div>
          <button onclick="window._submitAuth('${tab}')" style="width:100%;background:#1f1a17;color:#fff;border:none;padding:12px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:bold;">
            ${isReg ? "Üye Ol &#x2014; 50 Puan Kazan &#x1F381;" : "Giriş Yap"}
          </button>
          ${!isReg ? `<p style="text-align:center;font-size:12px;color:#aaa;margin-top:12px;">Hesabın yok mu? <a href="#" onclick="window._switchTab('register');return false;" style="color:#b87333;">Üye ol</a></p>` : ""}
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
      if (errEl) { errEl.textContent = "Lütfen tüm alanları doldurun."; errEl.style.display = "block"; }
      return;
    }
    let result;
    if (tab === "register") {
      const name = (document.getElementById("aName") || {}).value || "";
      if (!name.trim()) { if (errEl) { errEl.textContent = "Adınızı girin."; errEl.style.display = "block"; } return; }
      result = await Auth.register(email.trim(), name.trim(), pass);
    } else {
      result = await Auth.login(email.trim(), pass);
    }
    if (result && result.ok && result.token) {
      Auth.setSession(result.token, result.user);
      document.getElementById("cogoAuthModal").remove();
      updateAuthButton();
      showToast(tab === "register" ? "\u{1F389} Hoş geldin! 50 puan kazandın." : "\u2713 Giriş yapıldı.");
    } else {
      if (errEl) { errEl.textContent = (result && result.error) || "Bir hata oluştu."; errEl.style.display = "block"; }
    }
  };

  window._logoutUser = function() {
    Auth.clearSession();
    const m = document.getElementById("cogoAuthModal");
    if (m) m.remove();
    updateAuthButton();
    showToast("Çıkış yapıldı.");
  };

  window._redeemPoints = async function() {
    const result = await Auth.redeemPoints();
    if (result && result.ok) {
      showToast("🎁 " + result.code + " kodu hazır! %" + result.discount_pct + " indirim.");
      openAuthModal("panel");
    } else {
      showToast((result && result.error) || "Hata oluştu.");
    }
  };

  // =========================
  // Ürünler
  // =========================
  const products = [
    { id: "aski", name: "Askı", price: 720, cat: "askilik", desc: "El yapımı seramik duvar askısı.", size: "15x8 cm", slug: "aski" },
    { id: "boga", name: "Boğa", price: 720, cat: "kupalar", desc: "Güç ve kararlılık arketipinden ilham alan el yapımı kupa.", size: "350 ml", slug: "boga" },
    { id: "buhur", name: "Tütsülük", price: 848, cat: "buhurdan", desc: "Meditasyon ritüelleri için el yapımı tütsülük.", size: "12x5 cm", slug: "buhur" },
    { id: "elizi", name: "El İzi", price: 720, cat: "kupalar", desc: "Sanatçının el izinden ilham alınan kupa.", size: "20x15 cm", slug: "elizi" },
    { id: "fin", name: "Fincan", price: 848, cat: "mumluk", desc: "Çay fincanı formunda romantik mumluk.", size: "8x7 cm", slug: "fin" },
    { id: "jpn", name: "Japon Kupa", price: 848, cat: "mumluk", desc: "Wabi-sabi estetiğinden ilham alınan mumluk.", size: "300 ml", slug: "jpn" },
    { id: "kartal", name: "Kartal", price: 720, cat: "kupalar", desc: "Kartal figürlü el yapımı seramik kupa.", size: "18x14 cm", slug: "kartal" },
    { id: "koku", name: "Oda Kokusu", price: 720, cat: "koku", desc: "Gözenekli seramik oda kokusu difüzörü.", size: "10x10 cm", slug: "koku" },
    { id: "pal2", name: "Bohem Buhurdan", price: 848, cat: "buhurdan", desc: "Bohem geometrik motifli buhurdanlık.", size: "14x10 cm", slug: "pal2" },
    { id: "palet", name: "Palet", price: 618, cat: "palet", desc: "Sanatçılar için el yapımı seramik boya paleti.", size: "20x12 cm", slug: "palet" },
    { id: "stm", name: "Mumluk", price: 848, cat: "mumluk", desc: "Sade ve zarif el yapımı seramik mumluk.", size: "8x6 cm", slug: "stm" },
    { id: "takiset", name: "Takı Seti", price: 720, cat: "taki", desc: "El yapımı seramik küpe ve kolye seti.", size: "Standart", slug: "takiset" },
    { id: "vint", name: "Vintage Kupa", price: 848, cat: "mumluk", desc: "Vintage estetikli el yapımı seramik mumluk.", size: "320 ml", slug: "vint" },
    { id: "yilan", name: "Yılan Kupa", price: 720, cat: "kupalar", desc: "Yılan figürlü dönüşüm sembolü kupa.", size: "350 ml", slug: "yilan" },
    { id: "ev-buhur", name: "Ev Buhurdanlık", price: 848, cat: "buhurdan", desc: "Ev formunda dekoratif buhurdanlık.", size: "10x10 cm", slug: "ev-buhur" },
    { id: "yin-yang-mum", name: "Yin Yang Mumluk", price: 848, cat: "mumluk", desc: "Dengeyi temsil eden Yin Yang mumluk.", size: "9x6 cm", slug: "yin-yang-mum" },
    { id: "fircalik", name: "Seramik Fırçalık & Kalemlik", price: 720, cat: "kalemlik", desc: "Mavi mermer dokulu organizer.", size: "12x8 cm", slug: "fircalik" },
    { id: "nazar-duvar", name: "Nazar Duvar Süsü", price: 680, cat: "duvar", desc: "Etnik bohem stil duvar dekoru.", size: "10 cm", slug: "nazar-duvar" },
    { id: "flora-yuzuk", name: "Flora Seramik Yüzük", price: 720, cat: "taki", desc: "Zarif çiçek detaylı yüzük.", size: "Ayarlanabilir", slug: "flora-yuzuk" },
    { id: "vanilya-mum-spiral", name: "Vanilya Mum — Spiral", price: 848, cat: "mumluk", desc: "Vanilya aromalı doğal mum.", size: "7x8 cm", slug: "vanilya-mum-spiral" },
    { id: "vanilya-mum-nazar", name: "Vanilya Mum — Nazar", price: 848, cat: "mumluk", desc: "Nazar motifli vanilya aromalı mum.", size: "7x8 cm", slug: "vanilya-mum-nazar" },
    { id: "vanilya-mum-bulut", name: "Vanilya Mum — Bulut", price: 848, cat: "mumluk", desc: "Bulut motifli vanilya aromalı mum.", size: "7x8 cm", slug: "vanilya-mum-bulut" },
    { id: "vanilya-mum-flamingo", name: "Vanilya Mum — Flamingo", price: 848, cat: "mumluk", desc: "Flamingo figürlü vanilya mum.", size: "7x8 cm", slug: "vanilya-mum-flamingo" },
    { id: "vanilya-mum-cicek", name: "Vanilya Mum — Çiçek", price: 848, cat: "mumluk", desc: "Çiçek motifli vanilya mum.", size: "7x8 cm", slug: "vanilya-mum-cicek" },
    { id: "vanilya-mum-sembol", name: "Vanilya Mum — Sembol", price: 848, cat: "mumluk", desc: "Şamanik sembollü vanilya mum.", size: "7x8 cm", slug: "vanilya-mum-sembol" },
    { id: "sukulent-saksisi", name: "Sukulent Saksısı", price: 618, cat: "palet", desc: "Minimalist seramik sukulent saksısı.", size: "10x8 cm", slug: "sukulent-saksisi" },
    { id: "espresso-kupa", name: "Stoneware Espresso Kupası", price: 720, cat: "kupalar", desc: "Ergonomik stoneware kupa.", size: "200 ml", slug: "espresso-kupa" },
    { id: "elsokmal-kupa", name: "El Sokmalı Stoneware Kupa", price: 720, cat: "kupalar", desc: "Benzersiz kavrama tasarımı.", size: "350 ml", slug: "elsokmal-kupa" },
    { id: "kibrit-kutusu", name: "Kibrit Kutusu", price: 849, cat: "duvar", desc: "Geyik rölyefli seramik kutu.", size: "10x6 cm", slug: "kibrit-kutusu" },
    { id: "seramik-kolye", name: "Seramik Kolye", price: 720, cat: "taki", desc: "Mavi el yapımı seramik kolye.", size: "3 cm çap", slug: "seramik-kolye" },
    { id: "nazar-mum", name: "Nazar Mumluk", price: 848, cat: "mumluk", desc: "Nazarlık sembollü seramik mumluk.", size: "8x8 cm", slug: "nazmum" },
    { id: "cay-kupasi", name: "Çay Kupası", price: 720, cat: "kupalar", desc: "Vintage çiçek desenli çay kupası.", size: "8x7.5 cm", slug: "cay" },
    { id: "boho-mum", name: "Boho Mumluk", price: 848, cat: "mumluk", desc: "Bohem tarzı seramik mumluk.", size: "8x8 cm", slug: "boho" },
    { id: "ceylan-saksi", name: "Ceylan Saksı", price: 618, cat: "palet", desc: "Ceylan figürlü dekoratif saksı.", size: "8x10 cm", slug: "ceylan" },
    { id: "salyangoz-saksi", name: "Salyangoz Saksı", price: 618, cat: "palet", desc: "Salyangoz figürlü dekoratif saksı.", size: "8x10 cm", slug: "salyangoz" },
    { id: "nazar-saksi", name: "Nazar Saksı", price: 618, cat: "palet", desc: "Nazar motifli dekoratif saksı.", size: "8x10 cm", slug: "nazar" }
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
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  // =========================
  // GÖRSEL TAMİRİ (BURASI ÖNEMLİ)
  // =========================
  function buildCandidates(base) {
    // Sadece gerçek uzantıları bıraktık, hatalı .jpg.jpeg sildik
    const exts = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".PNG"];
    return exts.map((ext) => `images/${base}${ext}`);
  }

  function setImgWithFallback(imgEl, base) {
    const list = buildCandidates(base);
    let i = 0;
    function tryNext() {
      if (i >= list.length) {
        // Hiçbiri yoksa varsayılan placeholder koyabilirsin
        return; 
      }
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
  const checkoutWA = $("#checkoutWA");
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
  // State
  // =========================
  let filterCat = "all";
  let searchQ = "";
  let cartState = JSON.parse(localStorage.getItem("cogo_cart") || "[]");

  function maybeCloseOverlay() {
    const anyOpen = drawer?.classList.contains("isOpen") || cart?.classList.contains("isOpen") || (aiPanel && aiPanel.getAttribute("aria-hidden") === "false") || lb?.classList.contains("open");
    if (!anyOpen && overlay) { overlay.hidden = true; document.body.classList.remove("noScroll"); }
  }

  function showToast(msg, type = "success") {
    let toast = $("#cogoToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "cogoToast";
      toast.style.cssText = `position:fixed;bottom:84px;left:50%;transform:translateX(-50%) translateY(20px);background:${type === "success" ? "#1f1a17" : "#c0392b"};color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:700;z-index:99999;opacity:0;transition:all 0.25s ease;pointer-events:none;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === "success" ? "#1f1a17" : "#c0392b";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(-50%) translateY(20px)"; }, 2500);
  }

  // =========================
  // Panel / Cart / Drawer İşlemleri
  // =========================
  menuBtn?.addEventListener("click", () => { drawer?.classList.add("isOpen"); if (overlay) overlay.hidden = false; document.body.classList.add("noScroll"); });
  drawerClose?.addEventListener("click", () => { drawer?.classList.remove("isOpen"); maybeCloseOverlay(); });
  cartBtn?.addEventListener("click", () => { cart?.classList.add("isOpen"); if (overlay) overlay.hidden = false; document.body.classList.add("noScroll"); });
  cartClose?.addEventListener("click", () => { cart?.classList.remove("isOpen"); maybeCloseOverlay(); });

  function saveCart() { localStorage.setItem("cogo_cart", JSON.stringify(cartState)); updateCartUI(); }

  function addToCart(pid) {
    const p = products.find(x => x.id === pid);
    if (!p) return;
    const found = cartState.find(x => x.id === pid);
    if (found) found.qty += 1; else cartState.push({ id: pid, qty: 1 });
    saveCart(); showToast(`✓ ${p.name} sepete eklendi`); cart?.classList.add("isOpen");
  }

  function changeQty(pid, delta) {
    const found = cartState.find(x => x.id === pid);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) cartState = cartState.filter(x => x.id !== pid);
    saveCart();
  }

  function updateCartUI() {
    if (!cartItemsEl || !cartCountEl) return;
    const count = cartState.reduce((s, x) => s + x.qty, 0);
    cartCountEl.textContent = String(count);
    cartItemsEl.innerHTML = cartState.map(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return "";
      return `<div class="cartRow">
        <div class="cartRow__img"><img data-base="${p.slug}"></div>
        <div class="cartRow__info">
          <div class="cartRow__name">${p.name}</div>
          <div class="qty"><button onclick="window._qty('${p.id}',-1)">−</button><span>${item.qty}</span><button onclick="window._qty('${p.id}',1)">+</button></div>
        </div>
        <div class="cartRow__sum">${formatTL(p.price * item.qty)}</div>
      </div>`;
    }).join("") || `<div class="empty">Sepetin boş.</div>`;
    
    $$("img[data-base]", cartItemsEl).forEach(img => setImgWithFallback(img, img.dataset.base));
    const total = cartState.reduce((s, i) => s + (products.find(x => x.id === i.id)?.price || 0) * i.qty, 0);
    if (cartTotalEl) cartTotalEl.textContent = formatTL(total);
  }
  
  window._qty = (id, d) => changeQty(id, d);

  // =========================
  // RENDER
  // =========================
  function render() {
    const list = products.filter(p => (filterCat === "all" || p.cat === filterCat) && (p.name.toLowerCase().includes(searchQ)));
    grid.innerHTML = list.map(p => `
      <article class="pCard">
        <div class="pImg"><div class="galeri" data-gallery="${p.slug}"></div></div>
        <div class="pBody">
          <h3>${p.name}</h3>
          <p class="muted">${p.desc}</p>
          <div class="pMeta"><strong>${formatTL(p.price)}</strong></div>
          <div class="pActions">
            <button class="btn btn--soft" onclick="window._add('${p.id}')">Sepete Ekle</button>
            <button class="btn ask-cogo" data-product="${p.name}">✨ AI'a Sor</button>
          </div>
        </div>
      </article>`).join("");

    $$(".galeri").forEach(gal => {
      galleryBases(gal.dataset.gallery).forEach(base => {
        const img = document.createElement("img");
        setImgWithFallback(img, base);
        img.onclick = () => openLightbox(galleryBases(gal.dataset.gallery).map(b => `images/${b}.jpg`), 0); // Basit lightbox tetikleyici
        gal.appendChild(img);
      });
    });
  }

  window._add = id => addToCart(id);

  // =========================
  // AI
  // =========================
  async function askAI(text) {
    if (!aiMsgs) return;
    aiPanel.classList.add("isOpen"); aiPanel.setAttribute("aria-hidden", "false");
    const msg = document.createElement("div"); msg.className = "aiMsg me"; msg.textContent = text; aiMsgs.appendChild(msg);
    try {
      const r = await fetch(COGO_AI_URL, { method: "POST", body: JSON.stringify({ message: text }), headers: {"Content-Type":"application/json"} });
      const d = await r.json();
      const b = document.createElement("div"); b.className = "aiMsg"; b.textContent = d.reply || "Hata oluştu."; aiMsgs.appendChild(b);
    } catch(e) { showToast("AI Hatası", "error"); }
  }

  aiFab?.addEventListener("click", () => { aiPanel.classList.add("isOpen"); aiPanel.setAttribute("aria-hidden", "false"); });
  aiClose?.addEventListener("click", () => { aiPanel.classList.remove("isOpen"); aiPanel.setAttribute("aria-hidden", "true"); maybeCloseOverlay(); });

  document.addEventListener("click", e => {
    const btn = e.target.closest(".ask-cogo");
    if (btn) askAI(`${btn.dataset.product} hakkında bilgi verir misin?`);
  });

  // =========================
  // Başlat
  // =========================
  render(); updateCartUI(); updateAuthButton();
  overlay?.addEventListener("click", () => { drawer?.classList.remove("isOpen"); cart?.classList.remove("isOpen"); aiPanel?.classList.remove("isOpen"); maybeCloseOverlay(); });

})();