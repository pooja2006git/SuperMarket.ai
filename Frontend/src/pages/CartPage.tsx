import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { navigate } from '../lib/router';
import type { CartItem } from '../types';

interface CartPageProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartPage({ items, subtotal, deliveryFee, total, onUpdateQty, onRemove }: CartPageProps) {
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-2xl mb-4">
          <ShoppingCart className="w-8 h-8 text-stone-400" />
        </div>
        <h2 className="text-lg font-semibold text-stone-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-stone-500 mb-6">Add some items from the shop to get started.</p>
        <button
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-stone-800 mb-1">Your cart</h1>
      <p className="text-sm text-stone-500 mb-5">{items.length} item{items.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2 mb-5">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-stone-100 p-3 flex items-center gap-3"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-50 flex-shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{product.name}</p>
              <p className="text-xs text-stone-400">{product.unit}</p>
              <p className="text-sm font-bold text-stone-800 mt-0.5">₹{(product.price * quantity).toFixed(0)}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQty(product.id, quantity - 1)}
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors text-lg"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-stone-800">{quantity}</span>
              <button
                onClick={() => onUpdateQty(product.id, quantity + 1)}
                className="w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center transition-colors text-lg"
              >
                +
              </button>
            </div>

            <button
              onClick={() => onRemove(product.id)}
              className="ml-1 p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
              {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
            </span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-xs text-stone-400">
              Add ₹{(499 - subtotal).toFixed(0)} more for free delivery
            </p>
          )}
          <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-stone-800">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('checkout')}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
      >
        Proceed to checkout
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        onClick={() => navigate('shop')}
        className="w-full mt-2.5 text-sm text-stone-500 hover:text-stone-700 py-2 transition-colors"
      >
        ← Continue shopping
      </button>
    </div>
  );
}
