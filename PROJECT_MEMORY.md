# PROJECT_MEMORY.md
# Cashflow Management System — Institutional Knowledge
# โครงสร้างความรู้ที่สำคัญสำหรับโปรเจกต์ | อัปเดต: 2026-06-05

---

## TL;DR — ความเข้าใจหลักของโปรเจกต์

> ระบบ Cash Flow Management สำหรับกลุ่ม ACG (ACG/HMW/CLIK)  
> ยังไม่มี Backend — Frontend MVP สำเร็จแล้ว 90%  
> Key Insight: **Revenue ≠ Cash** — ต้องแยก P&L กับ CF ให้ชัดเจน

---

---

# 1. BUSINESS ASSUMPTIONS

## BA-001: โครงสร้างกลุ่มบริษัท

| บริษัท | ประเภท | ธุรกิจหลัก | ความเข้าใจปัจจุบัน |
|--------|--------|----------|-----------------|
| **ACG** | Holding | Management Fee จาก HMW/CLIK | Consolidation point |
| **HMW** | Subsidiary | ขายรถ + ซ่อม + ประกัน Honda | ตัวแทนจำหน่ายรถ |
| **CLIK** | Subsidiary | บริการ + ซ่อมบำรุง B2B | Service business |
| **CONSO** | Virtual | การรวมกลุ่ม | ต้องตัด Intercompany |

**Source**: PROJECT_HANDOVER.md  
**Note**: ยังต้องถาม Q2 — รูปแบบรายได้และสัดส่วน Cash vs Credit ของแต่ละบริษัท

---

## BA-002: Customer Type Distribution

| Assumption | ค่าปัจจุบัน | Status | ต้องได้รับ |
|-----------|-----------|--------|----------|
| **ACG** Cash % | ? | ❓ Unknown | Q2 from CFO |
| **HMW** Cash % | ? (Assume 60% cash, 40% credit) | ❓ Mock | Q2 from Finance |
| **CLIK** Cash % | ? (Assume 50% cash, 50% credit) | ❓ Mock | Q2 from Finance |
| **Default Credit Term** | 0/30/60/90 days | ❓ Template | Q2 from AR Master |

**Impact**: Forecast Accuracy ขึ้นอยู่กับ Credit Term ที่ถูกต้อง

---

## BA-003: Fixed Monthly Obligations

| รายการ | ค่าประมาณ | ความแน่นอน | หมายเหตุ |
|--------|----------|-----------|---------|
| Salaries + Benefits | ? | ❌ Mock | ต้องจ่ายทุกเดือน |
| Rent (Offices) | ? | ❌ Mock | ต้องจ่ายทุกเดือน |
| Utilities (Water/Electric) | ? | ❌ Mock | ต้องจ่ายทุกเดือน |
| Honda Parts Purchases | ? | ❌ Mock | Variable ตาม sales |
| Loan Repayment | 920M proceeded, 1,020M repaid | ✅ ใน Sample Data | ต้องติดตามยอด |
| Lease Payment (TFRS 16) | ? | ❌ Unknown | ต้องข้อมูล Lease Register |

**Source**: `sample-data/06_loans.csv`, `sample-data/07_leases_tfrs16.csv`

---

## BA-004: Seasonality Patterns

| บริษัท | High Season | Low Season | Pattern |
|--------|----------|----------|---------|
| **ACG** | ? | ? | ❓ Unknown |
| **HMW** | ปลายปี (Q4)? | ต้นปี (Q1)? | ❓ Assume |
| **CLIK** | ? | ? | ❓ Unknown |

**Impact**: Week-by-week forecast multiplier  
**ต้องถาม**: Q12 from Sales/Finance

---

## BA-005: Minimum Cash Policy

| บริษัท | Min Balance | ที่มา | Note |
|--------|-----------|-------|------|
| **ACG** | ? บาท | ❌ ไม่มี | Alert threshold ใน Dashboard |
| **HMW** | ? บาท | ❌ ไม่มี | |
| **CLIK** | ? บาท | ❌ ไม่มี | |

**Impact**: Flag warning ถ้า Forecast Balance ต่ำกว่าระดับนี้  
**ต้องถาม**: Q4 from CFO/Treasury

---

## BA-006: Credit Term Policy

### ตอนนี้ยังไม่มี Customer Master

```
ต้องการ: Customer Master Data
├─ Customer ID / Name
├─ Customer Type (Cash / Credit)
├─ Credit Term Days (0 / 30 / 60 / 90)
├─ Payment Behavior (On-time %, Average Days Late)
└─ Contact Info / Account Manager
```

**ไฟล์ต้องการ**: `templates/08_Customer_Master_Template.xlsx`  
**ต้องถาม**: Q2 from AR Team + Sales

---

## BA-007: Consolidation Rules

### Intercompany Transactions ที่ต้องตัด

| IC Type | Direction | ตัดหรือไม่ | หมายเหตุ |
|---------|-----------|-----------|---------|
| **Management Fee** | ACG → HMW/CLIK | ✅ ตัด | Revenue ของ ACG ต้อง Eliminate |
| **IC Loans** | ACG ↔ HMW/CLIK | ✅ ตัด | Payable ของ HMW/CLIK ต้อง Eliminate |
| **IC Dividend** | ACG ← HMW/CLIK | ✅ ตัด | ก่อนกำไร |
| **IC Goods Purchase** | HMW ← CLIK | ? | ❓ มีหรือไม่? |

**Source**: `sample-data/08_intercompany.csv`  
**ต้องถาม**: Q13 from Accounting

---

---

# 2. ARCHITECTURE DECISIONS

## AD-001: Frontend Framework

**Decision**: React 18 via CDN (ไม่ใช่ Next.js จริง)  
**Reason**:
- Deploy เป็น Static HTML ได้ → Vercel Static ทำได้ทันที
- ไม่ต้อง Build step → Prototype ได้เร็ว
- ไม่ต้อง Node.js backend ระยะแรก

**Constraint**: ต้อง transpile ใน Browser → ช้า กว่า Production build

**Future**: Migrate → Next.js จริง เมื่อ Backend API พร้อม

---

## AD-002: Data Layer (Current)

**Decision**: Mock Data ใน `src/data.js` (ไม่ใช่ Database)  
**Reason**:
- Prototype ได้เร็ว
- ไม่ต้อง Infrastructure ตั้งแต่เริ่ม
- Sample Data พร้อมใช้ทดสอบ Logic

**Limitation**: 
- ข้อมูลหายทุกครั้ง Refresh
- ไม่สามารถ Persist ได้

**Timeline**: Migrate → PostgreSQL เมื่อ Sprint 2

---

## AD-003: Hosting

**Decision**: Vercel Static (bundle.html)  
**Reason**:
- Zero-config deployment
- Auto-deploy จาก GitHub
- Free tier เพียงพอสำหรับ MVP
- CDN global → Load ได้เร็ว

**URL**: https://cashflow-management-alpha.vercel.app

**Future**: Separate Backend Server (Vercel Functions / Railway) เมื่อ API พร้อม

---

## AD-004: Database Choice (Future)

**Decision**: PostgreSQL  
**Reason**:
- Open source, mature
- ACID compliance สำหรับ Financial data
- Rich data types (JSON, Arrays)
- Affordable hosting (Supabase / Railway / Neon)

**Hosting Options** (ยังไม่ตัดสินใจ):
- 🟢 **Supabase** (PostgreSQL + Auth + Realtime)
- 🟡 **Railway** (Simple, monthly billing)
- 🟡 **Neon** (Serverless, Free tier ใหญ่)
- ❓ ต้องถาม Q4 — Data Residency Policy

---

## AD-005: Authentication

**Decision**: Clerk (แนะนำ)  
**Reason**:
- Easiest setup (ไม่ต้อง manage tokens)
- Built-in Role-Based Access
- Good docs สำหรับ Thai use case
- Free tier 10K monthly active users

**Alternative**: Auth0 (ถ้า Org มี corporate account)

**Not Recommended**: Firebase Auth (ไม่ดีสำหรับ Financial data jurisdiction ไทย)

**Timeline**: Sprint 2 (สัปดาห์ 3)

---

## AD-006: ORM / Database Client

**Decision**: Prisma  
**Reason**:
- Schema-first design
- Auto-migration
- Type-safe queries (TypeScript)
- Good docs

**Alternative**: TypeORM, Sequelize  
**Not**: Raw SQL (ไม่ safe จาก injection, ยาก maintain)

---

## AD-007: Cash Flow Calculation Engine

**Decision**: Pure functions (Functional Programming)  
**Reason**:
- Easy to test
- No side effects
- Reusable ใน Frontend และ Backend
- Audit trail ง่าย (Input → Output ชัดเจน)

**Location**:
- Frontend: `src/reports.jsx` (ต้องทำให้ standalone)
- Backend: `services/cfCalculation.ts` (ทำใหม่)

---

## AD-008: Report Generation

**Decision**: 
- **PDF**: Puppeteer / @react-pdf/renderer
- **Excel**: ExcelJS (ทำเอง Custom format)

**Reason**:
- Excel ดีสำหรับ Financial data (sorting, formula)
- PDF ดีสำหรับ Distribution / Printing
- Working Paper (6 Sheets) → Export as Excel

---

---

# 3. ACCOUNTING DECISIONS

## ACC-001: Cash Flow Standard

**Decision**: TAS 7 (Thai Accounting Standard 7 = IAS 7)  
**Reason**:
- Thailand standard for listed companies
- Consistent กับ IFRS
- Audit-compliant

**Structure**: 3 Activities
- Operating (O)
- Investing (I)
- Financing (F)

**Source**: BR-001 to BR-016 ใน BUSINESS_RULES.md

---

## ACC-002: CF Method ที่ใช้

**Decision**: Dual Method (Direct + Indirect)  
**Reason**:
- CFO ต้องเห็นทั้งสอง perspective
- Cross-validation (Direct CF = Indirect CF → Error detection)
- Indirect Method ต้องสำหรับ Audit

**Reporting**:
- Dashboard → Direct Method (Cash In/Out จริง)
- Report Tab → Indirect Method (Net Profit basis)
- Cross-Validation Panel → เปรียบเทียบทั้งสอง

---

## ACC-003: Depreciation Treatment

**Decision**: Add-back ใน Indirect Method  
**Reason**:
- Non-cash item (ไม่มีเงินออกจริง)
- P&L ลด profit แต่ CF ไม่ลด cash
- Must add-back เพื่อ reconcile

**GL Account Classification**:
- Account Code 5600-5630 → Segment O6 (Other Operating)
- Treatment: ADD_BACK

**Source**: BR-012 ใน BUSINESS_RULES.md

---

## ACC-004: AR/AP Aging Buckets

**Decision**: 5 buckets สำหรับ AR, 4 buckets สำหรับ AP  
**Reason**:
- Current = ปกติ
- 1-30 days = เริ่ม alert
- 31-60 days = ต้องติดตาม
- 61-90 days = เฝ้าระวัง
- 90+ days = ความเสี่ยงสูง (bad debt reserve)

**Source**: BR-008, BR-009 ใน BUSINESS_RULES.md

---

## ACC-005: CF Segment Mapping

**Decision**: 8 segments (O1-O6, I1, F1)  
**Reason**:
- Detailed enough สำหรับ Analysis
- Simple enough สำหรับ Implementation
- เพียงพอสำหรับ Cash Planning

| Segment | ความหมาย |
|---------|---------|
| O1 | Salaries + Benefits |
| O2 | Goods/COGS + Honda Parts |
| O3 | Subcontract + Service |
| O4 | Rent + Utilities |
| O5 | Taxes |
| O6 | Other (Depreciation add-back, Bad Debt) |
| I1 | Capex + Asset Disposal |
| F1 | Loans + Interest + Lease Payment |

**Implementation**: Chart of Accounts Mapping table ใน DB

**Source**: BR-004 ใน BUSINESS_RULES.md

---

## ACC-006: Consolidation Method

**Decision**: Full Consolidation + IC Elimination  
**Reason**:
- ACG = Holding company ควบคุม HMW/CLIK
- CONSO view ต้องตัด Intercompany
- Management Fee (ACG ← HMW/CLIK) ต้อง eliminate

**Process**:
1. Sum all GL entries ACG + HMW + CLIK
2. Identify IC transactions
3. Eliminate paired accounts
4. Result = CONSO view

**Future**: Parent-only reporting (ACG standalone) ถ้า CFO ต้องการ

---

## ACC-007: TFRS 16 Lease Treatment

**Decision**: Separate lease payment ออก → F1 (Financing)  
**Reason**:
- TFRS 16 requires lease split (Principal + Interest)
- Principal → Financing Activity
- Interest → Financing Activity
- ROU Depreciation → Add-back ใน Indirect Method

**Data Requirement**: Lease Register จาก Accounting  
**ต้องถาม**: Q14 from Accounting

---

## ACC-008: Intercompany Dividend Treatment

**Decision**: ต้องตัด (Eliminate) ก่อนแสดง CONSO  
**Reason**:
- Internal transfer ไม่ใช่ Economic activity
- Consolidated view ต้องแสดงเฉพาะ External CF

**Timing**: ตัดหลังจาก Operating CF คำนวณแล้ว (ใน Financing section)

---

## ACC-009: Bad Debt / Doubtful Debt

**Decision**: เก็บใน O6 (Other Operating) เป็น Add-back  
**Reason**:
- Provision ประมาณการ ไม่ใช่เงินออก
- Actual bad debt write-off ต้อง track แยก
- Impact CF = เมื่อเขียนตัวบัญชีจริง

**Implementation**:
- Provision (P&L) → Add-back
- Write-off (Cash out) → Direct classify เป็น O6 outflow

---

---

# 4. KEY INSIGHTS & REMINDERS

## I-001: Revenue ≠ Cash

นี่คือสิ่งที่สำคัญที่สุดในระบบ

```
Invoice 1 Jan (Credit 30 days)
  P&L: Jan Revenue +1M
  CF:  Jan Cash 0

Payment 1 Feb
  P&L: Feb Revenue 0
  CF:  Feb Cash +1M
```

**System Must**: แสดงแยก Revenue Performance กับ Cash Performance

---

## I-002: Direct ≠ Indirect (ถ้าต่างกัน = Error)

```
Direct Operating CF:   Cash In - Cash Out = X บาท
Indirect Operating CF: Net Profit + Adjustments = X บาท

หาก X ≠ X → มี Error ใน GL หรือ Calculation
```

**Cross-Validation Panel** ต้อง Flag discrepancy

---

## I-003: ข้อมูล Sample ≠ Production Data

Sample Data ใน `sample-data/` ตรวจสอบกับงบจริงแล้ว ✅  
แต่เป็นตัวเลขที่ปรับให้เป็น Demo เท่านั้น

**เมื่อ Go-Live** ต้องทำ Data Migration จากระบบจริง

---

## I-004: ไม่มี Backend = ไม่ใช้งานจริงได้

Frontend UI 90% สำเร็จแต่ลอง Refresh → ข้อมูลหาย

**ต้องทำ Sprint 1**: Backend API + Database

---

## I-005: Authentication ต้องทำเร็ว

ปัจจุบัน URL เปิดแบบไม่ป้องกัน

**ต้องทำ Sprint 2**: Clerk + Role-Based Access

---

---

# REFERENCE LINKS

| เอกสาร | ไฟล์ | วัตถุประสงค์ |
|--------|------|-----------|
| Status รายละเอียด | `PROJECT_STATUS.md` | Current progress + Blockers |
| Quick Context | `PROJECT_HANDOVER.md` | TL;DR + Open Questions |
| Accounting Rules | `BUSINESS_RULES.md` | BR-001 to BR-016 |
| Backlog + Sprint | `docs/PROJECT_BACKLOG.md` | Sprint Planning |
| Missing Info | `docs/MISSING_REQUIREMENTS.md` | Open Questions detail |
| Agent Config | `MASTER_SYSTEM.md` | Agent Routing + Rules |

---

*PROJECT_MEMORY.md — อัปเดตเมื่อมี New Assumption, Architecture Change, หรือ Accounting Decision*  
*เพิ่มเติมใน DECISION_LOG.md*
