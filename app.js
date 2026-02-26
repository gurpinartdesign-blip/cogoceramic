/* =========================
   COGO Ceramic — app.js
   ========================= */
(() => {
  "use strict";

  // =========================
  // 0) Ayarlar
  // =========================
  const API_BASE = "https://cogo-ai.gurpinartdesign.workers.dev"; // sondaki / yok
  const WHATSAPP_NUMBER = "905529341223";

  // ✅ Ürünler (şimdilik senin index’teki 6 ürün)
  const products = [
    { id:"kartal",   cat:"kupalar",  name:"Kartal Arketipi Kupa",   price: 890, desc:"Yüksek görüş, özgürlük ve farkındalık teması.", size:"200 ml • 8 × 7.5 cm", slug:"kartal" },
    { id:"yilan",    cat:"kupalar",  name:"Yılan Dönüşüm Kupası",   price: 890, desc:"Dönüşüm, yeniden doğuş ve şifa teması.",       size:"200 ml • 8 × 7.5 cm", slug:"yilan" },
    { id:"mamut",    cat:"kupalar",  name:"Mamut Hafıza Kupası",    price: 890, desc:"Kökler, dayanıklılık ve kadim hafıza teması.",  size:"200 ml • 8 × 7.5 cm", slug:"mamut" },
    { id:"boga",     cat:"kupalar",  name:"Boğa Güç Kupası",        price: 890, desc:"Güç, köklenme ve kararlılık teması.",           size:"200 ml • 8 × 7.5 cm", slug:"boga" },
    { id:"elizi",    cat:"taki",     name:"El İzi Ritüel Parça",    price: 690, desc:"İz, bağlantı ve sembolik korunma teması.",      size:"Mini • el yapımı",    slug:"elizi" },
    { id:"tutsuluk", cat:"buhurdan", name:"Tütsülük (Minimal)",     price: 520, desc:"Duman akışı için dengeli form.",                size:"Seramik",             slug:"tutsuluk" },
  ];

  // =========================
  // Helpers
  // =========================
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function waLink(text){
    const msg = encodeURIComponent(text);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
  function formatTL(n){
    return "₺" + (Number(n)||0).toLocaleString("tr-TR");
  }

  // Görsel uzantı fallback
  function buildCandidates(base){
    const exts = [".jpg.jpeg", ".jpg", ".jpeg", ".png", ".webp"];
    return exts.map(ext => `images/${base}${ext}`);
  }
  function setImgWithFallback(imgEl, base){
    const list = buildCandidates(base);
    let i = 0;
    imgEl.src = list[i];
    imgEl.onerror = () => {
      i += 1;
      if(i < list.length) imgEl.src = list[i];
      else imgEl.remove();
    };
  }
  function galleryBases(slug){
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

  // Lightbox
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");

  // CoGo AI
  const aiFab   = $("#cogoAiFab");
  const aiPanel = $("#cogoAiPanel");
  const aiClose = $("#cogoAiClose");
  const aiMsgs  = $("#cogoAiMsgs");
  const aiForm  = $("#cogoAiForm");
  const aiInput = $("#cogoAiInput");

  if(!grid) return;

  // =========================
  // Drawer
  // =========================
  function openDrawer(){
    if(!drawer || !overlay) return;
    drawer.classList.add("isOpen");
    drawer.setAttribute("aria-hidden","false");
    overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeDrawer(){
    if(!drawer || !overlay) return;
    drawer.classList.remove("isOpen");
    drawer.setAttribute("aria-hidden","true");
    // cart/ai açık değilse overlay kapat
    const anyOpen = (cart?.classList.contains("isOpen")) || (aiPanel?.classList.contains("open"));
    if(!anyOpen){
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }
  menuBtn?.addEventListener("click", openDrawer);
  drawerClose?.addEventListener("click", closeDrawer);

  if(drawer){
    $$("[data-cat]", drawer).forEach(a=>{
      a.addEventListener("click",(e)=>{
        e.preventDefault();
        filterCat = a.dataset.cat || "all";
        setActivePill(filterCat);
        render();
        closeDrawer();
        $("#urunler")?.scrollIntoView({behavior:"smooth"});
      });
    });
  }

  overlay?.addEventListener("click", ()=>{ closeDrawer(); closeCart(); closeAiPanel(); closeLightbox(); });

  // =========================
  // Cart
  // =========================
  let cartState = JSON.parse(localStorage.getItem("cogo_cart") || "[]");

  function saveCart(){
    localStorage.setItem("cogo_cart", JSON.stringify(cartState));
    updateCartUI();
  }
  function openCart(){
    if(!cart || !overlay) return;
    cart.classList.add("isOpen");
    cart.setAttribute("aria-hidden","false");
    overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeCart(){
    if(!cart || !overlay) return;
    cart.classList.remove("isOpen");
    cart.setAttribute("aria-hidden","true");
    const anyOpen = (drawer?.classList.contains("isOpen")) || (aiPanel?.classList.contains("open"));
    if(!anyOpen){
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }
  cartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  function addToCart(pid){
    const p = products.find(x=>x.id===pid);
    if(!p) return;
    const found = cartState.find(x=>x.id===pid);
    if(found) found.qty += 1;
    else cartState.push({id:pid, qty:1});
    saveCart();
    openCart();
  }
  function changeQty(pid, delta){
    const found = cartState.find(x=>x.id===pid);
    if(!found) return;
    found.qty += delta;
    if(found.qty <= 0) cartState = cartState.filter(x=>x.id!==pid);
    saveCart();
  }

  function updateCartUI(){
    if(!cartItemsEl || !cartCountEl || !cartTotalEl || !checkoutWA) return;

    const count = cartState.reduce((s,x)=>s+x.qty,0);
    cartCountEl.textContent = String(count);

    const rows = cartState.map(item=>{
      const p = products.find(x=>x.id===item.id);
      if(!p) return "";
      return `
        <div class="cartRow">
          <div class="cartRow__img"><img data-base="${p.slug}" alt="${p.name}"></div>
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
    }).join("");

    cartItemsEl.innerHTML = rows || `<div class="empty">Sepetin boş. Ürün ekleyelim 🙂</div>`;

    $$("img[data-base]", cartItemsEl).forEach(img=>{
      setImgWithFallback(img, img.dataset.base);
    });

    $$("[data-inc]", cartItemsEl).forEach(btn=>btn.addEventListener("click",()=>changeQty(btn.dataset.inc, +1)));
    $$("[data-dec]", cartItemsEl).forEach(btn=>btn.addEventListener("click",()=>changeQty(btn.dataset.dec, -1)));

    const total = cartState.reduce((s,item)=>{
      const p = products.find(x=>x.id===item.id);
      return s + (p ? p.price * item.qty : 0);
    },0);
    cartTotalEl.textContent = formatTL(total);

    const lines = cartState.map(item=>{
      const p = products.find(x=>x.id===item.id);
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

  clearCartBtn?.addEventListener("click", ()=>{
    cartState = [];
    saveCart();
  });

  // =========================
  // Filters / Render
  // =========================
  let filterCat = "all";
  let searchQ = "";

  function setActivePill(cat){
    $$(".catPill").forEach(b=>b.classList.toggle("isActive", b.dataset.filter === cat));
  }

  $$(".catPill").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      filterCat = btn.dataset.filter || "all";
      setActivePill(filterCat);
      render();
    });
  });

  searchInput?.addEventListener("input", ()=>{
    searchQ = (searchInput.value||"").trim().toLowerCase();
    render();
  });

  function render(){
    const list = products
      .filter(p => filterCat === "all" ? true : p.cat === filterCat)
      .filter(p => {
        if(!searchQ) return true;
        const blob = (p.name + " " + p.desc + " " + p.cat).toLowerCase();
        return blob.includes(searchQ);
      });

    grid.innerHTML = list.map(p => `
      <article class="pCard" data-cat="${p.cat}">
        <div class="pImg">
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
            <button class="btn" data-ai="${p.id}">✨ CoGo AI’a Sor</button>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-add]", grid).forEach(btn=>{
      btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
    });

    $$("[data-ai]", grid).forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const p = products.find(x=>x.id===btn.dataset.ai);
        const question =
`Bu ürün hakkında kısa bilgi ver, kime hediye edilir ve 3 farklı öneri sun:
Ürün: ${p?.name}
Kategori: ${p?.cat}
Fiyat: ${p?.price} TL`;
        openAiPanel();
        pushMe(question);
        askAI(question);
      });
    });

    // Galerileri doldur
    $$("[data-gallery]", grid).forEach(gal=>{
      const slug = gal.dataset.gallery;
      const bases = galleryBases(slug);
      bases.forEach(base=>{
        const img = document.createElement("img");
        img.alt = slug;
        img.loading = "lazy";
        img.dataset.base = base;
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

  function openLightbox(list, index){
    if(!lb || !lbImg) return;
    lbList = list;
    lbIndex = index;
    lbImg.src = lbList[lbIndex];
    lb.classList.add("open");
    lb.setAttribute("aria-hidden","false");
    document.body.classList.add("noScroll");
  }
  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden","true");
    document.body.classList.remove("noScroll");
  }
  function stepLightbox(dir){
    if(!lbList.length || !lbImg) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
  }

  lbClose?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", ()=>stepLightbox(-1));
  lbNext?.addEventListener("click", ()=>stepLightbox(+1));
  lb?.addEventListener("click", (e)=>{ if(e.target === lb) closeLightbox(); });

  function wireGalleries(){
    $$(".galeri").forEach(gal=>{
      const imgs = $$("img", gal).filter(im => im && im.src);

      imgs.forEach((img, i)=>{
        img.addEventListener("click", ()=>{
          const list = imgs.map(x=>x.src);
          openLightbox(list, i);
        });
      });
    });
  }

  // =========================
  // CoGo AI
  // =========================
  function openAiPanel(){
    if(!aiPanel || !overlay) return;
    aiPanel.classList.add("open"); // CSS'in open sınıfını kullandık
    aiPanel.setAttribute("aria-hidden","false");
    overlay.hidden = false;
    document.body.classList.add("noScroll");
    if(aiMsgs && aiMsgs.childElementCount===0){
      pushAI("Selam ✨ Ben CoGo AI. Ürünlerin anlamı, hediye önerisi veya kişiselleştirme için yazabilirsin.");
    }
  }
  function closeAiPanel(){
    if(!aiPanel || !overlay) return;
    aiPanel.classList.remove("open");
    aiPanel.setAttribute("aria-hidden","true");
    const anyOpen = (drawer?.classList.contains("isOpen")) || (cart?.classList.contains("isOpen"));
    if(!anyOpen){
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }
  aiFab?.addEventListener("click", openAiPanel);
  aiClose?.addEventListener("click", closeAiPanel);

  function pushMe(text){
    if(!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "aiMsg me";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }
  function pushAI(text){
    if(!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "aiMsg";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  async function askAI(text){
    try{
      pushAI("… düşünüyorum");
      const url = `${API_BASE}?q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { method:"GET" });
      const data = await res.json();

      // “düşünüyorum” mesajını sil
      aiMsgs?.lastChild?.remove();

      // Worker bazen {text: "..."} döndürür
      pushAI(data?.text || data?.reply || "Şu an cevap veremedim. Bir daha dener misin?");
    }catch(e){
      aiMsgs?.lastChild?.remove();
      pushAI("CoGo AI şu an cevap veremedi. (Endpoint / CORS kontrol edelim)");
    }
  }

  $$("[data-aiquick]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      openAiPanel();
      const t = btn.dataset.aiquick;
      pushMe(t);
      askAI(t);
    });
  });

  aiForm?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const t = (aiInput?.value || "").trim();
    if(!t) return;
    openAiPanel();
    pushMe(t);
    aiInput.value = "";
    askAI(t);
  });

  // =========================
  // WhatsApp linkleri
  // =========================
  if(waDrawer) waDrawer.href = waLink("Merhaba COGO Ceramic, ürünler hakkında bilgi almak istiyorum.");
  if(waBottom) waBottom.href = waLink("Merhaba COGO Ceramic, sipariş vermek istiyorum.");

  // ESC
  window.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      closeDrawer(); closeCart(); closeLightbox(); closeAiPanel();
    }
    if(lb?.classList.contains("open")){
      if(e.key === "ArrowLeft") stepLightbox(-1);
      if(e.key === "ArrowRight") stepLightbox(+1);
    }
  });

  // İlk yükleme
  render();
  updateCartUI();
})();
