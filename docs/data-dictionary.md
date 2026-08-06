# Data Dictionary
# พจนานุกรมข้อมูล (Data Dictionary)

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569
> หมายเหตุ: ระบบปัจจุบันใช้ Mock Data (window.CFData) — ไม่มีฐานข้อมูลจริง

---

## 1. Company Object

| Field | Type | ตัวอย่าง | คำอธิบาย |
|-------|------|---------|---------|
| `id` | string | `"ACG"`, `"CONSO"` | รหัสบริษัท (Primary Key) |
| `name` | string | `"ACG Holding"` | ชื่อเต็มบริษัท |
| `short` | string | `"ACG"` | ชื่อย่อสำหรับแสดง |
| `desc` | string | `"บริหารจัดการกลุ่ม..."` | คำอธิบายธุรกิจ |
| `color` | hex | `"#2A6FF0"` | สี brand สำหรับ UI chips |

**Companies ที่มีในระบบ:**
| id | name | ประเภท |
|----|------|-------|
| CONSO | งบรวมกลุ่ม (Consolidated) | Virtual — sum ทุก entity |
| ACG | ACG Holding | Holding Company |
| HMW | HMW | ตัวแทนจำหน่าย Honda |
| CLIK | CLIK | บริการ |

---

## 2. Bank Account Object

| Field | Type | ตัวอย่าง | คำอธิบาย |
|-------|------|---------|---------|
| `id` | string | `"BA-001"` | รหัสบัญชี (Primary Key) |
| `entity` | string | `"ACG"` | บริษัทที่เป็นเจ้าของ |
| `name` | string | `"บัญชีหลัก – ออมทรัพย์"` | ชื่อบัญชี |
| `bank` | string | `"ธนาคารพาณิชย์ A"` | ชื่อธนาคาร |
| `branch` | string | `"สำนักงานใหญ่"` | สาขา |
| `no` | string | `"xxx-x-12345-6"` | เลขที่บัญชี (masked) |
| `balance` | number | `248_650_000` | ยอดคงเหลือ (บาท) |
| `type` | string | `"ออมทรัพย์"` | ประเภทบัญชี |
| `ccy` | string | `"THB"`, `"USD"` | สกุลเงิน |

**บัญชีที่มีในระบบ (7 บัญชี):**
| id | entity | ประเภท | สกุลเงิน |
|----|--------|--------|---------|
| BA-001 | ACG | ออมทรัพย์ | THB |
| BA-002 | HMW | กระแสรายวัน | THB |
| BA-003 | HMW | กระแสรายวัน (เงินเดือน) | THB |
| BA-004 | ACG | FCD | USD |
| BA-005 | ACG | ออมทรัพย์ (ลงทุน) | THB |
| BA-006 | CLIK | กระแสรายวัน | THB |
| BA-007 | CLIK | กระแสรายวัน (เงินเดือน) | THB |

---

## 3. Transaction Object

| Field | Type | ตัวอย่าง | คำอธิบาย |
|-------|------|---------|---------|
| `id` | string | `"T-04221"` | รหัสรายการ (Primary Key) |
| `date` | string | `"2026-03-29"` | วันที่ (ISO 8601) |
| `desc` | string | `"รับชำระจากลูกค้า..."` | รายละเอียดรายการ |
| `account` | string | `"BA-002"` | บัญชีธนาคาร (FK → Bank Account.id) |
| `entity` | string | `"HMW"` | บริษัท |
| `segmentId` | string | `"HONDA"`, `"O1"` | รหัส Income/Expense segment |
| `amount` | number | `18_420_000` | จำนวนเงิน (+รับ / –จ่าย) (บาท) |
| `type` | string | `"in"`, `"out"` | ทิศทางเงิน |
| `status` | string | `"matched"` | สถานะการจับคู่ |
| `source` | string | `"Bank"`, `"Manual"`, `"AP"`, `"Payroll"` | แหล่งที่มาของข้อมูล |
| `category` | string | `"รายได้จากการขาย"` | หมวดหมู่ (บางรายการ) |

**Transaction Status Values:**
| Status | ความหมาย | สี |
|--------|---------|---|
| `matched` | จับคู่ Bank + GL แล้ว | เขียว |
| `pending` | รอการจับคู่ | เหลือง |
| `review` | มีความผิดปกติ ต้องตรวจ | แดง |
| `void` | ยกเลิก | เทา |

---

## 4. Income Segment Objects

**Income Segments by Company:**

| company | id | name |
|---------|----|------|
| ACG | MGT_HMW | ค่าบริหารจัดการ HMW |
| ACG | MGT_CLIK | ค่าบริหารจัดการ CLIK |
| ACG | OTH | อื่นๆ |
| HMW | HONDA | HONDA (ขายรถ) |
| HMW | TOK | ตอกเข็ม |
| HMW | INS | ประกัน |
| HMW | INS_OPEN | ประกันภัยเปิด |
| HMW | INS_LIM | ประวางวง |
| HMW | FIN | ไฟแนนซ์ |
| HMW | RENT | รถเช่า |
| HMW | DEL | รถส่ง |
| HMW | OTH | อื่นๆ |
| CLIK | SVC | Service |
| CLIK | OTH | อื่นๆ |

---

## 5. Expense Segment Objects

| id | name | group | สี |
|----|------|-------|----|
| F1 | Loan & Int | F (Financing) | #D03434 |
| I1 | Fixed assets | I (Investing) | #C97A00 |
| O1 | Staff exp | O (Operating) | #2A6FF0 |
| O2 | Inventory | O (Operating) | #1F9D55 |
| O3 | Sub contract | O (Operating) | #7C4DFF |
| O4 | Rental & Facilities | O (Operating) | #0E97A0 |
| O5 | Tax | O (Operating) | #8B5A2B |
| O6 | Others | O (Operating) | #8B95A1 |

---

## 6. Cash Flow Statement Object (Direct Method)

```
directCF = {
  opening: number,           // เงินสดต้นงวด (บาท)
  sections: [
    {
      header: string,        // "กิจกรรมดำเนินงาน"
      items: [
        {
          label: string,     // ชื่อบรรทัด CF
          current: number,   // ยอดงวดปัจจุบัน (บาท)
          prior: number,     // ยอดงวดก่อนหน้า (บาท)
          header: boolean,   // true = หัวข้อ (ไม่รวมในยอด)
          indent: number,    // ระดับการย่อหน้า
          bold: boolean      // แสดง bold
        }
      ]
    },
    // section[1] = กิจกรรมลงทุน
    // section[2] = กิจกรรมจัดหาเงิน
  ]
}
```

**CF Line Items (Operating — Direct Method):**
| Label | ทิศทาง | Segment |
|-------|--------|---------|
| เงินสดรับจากการขายสินค้าและบริการ | + | Income segments |
| เงินสดรับจากดอกเบี้ยและเงินปันผล | + | OTH |
| เงินสดรับอื่น | + | OTH |
| เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน | – | O1, O2, O3, O4, O6 |
| เงินสดจ่ายดอกเบี้ย | – | F1 |
| เงินสดจ่ายภาษีเงินได้ | – | O5 |

---

## 7. Cash Flow Statement Object (Indirect Method)

**CF Line Items (Operating — Indirect Method):**
| Label | ทิศทาง | ประเภท |
|-------|--------|-------|
| กำไรก่อนภาษีเงินได้ | + | Starting Point |
| ค่าเสื่อมราคาและค่าตัดจำหน่าย | + | Add-back (Non-cash) |
| หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ | + | Add-back |
| ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน | +/– | Adjustment |
| ดอกเบี้ยจ่าย | + | Add-back |
| ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง | +/– | WC Change |
| สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง | +/– | WC Change |
| เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง) | +/– | WC Change |
| ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง) | +/– | WC Change |
| ดอกเบี้ยจ่าย | – | Cash paid |
| ภาษีเงินได้จ่าย | – | Cash paid |

---

## 8. AR / AP Aging Object

**AR Aging Row:**
| Field | Type | คำอธิบาย |
|-------|------|---------|
| `customer` | string | ชื่อลูกค้า |
| `entity` | string | บริษัทที่เป็นเจ้าหนี้ |
| `total` | number | ยอดลูกหนี้รวม |
| `current` | number | ยังไม่ครบกำหนด |
| `d30` | number | 1–30 วัน |
| `d60` | number | 31–60 วัน |
| `d90` | number | 61–90 วัน |
| `over` | number | เกิน 90 วัน |

**AP Aging Row:**
| Field | Type | คำอธิบาย |
|-------|------|---------|
| `vendor` | string | ชื่อ Vendor |
| `entity` | string | บริษัทที่เป็นลูกหนี้ |
| `total` | number | ยอดเจ้าหนี้รวม |
| `current` | number | ยังไม่ครบกำหนด |
| `d30` | number | 1–30 วัน |
| `d60` | number | 31–60 วัน |
| `d90` | number | 61–90 วัน |
| `nextDueDate` | string | วันครบกำหนดถัดไป |

---

## 9. GL Account Object

| Field | Type | ตัวอย่าง | คำอธิบาย |
|-------|------|---------|---------|
| `code` | string | `"1110"` | รหัสบัญชี GL |
| `name` | string | `"เงินสด"` | ชื่อบัญชี |
| `type` | string | `"Asset"` | ประเภทบัญชี |

**GL Account Types:**
- Asset (สินทรัพย์)
- Liability (หนี้สิน)
- Equity (ส่วนของผู้ถือหุ้น)
- Revenue (รายได้)
- Expense (ค่าใช้จ่าย)

**GL Accounts ในระบบ (21 รายการ):**
| Code | ชื่อบัญชี | Type |
|------|----------|------|
| 1110 | เงินสด | Asset |
| 1120 | เงินฝากธนาคาร | Asset |
| 1140 | ลูกหนี้การค้า | Asset |
| 1150 | ลูกหนี้อื่น | Asset |
| 1160 | สินค้าคงเหลือ | Asset |
| 1200 | สินค้าคงเหลือ (TB ref) | Asset |
| 1210 | ที่ดิน อาคารและอุปกรณ์ | Asset |
| 2110 | เจ้าหนี้การค้า | Liability |
| 2120 | เจ้าหนี้อื่น | Liability |
| 2130 | ค่าใช้จ่ายค้างจ่าย | Liability |
| 2210 | เงินกู้ระยะสั้น | Liability |
| 2310 | เงินกู้ระยะยาว | Liability |
| 3110 | ทุนจดทะเบียน | Equity |
| 3210 | กำไรสะสม | Equity |
| 4110 | รายได้จากการขาย | Revenue |
| 4210 | รายได้อื่น | Revenue |
| 5110 | ต้นทุนขาย | Expense |
| 5210 | ค่าใช้จ่ายในการขาย | Expense |
| 5220 | ค่าใช้จ่ายในการบริหาร | Expense |
| 5310 | ค่าเสื่อมราคา | Expense |
| 5410 | ดอกเบี้ยจ่าย | Expense |
| 5510 | ภาษีเงินได้ | Expense |

---

## 10. CF Mapping Object

```javascript
cfMapping = {
  "CF Line Label": {
    type: "income" | "expense",
    incomeSegments: {
      ACG: ["segId", ...],
      HMW: ["segId", ...],
      CLIK: ["segId", ...]
    },
    // หรือ
    expenseSegments: ["F1", "O1", ...]
  }
}
```

**22 CF Lines ที่ map ในระบบ:**
| CF Line | Activity | Direction |
|---------|---------|-----------|
| เงินสดรับจากการขายสินค้าและบริการ | Operating | In |
| เงินสดรับจากดอกเบี้ยและเงินปันผล | Operating | In |
| เงินสดรับอื่น | Operating | In |
| เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน | Operating | Out |
| เงินสดจ่ายดอกเบี้ย | Operating | Out |
| เงินสดจ่ายภาษีเงินได้ | Operating | Out |
| กำไรก่อนภาษีเงินได้ | Indirect-Operating | Start |
| ค่าเสื่อมราคาและค่าตัดจำหน่าย | Indirect-Operating | Add-back |
| หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ | Indirect-Operating | Add-back |
| ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน | Indirect-Operating | Adjust |
| ดอกเบี้ยจ่าย | Indirect-Operating | Add-back |
| ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง | Indirect-WC | Adjust |
| สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง | Indirect-WC | Adjust |
| เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง) | Indirect-WC | Adjust |
| ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง) | Indirect-WC | Adjust |
| ซื้อที่ดิน อาคารและอุปกรณ์ | Investing | Out |
| ขายสินทรัพย์ถาวร | Investing | In |
| เงินลงทุนระยะสั้น (เพิ่ม)/ลด | Investing | Out |
| เงินปันผลรับจากเงินลงทุน | Investing | In |
| เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง) | Financing | In/Out |
| เงินกู้ระยะยาว – รับ | Financing | In |
| เงินกู้ระยะยาว – ชำระคืน | Financing | Out |
| จ่ายเงินปันผล | Financing | Out |

---

## 11. Forecast Object

```javascript
forecast = [
  {
    week: "W1",       // label สัปดาห์
    inflow: number,   // เงินสดรับคาดการณ์ (บาท)
    outflow: number,  // เงินสดจ่ายคาดการณ์ (บาท)
    // net + balance คำนวณ runtime
  }
  // × 8 สัปดาห์
]
```

---

## 12. Reconcile AR/AP Object

```javascript
reconcileAR = {
  entities: [
    {
      entity: string,      // "HMW"
      opening: number,     // ยอดลูกหนี้ต้นงวด
      sales: number,       // ยอดขายในงวด
      collection: number,  // ยอดเก็บเงินได้
      adjustments: number, // ปรับปรุงอื่น
      closing: number,     // ยอดลูกหนี้ปลายงวด
      change: number       // closing - opening
    }
  ],
  totalOpening, totalSales, totalCollection,
  totalAdjustments, totalClosing, totalChange,
  cfImpact: number   // = -(totalChange): AR เพิ่ม = CF ลด
}
```

---

## 13. Period Codes

| Code | ความหมาย | Label ไทย |
|------|---------|---------|
| `"2026-Q1"` | ม.ค.–มี.ค. 2569 | ไตรมาส 1/2569 |
| `"2025-Q4"` | ต.ค.–ธ.ค. 2568 | ไตรมาส 4/2568 |
| (อื่นๆ) | ตาม CF_PERIODS array | — |

---

## 14. Status Constants (window.CF_STATUS)

```javascript
CF_STATUS = {
  TXN: {
    MATCHED: "matched",
    PENDING:  "pending",
    REVIEW:   "review",
    VOID:     "void"
  }
}
```

---

## 15. Helper Functions

| Function | Input | Output | คำอธิบาย |
|----------|-------|--------|---------|
| `window.fmtTHB(n)` | number | string | Format บาทไทย: `1,234,567` |
| `window.fmtTHBShort(n)` | number | string | Format ย่อ: `1.2M` |
| `window.getPeriodLabel(code)` | string | string | `"2026-Q1"` → `"ไตรมาส 1/2569"` |
| `window.getPeriodMeta(code)` | string | object | return API params |
| `window.CFData.getCompanyTotals(id)` | string | object | คำนวณ inflow/outflow/net per company |
| `window.CFData.getIncomeMatrix(id)` | string | object | Matrix รายได้ per company per segment |
| `window.CFData.getExpenseMatrix(id)` | string | object | Matrix ค่าใช้จ่าย per company per segment |
| `window.CFData.tbBal(period, code)` | strings | number | Trial Balance balance per GL code |
| `buildSegmentCF(cfData)` | object | array | คำนวณ CF per income segment |
| `window.useSize(ref)` | ref | {w,h} | responsive chart dimensions |
| `window.useTweaks(defaults)` | object | [state, setter] | persistent UI tweaks via localStorage |
