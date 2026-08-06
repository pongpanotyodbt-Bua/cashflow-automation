param(
    [string]$OutDir = "C:\Users\pongpanotyod.b\Desktop\Cashflow Management\scripts\_fs_dump"
)

$ErrorActionPreference = 'Stop'
if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$root = "C:\Users\pongpanotyod.b\Desktop\Cashflow Management\Finance Statement"
$files = @(
    @{ Path = "$root\COA_Group.xlsx";                       Name = "COA_Group" },
    @{ Path = "$root\ACG\Q1'26\FINANCIAL_STATEMENTS.XLSX";  Name = "ACG_Q1_26_FS" },
    @{ Path = "$root\ACG\Year 25\FINANCIAL_STATEMENTS.XLSX"; Name = "ACG_Y25_FS" },
    @{ Path = "$root\CLIK\CLIK_BS.xlsx";                    Name = "CLIK_BS" },
    @{ Path = "$root\CLIK\CLIK_PL.xlsx";                    Name = "CLIK_PL" },
    @{ Path = "$root\HMW\HMW_BS.xlsx";                      Name = "HMW_BS" },
    @{ Path = "$root\HMW\HMW_PL.xlsx";                      Name = "HMW_PL" }
)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.AskToUpdateLinks = $false

try {
    foreach ($f in $files) {
        if (!(Test-Path $f.Path)) {
            Write-Host "MISSING: $($f.Path)" -ForegroundColor Yellow
            continue
        }
        Write-Host "Reading: $($f.Name)" -ForegroundColor Cyan
        $wb = $excel.Workbooks.Open($f.Path, 0, $true)
        $summary = @{ file = $f.Name; sheets = @() }
        foreach ($ws in $wb.Sheets) {
            $used = $ws.UsedRange
            $rows = $used.Rows.Count
            $cols = $used.Columns.Count
            $sheetInfo = @{ name = $ws.Name; rows = $rows; cols = $cols; data = @() }

            $maxRows = [Math]::Min($rows, 200)
            $maxCols = [Math]::Min($cols, 20)

            if ($maxRows -gt 0 -and $maxCols -gt 0) {
                $values = $used.Value2
                if ($maxRows -eq 1 -and $maxCols -eq 1) {
                    $sheetInfo.data = @(,@($values))
                } else {
                    for ($r = 1; $r -le $maxRows; $r++) {
                        $row = @()
                        for ($c = 1; $c -le $maxCols; $c++) {
                            $v = if ($maxRows -eq 1) { $values[$c] } elseif ($maxCols -eq 1) { $values[$r] } else { $values[$r,$c] }
                            $row += $v
                        }
                        $sheetInfo.data += ,$row
                    }
                }
            }
            $summary.sheets += $sheetInfo
        }
        $wb.Close($false)
        $out = "$OutDir\$($f.Name).json"
        $summary | ConvertTo-Json -Depth 10 -Compress | Out-File -FilePath $out -Encoding UTF8
        Write-Host "  -> $out" -ForegroundColor Green
    }
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Host "DONE" -ForegroundColor Green
