# PROJECT_STATUS.md
# Cashflow Management System — Current Status
# อัปเดต: 2026-06-05 | อัปเดตทุกครั้งที่จบ Sprint หรือ Milestone สำคัญ

---

## SNAPSHOT: สถานะโดยรวม

```
Frontend MVP          ████████████████████  90%  ✅ ใช้งานได้จริง
Phase 1 — MVP Core    ████████████████████ 100%  ✅ สำเร็จ
Phase 2 — Enhanced     ████████████████░░░░  85%  ⚠️ กำลังพัฒนา
Backend / Database     ░░░░░░░░░░░░░░░░░░░░   0%  ❌ ยังไม่เริ่ม
โดยรวมทั้งโปรเจกต์   ████████░░░░░░░░░░░░  40%
```

**สถานะปัจจุบัน**: Frontend MVP สำเร็จแล้ว — รอสร้าง Backend + Database

---

## LIVE SYSTEM

| รายการ | รายละเอียด |
|--------|-----------|
| **Live URL** | https://cashflow-management-alpha.vercel.app |
| **Hosting** | Vercel Static (Auto-deploy จาก GitHub) |
| **Tech Stack** | React 18 (CDN), TailwindCSS, Recharts, SheetJS |
| **Data Layer** | JavaScript Mock Data (in-memory — หายทุกครั้ง refresh) |
| **Code Size** | ~5,155 บรรทัด JSX/JS |
| **Bundle Size** | 339 KB (minified) |
| **Test Data** | 97 GL Accounts, ~2,000 transactions, 4 บริษัท (ACG, HMW, CLIK, CONSO) |
| **Validation** | ตัวเลขตรวจสอบกับงบการเงินจริงของ ACG แล้ว |

---

## MODULES: สิ่งที่สำเร็จแล้ว ✅

### Dashboard
- KPI Cards 7 ใบ (Cash In, Cash Out, Net CF, Opening/Closing Balance, Total Cash)
- Monthly Trend Chart (6 เดือนย้อนหลัง, เลือก Line/Bar/Area)
- Bank Accounts Widget (7 บัญชี)
- Segment Analysis แยกตามบริษัท
- Company Selector (CONSO / ACG / HMW / CLIK) + Period Selector

### Finance Input (7 แท็บ)
- Bank Accounts (GL Mapping), Cash Receipts, Cash Payments
- AP Honda, PN Payment, Reconcile AR, Reconcile AP

### Accounting Input (4 แท็บ)
- GL Trial Balance (21 บัญชีหลัก), AR Aging (8 ราย × 5 ช่วง)
- AP Aging (5 ราย × 4 ช่วง), Inventory (5 รายการ)

### Cash Flow Reports
- Direct Method ✅ (เงินรับ/จ่ายจริง ครบทุก Activity)
- Indirect Method ✅ (TAS 7 — Net Profit → WC Adjustments)
- Cross-Validation Panel ✅ (เปรียบเทียบ Direct vs Indirect)
- Working Paper ✅ (Drill-down 6 Excel Sheets: AR/AP/Inventory detail)
- Export Excel ✅ / Export PDF ✅

### Forecast
- 8-Week Forecast ✅ (3 Scenarios: Bear -15% / Base / Bull +15%)

### Settings
- CF Account Mapping (GL → CF Activity + Segment)
- UI Customization (สี, Chart Type, Layout)

---

## MODULES: กำลังพัฒนา ⚠️

| Module | ความคืบหน้า | สิ่งที่ขาด |
|--------|-----------|---------|
| Credit Analysis Dashboard | 60% | Credit Term Mapping รายลูกค้า |
| Expected Cash Collection | 40% | Invoice Date vs Payment Date จริง |
| Cash vs Credit Customer Split | 30% | Customer Profile (Cash/Credit flag) |

---

## BLOCKERS: สิ่งที่ขาดและผลกระทบ ❌

### Critical (P0) — ระบบใช้งานจริงไม่ได้ถ้าขาดสิ่งนี้

| Blocker | ผลกระทบ |
|---------|---------|
| ❌ Backend API | ข้อมูลอยู่ใน Memory — รีเฟรชแล้วหาย ใช้งานจริงไม่ได้ |
| ❌ PostgreSQL Database | ไม่สามารถบันทึกข้อมูลถาวรได้ |
| ❌ Authentication / Login | ไม่มีสิทธิ์ควบคุม ใครก็เข้าได้ |
| ❌ Frontend → API Connection | ยังใช้ Mock data.js ทั้งหมด |

### High (P1) — ควรทำใน Sprint ถัดไป

| Item | รายละเอียด |
|------|-----------|
| ⚠️ Excel Upload Processing | Template 12 ไฟล์พร้อมแล้ว แต่ยังไม่มี Import Logic จริง |
| ⚠️ GL Import จาก Business Central | มี Parser บางส่วนแล้ว (commit: cf216c1) |
| ⚠️ Credit Term Mapping | รู้ว่าต้องทำ แต่ยังไม่มีข้อมูล Customer Profile |

---

## NEXT SPRINT PLAN

### Sprint 1 (แนะนำ): Backend Foundation
```
BL-002  ออกแบบ Database Schema + ติดตั้ง PostgreSQL (Supabase)
BL-001  สร้าง Backend API (Next.js API Routes หรือ Express)
```

### Sprint 2: Authentication + Connect
```
BL-003  ติดตั้ง Clerk + Role-Based Access
BL-004  เชื่อม Frontend กับ Backend API (แทน Mock data.js)
```

### Sprint 3: Data Upload
```
BL-020  Excel Upload & Parsing (12 Templates)
BL-021  GL Import จาก Business Central (ต่อจาก commit cf216c1)
```

### Sprint 4: Credit Analysis
```
BL-010  Credit Term Mapping per Customer
BL-011  Expected Cash Collection Schedule
```

---

## DECISION LOG: การตัดสินใจสำคัญที่ผ่านมา

| วันที่ | การตัดสินใจ | เหตุผล |
|-------|-----------|-------|
| 2026-06 | ใช้ React 18 CDN (ไม่ใช่ Next.js) สำหรับ MVP | เร็วกว่า — deploy เป็น Static HTML ได้ทันที |
| 2026-06 | Vercel Static Hosting | Zero-config, Auto-deploy จาก GitHub |
| 2026-06 | Mock data.js แทน Database | ลด complexity ของ MVP ระยะแรก |
| 2026-06 | TFRS + TAS 7 (Indirect Method) | มาตรฐานบัญชีไทยที่ใช้จริง |
| 2026-06 | 4 Companies: ACG / HMW / CLIK / CONSO | โครงสร้างกลุ่มบริษัทจริง |

---

## KNOWN ISSUES

| Issue | Severity | หมายเหตุ |
|-------|---------|---------|
| ข้อมูลหายทุกครั้งที่ refresh | Critical | แก้ได้เมื่อ Database พร้อม |
| ไม่มี Login — ทุกคนเข้าได้ | Critical | แก้ได้เมื่อ Auth พร้อม |
| GL Import ยังไม่ครบ 100% | High | commit cf216c1 เริ่มแล้ว ยังไม่สมบูรณ์ |
| Unit Tests ยังไม่มี | Medium | ทดสอบมือทุกครั้ง |

---

## FILE REFERENCES

| ไฟล์ | รายละเอียด |
|------|-----------|
| `docs/PROJECT_STATUS.md` | รายงาน Status ฉบับเต็ม (ละเอียดกว่า) |
| `docs/PROJECT_BACKLOG.md` | Backlog ทุก EPIC และ Story พร้อม Acceptance Criteria |
| `docs/PROJECT_HANDOVER.md` | Handover notes และ context สำหรับคนรับช่วง |
| `docs/REQUIREMENT.md` | Business Requirements ฉบับเต็ม |
| `docs/MISSING_REQUIREMENTS.md` | Requirements ที่ยังขาดหรือยังไม่ชัดเจน |
| `sample-data/` | Test data: 97 GL accounts, 4 บริษัท, ~2,000 transactions |
| `templates/` | Excel Import Templates 12 ไฟล์ |
| `Finance Statement/` | งบการเงินจริง (ACG, HMW, CLIK) |

---

*PROJECT_STATUS.md — อัปเดตทุกครั้งที่จบ Sprint หรือมีการตัดสินใจสำคัญ*
*สำหรับ Backlog รายละเอียด ดูที่ `docs/PROJECT_BACKLOG.md`*
