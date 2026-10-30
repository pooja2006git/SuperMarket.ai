import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { customerName, customerEmail, orderId, items, subtotal, deliveryFee, total, address } = await req.json();

  const itemRows = items.map((item: any) =>
    `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${item.product_name}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:center">×${item.quantity}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right">₹${(item.price * item.quantity).toFixed(0)}</td>
    </tr>`
  ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#16a34a">Order Confirmed! 🛒</h2>
      <p>Hi ${customerName}, your FreshMart order has been placed successfully.</p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280">Order ID: <strong>${orderId}</strong></p>
        <table style="width:100%;font-size:14px">
          ${itemRows}
        </table>
        <div style="margin-top:12px;font-size:14px">
          <div style="display:flex;justify-content:space-between;color:#6b7280">
            <span>Subtotal</span><span>₹${subtotal.toFixed(0)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#6b7280">
            <span>Delivery</span><span>${deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:bold;margin-top:8px;font-size:15px">
            <span>Total</span><span>₹${total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div style="background:#fef9c3;border-radius:8px;padding:12px;margin:16px 0;font-size:14px">
        💵 <strong>Payment:</strong> Pay ₹${total.toFixed(0)} in cash when your order arrives.
      </div>

      <p style="font-size:13px;color:#6b7280">📦 Delivery to: ${address}</p>
      <p style="font-size:13px;color:#6b7280">We'll deliver your order as soon as possible. Thank you for shopping with FreshMart!</p>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: customerEmail,
      subject: `FreshMart Order Confirmed — ₹${total.toFixed(0)}`,
      html,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
