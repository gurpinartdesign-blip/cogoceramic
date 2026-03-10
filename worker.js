export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    // ---------------- AI CHAT ----------------

    if (url.pathname === "/ai") {

      const { message } = await request.json();

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Sen COGO Seramik markasının yaratıcı asistanısın. Kullanıcıya ürün tasarımı, seramik, mum, buhurdanlık ve kişiye özel tasarım konusunda yardımcı ol."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });

      const data = await response.json();

      return new Response(JSON.stringify({
        reply: data.choices[0].message.content
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // ---------------- PAYTR ----------------

    if (url.pathname === "/paytr") {

      const { price } = await request.json();

      return new Response(JSON.stringify({
        status: "ok",
        price: price
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Not Found", { status: 404 });

  }
};
