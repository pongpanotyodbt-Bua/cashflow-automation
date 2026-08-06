# PROJECT BACKLOG
# ระบบบริหารกระแสเงินสด (Cashflow Management System)

**วันที่อัปเดต**: 5 มิถุนายน 2569  
**สถานะ**: Active Development  

---

## คำอธิบายระดับความสำคัญ

| สัญลักษณ์ | ความหมาย |
|---------|---------|
| 🔴 P0 | Critical — ระบบใช้งานจริงไม่ได้ถ้าขาดสิ่งนี้ |
| 🟠 P1 | High — สำคัญมาก ควรทำใน Sprint ถัดไป |
| 🟡 P2 | Medium — ทำเมื่อ P0/P1 เสร็จแล้ว |
| 🟢 P3 | Low — Nice to have / Phase 3 |

---

## EPIC 1: Backend Infrastructure 🔴 (ยังไม่เริ่ม)

> ปัจจุบันทั้งระบบรันบน Frontend อย่างเดียว ข้อมูลหายทุกครั้งที่รีเฟรชหน้า

### BL-001 — สร้าง Backend API Server
- **ประมาณเวลา**: 2 สัปดาห์
- **Priority**: 🔴 P0
- **รายละเอียด**:
  - เลือก Framework: Node.js + Express หรือ NestJS
  - สร้าง REST API สำหรับ CRUD ทุก Module
  - เชื่อมต่อกับ PostgreSQL Database
  - Deploy บน Vercel Functions หรือ Railway
- **Acceptance Criteria**:
  - [ ] API endpoints ทำงานได้ (GET, POST, PUT, DELETE)
  - [ ] ข้อมูลบันทึกถาวรใน Database
  - [ ] Error handling ครบถ้วน
  - [ ] API Documentation (Swagger/OpenAPI)

### BL-002 — ติดตั้ง Database (PostgreSQL)
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🔴 P0
- **รายละเอียด**:
  - ออกแบบ Database Schema จาก Data Model ที่มี
  - สร้าง Migration Scripts
  - นำเข้าข้อมูล Sample Data (97 GL accounts, ~2000 transactions)
  - ตั้งค่า Connection Pooling
- **Acceptance Criteria**:
  - [ ] Schema ตรงกับ Data Model ใน REQUIREMENT.md
  - [ ] Migration รันได้ทั้ง up / down
  - [ ] Sample data โหลดสำเร็จ
  - [ ] DB backup / restore ทำได้

### BL-003 — Authentication & Authorization
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🔴 P0
- **รายละเอียด**:
  - ติดตั้ง Clerk หรือ Auth0 (แนะนำ Clerk เพราะง่ายสุด)
  - สร้าง Role: Admin, Finance User, Accounting User, Manager
  - ควบคุมสิทธิ์เข้าถึงแต่ละ Module ตาม Role
  - JWT Token validation ทุก API call
- **Acceptance Criteria**:
  - [ ] Login / Logout ทำงานได้
  - [ ] Role ต่างกัน เห็นเมนูต่างกัน
  - [ ] ป้องกัน Unauthorized access ทุก API
  - [ ] Session timeout ทำงานได้

### BL-004 — เชื่อมต่อ Frontend กับ Backend API
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🔴 P0
- **รายละเอียด**:
  - แทน Mock data.js ด้วย API calls จริง
  - Loading states และ Error states
  - Data caching (SWR หรือ React Query)
  - Optimistic updates
- **Acceptance Criteria**:
  - [ ] ข้อมูลโหลดจาก API ไม่ใช่ Mock
  - [ ] บันทึกข้อมูลแล้วคงอยู่หลัง refresh
  - [ ] แสดง Loading indicator ระหว่างโหลด
  - [ ] Error message ชัดเจนเมื่อ API ล้มเหลว

---

## EPIC 2: Credit Term Analysis 🟠 (กำลังพัฒนา 40%)

> วิเคราะห์ว่าเงินจะเข้าเมื่อไหร่ — Revenue ≠ Cash concept

### BL-010 — Credit Term Mapping per Customer
- **ประมาณเวลา**: 3 วัน
- **Priority**: 🟠 P1
- **รายละเอียด**:
  - เพิ่มฟิลด์ Credit Term (0/30/60/90 วัน) ใน Customer Master
  - Map ลูกค้าแต่ละรายว่าเป็น Cash หรือ Credit
  - คำนวณ Expected Payment Date = Invoice Date + Credit Term
- **Acceptance Criteria**:
  - [ ] กำหนด Credit Term รายลูกค้าได้
  - [ ] ระบบคำนวณ Due Date อัตโนมัติ
  - [ ] แสดงในหน้า AR Aging

### BL-011 — Expected Cash Collection Schedule
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🟠 P1
- **รายละเอียด**:
  - แสดงตาราง: เดือนนี้จะรับเงินจาก Invoice เดือนไหนบ้าง
  - คำนวณ Cash Inflow Projection 3 เดือนข้างหน้า
  - แยกชัดเจนระหว่าง Revenue Recognized vs Cash Received
- **Acceptance Criteria**:
  - [ ] ตารางแสดง Expected Collection by Month
  - [ ] กราฟ Revenue vs Cash Received
  - [ ] Export ได้

### BL-012 — Cash vs Credit Customer Dashboard
- **ประมาณเวลา**: 3 วัน
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - Pie/Bar chart แสดงสัดส่วน Cash vs Credit Sales
  - Metric: Collection Efficiency (% เก็บเงินได้ตรงเวลา)
  - Trend: แนวโน้ม Credit Term ยาวขึ้น/สั้นลง
- **Acceptance Criteria**:
  - [ ] Chart แสดงถูกต้อง
  - [ ] Metric คำนวณจากข้อมูลจริง

---

## EPIC 3: Data Upload (Excel/CSV) 🟠

> ปัจจุบันมี Template แล้ว 12 ไฟล์ แต่ยังไม่มี Upload Processing จริง

### BL-020 — Excel Upload & Parsing
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🟠 P1
- **รายละเอียด**:
  - รับไฟล์ Excel ตาม Template ที่กำหนด (12 templates)
  - Validate format ก่อน Import (Header match, data types)
  - แสดง Preview ก่อน Confirm
  - Import สำเร็จ → บันทึกลง Database
- **Acceptance Criteria**:
  - [ ] Upload ทุก Template ได้สำเร็จ
  - [ ] Validation error แสดงชัดเจน (บรรทัดที่ผิด, field ที่ผิด)
  - [ ] Duplicate detection (ไม่ Import ซ้ำ)
  - [ ] Import Summary (กี่แถวสำเร็จ, กี่แถวผิด)

### BL-021 — GL Import from Business Central
- **ประมาณเวลา**: 2 สัปดาห์
- **Priority**: 🟠 P1
- **รายละเอียด**:
  - Map GL Account จาก Business Central → ระบบเรา
  - รองรับ Excel Export จาก BC (format ที่ใช้งานจริง)
  - Auto-classify GL entries → CF Activity
- **Acceptance Criteria**:
  - [ ] Import GL จาก BC Excel Export ได้
  - [ ] Account Mapping ถูกต้อง 100%
  - [ ] CF Classification อัตโนมัติ

---

## EPIC 4: Reporting Enhancement 🟡

### BL-030 — Multi-Period Comparison Report
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - เปรียบเทียบ CF เดือนนี้ vs เดือนก่อน vs ปีก่อน
  - Variance Analysis (เพิ่ม/ลด เท่าไหร่, กี่ %)
  - แสดง Trend 12 เดือน

### BL-031 — Budget vs Actual Analysis
- **ประมาณเวลา**: 2 สัปดาห์
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - กรอก Budget เป้าหมายรายเดือน
  - เปรียบเทียบ Actual CF vs Budget
  - แสดง Variance และ % Achievement

### BL-032 — Consolidated Report (Group Level)
- **ประมาณเวลา**: 1 สัปดาห์
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - รวม CF ของ ACG + HMW + CLIK
  - Eliminate Intercompany transactions
  - แสดง Group Cash Position

### BL-033 — Scheduled Report Email
- **ประมาณเวลา**: 3 วัน
- **Priority**: 🟢 P3
- **รายละเอียด**:
  - ส่ง Monthly Report อัตโนมัติทาง Email
  - กำหนดผู้รับตาม Role
  - PDF แนบมากับ Email

---

## EPIC 5: Audit Trail & Data Integrity 🟡

### BL-040 — Audit Log
- **ประมาณเวลา**: 3 วัน
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - บันทึกทุกการแก้ไข: ใคร, แก้อะไร, เมื่อไหร่
  - ดู History ของแต่ละ Transaction ได้
  - Filter / Export Audit Log

### BL-041 — Data Validation Rules
- **ประมาณเวลา**: 3 วัน
- **Priority**: 🟡 P2
- **รายละเอียด**:
  - ตรวจสอบ: DR = CR ทุก Journal Entry
  - ตรวจสอบ: Assets = Liabilities + Equity
  - Alert เมื่อพบความไม่สอดคล้อง

---

## EPIC 6: Advanced Features 🟢 (Phase 3)

### BL-050 — AI Cash Flow Forecast
- **Priority**: 🟢 P3
- **รายละเอียด**: ML Model คาดการณ์ CF จาก Historical Patterns

### BL-051 — ERP Integration
- **Priority**: 🟢 P3
- **รายละเอียด**: API เชื่อมตรงกับ SAP, Oracle, Dynamics, Xero

### BL-052 — Real-time Bank Sync
- **Priority**: 🟢 P3
- **รายละเอียด**: ดึงยอด Bank Transaction อัตโนมัติผ่าน Open Banking API

### BL-053 — Multi-Currency Support
- **Priority**: 🟢 P3
- **รายละเอียด**: รองรับ USD, JPY นอกจาก THB

### BL-054 — Mobile App
- **Priority**: 🟢 P3
- **รายละเอียด**: Version สำหรับมือถือ (iOS/Android)

---

## Sprint Planning ที่แนะนำ

### Sprint 1 (สัปดาห์ 1-2): Backend Foundation
```
BL-002 ติดตั้ง PostgreSQL + Design Schema
BL-001 สร้าง Backend API (CRUD endpoints)
```

### Sprint 2 (สัปดาห์ 3): Authentication
```
BL-003 ติดตั้ง Clerk + Roles
BL-004 เชื่อม Frontend กับ API
```

### Sprint 3 (สัปดาห์ 4-5): Data Upload
```
BL-020 Excel Upload & Parsing
BL-021 GL Import จาก Business Central
```

### Sprint 4 (สัปดาห์ 6): Credit Analysis
```
BL-010 Credit Term Mapping
BL-011 Expected Cash Collection Schedule
```

### Sprint 5 (สัปดาห์ 7-8): Reports & Polish
```
BL-030 Multi-Period Comparison
BL-040 Audit Log
BL-041 Data Validation
```

---

## Backlog Summary

| EPIC | Items | สถานะ |
|------|-------|-------|
| Backend Infrastructure | 4 | ❌ ยังไม่เริ่ม |
| Credit Term Analysis | 3 | ⚠️ บางส่วน |
| Data Upload | 2 | ⚠️ Template พร้อม |
| Reporting Enhancement | 4 | ⏳ รอ Backend |
| Audit Trail | 2 | ⏳ รอ Backend |
| Advanced Features | 5 | 🔜 Phase 3 |
| **รวมทั้งหมด** | **20** | |
