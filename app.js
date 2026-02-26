(() => {
  "use strict";

  const WHATSAPP_NUMBER = "905529341223";
  const COGO_AI_URL = "https://cogo-ai.gurpinartdesign.workers.dev/";

  const products = [
    { id:"kartal",   cat:"kupalar",  name:"Kartal Arketipi Kupa",   price: 890, desc:"Yüksek görüş, özgürlük ve farkındalık teması.", size:"200 ml • 8 × 7.5 cm", slug:"kartal" },
    { id:"yilan",    cat:"kupalar",  name:"Yılan Dönüşüm Kupası",   price: 890, desc:"Dönüşüm, yeniden doğuş ve şifa teması.",       size:"200 ml • 8 × 7.5 cm", slug:"yilan" },
    { id:"mamut",    cat:"kupalar",  name:"Mamut Hafıza Kupası",    price: 890, desc:"Kökler, dayanıklılık ve kadim hafıza teması.",  size:"200 ml • 8 × 7.5 cm", slug:"mamut" },
    { id:"boga",     cat:"kupalar",  name:"Boğa Güç Kupası",        price: 890, desc:"Güç, köklenme ve kararlılık teması.",           size:"200 ml • 8 × 7.5 cm", slug:"boga" },
    { id:"elizi",    cat:"taki",     name:"El İzi Ritüel Parça",    price: 690, desc:"İz, bağlantı ve sembolik korunma teması.",      size:"Mini • el yapımı",    slug:"elizi" },
    { id:"tutsuluk", cat:"buhurdan", name:"Tütsülük (Minimal)",     price: 520, desc:"Duman akışı için dengeli form.",                size:"Seramik",             slug:"tutsuluk" },
  ];

  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function formatTL(n){
    return "₺" + (Number(n)||0).toLocaleString("tr-TR");
  }

  // --- Ürün görsel fallback (dosya isimlerin uygunsa çalışır, yoksa img boş kalır)
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
      else imgEl.style.display = "none";
    };
  }
  function galleryBases(slug){
    return [`${slug}-1`, `${slug}-2`, `${slug}-3`, `${slug}`];
  }

  // --- DOM
  const grid = $("#productGrid");
  if(!grid) return;

  // CoGo AI DOM
  const aiFab   = $("#cogoAiFab");
  const aiPanel = $("#cogoAiPanel");
  const aiClose = $("#cogoAiClose");
  const aiMsgs  = $("#cogoAiMsgs");
  const aiForm  = $("#cogoAiForm");
  const aiInput = $("#cogoAiInput");

  // --- Render
  let filterCat = "all";
  let searchQ = "";

  const searchInput = $("#searchInput");
  searchInput?.addEventListener("input", ()=>{
    searchQ = (searchInput.value||"").trim().toLowerCase();
    render();
  });

  $$(".catPill").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      filterCat = btn.dataset.filter || "all";
      $$(".catPill").forEach(b=>b.classList.toggle("isActive", b.dataset.filter === filterCat));
      render();
    });
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
            <button class="btn ask-cogo"
              data-product="${p.name}"
              data-price="${p.price}"
              data-cat="${p.cat}">
              ✨ CoGo AI’a Sor
            </button>
          </div>
        </div>
      </article>
    `).join("");

    // galerileri doldur
    $$("[data-gallery]", grid).forEach(gal=>{
      const slug = gal.dataset.gallery;
      galleryBases(slug).forEach(base=>{
        const img = document.createElement("img");
        img.alt = slug;
        img.loading = "lazy";
        setImgWithFallback(img, base);
        gal.appendChild(img);
      });
    });
  }

  // --- CoGo AI UI
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

  function openAiPanel(){
    if(!aiPanel) return;
    aiPanel.classList.add("isOpen");
    aiPanel.setAttribute("aria-hidden","false");
    if(aiMsgs && aiMsgs.childElementCount === 0){
      pushAI("Selam ✨ Ben CoGo AI. Ürünlerin anlamı, hediye önerisi veya kişiselleştirme için yazabilirsin.");
    }
  }
  function closeAiPanel(){
    if(!aiPanel) return;
    aiPanel.classList.remove("isOpen");
    aiPanel.setAttribute("aria-hidden","true");
  }

  aiFab?.addEventListener("click", openAiPanel);
  aiClose?.addEventListener("click", closeAiPanel);

  // ✅ Quick butonlar tıklanınca inputa yazsın + göndersin
  $$(".cogoAI__chip").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      const q = chip.dataset.aiquick || "";
      if(!q) return;
      openAiPanel();
      if(aiInput) aiInput.value = q;
      askAI(q);
    });
  });

  async function askAI(text){
    if(!text) return;
    openAiPanel();
    pushMe(text);
    pushAI("✨ düşünüyorum...");

    try{
      const url = `${COGO_AI_URL}?q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { method:"GET" });
      const data = await res.json();

      // thinking sil
      aiMsgs?.lastChild?.remove();

      pushAI(data?.text || data?.reply || "Şu an cevap veremedim. Bir daha dener misin?");
    }catch(e){
      aiMsgs?.lastChild?.remove();
      pushAI("CoGo AI şu an cevap veremedi. (Worker / CORS kontrol)");
    }
  }

  aiForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = (aiInput?.value || "").trim();
    if(!q) return;
    if(aiInput) aiInput.value = "";
    askAI(q);
  });

  // Ürün kartındaki “CoGo AI’a Sor”
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

  // İlk yükleme
  render();
})();