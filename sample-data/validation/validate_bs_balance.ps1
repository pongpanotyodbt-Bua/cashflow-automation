# validate_bs_balance.ps1
# Verifies for each company: Assets = Liabilities + Equity (after closing entries)
$ErrorActionPreference = 'Stop'
$Base = Split-Path $PSScriptRoot -Parent
$TBPath = Join-Path $Base 'reconciliation\trial_balance_by_company.csv'
$tb = Import-Csv $TBPath

foreach ($co in 'ACG','HMW','CLIK') {
    $rows = $tb | Where-Object company -eq $co
    $assets = 0.0; $liab = 0.0; $equity = 0.0
    foreach ($r in $rows) {
        $bal = [double]$r.total_debit - [double]$r.total_credit
        $a = $r.account_code
        if ($a -like '1*') { $assets += $bal }
        elseif ($a -like '2*') { $liab -= $bal }
        elseif ($a -like '3*') { $equity -= $bal }
    }
    $check = $assets - ($liab + $equity)
    $tag = if ([Math]::Abs($check) -lt 1) { 'BALANCED' } else { 'IMBALANCED' }
    $color = if ($tag -eq 'BALANCED') { 'Green' } else { 'Red' }
    Write-Host ("{0} : Assets={1,15:N0}  Liab={2,15:N0}  Equity={3,15:N0}  diff={4,12:N0}  [{5}]" -f $co, $assets, $liab, $equity, $check, $tag) -ForegroundColor $color
}
