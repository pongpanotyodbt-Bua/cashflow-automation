# validate_cash_flow.ps1
# Builds Direct & Indirect CF from GL and compares to FS CF targets (CONSO)
$ErrorActionPreference = 'Stop'
$Base = Split-Path $PSScriptRoot -Parent
$GLPath = Join-Path $Base 'transactions\gl_journal.csv'
$gl = Import-Csv $GLPath

# CASH: 1111-1114 (using 1112 + 1113 in our data)
$cashAccts = @('1111','1112','1113','1114')
$cashLines = $gl | Where-Object { $_.account_code -in $cashAccts }

# Opening cash (from JE-OPEN/opening entries)
$openCash = (($cashLines | Where-Object { $_.posting_date -eq '2025-01-01' } | ForEach-Object { [double]$_.debit - [double]$_.credit }) | Measure-Object -Sum).Sum
# All other cash movements
$movCash = (($cashLines | Where-Object { $_.posting_date -ne '2025-01-01' } | ForEach-Object { [double]$_.debit - [double]$_.credit }) | Measure-Object -Sum).Sum
$closeCash = $openCash + $movCash

Write-Host "=== CASH RECONCILIATION (all 3 companies aggregated) ===" -ForegroundColor Cyan
Write-Host ("Opening cash  : {0,18:N0}" -f $openCash)
Write-Host ("Net movement  : {0,18:N0}" -f $movCash)
Write-Host ("Closing cash  : {0,18:N0}" -f $closeCash)
Write-Host ("Target (CONSO): {0,18:N0} (165,871,149 -> 173,743,169)" -f 173743169)
Write-Host ""

# Direct method by source
Write-Host "=== DIRECT METHOD - aggregated CASH movements by source ===" -ForegroundColor Cyan
$movements = $cashLines | Where-Object { $_.posting_date -ne '2025-01-01' }
$bySource = $movements | Group-Object source
foreach ($g in $bySource) {
    $sum = (($g.Group | ForEach-Object { [double]$_.debit - [double]$_.credit }) | Measure-Object -Sum).Sum
    Write-Host ("{0,-12} : {1,18:N0}" -f $g.Name, $sum)
}

# Indirect Method (aggregated)
Write-Host "`n=== INDIRECT METHOD reconciliation (aggregated 3 cos = approx CONSO before elim) ===" -ForegroundColor Cyan

# Net profit per company
$np_total = 0
foreach ($co in 'ACG','HMW','CLIK') {
    $revs = $gl | Where-Object { $_.company -eq $co -and $_.account_code -like '4*' -and $_.posting_date -ne '2025-12-31' }
    $exps = $gl | Where-Object { $_.company -eq $co -and $_.account_code -like '5*' -and $_.posting_date -ne '2025-12-31' }
    $totRev = (($revs | ForEach-Object { [double]$_.credit - [double]$_.debit }) | Measure-Object -Sum).Sum
    $totExp = (($exps | ForEach-Object { [double]$_.debit - [double]$_.credit }) | Measure-Object -Sum).Sum
    $np = $totRev - $totExp
    Write-Host ("$co  : Revenue {0,15:N0}  Expense {1,15:N0}  NP {2,15:N0}" -f $totRev, $totExp, $np)
    $np_total += $np
}
Write-Host ("Sum of 3 cos NP: {0,15:N0}" -f $np_total)
Write-Host ("CONSO target NP: {0,15:N0} (less IC dividend elim ~16M)" -f 37782693)

# D&A
Write-Host "`n--- D&A & Non-cash items ---" -ForegroundColor Cyan
foreach ($a in '5414','5415','5416','5417') {
    $sum = ($gl | Where-Object { $_.account_code -eq $a -and $_.posting_date -ne '2025-12-31' } | ForEach-Object { [double]$_.debit - [double]$_.credit } | Measure-Object -Sum).Sum
    $name = switch ($a) { '5414' { 'Depr PPE' } '5415' { 'Depr ROU' } '5416' { 'Depr Inv Property' } '5417' { 'Amortization' } }
    Write-Host ("{0,-25} ({1}): {2,15:N0}" -f $name, $a, $sum)
}

# CAPEX
Write-Host "`n--- CAPEX ---" -ForegroundColor Cyan
$capex_rows = $gl | Where-Object { $_.source -eq 'FA' -and $_.debit -gt 0 -and ($_.account_code -in '1311','1312','1313','1314','1330') }
$capex = ($capex_rows | ForEach-Object { [double]$_.debit } | Measure-Object -Sum).Sum
Write-Host ("Total CAPEX: {0,15:N0}  (FS target: -3,063,493 PPE + -1,134,658 intangible = -4,198,151)" -f $capex)

# Financing
Write-Host "`n--- Financing flows ---" -ForegroundColor Cyan
$st_proceeds = ($gl | Where-Object { $_.reference -like 'STL-PROC*' } | ForEach-Object { [double]$_.credit } | Measure-Object -Sum).Sum
$st_repaid  = ($gl | Where-Object { $_.reference -like 'STL-REPAY*' } | ForEach-Object { [double]$_.debit } | Measure-Object -Sum).Sum
$lt_repaid  = ($gl | Where-Object { $_.reference -like 'LTL-REPAY*' } | ForEach-Object { [double]$_.debit } | Measure-Object -Sum).Sum
$lease_paid = ($gl | Where-Object { $_.reference -like 'LEASE-PAY*' -or $_.reference -like 'LEASE-CLIK*' } | ForEach-Object { [double]$_.debit } | Measure-Object -Sum).Sum
$div_paid   = ($gl | Where-Object { ($_.reference -like 'DIV-ACG*' -or $_.reference -like 'DIV-HMW*' ) -and $_.account_code -eq '3160' } | ForEach-Object { [double]$_.debit } | Measure-Object -Sum).Sum

Write-Host ("ST Loan proceeds      : {0,15:N0}  (target 920,000,000)" -f $st_proceeds)
Write-Host ("ST Loan repaid        : {0,15:N0}  (target 1,020,000,000)" -f $st_repaid)
Write-Host ("LT Loan repaid        : {0,15:N0}  (target 11,150,000)" -f $lt_repaid)
Write-Host ("Lease paid            : {0,15:N0}  (target 16,661,489)" -f $lease_paid)
Write-Host ("Dividend declared     : {0,15:N0}  (HMW->ACG 15.96M + ACG->shareholders 15.96M)" -f $div_paid)
