# Module Specification
# รายละเอียดข้อกำหนดโมดูลระบบ Cashflow Automation

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## Module 1: Dashboard Module

### 1. Module Name
Dashboard Module (`src/dashboard.jsx`)

### 2. Business Purpose
แสดงภาพรวมสถานะเงินสดของทั้งกลุ่มบริษัทแบบ Real-time ให้ผู้บริหารตัดสินใจได้รวดเร็ว โดยรวมข้อมูลจากทุก entity (ACG, HMW, CLIK) และกรองตาม Company/Period ที่เลือก

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | ดูข้อมูลทุก entity, Export |
| Treasury Manager | ดูข้อมูลทุก entity |
| Manager | ดูข้อมูลเฉพาะหน่วยงานตน |
| Viewer | ดูอย่างเดียว |

### 4. Inputs
- `companyId` — เลือกจาก Topbar (CONSO / ACG / HMW / CLIK)
- `period` — เลือกจาก Topbar (Quarter/Month)
- `chartStyle` — กำหนดจาก Tweaks Panel (line / area / bar)
- `CFData` — ข้อมูล Mock จาก data.js

### 5. Outputs
| Output | รายละเอียด |
|--------|-----------|
| KPI Grid (4 cards) | ยอดเงินสดคงเหลือ, กระแสเงินสดรับ Q1, กระแสเงินสดจ่าย Q1, สุทธิ Q1 |
| Trend Chart | กราฟรายเดือน/รายวัน (inflow vs outflow) |
| Bank Accounts Panel | ยอดคงเหลือ 7 บัญชี + ชื่อธนาคาร |
| Top Inflow / Outflow | Bar list 5 รายการต้น |
| Recent Transactions | ตาราง 8 รายการล่าสุด พร้อม status |

### 6. KPIs
- ยอดเงินสดคงเหลือรวม (Total Cash)
- กระแสเงินสดรับ Q1 + % YoY
- กระแสเงินสดจ่าย Q1 + % YoY
- กระแสเงินสดสุทธิ + อัตรา CF Margin
- Sparkline ย้อนหลัง 6 เดือน (ทุก KPI)

### 7. Related Screens
- Finance Input (เพิ่มรายการธุรกรรม)
- Direct/Indirect CF Report (งบกระแสเงินสด)
- Export Modal (ดาวน์โหลด)

### 8. Dependencies
- `window.CFData.getCompanyTotals(companyId)` — คำนวณยอดรวม
- `window.CFData.bankAccounts` — แสดงบัญชีธนาคาร
- `window.CFData.recentTxns` — แสดงรายการล่าสุด
- `charts.jsx` — TrendChart, Sparkline
- `window.fmtTHB()` — format ตัวเลข

---

## Module 2: Finance Input Module

### 1. Module Name
Finance Input Module (`src/finance-input.jsx`)

### 2. Business Purpose
บันทึกและจัดการข้อมูลทางการเงิน ได้แก่ รายการเงินรับ-จ่ายจริงจากธนาคาร รายการชำระ AP Honda รายการ PN Payment และกระทบยอด AR/AP ระหว่างบัญชีธนาคารกับสมุดบัญชี

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | อ่าน, เพิ่ม, แก้ไข, Export, Upload |
| Treasury Manager | อ่าน, เพิ่ม, แก้ไข, Export, Upload |
| Accountant | อ่าน, เพิ่ม |
| Viewer | อ่านอย่างเดียว |

### 4. Inputs
- Bank Statement (Excel/CSV upload)
- Manual entry ผ่าน AddTxnModal
- `companyId` filter
- Search text, Account filter, Date range filter, Status filter

### 5. Outputs
| Tab | Output |
|-----|--------|
| บัญชีธนาคาร | ตาราง 7 บัญชี + ยอดคงเหลือ |
| เงินรับ (Receipts) | รายการเงินเข้า + status matching |
| เงินจ่าย (Payments) | รายการเงินออก + breakdown by segment |
| AP HONDA Payment | รายการจ่ายชำระ Honda |
| PN Payment | รายการ Promissory Note |
| Reconcile AR | กระทบยอดลูกหนี้ vs ธนาคาร |
| Reconcile AP | กระทบยอดเจ้าหนี้ vs ธนาคาร |

### 6. KPIs
- จำนวนรายการ Matched vs Pending vs Review
- ยอดรวมเงินรับ / เงินจ่าย ตามช่วงเวลา
- ผลต่างกระทบยอด AR/AP

### 7. Related Screens
- Dashboard (แสดงรายการล่าสุด)
- Accounting Input (GL reconcile)
- Settings → GL Accounts (account mapping)

### 8. Dependencies
- `window.CFData.bankAccounts` — รายชื่อบัญชี
- `window.CFData.recentTxns` — ข้อมูลรายการ
- `window.CFData.arAging` / `apAging` — ข้อมูล aging
- `window.CF_STATUS.TXN` — status constants (MATCHED/PENDING/REVIEW/VOID)
- `window.fmtTHB()` — format ตัวเลข

---

## Module 3: Accounting Input Module

### 1. Module Name
Accounting Input Module (`src/accounting-input.jsx`)

### 2. Business Purpose
นำเข้าและแสดงข้อมูลทางบัญชี ได้แก่ GL Journal (Trial Balance), ลูกหนี้การค้า, เจ้าหนี้การค้า และสินค้าคงเหลือ รองรับการ Import โดยตรงจาก Business Central (Microsoft ERP)

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | Import, อ่าน, แก้ไข |
| Treasury Manager | อ่าน |
| Accountant | Import, อ่าน, แก้ไข |
| Viewer | อ่านอย่างเดียว |

### 4. Inputs
- Import GL จาก Business Central (Excel format)
- Manual entry
- `companyId` filter
- Search text (GL code, description)

### 5. Outputs
| Tab | Output |
|-----|--------|
| Trial Balance | GL Account summary (debit/credit/net) |
| ลูกหนี้ (AR) | AR Aging table + drill-down by segment |
| เจ้าหนี้ (AP) | AP Aging table + due date |
| สินค้าคงเหลือ | Inventory balance by category |

### 6. KPIs
- ยอดรวม Debit vs Credit (Trial Balance balanced?)
- ยอดลูกหนี้คงค้าง + Aging buckets (Current/30/60/90/over)
- ยอดเจ้าหนี้คงค้าง + Next Due Date
- มูลค่าสินค้าคงเหลือ

### 7. Related Screens
- Finance Input (Reconcile AR/AP)
- CF Reports → WC Reconcile Tab
- Settings → GL Accounts mapping

### 8. Dependencies
- `window.glImported` — GL data จาก Business Central
- `window.CFData.arAging` — ข้อมูล AR aging
- `window.CFData.apAging` — ข้อมูล AP aging
- `window.CFData.glAccounts` — Chart of Accounts
- ImportLedgerModal — UI import workflow

---

## Module 4: Cash Flow Report Module (Direct + Indirect)

### 1. Module Name
Cash Flow Report Module (`src/reports.jsx`)

### 2. Business Purpose
สร้างและแสดงงบกระแสเงินสดตามมาตรฐาน TAS 7 ทั้งแบบ Direct Method และ Indirect Method พร้อม Cross-validation, Segment analysis, Working Capital reconciliation และ Drill-down ระดับ segment

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | ดูทุก tab, Drill-down, Export |
| Treasury Manager | ดูทุก tab, Export |
| Manager | ดู Summary tab |
| Viewer | ดูอย่างเดียว |

### 4. Inputs
- `method` — "direct" หรือ "indirect"
- `period` — งวดที่เลือก
- `companyId` — บริษัทที่เลือก
- `chartStyle` — รูปแบบกราฟ
- `window.CFData.directCF` / `indirectCF` — ข้อมูลงบ CF
- `window.CFData.cfMapping` — CF line → segment mapping

### 5. Outputs
| Tab | Output |
|-----|--------|
| Tab 0: งบ CF | ตารางงบกระแสเงินสด 3 sections + opening/closing balance |
| Tab 1: CF แยก Segment | Cards per segment ทุก income line |
| Tab 2: WC กระทบยอด | AR/AP/Inventory reconcile table + CF impact |
| Tab 3: Direct vs Indirect | เปรียบเทียบ 2 วิธี side-by-side |
| Tab 4: กระทบยอดเงินสด | CF closing vs Bank total vs TB |
| Tab 5: Cross-validation | ตรวจสอบความสอดคล้อง CF + FS |

### 6. KPIs
- กระแสเงินสดจากกิจกรรมดำเนินงาน (Operating CF)
- กระแสเงินสดจากกิจกรรมลงทุน (Investing CF)
- กระแสเงินสดจากกิจกรรมจัดหาเงิน (Financing CF)
- เงินสดต้นงวด / ปลายงวด
- ผลต่าง Direct vs Indirect (ต้องเป็น 0)
- ผลต่าง CF vs ธนาคาร (ต้องเป็น 0 หรือ tolerance)

### 7. Related Screens
- Dashboard (ดูภาพรวม)
- Export Center (ดาวน์โหลด)
- Accounting Input (ข้อมูล GL/AR/AP)

### 8. Dependencies
- `window.CFData.directCF` / `indirectCF` — CF statement data
- `window.CFData.cfMapping` — segment drill-down rules
- `buildSegmentCF()` — คำนวณ CF per segment
- `window.CFData.reconcileAR/AP` — WC reconcile data
- `window.CFData.bankAccounts` — Bank total
- `window.getPeriodLabel(period)` — display period

---

## Module 5: Forecast Module

### 1. Module Name
Forecast Module (`src/other-screens.jsx` → `Forecast`)

### 2. Business Purpose
คาดการณ์กระแสเงินสด 4–26 สัปดาห์ข้างหน้า โดยใช้ข้อมูล AR/AP คำสั่งซื้อยืนยัน และ Forecast Sales รองรับการจำลอง 3 Scenario (Bear/Base/Bull)

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | ดู, ปรับ Scenario, Export |
| Treasury Manager | ดู, Export |
| Manager | ดู Base scenario |

### 4. Inputs
- `scenario` — Bear (–15%) / Base / Bull (+15%)
- Time range — 4 / 8 / 13 / 26 สัปดาห์
- `window.CFData.forecast` — weekly forecast data
- Opening balance (hardcoded: 469,220,000 บาท)

### 5. Outputs
- KPI Cards: ยอดสิ้นงวด, รับสุทธิรวม, จ่ายสุทธิรวม, ยอดต่ำสุด
- Forecast Chart (Bar + Line dual-axis)
- Forecast Table (รายสัปดาห์พร้อมหมายเหตุ)

### 6. KPIs
- Minimum cash balance ในช่วง (ระวัง Liquidity Risk)
- Maximum cash balance ในช่วง
- Net cash per week
- Cumulative balance trend

### 7. Related Screens
- Dashboard (ดูยอดปัจจุบัน)
- Finance Input (AR/AP ที่ใช้ forecast)
- Export Center (ดาวน์โหลด Forecast Report)

### 8. Dependencies
- `window.CFData.forecast` — weekly projection array
- `charts.jsx` → ForecastChart

---

## Module 6: Export Center Module

### 1. Module Name
Export Center Module (`src/other-screens.jsx` → `ExportCenter`)

### 2. Business Purpose
สร้างและจัดการ Export รายงาน Cash Flow ทุกประเภทในรูปแบบ Excel (.xlsx) และ PDF พร้อม Export History

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | สร้าง Export, ดาวน์โหลด, ลบประวัติ |
| Treasury Manager | สร้าง Export, ดาวน์โหลด |
| Accountant | สร้าง Export |
| Viewer | ดาวน์โหลดเท่านั้น |

### 4. Inputs
- รายงานที่ต้องการ: Direct CF / Indirect CF / Forecast / Bank / AR / AP
- งวด (period)
- รูปแบบ: Excel Formatted / Raw Data
- หน่วย: บาท / พันบาท / ล้านบาท
- Checkboxes: Summary / Sections / Notes / Supporting / Charts

### 5. Outputs
- ไฟล์ Excel (.xlsx) ประกอบด้วย sheets: Summary, Operating, Investing, Financing, Notes, Pivot-By Month, Raw Data (simulation)
- Export History Log

### 6. KPIs
- จำนวน Export ที่สำเร็จ
- ขนาดไฟล์ (~218 KB per file)

### 7. Related Screens
- Direct CF Report (ปุ่ม Export)
- Indirect CF Report (ปุ่ม Export)
- Dashboard (ปุ่ม Export Excel)

### 8. Dependencies
- `window.CFData.exports` — Export history
- ExportModal (3-step wizard: Config → Progress → Done)
- `window.CF_PERIODS` — period options

---

## Module 7: Settings Module

### 1. Module Name
Settings Module (`src/other-screens.jsx` → `Settings`)

### 2. Business Purpose
จัดการการตั้งค่าระบบทั้งหมด ได้แก่ CF Mapping (GL → CF line), GL Account list, ข้อมูลบริษัทและผู้ใช้งาน, และ Integration กับระบบภายนอก

### 3. User Roles
| Role | สิทธิ์ |
|------|--------|
| CFO / Admin | ดู, แก้ไขทุก tab |
| Treasury Manager | ดู CF Mapping, GL Accounts |
| Accountant | ดู, แก้ไข CF Mapping, GL |
| Viewer | ดูอย่างเดียว |

### 4. Inputs
| Tab | Input |
|-----|-------|
| CF Mapping | Upload Excel mapping file, แก้ไข per-line |
| GL Accounts | Auto-map, manual edit per GL code |
| บริษัท & ผู้ใช้ | Company info form, User table |
| การเชื่อมต่อ | Toggle on/off Integration cards |

### 5. Outputs
- CF Mapping table (22 lines → segment allocation)
- GL Account → CF Activity mapping
- Company registration info
- User list with roles
- Integration status dashboard

### 6. KPIs
- จำนวน GL accounts ที่ map แล้ว vs ยังไม่ได้ map
- Integration ที่ Active vs Pending
- Mapping version history

### 7. Related Screens
- CF Reports (ใช้ CF Mapping ในการ drill-down)
- Accounting Input (GL Accounts ที่ map)

### 8. Dependencies
- `window.CFData.cfMapping` — CF mapping object
- `window.CFData.glAccounts` — GL account list
- `window.CFData.company` — company info
- CFMappingTab component — upload & edit UI

---

## Module 8: Navigation & Layout Module

### 1. Module Name
Navigation & Layout Module (`src/nav.jsx` + `src/app.jsx`)

### 2. Business Purpose
จัดการ layout หลักของระบบ ประกอบด้วย Sidebar navigation, Topbar (breadcrumb, period selector, company selector), Toast notifications, Export Modal และ Tweaks Panel สำหรับ UI customization

### 3. User Roles
ทุก Role ใช้งานได้

### 4. Inputs
- User click บน Sidebar items
- Period selector (dropdown)
- Company selector (dropdown)
- Tweaks: accent color, chart style, sidebar position, density, font scale

### 5. Outputs
- Active screen rendering
- Breadcrumb navigation
- Toast notifications (3.2 วินาที)
- Themed UI (CSS variables)

### 6. KPIs
- N/A (UI/UX component)

### 7. Related Screens
- ทุก screen ผ่าน Layout นี้

### 8. Dependencies
- `window.CF_PERIODS` — period list
- `window.CFData.companies` — company list
- `window.useTweaks()` — persistent tweaks state
- `src/tweaks-panel.jsx` — UI control panel
