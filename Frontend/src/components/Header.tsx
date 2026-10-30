import { ShoppingCart, ShoppingBag, MapPin } from 'lucide-react';
import { navigate } from '../lib/router';
import type { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  itemCount: number;
}

export function Header({ currentPage, itemCount }: HeaderProps) {
  const isStaff = currentPage.startsWith('staff');

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-bold text-stone-800 text-lg tracking-tight hover:text-green-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-green-600" />
          FreshMart
        </button>

        {!isStaff && (
          <div className="flex items-center gap-4">
            {currentPage !== 'home' && (
              <button
                onClick={() => navigate('shop')}
                className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                Shop
              </button>
            )}
            <button
              onClick={() => navigate('order-tracking')}
              className="flex items-center gap-1.5 bg-white hover:bg-green-50 text-green-600 border border-green-600 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Track Order</span>
            </button>
            <button
              onClick={() => navigate('cart')}
              className="relative flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        )}

        {isStaff && currentPage === 'staff-dashboard' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('staff-add-product')}
              className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              + Add Product
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('freshmart_staff');
                navigate('home');
              }}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
