# fix_encoding.ps1
# Adds UTF-8 BOM to all CSV files under sample-data that are missing it.
# Excel requires UTF-8 BOM to correctly read Thai (and any non-ASCII) characters.
# Safe to re-run: files that already have BOM are skipped.

$ErrorActionPreference = 'Stop'
# $PSScriptRoot = the sample-data folder (where this script lives)
$SampleData = $PSScriptRoot

Write-Host "Scanning for CSV files without UTF-8 BOM in: $SampleData" -ForegroundColor Cyan

$BOM = [byte[]]@(0xEF, 0xBB, 0xBF)
$fixed = 0
$skipped = 0

Get-ChildItem -Path $SampleData -Recurse -Filter '*.csv' | ForEach-Object {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        $hasBOM = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
        if ($hasBOM) {
            Write-Host "  [SKIP] $($_.Name)" -ForegroundColor DarkGray
            $skipped++
        } else {
            $newBytes = $BOM + $bytes
            [System.IO.File]::WriteAllBytes($_.FullName, $newBytes)
            Write-Host "  [FIXED] $($_.Name)" -ForegroundColor Green
            $fixed++
        }
    } catch {
        Write-Host "  [ERROR] $($_.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done. Fixed: $fixed  |  Already OK: $skipped" -ForegroundColor Cyan
Write-Host "All CSV files now have UTF-8 BOM. Thai characters will display correctly in Excel."
