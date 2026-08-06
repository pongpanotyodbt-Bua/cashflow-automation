# Screen Documentation
# เอกสารรายละเอียดหน้าจอทุก Screen

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## Screen 1: Dashboard

### Purpose
แสดงภาพรวมสถานะเงินสดของบริษัทกลุ่ม ให้ผู้บริหารตัดสินใจได้ทันที

### Widgets / Components
| Component | รายละเอียด |
|-----------|-----------|
| KPI Card × 4 | ยอดเงินสดรวม, Cash In Q1, Cash Out Q1, Net CF Q1 + Sparkline |
| Trend Chart | Line/Area/Bar chart กระแสเงินสดรับ-จ่ายรายเดือน 6 เดือน |
| Toggle (Monthly/Daily) | สลับมุมมอง 6 เดือน / 30 วัน |
| Bank Accounts Panel | รายชื่อ 7 บัญชีธนาคาร + ยอดคงเหลือ |
| Top Inflow BarList | 5 หมวดหมู่เงินรับสูงสุด + % bar |
| Top Outflow BarList | 5 หมวดหมู่เงินจ่ายสูงสุด + % bar |
| Recent Txns Table | 8 รายการล่าสุด + status badge |

### Available Actions
- รีเฟรชข้อมูล (ปุ่ม)
- Export Excel (ปุ่ม → ExportModal)
- ดูทั้งหมด (บัญชีธนาคาร)
- Filter (รายการเดินบัญชี)
- Export (รายการเดินบัญชี)

### Filters
- Company (CONSO / ACG / HMW / CLIK) — Topbar
- Period (Quarter/Month) — Topbar
- View Toggle (เดือน / วัน) — ใน chart

### User Access
ทุก Role มีสิทธิ์ดู | CFO/Admin เท่านั้นที่ Export ได้

### Business Rules
1. KPI แสดง Q1 เสมอ (3 เดือนล่าสุดของ segmentMonths)
2. `getCompanyTotals(companyId)` กรองข้อมูลตาม entity
3. CONSO = รวมทุก entity แบบ sum
4. Sparkline ใช้ coMonthly 6 เดือนย้อนหลัง
5. Transaction status: matched (green), pending (yellow), review (red), void (grey)
6. ยอดเงิน format ด้วย `window.fmtTHB()` — ใช้ comma + ทศนิยม 0

---

## Screen 2: ข้อมูลทางการเงิน (Finance Input)

### Purpose
บันทึกรายการรับ-จ่ายจากธนาคาร และกระทบยอด AR/AP

### Widgets / Components
| Tab | Component |
|-----|-----------|
| บัญชีธนาคาร | ตาราง 7 บัญชี (bank, branch, no, balance, type, ccy) |
| เงินรับ | ตารางรายการ amount > 0 + status |
| เงินจ่าย | ตารางรายการ amount < 0 + segment chip |
| AP HONDA | ตารางรายการ AP Honda (Confidence: Medium — inferred from tab name) |
| PN Payment | ตารางรายการ Promissory Note (Confidence: Medium) |
| Reconcile AR | กระทบยอด AR ระหว่าง Bank vs GL |
| Reconcile AP | กระทบยอด AP ระหว่าง Bank vs GL |

### Available Actions
- นำเข้า Bank Statement (Upload Modal → parse Excel/CSV)
- เพิ่มรายการใหม่ (AddTxnModal)
- Export (CSV/Excel)
- Search ข้อความ
- Filter บัญชี / ช่วงเวลา / สถานะ

### Filters
- Company (จาก Topbar)
- บัญชีธนาคาร
- ช่วงเวลา: 30 วัน / ไตรมาส / เดือน / กำหนดเอง
- สถานะ: ทั้งหมด / Matched / Pending / Review
- Search text

### User Access
Finance User, Treasury Manager, CFO/Admin

### Business Rules
1. `matchEntity(r)` — กรอง CONSO = แสดงทุก entity
2. รายการ Matched = Bank + GL ตรงกัน (Auto-match หรือ Manual)
3. รายการ Pending = Bank มีแต่ GL ยังไม่บันทึก
4. รายการ Review = ยอดต่างกัน ต้องตรวจ
5. UploadModal แสดง "นำเข้า 184 รายการสำเร็จ" (simulation)

---

## Screen 3: ข้อมูลทางบัญชี (Accounting Input)

### Purpose
นำเข้าและจัดการข้อมูลบัญชี GL, AR, AP, Inventory

### Widgets / Components
| Tab | Component |
|-----|-----------|
| Trial Balance | GL summary: code, name, entries, debit, credit, net |
| ลูกหนี้ (AR) | AR Aging: customer, entity, total, current, 30/60/90/over |
| เจ้าหนี้ (AP) | AP Aging: vendor, entity, total + Next Due Date |
| สินค้าคงเหลือ | Inventory list by category |

### Available Actions
- นำเข้าจากระบบบัญชี (ImportLedgerModal → Business Central)
- เพิ่มรายการ Manual
- Export GL
- Search GL code/description
- ล้างข้อมูล GL ที่ import

### Filters
- Company (จาก Topbar)
- Search (GL Tab): รหัสหรือชื่อบัญชี

### User Access
Accounting User, CFO/Admin

### Business Rules
1. GL Import จาก Business Central: parse Excel → aggregate by GL account
2. แสดง Success banner + จำนวน accounts เมื่อ import สำเร็จ
3. AR Aging buckets: current / 1–30 / 31–60 / 61–90 / over 90 วัน
4. AR Over 90 วัน = แสดงสีแดง (risk alert)
5. AP Next Due Date ใช้วางแผนการชำระ

---

## Screen 4: งบกระแสเงินสด — วิธีตรง (Direct CF Report)

### Purpose
แสดงงบกระแสเงินสดแบบ Direct Method ตาม TAS 7 พร้อม Drill-down ระดับ Segment

### Widgets / Components

**Tab 0 — งบกระแสเงินสด (หลัก)**
| Component | รายละเอียด |
|-----------|-----------|
| Granularity Toggle | รายเดือน / รายไตรมาส / รายปี / รายวัน |
| CF Statement Table | 3 sections: Operating / Investing / Financing |
| Opening/Closing Balance | ต้นงวด + สุทธิ + ปลายงวด |
| Drill-down | คลิกแถวรายได้ → popup segment breakdown |
| Period Comparison | current vs prior (2 คอลัมน์) |
| Working Paper Link | ดาวน์โหลด Excel Working Paper |

**Tab 1 — CF แยก Segment**
- SegmentCFCard per income segment (เรียงตาม HMW, CLIK, ACG)
- Filter: ทุกบริษัท / HMW / CLIK / ACG
- แต่ละ card: Operating CF, Investing CF, Financing CF, Net CF + AR detail

**Tab 2 — Working Capital กระทบยอด**
- ReconcileTable AR: เปิดงวด + ยอดขาย − เก็บ = ปิดงวด → CF impact
- ReconcileTable AP: เปิดงวด + ซื้อ − จ่าย = ปิดงวด → CF impact
- Inventory Change table
- Accrued Expenses summary
- Total Working Capital CF

**Tab 3 — Direct vs Indirect Comparison**
- Side-by-side: Direct total vs Indirect total
- Difference check (ควรเป็น 0)
- WC detail tables (AR/AP)

**Tab 4 — กระทบยอดเงินสดปลายงวด**
- CF Bridge: Operating + Investing + Financing = Net
- Net + Opening = Closing (ตามงบ CF)
- เปรียบเทียบ: CF Closing vs Trial Balance (1010) vs Bank Total
- Status: ✓ ยอดตรง / ⚠ มีผลต่าง

**Tab 5 — Cross-validation Panel**
- ตรวจสอบความสอดคล้อง CF กับ Financial Statements
- Check list: Revenue vs CF, EBITDA bridge, balance sheet cash

### Available Actions
- เปลี่ยน Granularity
- Drill-down แถว (segment popup)
- Export Excel (→ ExportModal)
- ดาวน์โหลด Working Paper
- Expand/Collapse entity rows (WC tab)

### Filters
- Company (Topbar)
- Period (Topbar)
- Granularity: Monthly / Quarterly / Annual / Daily
- Entity filter (Tab 1)

### User Access
ทุก Role — CFO/Admin มีสิทธิ์ Export

### Business Rules
1. Direct Method: แสดงกระแสเงินสดรับ/จ่ายจริง (ไม่ใช่ accrual)
2. `buildSegmentCF()` — คำนวณ CF per segment ตาม cfMapping + income proportions
3. Tab ทั้งหมด ยกเว้น Tab 0 ไม่รองรับ Daily granularity → แสดง `DailyTabNotice`
4. AR เพิ่ม = CF ลด (ลูกค้ายังไม่จ่าย)
5. AP เพิ่ม = CF เพิ่ม (ยังไม่ได้จ่าย)
6. Working Paper download = ไฟล์ `/public/Working_Paper_WC_Drill_Down.xlsx`

---

## Screen 5: งบกระแสเงินสด — วิธีอ้อม (Indirect CF Report)

### Purpose
แสดงงบกระแสเงินสดแบบ Indirect Method ตาม TAS 7 เริ่มจากกำไรก่อนภาษี → ปรับด้วย Non-cash items + Working Capital

### Widgets / Components
เหมือน Direct CF Report ทุก Tab แต่ Tab 0 แสดง Indirect format:
- กำไรก่อนภาษีเงินได้
- บวกกลับ: ค่าเสื่อมราคา, หนี้สูญ, ผลแลกเปลี่ยน, ดอกเบี้ยจ่าย
- ปรับ WC: ลูกหนี้ ↑↓, สินค้า ↑↓, เจ้าหนี้ ↑↓, ค้างจ่าย ↑↓
- ดอกเบี้ยจ่าย / ภาษีจ่าย (หัก)

### Business Rules
1. ผลรวม Operating CF (Indirect) = Operating CF (Direct) — ต้องตรงกัน
2. Non-cash items บวกกลับ (ค่าเสื่อมราคา, หนี้สูญ)
3. เริ่มจาก Net Profit; ปรับ WC changes
4. กิจกรรมลงทุน + จัดหาเงิน = เหมือนกันทั้ง 2 วิธี

---

## Screen 6: Cash Flow Forecast

### Purpose
คาดการณ์กระแสเงินสดล่วงหน้า 4–26 สัปดาห์ + Scenario analysis

### Widgets / Components
| Component | รายละเอียด |
|-----------|-----------|
| Scenario Selector | Bear / Base / Bull toggle |
| Time Range | 4 / 8 / 13 / 26 สัปดาห์ |
| KPI Cards × 4 | ยอดสิ้นงวด, รับสุทธิ, จ่ายสุทธิ, ยอดต่ำสุด |
| Forecast Chart | Dual-axis: Bar (inflow/outflow) + Line (balance) |
| Forecast Table | สัปดาห์, ช่วงวันที่, รับ, จ่าย, สุทธิ, ยอดสะสม, หมายเหตุ |

### Available Actions
- เลือก Scenario
- เลือก Time Range
- สร้าง Forecast อัตโนมัติ (placeholder)
- Export

### Filters
- Scenario (Bear/Base/Bull)
- Time Range

### User Access
CFO/Admin, Treasury Manager, Manager (Base only)

### Business Rules
1. Bull = inflow × 1.15, Bear = inflow × 0.85, Base = ×1.0
2. Opening balance = 469,220,000 บาท (hardcoded — ควรดึงจาก DB)
3. Running balance สะสมจาก Net CF ทุกสัปดาห์
4. Min balance = ตัวชี้วัด Liquidity Risk

---

## Screen 7: Export Center

### Purpose
สร้าง Export รายงานทุกประเภทและดูประวัติ

### Widgets / Components
| Component | รายละเอียด |
|-----------|-----------|
| Quick Export Cards × 4 | Direct CF, Indirect CF, Forecast 13w, Aging |
| Export History Table | ประวัติ Export ก่อนหน้า + ดาวน์โหลด |

### Available Actions
- คลิก Quick Export Card → ExportModal
- ดาวน์โหลด Export ก่อนหน้า
- Search ประวัติ
- More options (ellipsis)

### ExportModal (3-Step Wizard)
| ขั้น | รายละเอียด |
|------|-----------|
| Step 1 | เลือก Report / Period / Format / Unit / Sections |
| Step 2 | Progress bar แสดง status (ดึงข้อมูล → format → pivot) |
| Step 3 | สำเร็จ + ปุ่มดาวน์โหลด |

### Business Rules
1. Export format: Excel Formatted / Raw Data
2. หน่วย: บาท / พันบาท / ล้านบาท
3. Sections: Summary / 3 Activities / Notes / Supporting / Charts
4. ไฟล์: 7 sheets (simulation), ~218 KB

---

## Screen 8: Settings

### Purpose
ตั้งค่าระบบ CF Mapping, GL, ผู้ใช้, Integration

### Widgets / Components

**Tab: CF Mapping**
| Component | รายละเอียด |
|-----------|-----------|
| CF Mapping Table | 22 line items → activity + segment allocation |
| Activity Filter | All / Operating / Investing / Financing |
| Upload History | ประวัติ mapping files 3 versions |
| Edit Dialog | แก้ไข per-line mapping |

**Tab: GL Accounts**
| Component | รายละเอียด |
|-----------|-----------|
| GL Table | code, name, type, CF Activity (dropdown), direction |
| Auto-map Button | map ทั้งหมดอัตโนมัติ |

**Tab: บริษัท & ผู้ใช้**
| Component | รายละเอียด |
|-----------|-----------|
| Company Form | ชื่อ, รหัส, สกุลเงิน, รอบบัญชี, เลขภาษี, ที่อยู่ |
| User Table | 5 users: ชื่อ, อีเมล, Role, หน่วยงาน, เข้าใช้ล่าสุด |

**Tab: การเชื่อมต่อ**
| Integration | Status |
|-------------|--------|
| ERP ภายใน | Active (1,420 รายการ/วัน) |
| Bank Connectivity | Active (5 บัญชี) |
| FlowAccount | Pending (ยังไม่ตั้งค่า API Key) |
| Power BI | Active (API connected) |
| Email Notification | Active (SMTP) |
| LINE Notify | Pending (ต้องการ Token) |

### Business Rules
1. CF Mapping มี 3 version history (active + 2 archived)
2. GL Account types: Asset / Liability / Equity / Revenue / Expense
3. CF Activity options: ดำเนินงาน / ลงทุน / จัดหาเงิน / ปรับปรุง (Non-cash) / ไม่ใช่กระแสเงินสด
4. เปลี่ยน mapping จะ reactive update ทุก CF Report ทันที

---

## Screen 9: Reconciliation (Hidden/Accessible เฉพาะผู้ที่รู้)

### Purpose
จับคู่รายการระหว่างบัญชีธนาคารและสมุดบัญชี GL

**หมายเหตุ:** Screen นี้ถูก implement ใน `other-screens.jsx` (`Reconciliation` component) แต่ **ไม่ถูก link จาก Sidebar** ปัจจุบัน — อาจเป็น Feature ที่ซ่อนอยู่หรือยังไม่ deploy

### Widgets / Components
- KPI: รายการทั้งหมด, Matched, ต้องตรวจ, ผลต่างคงเหลือ
- Filter: ทั้งหมด / ต้องตรวจ / Matched
- Reconciliation Table: Bank side | GL side | Status | Actions

### Business Rules
- Status: Matched / Bank Only / GL Only / Review
- Run Auto-match (placeholder)
- Manual match ผ่าน "จับคู่" button

---

## Global UI Elements

### Topbar (ทุก Screen)
| Element | รายละเอียด |
|---------|-----------|
| Breadcrumb | Company short / Section / Screen |
| Search Input | ค้นหา รายการ / บัญชี / ลูกค้า |
| Company Selector | CONSO / ACG / HMW / CLIK |
| Period Selector | Quarter/Month list |
| Bell Notification | Icon (placeholder) |

### Sidebar
| Element | รายละเอียด |
|---------|-----------|
| Logo & Brand | ฿ + CashFlow + entity sub |
| Navigation Groups | 4 groups: ภาพรวม / บันทึกข้อมูล / งบ CF / อื่นๆ |
| Badge | Finance: 12, Accounting: 8 (hardcoded) |
| User Avatar | K. ปริญญา ส. — CFO Office |

### Toast Notifications
- แสดง 3.2 วินาที ที่มุมล่างขวา
- Trigger: บันทึก, Import, Export, ยืนยัน

### Tweaks Panel (Dev/Config)
- สี Accent (4 presets)
- Chart Style (Line/Area/Bar)
- Sidebar Position (Left/Right)
- Density (Compact/Default/Roomy)
- Font Scale (0.85x – 1.2x)
