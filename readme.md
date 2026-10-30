# FreshMart — Supermarket Management System

A web-based order and inventory management system built for local supermarkets in India. Customers can browse products, place Cash on Delivery orders, and track deliveries. Staff manage stock and orders through a dashboard.

**Live demo:** https://super-market-ai.vercel.app  
**Staff login password:** `freshmart2024`

---

## What it does

**Customer flow**
- Browse products by category, search, add to cart
- Checkout with name, phone, email, delivery address (Cash on Delivery)
- Receives an instant email receipt after order placement
- Tracks order status (Confirmed → Dispatched → Delivered) via phone number

**Staff flow**
- Password-protected dashboard
- View live stock levels — low stock and out of stock flagged automatically
- Add, edit, delete products
- View incoming orders with full item breakdown
- Update order status manually (dropdown, saves instantly)

**Automated stock agent (runs 24/7)**
- Checks stock every 5 hours via GitHub Actions
- Auto-deactivates out-of-stock products from the customer shop
- Emails staff instantly when stock is low or out
- Sends a daily 8am summary with full stock report, order count, and revenue

---

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS → deployed on Vercel
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Email receipts:** Supabase Edge Function + Resend API
- **Stock agent:** Python script scheduled via GitHub Actions (free, no server)
- **Staff alerts:** Resend API triggered from the agent

---

## Key decisions

- **Cash on Delivery** instead of Razorpay — Indian payment gateways require GST registration which isn't set up yet. Will integrate Razorpay when a registered supermarket client is onboarded.
- **GitHub Actions** instead of a hosted server for the agent — the agent is a single-shot script that runs and exits. No persistent server needed, completely free.
- **No backend API server** — frontend talks directly to Supabase. Edge Functions handle anything that needs a server-side secret (email sending).

---

## Current limitations

- Customer emails only send to the verified Resend account email (free tier restriction) — needs a verified domain for production use
- Staff login is a single shared password — role-based auth planned for production
- Product images are placeholder stock photos — to be replaced with real data at client onboarding

---

*Built by Pooja Sri — June 2026*