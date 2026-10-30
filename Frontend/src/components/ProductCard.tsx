import { Plus, ShoppingCart } from 'lucide-react';
import type { CartItem, Product } from '../types';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onAdd: (product: Product) => void;
  onUpdateQty: (productId: string, quantity: number) => void;
}

export function ProductCard({ product, cartItem, onAdd, onUpdateQty }: ProductCardProps) {
  const inStock = product.stock_quantity > 0;

  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-40 bg-stone-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ShoppingCart className="w-10 h-10" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-stone-500 bg-white px-2 py-1 rounded-full border">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-green-700 font-medium uppercase tracking-wide mb-0.5">
          {product.category}
        </p>
        <h3 className="text-sm font-semibold text-stone-800 leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-stone-400 mb-3">{product.unit}</p>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-stone-800">
            ₹{product.price.toFixed(0)}
          </span>

          {cartItem ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQty(product.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-bold text-lg flex items-center justify-center transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-stone-800">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => onUpdateQty(product.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => inStock && onAdd(product)}
              disabled={!inStock}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-stone-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
