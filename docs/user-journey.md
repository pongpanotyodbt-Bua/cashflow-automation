# User Journey Map
# แผนที่การใช้งานของผู้ใช้แต่ละ Role

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## Role Definitions

| Role | ผู้ใช้ตัวอย่าง | หน้าที่ |
|------|-------------|--------|
| CFO / Admin | K. ปริญญา ส. | ดูภาพรวม, อนุมัติ, Export, ตั้งค่าระบบ |
| Treasury Manager | K. รดา ม. | จัดการ Cash, Upload Bank Statement, Forecast |
| Accountant | K. ธนวรรธน์ ค. | บันทึก GL, Import ข้อมูลบัญชี |
| Approver | K. พิชญา ต. | ตรวจสอบ, อนุมัติรายการ |
| Viewer (Audit) | K. สุทธิพงศ์ บ. | ดูข้อมูลอย่างเดียว |

---

## Journey 1: CFO — Daily Morning Review (ทุกวันทำการ)

```
เวลา 08:00
    │
    ▼
[1] เปิดแอป → Dashboard (CONSO)
    Goal: เช็กยอดเงินสดรวมกลุ่มเช้า
    Action: ดู KPI Grid → Total Cash / Net CF Q1
    │
    ▼
[2] ดู Trend Chart → toggle "วัน" (30 วันล่าสุด)
    Goal: ดูความผันผวนรายวัน
    Action: compare inflow vs outflow ล่าสุด
    │
    ▼
[3] ดู Recent Transactions → scan สถานะ "Review"
    Goal: รายการที่ต้องตรวจสอบ
    Action: ถ้ามี Review → แจ้ง Treasury Manager
    │
    ▼
[4] ไป Forecast → Scenario "Base"
    Goal: เช็ก Minimum Balance 8 สัปดาห์
    Action: ดู KPI "ยอดต่ำสุดในช่วง"
    Pain Point: Opening balance hardcoded — ควร live
    │
    ▼
[5] ถ้าสถานะไม่ดี → ไป CF Report (Indirect)
    Goal: วิเคราะห์ Operating CF vs Working Capital
    Action: Tab 2 WC Reconcile → ดู AR CF Impact
    │
    ▼
[6] Export Report เพื่อ Board Meeting
    Goal: ได้ไฟล์ Excel งบ CF
    Action: Export Center → Indirect CF → ไตรมาสนี้ → Export
    Outcome: ไฟล์ .xlsx 7 sheets
    │
    ▼
เสร็จสิ้น (ใช้เวลาประมาณ 15–20 นาที)
```

**Touchpoints:** Dashboard → Forecast → Indirect CF → Export Center

**Pain Points:**
- ต้องเลือก Company ด้วยตนเอง ไม่มี default to last selected
- Opening balance Forecast ต้อง hardcode

---

## Journey 2: Treasury Manager — รับ Bank Statement และ Reconcile (รายสัปดาห์)

```
ทุกวันจันทร์เช้า
    │
    ▼
[1] Finance Input → Tab "บัญชีธนาคาร"
    Goal: เช็กยอดคงเหลือทุกบัญชี
    Action: ดู balance 7 บัญชี
    │
    ▼
[2] นำเข้า Bank Statement (ปุ่ม Upload)
    Goal: อัพเดตรายการเดินบัญชีสัปดาห์ที่ผ่านมา
    Action: UploadModal → เลือกไฟล์ Excel → Import
    Outcome: "นำเข้า 184 รายการสำเร็จ"
    │
    ▼
[3] Tab "เงินรับ" → กรอง "Pending"
    Goal: ตรวจสอบรายการที่ยังไม่ match
    Action: ค้นหา + ตรวจแต่ละรายการ
    │
    ▼
[4] Tab "Reconcile AR"
    Goal: กระทบยอด AR ระหว่าง Bank vs GL
    Action: ดูรายการที่ยังค้างชำระ
    │
    ▼
[5] ไป CF Report Direct → Tab 4 กระทบยอดเงินสด
    Goal: ตรวจว่า CF Closing ตรงกับ Bank หรือไม่
    Action: ดู "✓ ยอดตรง" หรือ "⚠ มีผลต่าง"
    Outcome: ถ้าผลต่าง > 1M → ต้องหาสาเหตุ
    │
    ▼
[6] รายงานให้ CFO → Export Summary
    Action: Export Center → Direct CF → เดือนนี้
    │
    ▼
เสร็จสิ้น (ใช้เวลาประมาณ 30–45 นาที)
```

**Touchpoints:** Finance Input → CF Report (Tab 4) → Export Center

**Pain Points:**
- ต้องสลับ tab หลายครั้งเพื่อดูข้อมูลที่เชื่อมกัน
- ไม่มีการแจ้งเตือนอัตโนมัติเมื่อ reconcile ไม่สมดุล

---

## Journey 3: Accountant — Import GL จาก Business Central (รายเดือน)

```
ทุกสิ้นเดือน
    │
    ▼
[1] Accounting Input → Tab "Trial Balance"
    Goal: Import GL ล่าสุดจาก Business Central
    Action: ปุ่ม "นำเข้าจากระบบบัญชี" → ImportLedgerModal
    Action: เลือกไฟล์ Excel BC → Import
    Outcome: "นำเข้า GL สำเร็จ X,XXX รายการ"
    │
    ▼
[2] ดู GL Summary
    Goal: ตรวจสอบ Debit = Credit (Balanced)
    Action: ดูยอดรวม Debit vs Credit ท้ายตาราง
    │
    ▼
[3] Tab "ลูกหนี้ (AR)"
    Goal: อัพเดต AR Aging ประจำเดือน
    Action: ดู aging bucket + รายการ Over 90 วัน
    │
    ▼
[4] Tab "เจ้าหนี้ (AP)"
    Goal: ดู AP ที่ต้องชำระในเดือนหน้า
    Action: ดู Next Due Date ของแต่ละ Vendor
    │
    ▼
[5] ไป CF Report Indirect → Tab 0
    Goal: ตรวจว่า CF คำนวณถูกต้องตาม GL ใหม่
    Action: ดูค่า "กำไรก่อนภาษีเงินได้" ตรงกับ GL หรือไม่
    │
    ▼
[6] Tab 2 WC Reconcile
    Goal: ตรวจสอบ AR/AP reconcile ถูกต้อง
    Action: ดู CF impact ของ AR/AP ตรงกับ TB
    │
    ▼
เสร็จสิ้น (ใช้เวลาประมาณ 1–2 ชั่วโมง)
```

**Touchpoints:** Accounting Input → CF Report Indirect (Tab 0, 2)

**Pain Points:**
- ไม่มี Validation แจ้งว่า Trial Balance สมดุลหรือไม่
- ต้อง Manual compare GL กับ CF Statement

---

## Journey 4: Viewer / Internal Auditor — Quarterly Audit Review

```
ปลายไตรมาส
    │
    ▼
[1] Dashboard → CONSO → Q1
    Goal: ดูภาพรวม Cash position
    Action: ดู KPI 4 ตัว + Trend
    │
    ▼
[2] CF Report Direct → Tab 0 (Full Statement)
    Goal: ตรวจสอบตัวเลขงบ CF
    Action: อ่าน 3 sections + Opening/Closing
    │
    ▼
[3] Tab 4 — กระทบยอดเงินสดปลายงวด
    Goal: ตรวจว่า CF ตรงกับ Bank Statement
    Action: ดู Reconcile status + ผลต่าง
    │
    ▼
[4] Tab 5 — Cross-validation
    Goal: ตรวจสอบ CF สอดคล้องกับ FS
    Action: ดู check list validation
    │
    ▼
[5] CF Report Indirect → Tab 3 Direct vs Indirect
    Goal: ตรวจว่า 2 วิธีให้ผลเหมือนกัน
    Action: ดู Difference = 0
    │
    ▼
[6] Export Report เพื่อ Audit File
    Action: Export Center → ดาวน์โหลดประวัติ
    │
    ▼
เสร็จสิ้น
```

**Touchpoints:** Dashboard → Direct CF → Indirect CF → Export Center

---

## Journey 5: CFO — ประชุม Board (Monthly)

```
ก่อนวันประชุม
    │
    ▼
[1] CF Report Indirect → Tab 0
    Goal: เตรียม Talking Points
    Action: screenshot / note ตัวเลขสำคัญ
    │
    ▼
[2] Tab 1 CF แยก Segment
    Goal: ดู performance แต่ละ entity
    Action: compare HMW vs CLIK vs ACG Net CF
    │
    ▼
[3] Forecast → Scenario analysis
    Goal: แสดง Bull/Bear/Base ให้ Board
    Action: toggle 3 scenarios + export
    │
    ▼
[4] Export Center → สร้าง Board Pack
    Action: Export Indirect CF + Forecast + AR Aging
    Output: 3 ไฟล์ Excel พร้อม Pivot tables
    │
    ▼
วันประชุม
    │
    ▼
[5] นำ Excel เปิดใน Board Meeting
    Note: ระบบยังไม่มี Presentation mode
```

**Pain Points:**
- ต้อง Export ทีละไฟล์ (ไม่มี Bulk Export)
- ไม่มี Executive Summary slide
- ระบบไม่มี Presentation mode

---

## Journey Map Summary

```
                 Dashboard → Finance Input → Accounting Input → CF Report → Forecast → Export → Settings
CFO              ██████████    ○○○○○○○○○○    ○○○○○○○○○○○○○○    ██████████   ████████   ████████   ████████
Treasury Manager ██████████    ██████████    ○○○○○○○○○○○○○○    ██████████   ████████   ████████   ○○○○○○○○
Accountant       ████████○○    ○○○○○○○○○○    ██████████████    ████████○○   ○○○○○○○○   ○○○○○○○○   ████████
Approver         ██████████    ████████○○    ○○○○○○○○○○○○○○    ████████○○   ○○○○○○○○   ████████   ○○○○○○○○
Viewer/Audit     ████████○○    ○○○○○○○○○○    ○○○○○○○○○○○○○○    ██████████   ○○○○○○○○   ████████   ○○○○○○○○

████ = ใช้งานหลัก  ○○○○ = ไม่ใช้
```

---

## System Entry Points

| Entry Point | Route | First Screen |
|-------------|-------|-------------|
| เปิดแอปครั้งแรก | / หรือ index.html | Dashboard (CONSO, Q1 default) |
| กลับจาก session ก่อน | localStorage tweaks | Dashboard + last tweaks |
| Direct link (ถ้ามี) | N/A (SPA ไม่มี URL routing ขณะนี้) | Dashboard เสมอ |

**หมายเหตุ:** ระบบปัจจุบันไม่มี Authentication — ทุกคนที่เปิด URL เข้าได้ทันที ควรเพิ่มในอนาคต
