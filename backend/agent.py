
import os
import sys
import resend
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timezone

load_dotenv()

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"],
)

resend.api_key = os.environ["RESEND_API_KEY"]
STAFF_EMAIL = os.environ["STAFF_EMAIL"]


def already_alerted(product_id: str, alert_type: str) -> bool:
    """Check if we already sent this alert today — prevents spam."""
    response = supabase.table("stock_alerts")\
        .select("id")\
        .eq("product_id", product_id)\
        .eq("alert_type", alert_type)\
        .eq("resolved", False)\
        .execute()
    return len(response.data) > 0


def send_email_alert(subject: str, body: str) -> None:
    """Send email to staff via Resend."""
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": STAFF_EMAIL,
            "subject": subject,
            "html": body,
        })
        print(f"Email sent: {subject}")
    except Exception as e:
        print(f"Email failed: {e}")


def log_action(action: str, details: str, status: str = "success") -> None:
    """Log every agent action to the database."""
    supabase.table("agent_logs").insert({
        "action": action,
        "details": details,
        "status": status,
    }).execute()


def check_stock() -> None:
    """Read all products, deactivate out-of-stock, alert on low stock."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Running stock check...")

    response = supabase.table("products")\
        .select("id, name, stock_quantity, is_active")\
        .execute()
    products = response.data or []

    out_of_stock = []
    low_stock = []

    for product in products:
        name = product["name"]
        qty = product["stock_quantity"]
        pid = product["id"]

        if qty == 0:
            # Deactivate product on website
            supabase.table("products")\
                .update({"is_active": False})\
                .eq("id", pid).execute()
            print(f"Deactivated: {name}")

            # Alert only if not already alerted
            if not already_alerted(pid, "out_of_stock"):
                out_of_stock.append(name)
                supabase.table("stock_alerts").insert({
                    "product_id": pid,
                    "product_name": name,
                    "alert_type": "out_of_stock",
                    "stock_quantity": qty,
                }).execute()

        elif qty < 10:
            print(f"Low stock: {name} — {qty} units")

            if not already_alerted(pid, "low_stock"):
                low_stock.append(f"{name} ({qty} units left)")
                supabase.table("stock_alerts").insert({
                    "product_id": pid,
                    "product_name": name,
                    "alert_type": "low_stock",
                    "stock_quantity": qty,
                }).execute()

    # Send one combined email if anything needs alerting
    if out_of_stock or low_stock:
        subject = f"FreshMart Stock Alert — {datetime.now().strftime('%d %b %Y')}"
        body = "<h2>FreshMart Stock Alert</h2>"

        if out_of_stock:
            body += "<h3 style='color:red'>🔴 Out of Stock (removed from website):</h3><ul>"
            for item in out_of_stock:
                body += f"<li>{item}</li>"
            body += "</ul>"

        if low_stock:
            body += "<h3 style='color:orange'>🟡 Low Stock (reorder soon):</h3><ul>"
            for item in low_stock:
                body += f"<li>{item}</li>"
            body += "</ul>"

        body += f"<p style='color:gray'>Checked at {datetime.now().strftime('%H:%M:%S')}</p>"
        send_email_alert(subject, body)
        log_action("stock_check", f"Alerted: {len(out_of_stock)} out, {len(low_stock)} low")
    else:
        print("All stock healthy — no alerts needed.")
        log_action("stock_check", "All products healthy")

def send_daily_summary() -> None:
    """Send a full stock summary email every morning."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Sending daily summary...")

    response = supabase.table("products")\
        .select("name, stock_quantity, is_active")\
        .execute()
    products = response.data or []

    orders_response = supabase.table("orders")\
        .select("total")\
        .gte("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d 00:00:00"))\
        .execute()
    orders = orders_response.data or []
    total_revenue = sum(float(o["total"]) for o in orders)

    out_of_stock = [p for p in products if p["stock_quantity"] == 0]
    low_stock = [p for p in products if 0 < p["stock_quantity"] < 10]
    healthy = [p for p in products if p["stock_quantity"] >= 10]

    body = f"""
    <h2>Good morning! FreshMart Daily Summary</h2>
    <p>{datetime.now().strftime('%d %b %Y')}</p>

    <h3 style='color:red'>🔴 Out of Stock ({len(out_of_stock)} items):</h3>
    <ul>{"".join(f"<li>{p['name']} (0 units)</li>" for p in out_of_stock) or "<li>None</li>"}</ul>

    <h3 style='color:orange'>🟡 Low Stock — reorder soon ({len(low_stock)} items):</h3>
    <ul>{"".join(f"<li>{p['name']} ({p['stock_quantity']} units)</li>" for p in low_stock) or "<li>None</li>"}</ul>

    <h3 style='color:green'>🟢 Healthy Stock ({len(healthy)} items):</h3>
    <ul>{"".join(f"<li>{p['name']} ({p['stock_quantity']} units)</li>" for p in healthy) or "<li>None</li>"}</ul>

    <hr>
    <p>📦 Orders today: {len(orders)}</p>
    <p>💰 Revenue today: ₹{total_revenue:.2f}</p>
    <p style='color:gray'>Have a great day!</p>
    """

    send_email_alert(
        f"FreshMart Morning Summary — {datetime.now().strftime('%d %b %Y')}",
        body
    )
    log_action("daily_summary", f"{len(out_of_stock)} out, {len(low_stock)} low, {len(orders)} orders")

if __name__ == "__main__":
    task = sys.argv[1] if len(sys.argv) > 1 else "check_stock"

    if task == "check_stock":
        check_stock()
    elif task == "daily_summary":
        send_daily_summary()
    else:
        print(f"Unknown task: {task}")
