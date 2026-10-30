import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import type { Product } from '../types';

const CATEGORIES = [
  'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Beverages',
  'Grains & Staples', 'Meat & Fish', 'Snacks', 'Pantry', 'Other',
];

const UNITS = ['piece', 'kg', '500g', '250g', '200g', '100g', 'litre', '500ml', 'dozen', '25 bags', 'loaf', 'pack'];

interface StaffAddProductPageProps {
  editingProductId: string | null;
}

const EMPTY = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  image_url: '',
  stock_quantity: '',
  unit: UNITS[0],
};

export function StaffAddProductPage({ editingProductId }: StaffAddProductPageProps) {
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const isEditing = !!editingProductId;

  useEffect(() => {
    if (!editingProductId) { setForm(EMPTY); return; }
    setFetching(true);
    supabase
      .from('products')
      .select('*')
      .eq('id', editingProductId)
      .single()
      .then(({ data }: { data: Product | null }) => {
        if (data) {
          setForm({
            name: data.name,
            category: data.category,
            price: String(data.price),
            image_url: data.image_url ?? '',
            stock_quantity: String(data.stock_quantity),
            unit: data.unit,
          });
        }
        setFetching(false);
      });
  }, [editingProductId]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Valid price is required';
    if (!form.stock_quantity || isNaN(Number(form.stock_quantity)) || Number(form.stock_quantity) < 0) e.stock_quantity = 'Valid stock quantity is required';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      image_url: form.image_url.trim() || null,
      stock_quantity: Math.round(Number(form.stock_quantity)),
      unit: form.unit,
    };

    try {
      if (isEditing && editingProductId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProductId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
      navigate('staff-dashboard');
    } catch {
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function field(
    key: keyof typeof EMPTY,
    label: string,
    placeholder: string,
    inputProps?: Partial<React.InputHTMLAttributes<HTMLInputElement>>
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
        <input
          value={form[key]}
          onChange={e => {
            setForm(prev => ({ ...prev, [key]: e.target.value }));
            setErrors(prev => ({ ...prev, [key]: '' }));
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
            errors[key] ? 'border-red-300' : 'border-stone-200'
          }`}
          {...inputProps}
        />
        {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate('staff-dashboard')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-800">
            {isEditing ? 'Edit product' : 'Add product'}
          </h1>
          <p className="text-sm text-stone-500">{isEditing ? 'Update details below' : 'Fill in product details'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
        {field('name', 'Product name', 'e.g. Fresh Tomatoes')}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Unit</label>
            <select
              value={form.unit}
              onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('price', 'Price (₹)', '0.00', { type: 'number', min: '0', step: '0.01' })}
          {field('stock_quantity', 'Stock quantity', '0', { type: 'number', min: '0', step: '1' })}
        </div>

        {field('image_url', 'Image URL', 'https://... (optional)', { type: 'url' })}

        {form.image_url && (
          <div className="rounded-xl overflow-hidden h-36 bg-stone-50 border border-stone-100">
            <img
              src={form.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.submit}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('staff-dashboard')}
            className="flex-1 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
