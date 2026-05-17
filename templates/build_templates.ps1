# Build all Excel templates using Excel COM
# Run: powershell -ExecutionPolicy Bypass -File build_templates.ps1

$ErrorActionPreference = "Stop"
$outDir = $PSScriptRoot

# Colors (Excel uses BGR format)
$BLUE_HEADER_BG  = 15756034   # #2A6FF0 in BGR
$LIGHT_BLUE_BG   = 16574186   # #EAF1FE
$WHITE_TEXT      = 16777215   # white
$BLUE_TEXT       = 16711680   # blue (RGB(0,0,255) -> BGR)
$GRAY_TEXT       = 6710886    # #666666

Write-Host "Starting Excel COM..." -ForegroundColor Yellow
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
$xl.ScreenUpdating = $false

function Write-Header($ws, $row, $headers) {
  for ($i = 0; $i -lt $headers.Count; $i++) {
    $cell = $ws.Cells.Item($row, $i + 1)
    $cell.Value2 = $headers[$i]
    $cell.Font.Bold = $true
    $cell.Font.Color = $WHITE_TEXT
    $cell.Font.Name = "Arial"
    $cell.Font.Size = 11
    $cell.Interior.Color = $BLUE_HEADER_BG
    $cell.HorizontalAlignment = -4108  # center
    $cell.VerticalAlignment = -4108
    $cell.Borders.LineStyle = 1
  }
  $ws.Rows($row).RowHeight = 28
}

function Write-Data($ws, $startRow, $data) {
  for ($r = 0; $r -lt $data.Count; $r++) {
    $row = $data[$r]
    for ($c = 0; $c -lt $row.Count; $c++) {
      $cell = $ws.Cells.Item($startRow + $r, $c + 1)
      $val = $row[$c]
      if ($val -is [string] -and $val.StartsWith("=")) {
        $cell.Formula = $val
      } elseif ($val -is [int] -or $val -is [long] -or $val -is [double] -or $val -is [decimal]) {
        $cell.Value2 = [double]$val
      } else {
        $cell.Value2 = [string]$val
      }
      $cell.Font.Name = "Arial"
      $cell.Font.Size = 10
      $cell.Font.Color = $BLUE_TEXT
      $cell.Font.Italic = $true
      $cell.Borders.LineStyle = 1
    }
  }
}

function Set-ColWidths($ws, $widths) {
  for ($i = 0; $i -lt $widths.Count; $i++) {
    $ws.Columns($i + 1).ColumnWidth = $widths[$i]
  }
}

function Add-Title($ws, $title, $colCount) {
  $r = $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1, $colCount))
  $r.Merge()
  $c = $ws.Cells.Item(1,1)
  $c.Value2 = $title
  $c.Font.Bold = $true
  $c.Font.Size = 14
  $c.Font.Color = $BLUE_HEADER_BG
  $c.Font.Name = "Arial"
  $c.HorizontalAlignment = -4108
  $ws.Rows(1).RowHeight = 32
}

function Add-Notes($ws, $startRow, $notes, $colCount) {
  for ($i = 0; $i -lt $notes.Count; $i++) {
    $r = $startRow + $i
    $rng = $ws.Range($ws.Cells.Item($r,1), $ws.Cells.Item($r, $colCount))
    $rng.Merge()
    $c = $ws.Cells.Item($r, 1)
    $c.Value2 = $notes[$i]
    $c.Font.Italic = $true
    $c.Font.Color = $GRAY_TEXT
    $c.Font.Name = "Arial"
    $c.Font.Size = 9
  }
  return $startRow + $notes.Count
}

function Create-Workbook($filename) {
  Write-Host "  Building: $filename" -ForegroundColor Cyan
  $wb = $xl.Workbooks.Add()
  while ($wb.Sheets.Count -gt 1) { $wb.Sheets.Item(2).Delete() }
  return $wb
}

function Save-Workbook($wb, $filename) {
  $path = Join-Path $outDir $filename
  if (Test-Path $path) { Remove-Item $path -Force }
  $wb.SaveAs($path, 51)  # xlOpenXMLWorkbook = .xlsx
  $wb.Close($false)
  Write-Host "  ✓ Saved: $filename" -ForegroundColor Green
}

# ==========================================
# 1. GL Template
# ==========================================
function Build-GL {
  $wb = Create-Workbook "01_GL_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "GL_Data"

  Add-Title $ws "GL - General Ledger Entries" 10
  $nextRow = Add-Notes $ws 2 @(
    "Entities: ACG / HMW / CLIK / CONSO",
    "Segments (income): HMW: HONDA/TOK/INS/FIN/RENT  |  ACG: MGT_HMW/MGT_CLIK  |  CLIK: SVC",
    "Segments (expense): F1=Loan/Int  I1=Fixed asset  O1=Staff  O2=Inventory  O3=Subcon  O4=Utility  O5=Tax  O6=Other"
  ) 10

  $headers = @("Date","JE_No","Account_Code","Account_Name","Description","Debit","Credit","Reference","Entity","Segment")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("2026-03-01","JE-2026-0001","1010","เงินสด-ธนาคารกสิกร","รับชำระจากลูกค้า Honda",1500000,0,"INV-2026-001","HMW","HONDA"),
    @("2026-03-01","JE-2026-0001","1130","ลูกหนี้การค้า","ตัดลูกหนี้ INV-001",0,1500000,"INV-2026-001","HMW","HONDA"),
    @("2026-03-02","JE-2026-0002","5100","เงินเดือนพนักงาน","จ่ายเงินเดือน มี.ค.",850000,0,"PAY-202603","HMW","O1"),
    @("2026-03-02","JE-2026-0002","1010","เงินสด-ธนาคารกสิกร","จ่ายเงินเดือน มี.ค.",0,850000,"PAY-202603","HMW","O1"),
    @("2026-03-05","JE-2026-0003","5200","ดอกเบี้ยจ่าย","ดอกเบี้ยเงินกู้ระยะยาว",125000,0,"LN-2025-01","HMW","F1"),
    @("2026-03-05","JE-2026-0003","1010","เงินสด-ธนาคารกสิกร","ดอกเบี้ยเงินกู้ระยะยาว",0,125000,"LN-2025-01","HMW","F1")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,16,12,28,35,14,14,16,10,12)
  $ws.Application.ActiveWindow.FreezePanes = $false
  $ws.Cells.Item($nextRow + 1, 1).Select() | Out-Null
  $xl.ActiveWindow.FreezePanes = $true

  # Summary sheet
  $ws2 = $wb.Sheets.Add()
  $ws2.Move([System.Reflection.Missing]::Value, $ws)
  $ws2.Name = "Summary"
  $ws2.Cells.Item(1,1).Value2 = "GL Upload Summary"
  $ws2.Cells.Item(1,1).Font.Bold = $true
  $ws2.Cells.Item(1,1).Font.Size = 14
  $ws2.Cells.Item(3,1).Value2 = "Total Debit:"
  $ws2.Cells.Item(3,2).Formula = "=SUM(GL_Data!F:F)"
  $ws2.Cells.Item(4,1).Value2 = "Total Credit:"
  $ws2.Cells.Item(4,2).Formula = "=SUM(GL_Data!G:G)"
  $ws2.Cells.Item(5,1).Value2 = "Difference (must be 0):"
  $ws2.Cells.Item(5,2).Formula = "=B3-B4"
  $ws2.Cells.Item(6,1).Value2 = "Total Entries:"
  $ws2.Cells.Item(6,2).Formula = "=COUNTA(GL_Data!B:B)-3"
  $ws2.Columns(1).ColumnWidth = 24
  $ws2.Columns(2).ColumnWidth = 18
  foreach ($r in 3..6) { $ws2.Cells.Item($r,1).Font.Bold = $true }
  $ws2.Range("B3:B5").NumberFormat = "#,##0.00"

  $ws.Activate()
  Save-Workbook $wb "01_GL_Template.xlsx"
}

# ==========================================
# 2. Trial Balance
# ==========================================
function Build-TB {
  $wb = Create-Workbook "02_Trial_Balance_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "TB_Data"

  Add-Title $ws "Trial Balance Data" 11
  $nextRow = Add-Notes $ws 2 @(
    "Entities: ACG / HMW / CLIK / CONSO",
    "Account_Type: Asset / Liability / Equity / Revenue / Expense"
  ) 11

  $headers = @("Period","Account_Code","Account_Name","Account_Type",
    "Opening_Debit","Opening_Credit","Period_Debit","Period_Credit",
    "Closing_Debit","Closing_Credit","Entity")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("2026-03","1010","เงินสดและรายการเทียบเท่า","Asset",450000000,0,80000000,65000000,465000000,0,"HMW"),
    @("2026-03","1130","ลูกหนี้การค้า","Asset",125000000,0,45000000,38000000,132000000,0,"HMW"),
    @("2026-03","1200","สินค้าคงเหลือ","Asset",85000000,0,22000000,18000000,89000000,0,"HMW"),
    @("2026-03","1500","ที่ดิน อาคารและอุปกรณ์","Asset",520000000,0,15000000,5000000,530000000,0,"HMW"),
    @("2026-03","2110","เจ้าหนี้การค้า","Liability",0,95000000,30000000,42000000,0,107000000,"HMW"),
    @("2026-03","2210","เงินกู้ระยะสั้น","Liability",0,180000000,12000000,18000000,0,186000000,"HMW"),
    @("2026-03","3000","ทุนจดทะเบียน","Equity",0,500000000,0,0,0,500000000,"HMW"),
    @("2026-03","4100","รายได้จากการขาย","Revenue",0,0,0,85000000,0,85000000,"HMW"),
    @("2026-03","5100","ต้นทุนขาย","Expense",0,0,62000000,0,62000000,0,"HMW"),
    @("2026-03","5200","ค่าใช้จ่ายในการบริหาร","Expense",0,0,12500000,0,12500000,0,"HMW")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(10,12,30,12,14,14,14,14,14,14,10)

  Save-Workbook $wb "02_Trial_Balance_Template.xlsx"
}

# ==========================================
# 3. AR / Invoices
# ==========================================
function Build-AR {
  $wb = Create-Workbook "03_AR_Invoices_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Invoices"

  Add-Title $ws "AR / Invoices" 13
  $nextRow = Add-Notes $ws 2 @(
    "Customer_Type: Cash / Credit",
    "Status: Open / Paid / Partial / Overdue",
    "Balance column uses formula: Amount - Amount_Paid"
  ) 13

  $headers = @("Invoice_No","Date","Customer_Code","Customer_Name","Customer_Type",
    "Amount","Credit_Term_Days","Due_Date","Amount_Paid","Balance","Status","Entity","Segment")
  Write-Header $ws $nextRow $headers

  $startData = $nextRow + 1
  $data = @(
    @("INV-2026-0145","2026-03-01","C001","บริษัท ABC จำกัด","Credit",1500000,30,"2026-03-31",0,"=F$startData-I$startData","Open","HMW","HONDA"),
    @("INV-2026-0146","2026-03-03","C002","ลูกค้าทั่วไป","Cash",350000,0,"2026-03-03",350000,"=F$($startData+1)-I$($startData+1)","Paid","HMW","TOK"),
    @("INV-2026-0147","2026-02-15","C003","บริษัท XYZ Corp","Credit",2200000,60,"2026-04-16",1100000,"=F$($startData+2)-I$($startData+2)","Partial","HMW","FIN"),
    @("INV-2026-0148","2026-01-10","C004","บริษัท Late Pay Ltd.","Credit",800000,30,"2026-02-09",0,"=F$($startData+3)-I$($startData+3)","Overdue","HMW","HONDA"),
    @("INV-2026-0149","2026-03-10","C005","ACG Holding (Internal)","Credit",500000,30,"2026-04-09",0,"=F$($startData+4)-I$($startData+4)","Open","ACG","MGT_HMW")
  )
  Write-Data $ws $startData $data
  Set-ColWidths $ws @(16,12,14,28,14,14,14,14,14,14,12,10,12)

  # Aging Summary
  $ws2 = $wb.Sheets.Add()
  $ws2.Move([System.Reflection.Missing]::Value, $ws)
  $ws2.Name = "Aging_Summary"
  $ws2.Cells.Item(1,1).Value2 = "AR Aging Summary"
  $ws2.Cells.Item(1,1).Font.Bold = $true
  $ws2.Cells.Item(1,1).Font.Size = 14
  Write-Header $ws2 3 @("Bucket","Count","Total Outstanding")

  $ws2.Cells.Item(4,1).Value2 = "Current (Not Due)"
  $ws2.Cells.Item(4,2).Formula = '=COUNTIF(Invoices!K:K,"Open")'
  $ws2.Cells.Item(4,3).Formula = '=SUMIF(Invoices!K:K,"Open",Invoices!J:J)'
  $ws2.Cells.Item(5,1).Value2 = "Partial"
  $ws2.Cells.Item(5,2).Formula = '=COUNTIF(Invoices!K:K,"Partial")'
  $ws2.Cells.Item(5,3).Formula = '=SUMIF(Invoices!K:K,"Partial",Invoices!J:J)'
  $ws2.Cells.Item(6,1).Value2 = "Overdue"
  $ws2.Cells.Item(6,2).Formula = '=COUNTIF(Invoices!K:K,"Overdue")'
  $ws2.Cells.Item(6,3).Formula = '=SUMIF(Invoices!K:K,"Overdue",Invoices!J:J)'
  $ws2.Cells.Item(7,1).Value2 = "Paid"
  $ws2.Cells.Item(7,2).Formula = '=COUNTIF(Invoices!K:K,"Paid")'
  $ws2.Cells.Item(7,3).Formula = '=SUMIF(Invoices!K:K,"Paid",Invoices!J:J)'
  $ws2.Cells.Item(8,1).Value2 = "TOTAL"
  $ws2.Cells.Item(8,2).Formula = "=SUM(B4:B7)"
  $ws2.Cells.Item(8,3).Formula = "=SUM(C4:C7)"
  $ws2.Cells.Item(8,1).Font.Bold = $true
  $ws2.Cells.Item(8,3).Font.Bold = $true
  $ws2.Range("C4:C8").NumberFormat = "#,##0.00"
  $ws2.Columns(1).ColumnWidth = 22
  $ws2.Columns(2).ColumnWidth = 12
  $ws2.Columns(3).ColumnWidth = 22

  $ws.Activate()
  Save-Workbook $wb "03_AR_Invoices_Template.xlsx"
}

# ==========================================
# 4. AP / Bills
# ==========================================
function Build-AP {
  $wb = Create-Workbook "04_AP_Bills_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Bills"

  Add-Title $ws "AP / Bills" 13
  $nextRow = Add-Notes $ws 2 @(
    "Category: Inventory / Utility / Subcontract / Tax / Interest / Staff / Other",
    "Status: Open / Paid / Partial / Overdue",
    "CF_Group: F1=Loan/Int  I1=Fixed asset  O1-O6=Operating expenses"
  ) 13

  $headers = @("Bill_No","Date","Vendor_Code","Vendor_Name","Category",
    "Amount","Credit_Term_Days","Due_Date","Amount_Paid","Balance","Status","Entity","CF_Group")
  Write-Header $ws $nextRow $headers

  $startData = $nextRow + 1
  $data = @(
    @("BL-2026-0301","2026-03-01","V001","Honda Automobile (Thailand)","Inventory",2500000,45,"2026-04-15",0,"=F$startData-I$startData","Open","HMW","O2"),
    @("BL-2026-0302","2026-03-02","V002","การไฟฟ้านครหลวง","Utility",85000,30,"2026-04-01",85000,"=F$($startData+1)-I$($startData+1)","Paid","HMW","O4"),
    @("BL-2026-0303","2026-03-03","V003","Kasikorn Bank - Loan","Interest",125000,0,"2026-03-03",125000,"=F$($startData+2)-I$($startData+2)","Paid","HMW","F1"),
    @("BL-2026-0304","2026-02-15","V004","บริษัท ก่อสร้าง CCC จำกัด","Subcontract",580000,30,"2026-03-17",0,"=F$($startData+3)-I$($startData+3)","Overdue","HMW","O3"),
    @("BL-2026-0305","2026-03-10","V005","กรมสรรพากร","Tax",245000,30,"2026-04-09",0,"=F$($startData+4)-I$($startData+4)","Open","HMW","O5")
  )
  Write-Data $ws $startData $data
  Set-ColWidths $ws @(16,12,12,32,14,14,14,14,14,14,12,10,12)

  Save-Workbook $wb "04_AP_Bills_Template.xlsx"
}

# ==========================================
# 5. Bank Transactions
# ==========================================
function Build-Bank {
  $wb = Create-Workbook "05_Bank_Transactions_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Bank_Transactions"

  Add-Title $ws "Bank Transactions" 10
  $nextRow = Add-Notes $ws 2 @(
    "Type: IN (เงินเข้า) / OUT (เงินออก)",
    "Status: Matched / Unmatched / Manual"
  ) 10

  $headers = @("Date","Bank_Account","Type","Amount","Description","Reference",
    "Category","Balance","Entity","Status")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("2026-03-01","Kasikorn-001-2-34567-8","IN",1500000,"TT INCOMING ABC CO","INV-2026-0145","Sales-Honda",466500000,"HMW","Matched"),
    @("2026-03-02","Kasikorn-001-2-34567-8","OUT",850000,"PAYROLL MAR2026","PAY-202603","Staff Salary",465650000,"HMW","Matched"),
    @("2026-03-03","Kasikorn-001-2-34567-8","OUT",125000,"LOAN INT PMT","LN-2025-01","Interest",465525000,"HMW","Matched"),
    @("2026-03-04","Kasikorn-001-2-34567-8","IN",350000,"CASH DEPOSIT","INV-2026-0146","Sales-Service",465875000,"HMW","Matched"),
    @("2026-03-05","Kasikorn-001-2-34567-8","OUT",85000,"BILL PAYMENT MEA","BL-2026-0302","Utility",465790000,"HMW","Matched"),
    @("2026-03-06","Kasikorn-001-2-34567-8","OUT",42000,"TRANSFER FEE","","Bank Fee",465748000,"HMW","Unmatched")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,22,8,14,28,16,16,16,10,12)

  # Reconciliation
  $ws2 = $wb.Sheets.Add()
  $ws2.Move([System.Reflection.Missing]::Value, $ws)
  $ws2.Name = "Reconciliation"
  $ws2.Cells.Item(1,1).Value2 = "Bank Reconciliation Summary"
  $ws2.Cells.Item(1,1).Font.Bold = $true
  $ws2.Cells.Item(1,1).Font.Size = 14
  $ws2.Cells.Item(3,1).Value2 = "Total IN:"
  $ws2.Cells.Item(3,2).Formula = '=SUMIF(Bank_Transactions!C:C,"IN",Bank_Transactions!D:D)'
  $ws2.Cells.Item(4,1).Value2 = "Total OUT:"
  $ws2.Cells.Item(4,2).Formula = '=SUMIF(Bank_Transactions!C:C,"OUT",Bank_Transactions!D:D)'
  $ws2.Cells.Item(5,1).Value2 = "Net Movement:"
  $ws2.Cells.Item(5,2).Formula = "=B3-B4"
  $ws2.Cells.Item(7,1).Value2 = "Matched:"
  $ws2.Cells.Item(7,2).Formula = '=COUNTIF(Bank_Transactions!J:J,"Matched")'
  $ws2.Cells.Item(8,1).Value2 = "Unmatched:"
  $ws2.Cells.Item(8,2).Formula = '=COUNTIF(Bank_Transactions!J:J,"Unmatched")'
  foreach ($r in 3,4,5,7,8) { $ws2.Cells.Item($r,1).Font.Bold = $true }
  $ws2.Range("B3:B5").NumberFormat = "#,##0.00"
  $ws2.Columns(1).ColumnWidth = 20
  $ws2.Columns(2).ColumnWidth = 20

  $ws.Activate()
  Save-Workbook $wb "05_Bank_Transactions_Template.xlsx"
}

# ==========================================
# 6. Cash Receipts
# ==========================================
function Build-Receipts {
  $wb = Create-Workbook "06_Cash_Receipts_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Receipts"

  Add-Title $ws "Cash Receipts" 11
  $nextRow = Add-Notes $ws 2 @(
    "Payment_Method: Cash / Transfer / Cheque / Credit Card",
    "Link Invoice_No เพื่อตัดยอดลูกหนี้"
  ) 11

  $headers = @("Date","Receipt_No","Customer_Code","Customer_Name","Invoice_No",
    "Amount","Payment_Method","Bank_Account","Entity","Segment","Notes")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("2026-03-01","RCP-2026-0201","C001","บริษัท ABC จำกัด","INV-2026-0145",1500000,"Transfer","Kasikorn-001-2-34567-8","HMW","HONDA","ครบยอด"),
    @("2026-03-03","RCP-2026-0202","C002","ลูกค้าทั่วไป","INV-2026-0146",350000,"Cash","เงินสดมือ","HMW","TOK",""),
    @("2026-03-05","RCP-2026-0203","C003","บริษัท XYZ Corp","INV-2026-0147",1100000,"Cheque","Kasikorn-001-2-34567-8","HMW","FIN","ครึ่งยอด รอครึ่งหลัง")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,16,12,28,16,14,14,22,10,12,28)

  Save-Workbook $wb "06_Cash_Receipts_Template.xlsx"
}

# ==========================================
# 7. Cash Payments
# ==========================================
function Build-Payments {
  $wb = Create-Workbook "07_Cash_Payments_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Payments"

  Add-Title $ws "Cash Payments" 11
  $nextRow = Add-Notes $ws 2 @(
    "Payment_Method: Cash / Transfer / Cheque",
    "CF_Group: F1=Loan/Int  I1=Fixed asset  O1-O6=Operating expenses"
  ) 11

  $headers = @("Date","Payment_No","Vendor_Code","Vendor_Name","Bill_No",
    "Amount","Payment_Method","Bank_Account","Entity","CF_Group","Notes")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("2026-03-02","PV-2026-0301","V006","พนักงาน (Payroll)","PAY-202603",850000,"Transfer","Kasikorn-001-2-34567-8","HMW","O1","เงินเดือน มี.ค."),
    @("2026-03-03","PV-2026-0302","V003","Kasikorn Bank - Loan","BL-2026-0303",125000,"Transfer","Kasikorn-001-2-34567-8","HMW","F1","ดอกเบี้ยเงินกู้"),
    @("2026-03-04","PV-2026-0303","V002","การไฟฟ้านครหลวง","BL-2026-0302",85000,"Transfer","Kasikorn-001-2-34567-8","HMW","O4","ค่าไฟ มี.ค."),
    @("2026-03-10","PV-2026-0304","V001","Honda Automobile (Thailand)","BL-2026-0301",500000,"Cheque","Kasikorn-001-2-34567-8","HMW","O2","ชำระบางส่วน")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,16,12,30,18,14,14,22,10,12,28)

  Save-Workbook $wb "07_Cash_Payments_Template.xlsx"
}

# ==========================================
# 8. Customer Master
# ==========================================
function Build-Customer {
  $wb = Create-Workbook "08_Customer_Master_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Customers"

  Add-Title $ws "Customer Master" 12
  $nextRow = Add-Notes $ws 2 @(
    "Customer_Type: Cash (เงินสดทุกครั้ง) / Credit (มีเครดิต)",
    "Credit_Term_Days: 0 for cash, 30/60/90 typical for credit",
    "Status: Active / Inactive"
  ) 12

  $headers = @("Customer_Code","Customer_Name","Customer_Type","Credit_Term_Days",
    "Credit_Limit","Contact_Person","Phone","Email","Address","Tax_ID","Entity","Status")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("C001","บริษัท ABC จำกัด","Credit",30,5000000,"คุณสมชาย","02-123-4567","abc@email.com","123 ถ.สุขุมวิท กรุงเทพ","0105560000123","HMW","Active"),
    @("C002","ลูกค้าทั่วไป","Cash",0,0,"","","","","","HMW","Active"),
    @("C003","บริษัท XYZ Corp","Credit",60,10000000,"Khun Smith","02-555-6666","smith@xyz.com","99 อโศก กรุงเทพ","0105560000456","HMW","Active"),
    @("C004","บริษัท Late Pay Ltd.","Credit",30,1000000,"คุณวิชัย","02-777-8888","wichai@latepay.com","45 รัชดา กรุงเทพ","0105560000789","HMW","Active"),
    @("C005","ACG Holding (Internal)","Credit",30,20000000,"Internal","Internal","internal@acg.com","Internal Group","0105560000111","ACG","Active")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,28,12,14,16,16,14,22,30,16,10,10)

  Save-Workbook $wb "08_Customer_Master_Template.xlsx"
}

# ==========================================
# 9. Vendor Master
# ==========================================
function Build-Vendor {
  $wb = Create-Workbook "09_Vendor_Master_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Vendors"

  Add-Title $ws "Vendor Master" 13
  $nextRow = Add-Notes $ws 2 @(
    "Category: Inventory / Utility / Subcontract / Tax / Interest / Staff / Other",
    "CF_Group: F1 / I1 / O1-O6",
    "Status: Active / Inactive"
  ) 13

  $headers = @("Vendor_Code","Vendor_Name","Category","Credit_Term_Days",
    "Contact_Person","Phone","Email","Address","Tax_ID","Bank_Account","Entity","CF_Group","Status")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("V001","Honda Automobile (Thailand)","Inventory",45,"Sales Dept","02-100-2000","sales@honda.co.th","Honda HQ","0105560222000","BKK-Bank-111","HMW","O2","Active"),
    @("V002","การไฟฟ้านครหลวง","Utility",30,"Customer Service","1130","info@mea.or.th","กรุงเทพ","0994000000999","MEA-Account","HMW","O4","Active"),
    @("V003","Kasikorn Bank - Loan","Interest",0,"Loan Officer","02-888-8888","loan@kbank.com","Kasikorn HQ","0105560000888","Auto-debit","HMW","F1","Active"),
    @("V004","บริษัท ก่อสร้าง CCC จำกัด","Subcontract",30,"คุณประยุทธ์","02-444-5555","ccc@build.com","นนทบุรี","0125560111222","SCB-555","HMW","O3","Active"),
    @("V005","กรมสรรพากร","Tax",30,"E-Filing","1161","info@rd.go.th","กรุงเทพ","0994000000111","RD-Account","HMW","O5","Active"),
    @("V006","พนักงาน (Payroll)","Staff",0,"HR Dept","Internal","hr@hmw.com","Internal","Internal","Various","HMW","O1","Active")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(12,30,14,14,16,14,22,28,16,16,10,10,10)

  Save-Workbook $wb "09_Vendor_Master_Template.xlsx"
}

# ==========================================
# 10. Inventory
# ==========================================
function Build-Inventory {
  $wb = Create-Workbook "10_Inventory_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Inventory"

  Add-Title $ws "Inventory Snapshot" 10
  $nextRow = Add-Notes $ws 2 @(
    "Period format: YYYY-MM (e.g., 2026-03)",
    "Total_Value auto-calculated: Quantity x Unit_Cost"
  ) 10

  $headers = @("Period","Item_Code","Item_Name","Category","Unit",
    "Quantity","Unit_Cost","Total_Value","Location","Entity")
  Write-Header $ws $nextRow $headers

  $startData = $nextRow + 1
  $data = @(
    @("2026-03","SKU-H001","Honda Wave 125i","Motorcycle","pcs",42,52000,"=F$startData*G$startData","คลังกลาง","HMW"),
    @("2026-03","SKU-H002","Honda Click 160i","Motorcycle","pcs",28,68000,"=F$($startData+1)*G$($startData+1)","คลังกลาง","HMW"),
    @("2026-03","SKU-H003","Honda PCX 160","Motorcycle","pcs",15,95000,"=F$($startData+2)*G$($startData+2)","คลังกลาง","HMW"),
    @("2026-03","SKU-SP01","อะไหล่ - น้ำมันเครื่อง","Parts","ขวด",350,180,"=F$($startData+3)*G$($startData+3)","คลัง Service","HMW"),
    @("2026-03","SKU-SP02","อะไหล่ - แบตเตอรี่","Parts","pcs",85,1850,"=F$($startData+4)*G$($startData+4)","คลัง Service","HMW")
  )
  Write-Data $ws $startData $data
  Set-ColWidths $ws @(10,12,28,14,8,12,12,16,16,10)

  Save-Workbook $wb "10_Inventory_Template.xlsx"
}

# ==========================================
# 11. CF Mapping
# ==========================================
function Build-CFMapping {
  $wb = Create-Workbook "11_CF_Mapping_Template.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "CF_Mapping"

  Add-Title $ws "Cash Flow Mapping" 7
  $nextRow = Add-Notes $ws 2 @(
    "Activity: Operating / Investing / Financing",
    "Type: Income / Expense",
    "Group: INC / F1 / I1 / O1-O6",
    "Entity: ACG / HMW / CLIK / * (shared)"
  ) 7

  $headers = @("Activity","CF_Line","Type","Group","Entity","Segment_ID","Segment_Name")
  Write-Header $ws $nextRow $headers

  $data = @(
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","HONDA","Honda (ขายรถ)"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","TOK","ตอกเข็ม"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","INS","ประกัน"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","FIN","ไฟแนนซ์"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","RENT","รถเช่า"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","HMW","DEL","รถส่ง"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","ACG","MGT_HMW","ค่าบริหาร HMW"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","ACG","MGT_CLIK","ค่าบริหาร CLIK"),
    @("Operating","เงินสดรับจากการขายสินค้าและบริการ","Income","INC","CLIK","SVC","Service"),
    @("Operating","เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน","Expense","O1","*","O1","Staff exp"),
    @("Operating","เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน","Expense","O2","*","O2","Inventory"),
    @("Operating","เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน","Expense","O3","*","O3","Sub contract"),
    @("Operating","เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน","Expense","O4","*","O4","Utility"),
    @("Operating","เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน","Expense","O6","*","O6","Other"),
    @("Operating","เงินสดจ่ายดอกเบี้ย","Expense","F1","*","F1","Loan/Int"),
    @("Operating","เงินสดจ่ายภาษีเงินได้","Expense","O5","*","O5","Tax"),
    @("Investing","ซื้อที่ดิน อาคารและอุปกรณ์","Expense","I1","*","I1","Fixed assets"),
    @("Financing","เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)","Expense","F1","*","F1","Loan/Int"),
    @("Financing","เงินกู้ระยะยาว ชำระคืน","Expense","F1","*","F1","Loan/Int"),
    @("Financing","จ่ายเงินปันผล","Expense","F1","*","F1","Loan/Int")
  )
  Write-Data $ws ($nextRow + 1) $data
  Set-ColWidths $ws @(14,42,12,10,10,14,22)

  Save-Workbook $wb "11_CF_Mapping_Template.xlsx"
}

# ==========================================
# 12. README / Index
# ==========================================
function Build-Readme {
  $wb = Create-Workbook "00_README_Index.xlsx"
  $ws = $wb.Sheets.Item(1)
  $ws.Name = "Templates_Index"

  $r = $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1,4))
  $r.Merge()
  $ws.Cells.Item(1,1).Value2 = "Cashflow Automation - Excel Templates Index"
  $ws.Cells.Item(1,1).Font.Bold = $true
  $ws.Cells.Item(1,1).Font.Size = 16
  $ws.Cells.Item(1,1).Font.Color = $BLUE_HEADER_BG
  $ws.Cells.Item(1,1).HorizontalAlignment = -4108
  $ws.Rows(1).RowHeight = 32

  $r2 = $ws.Range($ws.Cells.Item(2,1), $ws.Cells.Item(2,4))
  $r2.Merge()
  $ws.Cells.Item(2,1).Value2 = "11 templates สำหรับ upload ข้อมูลเข้าระบบ Cashflow Automation"
  $ws.Cells.Item(2,1).Font.Italic = $true
  $ws.Cells.Item(2,1).Font.Color = $GRAY_TEXT
  $ws.Cells.Item(2,1).HorizontalAlignment = -4108

  Write-Header $ws 4 @("#","Template File","Module","Purpose")

  $files = @(
    ,@("1","01_GL_Template.xlsx","Accounting","General Ledger journal entries - main data source")
    ,@("2","02_Trial_Balance_Template.xlsx","Accounting","Monthly TB for Indirect Method calculations")
    ,@("3","03_AR_Invoices_Template.xlsx","AR / Finance","Invoices - feeds AR Aging + cash forecast")
    ,@("4","04_AP_Bills_Template.xlsx","AP / Finance","Bills from vendors - feeds AP Aging")
    ,@("5","05_Bank_Transactions_Template.xlsx","Finance","Bank statement for reconciliation")
    ,@("6","06_Cash_Receipts_Template.xlsx","Finance","Cash collected (Direct Method input)")
    ,@("7","07_Cash_Payments_Template.xlsx","Finance","Cash paid (Direct Method input)")
    ,@("8","08_Customer_Master_Template.xlsx","Master Data","Customer database with credit terms")
    ,@("9","09_Vendor_Master_Template.xlsx","Master Data","Vendor database with payment terms")
    ,@("10","10_Inventory_Template.xlsx","Accounting","Month-end inventory snapshot")
    ,@("11","11_CF_Mapping_Template.xlsx","Settings","Segment to CF Line mapping config")
  )
  for ($i = 0; $i -lt $files.Count; $i++) {
    $row = 5 + $i
    $rowData = $files[$i]
    for ($j = 0; $j -lt 4; $j++) {
      $cell = $ws.Cells.Item($row, $j + 1)
      $cell.Value2 = [string]$rowData[$j]
      $cell.Borders.LineStyle = 1
      $cell.Font.Name = "Arial"
      $cell.Font.Size = 10
    }
    $ws.Cells.Item($row,1).HorizontalAlignment = -4108
    $ws.Cells.Item($row,3).HorizontalAlignment = -4108
    $ws.Cells.Item($row,2).Font.Color = $BLUE_HEADER_BG
  }

  $ws.Columns(1).ColumnWidth = 5
  $ws.Columns(2).ColumnWidth = 36
  $ws.Columns(3).ColumnWidth = 15
  $ws.Columns(4).ColumnWidth = 60

  # Workflow notes
  $startNote = 5 + $files.Count + 2
  $ws.Cells.Item($startNote, 1).Value2 = "Upload Workflow:"
  $ws.Cells.Item($startNote, 1).Font.Bold = $true
  $workflow = @(
    "1. Setup once: Customer & Vendor Master (templates 8, 9)",
    "2. Setup once: CF Mapping (template 11)",
    "3. Monthly: GL or Trial Balance (templates 1, 2)",
    "4. Weekly/Monthly: AR, AP, Bank (templates 3, 4, 5)",
    "5. Daily/Weekly: Receipts, Payments (templates 6, 7) if not in GL",
    "6. Month-end: Inventory snapshot (template 10)"
  )
  for ($i = 0; $i -lt $workflow.Count; $i++) {
    $r = $startNote + 1 + $i
    $rng = $ws.Range($ws.Cells.Item($r,1), $ws.Cells.Item($r,4))
    $rng.Merge()
    $ws.Cells.Item($r,1).Value2 = $workflow[$i]
    $ws.Cells.Item($r,1).Font.Name = "Arial"
    $ws.Cells.Item($r,1).Font.Size = 10
  }

  Save-Workbook $wb "00_README_Index.xlsx"
}

# Run all
try {
  Write-Host "`nBuilding Cashflow Automation Excel templates..." -ForegroundColor Yellow
  Write-Host ("=" * 50) -ForegroundColor Yellow
  Build-Readme
  Build-GL
  Build-TB
  Build-AR
  Build-AP
  Build-Bank
  Build-Receipts
  Build-Payments
  Build-Customer
  Build-Vendor
  Build-Inventory
  Build-CFMapping
  Write-Host ("=" * 50) -ForegroundColor Yellow
  Write-Host "`nAll templates created in: $outDir" -ForegroundColor Green
  Write-Host "Total: 12 files`n" -ForegroundColor Green
} finally {
  $xl.Quit() | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
