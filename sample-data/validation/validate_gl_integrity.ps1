# validate_gl_integrity.ps1
# Validates: each JE balances DR=CR; no account has invalid code; all dates in $Year.
$ErrorActionPreference = 'Stop'
$Base = Split-Path $PSScriptRoot -Parent
$GLPath = Join-Path $Base 'transactions\gl_journal.csv'
$COAPath = Join-Path $Base 'master\02_chart_of_accounts.csv'

$gl  = Import-Csv $GLPath
$coa = Import-Csv $COAPath
$validAccts = $coa | ForEach-Object { $_.account_code }

$errors = 0
$warnings = 0

# 1. JE balance check
$grp = $gl | Group-Object je_id
foreach ($g in $grp) {
    $dr = (($g.Group | ForEach-Object { [double]$_.debit  })  | Measure-Object -Sum).Sum
    $cr = (($g.Group | ForEach-Object { [double]$_.credit })  | Measure-Object -Sum).Sum
    if ([Math]::Abs($dr - $cr) -gt 0.5) {
        Write-Host "ERROR: JE $($g.Name) unbalanced DR=$dr CR=$cr" -ForegroundColor Red
        $errors++
    }
}

# 2. Account code exists in COA
$invalidAccts = $gl | Where-Object { $_.account_code -notin $validAccts } | Select-Object account_code -Unique
foreach ($a in $invalidAccts) {
    Write-Host "WARNING: Account $($a.account_code) not in COA" -ForegroundColor Yellow
    $warnings++
}

# 3. Date check
$bad = $gl | Where-Object { -not ($_.posting_date -match '^2025-\d{2}-\d{2}$' -or $_.posting_date -match '^2025-01-01$') }
if ($bad.Count -gt 0) {
    Write-Host "WARNING: $($bad.Count) lines with non-2025 dates" -ForegroundColor Yellow
    $warnings += $bad.Count
}

# 4. Each company JE count
foreach ($co in 'ACG','HMW','CLIK') {
    $count = ($gl | Where-Object company -eq $co | Group-Object je_id).Count
    Write-Host "INFO: $co - $count JEs"
}

Write-Host ""
Write-Host "GL Integrity Check: Errors=$errors Warnings=$warnings" -ForegroundColor $(if ($errors -eq 0) { 'Green' } else { 'Red' })
if ($errors -gt 0) { exit 1 }
exit 0
