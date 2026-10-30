import { useState } from 'react';
import { MapPin, Phone, User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import type { CartItem } from '../types';

interface CheckoutPageProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  onOrderPlaced: (orderId: string) => void;
}

export function CheckoutPage({ items, subtotal, deliveryFee, total, onOrderPlaced }: CheckoutPageProps) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('shop');
    return null;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit number';
    if (!form.address.trim()) e.address = 'Delivery address is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    return e;
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
  
    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim(),
          delivery_address: form.address.trim(),
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: 'confirmed',
          payment_method: 'COD',
        })
        .select()
        .single();
  
      if (orderError || !order) throw orderError;
  
      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity,
      }));
  
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
  
      for (const { product, quantity } of items) {
        await supabase.rpc('reduce_stock', {
          p_product_id: product.id,
          p_quantity: quantity,
        });
      }
      await supabase.functions.invoke('send-order-receipt', {
        body: {
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          orderId: order.id,
          items: orderItems,
          subtotal,
          deliveryFee,
          total,
          address: form.address.trim(),
        },
      });
      onOrderPlaced(order.id);
      navigate('confirmation');
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const field = (
    id: keyof typeof form,
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    extra?: Partial<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>>
  ) => (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          value={form[id]}
          onChange={e => {
            setForm(prev => ({ ...prev, [id]: e.target.value }));
            setErrors(prev => ({ ...prev, [id]: '' }));
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
            errors[id] ? 'border-red-300' : 'border-stone-200'
          }`}
          {...(extra as any)}
        />
      </div>
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Checkout</h1>
      <p className="text-sm text-stone-500 mb-6">Enter your delivery details</p>

      <div className="grid md:grid-cols-5 gap-5">
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          {field('name', 'Full name', 'Your name', <User className="w-4 h-4" />)}
          {field('phone', 'Phone number', '10-digit mobile number', <Phone className="w-4 h-4" />, {
            type: 'tel',
            maxLength: 10,
            inputMode: 'numeric',
          })}
          {field('email', 'Email', 'you@example.com', <Mail className="w-4 h-4" />, {
            type: 'email',
            autoComplete: 'email',
          })}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Delivery address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
              <textarea
                value={form.address}
                onChange={e => {
                  setForm(prev => ({ ...prev, address: e.target.value }));
                  setErrors(prev => ({ ...prev, address: '' }));
                }}
                placeholder="House no., street, area, city…"
                rows={3}
                className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none ${
                  errors.address ? 'border-red-300' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.submit}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</>
            ) : (
              <>Place order <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-stone-100 p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-stone-800 mb-3">Order summary</h3>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs text-stone-600">
                  <span className="truncate mr-2">{product.name} × {quantity}</span>
                  <span className="flex-shrink-0">₹{(product.price * quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-2 space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-800 pt-1 border-t border-stone-100">
                <span>Total</span><span>₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
