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
  const COGO_AI_URL = "https://cogo-ai.gurpinartdesign.workers.dev/";

  // =========================
  // Ürünler
  // NOT: images klasöründeki dosya adların:
  // aski.jpg, boga.jpg, buhur.jpg, buhurdan.jpg, elizi.jpg, fin.jpg, jpn.jpg, kartal.jpg, koku.jpg,
  // pal2.jpg, pal0.jpg, stm.jpg, takiset.jpg, vint.jpg, yilan.jpg
  // Bu yüzden slug = dosya adı (uzantısız)
  // =========================
  const products = [
    { id:"aski",     name:"Askı",        price:350, cat:"askilik",  desc:"", size:"", slug:"aski" },
    { id:"boga",     name:"Boğa",        price:400, cat:"dekor",    desc:"", size:"", slug:"boga" },
    { id:"buhur",    name:"Tütsülük",    price:250, cat:"buhurdan", desc:"", size:"", slug:"buhur" },
    { id:"buhurdan", name:"Buhurdan",    price:300, cat:"buhurdan", desc:"", size:"", slug:"buhurdan" },
    { id:"elizi",    name:"El İzi",      price:200, cat:"duvar",    desc:"", size:"", slug:"elizi" },
    { id:"fin",      name:"Fincan",      price:220, cat:"kupalar",  desc:"", size:"", slug:"fin" },
    { id:"jpn",      name:"Japon Kupa",  price:250, cat:"kupalar",  desc:"", size:"", slug:"jpn" },
    { id:"kartal",   name:"Kartal",      price:300, cat:"duvar",    desc:"", size:"", slug:"kartal" },
    { id:"koku",     name:"Oda Kokusu",  price:200, cat:"koku",     desc:"", size:"", slug:"koku" },
    { id:"pal2",     name:"Palet",       price:180, cat:"palet",    desc:"", size:"", slug:"pal2" },
    { id:"pal0",     name:"Palet 2",     price:180, cat:"palet",    desc:"", size:"", slug:"pal0" },
    { id:"stm",      name:"Mumluk",      price:220, cat:"mumluk",   desc:"", size:"", slug:"stm" },
    { id:"takiset",  name:"Takı Seti",   price:300, cat:"taki",     desc:"", size:"", slug:"takiset" },
    { id:"vint",     name:"Vintage Kupa",price:260, cat:"kupalar",  desc:"", size:"", slug:"vint" },
    { id:"yilan",    name:"Yılan Kupa",  price:260, cat:"kupalar",  desc:"", size:"", slug:"yilan" },
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
  // (Senin dosyaların .jpg olduğu için önce .jpg dene)
  function buildCandidates(base){
    const exts = [".jpg", ".jpeg", ".png", ".webp"];
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
    // Eğer sadece tek görsel varsa bile, son eleman `${slug}` çalışır.
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
    drawer?.classList.add("isOpen");
    drawer?.setAttribute("aria-hidden","false");
    if(overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeDrawer(){
    drawer?.classList.remove("isOpen");
    drawer?.setAttribute("aria-hidden","true");
    maybeCloseOverlay();
  }
  menuBtn?.addEventListener("click", openDrawer);
  drawerClose?.addEventListener("click", closeDrawer);

  let filterCat = "all";
  let searchQ = "";

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

  // =========================
  // Cart
  // =========================
  let cartState = JSON.parse(localStorage.getItem("cogo_cart") || "[]");

  function saveCart(){
    localStorage.setItem("cogo_cart", JSON.stringify(cartState));
    updateCartUI();
  }

  function openCart(){
    cart?.classList.add("isOpen");
    cart?.setAttribute("aria-hidden","false");
    if(overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }
  function closeCart(){
    cart?.classList.remove("isOpen");
    cart?.setAttribute("aria-hidden","true");
    maybeCloseOverlay();
  }

  cartBtn?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);

  function addToCart(pid){
    const p = products.find(x=>x.id===pid);
    if(!p) return;
    const found = cartState.find(x=>x.id===pid);
    if(found) found.qty += 1;
    else cartState.push({id: pid, qty: 1});
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

    $$("[data-inc]", cartItemsEl).forEach(btn=>{
      btn.addEventListener("click",()=>changeQty(btn.dataset.inc, +1));
    });
    $$("[data-dec]", cartItemsEl).forEach(btn=>{
      btn.addEventListener("click",()=>changeQty(btn.dataset.dec, -1));
    });

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
  function setActivePill(cat){
    $$(".catPill").forEach(b=>{
      b.classList.toggle("isActive", b.dataset.filter === cat);
    });
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
        const blob = (p.name + " " + (p.desc||"") + " " + p.cat).toLowerCase();
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
          ${p.desc ? `<p class="muted">${p.desc}</p>` : ``}

          <div class="pMeta">
            ${p.size ? `<span class="meta">${p.size}</span>` : `<span class="meta"></span>`}
            <strong class="price">${formatTL(p.price)}</strong>
          </div>

          <div class="pActions">
            <button class="btn btn--soft" data-add="${p.id}">Sepete Ekle</button>

            <a class="btn" href="${waLink(`Merhaba COGO Ceramic, ${p.name} ürününü satın almak istiyorum.`)}" target="_blank" rel="noopener">
              Satın Al
            </a>

            <button class="btn ask-cogo" data-product="${p.name}" data-price="${p.price}" data-cat="${p.cat}">
              ✨ CoGo AI’a Sor
            </button>
          </div>
        </div>
      </article>
    `).join("");

    $$("[data-add]", grid).forEach(btn=>{
      btn.addEventListener("click", ()=> addToCart(btn.dataset.add));
    });

    $$("[data-gallery]", grid).forEach(gal=>{
      const slug = gal.dataset.gallery;
      const bases = galleryBases(slug);
      bases.forEach(base=>{
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

  function openLightbox(list, index){
    if(!lb || !lbImg) return;
    lbList = list;
    lbIndex = index;
    lbImg.src = lbList[lbIndex];
    lb.classList.add("open");
    lb.setAttribute("aria-hidden","false");
    if(overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");
  }

  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden","true");
    maybeCloseOverlay();
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
  function aiPanelOpen(){
    return aiPanel && aiPanel.getAttribute("aria-hidden") === "false";
  }

  function openAiPanel(){
    if(!aiPanel) return;
    aiPanel.classList.add("isOpen");
    aiPanel.setAttribute("aria-hidden","false");
    if(overlay) overlay.hidden = false;
    document.body.classList.add("noScroll");

    if(aiMsgs && aiMsgs.childElementCount === 0){
      addBotMsg("Selam ✨ Ben CoGo AI. Ürünlerin anlamı, hediye önerisi veya kişiselleştirme için yazabilirsin.");
    }
  }

  function closeAiPanel(){
    if(!aiPanel) return;
    aiPanel.classList.remove("isOpen");
    aiPanel.setAttribute("aria-hidden","true");
    maybeCloseOverlay();
  }

  aiFab?.addEventListener("click", openAiPanel);
  aiClose?.addEventListener("click", closeAiPanel);

  function addUserMsg(text){
    if(!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "cogoAI__msg isUser";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  function addBotMsg(text){
    if(!aiMsgs) return;
    const div = document.createElement("div");
    div.className = "cogoAI__msg isBot";
    div.textContent = text;
    aiMsgs.appendChild(div);
    aiMsgs.scrollTop = aiMsgs.scrollHeight;
  }

  async function askAI(text){
    if(!text) return;
    openAiPanel();
    addUserMsg(text);
    addBotMsg("✨ düşünüyorum...");

    try{
      const url = `${COGO_AI_URL}?q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { method:"GET" });
      const data = await res.json();

      aiMsgs?.lastChild?.remove();
      addBotMsg(data?.text || data?.reply || "Şu an cevap veremedim. Bir daha dener misin?");
    }catch(e){
      aiMsgs?.lastChild?.remove();
      addBotMsg("CoGo AI şu an cevap veremedi. (Worker / CORS kontrol)");
    }
  }

  aiForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = (aiInput?.value || "").trim();
    if(!q) return;
    if(aiInput) aiInput.value = "";
    askAI(q);
  });

  $$(".cogoAI__chip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const q = btn.dataset.aiquick;
      if(!q) return;
      askAI(q);
    });
  });

  document.addEventListener("click",(e)=>{
    const btn = e.target.closest(".ask-cogo");
    if(!btn) return;

    const product = btn.dataset.product;
    const price = btn.dataset.price;
    const cat = btn.dataset.cat;

    const q =
`Bu ürün hakkında kısa bilgi ver, kime hediye edilir ve 3 farklı öneri sun:
Ürün: ${product}
Kategori: ${cat}
Fiyat: ${price} TL`;

    askAI(q);
  });

  // =========================
  // Overlay + WhatsApp + ESC
  // =========================
  function maybeCloseOverlay(){
    const anyOpen =
      drawer?.classList.contains("isOpen") ||
      cart?.classList.contains("isOpen") ||
      aiPanelOpen() ||
      lb?.classList.contains("open");

    if(!anyOpen && overlay){
      overlay.hidden = true;
      document.body.classList.remove("noScroll");
    }
  }

  overlay?.addEventListener("click", ()=>{
    closeDrawer(); closeCart(); closeAiPanel(); closeLightbox();
  });

  if(waDrawer) waDrawer.href = waLink("Merhaba COGO Ceramic, ürünler hakkında bilgi almak istiyorum.");
  if(waBottom) waBottom.href = waLink("Merhaba COGO Ceramic, sipariş vermek istiyorum.");

  window.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      closeDrawer(); closeCart(); closeAiPanel(); closeLightbox();
    }
    if(lb?.classList.contains("open")){
      if(e.key === "ArrowLeft") stepLightbox(-1);
      if(e.key === "ArrowRight") stepLightbox(+1);
    }
  });

  // =========================
  // İlk yükleme
  // =========================
  render();
  updateCartUI();
})();
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("cogoAiFab");
  const panel = document.getElementById("cogoAiPanel");
  const closeBtn = document.getElementById("cogoAiClose");

  if (!fab || !panel) return;

  fab.addEventListener("click", () => {
    panel.classList.toggle("isOpen");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("isOpen");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("cogoAiFab");
  const panel = document.getElementById("cogoAiPanel");
  const closeBtn = document.getElementById("cogoAiClose");

  if (!fab || !panel) {
    console.warn("CoGo AI: fab/panel bulunamadı", { fab, panel });
    return;
  }

  const openPanel = () => {
    panel.classList.add("isOpen");
    panel.setAttribute("aria-hidden", "false");
  };

  const closePanel = () => {
    panel.classList.remove("isOpen");
    panel.setAttribute("aria-hidden", "true");
  };

  fab.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPanel();
  });

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closePanel();
  });

  // Dışarı tıklayınca kapansın
  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("isOpen")) return;
    if (panel.contains(e.target) || fab.contains(e.target)) return;
    closePanel();
  });

  // ESC ile kapat
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
});
