(() => {
"use strict";

/* =========================
   AYARLAR
========================= */

const WHATSAPP_NUMBER = "905529341223";
const COGO_AI_URL = "https://cogo-ai.gurpinartdesign.workers.dev/";
const SITE_URL = "https://cogoceramic.com";

/* =========================
   ÜRÜNLER
========================= */

const products = [
  { id:"kartal", cat:"kupalar", name:"Kartal Arketipi Kupa", price:890, slug:"kartal" },
  { id:"yilan", cat:"kupalar", name:"Yılan Dönüşüm Kupası", price:890, slug:"yilan" },
  { id:"mamut", cat:"kupalar", name:"Mamut Hafıza Kupası", price:890, slug:"mamut" },
  { id:"boga", cat:"kupalar", name:"Boğa Güç Kupası", price:890, slug:"boga" },
  { id:"elizi", cat:"taki", name:"El İzi Ritüel Parça", price:690, slug:"elizi" },
  { id:"tutsuluk", cat:"buhurdan", name:"Tütsülük", price:520, slug:"tutsuluk" }
];

/* =========================
   DOM
========================= */

const aiFab   = document.getElementById("cogoAiFab");
const aiPanel = document.getElementById("cogoAiPanel");
const aiClose = document.getElementById("cogoAiClose");
const aiMsgs  = document.getElementById("cogoAiMsgs");
const aiForm  = document.getElementById("cogoAiForm");
const aiInput = document.getElementById("cogoAiInput");

/* =========================
   PANEL AÇ / KAPA
========================= */

function openAiPanel(){
  aiPanel.classList.add("isOpen");
  aiPanel.setAttribute("aria-hidden","false");
}

function closeAiPanel(){
  aiPanel.classList.remove("isOpen");
  aiPanel.setAttribute("aria-hidden","true");
}

aiFab.onclick = openAiPanel;
aiClose.onclick = closeAiPanel;

/* =========================
   CHAT UI
========================= */

function addUserMsg(text){
  const div = document.createElement("div");
  div.className = "cogoAI__msg isUser";
  div.textContent = text;
  aiMsgs.appendChild(div);
}

function addBotMsg(text){
  const div = document.createElement("div");
  div.className = "cogoAI__msg isBot";
  div.textContent = text;
  aiMsgs.appendChild(div);
}

/* =========================
   ÜRÜN ÖNERİ SİSTEMİ
========================= */

function findProducts(text){
  const t = text.toLowerCase();

  let matches = products.filter(p =>
    t.includes("kupa") && p.cat === "kupalar" ||
    t.includes("tütsü") && p.cat === "buhurdan" ||
    t.includes("hediye")
  );

  if(matches.length === 0){
    matches = products.slice(0,3);
  }

  return matches.slice(0,3);
}

/* =========================
   AI İSTEĞİ
========================= */

async function askAI(text){

  addUserMsg(text);
  addBotMsg("✨ düşünüyorum...");

  try{
    const res = await fetch(COGO_AI_URL + "?q=" + encodeURIComponent(text));
    const data = await res.json();

    aiMsgs.lastChild.remove();

    let answer = data.text || data.reply || "Senin için öneriler hazırladım ✨";

    // ürün önerileri
    const found = findProducts(text);

    let links = "\n\n✨ Sana uygun ürünler:\n\n";

    found.forEach(p=>{
      links += `🔸 ${p.name} - ₺${p.price}\n👉 ${SITE_URL}/#urunler?urun=${p.slug}\n\n`;
    });

    addBotMsg(answer + links);

  }catch(e){
    aiMsgs.lastChild.remove();
    addBotMsg("Şu an cevap veremiyorum 😔");
  }
}

/* =========================
   FORM SUBMIT
========================= */

aiForm.onsubmit = (e)=>{
  e.preventDefault();
  const q = aiInput.value.trim();
  if(!q) return;
  aiInput.value = "";
  askAI(q);
};

/* =========================
   ÜRÜN BUTONU
========================= */

document.addEventListener("click", e=>{
  const btn = e.target.closest(".ask-cogo");
  if(!btn) return;

  const product = btn.dataset.product;
  const price = btn.dataset.price;
  const cat = btn.dataset.cat;

  const question = `${product} ürünü hakkında bilgi ver ve kime uygun olduğunu söyle`;

  openAiPanel();
  askAI(question);
});

})();
