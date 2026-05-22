"""Verify Indirect Method Operating CF reconciles to FS Target."""
import csv, json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "sample_data"

def read_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))

fs = {r["metric"]: float(r["target_amount"]) for r in read_csv(DATA / "reconciliation/10_fs_targets_2025.csv")}

# Net Profit
NP = fs["net_profit"]

# Non-cash addbacks
dep_ppe = fs["depreciation_ppe"]
dep_ip  = fs["depreciation_inv_property"]
dep_rou = fs["depreciation_rou"]
amort   = fs["amortization"]
DA = dep_ppe + dep_ip + dep_rou + amort

# Interest & Tax (add back from NP, subtract actual paid)
fin_cost = fs["finance_cost"]
tax_exp  = fs["income_tax_expense"]
int_paid = fs["interest_paid"]
tax_paid = fs["tax_paid_net"]

# Working Capital changes (sign convention: positive = cash inflow)
ar_dec_cf  = -(fs["ar_closing"] - fs["ar_opening"])         # AR down  -> CF up
ap_inc_cf  =  (fs["ap_closing"] - fs["ap_opening"])         # AP up    -> CF up
inv_dec_cf = -(fs["inventory_closing"] - fs["inventory_opening"])  # Inv down -> CF up

# === Build OCF (TAS 7 Indirect, Thai presentation) ===
step1 = NP + fin_cost + tax_exp  # = Operating profit (EBIT)
step2 = step1 + DA               # + D&A
step3 = step2 + ar_dec_cf + ap_inc_cf + inv_dec_cf  # + WC changes
ocf_before_paid = step3
ocf_final = ocf_before_paid - int_paid - tax_paid

target = fs["operating_cf"]
gap = target - ocf_final

# === Financing CF ===
fcf_components = {
    "dividend_paid": -fs["dividend_paid_parent"],
    "st_loan_net":   fs["st_loan_net"],
    "lt_loan_repaid": -fs["lt_loan_repaid"],
    "lease_paid":    -fs["lease_paid"],
}
fcf_total = sum(fcf_components.values())
fcf_target = fs["financing_cf"]

# === Net Cash Change ===
icf = fs["investing_cf"]
net_change_calc = ocf_final + icf + fcf_total
net_change_target = fs["net_change_cash"]

# === REPORT ===
print("="*72)
print("INDIRECT METHOD VERIFICATION (TAS 7)")
print("="*72)
print(f"\n[OPERATING CF - Build-up]")
print(f"  Net Profit                                    {NP:>15,.0f}")
print(f"  + Finance Cost (add back)                     {fin_cost:>15,.0f}")
print(f"  + Tax Expense (add back)                      {tax_exp:>15,.0f}")
print(f"  = Operating Profit (EBIT)                     {step1:>15,.0f}")
print(f"  + D&A (PPE + IP + ROU + Amort)                {DA:>15,.0f}")
print(f"  + AR decrease ({-ar_dec_cf:>13,.0f})             {ar_dec_cf:>15,.0f}")
print(f"  + AP increase ({ap_inc_cf:>13,.0f})             {ap_inc_cf:>15,.0f}")
print(f"  + Inventory decrease ({-inv_dec_cf:>13,.0f})      {inv_dec_cf:>15,.0f}")
print(f"  = Cash from Ops (before int/tax paid)         {ocf_before_paid:>15,.0f}")
print(f"  - Interest paid                               {-int_paid:>15,.0f}")
print(f"  - Tax paid                                    {-tax_paid:>15,.0f}")
print(f"  = OPERATING CF (computed)                     {ocf_final:>15,.0f}")
print(f"    OPERATING CF (target)                       {target:>15,.0f}")
print(f"    GAP                                         {gap:>15,.0f}  ({gap/target*100:.2f}%)")

print(f"\n[FINANCING CF - Build-up]")
for k, v in fcf_components.items():
    print(f"  {k:30s}                {v:>15,.0f}")
print(f"  = FINANCING CF (computed)                     {fcf_total:>15,.0f}")
print(f"    FINANCING CF (target)                       {fcf_target:>15,.0f}")
print(f"    GAP                                         {fcf_target-fcf_total:>15,.0f}")

print(f"\n[INVESTING CF]")
print(f"  ICF (target only)                             {icf:>15,.0f}")

print(f"\n[NET CHANGE IN CASH]")
print(f"  OCF + ICF + FCF (computed)                    {net_change_calc:>15,.0f}")
print(f"  Net change (target)                           {net_change_target:>15,.0f}")
print(f"  GAP                                           {net_change_target-net_change_calc:>15,.0f}")
print("="*72)
