# System Architecture Map
# แผนที่สถาปัตยกรรมระบบ Cashflow Automation

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## A. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                   CASHFLOW AUTOMATION SYSTEM                        │
│                        (Single-Page App)                            │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend Layer (React SPA — bundle.html)                           │
│  ┌─────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │  nav.jsx│ │ dashboard.jsx│ │finance-input │ │accounting-    │  │
│  │ Sidebar │ │   Dashboard  │ │    .jsx      │ │ input.jsx     │  │
│  │ Topbar  │ │  KPI Cards   │ │Finance Input │ │Accounting In. │  │
│  └─────────┘ └──────────────┘ └──────────────┘ └───────────────┘  │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│  │       reports.jsx        │  │       other-screens.jsx          │ │
│  │  Direct CF Report        │  │  Forecast | Reconciliation       │ │
│  │  Indirect CF Report      │  │  Export Center | Settings        │ │
│  └──────────────────────────┘  └──────────────────────────────────┘ │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────────┐  │
│  │   charts.jsx │  │tweaks-panel.jsx│  │       icons.jsx         │  │
│  │  TrendChart  │  │  UI Tweaks    │  │  Icon Library (SVG)     │  │
│  │  ForecastChart│  │  Theme Config │  │                         │  │
│  └──────────────┘  └───────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  Data Layer                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │       data.js           │  │     data-sample-2025.js         │  │
│  │  window.CFData (Mock)   │  │  ACG FS Data (Real 2025)        │  │
│  │  - Companies (4)        │  │  Verified to the baht           │  │
│  │  - Bank Accounts (7)    │  └─────────────────────────────────┘  │
│  │  - Transactions (18+)   │                                        │
│  │  - AR/AP Aging          │                                        │
│  │  - Direct CF (9 lines)  │                                        │
│  │  - Indirect CF (14 lines)│                                       │
│  │  - CF Mapping (22 rules)│                                        │
│  │  - GL Accounts (21)     │                                        │
│  │  - Forecast (8 weeks)   │                                        │
│  └─────────────────────────┘                                        │
├─────────────────────────────────────────────────────────────────────┤
│  Server Layer                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   server.js      │  │  app.py          │  │  vercel.json    │  │
│  │  Node.js Express │  │  Python Flask    │  │  Vercel Deploy  │  │
│  │  Static Serving  │  │  (Experimental)  │  │  Config         │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  External Data Sources (Integration Layer)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  Business Central│  │   Bank Statement │  │  Finance Stmt.  │  │
│  │  GL Import       │  │  Excel/CSV Upload│  │  Excel Files    │  │
│  │  (Implemented)   │  │  (Implemented)   │  │  (Parsed)       │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  FlowAccount     │  │   Power BI       │  │  LINE Notify    │  │
│  │  (Pending Setup) │  │   (API Connected)│  │  (Pending)      │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## B. Navigation Map

```
CashFlow App
│
├── [ภาพรวม]
│   └── Dashboard (dashboard.jsx)
│       ├── KPI Grid (4 cards)
│       ├── Trend Chart (Monthly/Daily toggle)
│       ├── Bank Accounts Panel
│       ├── Top Inflow Categories (BarList)
│       ├── Top Outflow Categories (BarList)
│       └── Recent Transactions Table
│
├── [บันทึกข้อมูล]
│   ├── ข้อมูลทางการเงิน (finance-input.jsx)
│   │   ├── Tab: บัญชีธนาคาร
│   │   ├── Tab: เงินรับ (Receipts)
│   │   ├── Tab: เงินจ่าย (Payments)
│   │   ├── Tab: AP HONDA Payment
│   │   ├── Tab: PN Payment
│   │   ├── Tab: Reconcile AR
│   │   └── Tab: Reconcile AP
│   │
│   └── ข้อมูลทางบัญชี (accounting-input.jsx)
│       ├── Tab: Trial Balance (GL)
│       ├── Tab: ลูกหนี้ (AR)
│       ├── Tab: เจ้าหนี้ (AP)
│       └── Tab: สินค้าคงเหลือ
│
├── [งบกระแสเงินสด]
│   ├── วิธีตรง — Direct Method (reports.jsx)
│   │   ├── Tab 0: งบกระแสเงินสด (หลัก)
│   │   ├── Tab 1: CF แยก Segment
│   │   ├── Tab 2: Working Capital กระทบยอด
│   │   ├── Tab 3: เปรียบเทียบ Direct vs Indirect
│   │   ├── Tab 4: กระทบยอดเงินสดปลายงวด
│   │   └── Tab 5: Cross-validation Panel
│   │
│   ├── วิธีอ้อม — Indirect Method (reports.jsx)
│   │   └── (แท็บเหมือน Direct Method ทั้ง 6 แท็บ)
│   │
│   └── Forecast (other-screens.jsx)
│       ├── Scenario Selector (Bear/Base/Bull)
│       ├── KPI Cards (4)
│       ├── Forecast Chart (8 weeks)
│       └── Forecast Table
│
└── [อื่นๆ]
    ├── Export Center (other-screens.jsx)
    │   ├── Quick Export Cards (4)
    │   └── Export History Table
    │
    └── Settings (other-screens.jsx)
        ├── Tab: CF Mapping
        ├── Tab: GL Accounts
        ├── Tab: บริษัท & ผู้ใช้
        └── Tab: การเชื่อมต่อ
```

---

## C. Component Dependency Map

```
app.jsx (Root)
├── nav.jsx
│   ├── Sidebar (NAV config)
│   └── Topbar (Period Selector, Company Selector)
│
├── dashboard.jsx
│   ├── Kpi (×4)
│   ├── TrendChart ← charts.jsx
│   ├── Sparkline ← charts.jsx
│   └── BarList
│
├── finance-input.jsx
│   ├── BankTab
│   ├── ReceiptsTab
│   ├── PaymentsTab
│   ├── APHondaTab
│   ├── PNPaymentTab
│   ├── ReconcileARTab
│   ├── ReconcileAPTab
│   ├── AddTxnModal
│   └── UploadModal
│
├── accounting-input.jsx
│   ├── GLTab (+ Business Central import)
│   ├── ARTab (+ ARAgingRow drill-down)
│   ├── APTab (+ APAgingRow drill-down)
│   ├── InvTab
│   └── ImportLedgerModal
│
├── reports.jsx (shared by Direct & Indirect)
│   ├── ReportPage (method="direct"|"indirect")
│   │   ├── CashFlowStatement (Tab 0)
│   │   ├── SegmentCFTab (Tab 1)
│   │   ├── WCReconcileTab (Tab 2)
│   │   ├── CompareMethodsTab (Tab 3)
│   │   ├── CashEndReconcileTab (Tab 4)
│   │   └── CrossValidationTab (Tab 5)
│   └── SegmentCFCard
│
├── other-screens.jsx
│   ├── Forecast + ForecastChart ← charts.jsx
│   ├── Reconciliation
│   ├── ExportCenter
│   └── Settings
│       ├── CFMappingTab
│       ├── GL Accounts Tab
│       ├── Company & Users Tab
│       └── Integrations Tab
│
├── tweaks-panel.jsx
│   ├── TweaksPanel
│   ├── TweakSection
│   ├── TweakColor
│   ├── TweakRadio
│   └── TweakSlider
│
└── data.js (window.CFData)
    ├── company info
    ├── companies[] (CONSO, ACG, HMW, CLIK)
    ├── bankAccounts[]
    ├── recentTxns[]
    ├── arAging[] / apAging[]
    ├── directCF / indirectCF
    ├── cfMapping{}
    ├── glAccounts[]
    └── forecast[]
```

---

## D. Data Flow Diagram

```
[External Sources]              [Import Layer]              [Data Layer]
Business Central  ──────────►  ImportLedgerModal  ──────►  window.glImported
Bank Statement    ──────────►  UploadModal        ──────►  CFData.recentTxns
Excel Finance Stmt ─────────►  scripts/xlsx_to_csv ─────►  data-sample-2025.js

[Data Layer]                   [Calculation Engine]         [Display Layer]
window.CFData  ─────────────►  getCompanyTotals()  ──────►  Dashboard KPIs
               ─────────────►  directCF / indirectCF ────►  ReportPage
               ─────────────►  buildSegmentCF()    ──────►  SegmentCFTab
               ─────────────►  reconcileAR/AP      ──────►  WCReconcileTab
               ─────────────►  forecast[]          ──────►  ForecastChart
               ─────────────►  cfMapping{}         ──────►  Settings/CFMap

[User Actions]                 [State Management]           [Output]
Period Selector  ───────────►  React.useState(period) ───►  All screens filter by period
Company Selector ───────────►  React.useState(companyId) ►  All screens filter by company
Export Button    ───────────►  ExportModal (3-step)  ─────►  .xlsx download (simulated)
```

---

## E. Tech Stack Summary

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| Frontend Framework | React | 18.x (CDN) |
| UI Rendering | ReactDOM | 18.x |
| Styling | Custom CSS (styles.css) | CSS Variables + BEM-like |
| Charts | Custom SVG (no library) | TrendChart, ForecastChart, Sparkline |
| Data | Mock JS (window.CFData) | ไม่มี DB จริง — MVP phase |
| Server (Node) | Express.js | server.js — static serving |
| Server (Python) | Flask (app.py) | Experimental — ยังไม่ fully used |
| Build | Bundle HTML | bundle-head/tail merging |
| Deploy | Vercel | vercel.json configured |
| Source Control | Git | main branch |
| Currency | THB (บาทไทย) | Raw baht; helpers format display |

---

## F. Company Structure

```
กลุ่มบริษัท (CONSO — Consolidated)
├── ACG Holding (บริหารจัดการกลุ่ม)
│   ├── รายได้: ค่าบริหารจัดการ HMW + CLIK + อื่นๆ
│   └── บัญชีธนาคาร: BA-001, BA-004, BA-005
│
├── HMW (ตัวแทนจำหน่าย Honda + บริการ)
│   ├── รายได้: HONDA, ตอกเข็ม, ประกัน, ไฟแนนซ์, รถเช่า, รถส่ง
│   └── บัญชีธนาคาร: BA-002, BA-003
│
└── CLIK (ธุรกิจบริการ)
    ├── รายได้: Service, อื่นๆ
    └── บัญชีธนาคาร: BA-006, BA-007
```

---

## G. Period / Fiscal Configuration

| ค่า | ความหมาย |
|-----|----------|
| `CF_PERIOD_DEFAULT` | `"2026-Q1"` |
| `CF_PERIODS` | Array ของ quarters/months ที่เลือกได้ |
| งวดที่แสดงผล | ไตรมาส 1/2569 (ม.ค.–มี.ค. 2569) |
| ประวัติ trend | ต.ค. 68 – มี.ค. 69 (6 เดือน) |
| Forecast | 8 สัปดาห์ (เม.ย. 2569 เป็นต้นไป) |
