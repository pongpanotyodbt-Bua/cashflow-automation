# run_all.ps1 - runs all validation scripts in sequence
$ErrorActionPreference = 'Continue'
$here = $PSScriptRoot

Write-Host "`n##############################################" -ForegroundColor Magenta
Write-Host "# 1. GL INTEGRITY (balanced JEs, valid accts)" -ForegroundColor Magenta
Write-Host "##############################################`n" -ForegroundColor Magenta
& (Join-Path $here 'validate_gl_integrity.ps1')

Write-Host "`n##############################################" -ForegroundColor Magenta
Write-Host "# 2. BS BALANCE (Assets = Liab + Equity)" -ForegroundColor Magenta
Write-Host "##############################################`n" -ForegroundColor Magenta
& (Join-Path $here 'validate_bs_balance.ps1')

Write-Host "`n##############################################" -ForegroundColor Magenta
Write-Host "# 3. TB vs FS targets" -ForegroundColor Magenta
Write-Host "##############################################`n" -ForegroundColor Magenta
& (Join-Path $here 'validate_tb_vs_fs.ps1')

Write-Host "`n##############################################" -ForegroundColor Magenta
Write-Host "# 4. CASH FLOW reconciliation" -ForegroundColor Magenta
Write-Host "##############################################`n" -ForegroundColor Magenta
& (Join-Path $here 'validate_cash_flow.ps1')

Write-Host "`n=== ALL VALIDATIONS COMPLETE ===" -ForegroundColor Green
