import { ShoppingBag, Lock, Leaf, Clock, Truck } from 'lucide-react';
import { navigate } from '../lib/router';

export function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="bg-green-600 px-6 pt-10 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-5">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Fresh groceries,</h1>
              <h1 className="text-2xl font-bold text-white mb-3">delivered.</h1>
              <p className="text-green-100 text-sm leading-relaxed">
                Order from our store — fresh produce,<br />daily essentials and more.
              </p>
            </div>

            <div className="px-6 py-6 space-y-3">
              <button
                onClick={() => navigate('shop')}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-base py-3.5 rounded-xl transition-all shadow-sm hover:shadow"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop now
                <span className="text-green-300 text-sm">↗</span>
              </button>

              <button
                onClick={() => navigate('staff-login')}
                className="w-full flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-700 font-medium text-sm py-3 rounded-xl border border-stone-200 transition-all"
              >
                <Lock className="w-4 h-4" />
                Staff login
              </button>
            </div>

            <div className="border-t border-stone-100 px-6 py-3.5">
              <p className="text-center text-xs text-stone-400">
                Open daily 7am – 10pm &nbsp;·&nbsp; Free delivery above ₹499
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Leaf, label: 'Always fresh', sub: 'Sourced daily' },
              { icon: Clock, label: 'Fast delivery', sub: 'Under 60 mins' },
              { icon: Truck, label: 'Free above ₹499', sub: '₹49 otherwise' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-stone-100 p-3 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-50 rounded-lg mb-2">
                  <Icon className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs font-semibold text-stone-700 leading-tight">{label}</p>
                <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-stone-400">© 2026 FreshMart. All rights reserved.</p>
      </footer>
    </div>
  );
}
