# DECISION_LOG.md
# Cashflow Management System — Decision Tracking Log
# บันทึกการตัดสินใจระบบ | อัปเดต: 2026-06-05

---

## วัตถุประสงค์

บันทึกการตัดสินใจสำคัญทั้งหมดของโปรเจกต์ เพื่อ:
- ✅ **Audit Trail**: รู้ว่าใครตัดสินใจอะไร เมื่อไหร่ ทำไม
- ✅ **Avoid Rework**: ไม่ต้องถกเถียงเรื่องเดิมซ้ำ
- ✅ **Knowledge Transfer**: หนุ่มใหม่เข้ามาอ่านเหตุผล
- ✅ **Revisit**: ถ้าเหตุผลเปลี่ยน สามารถ Revise ได้

---

---

# DECISIONS MADE

## D-001: Frontend Framework = React CDN (ไม่ใช่ Next.js)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-23 |
| **Decision** | ใช้ React 18 via CDN เป็น Static HTML → Deploy บน Vercel Static |
| **Reason** | • Deploy ได้เร็ว (ไม่ต้อง build step)<br/>• Prototype ได้ทันที<br/>• ไม่ต้อง Backend ตั้งแต่แรก<br/>• Static hosting เพียงพอสำหรับ MVP |
| **Alternative Considered** | • Next.js (ซับซ้อน ต้อง setup Node.js)<br/>• Vue.js (ไม่มีประสบการณ์ในทีม) |
| **Trade-off** | ❌ Slower ใน Browser (CDN transpile)<br/>❌ ต้อง Migrate เมื่อ Backend มา |
| **Owner** | CTO / Solution Architect |
| **Status** | ✅ Implemented |
| **Revisit Date** | 2026-07 (เมื่อ Backend Ready) |
| **Related Files** | `ARCHITECTURE.md`, `PROJECT_HANDOVER.md` |

---

## D-002: Data Layer = Mock Data (ไม่ใช่ Real Database)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-23 |
| **Decision** | ใช้ `src/data.js` เป็น JavaScript Object (Mock Data) ใช้ทดสอบ Logic |
| **Reason** | • Simplify MVP scope<br/>• ไม่ต้อง Infrastructure ตั้งแต่เริ่ม<br/>• Sample Data พร้อม testing |
| **Alternative Considered** | • PostgreSQL ตั้งแต่แรก (ซับซ้อน, ต้อง DevOps)<br/>• SQLite (ไม่เหมาะสำหรับ Multi-user) |
| **Trade-off** | ❌ Data หายทุกครั้ง Refresh<br/>❌ ไม่ persist<br/>❌ ต้อง Migrate เมื่อ Backend มา |
| **Owner** | CTO / Solution Architect |
| **Status** | ✅ Implemented |
| **Revisit Date** | 2026-06 Sprint 1 (เมื่อ Backend Sprint เริ่ม) |
| **Related Files** | `src/data.js`, `PROJECT_HANDOVER.md` |

---

## D-003: Hosting = Vercel Static + GitHub Auto-deploy

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-25 |
| **Decision** | Deploy ลง Vercel Static (bundle.html) + Auto-deploy จาก GitHub push |
| **Reason** | • Zero-config<br/>• Auto-deploy (ไม่ต้อง manual)<br/>• Free tier เพียงพอ<br/>• Global CDN → Load เร็ว<br/>• GitHub integration ง่าย |
| **Alternative Considered** | • AWS S3 (ต้อง setup IAM)<br/>• Netlify (ดี แต่ต้องเลือก)<br/>• Self-hosted (ต้อง inframan) |
| **Trade-off** | ⚠️ Vercel เท่านั้น (ผูกไว้)<br/>❌ Premium plan ต้องจ่ายเมื่อ Traffic เพิ่ม |
| **Owner** | CTO / DevOps |
| **Status** | ✅ Live: https://cashflow-management-alpha.vercel.app |
| **Revisit Date** | 2026-07 (เมื่อ Backend + API deploy) |
| **Related Files** | `vercel.json`, `.github/workflows/` |

---

## D-004: Cash Flow Standard = TAS 7 (Thai Accounting Standard)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-24 |
| **Decision** | ใช้ TAS 7 (= IAS 7) เป็น Standard สำหรับ Cash Flow Statement |
| **Reason** | • Thailand legal requirement<br/>• Consistent กับ IFRS<br/>• Audit-compliant<br/>• CFO expects this standard |
| **Alternative Considered** | • US GAAP (ไม่เหมาะสำหรับ Thailand)<br/>• Custom format (ไม่ Audit-compliant) |
| **Trade-off** | ⚠️ Strict structure (ต้องทำให้ถูกต้อง)<br/>❌ ต้องการ CFO review |
| **Owner** | Finance Manager / Accountant |
| **Status** | ✅ Implemented: BR-001 to BR-016 ใน BUSINESS_RULES.md |
| **Revisit Date** | ไม่ต้อง (Standard ไม่เปลี่ยน) |
| **Related Files** | `BUSINESS_RULES.md`, `src/reports.jsx` |

---

## D-005: CF Method = Dual (Direct + Indirect)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-24 |
| **Decision** | แสดง Cash Flow ทั้ง Direct Method และ Indirect Method พร้อมกัน |
| **Reason** | • CFO ต้องเห็นทั้งสอง perspective<br/>• Direct = Cash In/Out จริง (Operational view)<br/>• Indirect = Net Profit basis (Accounting view)<br/>• Cross-validation: Direct CF = Indirect CF → Error detection |
| **Alternative Considered** | • Direct Method only (สูญเสีย Accounting view)<br/>• Indirect Method only (ไม่เห็น Cash จริง) |
| **Trade-off** | ❌ Dual calculation = งานมากขึ้น<br/>⚠️ ต้อง Reconcile ถูกต้อง |
| **Owner** | Finance Manager / Accountant / CFO |
| **Status** | ✅ Implemented: `src/reports.jsx` |
| **Revisit Date** | ไม่ต้อง (แล้วทำให้ดี) |
| **Related Files** | `src/reports.jsx`, `BUSINESS_RULES.md BR-005, BR-006` |

---

## D-006: Database for Production = PostgreSQL

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-06-01 (Planned) |
| **Decision** | ใช้ PostgreSQL เป็น Database หลัก (เมื่อ Backend มา) |
| **Reason** | • Open source + mature<br/>• ACID compliance (สำคัญสำหรับ Financial)<br/>• Rich data types (JSON, Arrays)<br/>• Affordable hosting (Supabase/Railway/Neon)<br/>• PostGIS support ถ้าต้อง Geo features |
| **Alternative Considered** | • MySQL (ดี แต่ JSON support ยัง)<br/>• MongoDB (NoSQL — ไม่เหมาะสำหรับ Financial)<br/>• SQLServer (Expensive) |
| **Trade-off** | ⚠️ PostgreSQL-specific syntax (ไม่ portable)<br/>⚠️ ต้องสิทธิ์ DBA management |
| **Owner** | Solution Architect / DevOps |
| **Status** | 📋 Planned (Sprint 1) |
| **Revisit Date** | 2026-06-15 (หลังจบ Sprint 1) |
| **Related Files** | `ARCHITECTURE.md`, `PROJECT_MEMORY.md AD-004` |

---

## D-007: Database Hosting = TBD (3 Options)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-06-05 (ยังไม่ตัดสินใจ) |
| **Decision** | (ยังไม่) เลือก 3 hosting options: Supabase / Railway / Neon |
| **Reason** | • ต้องถาม CFO/IT เรื่อง Data Residency Policy<br/>• ต้องถาม Budget constraint<br/>• ต้องถาม SLA requirement |
| **Alternative Options** | • 🟢 **Supabase** (PostgreSQL + Auth + Realtime)<br/>• 🟡 **Railway** (Simple, pay-as-you-go)<br/>• 🟡 **Neon** (Serverless, Free tier ใหญ่)<br/>• ❌ Self-hosted (ต้อง DevOps, Infra cost) |
| **Trade-off** | ⚠️ Vendor lock-in (เปลี่ยนยาก)<br/>⚠️ Cost structure ต่างกัน |
| **Owner** | CFO / IT Manager (ต้องตัดสินใจ) |
| **Status** | 🔴 BLOCKED - ต้อง Q4 answer |
| **Revisit Date** | 2026-06-10 (เมื่อ CFO ตอบ Q4) |
| **Related Files** | `MISSING_REQUIREMENTS.md` Q4 |
| **Action Items** | 1. ถาม CFO เรื่อง Data Residency<br/>2. ถาม CFO เรื่อง Budget<br/>3. ถาม IT เรื่อง SLA requirement |

---

## D-008: Authentication = Clerk (แนะนำ)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-06-02 (Recommended, ยังไม่ implement) |
| **Decision** | ใช้ Clerk สำหรับ Auth + Role Management (Sprint 2) |
| **Reason** | • Easiest setup (ไม่ต้อง manage tokens)<br/>• Built-in Role-Based Access<br/>• Good docs / Support<br/>• Free tier 10K monthly active users<br/>• Good for Thai context |
| **Alternative Considered** | • Auth0 (ดี แต่ setup ซับซ้อน)<br/>• Firebase Auth (ไม่ดีสำหรับ Financial ไทย)<br/>• Custom auth (ไม่ recommend สำหรับ MVP) |
| **Trade-off** | ❌ Vendor lock-in (Clerk)<br/>⚠️ Premium plan ต้องจ่ายเมื่อ user เพิ่ม |
| **Owner** | CTO / Backend Engineer |
| **Status** | 📋 Planned (Sprint 2, สัปดาห์ 3) |
| **Revisit Date** | 2026-06-20 (หลังจบ Sprint 2) |
| **Related Files** | `PROJECT_BACKLOG.md BL-003`, `PROJECT_MEMORY.md AD-005` |

---

## D-009: ORM = Prisma

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-06-02 (Recommended) |
| **Decision** | ใช้ Prisma ORM สำหรับ Database access layer |
| **Reason** | • Schema-first design<br/>• Auto-migration<br/>• Type-safe queries (TypeScript)<br/>• Developer experience ดี<br/>• Good documentation |
| **Alternative Considered** | • TypeORM (ดี แต่ setup ยาก)<br/>• Sequelize (Older, less modern)<br/>• Raw SQL (ไม่ safe, ยาก maintain) |
| **Trade-off** | ⚠️ Prisma-specific syntax<br/>⚠️ ต้องเขียน Schema .prisma ก่อน code |
| **Owner** | Backend Engineer |
| **Status** | 📋 Planned (Sprint 1) |
| **Revisit Date** | 2026-06-15 (หลังจบ Sprint 1) |
| **Related Files** | `PROJECT_BACKLOG.md BL-001`, `prisma/schema.prisma` (ยังไม่มี) |

---

## D-010: Cash Flow Calculation Engine = Pure Functions

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-28 |
| **Decision** | เขียน CF calculation เป็น pure functions (ไม่มี side effects) |
| **Reason** | • Easy to test (input → output ชัดเจน)<br/>• Reusable ใน Frontend + Backend<br/>• Audit trail ง่าย<br/>• No state mutation<br/>• Predictable behavior |
| **Alternative Considered** | • Class-based (OOP)<br/>• Imperative code |
| **Trade-off** | ⚠️ Strict naming convention ต้อง enforce |
| **Owner** | Backend Engineer / QA |
| **Status** | ✅ Implemented (Frontend) `src/reports.jsx`<br/>📋 Planned (Backend) Sprint 3 |
| **Revisit Date** | 2026-07 (หลังจบ Sprint 3) |
| **Related Files** | `src/reports.jsx`, `services/cfCalculation.ts` (ยังไม่มี) |

---

## D-011: CF Segment Classification = 8 Segments (O1-O6, I1, F1)

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-26 |
| **Decision** | จัด GL Accounts ออกเป็น 8 CF segments สำหรับ Detailed Analysis |
| **Reason** | • Detailed enough สำหรับ Cash Planning<br/>• Simple enough สำหรับ Implementation<br/>• Aligned กับ CFO requirements<br/>• Easy to report |
| **Alternative Considered** | • 3 segments only (Activity level — too simple)<br/>• 20+ segments (too detailed, maintenance nightmare) |
| **Trade-off** | ⚠️ ต้อง Map ทุก GL Account → Segment |
| **Owner** | Accountant / Finance Manager |
| **Status** | ✅ Implemented: `src/data.js cfMapping`<br/>📋 DB schema (Sprint 1) |
| **Revisit Date** | 2026-07 (หลังจบ Sprint 1) |
| **Related Files** | `BUSINESS_RULES.md BR-004`, `src/data.js` |

---

## D-012: Report Export = PDF + Excel

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-27 |
| **Decision** | Support export ทั้ง PDF (Print-friendly) และ Excel (Analysis-ready) |
| **Reason** | • PDF ดีสำหรับ Distribution / Printing<br/>• Excel ดีสำหรับ Further analysis<br/>• CFO ชอบ Excel สำหรับ Deep-dive<br/>• Both formats standard ในการเงิน |
| **Alternative Considered** | • PDF only (lose flexibility)<br/>• Excel only (lose print quality) |
| **Trade-off** | ❌ ต้องสอบเขียน 2 export logic |
| **Owner** | Frontend Engineer |
| **Status** | ✅ Implemented: PDF ใช้งานได้, Excel working paper 6 sheets |
| **Revisit Date** | ไม่ต้อง |
| **Related Files** | `src/other-screens.jsx` export section |

---

## D-013: Consolidation = Full Consolidation + IC Elimination

| Field | Value |
|-------|-------|
| **Decision Date** | 2026-05-28 |
| **Decision** | CONSO view = Sum(ACG+HMW+CLIK) - Intercompany transactions |
| **Reason** | • CONSO ต้องแสดง External CF เท่านั้น<br/>• IC transactions ต้อง eliminate<br/>• Management fee (ACG ← HMW/CLIK) ต้องตัด<br/>• Audit requirement |
| **Alternative Considered** | • Proportional consolidation (ไม่ current practice)<br/>• Equity method (ไม่เหมาะสำหรับ subsidiary) |
| **Trade-off** | ❌ ต้องระบุ IC transactions ชัดเจน |
| **Owner** | Accountant |
| **Status** | 📋 Planned (ต้องเก็บ Intercompany table ใน DB) |
| **Revisit Date** | 2026-06-15 (Sprint 1 schema) |
| **Related Files** | `BUSINESS_RULES.md BR-010`, `sample-data/08_intercompany.csv` |

---

---

# PENDING DECISIONS (ต้องตัดสินใจ)

## PD-001: Database Hosting Provider

| Item | Status | Owner | Due Date |
|------|--------|-------|----------|
| Choose: Supabase / Railway / Neon | 🔴 Blocked | CFO / IT Manager | 2026-06-10 |
| **Blocking Factor** | Q4: Data Residency Policy ยังไม่ชัด | | |

---

## PD-002: Minimum Cash Balance Policy (per Company)

| Item | Status | Owner | Due Date |
|------|--------|-------|----------|
| Define: ACG Min Balance | 🔴 Blocked | CFO | 2026-06-10 |
| Define: HMW Min Balance | 🔴 Blocked | CFO | 2026-06-10 |
| Define: CLIK Min Balance | 🔴 Blocked | CFO | 2026-06-10 |
| **Blocking Factor** | Q4: CFO ยังไม่บอกระดับ Min Cash | | |

---

## PD-003: Customer Credit Term Master

| Item | Status | Owner | Due Date |
|------|--------|-------|----------|
| Get Credit Term per Customer | 🔴 Blocked | AR Manager | 2026-06-10 |
| **Blocking Factor** | Q2: ยังไม่มี Customer Master Data | | |

---

## PD-004: GL Export Format จาก Business Central

| Item | Status | Owner | Due Date |
|------|--------|-------|----------|
| Confirm BC Export Format | 🔴 Blocked | IT / Finance | 2026-06-10 |
| **Blocking Factor** | Q1: ยังไม่ได้ See actual BC export | | |

---

---

# DECISION REVERSAL LOG

(รายการตัดสินใจที่เปลี่ยนแปลง)

| # | Original Decision | Reversed Date | New Decision | Reason |
|---|------------------|---------------|--------------|--------|
| (ยังไม่มี) | - | - | - | - |

---

---

# TEMPLATES

## Template for New Decision

```markdown
## D-XXX: [Decision Title]

| Field | Value |
|-------|-------|
| **Decision Date** | YYYY-MM-DD |
| **Decision** | [Short summary ของการตัดสินใจ] |
| **Reason** | • [Reason 1]<br/>• [Reason 2]<br/>• [Reason 3] |
| **Alternative Considered** | • [Option 1]<br/>• [Option 2] |
| **Trade-off** | [Pros]<br/>[Cons] |
| **Owner** | [Name / Role] |
| **Status** | ✅ Implemented / 📋 Planned / 🔴 Blocked |
| **Revisit Date** | YYYY-MM-DD |
| **Related Files** | [File paths] |
| **Action Items** | 1. [Item 1]<br/>2. [Item 2] |
```

---

*DECISION_LOG.md — อัปเดตทุกครั้งที่มีการตัดสินใจสำคัญ*  
*ใช้ร่วมกับ PROJECT_MEMORY.md สำหรับเก็บ Institutional Knowledge*
