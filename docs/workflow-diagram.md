# Workflow Diagram
# แผนภาพกระบวนการทำงานของระบบ Cashflow Automation

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## Workflow 1: กระบวนการจัดทำงบกระแสเงินสดรายเดือน (End-to-End)

```
START
  │
  ▼
[STEP 1] รวบรวมข้อมูล (ทุกสิ้นเดือน)
  │
  ├──► Accountant: Import GL จาก Business Central
  │         └─ Accounting Input → Trial Balance tab → Import
  │
  ├──► Treasury Manager: Upload Bank Statement
  │         └─ Finance Input → นำเข้า Bank Statement
  │
  └──► Finance User: ยืนยันรายการ Pending
            └─ Finance Input → เงินรับ/เงินจ่าย → Filter Pending
  │
  ▼
[STEP 2] กระทบยอด AR/AP
  │
  ├──► Accountant: ตรวจ AR Aging
  │         └─ Accounting Input → ลูกหนี้ tab
  │
  ├──► Treasury Manager: Reconcile AR
  │         └─ Finance Input → Reconcile AR tab
  │
  └──► Treasury Manager: ตรวจ AP Due
            └─ Accounting Input → เจ้าหนี้ tab
  │
  ▼
[STEP 3] ตรวจสอบ Cash Flow Statements
  │
  ├──► CFO: ดู Direct CF Report → Tab 4 กระทบยอดเงินสด
  │         └─ Status ✓ หรือ ⚠?
  │              │
  │              ├── ✓ → ไป Step 4
  │              └── ⚠ → กลับ Step 1-2 หาสาเหตุ
  │
  └──► CFO: ดู Indirect CF Report → Tab 3 Direct vs Indirect
            └─ Difference = 0?
                 │
                 ├── = 0 → ไป Step 4
                 └── ≠ 0 → Settings → CF Mapping → ตรวจสอบ
  │
  ▼
[STEP 4] สร้าง Report สำหรับ Management
  │
  ├──► CFO: Export Direct CF + Indirect CF + Forecast
  │         └─ Export Center → สร้าง 3 ไฟล์
  │
  └──► Treasury: ส่ง Report ให้ Approver Review
  │
  ▼
[STEP 5] อนุมัติ (Approver)
  │
  ├──► Approver: ดู CF Report → Tab 5 Cross-validation
  │
  └──► Approver: Sign-off (ปัจจุบัน Manual — ไม่มีใน System)
  │
  ▼
END — งบ CF สำหรับเดือนนี้พร้อมใช้
```

---

## Workflow 2: กระบวนการ Import ข้อมูลจาก Business Central

```
[Business Central ERP]
  │
  │  Export GL Journal (Excel format)
  ▼
[Accountant] เปิดระบบ Cashflow
  │
  ▼
Accounting Input → Tab "Trial Balance"
  │
  ▼
คลิก "นำเข้าจากระบบบัญชี"
  │
  ▼
ImportLedgerModal เปิด
  │
  ├──► เลือกไฟล์ Excel GL
  │
  ▼
ระบบ Parse Excel:
  │   forEach row → { glAccount, description, debit, credit }
  │   aggregate by GL Account → { code, debit, credit, entries }
  │
  ▼
แสดง Success Banner:
  "ข้อมูล GL จาก Business Central — X รายการ • Y GL accounts"
  │
  ▼
GL data เก็บใน window.glImported (Session storage)
  │
  ▼
ข้อมูลพร้อมใช้ใน:
  ├──► Trial Balance table (Debit/Credit/Net per account)
  ├──► CF Report Tab 4 (tbBal function ดึง GL code 1010)
  └──► CF Report Indirect (Opening balance จาก TB)
  │
  ▼
หมายเหตุ: ข้อมูลหายเมื่อ Refresh (ไม่มี Persistent storage)
```

---

## Workflow 3: กระบวนการคำนวณ CF แยก Segment (buildSegmentCF)

```
INPUT: cfData = { direct: directCF }
  │
  ▼
ดึง cfMainCur = ยอด "เงินสดรับจากการขายสินค้าและบริการ" (current period)
  │
  ▼
คำนวณ totalIncQ1 = รวม income ทุก segment ทุก entity (Q1)
  │
  ▼
สำหรับแต่ละ entity (HMW, CLIK, ACG):
  สำหรับแต่ละ income segment:
    │
    ├──► คำนวณ incQ1 = income Q1 ของ segment นั้น
    │
    ├──► คำนวณ pct = incQ1 / totalIncQ1 (สัดส่วน)
    │
    ├──► scaledInc = cfMainCur × pct (ยอดรับ ตามสัดส่วน CF period)
    │
    ├──► arCFImpact = -(AR change ของ segment)
    │      AR เพิ่ม → CF ลด
    │
    ├──► allocOtherIn = totalOpOtherIn × pct
    │
    ├──► allocOpOut = totalOpOut × pct
    │
    ├──► operatingCF = scaledInc + arCFImpact + allocOtherIn + allocOpOut
    │
    ├──► investingCF = totalInvCF × pct
    │
    ├──► financingCF = totalFinCF × pct
    │
    └──► netCF = operatingCF + investingCF + financingCF
  │
  ▼
OUTPUT: segs[] array (14 segments × 3 entities)
  └─ แสดงใน Tab 1 SegmentCFCard
```

---

## Workflow 4: กระบวนการ Export Excel (3-Step Modal)

```
User คลิก Export Button (ที่ไหนก็ได้)
  │
  ▼
[STEP 1 — Config]
  │
  ├──► เลือก Report type: Direct CF / Indirect CF / Forecast / ...
  ├──► เลือก Period
  ├──► เลือก Format: Formatted / Raw
  ├──► เลือก Unit: บาท / พัน / ล้าน
  └──► เลือก Sections: Summary / Activities / Notes / Supporting / Charts
  │
  ▼
คลิก "สร้างไฟล์"
  │
  ▼
[STEP 2 — Progress Simulation]
  │
  Progress 0–29%:   "กำลังดึงข้อมูลจาก GL..."
  Progress 30–64%:  "กำลังจัดรูปแบบเซลล์ + สูตร..."
  Progress 65–94%:  "กำลังสร้าง Pivot tables..."
  Progress 95–100%: "เกือบเสร็จแล้ว..."
  │
  ▼
[STEP 3 — Done]
  │
  ├──► แสดงชื่อไฟล์ + จำนวน sheets + ขนาดไฟล์
  └──► ปุ่ม "ดาวน์โหลด"
  │
  ▼
Toast: "ดาวน์โหลด [Report Name] เรียบร้อย"

หมายเหตุ: Export เป็น Simulation ปัจจุบัน — ไม่มีการสร้างไฟล์จริง
```

---

## Workflow 5: กระบวนการกระทบยอดเงินสดปลายงวด (Tab 4)

```
INPUT:
  - directCF.sections (3 activities)
  - directCF.opening
  - bankAccounts[]
  - tbBal("2026-Q1", "1010")
  │
  ▼
คำนวณ Net CF:
  Operating CF + Investing CF + Financing CF = Net
  │
  ▼
คำนวณ CF Closing:
  Opening + Net = CF Closing
  │
  ▼
ดึง Bank Total:
  sum(bankAccounts.balance)
  │
  ▼
ดึง TB Cash:
  tbBal("2026-Q1", "1010") — GL account เงินฝากธนาคาร
  │
  ▼
คำนวณ Difference:
  diff = bankTotal - cfClosing
  │
  ▼
ตัดสิน:
  │
  ├── abs(diff) < 1,000,000:
  │       ✓ ยอดตรง — แสดงสีเขียว
  │
  └── abs(diff) >= 1,000,000:
          ⚠ ยอดไม่สอดคล้อง — แสดงสีแดง
          Hint: รายการระหว่างทาง / เช็คค้างจ่าย / ข้อมูลยังไม่ครบ
```

---

## Workflow 6: กระบวนการ Forecast Scenario Analysis

```
User เลือก Scenario
  │
  ├── Bear: adjust = 0.85
  ├── Base: adjust = 1.00
  └── Bull: adjust = 1.15
  │
  ▼
Map forecast data:
  inflow = original inflow × adjust
  outflow = original outflow (ไม่เปลี่ยน)
  net = adjusted inflow - outflow
  │
  ▼
คำนวณ Running Balance:
  starting: 469,220,000 บาท
  สำหรับแต่ละสัปดาห์:
    balance[i] = balance[i-1] + net[i]
  │
  ▼
คำนวณ KPIs:
  - End Balance = balance[last]
  - Total Inflow = sum(adjusted inflow)
  - Total Outflow = sum(outflow)
  - Min Balance = min(balance[])
  │
  ▼
Render:
  - ForecastChart (Bar + Line dual-axis)
  - Forecast Table
  - 4 KPI Cards
```

---

## Workflow 7: CF Mapping → Segment Drill-down

```
User คลิกแถวใน CF Statement
  (เช่น "เงินสดรับจากการขายสินค้าและบริการ")
  │
  ▼
Lookup cfMapping["เงินสดรับจากการขายสินค้าและบริการ"]
  → type: "income"
  → incomeSegments: { ACG: [...], HMW: [...], CLIK: [...] }
  │
  ▼
Filter segments ตาม companyId:
  ถ้า companyId = "CONSO" → รวมทุก entity
  ถ้า companyId = "HMW" → เฉพาะ HMW segments
  │
  ▼
คำนวณ breakdown:
  สำหรับแต่ละ segment → ยอด Q1 จาก incomeByCoMonth
  │
  ▼
Popup แสดง:
  - ยอดแต่ละ segment
  - % ของยอดรวม CF line
  - Bar visualization
```

---

## Workflow 8: Working Capital → CF Impact Calculation

```
กิจกรรมดำเนินงาน (Indirect Method)
  │
  ▼
AR Movement:
  Opening AR + ยอดขาย − เก็บเงิน ± ปรับ = Closing AR
  Change = Closing − Opening
  CF Impact = −(Change)
  [AR เพิ่ม → เงินออก → CF ลด]
  │
  ▼
AP Movement:
  Opening AP + ซื้อ − จ่าย ± ปรับ = Closing AP
  Change = Closing − Opening
  CF Impact = +(Change)
  [AP เพิ่ม → ยังไม่จ่าย → CF เพิ่ม]
  │
  ▼
Inventory:
  Close Inv − Open Inv = Change
  CF Impact = −(Change)
  [Inv เพิ่ม → ซื้อมากขึ้น → CF ลด]
  │
  ▼
Accrued Expenses:
  Close Accrue − Open Accrue = Change
  CF Impact = +(Change)
  [ค้างจ่ายเพิ่ม → ยังไม่จ่าย → CF เพิ่ม]
  │
  ▼
Total WC CF Impact = AR + AP + Inv + Accrue
  └─ แสดงใน Tab 2 WC Reconcile
     └─ ใช้ใน Tab 3 Direct vs Indirect comparison
```

---

## Data State Lifecycle

```
Application Start
  │
  ▼
window.CFData loaded (data.js)  ← Permanent for session
window.CF_PERIODS loaded         ← Permanent for session
window.CF_STATUS loaded          ← Permanent for session
  │
  ▼
User interactions:
  │
  ├── setPeriod → React state → re-render all screens
  ├── setCompanyId → React state → re-render all screens  
  ├── setTweak → localStorage → persist across refresh
  │
  ├── GL Import → window.glImported (session) → GLTab
  │                └─ หายเมื่อ Refresh ⚠
  │
  └── User actions (Add/Edit) → React local state only
                                └─ หายเมื่อ navigate ⚠
  │
  ▼
Page Refresh → Reset ทั้งหมด (ยกเว้น tweaks)
```
