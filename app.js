/* =========================
   COGO Ceramic — app.js
   (tek dosya, kopyala/yapıştır)
   ========================= */

(() => {
  "use strict";

  // ---- Ayarlar
  const WHATSAPP_NUMBER = "905529341223";

  // ✅ Ürünler
  // slug = images klasöründeki dosya adı kökü
  // Sistem şu uzantıları dener: .jpg.jpeg, .jpg, .jpeg, .png, .webp
  // Galeri için ayrıca: slug-1, slug-2, slug-3 dosyaları varsa otomatik çeker.
  const products = [
    // KUPALAR
    { id: "kartal", cat: "kupalar", name: "Kartal Arketipi Kupa", price: 890, desc: "Yüksek görüş, özgürlük ve farkındalık teması.", size: "200 ml • 8 × 7.5 cm", slug: "kartal" },
    { id: "yilan",  cat: "kupalar", name: "Yılan Dönüşüm Kupası",  price: 890, desc: "Dönüşüm, yeniden doğuş ve şifa teması.",        size: "200 ml • 8 × 7.5 cm", slug: "yilan" },
    { id: "mamut",  cat: "kupalar", name: "Mamut Hafıza Kupası",   price: 890, desc: "Kökler, dayanıklılık ve kadim hafıza teması.",   size: "200 ml • 8 × 7.5 cm", slug: "mamut" },
    { id: "boga",   cat: "kupalar", name: "Boğa Güç Kupası",       price: 890, desc: "Güç, köklenme ve kararlılık teması.",            size: "200 ml • 8 × 7.5 cm", slug: "boga" },

    // TAKI
    { id: "elizi",   cat: "taki", name: "El İzi Ritüel Parça", price: 690, desc: "İz, bağlantı ve sembolik korunma teması.", size: "Mini • el yapımı", slug: "elizi" },
    { id: "takiset", cat: "taki", name: "Takı Seti",           price: 864, desc: "Set ürün — detay için WhatsApp’tan yaz.",   size: "Seramik • set",   slug: "takiset" },

    // BUHURDAN / TÜTSÜLÜK
    { id: "buhur", cat: "buhurdan", name: "Buhurdanlık", price: 420, desc: "Buhur için tasarlanmış el yapımı form.", size: "Seramik", slug: "buhur" },

    // PAL (palasanto + buhurdan) — Model 1/2
    { id: "pal1", cat: "buhurdan", name: "Pal (Palasanto + Buhur) — Model 1", price: 820, desc: "Palasanto & buhurdanlık olarak kullanılabilir.", size: "Seramik", slug: "pal1" },
    { id: "pal2", cat: "buhurdan", name: "Pal (Palasanto + Buhur) — Model 2", price: 820, desc: "Palasanto & buhurdanlık olarak kullanılabilir.", size: "Seramik", slug: "pal2" },

    // PALO2 (sadece palasanto)
    { id: "palo2", cat: "buhurdan", name: "Palo — Palasanto (Tek Amaç)", price: 780, desc: "Sadece palasanto için tasarlanmıştır.", size: "Seramik", slug: "palo2" },

    // MUM / MUMLUK
    { id: "jpn",  cat: "mumluk", name: "Mum — JPN",  price: 520, desc: "Mum / mumluk ürün.", size: "Seramik", slug: "jpn" },
    { id: "fin",  cat: "mumluk", name: "Mum — FIN",  price: 520, desc: "Mum / mumluk ürün.", size: "Seramik", slug: "fin" },
    { id: "stm",  cat: "mumluk", name: "Mum — STM",  price: 520, desc: "Mum / mumluk ürün.", size: "Seramik", slug: "stm" },
    { id: "vint", cat: "mumluk", name: "Mum — VINT", price: 520, desc: "Mum / mumluk ürün.", size: "Seramik", slug: "vint" },

    // ASKILIK
    { id: "aski", cat: "askilik", name: "Askılık", price: 480, desc: "Duvar askılığı — el yapımı.", size: "Seramik", slug: "aski" },

    // ODA KOKUSU (fiyat söylemedin; şimdilik 520)
    { id: "koku", cat: "koku", name: "Oda Kokusu", price: 520, desc: "Koku ürün — detay için WhatsApp’tan yaz.", size: "Ürün", slug: "koku" },
  ];

  // -------------------------
  // Helpers
  // -------------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function waLink(text) {
    const msg = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
  function formatTL(n) {
    return "₺" + (Number(n) || 0).toLocaleString("tr-TR");
  }

  // Görsel çözümleyici: uzantı karmaşasını otomatik halleder
  function buildCandidates(base) {
    const exts = [".jpg.jpeg", ".jpg", ".jpeg", ".png", ".webp"];
    return exts.map((ext) => `images/${base}${ext}`);
  }
  function setImgWithFallback(imgEl, base) {
    const list = buildCandidates(base);
    let i = 0;
    imgEl.src = list[i];
    imgEl.onerror = () => {
      i += 1;
      if (i < list.length) imgEl.src = list[i];
      else imgEl.remove();
    };
  }
  // Galeri: slug-1, slug-2, slug-3 varsa + en son ana slug
  function galleryBases(slug) {
    return [`${slug}-1`, `${slug}-2`, `${slug}-3`, `${slug}`];
  }

  function aiMessageFor(p) {
    return `Merhaba CoGo AI ✨
${p.name} için kişiye özel tasarım yaptırmak istiyorum.

Ürün tipi: ${p.cat}
Tema/Arketip/Sembol:
Renk paleti:
İsim/İnitial (varsa):
Özel notlar:
Bütçe aralığı:
Teslim/şehir:`;
  }

  // -------------------------
  // DOM refs (varsa bağlan)
  // -------------------------
  const overlay     = $("#overlay");
  const drawer      = $("#drawer");
  const menuBtn     = $("#menuBtn");
  const drawerClose = $("#drawerClose");

  const cart        = $("#cart");
  const cartBtn     = $("#cartBtn");
  const cartClose   = $("#cartClose");

  const cartItemsEl = $("#cartItems");
  const cartCountEl = $("#cartCount");
  const cartTotalEl = $("#cartTotal");
  const checkoutWA  = $("#checkoutWA");
  const clearCartBtn= $("#clearCart");

  const grid        = $("#productGrid");
  const searchInput = $("#searchInput");

  // WhatsApp butonları (varsa)
  const waDrawer = $("#waDrawer");
  const waBottom = $("#waBottom");

  // Eğer sayfada gerekli elementler yoksa sessiz çık
  if (!grid) return;

  // -------------------------
  // Drawer
  // -------------------------
  function openDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add("isOpen");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove("isOpen");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
    document.body.classList.remove("noScroll");
  }

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);

  // Drawer menü linkleri kategori filtrelesin
  if (drawer) {
    $$("[data-cat]", drawer).forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        filterCat = a.dataset.cat || "all";
        setActivePill(filterCat);
        render();
        closeDrawer();
        const section = $("#urunler");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // Overlay tıklayınca kapat
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeDrawer();
      closeCart();
    });
  }

  // -------------------------
  // Cart
  // -------------------------
  let cartState = JSON.parse(localStorage.getItem("cogo_cart") || "[]");

  function saveCart() {
    localStorage.setItem("cogo_cart", JSON.stringify(cartState));
    updateCartUI();
  }

  function openCart() {
    if (!cart || !overlay) return;
    cart.classList.add("isOpen");
    cart.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeCart() {
    if (!cart || !overlay) return;
    cart.classList.remove("isOpen");
    cart.setAttribute("aria-hidden", "true");
    // Drawer kapalıysa overlay’i kapat
    if (!drawer || !drawer.classList.contains("isOpen")) {
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);

  function addToCart(pid) {
    const p = products.find((x) => x.id === pid);
    if (!p) return;
    const found = cartState.find((x) => x.id === pid);
    if (found) found.qty += 1;
    else cartState.push({ id: pid, qty: 1 });
    saveCart();
    openCart();
  }

  function changeQty(pid, delta) {
    const found = cartState.find((x) => x.id === pid);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) cartState = cartState.filter((x) => x.id !== pid);
    saveCart();
  }

  function updateCartUI() {
    if (!cartItemsEl || !cartCountEl || !cartTotalEl || !checkoutWA) return;

    const count = cartState.reduce((s, x) => s + x.qty, 0);
    cartCountEl.textContent = String(count);

    const rows = cartState
      .map((item) => {
        const p = products.find((x) => x.id === item.id);
        if (!p) return "";
        return `
          <div class="cartRow">
            <div class="cartRow__img">
              <img data-base="${p.slug}" alt="${p.name}">
            </div>
            <div class="cartRow__info">
              <div class="cartRow__name">${p.name}</div>
              <div class="cartRow__muted">${formatTL(p.price)} • ${String(p.cat).toUpperCase()}</div>
              <div class="qty">
                <button class="qtyBtn" data-dec="${p.id}">−</button>
                <span class="qtyNum">${item.qty}</span>
                <button class="qtyBtn" data-inc="${p.id}">+</button>
              </div>
            </div>
            <div class="cartRow__sum">${formatTL(p.price * item.qty)}</div>
          </div>
        `;
      })
      .join("");

    cartItemsEl.innerHTML = rows || `<div class="empty">Sepetin boş. Ürün ekleyelim 🙂</div>`;

    // Sepet görselleri fallback
    $$("img[data-base]", cartItemsEl).forEach((img) => {
      setImgWithFallback(img, img.dataset.base);
    });

    // +/- butonları
    $$("[data-inc]", cartItemsEl).forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.inc, +1)));
    $$("[data-dec]", cartItemsEl).forEach((btn) => btn.addEventListener("click", () => changeQty(btn.dataset.dec, -1)));

    const total = cartState.reduce((s, item) => {
      const p = products.find((x) => x.id === item.id);
      return s + (p ? p.price * item.qty : 0);
    }, 0);
    cartTotalEl.textContent = formatTL(total);

    const lines = cartState
      .map((item) => {
        const p = products.find((x) => x.id === item.id);
        return p ? `• ${p.name} x${item.qty} — ${formatTL(p.price * item.qty)}` : "";
      })
      .filter(Boolean);

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

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      cartState = [];
      saveCart();
    });
  }

  // -------------------------
  // Filtre / Arama / Render
  // -------------------------
  let filterCat = "all";
  let searchQ = "";

  function setActivePill(cat) {
    $$(".catPill").forEach((b) => b.classList.toggle("isActive", b.dataset.filter === cat));
  }

  // Kategori pill’leri
  $$(".catPill").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterCat = btn.dataset.filter || "all";
      setActivePill(filterCat);
      render();
    });
  });

  // Arama
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQ = (searchInput.value || "").trim().toLowerCase();
      render();
    });
  }

  function render() {
    const list = products
      .filter((p) => (filterCat === "all" ? true : p.cat === filterCat))
      .filter((p) => {
        if (!searchQ) return true;
        const blob = (p.name + " " + p.desc + " " + p.cat).toLowerCase();
        return blob.includes(searchQ);
      });

    grid.innerHTML = list
      .map((p) => `
        <article class="pCard" data-cat="${p.cat}">
          <div class="pImg">
            <!-- Kaydırmalı galeri -->
            <div class="galeri" data-gallery="${p.slug}"></div>
            <div class="pTag">${String(p.cat).toUpperCase()}</div>
          </div>

          <div class="pBody">
            <h3>${p.name}</h3>
            <p class="muted">${p.desc}</p>

            <div class="pMeta">
              <span class="meta">${p.size}</span>
              <strong class="price">${formatTL(p.price)}</strong>
            </div>

            <div class="pActions">
              <button class="btn btn--soft" data-add="${p.id}">Sepete Ekle</button>
              <a class="btn" href="${waLink("Merhaba COGO Ceramic, " + p.name + " için bilgi almak istiyorum.")}" target="_blank" rel="noopener">Sor</a>
            </div>

            <div class="pActions" style="margin-top:10px;">
              <a class="btn" href="${waLink(aiMessageFor(p))}" target="_blank" rel="noopener">✨ CoGo AI’a Yaptır</a>
            </div>
          </div>
        </article>
      `)
      .join("");

    // Sepete ekle
    $$("[data-add]", grid).forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.add));
    });

    // Galerileri doldur
    $$("[data-gallery]", grid).forEach((gal) => {
      const slug = gal.dataset.gallery;
      const bases = galleryBases(slug);
      bases.forEach((base) => {
        const img = document.createElement("img");
        img.alt = slug;
        img.loading = "lazy";
        // CSS yoksa da düzgün dursun:
        img.style.flex = "0 0 100%";
        img.style.height = "190px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "14px";
        img.style.scrollSnapAlign = "start";
        setImgWithFallback(img, base);
        gal.appendChild(img);
      });
    });
  }

  // -------------------------
  // WhatsApp linkleri (varsa)
  // -------------------------
  if (waDrawer) waDrawer.href = waLink("Merhaba COGO Ceramic, ürünler hakkında bilgi almak istiyorum.");
  if (waBottom) waBottom.href = waLink("Merhaba COGO Ceramic, sipariş vermek istiyorum.");

  // -------------------------
  // Kısayollar
  // -------------------------
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeCart();
    }
  });

  // İlk yükleme
  render();
  updateCartUI();
})();
