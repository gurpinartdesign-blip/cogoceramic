export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // =========================
    // ANA KONTROL
    // =========================
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "cogo-ai-worker",
          routes: ["/ai", "/paytr", "/paytr-callback"],
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // =========================
    // AI CHAT
    // =========================
    if (url.pathname === "/ai") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
      }

      try {
        const { message } = await request.json();

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                // ✅ GÜNCELLENDİ: Daha güçlü, ürün odaklı sistem promptu
                content: `Sen COGO Ceramic'in satış danışmanısın. COGO Ceramic, el yapımı, küçük seri seramik ürünler satan bir Türk markasıdır.

Ürün kategorileri ve örnekler:
- Kupalar: Boğa Kupa (720₺), Japon Kupa (720₺), Vintage Kupa (480₺), Yılan Kupa (720₺)
- Buhurdan & Tütsülük: Tütsülük (750₺), Bohem Buhurdan (980₺), Ev Buhurdanlık (850₺)
- Mumluk: Mumluk (520₺), Fincan (420₺), Yin Yang Mumluk (670₺)
- Duvar Süsleri: El İzi (720₺), Kartal (720₺), Nazar Duvar Süsü (680₺)
- Takı: Takı Seti (842₺), Flora Seramik Yüzük (380₺)
- Diğer: Oda Kokusu (920₺), Palet (480₺), Askı (460₺), Fırçalık & Kalemlik (580₺)

Görevin:
- Müşterinin ihtiyacını 1-2 soruyla anla (hediye mi? kişisel kullanım mı? hangi bütçe?)
- En az 2 ürün öner ve neden uygun olduğunu kısaca açıkla
- Her ürünün arketipi veya sembolik anlamını da paylaşabilirsin (örn: Boğa = güç, kararlılık)
- Sipariş için WhatsApp veya sepet butonunu kullanmalarını öner

Kurallar:
- Sadece COGO Ceramic ürünleri hakkında konuş
- Fiyat veya stok hakkında emin değilsen "WhatsApp'tan sorun" de
- Maksimum 4 cümle yaz, kısa ve samimi ol
- Konu dışı sorularda: "Ben sadece COGO seramik ürünleri konusunda yardımcı olabiliyorum 🏺"
- Türkçe cevap ver`,
              },
              {
                role: "user",
                content: message || "Merhaba",
              },
            ],
          }),
        });

        const data = await response.json();

        return new Response(
          JSON.stringify({
            reply: data?.choices?.[0]?.message?.content || "Şu an cevap veremiyorum.",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "AI request failed",
            details: String(error),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // =========================
    // PAYTR TOKEN
    // =========================
    if (url.pathname === "/paytr") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", {
          status: 405,
          headers: corsHeaders,
        });
      }

      try {
        const body = await request.json();
        const price = Number(body.price || 0);

        if (!price || price <= 0) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Geçersiz tutar",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const merchant_id = env.PAYTR_MERCHANT_ID;
        const merchant_key = env.PAYTR_MERCHANT_KEY;
        const merchant_salt = env.PAYTR_MERCHANT_SALT;

        if (!merchant_id || !merchant_key || !merchant_salt) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "PayTR secrets eksik",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        const merchant_oid = `COGO${Date.now()}`;

        // ✅ GÜNCELLENDİ: Artık frontend'den gelen gerçek müşteri bilgileri kullanılıyor
        const email = body.email || "orders@cogoceramic.com";
        const payment_amount = Math.round(price * 100);
        const user_name = body.user_name || "Misafir Müşteri";
        const user_address = body.user_address || "Belirtilmedi";
        const user_phone = body.user_phone || "05000000000";

        // ✅ GÜNCELLENDİ: Gerçek sepet içeriği PayTR'ye gönderiliyor
        const cartItems = body.cart_items || [["Seramik Ürün", price.toFixed(2), 1]];
        const user_basket = JSON.stringify(cartItems);

        const merchant_ok_url = "https://cogoceramic.com/odeme-basarili.html";
        const merchant_fail_url = "https://cogoceramic.com/odeme-basarisiz.html";

        const user_ip =
          request.headers.get("CF-Connecting-IP") ||
          request.headers.get("x-forwarded-for") ||
          "127.0.0.1";

        const timeout_limit = "30";
        const debug_on = "0"; // ✅ debug kapalı
        const test_mode = "0"; // ✅ DÜZELTİLDİ: Canlı moda alındı
        const no_installment = "0";
        const max_installment = "12";
        const currency = "TL";
        const lang = "tr";
        const merchant_user_id = "guest";

        const hashStr =
          merchant_id +
          user_ip +
          merchant_oid +
          email +
          payment_amount +
          user_basket +
          no_installment +
          max_installment +
          currency +
          test_mode +
          merchant_salt;

        async function hmacBase64(message, secret) {
          const enc = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
          return btoa(String.fromCharCode(...new Uint8Array(sig)));
        }

        const paytr_token = await hmacBase64(hashStr, merchant_key);

        const formData = new URLSearchParams();
        formData.set("merchant_id", merchant_id);
        formData.set("user_ip", user_ip);
        formData.set("merchant_oid", merchant_oid);
        formData.set("email", email);
        formData.set("payment_amount", String(payment_amount));
        formData.set("paytr_token", paytr_token);
        formData.set("user_basket", user_basket);
        formData.set("debug_on", debug_on);
        formData.set("no_installment", no_installment);
        formData.set("max_installment", max_installment);
        formData.set("user_name", user_name);
        formData.set("user_address", user_address);
        formData.set("user_phone", user_phone);
        formData.set("merchant_ok_url", merchant_ok_url);
        formData.set("merchant_fail_url", merchant_fail_url);
        formData.set("timeout_limit", timeout_limit);
        formData.set("currency", currency);
        formData.set("test_mode", test_mode);
        formData.set("lang", lang);
        formData.set("merchant_user_id", merchant_user_id);

        const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
          method: "POST",
          body: formData,
        });

        const paytrData = await paytrRes.json();

        return new Response(
          JSON.stringify({
            ok: paytrData?.status === "success",
            from: "paytr",
            merchant_oid,
            paytr_response: paytrData,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "PayTR request failed",
            details: String(error),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // =========================
    // PAYTR CALLBACK
    // =========================
    if (url.pathname === "/paytr-callback") {
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      try {
        const form = await request.formData();

        const merchant_oid = String(form.get("merchant_oid") || "");
        const status = String(form.get("status") || "");
        const total_amount = String(form.get("total_amount") || "");
        const hash = String(form.get("hash") || "");

        const merchant_key = env.PAYTR_MERCHANT_KEY;
        const merchant_salt = env.PAYTR_MERCHANT_SALT;

        async function hmacBase64(message, secret) {
          const enc = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
          );
          const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
          return btoa(String.fromCharCode(...new Uint8Array(sig)));
        }

        const expectedHash = await hmacBase64(
          merchant_oid + merchant_salt + status + total_amount,
          merchant_key
        );

        if (hash !== expectedHash) {
          return new Response("bad hash", { status: 400 });
        }

        console.log("PAYTR CALLBACK:", {
          merchant_oid,
          status,
          total_amount,
        });

        return new Response("OK", {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      } catch (error) {
        return new Response("callback error", {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};