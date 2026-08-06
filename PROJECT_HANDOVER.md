# PROJECT_HANDOVER.md
# Cashflow Management System — Quick Context for New Agent / Developer
# อัปเดต: 2026-06-05 | อ่านไฟล์นี้ก่อนทุกครั้งที่รับงาน

---

## TL;DR — อ่าน 2 นาทีรู้ทุกอย่าง

> ระบบนี้คือ **High-Quality Frontend Prototype** ที่ Logic ครบแล้ว แต่ยังไม่มี Backend  
> ข้อมูลทั้งหมดอยู่ใน JavaScript Memory → **หายทุกครั้งที่ Refresh**  
> งานที่ต้องทำต่อ: **สร้าง Backend + Database + Authentication**

```
สิ่งที่มี ✅              สิ่งที่ขาด ❌
──────────────────        ──────────────────
Frontend UI (100%)        Backend API
Cash Flow Logic           PostgreSQL Database
Direct Method             Authentication / Login
Indirect Method (TAS 7)   Role-Based Access
Dashboard + Charts        Audit Trail
8-Week Forecast           Excel Upload Processing (Logic)
Export PDF + Excel        ERP Integration
Sample Data (verified)    Automated Tests
Excel Templates (12 ไฟล์)
```

---

## กลุ่มบริษัท

| รหัส | ชื่อ | ประเภท |
|------|------|--------|
| ACG | Autocorp Holding | Holding Company (บริษัทแม่) |
| HMW | Honda Maliwan | ตัวแทนจำหน่ายรถยนต์ Honda |
| CLIK | Autoclick | ธุรกิจบริการและซ่อมบำรุง |
| CONSO | Group Consolidated | มุมมองรวมกลุ่ม |

---

## สถาปัตยกรรมปัจจุบัน

```
Browser
  └── React 18 (CDN — ไม่ใช่ Next.js จริง แม้ package.json จะระบุ)
        ├── src/app.jsx             ← App orchestration
        ├── src/dashboard.jsx       ← KPI + Charts
        ├── src/finance-input.jsx   ← Finance data entry (7 tabs)
        ├── src/accounting-input.jsx ← Accounting data entry (4 tabs)
        ├── src/reports.jsx         ← CF Reports (5 tabs)
        ├── src/other-screens.jsx   ← Forecast, Export, Settings
        ├── src/data.js             ← Mock Data (แทน Database) ← ต้องแทนด้วย API
        └── src/data-sample-2025.js ← ข้อมูล ACG จริง Q1/2569

Hosting: Vercel Static (bundle.html) → auto-deploy จาก GitHub
Live URL: https://cashflow-management-alpha.vercel.app
```

**⚠️ package.json มี Next.js แต่ระบบไม่ได้ใช้ Next.js จริง** — ยังเป็น React CDN

---

## Cash Flow Logic (สิ่งที่ระบบคำนวณ)

มาตรฐาน: **TAS 7** (= IAS 7) — 3 Activities

```
Operating (O)  → O1:พนักงาน O2:สินค้า O3:จ้างเหมา O4:ค่าเช่า O5:ภาษี O6:อื่นๆ
Investing  (I) → I1:ซื้อ/ขายสินทรัพย์, Capex
Financing  (F) → F1:เงินกู้, ดอกเบี้ย, Lease Payment
```

**Direct Method**: Cash In - Cash Out จริงๆ  
**Indirect Method**: Net Profit ± Depreciation ± Working Capital Changes  
**ทั้งสอง Method ต้องได้ผลลัพธ์ Operating CF เท่ากัน** (Cross-Validation Panel ตรวจแล้ว)

---

## Data Layer ปัจจุบัน (`src/data.js`)

```javascript
// โครงสร้างหลัก — ต้องแทนด้วย API calls ทั้งหมด
window.CFData = {
  companies: [CONSO, ACG, HMW, CLIK],
  bankAccounts: [...],   // 7 บัญชีธนาคาร
  arAging: [...],        // ลูกหนี้ aging
  apAging: [...],        // เจ้าหนี้ aging
  glAccounts: [...],     // 21 บัญชีหลัก
  cfMapping: {...},      // GL Account → CF Activity
  getIncomeMatrix(coId),
  getExpenseMatrix(coId),
  getCompanyTotals(coId)
}
```

---

## Database Schema (ที่ต้องสร้าง — PostgreSQL)

ตาราง Core ที่สำคัญที่สุด:

```
companies           — ACG / HMW / CLIK / CONSO
chart_of_accounts   — 97 บัญชี + cf_activity (O/I/F) + cf_segment (O1-O6/I1/F1)
gl_journal          — ~2,000 transactions (ยืนยันกับงบจริงแล้ว)
ar_invoices         — ใบแจ้งหนี้ + credit_term_days + expected_payment_date
ap_bills            — ใบแจ้งหนี้จ่าย
bank_transactions   — รายการธนาคาร 7 บัญชี
customers           — customer_type (CASH/CREDIT) + credit_term_days
cf_mapping          — GL → CF Activity Mapping
audit_logs          — ทุก mutation (who, when, what)
```

Sample data พร้อมใช้ใน `sample-data/` — ตรวจสอบกับงบจริงแล้ว ✅

---

## User Roles (ยังไม่ได้ Implement จริง)

| Role | สิทธิ์ |
|------|--------|
| Admin | ทุกอย่าง + Settings + User Management |
| Finance User | Finance Input (Edit) + Dashboard (View) |
| Accounting User | Accounting Input (Edit) + Dashboard (View) |
| Manager / CFO | Dashboard + Reports + Forecast (View Only) |

---

## Open Questions ที่ยังรอคำตอบ

| # | คำถาม | ต้องการก่อน |
|---|-------|-----------|
| Q1 | Export GL จาก Business Central Format เป็นอย่างไร? | Backend Sprint |
| Q2 | Credit Term ของลูกค้าแต่ละราย (กี่วัน)? | Backend Sprint |
| Q3 | มีกี่คนใช้ระบบ? Role อะไรบ้าง? | Auth Setup |
| Q4 | เก็บข้อมูลบน Cloud ได้ไหม? | Hosting Decision |
| Q5 | ต้องย้อนหลังข้อมูลกี่ปี? | DB Sizing |

---

## Next Actions (เรียงตามลำดับสำคัญ)

```
1. ตอบ Open Questions Q1-Q5 (นัดประชุม Business Owner)
2. Sprint 1: PostgreSQL Schema + Backend API (2 สัปดาห์)
3. Sprint 2: Authentication (Clerk) + Role-Based Access (1 สัปดาห์)
4. Sprint 3: Frontend → API Connection (แทน data.js) (1 สัปดาห์)
5. Sprint 4: Excel Upload Processing (2 สัปดาห์)
6. Sprint 5: Credit Term Analysis + Collection Schedule (1 สัปดาห์)
```

**เป้าหมาย 8 สัปดาห์**: CFO Login ได้ → เห็นยอดเงินสดจริง → รู้ว่าเงินจะเข้าเดือนไหน

---

## ไฟล์สำคัญที่ควรอ่านเพิ่ม

| ต้องการรู้เรื่อง | อ่านไฟล์ |
|----------------|---------|
| Status รายละเอียดครบ | `docs/PROJECT_STATUS.md` |
| Backlog + Story + Acceptance Criteria | `docs/PROJECT_BACKLOG.md` |
| Business Rules + Cash Flow Logic | `BUSINESS_RULES.md` |
| Missing Info + Open Questions | `docs/MISSING_REQUIREMENTS.md` |
| Data Structure ปัจจุบัน | `src/data.js` |
| CF Calculation Logic | `src/reports.jsx` |
| Sample Data คำอธิบาย | `sample-data/README.md` |

---

*PROJECT_HANDOVER.md — อัปเดตเมื่อ Architecture เปลี่ยนหรือ Open Questions ได้รับคำตอบ*
