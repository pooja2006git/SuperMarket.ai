import { useEffect, useState } from 'react';
import { Package, AlertTriangle, TrendingUp, Search, Edit3, Trash2, RefreshCw, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

type OrderStatus = 'confirmed' | 'dispatched' | 'delivered';

interface StaffOrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface StaffOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  total: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
  order_items: StaffOrderItem[];
}

interface StaffDashboardPageProps {
  editingProductId: string | null;
  onEditProduct: (id: string) => void;
}

export function StaffDashboardPage({ onEditProduct }: StaffDashboardPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock');
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  function loadProducts() {
    setLoading(true);
    supabase
      .from('products')
      .select('*')
      .order('category')
      .then(({ data }) => {
        if (data) setProducts(data);
        setLoading(false);
      });
  }

  function loadOrders() {
    setOrdersLoading(true);
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as StaffOrder[]);
        setOrdersLoading(false);
      });
  }

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [activeTab]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingOrderId(orderId);
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    }
    setUpdatingOrderId(null);
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'all' ||
      (activeFilter === 'low' && p.stock_quantity > 0 && p.stock_quantity <= 10) ||
      (activeFilter === 'out' && p.stock_quantity === 0);
    return matchSearch && matchFilter;
  });

  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length;
  const outOfStock = products.filter(p => p.stock_quantity === 0).length;

  function stockBadge(qty: number) {
    if (qty === 0) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">Out of stock</span>;
    if (qty <= 10) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Low: {qty}</span>;
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">{qty} units</span>;
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Staff dashboard</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {activeTab === 'stock' ? 'Manage your products and inventory' : 'View and update incoming orders'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'stock' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Stock
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'orders' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              Orders
            </button>
          </div>
          <button
            onClick={activeTab === 'stock' ? loadProducts : loadOrders}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total products', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', filter: 'all' as const },
              { label: 'Low stock', value: lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', filter: 'low' as const },
              { label: 'Out of stock', value: outOfStock, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', filter: 'out' as const },
            ].map(({ label, value, icon: Icon, color, bg, filter }) => (
              <button
                key={label}
                onClick={() => setActiveFilter(activeFilter === filter ? 'all' : filter)}
                className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                  activeFilter === filter ? 'border-stone-300 shadow-sm' : 'border-stone-100'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 ${bg} rounded-lg mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xl font-bold text-stone-800">{value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{label}</p>
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-100 h-16 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                <span className="col-span-5">Product</span>
                <span className="col-span-2">Category</span>
                <span className="col-span-2">Price</span>
                <span className="col-span-2">Stock</span>
                <span className="col-span-1" />
              </div>

              <div className="divide-y divide-stone-50">
                {filtered.map(product => (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-stone-50 transition-colors"
                  >
                    <div className="col-span-8 sm:col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-stone-200" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 leading-tight">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.unit}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block col-span-2">
                      <span className="text-xs text-stone-500">{product.category}</span>
                    </div>

                    <div className="hidden sm:block col-span-2">
                      <span className="text-sm font-medium text-stone-700">₹{product.price.toFixed(0)}</span>
                    </div>

                    <div className="hidden sm:block col-span-2">
                      {stockBadge(product.stock_quantity)}
                    </div>

                    <div className="col-span-4 sm:col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-stone-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-100 h-40 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-stone-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{order.customer_name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{order.customer_phone}</p>
                      <p className="text-xs text-stone-500">{order.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-stone-800">₹{order.total.toFixed(0)}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatDateTime(order.created_at)}</p>
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 mb-3">{order.delivery_address}</p>

                  <div className="border-t border-stone-100 pt-3 mb-3 space-y-2">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-stone-800">{item.product_name}</span>
                          <span className="text-stone-400 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="text-stone-600">
                          ₹{item.price.toFixed(0)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Status:</span>
                      {statusBadge(order.status)}
                      <span className="text-xs text-stone-400">· {order.payment_method}</span>
                    </div>
                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-sm border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
