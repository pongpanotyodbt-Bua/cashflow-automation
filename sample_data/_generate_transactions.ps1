# Generates FY2025 (CY2025 / FY2568) sample transactions for Autocorp Holdings PCL (ACG)
# Numbers tie back to the actual consolidated FS published in FS\YE'25\FINANCIAL_STATEMENTS.XLSX
# Run from project root: powershell -ExecutionPolicy Bypass -File sample_data\_generate_transactions.ps1

$ErrorActionPreference = "Stop"
$utf8Bom = New-Object System.Text.UTF8Encoding($true)
$root = Join-Path $PSScriptRoot "transactions_2025"
$reconRoot = Join-Path $PSScriptRoot "reconciliation"
New-Item -ItemType Directory -Force -Path $root | Out-Null
New-Item -ItemType Directory -Force -Path $reconRoot | Out-Null

function Write-Csv($path, [string[]]$lines) {
    [System.IO.File]::WriteAllLines($path, $lines, $utf8Bom)
}

# =========================================================================
# FS TARGETS (Conso CY2025 / FY2568) - source of truth
# =========================================================================
$T = [ordered]@{
    REV_SALES_SERVICE      = 1320815808
    REV_CONSTRUCTION       = 24126468
    OTHER_INCOME           = 13250158
    TOTAL_REVENUE          = 1358192434

    COGS_AND_SERVICE       = 1079265810
    COST_DISTRIBUTION      = 56360501
    ADMIN_EXP              = 153605579
    TOTAL_EXPENSES         = 1289231890

    FINANCE_COST           = 14962373
    INCOME_TAX             = 16215478
    NET_PROFIT             = 37782693

    AR_OPEN                = 22136556
    AR_CLOSE               = 21606892
    AR_CHANGE              = -529664        # decrease (CF favourable)

    AP_OPEN                = 82704488
    AP_CLOSE               = 87097100
    AP_CHANGE              = 4392612        # increase (CF favourable)

    INV_OPEN               = 118032601
    INV_CLOSE              = 74124409
    INV_CHANGE             = -43908192

    DEP_PPE                = 40172607
    DEP_INV_PROPERTY       = 1443501
    DEP_ROU                = 15011633
    AMORT                  = 1124861
    EMP_BENEFIT_ACCRUAL    = 1242664

    OP_CF                  = 159138454
    INV_CF                 = -433614
    FIN_CF                 = -150832820
    NET_CHANGE_CASH        = 7872020
    CASH_OPEN              = 165871149
    CASH_CLOSE             = 173743169

    ST_LOAN_DRAW           = 920000000
    ST_LOAN_REPAY          = -1020000000
    LT_LOAN_REPAY          = -11150000
    LEASE_PAID             = -16661489
    DIV_PARENT             = -15956511
    DIV_NCI                = -40727
    INTEREST_PAID          = -7024093

    CAPEX_EQUIPMENT        = -3063493
    DISPOSAL_PROCEEDS      = 3272996
    CAPEX_INTANGIBLE       = -1134658
    OTHER_INV_INCOME       = 491541
}

# =========================================================================
# Monthly distribution weights (sum = 1.0, skewed toward Q4 like auto retail)
# =========================================================================
$monthWeights = @{
    1=0.075; 2=0.070; 3=0.085; 4=0.075; 5=0.080; 6=0.085
    7=0.085; 8=0.085; 9=0.090; 10=0.090; 11=0.090; 12=0.090
}
# Normalize residue lands in Dec via final reconciliation step

function MonthlyAllocate([long]$annual, [int]$decimals = 0) {
    $alloc = @{}
    $accum = 0L
    foreach ($m in 1..11) {
        $v = [math]::Round($annual * $monthWeights[$m], $decimals)
        $alloc[$m] = [long]$v
        $accum += [long]$v
    }
    $alloc[12] = [long]($annual - $accum)
    return $alloc
}

# =========================================================================
# REVENUE BREAKDOWN BY TYPE
# =========================================================================
# Revenue from sales/services (1,320,815,808) split:
#   Vehicle sales (4110)     - 1,160,000,000
#   Service center (4120)    -    80,000,000
#   Spare parts (4130)       -    80,815,808
# Construction/body (4140)   -    24,126,468
# Other income (4190) - NOT in AR, posted as bank receipts directly: 13,250,158

$rev = @{
    Vehicle = 1160000000L
    Service = 80000000L
    Parts   = 80815808L
    Body    = 24126468L
}

$vehMonthly = MonthlyAllocate $rev.Vehicle
$svcMonthly = MonthlyAllocate $rev.Service
$prtMonthly = MonthlyAllocate $rev.Parts
$bdyMonthly = MonthlyAllocate $rev.Body

# Customer segment weights for Vehicle sales
$vehSeg = @{
    Cash      = 0.40     # CUST-0001 + walk-in retail
    Finance   = 0.45     # CUST-0002..0010
    Corporate = 0.10     # CUST-0011..0020
    Dealer    = 0.05     # CUST-0021..0025, 0041, 0042
}

# Finance company rotation
$financeIds = @("CUST-0002","CUST-0003","CUST-0004","CUST-0005","CUST-0006","CUST-0007","CUST-0008","CUST-0009","CUST-0010")
$corpIds    = @("CUST-0011","CUST-0012","CUST-0013","CUST-0014","CUST-0015","CUST-0016","CUST-0017","CUST-0018","CUST-0019","CUST-0020","CUST-0043","CUST-0044","CUST-0045","CUST-0048","CUST-0049","CUST-0050")
$dealerIds  = @("CUST-0021","CUST-0022","CUST-0023","CUST-0024","CUST-0025","CUST-0041","CUST-0042")
$partsBuyerIds = @("CUST-0033","CUST-0034","CUST-0021","CUST-0022","CUST-0023","CUST-0024","CUST-0025","CUST-0041","CUST-0042")
$insuranceIds  = @("CUST-0036","CUST-0037","CUST-0038","CUST-0039","CUST-0040")

# Map customer -> credit term days
$custTerms = @{}
$custCsv = Import-Csv (Join-Path $PSScriptRoot "master\02_customer_master.csv")
foreach ($c in $custCsv) { $custTerms[$c.customer_id] = [int]$c.credit_term_days }

# =========================================================================
# 04 - AR INVOICES
# =========================================================================
$invHeader = "invoice_id,invoice_date,due_date,customer_id,revenue_account,revenue_type,segment,amount,vat_amount,total_amount,credit_term_days,reference,status"
$invLines = New-Object System.Collections.Generic.List[string]
$invLines.Add($invHeader)

$invSeq = 0
function NewInvId() { $script:invSeq++; return ("INV-2025-{0:D5}" -f $script:invSeq) }

function AddInvoice($date, $custId, $acct, $revType, $segment, $netAmt, $ref) {
    $term = $custTerms[$custId]
    $due = $date.AddDays($term)
    $vat = [math]::Round($netAmt * 0.07, 2)
    $total = $netAmt + $vat
    $line = "{0},{1:yyyy-MM-dd},{2:yyyy-MM-dd},{3},{4},{5},{6},{7},{8},{9},{10},{11},OPEN" -f `
        (NewInvId), $date, $due, $custId, $acct, $revType, $segment, $netAmt, $vat, $total, $term, $ref
    $script:invLines.Add($line)
}

foreach ($m in 1..12) {
    $invDate = [DateTime]::new(2025, $m, 15)

    # -- Vehicle sales --
    $vehTotal = $vehMonthly[$m]
    $vehCash      = [math]::Round($vehTotal * $vehSeg.Cash, 0)
    $vehFinance   = [math]::Round($vehTotal * $vehSeg.Finance, 0)
    $vehCorporate = [math]::Round($vehTotal * $vehSeg.Corporate, 0)
    $vehDealer    = $vehTotal - $vehCash - $vehFinance - $vehCorporate

    # Cash retail - batch monthly summary to CUST-0001
    AddInvoice $invDate "CUST-0001" "4110" "Vehicle" "Cash" $vehCash "BATCH-VEH-CASH-$m"

    # Finance - split across 3 finance companies per month (rotating)
    $shares = @(0.42, 0.33, 0.25)
    for ($i = 0; $i -lt 3; $i++) {
        $idx = (($m - 1) * 3 + $i) % $financeIds.Count
        $amt = if ($i -lt 2) { [math]::Round($vehFinance * $shares[$i], 0) } else { $vehFinance - [math]::Round($vehFinance * $shares[0], 0) - [math]::Round($vehFinance * $shares[1], 0) }
        AddInvoice $invDate.AddDays($i*3) $financeIds[$idx] "4110" "Vehicle" "Finance" $amt "FIN-VEH-$m-$($i+1)"
    }

    # Corporate fleet - 1 fleet customer per month
    $cIdx = ($m - 1) % $corpIds.Count
    AddInvoice $invDate.AddDays(10) $corpIds[$cIdx] "4110" "Vehicle" "Corporate" $vehCorporate "FLT-VEH-$m"

    # Dealer wholesale - 1 sub-dealer per month
    $dIdx = ($m - 1) % $dealerIds.Count
    AddInvoice $invDate.AddDays(7) $dealerIds[$dIdx] "4110" "Vehicle" "Dealer" $vehDealer "DLR-VEH-$m"

    # -- Service center revenue (mostly walk-in cash, batch to CUST-0035) --
    $svcCash   = [math]::Round($svcMonthly[$m] * 0.75, 0)
    $svcCorp   = $svcMonthly[$m] - $svcCash
    AddInvoice $invDate "CUST-0035" "4120" "Service" "Cash" $svcCash "BATCH-SVC-CASH-$m"
    $sIdx = ($m + 4) % $corpIds.Count
    AddInvoice $invDate.AddDays(12) $corpIds[$sIdx] "4120" "Service" "Corporate" $svcCorp "FLT-SVC-$m"

    # -- Spare parts revenue (mostly wholesale to dealers) --
    $pIdx = ($m - 1) % $partsBuyerIds.Count
    $pCash = [math]::Round($prtMonthly[$m] * 0.25, 0)
    $pCredit = $prtMonthly[$m] - $pCash
    AddInvoice $invDate "CUST-0001" "4130" "Parts" "Cash" $pCash "BATCH-PRT-CASH-$m"
    AddInvoice $invDate.AddDays(5) $partsBuyerIds[$pIdx] "4130" "Parts" "Dealer" $pCredit "DLR-PRT-$m"

    # -- Body shop revenue (insurance claims) --
    $iIdx = ($m - 1) % $insuranceIds.Count
    AddInvoice $invDate.AddDays(8) $insuranceIds[$iIdx] "4140" "BodyShop" "Insurance" $bdyMonthly[$m] "INS-BODY-$m"
}

Write-Csv (Join-Path $root "04_ar_invoices.csv") $invLines.ToArray()

# Verify
$invTotal = 0L
foreach ($l in $invLines | Select-Object -Skip 1) {
    $parts = $l -split ","
    $invTotal += [long]$parts[7]
}
Write-Host ("AR Invoices net total: {0:N0}  (target {1:N0}  delta {2:N0})" -f `
    $invTotal, ($rev.Vehicle + $rev.Service + $rev.Parts + $rev.Body), `
    ($invTotal - ($rev.Vehicle + $rev.Service + $rev.Parts + $rev.Body)))

# =========================================================================
# 05 - AR RECEIPTS
# Total receipts = Invoices(net+VAT) + Opening AR - Closing AR
# We simplify: receipts equal invoice net amount; AR balance carries VAT pro-rata
# But to tie out FS AR change (-529,664), we'll have receipts = invoices + opening - closing
# =========================================================================
$rcptHeader = "receipt_id,receipt_date,customer_id,invoice_id,amount,payment_method,bank_account,reference"
$rcptLines = New-Object System.Collections.Generic.List[string]
$rcptLines.Add($rcptHeader)

$rcptSeq = 0
function NewRcptId() { $script:rcptSeq++; return ("RCPT-2025-{0:D5}" -f $script:rcptSeq) }

# Build invoice records back from CSV lines for receipt scheduling
$invRecords = @()
foreach ($l in $invLines | Select-Object -Skip 1) {
    $p = $l -split ","
    $invRecords += [pscustomobject]@{
        InvoiceId = $p[0]
        InvDate = [DateTime]::Parse($p[1])
        DueDate = [DateTime]::Parse($p[2])
        CustId = $p[3]
        NetAmount = [long]$p[7]
        Term = [int]$p[10]
    }
}

# Cash sales (term 0) collected same day; credit sales collected on due date
# Add one bulk "opening AR collection" entry at Jan 5 and skip the Dec invoice for the last finance batch
# so AR closing matches target (21,606,892)
$openingAR = $T.AR_OPEN

# 1) Opening AR collected in Jan-Feb across finance companies (settled in 7-15 days of new year)
$openingShare = @{
    "CUST-0002"=2850000; "CUST-0003"=3120000; "CUST-0004"=2640000; "CUST-0005"=1980000
    "CUST-0006"=1560000; "CUST-0007"=1320000; "CUST-0008"=980000; "CUST-0009"=1450000
    "CUST-0010"=540000
}
foreach ($k in $openingShare.Keys) {
    $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Opening AR settlement" -f `
        (NewRcptId), ([DateTime]::new(2025,1,15)), $k, "OPEN-AR", $openingShare[$k]
    $rcptLines.Add($line)
}
$openCollected = ($openingShare.Values | Measure-Object -Sum).Sum

# 2) Opening AR from other customers (corporate, dealer, insurance) - lumped Feb
$otherOpening = $openingAR - $openCollected
$line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Opening AR settlement (others)" -f `
    (NewRcptId), ([DateTime]::new(2025,2,10)), "CUST-0011", "OPEN-AR", $otherOpening
$rcptLines.Add($line)

# 3) Collect each invoice on its due date (except keep last batch of Dec invoices open = closing AR)
# Strategy: collect invoices chronologically until cumulative remaining = closing AR target
$collected = 0L
$pendingClose = $T.AR_CLOSE

# All credit invoices (term > 0) sorted by due date; cash invoices collected same day
$creditInvs = $invRecords | Where-Object { $_.Term -gt 0 } | Sort-Object DueDate
$cashInvs   = $invRecords | Where-Object { $_.Term -eq 0 }

# Collect ALL cash invoices same day
foreach ($iv in $cashInvs) {
    $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},CASH,Cash on Hand,Cash sale settlement" -f `
        (NewRcptId), $iv.InvDate, $iv.CustId, $iv.InvoiceId, $iv.NetAmount
    $rcptLines.Add($line)
}

# Sum of credit invoices total
$creditTotal = ($creditInvs | Measure-Object -Property NetAmount -Sum).Sum

# Determine how much credit must remain unpaid at year end so that closing AR = target
# (also accounting for the VAT carried in AR is normally; we keep things at net level — note: simplified)
$mustRemain = $pendingClose
$mustCollect = $creditTotal - $mustRemain

# Collect credit invoices in date order until $mustCollect reached; leave the remainder open
$running = 0L
$leftOpen = New-Object System.Collections.Generic.List[object]
foreach ($iv in $creditInvs) {
    if ($running + $iv.NetAmount -le $mustCollect) {
        $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Settled per credit term" -f `
            (NewRcptId), $iv.DueDate, $iv.CustId, $iv.InvoiceId, $iv.NetAmount
        $rcptLines.Add($line)
        $running += $iv.NetAmount
    } else {
        # Partial collection of this invoice if needed to exactly hit mustCollect
        $partial = $mustCollect - $running
        if ($partial -gt 0) {
            $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Partial settlement" -f `
                (NewRcptId), $iv.DueDate, $iv.CustId, $iv.InvoiceId, $partial
            $rcptLines.Add($line)
            $running += $partial
        }
        $leftOpen.Add($iv)
    }
}

Write-Csv (Join-Path $root "05_ar_receipts.csv") $rcptLines.ToArray()

$rcptTotal = 0L
foreach ($l in $rcptLines | Select-Object -Skip 1) { $rcptTotal += [long]($l -split ",")[4] }
$cashInvTotal = ($cashInvs | Measure-Object -Property NetAmount -Sum).Sum
$expectedRcpt = $openingAR + $cashInvTotal + $mustCollect
Write-Host ("AR Receipts total: {0:N0}  (expected {1:N0}  delta {2:N0})" -f $rcptTotal, $expectedRcpt, ($rcptTotal - $expectedRcpt))
Write-Host ("Closing AR = Opening({0:N0}) + Invoices({1:N0}) - Receipts({2:N0}) = {3:N0}  (target {4:N0})" -f `
    $openingAR, $invTotal, $rcptTotal, ($openingAR + $invTotal - $rcptTotal), $T.AR_CLOSE)

# =========================================================================
# 06 - AP BILLS
# Inventory purchases = COGS - Inventory decrease = 1,079,265,810 - 43,908,192 = 1,035,357,618
# Other ops cash expenses: total expenses 1,289,231,890 minus non-cash items
# Non-cash adjustments: Dep_PPE 40,172,607 + Dep_IP 1,443,501 + Dep_ROU 15,011,633 +
#                      Amort 1,124,861 + Emp benefits accrual 1,242,664 = 58,995,266
# Cash expenses (excluding inventory build-up): 1,289,231,890 - 58,995,266 = 1,230,236,624
#   of which inventory portion is COGS related (already in inventory): not all of COGS is purchased this year
# We'll model:
#   AP Bills - Inventory (Honda mainly): 1,035,357,618 (split Honda 95% + accessories 5%)
#   AP Bills - Spare parts (vendors)   : 60,000,000   (parts COGS net + admin parts)
#   AP Bills - Operating expenses      : 130,000,000  (rent, utilities, fuel, marketing, professional)
#   GL Journal - Payroll (SUP-0030)    : Posted via journal (not AP bill) - approx 95M
#   GL Journal - Depreciation/amort    : Posted via journal (non-cash)
# =========================================================================
$billHeader = "bill_id,bill_date,due_date,supplier_id,expense_account,expense_type,segment,amount,vat_amount,total_amount,credit_term_days,reference,status"
$billLines = New-Object System.Collections.Generic.List[string]
$billLines.Add($billHeader)

$supTerms = @{}; $supRows = Import-Csv (Join-Path $PSScriptRoot "master\03_supplier_master.csv")
foreach ($s in $supRows) { $supTerms[$s.supplier_id] = [int]$s.credit_term_days }

$billSeq = 0
function NewBillId() { $script:billSeq++; return ("BILL-2025-{0:D5}" -f $script:billSeq) }

function AddBill($date, $supId, $acct, $expType, $segment, $netAmt, $ref) {
    $term = $supTerms[$supId]
    $due = $date.AddDays($term)
    $vat = [math]::Round($netAmt * 0.07, 2)
    $total = $netAmt + $vat
    $line = "{0},{1:yyyy-MM-dd},{2:yyyy-MM-dd},{3},{4},{5},{6},{7},{8},{9},{10},{11},OPEN" -f `
        (NewBillId), $date, $due, $supId, $acct, $expType, $segment, $netAmt, $vat, $total, $term, $ref
    $script:billLines.Add($line)
}

$totalInvBills = 1035357618L
$invPurchaseHonda = 950000000L
$invPurchaseAcc   = 35357618L
$invPurchaseParts = $totalInvBills - $invPurchaseHonda - $invPurchaseAcc  # 50,000,000

# Non-payroll operating expenses billed through AP (rent, utilities, marketing, logistics, fuel, paint, tires, professional)
# Payroll is paid direct via bank (not through AP); covered separately below as residual
$opexBills = 56000000L

$honMonthly = MonthlyAllocate $invPurchaseHonda
$accMonthly = MonthlyAllocate $invPurchaseAcc
$prtMonthly2 = MonthlyAllocate $invPurchaseParts
$opexMonthly = MonthlyAllocate $opexBills

foreach ($m in 1..12) {
    $billDate = [DateTime]::new(2025, $m, 10)
    # Honda inventory - main supplier
    AddBill $billDate "SUP-0001" "1141" "Inventory-Vehicle" "Inventory" $honMonthly[$m] "HONDA-INV-$m"
    # Accessories
    AddBill $billDate.AddDays(2) "SUP-0002" "1141" "Inventory-Accessories" "Inventory" $accMonthly[$m] "HONDA-ACC-$m"
    # Spare parts
    $partsBill = $prtMonthly2[$m]
    AddBill $billDate.AddDays(5) "SUP-0003" "1142" "Inventory-Parts" "Inventory" ([math]::Round($partsBill*0.7,0)) "HONDA-PRT-$m"
    AddBill $billDate.AddDays(7) "SUP-0004" "1142" "Inventory-Parts" "Inventory" ([math]::Round($partsBill*0.15,0)) "DENSO-PRT-$m"
    AddBill $billDate.AddDays(9) "SUP-0005" "1142" "Inventory-Parts" "Inventory" ($partsBill - [math]::Round($partsBill*0.7,0) - [math]::Round($partsBill*0.15,0)) "BOSCH-PRT-$m"

    # Operating expense bills - split across categories
    $oTotal = $opexMonthly[$m]
    AddBill $billDate.AddDays(1) "SUP-0016" "5412" "Rent" "Admin" ([math]::Round($oTotal*0.18,0)) "RENT-SHOWROOM-$m"
    AddBill $billDate.AddDays(1) "SUP-0017" "5412" "Rent" "Admin" ([math]::Round($oTotal*0.07,0)) "RENT-SVC-$m"
    AddBill $billDate.AddDays(3) "SUP-0012" "5413" "Utilities-Electric" "Admin" ([math]::Round($oTotal*0.04,0)) "ELEC-$m"
    AddBill $billDate.AddDays(3) "SUP-0013" "5413" "Utilities-Water" "Admin" ([math]::Round($oTotal*0.01,0)) "WATER-$m"
    AddBill $billDate.AddDays(3) "SUP-0014" "5413" "Telecom" "Admin" ([math]::Round($oTotal*0.015,0)) "TELECOM-$m"
    AddBill $billDate.AddDays(5) "SUP-0023" "5310" "Marketing" "Selling" ([math]::Round($oTotal*0.12,0)) "MKTG-$m"
    AddBill $billDate.AddDays(5) "SUP-0024" "5210" "Logistics" "Distribution" ([math]::Round($oTotal*0.25,0)) "LOGISTICS-$m"
    AddBill $billDate.AddDays(7) "SUP-0007" "5210" "Fuel" "Distribution" ([math]::Round($oTotal*0.08,0)) "FUEL-$m"
    AddBill $billDate.AddDays(8) "SUP-0009" "5130" "Paint-Body" "Service" ([math]::Round($oTotal*0.05,0)) "PAINT-$m"
    AddBill $billDate.AddDays(8) "SUP-0011" "5130" "Tires" "Service" ([math]::Round($oTotal*0.03,0)) "TIRES-$m"
    AddBill $billDate.AddDays(9) "SUP-0021" "5417" "Security" "Admin" ([math]::Round($oTotal*0.015,0)) "SEC-$m"
    AddBill $billDate.AddDays(9) "SUP-0022" "5417" "Cleaning" "Admin" ([math]::Round($oTotal*0.01,0)) "CLEAN-$m"
    AddBill $billDate.AddDays(11) "SUP-0020" "5417" "IT" "Admin" ([math]::Round($oTotal*0.02,0)) "IT-$m"
    # remainder = professional/other
    $sumSoFar = [math]::Round($oTotal*0.18,0) + [math]::Round($oTotal*0.07,0) + [math]::Round($oTotal*0.04,0) + `
                [math]::Round($oTotal*0.01,0) + [math]::Round($oTotal*0.015,0) + [math]::Round($oTotal*0.12,0) + `
                [math]::Round($oTotal*0.25,0) + [math]::Round($oTotal*0.08,0) + [math]::Round($oTotal*0.05,0) + `
                [math]::Round($oTotal*0.03,0) + [math]::Round($oTotal*0.015,0) + [math]::Round($oTotal*0.01,0) + `
                [math]::Round($oTotal*0.02,0)
    $remainder = $oTotal - $sumSoFar
    AddBill $billDate.AddDays(15) "SUP-0025" "5416" "Professional" "Admin" $remainder "PROF-$m"
}

Write-Csv (Join-Path $root "06_ap_bills.csv") $billLines.ToArray()
$billTotal = 0L
foreach ($l in $billLines | Select-Object -Skip 1) { $billTotal += [long]($l -split ",")[7] }
Write-Host ("AP Bills net total: {0:N0}" -f $billTotal)

# =========================================================================
# 07 - AP PAYMENTS
# Closing AP target = 87,097,100  (Opening AP 82,704,488)
# AP increase = 4,392,612, so Payments = Bills + Opening - Closing
# =========================================================================
$payHeader = "payment_id,payment_date,supplier_id,bill_id,amount,payment_method,bank_account,reference"
$payLines = New-Object System.Collections.Generic.List[string]
$payLines.Add($payHeader)

$paySeq = 0
function NewPayId() { $script:paySeq++; return ("PAY-2025-{0:D5}" -f $script:paySeq) }

# Build bills back from CSV
$billRecords = @()
foreach ($l in $billLines | Select-Object -Skip 1) {
    $p = $l -split ","
    $billRecords += [pscustomobject]@{
        BillId = $p[0]
        BillDate = [DateTime]::Parse($p[1])
        DueDate = [DateTime]::Parse($p[2])
        SupId = $p[3]
        NetAmount = [long]$p[7]
        Term = [int]$p[10]
    }
}

# Opening AP - paid out in Jan-Feb (mainly Honda balance 72.5M)
$openingAPShare = @{
    "SUP-0001"=67767488; "SUP-0002"=3200000; "SUP-0003"=4250000
    "SUP-0004"=420000;   "SUP-0005"=380000;   "SUP-0006"=210000
    "SUP-0007"=180000;   "SUP-0008"=65000;    "SUP-0009"=98000
    "SUP-0010"=52000;    "SUP-0011"=128000;   "SUP-0012"=42000
    "SUP-0013"=8500;     "SUP-0014"=12000;    "SUP-0015"=6500
    "SUP-0016"=720000;   "SUP-0017"=295000;   "SUP-0018"=18000
    "SUP-0019"=68000;    "SUP-0020"=24000;    "SUP-0021"=52000
    "SUP-0022"=28000;    "SUP-0023"=180000;   "SUP-0024"=165000
    "SUP-0025"=65000;    "SUP-0026"=3850000;  "SUP-0027"=420000
}
$openingAPSum = ($openingAPShare.Values | Measure-Object -Sum).Sum
foreach ($k in $openingAPShare.Keys) {
    $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Opening AP settlement" -f `
        (NewPayId), ([DateTime]::new(2025,1,25)), $k, "OPEN-AP", $openingAPShare[$k]
    $payLines.Add($line)
}

# Closing AP target
$pendingAPClose = $T.AP_CLOSE
$mustPay = $billTotal - $pendingAPClose

# Pay all bills in due-date order until mustPay
$running = 0L
foreach ($b in ($billRecords | Sort-Object DueDate)) {
    if ($running + $b.NetAmount -le $mustPay) {
        $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Paid per credit term" -f `
            (NewPayId), $b.DueDate, $b.SupId, $b.BillId, $b.NetAmount
        $payLines.Add($line)
        $running += $b.NetAmount
    } else {
        $partial = $mustPay - $running
        if ($partial -gt 0) {
            $line = "{0},{1:yyyy-MM-dd},{2},{3},{4},BANK_TRANSFER,SCB-CURR,Partial payment" -f `
                (NewPayId), $b.DueDate, $b.SupId, $b.BillId, $partial
            $payLines.Add($line)
            $running += $partial
        }
        break
    }
}

Write-Csv (Join-Path $root "07_ap_payments.csv") $payLines.ToArray()
$payTotal = 0L
foreach ($l in $payLines | Select-Object -Skip 1) { $payTotal += [long]($l -split ",")[4] }
Write-Host ("AP Payments total: {0:N0}" -f $payTotal)
Write-Host ("Closing AP = Opening({0:N0}) + Bills({1:N0}) - Payments({2:N0}) = {3:N0}  (target {4:N0})" -f `
    $T.AP_OPEN, $billTotal, $payTotal, ($T.AP_OPEN + $billTotal - $payTotal), $T.AP_CLOSE)

# =========================================================================
# 08 - BANK TRANSACTIONS
# Aggregate cash flows: AR receipts (in) + AP payments (out) +
# Other income (in) + Payroll (out) + Tax paid (out) + Interest paid (out) +
# Capex / Disposal / Dividends / Loan movements
# Ending cash = 173,743,169
# =========================================================================
$bankHeader = "txn_id,txn_date,account,direction,counterparty,category,amount,balance,reference,description"
$bankLines = New-Object System.Collections.Generic.List[string]
$bankLines.Add($bankHeader)

$bankSeq = 0
function NewBankId() { $script:bankSeq++; return ("BANK-2025-{0:D5}" -f $script:bankSeq) }

# Build cash transactions chronologically
# Start with opening balance
$openCash = $T.CASH_OPEN
$balance = $openCash

# We will append transactions from AR receipts (CASH ones go to Cash on Hand, BANK_TRANSFER go to SCB-CURR)
# But for sample data, all entries land in SCB-CURR account for simplicity
$bankTxns = New-Object System.Collections.Generic.List[object]

# Helper to add bank txn
function NewBankTxn($date, $direction, $cp, $cat, $amt, $ref, $desc) {
    $script:bankTxns.Add([pscustomobject]@{
        Date = $date; Direction = $direction; Counterparty = $cp; Category = $cat
        Amount = [long]$amt; Reference = $ref; Description = $desc
    })
}

# 1) AR Receipts → IN
foreach ($l in $rcptLines | Select-Object -Skip 1) {
    $p = $l -split ","
    $d = [DateTime]::Parse($p[1])
    NewBankTxn $d "IN" $p[2] "AR_COLLECTION" $p[4] $p[3] $p[7]
}

# 2) AP Payments → OUT
foreach ($l in $payLines | Select-Object -Skip 1) {
    $p = $l -split ","
    $d = [DateTime]::Parse($p[1])
    NewBankTxn $d "OUT" $p[2] "AP_PAYMENT" $p[4] $p[3] $p[7]
}

# 3) Other operating income (commissions, scrap, etc.) - excludes interest income (handled under investing)
$otherIncomeOp = $T.OTHER_INCOME - $T.OTHER_INV_INCOME    # 13,250,158 - 491,541 = 12,758,617
$oiMonthly = MonthlyAllocate $otherIncomeOp
foreach ($m in 1..12) {
    NewBankTxn ([DateTime]::new(2025,$m,20)) "IN" "Various" "OTHER_INCOME" $oiMonthly[$m] "OI-$m" "Insurance commission, scrap, misc"
}

# 4) Payroll - computed as residual so total operating cash out matches FS exactly.
#    Op_OUT_target = Op_IN_total - Op_CF_target
#    Payroll      = Op_OUT_target - AP_Payments - Tax_paid
$opIn = $rcptTotal + $otherIncomeOp                              # AR collections + other op income
$opOutTarget = $opIn - $T.OP_CF                                  # = 1,199,092,103
$taxPaid = 16154376L
$annualPayroll = $opOutTarget - $payTotal - $taxPaid
$payMonthly = MonthlyAllocate $annualPayroll
foreach ($m in 1..12) {
    NewBankTxn ([DateTime]::new(2025,$m,28)) "OUT" "SUP-0030" "PAYROLL" $payMonthly[$m] "PAYROLL-$m" "Monthly payroll"
}
Write-Host ("Payroll (residual): {0:N0}" -f $annualPayroll)

# 5) Income tax paid (16,154,376)
NewBankTxn ([DateTime]::new(2025,5,30)) "OUT" "SUP-0026" "TAX" 8000000 "TAX-MAY" "Half-year income tax"
NewBankTxn ([DateTime]::new(2025,11,28)) "OUT" "SUP-0026" "TAX" 8154376 "TAX-NOV" "Annual income tax balance"

# 6) Interest paid (7,024,093)
$intMonthly = MonthlyAllocate 7024093L
foreach ($m in 1..12) {
    NewBankTxn ([DateTime]::new(2025,$m,5)) "OUT" "SUP-0028" "INTEREST" $intMonthly[$m] "INT-$m" "Bank loan interest"
}

# 7) ST loan drawdowns/repayments
NewBankTxn ([DateTime]::new(2025,3,15))  "IN"  "SUP-0028" "ST_LOAN_DRAW"  230000000 "STLN-Q1" "ST loan facility draw"
NewBankTxn ([DateTime]::new(2025,5,15))  "OUT" "SUP-0028" "ST_LOAN_REPAY" 255000000 "STLN-Q2" "ST loan repayment"
NewBankTxn ([DateTime]::new(2025,7,15))  "IN"  "SUP-0028" "ST_LOAN_DRAW"  230000000 "STLN-Q3" "ST loan facility draw"
NewBankTxn ([DateTime]::new(2025,8,15))  "OUT" "SUP-0028" "ST_LOAN_REPAY" 255000000 "STLN-Q4" "ST loan repayment"
NewBankTxn ([DateTime]::new(2025,9,15))  "IN"  "SUP-0028" "ST_LOAN_DRAW"  230000000 "STLN-Q5" "ST loan facility draw"
NewBankTxn ([DateTime]::new(2025,10,15)) "OUT" "SUP-0028" "ST_LOAN_REPAY" 255000000 "STLN-Q6" "ST loan repayment"
NewBankTxn ([DateTime]::new(2025,11,15)) "IN"  "SUP-0028" "ST_LOAN_DRAW"  230000000 "STLN-Q7" "ST loan facility draw"
NewBankTxn ([DateTime]::new(2025,12,15)) "OUT" "SUP-0028" "ST_LOAN_REPAY" 255000000 "STLN-Q8" "ST loan repayment"
# Net ST loan = 920M draw - 1,020M repay = -100M ✓ (matches FS: ST loan from 220M → 120M)

# 8) LT loan repayment (-11,150,000)
NewBankTxn ([DateTime]::new(2025,6,30))  "OUT" "SUP-0029" "LT_LOAN_REPAY" 5575000 "LTLN-H1" "LT loan installment H1"
NewBankTxn ([DateTime]::new(2025,12,30)) "OUT" "SUP-0029" "LT_LOAN_REPAY" 5575000 "LTLN-H2" "LT loan installment H2"

# 9) Lease payment (-16,661,489)
$leaseMonthly = MonthlyAllocate 16661489L
foreach ($m in 1..12) {
    NewBankTxn ([DateTime]::new(2025,$m,1)) "OUT" "SUP-0016" "LEASE_PAYMENT" $leaseMonthly[$m] "LEASE-$m" "Right-of-use lease payment"
}

# 10) Dividends (-15,956,511 parent, -40,727 NCI)
NewBankTxn ([DateTime]::new(2025,5,5)) "OUT" "Shareholders" "DIVIDEND" 15956511 "DIV-2025" "Annual dividend to parent shareholders"
NewBankTxn ([DateTime]::new(2025,5,5)) "OUT" "NCI" "DIVIDEND_NCI" 40727 "DIV-NCI" "Dividend to non-controlling interest"

# 11) Capex (equipment)
NewBankTxn ([DateTime]::new(2025,4,20))  "OUT" "SUP-0019" "CAPEX" 1500000 "CAPEX-EQ-1" "Service center equipment"
NewBankTxn ([DateTime]::new(2025,9,15))  "OUT" "SUP-0019" "CAPEX" 1563493 "CAPEX-EQ-2" "Workshop tools upgrade"

# 12) Disposal proceeds
NewBankTxn ([DateTime]::new(2025,7,10))  "IN"  "Various" "DISPOSAL" 3272996 "DISP-2025" "Sale of used equipment"

# 13) Intangible capex
NewBankTxn ([DateTime]::new(2025,6,15))  "OUT" "SUP-0020" "CAPEX_INTANGIBLE" 1134658 "INTANG-2025" "Software/IT system"

# 14) Other inv income (interest income from deposits)
NewBankTxn ([DateTime]::new(2025,12,31)) "IN"  "Banks" "INTEREST_INCOME" 491541 "INT-INC" "Interest income from deposits"

# Sort chronologically and compute running balance
$bankSorted = $bankTxns | Sort-Object Date
foreach ($t in $bankSorted) {
    if ($t.Direction -eq "IN") { $balance += $t.Amount } else { $balance -= $t.Amount }
    $line = "{0},{1:yyyy-MM-dd},SCB-CURR,{2},{3},{4},{5},{6},{7},{8}" -f `
        (NewBankId), $t.Date, $t.Direction, $t.Counterparty, $t.Category, $t.Amount, $balance, $t.Reference, $t.Description
    $bankLines.Add($line)
}

Write-Csv (Join-Path $root "08_bank_transactions.csv") $bankLines.ToArray()

$totalIn = 0L; $totalOut = 0L
foreach ($t in $bankSorted) { if ($t.Direction -eq "IN") { $totalIn += $t.Amount } else { $totalOut += $t.Amount } }
Write-Host ("Bank IN: {0:N0}   Bank OUT: {1:N0}   Net: {2:N0}" -f $totalIn, $totalOut, ($totalIn - $totalOut))
Write-Host ("Opening cash: {0:N0}  +/-  Net: {1:N0}  =  Closing: {2:N0}  (target {3:N0})" -f `
    $openCash, ($totalIn - $totalOut), ($openCash + $totalIn - $totalOut), $T.CASH_CLOSE)

# =========================================================================
# 09 - GL JOURNAL (non-cash adjustments)
# =========================================================================
$jvHeader = "jv_id,jv_date,account,debit,credit,description,reference"
$jvLines = New-Object System.Collections.Generic.List[string]
$jvLines.Add($jvHeader)
$jvSeq = 0
function NewJvId() { $script:jvSeq++; return ("JV-2025-{0:D5}" -f $script:jvSeq) }

# Monthly depreciation - PPE
$depPpeMonthly = MonthlyAllocate $T.DEP_PPE
foreach ($m in 1..12) {
    $jvid = (NewJvId)
    $d = [DateTime]::new(2025,$m,[math]::Min(28, [DateTime]::DaysInMonth(2025,$m)))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},5414,{2},0,Monthly depreciation - PPE,DEP-PPE-{3}" -f $jvid, $d, $depPpeMonthly[$m], $m))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},1319,0,{2},Monthly depreciation - PPE,DEP-PPE-{3}" -f $jvid, $d, $depPpeMonthly[$m], $m))
}

# Monthly depreciation - Investment Property
$depIpMonthly = MonthlyAllocate $T.DEP_INV_PROPERTY
foreach ($m in 1..12) {
    $jvid = (NewJvId)
    $d = [DateTime]::new(2025,$m,[math]::Min(28, [DateTime]::DaysInMonth(2025,$m)))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},5414,{2},0,Monthly depreciation - Inv Property,DEP-IP-{3}" -f $jvid, $d, $depIpMonthly[$m], $m))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},1230,0,{2},Monthly depreciation - Inv Property,DEP-IP-{3}" -f $jvid, $d, $depIpMonthly[$m], $m))
}

# Monthly depreciation - Right-of-Use
$depRouMonthly = MonthlyAllocate $T.DEP_ROU
foreach ($m in 1..12) {
    $jvid = (NewJvId)
    $d = [DateTime]::new(2025,$m,[math]::Min(28, [DateTime]::DaysInMonth(2025,$m)))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},5414,{2},0,Monthly depreciation - ROU,DEP-ROU-{3}" -f $jvid, $d, $depRouMonthly[$m], $m))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},1320,0,{2},Monthly depreciation - ROU,DEP-ROU-{3}" -f $jvid, $d, $depRouMonthly[$m], $m))
}

# Monthly amortization
$amortMonthly = MonthlyAllocate $T.AMORT
foreach ($m in 1..12) {
    $jvid = (NewJvId)
    $d = [DateTime]::new(2025,$m,[math]::Min(28, [DateTime]::DaysInMonth(2025,$m)))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},5415,{2},0,Monthly amortization - intangible,AMORT-{3}" -f $jvid, $d, $amortMonthly[$m], $m))
    $jvLines.Add(("{0},{1:yyyy-MM-dd},1330,0,{2},Monthly amortization - intangible,AMORT-{3}" -f $jvid, $d, $amortMonthly[$m], $m))
}

# Annual employee benefits accrual
$jvid = (NewJvId)
$jvLines.Add(("{0},2025-12-31,5411,{1},0,Provision for employee benefits,EMP-BENEFIT" -f $jvid, $T.EMP_BENEFIT_ACCRUAL))
$jvLines.Add(("{0},2025-12-31,2230,0,{1},Provision for employee benefits,EMP-BENEFIT" -f $jvid, $T.EMP_BENEFIT_ACCRUAL))

# Allowance for doubtful accounts (reverse / write back gain 64,000)
$jvid = (NewJvId)
$jvLines.Add(("{0},2025-12-31,1124,64000,0,Write-back of allowance for doubtful accounts,ALLOW-AR" -f $jvid))
$jvLines.Add(("{0},2025-12-31,4190,0,64000,Write-back of allowance for doubtful accounts,ALLOW-AR" -f $jvid))

# Inventory revaluation gain 916,786
$jvid = (NewJvId)
$jvLines.Add(("{0},2025-12-31,1142,916786,0,Inventory revaluation gain,INV-REVAL" -f $jvid))
$jvLines.Add(("{0},2025-12-31,4170,0,916786,Inventory revaluation gain,INV-REVAL" -f $jvid))

# Annual income tax expense (full = 16,215,478; cash paid 16,154,376; difference 61,102 accrual)
$jvid = (NewJvId)
$jvLines.Add(("{0},2025-12-31,5610,16215478,0,Annual income tax expense,TAX-EXP" -f $jvid))
$jvLines.Add(("{0},2025-12-31,2160,0,61102,Income tax payable accrual,TAX-EXP" -f $jvid))
$jvLines.Add(("{0},2025-12-31,1112,0,16154376,Income tax paid via bank,TAX-EXP" -f $jvid))

# Finance cost accrual (14,962,373; cash interest paid 7,024,093; difference is interest portion of lease)
$jvid = (NewJvId)
$diff = $T.FINANCE_COST - 7024093
$jvLines.Add(("{0},2025-12-31,5510,{1},0,Finance cost - lease interest,FIN-COST" -f $jvid, $diff))
$jvLines.Add(("{0},2025-12-31,2220,0,{1},Lease liability interest,FIN-COST" -f $jvid, $diff))

Write-Csv (Join-Path $root "09_gl_journal.csv") $jvLines.ToArray()
Write-Host ("GL Journal entries: {0} rows" -f ($jvLines.Count - 1))

# =========================================================================
# 10 - FS RECONCILIATION TARGETS
# =========================================================================
$reconLines = New-Object System.Collections.Generic.List[string]
$reconLines.Add("category,metric,target_amount,description")
$reconLines.Add("PL,revenue_sales_service,1320815808,รายได้จากการขายและการให้บริการ")
$reconLines.Add("PL,revenue_construction,24126468,รายได้ค่าก่อสร้าง")
$reconLines.Add("PL,other_income,13250158,รายได้อื่น")
$reconLines.Add("PL,total_revenue,1358192434,รวมรายได้")
$reconLines.Add("PL,cogs_and_service,1079265810,ต้นทุนขายและต้นทุนการให้บริการ")
$reconLines.Add("PL,cost_distribution,56360501,ต้นทุนในการจัดจำหน่าย")
$reconLines.Add("PL,admin_expense,153605579,ค่าใช้จ่ายในการบริหาร")
$reconLines.Add("PL,total_expense,1289231890,รวมค่าใช้จ่าย")
$reconLines.Add("PL,operating_profit,68960544,กำไรจากกิจกรรมดำเนินงาน")
$reconLines.Add("PL,finance_cost,14962373,ต้นทุนทางการเงิน")
$reconLines.Add("PL,profit_before_tax,53998171,กำไรก่อนภาษีเงินได้")
$reconLines.Add("PL,income_tax_expense,16215478,ค่าใช้จ่ายภาษีเงินได้")
$reconLines.Add("PL,net_profit,37782693,กำไรสุทธิ")
$reconLines.Add("BS,ar_opening,22136556,ลูกหนี้การค้าต้นปี")
$reconLines.Add("BS,ar_closing,21606892,ลูกหนี้การค้าปลายปี")
$reconLines.Add("BS,ap_opening,82704488,เจ้าหนี้การค้าต้นปี")
$reconLines.Add("BS,ap_closing,87097100,เจ้าหนี้การค้าปลายปี")
$reconLines.Add("BS,inventory_opening,118032601,สินค้าคงเหลือต้นปี")
$reconLines.Add("BS,inventory_closing,74124409,สินค้าคงเหลือปลายปี")
$reconLines.Add("BS,cash_opening,165871149,เงินสดต้นปี")
$reconLines.Add("BS,cash_closing,173743169,เงินสดปลายปี")
$reconLines.Add("CF,operating_cf,159138454,กระแสเงินสดจากการดำเนินงาน")
$reconLines.Add("CF,investing_cf,-433614,กระแสเงินสดจากการลงทุน")
$reconLines.Add("CF,financing_cf,-150832820,กระแสเงินสดจากกิจกรรมจัดหาเงิน")
$reconLines.Add("CF,net_change_cash,7872020,เงินสดสุทธิเพิ่มขึ้น")
$reconLines.Add("CF,depreciation_ppe,40172607,ค่าเสื่อมที่ดิน อาคารและอุปกรณ์")
$reconLines.Add("CF,depreciation_inv_property,1443501,ค่าเสื่อมอสังหาริมทรัพย์เพื่อการลงทุน")
$reconLines.Add("CF,depreciation_rou,15011633,ค่าเสื่อมสิทธิการใช้สินทรัพย์")
$reconLines.Add("CF,amortization,1124861,ค่าตัดจำหน่ายสินทรัพย์ไม่มีตัวตน")
$reconLines.Add("CF,interest_paid,7024093,ดอกเบี้ยจ่าย")
$reconLines.Add("CF,tax_paid_net,16154376,ภาษีเงินได้จ่ายสุทธิ")
$reconLines.Add("CF,dividend_paid_parent,15956511,เงินปันผลจ่ายผู้ถือหุ้นใหญ่")
$reconLines.Add("CF,st_loan_net,-100000000,เงินกู้ระยะสั้นสุทธิ")
$reconLines.Add("CF,lt_loan_repaid,11150000,เงินกู้ระยะยาวจ่ายชำระ")
$reconLines.Add("CF,lease_paid,16661489,เงินจ่ายชำระหนี้สินตามสัญญาเช่า")
Write-Csv (Join-Path $reconRoot "10_fs_targets_2025.csv") $reconLines.ToArray()

Write-Host "===== Done. Files generated under sample_data/ ====="
