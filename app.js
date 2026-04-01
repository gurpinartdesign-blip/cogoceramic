// ============================================================================
// Ayarlar ve Sistem Konfigürasyonu (Settings and System Configuration)
// ============================================================================
const API_URL = "https://api.example.com"; // API adresiniz
const AUTH_TOKEN_KEY = "authToken";
const CART_ITEMS_KEY = "cartItems";

// Varsayılan dil ayarı
let currentLanguage = "tr"; // Varsayılan Türkçe
// Diğer ayarlar...

// ============================================================================
// UI ve DOM Elemanları (UI and DOM Elements)
// ============================================================================
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const logoutButton = document.getElementById("logoutButton");
const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCartButton = document.getElementById("closeCart");
const searchInput = document.getElementById("searchInput");
const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const aiChatButton = document.getElementById("aiChatButton");
const aiChatPanel = document.getElementById("aiChatPanel");
const aiChatMessages = document.getElementById("aiChatMessages");
const aiChatInput = document.getElementById("aiChatInput");
const aiChatSendButton = document.getElementById("aiChatSendButton");
const payConfirmButton = document.getElementById("payConfirmButton"); // Sepetteki ödeme onay butonu

// Lightbox elementleri
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

// Ödeme modalı elementleri (injectPaymentModal tarafından eklenir)
let payModal;
let cogoPayConfirm; // submitPayment'ı tetikleyen buton
let paytrIframeContainer;

// ============================================================================
// Veri Depolama ve Yönetimi (Data Storage and Management)
// ============================================================================
let products = [];
let cartItems = JSON.parse(localStorage.getItem(CART_ITEMS_KEY)) || [];

// ============================================================================
// Yardımcı Fonksiyonlar (Helper Functions)
// ============================================================================

// Toast Mesajı Gösterme
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Para Formatlama
function formatCurrency(amount) {
    return new Intl.NumberFormat(currentLanguage, {
        style: "currency",
        currency: "TRY"
    }).format(amount);
}

// ============================================================================
// Üyelik Sistemi Fonksiyonları (Authentication Functions)
// ============================================================================

// Kullanıcı girişi kontrolü ve UI güncellemesi
function checkLoginStatus() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        // Kullanıcı giriş yapmış
        loginButton.style.display = "none";
        registerButton.style.display = "none";
        logoutButton.style.display = "block";
        // Kullanıcı adını gösterme vb.
    } else {
        // Kullanıcı çıkış yapmış
        loginButton.style.display = "block";
        registerButton.style.display = "block";
        logoutButton.style.display = "none";
    }
}

// Giriş işlemi
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userEmail", data.user.email);
            // Diğer kullanıcı bilgileri
            checkLoginStatus();
            showToast("Giriş başarılı!", "success");
        } else {
            showToast(data.message || "Giriş başarısız.", "error");
        }
    } catch (error) {
        console.error("Giriş hatası:", error);
        showToast("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
    }
}

// Kayıt işlemi
async function registerUser(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (data.success) {
            showToast("Kayıt başarılı! Lütfen giriş yapın.", "success");
        } else {
            showToast(data.message || "Kayıt başarısız.", "error");
        }
    } catch (error) {
        console.error("Kayıt hatası:", error);
        showToast("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
    }
}

// Çıkış işlemi
function logoutUser() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userAddress");
    checkLoginStatus();
    showToast("Çıkış yapıldı.", "info");
}

// ============================================================================
// Ürünler ve Katalog (Products and Catalog)
// ============================================================================

// Ürünleri API'den çekme ve listeleme
async function fetchAndRenderProducts() {
    try {
        // API'den ürünleri çekme simülasyonu
        products = [
            { id: 1, name: "El Yapımı Seramik Kupa", price: 120, category: "kupalar", imageUrl: "assets/images/kupa1.jpg", description: "Özel tasarım el yapımı seramik kupa." },
            { id: 2, name: "Toprak Vazo", price: 250, category: "vazolar", imageUrl: "assets/images/vazo1.jpg", description: "Doğal toprak tonlarında modern vazo." },
            { id: 3, name: "Seramik Kase Seti", price: 380, category: "kaseler", imageUrl: "assets/images/kase1.jpg", description: "3'lü el yapımı seramik kase seti." },
            { id: 4, name: "Seramik Tabak", price: 150, category: "tabaklar", imageUrl: "assets/images/tabak1.jpg", description: "Dekoratif seramik servis tabağı." },
            { id: 5, name: "Mavi Seramik Kupa", price: 130, category: "kupalar", imageUrl: "assets/images/kupa2.jpg", description: "Deniz mavisi tonlarında el yapımı kupa." },
            { id: 6, name: "Modern Vazo", price: 280, category: "vazolar", imageUrl: "assets/images/vazo2.jpg", description: "Soyut desenli modern seramik vazo." },
            { id: 7, name: "Desenli Kase", price: 190, category: "kaseler", imageUrl: "assets/images/kase2.jpg", description: "El çizimi desenli seramik kase." },
            { id: 8, name: "Kahverengi Tabak", price: 160, category: "tabaklar", imageUrl: "assets/images/tabak2.jpg", description: "Doğal kahverengi tonlarda seramik yemek tabağı." },
        ];
        renderProducts(products);
        populateCategories();
    } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu:", error);
        showToast("Ürünler yüklenemedi.", "error");
    }
}

// Ürünleri DOM'a render etme
function renderProducts(productsToRender) {
    productGrid.innerHTML = "";
    if (productsToRender.length === 0) {
        productGrid.innerHTML = "<p>Gösterilecek ürün bulunamadı.</p>";
        return;
    }
    productsToRender.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" onclick="openLightbox('${product.imageUrl}')">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="price">${formatCurrency(product.price)}</span>
            <button class="add-to-cart-btn" data-id="${product.id}">Sepete Ekle</button>
        `;
        productGrid.appendChild(productCard);
    });

    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
}

// Kategorileri filtre alanına doldurma
function populateCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="all">Tüm Kategoriler</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// ============================================================================
// Sepet ve Ödeme İşlemleri (Cart and Payment Operations)
// ============================================================================

// Sepete ürün ekleme
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }
        saveCart();
        renderCart();
        showToast(`${product.name} sepete eklendi.`, "success");
    }
}

// Sepetten ürün çıkarma
function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    showToast("Ürün sepetten çıkarıldı.", "info");
}

// Sepet miktarını güncelleme
function updateCartQuantity(productId, quantity) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

// Sepeti localStorage'a kaydetme
function saveCart() {
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(cartItems));
}

// Sepeti DOM'a render etme
function renderCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalElement = document.getElementById("cartTotal");
    cartItemsContainer.innerHTML = "";
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = "<p>Sepetinizde ürün bulunmamaktadır.</p>";
        cartTotalElement.textContent = formatCurrency(0);
        return;
    }
    cartItems.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cart-item";
        cartItemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)} x 
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="cart-quantity-input">
                </p>
            </div>
            <button class="remove-from-cart-btn" data-id="${item.id}">X</button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    document.querySelectorAll(".remove-from-cart-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        });
    });

    document.querySelectorAll(".cart-quantity-input").forEach(input => {
        input.addEventListener("change", (e) => {
            const productId = parseInt(e.target.dataset.id);
            const quantity = parseInt(e.target.value);
            updateCartQuantity(productId, quantity);
        });
    });

    cartTotalElement.textContent = formatCurrency(calculateTotal());
}

// Sepet toplamını hesaplama
function calculateTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Ödeme modalını DOM'a enjekte etme
function injectPaymentModal() {
    if (document.getElementById("payModal")) {
        return; // Modal zaten enjekte edilmişse tekrar etme
    }

    const modalHTML = `
        <div id="payModal" class="modal pay-modal">
            <div class="modal-content">
                <span class="close-button" onclick="closePayModal()">&times;</span>
                <h2>Ödeme</h2>
                <div id="paytrIframeContainer">
                    <!-- PayTR iframe buraya yüklenecek -->
                    Lütfen Bekleyiniz... Ödeme ekranı yükleniyor.
                </div>
                <div class="pay-modal-footer">
                    <button id="cogoPayConfirm" class="button primary-button">Ödemeyi Tamamla</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    payModal = document.getElementById("payModal");
    cogoPayConfirm = document.getElementById("cogoPayConfirm");
    paytrIframeContainer = document.getElementById("paytrIframeContainer");

    // cogoPayConfirm butonuna event listener ekle
    if (cogoPayConfirm) {
        cogoPayConfirm.addEventListener("click", submitPayment);
        console.log("cogoPayConfirm butonu dinleyicisi eklendi.");
    } else {
        console.error("cogoPayConfirm butonu bulunamadı!");
    }
}

// Ödeme modalını açma
function openPayModal() {
    console.log("openPayModal() çağrıldı.");
    document.querySelector(".overlay").classList.add("active");
    if (payModal) {
        payModal.classList.add("active");
        console.log("Ödeme modalı aktif edildi.");
    } else {
        console.error("Ödeme modalı elementi bulunamadı. injectPaymentModal() çağrıldı mı?");
    }
}

// Ödeme modalını kapatma
function closePayModal() {
    console.log("closePayModal() çağrıldı.");
    document.querySelector(".overlay").classList.remove("active");
    if (payModal) {
        payModal.classList.remove("active");
        console.log("Ödeme modalı deaktif edildi.");
    }
    // Iframe içeriğini temizle
    if (paytrIframeContainer) {
        paytrIframeContainer.innerHTML = `Lütfen Bekleyiniz... Ödeme ekranı yükleniyor.`;
    }
}

// PayTR iframe'ini render etme
function renderPaymentIframe(token) {
    if (!paytrIframeContainer) {
        console.error("paytrIframeContainer elementi bulunamadı. Ödeme iframe'i render edilemez.");
        return;
    }
    paytrIframeContainer.innerHTML = `<iframe src="https://www.paytr.com/odeme/guvenli/${token}" id="paytriframe" frameborder="0" scrolling="no" style="width: 100%; height: 600px;"></iframe>`;
    console.log("PayTR iframe yüklendi. Hedef URL:", `https://www.paytr.com/odeme/guvenli/${token}`);
}

// Ödeme gönderme fonksiyonu
async function submitPayment() {
    console.log("submitPayment() fonksiyonu çağrıldı.");

    if (!cartItems.length) {
        console.log("Sepet boş, ödeme yapılamaz.");
        showToast("Sepetiniz boş. Lütfen ürün ekleyin.", "error");
        return;
    }

    try {
        // Kullanıcı bilgilerini localStorage'dan çek
        const user_name = localStorage.getItem("userName");
        const user_phone = localStorage.getItem("userPhone");
        const user_address = localStorage.getItem("userAddress");
        const user_email = localStorage.getItem("userEmail");
        const total_amount_str = calculateTotal().toFixed(2); // Toplam tutarı string olarak al (örn: "123.45")
        const total_amount_int = Math.round(parseFloat(total_amount_str) * 100); // Kuruşa çevir (örn: 12345)

        // Debug: Toplanan kullanıcı bilgilerini ve sepeti konsola yazdır
        console.log("Toplanan kullanıcı bilgileri:", { user_name, user_phone, user_address, user_email });
        console.log("Sepet öğeleri (worker.js'e gönderilecek):", cartItems);
        console.log("Toplam tutar (kuruş cinsinden):", total_amount_int);

        // API'ye gönderilecek veriyi hazırla
        const dataToSend = {
            price: total_amount_int,
            email: user_email,
            user_name: user_name,
            user_address: user_address,
            user_phone: user_phone,
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: Math.round(item.price * 100), // Ürün fiyatını da kuruşa çevir
                quantity: item.quantity
            }))
        };
        console.log("'/paytr' endpoint'ine gönderilen veri:", dataToSend);


        const response = await fetch('/paytr', { // worker.js üzerindeki /paytr endpoint'i
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        console.log("'/paytr' endpoint'inden yanıt bekleniyor...");
        if (!response.ok) {
            // Hata durumunda yanıtın metnini al ve logla
            const errorText = await response.text();
            console.error("'/paytr' isteği başarısız oldu:", response.status, errorText);
            showToast("Ödeme isteği başarısız oldu. Lütfen tekrar deneyin.", "error");
            return;
        }

        const data = await response.json();
        console.log("'/paytr' endpoint'inden gelen yanıt:", data);

        if (data.status === "success") {
            const token = data.token;
            console.log("PayTR tokenı başarıyla alındı:", token);
            
            // Ödeme modalını aç
            openPayModal(); 
            // Ve iframe'i alınan token ile render et
            renderPaymentIframe(token); 
            
            showToast("Ödeme ekranı yükleniyor...", "success");
        } else {
            console.error("PayTR'dan hata yanıtı veya geçersiz token:", data.message || "Bilinmeyen bir hata oluştu.");
            showToast(`Ödeme hatası: ${data.message || "Bilinmeyen bir hata oluştu."}`, "error");
        }
    } catch (error) {
        console.error("Ödeme işlemi sırasında bir hata oluştu (try-catch):", error);
        showToast("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
    }
}


// ============================================================================
// Arama ve Filtreleme (Search and Filtering)
// ============================================================================

// Ürün arama fonksiyonu
function searchProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Kategori filtreleme fonksiyonu
function filterProductsByCategory() {
    const selectedCategory = categoryFilter.value;
    let filteredProducts = products;
    if (selectedCategory !== "all") {
        filteredProducts = products.filter(product => product.category === selectedCategory);
    }
    renderProducts(filteredProducts);
}


// ============================================================================
// Görüntü Galerisi ve Lightbox (Image Gallery and Lightbox)
// ============================================================================

// Lightbox'ı aç
function openLightbox(imageUrl) {
    lightboxImage.src = imageUrl;
    lightbox.classList.add("active");
}

// Lightbox'ı kapat
function closeLightbox() {
    lightbox.classList.remove("active");
}

// ============================================================================
// Yapay Zeka ve Mesajlaşma (AI and Messaging)
// ============================================================================

// AI Chat açma/kapama
function toggleAiChat() {
    aiChatPanel.classList.toggle("active");
}

// AI mesaj gönderme
async function sendAiMessage() {
    const messageText = aiChatInput.value.trim();
    if (!messageText) return;

    appendAiMessage("user", messageText);
    aiChatInput.value = "";

    try {
        const response = await fetch('/ai', { // worker.js üzerindeki /ai endpoint'i
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText }),
        });
        const data = await response.json();
        appendAiMessage("ai", data.response);
    } catch (error) {
        console.error("AI sohbet hatası:", error);
        appendAiMessage("ai", "Üzgünüm, şu anda yanıt veremiyorum.");
    }
}

// AI chat mesajlarını ekleme
function appendAiMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${sender}`;
    messageElement.textContent = text;
    aiChatMessages.appendChild(messageElement);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight; // En alta kaydır
}


// ============================================================================
// Pencere ve Overlay Kontrolleri (Window and Overlay Controls)
// ============================================================================

// Overlay'i kapatma
function closeOverlay() {
    document.querySelector(".overlay").classList.remove("active");
    cartPanel.classList.remove("active");
    if (aiChatPanel) aiChatPanel.classList.remove("active"); // AI chat panelini de kapat
    closePayModal(); // Ödeme modalını da kapat
}


// ============================================================================
// Yükleme ve Başlangıç İşlemleri (Initialization)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Tüm sayfa yüklendiğinde çalışacak kodlar
    injectPaymentModal(); // Ödeme modalını enjekte et
    fetchAndRenderProducts();
    checkLoginStatus();
    renderCart();

    // Event Listener'lar
    if (loginButton) loginButton.addEventListener("click", () => alert("Giriş Modalı Aç")); // Modal fonksiyonuyla değiştirilecek
    if (registerButton) registerButton.addEventListener("click", () => alert("Kayıt Modalı Aç")); // Modal fonksiyonuyla değiştirilecek
    if (logoutButton) logoutButton.addEventListener("click", logoutUser);
    
    if (cartButton) cartButton.addEventListener("click", () => {
        cartPanel.classList.add("active");
        document.querySelector(".overlay").classList.add("active");
    });
    if (closeCartButton) closeCartButton.addEventListener("click", closeOverlay);
    if (searchInput) searchInput.addEventListener("input", searchProducts);
    if (categoryFilter) categoryFilter.addEventListener("change", filterProductsByCategory);

    // Sepetteki "Ödemeye Geç" butonu
    if (payConfirmButton) {
        payConfirmButton.addEventListener("click", openPayModal); // Sepetteki butondan ödeme modalını aç
        console.log("Sepetteki 'Ödemeye Geç' butonu dinleyicisi eklendi.");
    } else {
        console.error("Sepetteki 'Ödemeye Geç' butonu bulunamadı!");
    }

    if (aiChatButton) aiChatButton.addEventListener("click", toggleAiChat);
    if (aiChatSendButton) aiChatSendButton.addEventListener("click", sendAiMessage);
    if (aiChatInput) aiChatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendAiMessage();
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    document.querySelector(".overlay").addEventListener("click", closeOverlay);
});

// window objesine global fonksiyonları atama (eğer HTML'den doğrudan çağrılıyorlarsa)
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.closePayModal = closePayModal; // Close butonu HTML içinde olduğundan
// window.openPayModal = openPayModal; // Eğer bu fonksiyon HTML'den çağrılıyorsa