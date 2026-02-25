// app.js — COGO katalog (Excel: 12989555..., 23 ürün)
// Görselleri SEN ekleyeceksin: images/<klasör>/<BARKOD>-1.jpg  (istersen -2, -3)
// Otomatik klasörler: mum, kupa, kibrit, mutfak, taki, obje, diger

const STORE = {
  trendyol: "",      // istersen mağaza linkini yaz
  hepsiburada: ""    // istersen mağaza linkini yaz
};

const PRODUCTS = [
  {
    id: "232323C1",
    name: "El Yapımı Seramik Karga Heykeli – Gizli Hazneli Kapaklı Dekoratif Obje",
    categoryName: "Dekoratif Obje ve Biblo",
    folder: "obje",
    price: 2459.0,
    stock: 1,
    color: "siyah",
    size: "30 x 15",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-karga-heykeli-gizli-hazneli-kapakli-dekoratif-obje-p-990157779",
    description: "El yapımı seramikten üretilmiş bu karga heykeli, mistik ve güçlü bir atmosfer yaratmak isteyenler için tasarlanmıştır. Heykelin kapağı açılarak iç kısmındaki gizli hazneye küçük objeler, notlar veya değerli eşyalar saklanabilir. Seramiğin doğal dokusu ve mat siyah rengi, ürüne antik ve karakterli bir görünüm kazandırır. Her parça el yapımı olduğu için benzersizdir.\n\nÜrün Özellikleri:\n• Malzeme: Seramik\n• Renk: Siyah\n• Ölçü: 30 x 15 cm\n• Kullanım: Dekoratif obje, gizli hazne, hediye\n\nNot: El yapımı olduğu için renk ve dokuda küçük farklılıklar olabilir.\n\nCOGO seramik koleksiyonunun özgün ve anlamlı parçalarından biri olan bu karga heykeli, ev dekorasyonunda farklı ve özgün parçalar arayanlar için tasarlanmıştır."
  },
  {
    id: "65421GGD",
    name: "COGO El Yapımı Seramik Mum – Türk Sembolleri & Othala",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "siyah",
    size: "7 cm",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-mum-turk-sembolleri-othala-p-990157868",
    description: "COGO tarafından elde şekillendirilmiş ve tek tek üretilmiş seramik kap içerisinde hazırlanmış özel mum. Üzerindeki semboller Türk kültüründen ve Othala motifi gibi anlamlı figürlerden ilham alır. Dekoratif kullanım için uygundur.\n\nÜrün Özellikleri:\n• El yapımı seramik kap\n• Özel desen/motif\n• Dekoratif kullanım\n\nNot: El yapımı olduğu için her parça benzersizdir."
  },
  {
    id: "GBB8",
    name: "El Yapımı Seramik Geyik Biblo – Minimal Dekoratif Süs Objesi Seramik",
    categoryName: "Dekoratif Obje ve Biblo",
    folder: "obje",
    price: 1899.0,
    stock: 1,
    color: "siyah",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo/el-yapimi-seramik-geyik-biblo-minimal-dekoratif-sus-objesi-seramik-p-990157932",
    description: "El yapımı seramikten üretilmiş bu minimal geyik biblo, sade ve zarif dekorasyon tarzını sevenler için tasarlanmıştır. Doğal dokulu yüzeyi ve el işçiliği detaylarıyla evinize sıcak bir atmosfer katar. Her ürün el yapımı olduğu için benzersizdir."
  },
  {
    id: "M189319M",
    name: "El Yapımı Seramik Mumluk – Doğal Dokulu Siyah & Gri – Minimal Tasarım Seramik",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 689.0,
    stock: 1,
    color: "siyah",
    size: "7 cm",
    trendyolLink: "https://www.trendyol.com/cogo/el-yapimi-seramik-mumluk-dogal-dokulu-siyah-gri-minimal-tasarim-seramik-p-990158006",
    description: "Bu mumluk, tamamen el yapımı olarak şekillendirilmiştir. Doğal dokulu yüzeyi ve siyah-gri tonlarıyla minimal dekorasyon tarzına uygundur. Her parça benzersizdir.\n\nÜrün Özellikleri:\n• Malzeme: Seramik\n• Renk: Siyah & Gri\n• Boy: 7 cm\n• Kullanım: Mumluk / dekoratif"
  },
  {
    id: "M319MG",
    name: "Seramik El Yapımı Ritüel / Şamanik Mum",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "siyah",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo/seramik-el-yapimi-rituel-samanik-mum-p-990158082",
    description: "COGO tarafından elde şekillendirilmiş ve tek tek üretilmiş seramik kap içerisinde hazırlanmış ritüel/şamanik konseptli mum. Dekoratif ve anlamlı bir parça olarak kullanılabilir."
  },
  {
    id: "KKKR23",
    name: "El Yapımı Seramik Kibrit Kutusu | Geyik & Orman Rölyefli | Rustik Doğal Dekor",
    categoryName: "Dekoratif Kutu",
    folder: "kibrit",
    price: 2499.0,
    stock: 1,
    color: "kahverengi",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-kibrit-kutusu-geyik-orman-rolyefli-rustik-dogal-dekor-p-990158201",
    description: "El yapımı seramik kibrit kutusu. Geyik ve orman temalı rölyef detaylarıyla rustik dekorasyon için özel bir parçadır. Her ürün el yapımı olduğu için benzersizdir."
  },
  {
    id: "LMSK01",
    name: "Cogo Handmade Seramik Limon Sıkacağı – Kırmızı Çamur | Etnik Şamanik Tasarım",
    categoryName: "Limon Sıkacağı",
    folder: "mutfak",
    price: 499.0,
    stock: 1,
    color: "kırmızı",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-handmade-seramik-limon-sikacagi-kirmizi-camur-etnik-samanik-tasarim-p-990158333",
    description: "El yapımı seramik limon sıkacağı. Kırmızı çamurdan üretilmiş, etnik/şamanik dokunuşlarla tasarlanmıştır."
  },
  {
    id: "MUT02",
    name: "Cogo Handmade Seramik Kaşık & Çatal Seti – Kırmızı Çamur | Etnik Rustik Şamanik",
    categoryName: "Pişirme ve Servis Malzemesi",
    folder: "mutfak",
    price: 599.0,
    stock: 1,
    color: "kırmızı",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-handmade-seramik-kasik-catal-seti-kirmizi-camur-etnik-rustik-samanik-p-990158412",
    description: "El yapımı seramik kaşık ve çatal seti. Kırmızı çamur, etnik/rustik görünüm ve şamanik izler."
  },
  {
    id: "DUG01",
    name: "El Yapımı Seramik Düğme (2 Adet) | Köpek Motifli",
    categoryName: "Düğme",
    folder: "diger",
    price: 299.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-dugme-2-adet-kopek-motifli-p-990158522",
    description: "El yapımı seramik düğme. 2 adet olarak gönderilir. Dekoratif veya hobi projelerinde kullanılabilir."
  },
  {
    id: "KUPA01",
    name: "COGO El Yapımı Seramik Kupa | Kulpsuz Yunomi Form",
    categoryName: "Kupa",
    folder: "kupa",
    price: 799.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-kupa-kulsuz-yunomi-form-p-990158611",
    description: "El emeğiyle şekillendirilen kulpsuz seramik kupa. Yunomi formuyla sade ve karakterli bir kullanım sunar."
  },
  {
    id: "BRD01",
    name: "COGO El Yapımı Seramik Bardak | Doğal Doku",
    categoryName: "Bardak",
    folder: "kupa",
    price: 749.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-bardak-dogal-doku-p-990158721",
    description: "El yapımı seramik bardak. Doğal dokusu ve el işçiliği detaylarıyla her parça benzersizdir."
  },
  {
    id: "BRD02",
    name: "COGO El Yapımı Seramik Bardak | Minimal",
    categoryName: "Bardak",
    folder: "kupa",
    price: 749.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-bardak-minimal-p-990158812",
    description: "El yapımı seramik bardak. Minimal form, küçük seri üretim."
  },
  {
    id: "BRD03",
    name: "COGO El Yapımı Seramik Bardak | Sade Form",
    categoryName: "Bardak",
    folder: "kupa",
    price: 749.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-bardak-sade-form-p-990158901",
    description: "El yapımı seramik bardak. Sade form ve el işçiliği."
  },
  {
    id: "TAB01",
    name: "El Yapımı Seramik Sunum Tabağı | Minimal",
    categoryName: "Pişirme ve Servis Malzemesi",
    folder: "mutfak",
    price: 699.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-sunum-tabagi-minimal-p-990159011",
    description: "El yapımı seramik sunum tabağı. Sofralarda dekoratif ve işlevsel kullanım."
  },
  {
    id: "SAK01",
    name: "El Yapımı Seramik Saksı | Minimal",
    categoryName: "Saksı",
    folder: "diger",
    price: 999.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-saksi-minimal-p-990159102",
    description: "El yapımı seramik saksı. Doğal dokulu yüzey, küçük seri."
  },
  {
    id: "PAL01",
    name: "El Yapımı Seramik Resim Paleti | Sanatçı Paleti",
    categoryName: "Resim Paleti",
    folder: "diger",
    price: 599.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-resim-paleti-sanatci-paleti-p-990159211",
    description: "El yapımı seramik resim paleti. Atölye kullanımı için."
  },
  {
    id: "ASK01",
    name: "El Yapımı Seramik Askı | Mantar Askı",
    categoryName: "Askı",
    folder: "diger",
    price: 399.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-aski-mantar-aski-p-990159322",
    description: "El yapımı seramik askı. Dekoratif kullanım için uygundur."
  },
  {
    id: "BON01",
    name: "El Yapımı Seramik Boncuk | Petrol Yeşili",
    categoryName: "Boncuk",
    folder: "taki",
    price: 249.0,
    stock: 1,
    color: "petrol yeşili",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/el-yapimi-seramik-boncuk-petrol-yesili-p-990159411",
    description: "El yapımı seramik boncuk. Takı ve aksesuar projeleri için."
  },
  {
    id: "MUM02",
    name: "COGO El Yapımı Seramik Mum | Rustik Dekor",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-mum-rustik-dekor-p-990159522",
    description: "El yapımı seramik kap içerisinde mum. Rustik dekor için uygundur."
  },
  {
    id: "MUM03",
    name: "COGO El Yapımı Seramik Mum | Minimal",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-mum-minimal-p-990159611",
    description: "El yapımı seramik kap içerisinde mum. Minimal tasarım."
  },
  {
    id: "MUM04",
    name: "COGO El Yapımı Seramik Mum | Şömine Köşesi",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-mum-somine-kosesi-p-990159702",
    description: "El yapımı seramik kap içerisinde mum. Şömine köşesi dekoru için."
  },
  {
    id: "MUM05",
    name: "COGO El Yapımı Seramik Mum | Ritüel",
    categoryName: "Mum & Kandil",
    folder: "mum",
    price: 1099.0,
    stock: 1,
    color: "—",
    size: "—",
    trendyolLink: "https://www.trendyol.com/cogo-seramik/cogo-el-yapimi-seramik-mum-rituel-p-990159811",
    description: "El yapımı seramik kap içerisinde ritüel temalı mum."
  }
];

// ---------- helpers ----------
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatTRY(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("tr-TR", { style:"currency", currency:"TRY" });
}

function getCategory(p) {
  return p.folder || "diger";
}

function getCoverPath(p) {
  const cat = getCategory(p);
  return `images/${cat}/${p.id}-1.jpg`;
}

function placeholderHTML(expectedPath) {
  return `
    <div class="placeholder">
      <div>
        <strong>Görsel eklenecek</strong>
        <small>${expectedPath}</small>
      </div>
    </div>
  `;
}

function shortText(text, maxLen=180) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen-1) + "…";
}

function labelCat(cat) {
  if (cat === "all") return "Tümü";
  const labels = {
    mum: "Mum",
    kupa: "Kupa",
    kibrit: "Kibrit",
    mutfak: "Mutfak",
    taki: "Takı",
    obje: "Obje",
    diger: "Diğer"
  };
  return labels[cat] || cat.toUpperCase();
}

// ---------- DOM ----------
const gridEl = document.getElementById("product-grid");
const statsEl = document.getElementById("stats");
const filtersEl = document.getElementById("category-filters");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

let state = {
  q: "",
  cat: "all"
};

function getCategories() {
  const set = new Set(PRODUCTS.map(p => getCategory(p)));
  const order = ["mum","kupa","kibrit","mutfak","taki","obje","diger"];
  const arr = Array.from(set);
  arr.sort((a,b)=> {
    const ia = order.indexOf(a); const ib = order.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b,"tr");
  });
  return ["all", ...arr];
}

function applyFilters(items) {
  const q = state.q.trim().toLowerCase();
  const cat = state.cat;

  return items.filter(p => {
    const pCat = getCategory(p);
    const okCat = (cat === "all") || (pCat === cat);
    if (!okCat) return false;

    if (!q) return true;
    const hay = `${p.name} ${p.categoryName || ""} ${p.color || ""} ${p.size || ""} ${p.description || ""}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderCategoryUI() {
  const cats = getCategories();

  if (categorySelect) {
    categorySelect.innerHTML = cats.map(c => {
      const label = (c === "all") ? "Tüm Kategoriler" : labelCat(c);
      return `<option value="${c}">${label}</option>`;
    }).join("");
    categorySelect.value = state.cat;
  }

  if (filtersEl) {
    filtersEl.innerHTML = cats.map(c => {
      const selected = (state.cat === c) ? "true" : "false";
      return `<div class="chip" role="button" tabindex="0" aria-selected="${selected}" data-cat="${c}">${labelCat(c)}</div>`;
    }).join("");

    filtersEl.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        state.cat = chip.dataset.cat;
        if (categorySelect) categorySelect.value = state.cat;
        renderCategoryUI();
        render();
      });
    });
  }
}

function productCard(p) {
  const cover = getCoverPath(p);
  const desc = shortText(p.description, 180);
  const cat = getCategory(p);

  return `
    <article class="card">
      <div class="card__img" data-expected="${cover}">
        <img src="${cover}" alt="${escapeHtml(p.name)}" loading="lazy" data-cover="1" />
      </div>

      <div class="card__body">
        <div class="card__title">${escapeHtml(p.name)}</div>
        <div class="card__meta">
          <span>${escapeHtml(labelCat(cat))}</span>
          <span>${escapeHtml(formatTRY(p.price))}</span>
        </div>
        <div class="card__desc">${escapeHtml(desc)}</div>

        <div class="card__actions">
          <a class="btn primary" href="${escapeHtml(p.trendyolLink)}" target="_blank" rel="noopener">Trendyol’da İncele</a>


        </div>
      </div>
    </article>
  `;
}

function attachImageFallbacks() {
  if (!gridEl) return;
  gridEl.querySelectorAll(".card__img img[data-cover='1']").forEach(img => {
    img.addEventListener("error", () => {
      const parent = img.parentElement;
      const expected = parent?.getAttribute("data-expected") || "";
      parent.innerHTML = placeholderHTML(expected);
    }, { once: true });
  });
}

function render() {
  if (!gridEl) return;
  const list = applyFilters(PRODUCTS);
  if (statsEl) statsEl.textContent = `${list.length} ürün gösteriliyor`;

  gridEl.innerHTML = list.map(productCard).join("");
  attachImageFallbacks();
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    state.q = e.target.value || "";
    render();
  });
}

if (categorySelect) {
  categorySelect.addEventListener("change", (e) => {
    state.cat = e.target.value || "all";
    renderCategoryUI();
    render();
  });
}

renderCategoryUI();
render();

{ id:"kupa1", cat:"kupalar", name:"Kartal Arketipi Kupa", price: 890,
  desc:"Yüksek görüş, özgürlük ve farkındalık teması.",
  size:"200 ml • 8 × 7.5 cm", img:"images/kartal.jpg" },

{ id:"duvar1", cat:"duvar", name:"Runik Duvar Süsü", price: 750,
  desc:"Hasır ipli, duvara asılabilir dekor.",
  size:"12 × 8 cm", img:"images/duvar-runik.jpg" },

{ id:"buh1", cat:"buhurdan", name:"Buhurdan (Minimal)", price: 520,
  desc:"Tütsü/buhur için dengeli form.",
  size:"Seramik", img:"images/buhurdan.jpg" },

{ id:"koku1", cat:"koku", name:"Oda Kokusu Şişesi", price: 390,
  desc:"Dekoratif şişe + koku çubukları.",
  size:"100 ml", img:"images/oda-kokusu.jpg" },

  