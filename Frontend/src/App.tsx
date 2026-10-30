import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StaffAddProductPage } from './pages/StaffAddProductPage';
import { useCart } from './hooks/useCart';
import { getPageFromHash, navigate } from './lib/router';
import type { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, itemCount } = useCart();

  useEffect(() => {
    function onHashChange() {
      setCurrentPage(getPageFromHash());
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const isStaffPage = currentPage === 'staff-dashboard' || currentPage === 'staff-add-product' || currentPage === 'staff-edit-product';
    if (isStaffPage && !localStorage.getItem('freshmart_staff')) {
      navigate('staff-login');
    }
  }, [currentPage]);

  function handleOrderPlaced(orderId: string) {
    setConfirmedOrderId(orderId);
    clearCart();
  }

  function handleEditProduct(id: string) {
    setEditingProductId(id);
    navigate('staff-edit-product');
  }

  const showHeader = currentPage !== 'home' && currentPage !== 'staff-login';

  return (
    <div className="min-h-screen bg-stone-50">
      {showHeader && <Header currentPage={currentPage} itemCount={itemCount} />}

      {currentPage === 'home' && <HomePage />}

      {currentPage === 'shop' && (
        <ShopPage cartItems={items} onAdd={addItem} onUpdateQty={updateQuantity} />
      )}

      {currentPage === 'cart' && (
        <CartPage
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          onUpdateQty={updateQuantity}
          onRemove={removeItem}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {currentPage === 'confirmation' && (
        <ConfirmationPage orderId={confirmedOrderId} />
      )}

      {currentPage === 'order-tracking' && <OrderTrackingPage />}

      {currentPage === 'staff-login' && <StaffLoginPage />}

      {currentPage === 'staff-dashboard' && (
        <StaffDashboardPage
          editingProductId={editingProductId}
          onEditProduct={handleEditProduct}
        />
      )}

      {(currentPage === 'staff-add-product' || currentPage === 'staff-edit-product') && (
        <StaffAddProductPage
          editingProductId={currentPage === 'staff-edit-product' ? editingProductId : null}
        />
      )}
    </div>
  );
}
