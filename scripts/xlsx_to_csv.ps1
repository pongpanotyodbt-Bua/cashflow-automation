# xlsx_to_csv.ps1 -- Reads an xlsx by treating it as zip + XML (no Excel COM).
# Outputs each sheet as CSV in $OutDir/<basename>__<sheetname>.csv

param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$OutDir
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

function CellRefToCol([string]$ref) {
    # 'A1' -> 1, 'AA10' -> 27
    $letters = ($ref -replace '\d','').ToUpper()
    $n = 0
    for ($i = 0; $i -lt $letters.Length; $i++) {
        $n = $n * 26 + ([int][char]$letters[$i] - 64)
    }
    return $n
}

function CsvEscape([string]$s) {
    if ($null -eq $s) { return '' }
    if ($s -match '[",\r\n]') { return '"' + ($s -replace '"','""') + '"' }
    return $s
}

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

$base = [IO.Path]::GetFileNameWithoutExtension($Path)
$tmpDir = Join-Path $env:TEMP "xlsx_extract_$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $tmpDir | Out-Null

try {
    [IO.Compression.ZipFile]::ExtractToDirectory($Path, $tmpDir)

    # Read sharedStrings
    $shared = @()
    $ssPath = Join-Path $tmpDir 'xl\sharedStrings.xml'
    if (Test-Path $ssPath) {
        [xml]$ss = Get-Content $ssPath -Raw -Encoding UTF8
        foreach ($si in $ss.sst.si) {
            $text = ''
            if ($si.t) {
                if ($si.t -is [string]) { $text = $si.t } else { $text = $si.t.'#text' }
            } elseif ($si.r) {
                $text = -join ($si.r | ForEach-Object { if ($_.t -is [string]) { $_.t } else { $_.t.'#text' } })
            }
            $shared += $text
        }
    }
    Write-Host "  Shared strings: $($shared.Count)"

    # Read workbook.xml to get sheet names and rIds
    [xml]$wb = Get-Content (Join-Path $tmpDir 'xl\workbook.xml') -Raw -Encoding UTF8
    $sheets = @()
    foreach ($s in $wb.workbook.sheets.sheet) {
        $sheets += @{ name = $s.name; sheetId = $s.sheetId; rId = $s.id }
    }

    # Read relationships to map rId -> sheet xml path
    [xml]$rels = Get-Content (Join-Path $tmpDir 'xl\_rels\workbook.xml.rels') -Raw -Encoding UTF8
    $relMap = @{}
    foreach ($r in $rels.Relationships.Relationship) {
        $relMap[$r.Id] = $r.Target
    }

    foreach ($sheet in $sheets) {
        $target = $relMap[$sheet.rId]
        if (-not $target) { Write-Host "  No target for $($sheet.name), skipping"; continue }
        $sheetPath = Join-Path $tmpDir "xl\$target"
        if (-not (Test-Path $sheetPath)) {
            # Sometimes target is already absolute
            $sheetPath = Join-Path $tmpDir $target
        }
        if (-not (Test-Path $sheetPath)) { Write-Host "  Missing sheet file: $target"; continue }

        Write-Host "  Sheet: $($sheet.name)"
        [xml]$sx = Get-Content $sheetPath -Raw -Encoding UTF8
        $rows = $sx.worksheet.sheetData.row
        if (-not $rows) { continue }
        if ($rows -isnot [array]) { $rows = @($rows) }

        $maxCol = 0
        # First pass: max col
        foreach ($row in $rows) {
            $cells = $row.c
            if (-not $cells) { continue }
            if ($cells -isnot [array]) { $cells = @($cells) }
            foreach ($c in $cells) {
                if ($c.r) {
                    $col = CellRefToCol $c.r
                    if ($col -gt $maxCol) { $maxCol = $col }
                }
            }
        }

        $sheetName = $sheet.name -replace '[\\/:*?"<>|]','_'
        $outFile = Join-Path $OutDir "$base`__$sheetName.csv"
        $sw = New-Object IO.StreamWriter($outFile, $false, [Text.UTF8Encoding]::new($true))

        foreach ($row in $rows) {
            $rowIdx = [int]$row.r
            $arr = New-Object string[] $maxCol
            $cells = $row.c
            if ($cells) {
                if ($cells -isnot [array]) { $cells = @($cells) }
                foreach ($c in $cells) {
                    $col = CellRefToCol $c.r
                    $val = ''
                    $t = $c.t
                    if ($t -eq 's') {
                        $idx = [int]$c.v
                        if ($idx -lt $shared.Count) { $val = $shared[$idx] }
                    } elseif ($t -eq 'inlineStr') {
                        if ($c.is.t) {
                            if ($c.is.t -is [string]) { $val = $c.is.t } else { $val = $c.is.t.'#text' }
                        }
                    } elseif ($t -eq 'str' -or $t -eq 'b' -or $t -eq 'e') {
                        $val = "$($c.v)"
                    } else {
                        # number or default
                        if ($c.v) { $val = "$($c.v)" }
                    }
                    $arr[$col - 1] = $val
                }
            }
            $line = ($arr | ForEach-Object { CsvEscape $_ }) -join ','
            $sw.WriteLine($line)
        }
        $sw.Close()
    }
} finally {
    Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
}

Write-Host "DONE: $Path"
