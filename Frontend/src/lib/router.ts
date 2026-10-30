import type { Page } from '../types';

const PAGE_MAP: Record<string, Page> = {
  '#/': 'home',
  '#/shop': 'shop',
  '#/cart': 'cart',
  '#/checkout': 'checkout',
  '#/confirmation': 'confirmation',
  '#/order-tracking': 'order-tracking',
  '#/staff': 'staff-login',
  '#/staff/dashboard': 'staff-dashboard',
  '#/staff/add-product': 'staff-add-product',
  '#/staff/edit-product': 'staff-edit-product',
};

export function getPageFromHash(): Page {
  const hash = window.location.hash || '#/';
  return PAGE_MAP[hash] ?? 'home';
}

export function navigate(page: Page, params?: Record<string, string>) {
  const HASH_MAP: Record<Page, string> = {
    home: '#/',
    shop: '#/shop',
    cart: '#/cart',
    checkout: '#/checkout',
    confirmation: '#/confirmation',
    'order-tracking': '#/order-tracking',
    'staff-login': '#/staff',
    'staff-dashboard': '#/staff/dashboard',
    'staff-add-product': '#/staff/add-product',
    'staff-edit-product': '#/staff/edit-product',
  };
  let hash = HASH_MAP[page];
  if (params) {
    const qs = new URLSearchParams(params).toString();
    hash = `${hash}?${qs}`;
  }
  window.location.hash = hash.replace('#', '');
}
