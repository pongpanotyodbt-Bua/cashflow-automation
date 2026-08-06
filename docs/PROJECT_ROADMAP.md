# PROJECT ROADMAP
# ระบบบริหารกระแสเงินสด (Cashflow Management System)

**วันที่อัปเดต**: 5 มิถุนายน 2569  
**Version**: MVP v1 → Production v1  

---

## ภาพรวม Roadmap

```
2569                          Q2          Q3          Q4
─────────────────────────────────────────────────────────
ม.ค.-มี.ค.  ✅ Phase 1 MVP
เม.ย.-พ.ค.  ✅ Phase 2A Enhanced
มิ.ย.       📍 คุณอยู่ที่นี่
              ↓
มิ.ย.-ก.ค.  🔵 Phase 2B Backend Integration
ส.ค.-ก.ย.  🟡 Phase 2C Credit Analysis + Upload
ต.ค.-พ.ย.  🟢 Phase 3A Reports + Audit
ธ.ค.+       🔜 Phase 3B Advanced Features
```

---

## Phase 1 — MVP Core ✅ (สำเร็จ 100%)

**ระยะเวลา**: ม.ค. 2569 — มี.ค. 2569  
**เป้าหมาย**: สร้าง Frontend Dashboard ที่ใช้งานได้จริง  

### สิ่งที่สำเร็จ

| Module | รายละเอียด | สถานะ |
|--------|-----------|-------|
| Dashboard | KPI 7 ใบ, Monthly Trend, Bank Accounts | ✅ |
| Finance Input | 7 แท็บ (บัญชี, รับเงิน, จ่ายเงิน, Honda, PN, Recon) | ✅ |
| Accounting Input | GL, AR Aging, AP Aging, Inventory | ✅ |
| Direct Method Report | Cash Inflow/Outflow จริง — TAS 7 | ✅ |
| Indirect Method Report | Net Profit → CF Adjustments | ✅ |
| Forecast | 8-Week Projection, 3 Scenarios | ✅ |
| Export | Excel & PDF | ✅ |
| Settings | CF Mapping, UI Customization | ✅ |
| Live Deploy | Vercel (https://cashflow-management-alpha.vercel.app) | ✅ |

**ผลลัพธ์**: Frontend MVP ครบสมบูรณ์ ทดสอบกับข้อมูลจริงของ ACG/HMW/CLIK ตัวเลขตรงกับงบการเงิน

---

## Phase 2A — Enhanced Analysis ✅ (สำเร็จ 85%)

**ระยะเวลา**: เม.ย. 2569 — พ.ค. 2569  
**เป้าหมาย**: เพิ่มความลึกของการวิเคราะห์

| ฟีเจอร์ | สถานะ |
|---------|-------|
| Indirect Method ครบ | ✅ |
| Working Capital Impact | ✅ |
| Cross-Validation Panel | ✅ |
| Working Paper Drill-down | ✅ |
| AR/AP Aging Detail | ✅ |
| Expected Collection Schedule | ⚠️ 40% (ขาด Credit Term data) |
| Cash vs Credit Split | ⚠️ 30% (ขาด Customer Profile) |

---

## Phase 2B — Backend Integration 🔵 (ถัดไป — เร่งด่วน)

**ระยะเวลา ประมาณ**: มิ.ย. 2569 — ก.ค. 2569 (6-8 สัปดาห์)  
**เป้าหมาย**: ทำให้ระบบ Production-Ready ใช้งานได้จริง

> ⚠️ **ปัจจุบันระบบยังไม่สามารถใช้งานจริงได้** เพราะข้อมูลหายทุกครั้งที่ refresh

### Milestone 2B.1 — Database (สัปดาห์ 1-2)

```
สัปดาห์ 1:
  ✦ ออกแบบ Database Schema
  ✦ ติดตั้ง PostgreSQL (Neon / Supabase / Railway)
  ✦ สร้าง Migration Scripts
  ✦ Import Sample Data

สัปดาห์ 2:
  ✦ สร้าง Backend API (Node.js/Express)
  ✦ CRUD endpoints ทุก Module
  ✦ API Documentation
```

**Deliverable**: Database ทำงาน + API endpoints พร้อมใช้

### Milestone 2B.2 — Authentication (สัปดาห์ 3)

```
  ✦ ติดตั้ง Clerk (แนะนำ — ง่ายและรวดเร็ว)
  ✦ สร้าง Roles: Admin, Finance, Accounting, Manager
  ✦ ผูก UI กับ Roles (เห็นต่างกัน)
  ✦ Protect ทุก API endpoint
```

**Deliverable**: ระบบ Login พร้อมสิทธิ์ตาม Role

### Milestone 2B.3 — Frontend-Backend Integration (สัปดาห์ 4)

```
  ✦ แทน Mock data.js ด้วย API calls จริง
  ✦ Loading states, Error handling
  ✦ Data persistence (ข้อมูลคงอยู่หลัง refresh)
  ✦ Test กับข้อมูลจริง
```

**Deliverable**: ระบบพร้อมใช้งานจริง — ข้อมูลบันทึกถาวร

---

## Phase 2C — Credit Analysis & Upload 🟡

**ระยะเวลา ประมาณ**: ส.ค. 2569 — ก.ย. 2569 (4 สัปดาห์)  
**เป้าหมาย**: วิเคราะห์ Revenue ≠ Cash และรับข้อมูลจาก Excel

### Milestone 2C.1 — Credit Term Analysis (สัปดาห์ 1-2)

```
  ✦ Credit Term Mapping รายลูกค้า (0/30/60/90 วัน)
  ✦ Expected Cash Collection Schedule
  ✦ Revenue vs Cash Waterfall Chart
  ✦ Collection Efficiency Metrics
```

**Deliverable**: Dashboard แสดงว่าเงินจะเข้าเมื่อไหร่

### Milestone 2C.2 — Excel Upload Processing (สัปดาห์ 3-4)

```
  ✦ Upload & Validate 12 Excel Templates
  ✦ GL Import จาก Business Central
  ✦ Auto-classify → CF Activity
  ✦ Duplicate Detection
  ✦ Import Summary Report
```

**Deliverable**: ทีม Finance / Accounting อัป Excel ได้โดยไม่ต้องพึ่ง Dev

---

## Phase 3A — Reports & Governance 🟢

**ระยะเวลา ประมาณ**: ต.ค. 2569 — พ.ย. 2569 (4 สัปดาห์)  
**เป้าหมาย**: รายงานครบถ้วนและตรวจสอบได้

### Milestone 3A.1 — Advanced Reports

```
  ✦ Multi-Period Comparison (MoM, YoY)
  ✦ Budget vs Actual Analysis
  ✦ Group Consolidated Report (with IC elimination)
  ✦ Scheduled Report Email (PDF ส่งอัตโนมัติ)
```

### Milestone 3A.2 — Audit & Governance

```
  ✦ Audit Trail (ใครแก้อะไร เมื่อไหร่)
  ✦ Data Validation Rules (DR=CR, A=L+E)
  ✦ Approval Workflow (Finance → Manager → CFO)
  ✦ Data Archiving (Historical data)
```

**Deliverable**: ระบบตรวจสอบได้ มีประวัติการเปลี่ยนแปลง

---

## Phase 3B — Advanced Features 🔜

**ระยะเวลา ประมาณ**: ธ.ค. 2569 ขึ้นไป  
**เป้าหมาย**: Automation & Intelligence

```
  ✦ AI Cash Flow Forecast (ML-based prediction)
  ✦ ERP Integration (SAP, Oracle, Business Central API)
  ✦ Real-time Bank Sync (Open Banking API)
  ✦ Multi-Currency (USD, JPY, EUR)
  ✦ Mobile App (iOS/Android)
```

**เงื่อนไข**: เริ่มได้เมื่อ Phase 2B-3A สมบูรณ์และใช้งานจริงอยู่อย่างน้อย 3 เดือน

---

## Timeline Summary

```
มิ.ย. 2569    ████ Phase 2B Start (Backend)
              ┌─────────────────────────────┐
              │ 2B.1 Database + API     2w  │
              │ 2B.2 Authentication     1w  │
              │ 2B.3 Integration        1w  │
              └─────────────────────────────┘
ส.ค. 2569    ████ Phase 2C Start
              ┌─────────────────────────────┐
              │ 2C.1 Credit Analysis    2w  │
              │ 2C.2 Excel Upload       2w  │
              └─────────────────────────────┘
ต.ค. 2569    ████ Phase 3A Start
              ┌─────────────────────────────┐
              │ 3A.1 Advanced Reports   2w  │
              │ 3A.2 Audit & Governance 2w  │
              └─────────────────────────────┘
ธ.ค. 2569+   🔜 Phase 3B Advanced Features
```

---

## Definition of Done (นิยามของ "เสร็จ")

| Phase | เสร็จเมื่อ |
|-------|----------|
| **2B** | ทีม Finance บันทึกข้อมูลได้และเห็น Dashboard จริง ไม่หายหลัง refresh |
| **2C** | อัป Excel ได้, เห็น Cash Collection Schedule รายเดือน |
| **3A** | Manager ได้รับ PDF Report ทาง Email ทุกสิ้นเดือนอัตโนมัติ |
| **3B** | ดึงข้อมูลจาก ERP ได้โดยไม่ต้อง Upload Manual |

---

## Success Metrics ต่อ Phase

| Phase | KPI | เป้าหมาย |
|-------|-----|---------|
| **2B** | ผู้ใช้จริงล็อกอินได้ | ≥ 3 คน (Finance, Accounting, Manager) |
| **2B** | Data Persistence | 100% ไม่หายหลัง refresh |
| **2C** | Upload accuracy | > 99% |
| **2C** | Collection forecast accuracy | ± 10% จากจริง |
| **3A** | Report generation time | < 5 นาที |
| **3A** | Manual work reduced | ลด 80% จาก Excel เดิม |
| **3B** | ERP sync latency | < 1 ชั่วโมง |
