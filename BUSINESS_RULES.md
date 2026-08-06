# BUSINESS_RULES.md
# Cashflow Management System — Business & Accounting Rules
# มาตรฐาน: TAS 7 / TFRS | อัปเดต: 2026-06-05

---

## BR-001: กฎหลัก — Revenue ≠ Cash

> **กฎนี้สำคัญที่สุดในระบบ** — ทุก Feature ต้องออกแบบโดยคำนึงถึงกฎนี้

```
ตัวอย่าง:
  1 มกราคม  → ออก Invoice 1,000,000 บาท (Credit Term 30 วัน)
              → บันทึก Revenue: มกราคม +1,000,000 บาท (P&L)
              → เงินสดในมกราคม: 0 บาท

  1 กุมภาพันธ์ → ลูกค้าชำระเงินจริง
              → บันทึก Cash In: กุมภาพันธ์ +1,000,000 บาท (CF)

ผล:
  มกราคม   → Revenue: 1,000,000 | Cash Received: 0
  กุมภาพันธ์ → Revenue: 0        | Cash Received: 1,000,000
```

**ระบบต้องแสดงแยกเสมอ**:
- **Revenue Performance** — เพื่อวิเคราะห์การขาย (P&L)
- **Cash Performance** — เพื่อบริหารเงินสดจริง (CF)

---

## BR-002: ประเภทลูกค้า

| ประเภท | นิยาม | Cash ≡ Revenue? |
|--------|-------|----------------|
| **Cash Customer** | จ่ายเงินทันที ณ วันออก Invoice | ✅ ใช่ (เดือนเดียวกัน) |
| **Credit Customer** | จ่ายเงินหลังจาก Credit Term ผ่าน | ❌ ไม่ใช่ (ต่างเดือน) |

**Credit Term ที่รองรับ**: 0, 30, 60, 90, 120 วัน  
**Expected Payment Date** = Invoice Date + Credit Term Days

---

## BR-003: โครงสร้าง Cash Flow Statement (TAS 7)

```
กระแสเงินสดจากกิจกรรม 3 ประเภท:

1. กิจกรรมดำเนินงาน  (Operating Activities)  รหัส: O
2. กิจกรรมลงทุน      (Investing Activities)  รหัส: I
3. กิจกรรมจัดหาเงิน  (Financing Activities)  รหัส: F

──────────────────────────────────────
สูตร:
  Net Cash Flow = Operating + Investing + Financing
  Closing Balance = Opening Balance + Net Cash Flow
```

---

## BR-004: CF Segment Mapping

| Segment | Activity | รายการที่จัดอยู่ใน Segment นี้ |
|---------|----------|-----------------------------|
| **O1** | Operating | เงินเดือนพนักงาน, สวัสดิการ, ค่าแรง |
| **O2** | Operating | สินค้าคงเหลือ, ต้นทุนขาย, Honda Parts, วัสดุซ่อม |
| **O3** | Operating | ค่าจ้างเหมา, Subcontract, ค่าบริการภายนอก |
| **O4** | Operating | ค่าเช่าสำนักงาน, สาธารณูปโภค, ค่าน้ำ ค่าไฟ |
| **O5** | Operating | ภาษีเงินได้, VAT ชำระ, Withholding Tax |
| **O6** | Operating | ค่าใช้จ่ายอื่น, หนี้สูญ, ผลต่าง FX, ค่าเสื่อมราคา (add-back) |
| **I1** | Investing | ซื้อ/ขายสินทรัพย์ถาวร, Capex, เงินลงทุนระยะยาว |
| **F1** | Financing | เงินกู้รับ/ชำระ, ดอกเบี้ยจ่าย, ค่างวด Lease (TFRS 16) |

---

## BR-005: Direct Method (วิธีตรง)

ใช้ยอดเงินสดที่รับและจ่ายจริงๆ

```
เงินสดรับจากลูกค้า
  = Revenue - เพิ่มขึ้นใน AR + ลดลงใน AR

เงินสดจ่ายให้ Supplier
  = COGS - เพิ่มขึ้นใน AP + เพิ่มขึ้นใน Inventory

เงินสดจ่ายค่าใช้จ่ายดำเนินงาน
  = SG&A - เพิ่มขึ้นใน Accrued Expenses

Operating CF (Direct) = รับจากลูกค้า - จ่าย Supplier - จ่ายค่าใช้จ่าย
```

---

## BR-006: Indirect Method (วิธีอ้อม) — TAS 7

เริ่มจากกำไรสุทธิ ปรับด้วยรายการที่ไม่ใช่เงินสด

```
กำไรสุทธิก่อนภาษี (Net Profit Before Tax)

บวกกลับรายการที่ไม่ใช่เงินสด:
  + ค่าเสื่อมราคา PPE (Depreciation)
  + ค่าเสื่อมสิทธิ์ใช้ ROU Assets (TFRS 16)
  + ค่าตัดจำหน่าย (Amortization)
  + หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ
  +/- ผลต่างจากอัตราแลกเปลี่ยน (FX)
  - ดอกเบี้ยจ่าย (โยกไปอยู่ Financing)

การเปลี่ยนแปลงใน Working Capital:
  AR เพิ่ม = เงินยังไม่ได้รับ  → หักออก  (-)
  AR ลด  = เก็บเงินได้แล้ว    → บวกเข้า (+)
  Inventory เพิ่ม = ใช้เงินซื้อ → หักออก  (-)
  Inventory ลด  = ขายออก       → บวกเข้า (+)
  AP เพิ่ม = ยังไม่ได้จ่าย    → บวกเข้า (+)
  AP ลด  = จ่ายแล้ว            → หักออก  (-)
  Accrued Expenses เพิ่ม       → บวกเข้า (+)

= กระแสเงินสดจากกิจกรรมดำเนินงาน (Operating CF)
```

**กฎสำคัญ**: Operating CF จาก Direct Method = Operating CF จาก Indirect Method เสมอ  
หากไม่เท่ากัน แสดงว่ามี Error ใน Calculation

---

## BR-007: Validation — Cross-Check Rules

| กฎ | สูตร | หากผิด |
|----|------|--------|
| Balance Sheet | Assets = Liabilities + Equity | ❌ Error ใน Journal |
| Journal Entry | DR = CR ทุก Entry | ❌ Error ใน GL |
| CF Reconcile | Direct OCF = Indirect OCF | ❌ Error ใน Calculation |
| Opening + Movement = Closing | TB ต้นงวด + Net Movement = TB ปลายงวด | ❌ Missing Transaction |
| Cash Balance | Opening + Net CF = Closing Cash | ❌ Error ใน CF |

---

## BR-008: AR Aging Buckets

จำแนกอายุหนี้จาก Due Date ถึงวันนี้:

| Bucket | ช่วง | ความหมาย |
|--------|------|---------|
| Current | ≤ 0 วัน (ยังไม่ถึง Due) | ปกติ |
| 1-30 days | เกิน Due 1-30 วัน | เริ่มติดตาม |
| 31-60 days | เกิน Due 31-60 วัน | ต้องติดตาม |
| 61-90 days | เกิน Due 61-90 วัน | เฝ้าระวัง |
| Over 90 days | เกิน Due > 90 วัน | ความเสี่ยงสูง — พิจารณาตั้งสำรอง |

---

## BR-009: AP Aging Buckets

| Bucket | ช่วง | ความหมาย |
|--------|------|---------|
| Current | ≤ 0 วัน | ยังไม่ถึงกำหนดจ่าย |
| 1-30 days | เกิน Due 1-30 วัน | ควรชำระ |
| 31-60 days | เกิน Due 31-60 วัน | อาจถูกบวกดอกเบี้ย |
| Over 60 days | เกิน Due > 60 วัน | เสี่ยงค่าปรับ |

---

## BR-010: Consolidation Rules (CONSO)

เมื่อรวมงบกลุ่ม ACG + HMW + CLIK → CONSO:

```
1. รวมยอดทุกบัญชีของ 3 บริษัท
2. ตัดรายการ Intercompany (IC) ออก:
   - IC Revenue ↔ IC Cost
   - IC Receivable ↔ IC Payable
   - IC Loans (กู้ระหว่างบริษัทในกลุ่ม)
   - IC Dividend
   - Management Fee (ACG เรียกเก็บจาก HMW/CLIK)
3. ผลลัพธ์ = กระแสเงินสดของกลุ่มบริษัทรวม
```

**กฎ**: ธุรกรรมระหว่างบริษัทในกลุ่มต้อง Eliminate ก่อนแสดง CONSO

---

## BR-011: TFRS 16 — Lease Accounting

ระบบต้องจัดการ Lease Payment ตาม TFRS 16:

```
Lease Payment แบ่งเป็น:
  - ส่วนชำระต้นเงิน (Principal) → Financing Activity (F1)
  - ส่วนดอกเบี้ย (Interest)     → Financing Activity (F1)

ROU Asset Depreciation → Non-cash Add-back ใน Indirect Method
```

---

## BR-012: Depreciation — Non-Cash Treatment

ค่าเสื่อมราคาในระบบ Indirect Method:

```
ค่าเสื่อมราคา PPE    → บันทึกใน P&L แต่ไม่ใช่เงินออก → Add-back (+) ใน CF
ค่าตัดจำหน่าย ROU   → บันทึกใน P&L แต่ไม่ใช่เงินออก → Add-back (+) ใน CF
หนี้สูญ (Bad Debt)   → บันทึกใน P&L แต่ไม่ใช่เงินออก → Add-back (+) ใน CF
```

---

## BR-013: Cash Flow Forecast Rules

ระบบ Forecast 8 สัปดาห์ใช้ 3 Scenarios:

| Scenario | คำอธิบาย | สูตร |
|----------|---------|------|
| Bear (Pessimistic) | ประมาณการแย่ | Base × 85% (Cash In) / Base × 115% (Cash Out) |
| Base (Expected) | ประมาณการปกติ | ค่าเฉลี่ยย้อนหลัง |
| Bull (Optimistic) | ประมาณการดี | Base × 115% (Cash In) / Base × 85% (Cash Out) |

**Alert**: แจ้งเตือนเมื่อ Forecast Balance ต่ำกว่า Minimum Cash Policy ของบริษัท

---

## BR-014: Bank Account Rules

ระบบมีบัญชีธนาคาร 7 บัญชีสำหรับกลุ่มบริษัท:
- แต่ละบัญชีผูกกับ GL Account Code
- Transfer ระหว่างบัญชี = ไม่ใช่ Cash In/Out จริง (ตัดออกจาก Net CF)
- ยอด Bank ต้อง Reconcile กับ GL ที่บันทึกใน Journal Entry

---

## BR-015: Audit Trail Requirements

ทุกการแก้ไขข้อมูลต้องบันทึก:
```
- User ID (ใคร)
- Timestamp (เมื่อไหร่)
- Table + Record ID (แก้อะไร)
- Old Value → New Value (เปลี่ยนจากอะไรเป็นอะไร)
- Action Type (CREATE / UPDATE / DELETE)
```

**ข้อมูลการเงินห้าม Hard Delete** — ใช้ Soft Delete เสมอ (is_deleted flag)

---

## BR-016: CF Account Mapping Rules

การ Map GL Account → CF Activity:

```
1 Account Code = 1 CF Mapping เสมอ (ไม่ซ้อน)
Direction: IN (เงินรับ) หรือ OUT (เงินจ่าย)
Activity: O / I / F
Segment: O1/O2/O3/O4/O5/O6 / I1 / F1

หากไม่ได้ Map → รายการอยู่ใน "Unclassified" → ต้อง Alert ให้ User Map
```

---

## สรุปข้อห้ามสำคัญ (Guardrails)

```
❌ ห้าม Net Revenue กับ Cash ในเดือนเดียวกันโดยไม่ตรวจสอบ Credit Term
❌ ห้ามลบข้อมูลทางการเงิน (ใช้ Soft Delete เสมอ)
❌ ห้าม Approve ข้อมูลที่ DR ≠ CR ในระดับ Journal
❌ ห้าม Consolidate โดยไม่ Eliminate IC Transactions
❌ ห้าม Classify ค่าเสื่อมราคาเป็น Cash Outflow (เป็น Add-back เท่านั้น)
❌ ห้าม Transfer ระหว่างบัญชีในกลุ่มนับเป็น Cash In/Out
```

---

*BUSINESS_RULES.md — อัปเดตเมื่อมีการเปลี่ยนแปลง Accounting Policy หรือ Business Logic*
*สำหรับรายละเอียด TAS 7 เพิ่มเติม ดู `docs/PROJECT_HANDOVER.md` หัวข้อ 8*
