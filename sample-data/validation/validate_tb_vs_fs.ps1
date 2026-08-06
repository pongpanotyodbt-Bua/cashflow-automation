# validate_tb_vs_fs.ps1
# Compares closing trial balance per company against FS targets
$ErrorActionPreference = 'Stop'
$Base = Split-Path $PSScriptRoot -Parent
$TBPath = Join-Path $Base 'reconciliation\trial_balance_by_company.csv'
$FSPath = Join-Path $Base 'reconciliation\fs_targets_2568.csv'

$tb = Import-Csv $TBPath
$fs = Import-Csv $FSPath | Where-Object { $_.company -and $_.company -notlike '#*' }

# For P&L checks we need the gross balance BEFORE year-end closing JE.
# Re-derive a TB-by-account that excludes CLOSE-* entries.
$GLPath = Join-Path $Base 'transactions\gl_journal.csv'
$gl = Import-Csv $GLPath
$preCloseTB = @{}
foreach ($r in ($gl | Where-Object { $_.reference -notlike 'CLOSE-*' })) {
    $key = "$($r.company)|$($r.account_code)"
    if (-not $preCloseTB.ContainsKey($key)) { $preCloseTB[$key] = @{ dr=0.0; cr=0.0 } }
    $preCloseTB[$key].dr += [double]$r.debit
    $preCloseTB[$key].cr += [double]$r.credit
}

function GetTBBalance {
    param([string]$co, [string[]]$accts, [bool]$preClose=$false)
    $sum = 0.0
    foreach ($a in $accts) {
        if ($preClose) {
            $k = "$co|$a"
            if ($preCloseTB.ContainsKey($k)) { $sum += $preCloseTB[$k].dr - $preCloseTB[$k].cr }
        } else {
            $rows = $tb | Where-Object { $_.company -eq $co -and $_.account_code -eq $a }
            foreach ($r in $rows) { $sum += ([double]$r.total_debit - [double]$r.total_credit) }
        }
    }
    return $sum
}

function Check {
    param([string]$co, [string]$lineItem, [string[]]$accts, [double]$target, [string]$signFlip = 'NO', [bool]$preClose=$false)
    $bal = GetTBBalance -co $co -accts $accts -preClose $preClose
    if ($signFlip -eq 'YES') { $bal = -$bal }
    $diff = $bal - $target
    $pct = if ($target -ne 0) { 100 * $diff / $target } else { 0 }
    $tag = if ([Math]::Abs($diff) -lt 100) { 'OK' } elseif ([Math]::Abs($pct) -lt 5) { 'CLOSE' } else { 'OFF' }
    $color = switch ($tag) { 'OK' {'Green'} 'CLOSE' {'Yellow'} 'OFF' {'Red'} }
    Write-Host ("{0,-6} {1,-30} target={2,18:N0}  actual={3,18:N0}  diff={4,15:N0} ({5,6:F2}%) [{6}]" -f $co, $lineItem, $target, $bal, $diff, $pct, $tag) -ForegroundColor $color
    return @{ company=$co; line=$lineItem; target=$target; actual=$bal; diff=$diff; pct=$pct; tag=$tag }
}

$results = New-Object System.Collections.ArrayList

Write-Host "=== HMW P&L vs FS targets (pre-close balances) ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'HMW' -lineItem 'Total Revenue' -accts @('4110','4120','4130','4140','4160','4170','4180','4190') -target 1162200111 -signFlip 'YES' -preClose $true) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'COGS' -accts @('5110','5120','5130') -target 906494026 -preClose $true) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'SGA (incl 5135,5210,5310)' -accts @('5411','5412','5413','5414','5415','5416','5417','5418','5419','5420','5421','5135','5210','5310') -target 156952059 -preClose $true) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'Finance Cost' -accts @('5510') -target 10942643 -preClose $true) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'Income Tax' -accts @('5610') -target 17246908 -preClose $true) )

Write-Host "`n=== HMW closing BS vs FS targets ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'HMW' -lineItem 'AR (1121-1125)' -accts @('1121','1122','1123','1124','1125') -target 33792896) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'Inventory (1141-1144)' -accts @('1141','1142','1143','1144') -target 59502885) )
[void]$results.Add( (Check -co 'HMW' -lineItem 'AP Trade (2121-2123)' -accts @('2121','2122','2123') -target 87097100 -signFlip 'YES') )
[void]$results.Add( (Check -co 'HMW' -lineItem 'ST Loan (2110)' -accts @('2110') -target 120000000 -signFlip 'YES') )
[void]$results.Add( (Check -co 'HMW' -lineItem 'LT Loan Current (2140)' -accts @('2140') -target 0 -signFlip 'YES') )

Write-Host "`n=== CLIK P&L vs FS targets (pre-close) ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'CLIK' -lineItem 'Total Revenue' -accts @('4120','4130','4140','4160','4180','4190') -target 209917936 -signFlip 'YES' -preClose $true) )
[void]$results.Add( (Check -co 'CLIK' -lineItem 'COGS' -accts @('5120','5130') -target 172800928 -preClose $true) )
[void]$results.Add( (Check -co 'CLIK' -lineItem 'SGA total' -accts @('5411','5413','5414','5415','5417','5418','5419','5135','5210','5310','5420','5421') -target 57531675 -preClose $true) )
[void]$results.Add( (Check -co 'CLIK' -lineItem 'Finance Cost' -accts @('5510') -target 15471363 -preClose $true) )

Write-Host "`n=== CLIK closing BS vs FS targets ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'CLIK' -lineItem 'AR (1121-1125)' -accts @('1121','1123','1125') -target 938218) )
[void]$results.Add( (Check -co 'CLIK' -lineItem 'Inventory' -accts @('1142','1144') -target 14621524) )
[void]$results.Add( (Check -co 'CLIK' -lineItem 'LT Loan (2210)' -accts @('2210') -target 80000000 -signFlip 'YES') )

Write-Host "`n=== ACG P&L vs FS targets (pre-close) ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'ACG' -lineItem 'Total Revenue' -accts @('4150','4170','4190') -target 81331872 -signFlip 'YES' -preClose $true) )
[void]$results.Add( (Check -co 'ACG' -lineItem 'Cost of Mgmt Service' -accts @('5135') -target 61935369 -preClose $true) )
[void]$results.Add( (Check -co 'ACG' -lineItem 'Admin Expense' -accts @('5411','5417','5418','5419') -target 1405070 -preClose $true) )
[void]$results.Add( (Check -co 'ACG' -lineItem 'Income Tax' -accts @('5610') -target 467307 -preClose $true) )

Write-Host "`n=== ACG closing BS vs FS targets ===" -ForegroundColor Cyan
[void]$results.Add( (Check -co 'ACG' -lineItem 'Investment in Sub' -accts @('1210','1215') -target 598590000) )
[void]$results.Add( (Check -co 'ACG' -lineItem 'Share Capital' -accts @('3110') -target 300000000 -signFlip 'YES') )
[void]$results.Add( (Check -co 'ACG' -lineItem 'Share Premium' -accts @('3120') -target 137109509 -signFlip 'YES') )

# Export results
$out = Join-Path $Base 'reconciliation\fs_vs_tb_reconciliation.csv'
$results | ForEach-Object { [PSCustomObject]$_ } | Export-Csv -NoTypeInformation -Path $out -Encoding UTF8

# Summary
$okCount   = ($results | Where-Object tag -eq 'OK').Count
$closeCount = ($results | Where-Object tag -eq 'CLOSE').Count
$offCount  = ($results | Where-Object tag -eq 'OFF').Count

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "OK     : $okCount"   -ForegroundColor Green
Write-Host "CLOSE  : $closeCount (<5% variance)" -ForegroundColor Yellow
Write-Host "OFF    : $offCount (>=5% variance)"  -ForegroundColor Red
Write-Host "Report : $out"
