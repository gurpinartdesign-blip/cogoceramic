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

  // =========================
  // Ürünler — ✅ Açıklamalar ve boyutlar güncellendi
  // =========================
  const products = [
    {
      id: "aski", name: "Askı", price: 460, cat: "askilik",
      desc: "El yapımı seramik duvar askısı. Anahtarlık, takı veya hafif aksesuarlar için şık bir çözüm.",
      size: "15x8 cm", slug: "aski"
    },
    {
      id: "boga", name: "Boğa", price: 720, cat: "kupalar",
      desc: "Güç ve kararlılık arketipinden ilham alan el yapımı kupa. Her parça kendine özgü doku taşır.",
      size: "350 ml", slug: "boga"
    },
    {
      id: "buhur", name: "Tütsülük", price: 750, cat: "buhurdan",
      desc: "Meditasyon ve rahatlama ritüelleri için el yapımı seramik tütsülük. Çubuk ve koni tütsü uyumlu.",
      size: "12x5 cm", slug: "buhur"
    },
    {
      id: "elizi", name: "El İzi", price: 720, cat: "kupalar",
      desc: "Sanatçının el izinden ilham alınan kupa. Her parça biricik bir doku taşır — dünyada bir tane.",
      size: "20x15 cm", slug: "elizi"
    },
    {
      id: "fin", name: "Fincan", price: 420, cat: "mumluk",
      desc: "Çay veya kahve fincanı formunda romantik mumluk. Tealight mum ile kullanılır.",
      size: "8x7 cm", slug: "fin"
    },
    {
      id: "jpn", name: "Japon Kupa", price: 720, cat: "mumluk",
      desc: "Wabi-sabi estetiğinden ilham alınan el yapımı seramik mumluk. Doğal dokusuyla huzur ve sadelik yayar.",
      size: "300 ml", slug: "jpn"
    },
    {
      id: "kartal", name: "Kartal", price: 720, cat: "kupalar",
      desc: "Kartal figürlü el yapımı seramik kupa. Güç ve özgürlük enerjisi taşıyan, her sabah ilham veren özel bir parça.",
      size: "18x14 cm", slug: "kartal"
    },
    {
      id: "koku", name: "Oda Kokusu", price: 920, cat: "koku",
      desc: "Gözenekli seramik yapısıyla oda kokusunu yavaşça yayan el yapımı difüzör. Esans ile kullanılır.",
      size: "10x10 cm", slug: "koku"
    },
    {
      id: "pal2", name: "Bohem Buhurdan", price: 980, cat: "buhurdan",
      desc: "Bohem geometrik motiflerle bezeli premium buhurdanlık. Mum veya tütsü ile kullanılır.",
      size: "14x10 cm", slug: "pal2"
    },
    {
      id: "palet", name: "Palet", price: 480, cat: "palet",
      desc: "Sanatçılar için el yapımı seramik boya paleti. Renkleri karıştırmak için ideal yüzey dokusu.",
      size: "20x12 cm", slug: "palet"
    },
    {
      id: "stm", name: "Mumluk", price: 520, cat: "mumluk",
      desc: "Sade ve zarif el yapımı seramik mumluk. Standart tealight uyumlu, sofra veya raf için ideal.",
      size: "8x6 cm", slug: "stm"
    },
    {
      id: "takiset", name: "Takı Seti", price: 842, cat: "taki",
      desc: "Toprak tonlarında el yapımı seramik takı koleksiyonu. Küpe ve kolye içerir, her set özgün.",
      size: "Standart", slug: "takiset"
    },
    {
      id: "vint", name: "Vintage Kupa", price: 480, cat: "mumluk",
      desc: "Vintage estetikten ilham alınan el yapımı seramik mumluk. Tealight mum ile sıcak bir atmosfer yaratır.",
      size: "320 ml", slug: "vint"
    },
    {
      id: "yilan", name: "Yılan Kupa", price: 720, cat: "kupalar",
      desc: "Dönüşüm ve yenilenme sembolü yılan figürlü kupa. Güçlü bir karakter, sofrada konuşma başlatır.",
      size: "350 ml", slug: "yilan"
    },
    {
      id: "ev-buhur", name: "Ev Buhurdanlık", price: 850, cat: "buhurdan",
      desc: "Ev formunda dekoratif seramik buhurdanlık. Sıcaklık ve huzur hissi veren raf dekoru.",
      size: "10x10 cm", slug: "ev-buhur"
    },
    {
      id: "yin-yang-mum", name: "Yin Yang Mumluk", price: 670, cat: "mumluk",
      desc: "Siyah & beyaz dengeyi temsil eden el yapımı dekoratif mumluk. Meditasyon köşesi için ideal.",
      size: "9x6 cm", slug: "yin-yang-mum"
    },
    {
      id: "fircalik", name: "Seramik Fırçalık & Kalemlik", price: 580, cat: "kalemlik",
      desc: "Mavi mermer dokulu çok amaçlı organizer. Masa düzeni için şık ve işlevsel seramik kap.",
      size: "12x8 cm", slug: "fircalik"
    },
    {
      id: "nazar-duvar", name: "Nazar Duvar Süsü", price: 680, cat: "duvar",
      desc: "Etnik bohem stil, nazar boncuğu temalı seramik duvar dekoru. Enerji koruma sembolü.",
      size: "10 cm", slug: "nazar-duvar"
    },
    {
      id: "flora-yuzuk", name: "Flora Seramik Yüzük", price: 380, cat: "taki",
      desc: "Toprak tonlarında çiçek detaylı el yapımı yüzük. Doğa ile bağlantı kuran zarif aksesuar.",
      size: "Ayarlanabilir", slug: "flora-yuzuk"
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
    const exts = [".jpg", ".jpeg", ".png", ".webp"];
    return exts.map((ext) => `images/${base}${ext}`);
  }

  function setImgWithFallback(imgEl, base) {
    const list = buildCandidates(base);
    let i = 0;

    function tryNext() {
      if (i >= list.length) {
        imgEl.remove();
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
  // Toast bildirimi — ✅ YENİ
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
    // ✅ YENİ: Toast bildirimi
    showToast(`✓ ${p.name} sepete eklendi`);
    openCart();
  }

  function changeQty(pid, delta) {
    const found = cartState.find((x) => x.id === pid);
    if (!found) return;

    found.qty += delta;
    if (found.qty <= 0) {
      cartState = cartState.filter((x) => x.id !== pid);
    }

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
          <div class="cartRow__img">
            <img data-base="${escapeHtml(p.slug)}" alt="${escapeHtml(p.name)}">
          </div>
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
        </div>
      `;
    }).join("");

    cartItemsEl.innerHTML = rows || `<div class="empty">Sepetin boş. Ürün ekleyelim 🙂</div>`;

    $$("img[data-base]", cartItemsEl).forEach((img) => {
      setImgWithFallback(img, img.dataset.base);
    });

    $$("[data-inc]", cartItemsEl).forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.inc, 1));
    });

    $$("[data-dec]", cartItemsEl).forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.dec, -1));
    });

    const total = getCartTotal();
    cartTotalEl.textContent = formatTL(total);

    const lines = cartState.map((item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? `• ${p.name} x${item.qty} — ${formatTL(p.price * item.qty)}` : "";
    }).filter(Boolean);

    const msg =
`Merhaba COGO Ceramic,
Sipariş vermek istiyorum:

${lines.join("\n")}

Toplam: ${formatTL(total)}
Ad Soyad:
Adres:
Not:`;

    checkoutWA.href = waLink(msg);
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
    $$(".catPill").forEach((b) => {
      b.classList.toggle("isActive", b.dataset.filter === cat);
    });
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

          <div class="pActions">
            <button class="btn btn--soft" data-add="${escapeHtml(p.id)}">Sepete Ekle</button>

            <a class="btn" href="${waLink(`Merhaba COGO Ceramic, ${p.name} ürününü satın almak istiyorum.`)}" target="_blank" rel="noopener">
              Satın Al
            </a>

            <button
              class="btn ask-cogo"
              data-product="${escapeHtml(p.name)}"
              data-price="${escapeHtml(String(p.price))}"
              data-cat="${escapeHtml(p.cat)}">
              <span class="desktop-label">✨ CoGo AI'a Sor</span>
              <span class="mobile-label">✨ AI</span>
            </button>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-add]", grid).forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.add));
    });

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

    lbList = list;
    lbIndex = index;
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
  lb?.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });

  function wireGalleries() {
    $$(".galeri").forEach((gal) => {
      const imgs = $$("img", gal).filter((im) => im && im.src);

      imgs.forEach((img, i) => {
        img.addEventListener("click", () => {
          const list = imgs.map((x) => x.src);
          openLightbox(list, i);
        });
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

  aiFab?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAiPanel();
  });

  aiClose?.addEventListener("click", (e) => {
    e.preventDefault();
    closeAiPanel();
  });

  async function askAI(text) {
    if (!text) return;

    openAiPanel();
    addUserMsg(text);
    addBotMsg("✨ düşünüyorum...");

    try {
      const res = await fetch(COGO_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
    if (quickBtn) {
      const q = quickBtn.dataset.aiquick;
      if (q) askAI(q);
      return;
    }

    const askBtn = e.target.closest(".ask-cogo");
    if (askBtn) {
      const product = askBtn.dataset.product;
      const price = askBtn.dataset.price;
      const cat = askBtn.dataset.cat;

      const q =
`Bu ürün hakkında kısa bilgi ver, kime hediye edilir ve 3 farklı öneri sun:
Ürün: ${product}
Kategori: ${cat}
Fiyat: ${price} TL`;

      askAI(q);
      return;
    }
  });

  // =========================
  // ✅ GÜNCELLENDİ: Müşteri bilgi modalı + PayTR
  // =========================

  // Modal HTML'i sayfaya ekle
  function injectPaymentModal() {
    if (document.getElementById("cogoPayModal")) return;

    const modal = document.createElement("div");
    modal.id = "cogoPayModal";
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99998;
      background:rgba(0,0,0,0.5);
      display:none; align-items:center; justify-content:center;
      padding:20px;
    `;

    modal.innerHTML = `
      <div style="
        background:#fff; border-radius:24px;
        padding:28px; width:min(440px, 100%);
        box-shadow:0 24px 60px rgba(0,0,0,0.2);
        position:relative;
      ">
        <button id="cogoPayModalClose" style="
          position:absolute; top:16px; right:16px;
          width:36px; height:36px; border-radius:12px;
          border:1px solid rgba(0,0,0,0.1);
          background:rgba(0,0,0,0.04);
          cursor:pointer; font-size:16px;
        ">✕</button>

        <div style="font-weight:900; font-size:1.2rem; margin-bottom:6px;">Teslimat Bilgileri</div>
        <div style="color:#7a6e65; font-size:0.88rem; margin-bottom:20px;">Siparişini tamamlamak için bilgilerini gir.</div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:800; color:#7a6e65; display:block; margin-bottom:5px;">Ad Soyad *</label>
            <input id="payName" type="text" placeholder="Ahmet Yılmaz" style="
              width:100%; height:44px; border-radius:12px;
              border:1px solid rgba(0,0,0,0.12);
              padding:0 14px; font-size:14px; outline:none;
            " />
          </div>
          <div>
            <label style="font-size:12px; font-weight:800; color:#7a6e65; display:block; margin-bottom:5px;">Telefon *</label>
            <input id="payPhone" type="tel" placeholder="05XX XXX XX XX" style="
              width:100%; height:44px; border-radius:12px;
              border:1px solid rgba(0,0,0,0.12);
              padding:0 14px; font-size:14px; outline:none;
            " />
          </div>
          <div>
            <label style="font-size:12px; font-weight:800; color:#7a6e65; display:block; margin-bottom:5px;">E-posta *</label>
            <input id="payEmail" type="email" placeholder="ornek@mail.com" style="
              width:100%; height:44px; border-radius:12px;
              border:1px solid rgba(0,0,0,0.12);
              padding:0 14px; font-size:14px; outline:none;
            " />
          </div>
          <div>
            <label style="font-size:12px; font-weight:800; color:#7a6e65; display:block; margin-bottom:5px;">Adres *</label>
            <textarea id="payAddress" placeholder="Mahalle, cadde, sokak, kapı no, şehir" style="
              width:100%; height:90px; border-radius:12px;
              border:1px solid rgba(0,0,0,0.12);
              padding:10px 14px; font-size:14px; outline:none;
              resize:none; font-family:inherit;
            "></textarea>
          </div>
        </div>

        <div id="payFormError" style="
          color:#c0392b; font-size:12px; margin-top:8px; display:none;
        ">Lütfen tüm alanları doldurun.</div>

        <button id="cogoPayConfirm" style="
          width:100%; height:48px; margin-top:16px;
          border-radius:999px; border:none;
          background:#1f1a17; color:#fff;
          font-size:14px; font-weight:800;
          cursor:pointer;
        ">Ödemeye Geç →</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cogoPayModalClose").addEventListener("click", closePayModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closePayModal(); });
    document.getElementById("cogoPayConfirm").addEventListener("click", submitPayment);
  }

  function openPayModal() {
    injectPaymentModal();
    const modal = document.getElementById("cogoPayModal");
    if (modal) {
      modal.style.display = "flex";
      document.body.classList.add("noScroll");
    }
  }

  function closePayModal() {
    const modal = document.getElementById("cogoPayModal");
    if (modal) {
      modal.style.display = "none";
      document.body.classList.remove("noScroll");
    }
  }

  async function submitPayment() {
    const name = document.getElementById("payName")?.value.trim();
    const phone = document.getElementById("payPhone")?.value.trim();
    const email = document.getElementById("payEmail")?.value.trim();
    const address = document.getElementById("payAddress")?.value.trim();
    const errEl = document.getElementById("payFormError");
    const confirmBtn = document.getElementById("cogoPayConfirm");

    if (!name || !phone || !email || !address) {
      if (errEl) errEl.style.display = "block";
      return;
    }
    if (errEl) errEl.style.display = "none";

    const totalText = document.getElementById("cartTotal")?.textContent || "₺0";
    const totalPrice = Number(totalText.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

    if (!totalPrice || totalPrice <= 0) {
      showToast("Sepet boş görünüyor.", "error");
      closePayModal();
      return;
    }

    // Gerçek sepet içeriğini hazırla
    const cartItems = cartState.map((item) => {
      const p = products.find((x) => x.id === item.id);
      return p ? [p.name, p.price.toFixed(2), item.qty] : null;
    }).filter(Boolean);

    confirmBtn.textContent = "İşleniyor...";
    confirmBtn.disabled = true;

    try {
      const response = await fetch(PAYTR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: totalPrice,
          email,
          user_name: name,
          user_address: address,
          user_phone: phone,
          cart_items: cartItems
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("Ödeme başlatılamadı. Tekrar dene.", "error");
        confirmBtn.textContent = "Ödemeye Geç →";
        confirmBtn.disabled = false;
        return;
      }

      const token = data?.paytr_response?.token;
      const status = data?.paytr_response?.status;

      if (status !== "success" || !token) {
        showToast("PayTR hatası. WhatsApp ile sipariş ver.", "error");
        confirmBtn.textContent = "Ödemeye Geç →";
        confirmBtn.disabled = false;
        return;
      }

      closePayModal();
      window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`;

    } catch (err) {
      console.error(err);
      showToast("Bağlantı hatası. Tekrar dene.", "error");
      confirmBtn.textContent = "Ödemeye Geç →";
      confirmBtn.disabled = false;
    }
  }

  // Global startPayment artık modalı açıyor
  window.startPayment = function () {
    if (cartState.length === 0) {
      showToast("Sepet boş. Önce ürün ekle.", "error");
      return;
    }
    openPayModal();
  };

  // =========================
  // Overlay + WhatsApp + ESC
  // =========================
  overlay?.addEventListener("click", () => {
    closeDrawer();
    closeCart();
    closeAiPanel();
    closeLightbox();
  });

  if (waDrawer) {
    waDrawer.href = waLink("Merhaba COGO Ceramic, ürünler hakkında bilgi almak istiyorum.");
  }

  if (waBottom) {
    waBottom.href = waLink("Merhaba COGO Ceramic, sipariş vermek istiyorum.");
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeCart();
      closeAiPanel();
      closeLightbox();
      closePayModal();
    }

    if (lb?.classList.contains("open")) {
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    }
  });

  // =========================
  // İlk yükleme
  // =========================
  render();
  updateCartUI();
})();