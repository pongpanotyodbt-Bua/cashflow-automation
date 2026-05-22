"""
Aggregate sample_data CSVs into monthly/YTD totals.
Compare results vs 10_fs_targets_2025.csv (Financial Statement Targets).
Output: sample_data_aggregated.json + verification report.
"""
import csv
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "sample_data"
OUT = ROOT / "sample_data" / "sample_data_aggregated.json"

def read_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def month_of(date_str):
    return date_str[:7]  # YYYY-MM

def to_num(x):
    try:
        return float(x)
    except (ValueError, TypeError):
        return 0.0

# ---- LOAD ----
coa = {r["account_code"]: r for r in read_csv(DATA / "master/01_chart_of_accounts.csv")}
customers = {r["customer_id"]: r for r in read_csv(DATA / "master/02_customer_master.csv")}
suppliers = {r["supplier_id"]: r for r in read_csv(DATA / "master/03_supplier_master.csv")}
fs_targets = {r["metric"]: float(r["target_amount"]) for r in read_csv(DATA / "reconciliation/10_fs_targets_2025.csv")}

ar_invoices = read_csv(DATA / "transactions_2025/04_ar_invoices.csv")
ar_receipts = read_csv(DATA / "transactions_2025/05_ar_receipts.csv")
ap_bills    = read_csv(DATA / "transactions_2025/06_ap_bills.csv")
ap_payments = read_csv(DATA / "transactions_2025/07_ap_payments.csv")
bank_txns   = read_csv(DATA / "transactions_2025/08_bank_transactions.csv")
gl_journal  = read_csv(DATA / "transactions_2025/09_gl_journal.csv")

# ---- AGGREGATE: AR ----
ar_invoice_by_month = defaultdict(float)
ar_invoice_by_segment = defaultdict(float)
ar_invoice_by_segment_month = defaultdict(lambda: defaultdict(float))
revenue_by_account = defaultdict(float)

for r in ar_invoices:
    m = month_of(r["invoice_date"])
    amt = to_num(r["amount"])  # exclude VAT
    seg = r["segment"]
    ar_invoice_by_month[m] += amt
    ar_invoice_by_segment[seg] += amt
    ar_invoice_by_segment_month[seg][m] += amt
    revenue_by_account[r["revenue_account"]] += amt

ar_receipts_by_month = defaultdict(float)
ar_receipts_by_segment = defaultdict(float)
ar_receipts_by_segment_month = defaultdict(lambda: defaultdict(float))

for r in ar_receipts:
    m = month_of(r["receipt_date"])
    amt = to_num(r["amount"])
    cust_id = r["customer_id"]
    seg = customers.get(cust_id, {}).get("segment", "Unknown")
    ar_receipts_by_month[m] += amt
    ar_receipts_by_segment[seg] += amt
    ar_receipts_by_segment_month[seg][m] += amt

# ---- AGGREGATE: AP ----
ap_bill_by_month = defaultdict(float)
ap_bill_by_type = defaultdict(float)
expense_by_account = defaultdict(float)

for r in ap_bills:
    m = month_of(r["bill_date"])
    amt = to_num(r["amount"])
    ap_bill_by_month[m] += amt
    ap_bill_by_type[r["expense_type"]] += amt
    expense_by_account[r["expense_account"]] += amt

ap_pay_by_month = defaultdict(float)
for r in ap_payments:
    m = month_of(r["payment_date"])
    amt = to_num(r["amount"])
    ap_pay_by_month[m] += amt

# ---- AGGREGATE: BANK ----
bank_in_by_month = defaultdict(float)
bank_out_by_month = defaultdict(float)
bank_by_category = defaultdict(lambda: {"in": 0.0, "out": 0.0})
bank_by_account = defaultdict(lambda: {"in": 0.0, "out": 0.0})

for r in bank_txns:
    m = month_of(r["txn_date"])
    amt = to_num(r["amount"])
    cat = r["category"]
    acct = r["account"]
    if r["direction"] == "IN":
        bank_in_by_month[m] += amt
        bank_by_category[cat]["in"] += amt
        bank_by_account[acct]["in"] += amt
    else:
        bank_out_by_month[m] += amt
        bank_by_category[cat]["out"] += amt
        bank_by_account[acct]["out"] += amt

# Closing balance per account (from latest txn balance)
last_balance_by_account = {}
for r in bank_txns:
    last_balance_by_account[r["account"]] = to_num(r["balance"])

# ---- TOTALS ----
total_ar_invoiced = sum(ar_invoice_by_month.values())
total_ar_received = sum(ar_receipts_by_month.values())
total_ap_billed   = sum(ap_bill_by_month.values())
total_ap_paid     = sum(ap_pay_by_month.values())
total_bank_in     = sum(bank_in_by_month.values())
total_bank_out    = sum(bank_out_by_month.values())

# AR/AP movement (Closing - Opening, from FS targets)
ar_open  = fs_targets["ar_opening"]
ar_close = fs_targets["ar_closing"]
ap_open  = fs_targets["ap_opening"]
ap_close = fs_targets["ap_closing"]
inv_open = fs_targets["inventory_opening"]
inv_close= fs_targets["inventory_closing"]
cash_open = fs_targets["cash_opening"]
cash_close= fs_targets["cash_closing"]

ar_change = ar_close - ar_open    # +ve = AR grew  → CF negative
ap_change = ap_close - ap_open    # +ve = AP grew  → CF positive
inv_change = inv_close - inv_open # -ve = Inv down → CF positive
net_change_cash = cash_close - cash_open

# ---- VERIFICATION vs TARGETS ----
report = {
    "year": 2025,
    "fs_targets": fs_targets,
    "ar": {
        "invoices_total_ex_vat": total_ar_invoiced,
        "receipts_total": total_ar_received,
        "opening": ar_open,
        "closing": ar_close,
        "change": ar_change,
        "cf_impact": -ar_change,
        "by_segment_invoiced": dict(ar_invoice_by_segment),
        "by_segment_received": dict(ar_receipts_by_segment),
        "monthly_invoiced": dict(ar_invoice_by_month),
        "monthly_received": dict(ar_receipts_by_month),
    },
    "ap": {
        "bills_total_ex_vat": total_ap_billed,
        "payments_total": total_ap_paid,
        "opening": ap_open,
        "closing": ap_close,
        "change": ap_change,
        "cf_impact": ap_change,
        "by_type": dict(ap_bill_by_type),
        "monthly_billed": dict(ap_bill_by_month),
        "monthly_paid": dict(ap_pay_by_month),
    },
    "inventory": {
        "opening": inv_open,
        "closing": inv_close,
        "change": inv_change,
        "cf_impact": -inv_change,
    },
    "cash": {
        "opening": cash_open,
        "closing": cash_close,
        "net_change_target": net_change_cash,
        "net_change_target_csv": fs_targets["net_change_cash"],
        "bank_inflow_total": total_bank_in,
        "bank_outflow_total": total_bank_out,
        "bank_net_total": total_bank_in - total_bank_out,
        "monthly_in": dict(bank_in_by_month),
        "monthly_out": dict(bank_out_by_month),
        "by_category": dict(bank_by_category),
        "closing_by_account": last_balance_by_account,
    },
    "pl": {
        "revenue_target": fs_targets["total_revenue"],
        "revenue_computed_ex_vat": total_ar_invoiced,
        "net_profit_target": fs_targets["net_profit"],
        "revenue_by_account": dict(revenue_by_account),
    },
    "cf_targets": {
        "operating": fs_targets["operating_cf"],
        "investing": fs_targets["investing_cf"],
        "financing": fs_targets["financing_cf"],
        "net_change": fs_targets["net_change_cash"],
    },
}

# ---- DIFFS / RECONCILIATION ----
def gap(a, b):
    return {"a": a, "b": b, "diff": a - b, "pct": (a - b) / b * 100 if b else None}

report["reconciliation"] = {
    "revenue_ex_vat_vs_target": gap(total_ar_invoiced, fs_targets["total_revenue"]),
    "ar_receipts_vs_revenue":   gap(total_ar_received, total_ar_invoiced),
    "bank_net_vs_cash_change":  gap(total_bank_in - total_bank_out, net_change_cash),
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)

# ---- CONSOLE OUTPUT ----
print("=" * 70)
print("SAMPLE DATA AGGREGATION REPORT (Year 2025)")
print("=" * 70)
print(f"\n[REVENUE & AR]")
print(f"  AR Invoiced (ex VAT, sum 132 invoices): {total_ar_invoiced:>20,.0f}")
print(f"  Revenue Target (FS):                    {fs_targets['total_revenue']:>20,.0f}")
print(f"  Gap:                                    {total_ar_invoiced - fs_targets['total_revenue']:>20,.0f}")
print(f"  AR Receipts (sum 140 receipts):         {total_ar_received:>20,.0f}")
print(f"  AR Opening / Closing:                   {ar_open:>20,.0f} / {ar_close:,.0f}")
print(f"  AR Change (CF impact):                  {-ar_change:>20,.0f}  (negative = AR grew)")

print(f"\n[AP & EXPENSES]")
print(f"  AP Bills (ex VAT):                      {total_ap_billed:>20,.0f}")
print(f"  AP Payments:                            {total_ap_paid:>20,.0f}")
print(f"  AP Opening / Closing:                   {ap_open:>20,.0f} / {ap_close:,.0f}")
print(f"  AP Change (CF impact):                  {ap_change:>20,.0f}  (positive = AP grew)")

print(f"\n[INVENTORY]")
print(f"  Inv Opening / Closing:                  {inv_open:>20,.0f} / {inv_close:,.0f}")
print(f"  Inv Change (CF impact):                 {-inv_change:>20,.0f}")

print(f"\n[CASH / BANK]")
print(f"  Bank Inflow Total:                      {total_bank_in:>20,.0f}")
print(f"  Bank Outflow Total:                     {total_bank_out:>20,.0f}")
print(f"  Bank Net:                               {total_bank_in - total_bank_out:>20,.0f}")
print(f"  Cash Change Target (FS):                {net_change_cash:>20,.0f}")
print(f"  Cash Opening / Closing:                 {cash_open:>20,.0f} / {cash_close:,.0f}")

print(f"\n[CF TARGETS FROM FS]")
print(f"  Operating CF:                           {fs_targets['operating_cf']:>20,.0f}")
print(f"  Investing CF:                           {fs_targets['investing_cf']:>20,.0f}")
print(f"  Financing CF:                           {fs_targets['financing_cf']:>20,.0f}")
print(f"  Net Change:                             {fs_targets['net_change_cash']:>20,.0f}")

print(f"\n[BANK BY CATEGORY] (top contributors)")
sorted_cats = sorted(bank_by_category.items(), key=lambda x: -(x[1]['in']+x[1]['out']))
for cat, vals in sorted_cats[:15]:
    print(f"  {cat:30s}  IN: {vals['in']:>15,.0f}  OUT: {vals['out']:>15,.0f}")

print(f"\n[OUTPUT]")
print(f"  JSON saved to: {OUT}")
print("=" * 70)
