import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, question } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        status,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        delivery_address,
        order_items (
          quantity,
          price,
          product_name
        )
      `)
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })

    if (ordersError) throw ordersError

    let ordersContext = 'No orders found for this customer.'
    if (orders && orders.length > 0) {
      ordersContext = orders.map(order => {
        const items = order.order_items.map((item: any) =>
          `${item.product_name} x${item.quantity} @ ₹${item.price}`
        ).join(', ')
        return `Order #${order.id} | Date: ${new Date(order.created_at).toLocaleDateString('en-IN')} | Status: ${order.status} | Items: ${items} | Total: ₹${order.total} | Payment: ${order.payment_method}`
      }).join('\n')
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // model: 'llama3-8b-8192',
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: `You are a helpful customer support assistant for FreshMart, an online supermarket.
Answer customer questions about their orders based only on the data provided.
Be friendly, concise, and helpful.

Customer's order history:
${ordersContext}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 300,
      })
    })

    const groqData = await groqResponse.json()
    console.log('Groq response:', JSON.stringify(groqData))

    if (!groqData.choices || !groqData.choices[0]) {
      throw new Error(`Groq error: ${JSON.stringify(groqData)}`)
    }

    const answer = groqData.choices[0].message.content

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})