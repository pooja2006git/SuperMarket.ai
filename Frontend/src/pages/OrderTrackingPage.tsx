import { useState } from 'react';
import { Phone, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

type OrderStatus = 'confirmed' | 'dispatched' | 'delivered';

interface TrackingOrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface TrackingOrder {
  id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: TrackingOrderItem[];
}

export function OrderTrackingPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  function validatePhone(value: string) {
    if (!value.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(value.trim())) return 'Enter a valid 10-digit number';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    setError('');
    setLoading(true);
    setSearched(false);

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_phone', phone.trim())
      .order('created_at', { ascending: false });

    setOrders((data as TrackingOrder[]) ?? []);
    setSearched(true);
    setLoading(false);
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setQuestion('');
    setChatLoading(true);

    try {
      const res = await fetch('https://ujxibknmaijlbqnnkdie.supabase.co/functions/v1/order-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, question: trimmed }),
      });
      const data = await res.json();
      const answer =
        typeof data.answer === 'string' ? data.answer : 'Sorry, I could not answer that.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function statusBadge(status: OrderStatus) {
    const styles: Record<OrderStatus, string> = {
      confirmed: 'bg-blue-50 text-blue-600',
      dispatched: 'bg-amber-50 text-amber-600',
      delivered: 'bg-green-50 text-green-700',
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Track your order</h1>
      <p className="text-sm text-stone-500 mb-6">Enter the phone number used at checkout</p>

      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone number</label>
        <div className="relative mb-3">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="tel"
            value={phone}
            onChange={e => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
              setError('');
            }}
            placeholder="10-digit mobile number"
            maxLength={10}
            inputMode="numeric"
            className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
              error ? 'border-red-300' : 'border-stone-200'
            }`}
          />
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          Find orders
        </button>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!loading && searched && orders.length === 0 && (
        <p className="text-center text-sm text-stone-500 py-8">No orders found for this number</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-stone-100 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-stone-600">{formatDateTime(order.created_at)}</p>
                {statusBadge(order.status)}
              </div>

              <div className="space-y-1.5 mb-3">
                {order.order_items?.map(item => (
                  <p key={item.id} className="text-sm text-stone-700">
                    {item.product_name} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-sm font-semibold text-stone-800">Total</span>
                <span className="text-sm font-bold text-stone-800">₹{order.total.toFixed(0)}</span>
              </div>

              {(order.status === 'confirmed' || order.status === 'dispatched') && (
                <p className="text-xs text-stone-500 mt-3 bg-stone-50 rounded-lg px-3 py-2">
                  Pay ₹{order.total.toFixed(0)} in cash on delivery (COD).
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-stone-100 p-4">
          <h2 className="text-sm font-semibold text-stone-800 mb-3">Ask FreshMart Assistant</h2>
          <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-stone-100 text-stone-700 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </p>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl rounded-bl-md px-3 py-2.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask about your order..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={chatLoading || !question.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
