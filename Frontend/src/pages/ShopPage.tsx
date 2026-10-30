import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { CartItem, Product } from '../types';

const ALL = 'All';

interface ShopPageProps {
  cartItems: CartItem[];
  onAdd: (product: Product) => void;
  onUpdateQty: (productId: string, quantity: number) => void;
}

export function ShopPage({ cartItems, onAdd, onUpdateQty }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('category')
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, []);

  const categories = [ALL, ...Array.from(new Set(products.map(p => p.category))).sort()];

  const filtered = products.filter(p => {
    const matchCat = activeCategory === ALL || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartMap = new Map(cartItems.map(i => [i.product.id, i]));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-stone-800 mb-1">Fresh groceries</h1>
        <p className="text-sm text-stone-500">
          {products.length} items available today
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-green-300 hover:text-green-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 h-52 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No products found</p>
          <p className="text-xs mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              cartItem={cartMap.get(product.id)}
              onAdd={onAdd}
              onUpdateQty={onUpdateQty}
            />
          ))}
        </div>
      )}
    </div>
  );
}
