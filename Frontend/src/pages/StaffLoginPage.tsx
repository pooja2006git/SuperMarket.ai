import { useState } from 'react';
import { Lock, Eye, EyeOff, ShoppingBag, Loader2 } from 'lucide-react';
import { navigate } from '../lib/router';

const STAFF_PASSWORD = 'freshmart2024';

export function StaffLoginPage() {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (password === STAFF_PASSWORD) {
      localStorage.setItem('freshmart_staff', 'true');
      navigate('staff-dashboard');
    } else {
      setError('Incorrect password. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-stone-800 font-bold text-xl hover:text-green-700 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-green-600" />
            FreshMart
          </button>
          <p className="text-sm text-stone-500 mt-2">Staff portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-stone-100 rounded-xl mx-auto mb-4">
            <Lock className="w-5 h-5 text-stone-600" />
          </div>
          <h2 className="text-lg font-semibold text-stone-800 text-center mb-5">Staff login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter staff password"
                  className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    error ? 'border-red-300' : 'border-stone-200'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          <button onClick={() => navigate('home')} className="hover:text-stone-600 transition-colors">
            ← Back to store
          </button>
        </p>
      </div>
    </div>
  );
}
