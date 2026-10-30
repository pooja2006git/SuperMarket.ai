import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, ShoppingBag, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import type { Order, OrderItem } from '../types';

interface ConfirmationPageProps {
  orderId: string | null;
}

export function ConfirmationPage({ orderId }: ConfirmationPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase.from('order_items').select('*').eq('order_id', orderId),
    ]).then(([{ data: ord }, { data: its }]) => {
      if (ord) setOrder(ord);
      if (its) setItems(its);
      setLoading(false);
    });
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">No order found.</p>
        <button onClick={() => navigate('shop')} className="mt-4 text-green-600 text-sm font-medium">
          Back to shop
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Order confirmed!</h1>
        <p className="text-stone-500 text-sm">
          Thank you{order ? `, ${order.customer_name.split(' ')[0]}` : ''}! Your order is on its way.
        </p>
        {order && (
          <p className="mt-3 text-base font-semibold text-stone-800">
            Pay ₹{order.total.toFixed(0)} in cash when your order arrives.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-stone-800">Estimated delivery: 45–60 mins</span>
        </div>
        {order && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-stone-600">{order.delivery_address}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-stone-500" />
          <h3 className="text-sm font-semibold text-stone-800">Order details</h3>
        </div>

        <div className="space-y-1.5 mb-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm text-stone-600">
              <span>{item.product_name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>

        {order && (
          <div className="border-t border-stone-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-stone-500">
              <span>Subtotal</span><span>₹{order.subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>Delivery</span>
              <span className={order.delivery_fee === 0 ? 'text-green-600' : ''}>
                {order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-800 pt-1 border-t border-stone-100">
              <span>Total paid</span><span>₹{order.total.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>

      {order && (
        <p className="text-xs text-stone-400 text-center mb-6">
          Order ID: <span className="font-mono text-stone-500">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
      )}

      <button
        onClick={() => navigate('shop')}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Shop again
      </button>
      <button
        onClick={() => navigate('order-tracking')}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-600 border border-green-600 font-semibold py-3.5 rounded-xl transition-colors"
      >
        Track your order
      </button>
    </div>
  );
}
