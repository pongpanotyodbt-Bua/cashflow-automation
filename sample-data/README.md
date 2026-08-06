# Cashflow Automation MVP — Sample Data Pack

## Purpose
Synthetic but reconcilable multi-company test data for the Cashflow Automation system, derived from real FY2568 (2025) Financial Statements of:

- **ACG** — Autocorp Holding PCL (parent, listed)
- **HMW** — Honda Maliwan (subsidiary, auto dealer)
- **CLIK** — Autoclick by ACG (subsidiary, service centre)
- **CONSO** — Consolidated group view

All amounts in THB. Period: 2025-01-01 to 2025-12-31.

## Folder Layout
```
sample-data/
├── generate.ps1               -- Master generator (regenerates all transactions)
├── master/                    -- Static reference data
│   ├── 01_companies.csv
│   ├── 02_chart_of_accounts.csv
│   ├── 03_customers.csv
│   ├── 04_vendors.csv
│   ├── 05_fixed_assets.csv
│   ├── 06_loans.csv
│   ├── 07_leases_tfrs16.csv
│   └── 08_intercompany.csv
├── mapping/                   -- COA → analytical dimensions
│   ├── 01_coa_cf_group.csv         -- COA → CF activity (Operating/Investing/Financing)
│   ├── 02_coa_department.csv       -- COA → Department
│   ├── 03_coa_budget_group.csv     -- COA → Budget Group
│   └── 04_coa_fs_line.csv          -- COA → FS line item
├── transactions/              -- Generated journal & sub-ledger files
│   ├── gl_journal.csv         -- Full GL (all 3 companies, ~2,000 lines)
│   ├── gl_journal_acg.csv     -- Per-company splits
│   ├── gl_journal_hmw.csv
│   ├── gl_journal_clik.csv
│   ├── ar_invoices.csv
│   ├── ar_receipts.csv
│   ├── ap_bills.csv
│   ├── ap_payments.csv
│   ├── bank_transactions.csv
│   ├── cash_receipts.csv
│   ├── cash_payments.csv
│   ├── fa_movements.csv       -- Capex + disposals
│   ├── loan_movements.csv     -- Loan proceeds & repayments
│   └── tax_movements.csv
├── reconciliation/            -- Target & actual snapshots
│   ├── fs_targets_2568.csv         -- Real FS numbers per company
│   ├── trial_balance_by_company.csv -- TB derived from GL
│   └── fs_vs_tb_reconciliation.csv  -- Variance report
└── validation/                -- PowerShell verification scripts
    ├── run_all.ps1            -- Run everything
    ├── validate_gl_integrity.ps1
    ├── validate_bs_balance.ps1
    ├── validate_tb_vs_fs.ps1
    └── validate_cash_flow.ps1
```

## Usage
```powershell
# 1. Regenerate everything from scratch
powershell -ExecutionPolicy Bypass -File sample-data\generate.ps1

# 2. Run all validations
powershell -ExecutionPolicy Bypass -File sample-data\validation\run_all.ps1
```

## What's Modelled

| Pattern | Where |
|---|---|
| Double-entry GL (every JE balances) | `gl_journal.csv` — enforced by generator |
| Monthly revenue/COGS/SGA accruals | Per company, 12 months |
| Cash vs. credit customers | HMW: 60% cash veh, 30% finance, 10% corporate |
| Trade AR aging | Finance co (30d), Corporate (60d), retained sub-ledger |
| Trade AP with vendor master | Honda parts, services, intercompany |
| Bank movements (multi-account) | 1112 current, 1113 savings |
| Fixed assets + disposals | CAPEX, accumulated depr, gain/loss on disposal |
| TFRS16 leases | Non-cash ROU additions, depreciation, lease liability amort |
| Short- & long-term loans | Bank loans (HMW, CLIK), parent loan to subsidiary |
| Tax entries | Quarterly accrual + payment, deferred tax benefit (CLIK) |
| Intercompany | Mgmt fees (HMW→ACG, CLIK→ACG); Parts (HMW→CLIK); Service (CLIK→HMW); Dividend (HMW→ACG); IC loan interest |
| Year-end closing | P&L → RE; legal reserve transfer; employee benefit provision; SBP warrants |

## Reconciliation Results

Latest run (`validation/run_all.ps1`):

| Check | Result |
|---|---|
| GL Integrity (DR=CR per JE) | **PASS** — 0 errors, 0 warnings |
| BS Balance (Assets = Liab + Equity) | **PASS** — all 3 companies balanced |
| TB vs FS Targets | 15 **OK** + 6 **CLOSE** (<5%) + 3 **OFF** |
| Financing flows | **EXACT match** (ST 920M proceeds / 1,020M repaid, LT 11.15M, lease 16.66M) |
| D&A | Depr PPE 42.17M, Depr ROU 14.91M, Inv Property 1.44M, Amort 2.08M |

### Known Variances (documented, not bugs)

| Item | Variance | Reason |
|---|---|---|
| HMW AR | -1.93M (-5.7%) | Synthetic AR mix slightly over-allocated to cash channel |
| CLIK AR | +1.20M (+128% of 0.94M target) | Tiny target — absolute variance small |
| ACG Admin Expense | +0.77M (+55%) | Share-based payment 0.77M booked to 5419; could be reclassified to non-OpEx |
| Cash closing (aggregated) | +55M over CONSO target | Mix of: (a) generator assumes too-high cash sales mix, (b) some IC payments not fully timed, (c) inventory consumption pattern simplified. CONSO target is post-elimination |

### Group P&L Sanity
Sum of 3 separate company NPs (pre-close):
- HMW: 71.91M | CLIK: -35.89M | ACG: 17.52M | **Sum: 53.55M**
- CONSO FS target: 37.78M
- Implied IC dividend elim: ~16M ✓ (matches the 15.96M HMW→ACG dividend)

## Source Data
Generated from the following actual FS files (read & parsed via `scripts/xlsx_to_csv.ps1`):
- `Finance Statement/ACG/Year 25/FINANCIAL_STATEMENTS.XLSX` (Consolidated + Separate)
- `Finance Statement/HMW/HMW_BS.xlsx` + `HMW_PL.xlsx`
- `Finance Statement/CLIK/CLIK_BS.xlsx` + `CLIK_PL.xlsx`
- `Finance Statement/COA_Group.xlsx`

Extracted CSV dumps preserved in `scripts/_fs_dump/` for reference.

## Production Hand-off Notes
This is **MVP-grade synthetic data** for system validation and UAT. For production:
1. Replace `generate.ps1` synthetic generation with ETL from real ERP (Business Central, SAP, Oracle, etc.)
2. AR/AP sub-ledgers should be loaded from customer/vendor systems with actual aging
3. Add VAT lines (current model is ex-VAT for simplicity)
4. Add foreign currency support (current model is THB-only)
5. Add ERP-side intercompany matching rules (CLIK 2125 → ACG 1125)
6. Add CONSO eliminations as a separate ledger (currently aggregated only)

## Regenerate after editing assumptions
Edit annual amounts inside `generate.ps1` — see the per-company sections (HMW/CLIK/ACG blocks) — then re-run the generator and validation.
