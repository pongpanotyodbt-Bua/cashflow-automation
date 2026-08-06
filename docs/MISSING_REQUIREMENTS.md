# MISSING REQUIREMENTS
# สิ่งที่ยังขาดและต้องการข้อมูลเพิ่มเติม

**วันที่**: 5 มิถุนายน 2569  
**จัดทำโดย**: CTO / Solution Architect  
**สถานะ**: 🔴 ต้องได้รับคำตอบก่อนพัฒนาต่อ  

---

## ภาพรวม

จากการวิเคราะห์ Repository ทั้งหมด พบว่ามี **ช่องว่างสำคัญ 4 ด้าน** ที่ยังไม่ได้กำหนดชัดเจน และจะส่งผลกระทบต่อการพัฒนาในระยะต่อไป

---

## ด้านที่ 1: ข้อมูลทางธุรกิจที่ยังไม่ได้กำหนด 🔴

### 1.1 Credit Term Policy ของลูกค้าแต่ละราย

**ปัญหา**: ระบบรู้แค่ว่ามีลูกหนี้ แต่ยังไม่รู้ว่าลูกค้าแต่ละรายมี Credit Term กี่วัน

**ต้องการข้อมูล**:
| ลูกค้า | Cash/Credit | Credit Days | Payment Behavior |
|--------|-----------|-------------|-----------------|
| ลูกค้า A | ? | ? วัน | ? |
| ลูกค้า B | ? | ? วัน | ? |
| ... | | | |

**ผลกระทบ**: ไม่สามารถสร้าง Expected Cash Collection Schedule ได้  
**ถามเจ้าของระบบ**: ลูกค้าแต่ละรายมี Credit Term กี่วัน? มีเอกสารสัญญาหรือข้อมูลใน BC ไหม?

---

### 1.2 Business Model ของแต่ละบริษัทในกลุ่ม

**ปัญหา**: ทราบชื่อบริษัท (ACG, HMW, CLIK) แต่ไม่รู้ว่าแต่ละบริษัทมีรูปแบบธุรกิจ/รายได้อย่างไรกันแน่

**ต้องการข้อมูล**:

| บริษัท | รูปแบบรายได้หลัก | สัดส่วน Cash vs Credit | ฤดูกาล (Seasonality) |
|--------|----------------|----------------------|---------------------|
| **ACG** (Holding) | Management Fee จาก HMW/CLIK | ? | ? |
| **HMW** (Honda) | ขายรถ + ซ่อม + ประกัน | ? % Cash, ? % Credit | ปลายปี/Q4 ยอดสูง? |
| **CLIK** (Service) | ค่าบริการ + B2B | ? % Cash, ? % Credit | ? |

**ผลกระทบ**: Forecast Model และ Cash Analysis อาจไม่ตรงกับความจริง  
**ถามเจ้าของระบบ**: แต่ละบริษัทรับเงินสดกี่เปอร์เซ็นต์? มีฤดูกาลขายดี/ขายน้อยไหม?

---

### 1.3 KPI ที่ผู้บริหารต้องการเห็น

**ปัญหา**: Dashboard ปัจจุบันแสดง KPI มาตรฐาน แต่ยังไม่รู้ว่า CFO/CEO ต้องการเห็นตัวเลขอะไรเป็นพิเศษ

**ต้องการข้อมูล**:
- CFO ใช้ Metric อะไรตัดสินใจ? (เช่น DSO, Cash Conversion Cycle)
- มี KPI เป้าหมาย (Target) ที่ต้องแสดงเปรียบเทียบไหม?
- มีการ Review Cash Flow บ่อยแค่ไหน? (รายวัน/รายสัปดาห์/รายเดือน)
- ต้องการ Alert เมื่อเงินสดต่ำกว่า X บาทไหม?

**ถามเจ้าของระบบ**: CFO ดู Cash Flow ตอนไหน? ดูตัวเลขอะไรก่อน?

---

### 1.4 Intercompany Transaction Rules

**ปัญหา**: ระบบรู้ว่ามี Intercompany (IC) transaction แต่ยังไม่รู้ว่า Consolidation ทำอย่างไร

**ต้องการข้อมูล**:
- ACG เรียกเก็บ Management Fee จาก HMW/CLIK — ตัดรายการยังไงตอน Consolidate?
- IC loans — กู้เงินระหว่างบริษัทในกลุ่มมีไหม?
- IC Dividend — มีจ่ายปันผลระหว่างกันไหม?

**ถามเจ้าของระบบ**: ทีม Accounting ทำ Consolidation ยังไงปัจจุบัน?

---

## ด้านที่ 2: ข้อมูลที่ต้องขอเพิ่มเติมจากเจ้าของระบบ 🟠

### 2.1 ระบบที่ใช้งานอยู่ปัจจุบัน (Current Systems)

| คำถาม | สำคัญสำหรับ |
|-------|-----------|
| ใช้ ERP ระบบอะไร? (Business Central, SAP, อื่นๆ) | Integration Planning |
| ใช้ Version อะไรของ BC? | API Compatibility |
| ใช้ Excel Sheet อะไรบ้างที่สำคัญ? | Upload Template Design |
| มีการ Export รายงานจาก BC ยังไง? | GL Import Format |
| ทีม Finance ทำงานบน Windows/Mac? | Tool Compatibility |

---

### 2.2 ผู้ใช้งาน (Users) และสิทธิ์ที่ต้องการ

**ปัจจุบันมี Role กำหนดไว้ 4 ระดับ แต่ยังไม่รู้ว่า**:

| คำถาม | สำคัญสำหรับ |
|-------|-----------|
| มีกี่คนที่ต้องใช้ระบบนี้? | License Planning |
| แต่ละ Role เห็นข้อมูลบริษัทไหนได้บ้าง? | Row-Level Security |
| Manager บางคนเห็นได้แค่บริษัทตัวเองไหม? | Access Control |
| มี Approval Workflow ไหม? (Finance กรอก → Manager Approve) | Workflow Design |
| ใครเป็น Admin ของระบบ? | Admin Setup |

---

### 2.3 ข้อกำหนดด้านความปลอดภัยและ Compliance

| คำถาม | สำคัญสำหรับ |
|-------|-----------|
| ข้อมูลต้องเก็บใน Server ไทยไหม? (Data Residency) | Hosting Decision |
| มีนโยบาย IT Security ขององค์กรที่ต้องทำตามไหม? | Security Design |
| ข้อมูลนี้จะถูก Audit จาก Auditor ภายนอกไหม? | Audit Trail Priority |
| ต้องการ 2-Factor Authentication ไหม? | Auth Config |
| มีนโยบาย Password ขั้นต่ำไหม? | Auth Config |

---

### 2.4 ข้อกำหนดด้าน Performance และการรองรับข้อมูล

| คำถาม | ค่าปัจจุบันในระบบ | ต้องการจริง |
|-------|----------------|-----------|
| ประวัติข้อมูลย้อนหลังกี่ปี? | 6 เดือน (Mock) | ? ปี |
| Transaction ต่อเดือนประมาณกี่รายการ? | ~2,000 (Mock) | ? รายการ |
| ต้องรองรับผู้ใช้พร้อมกันกี่คน? | 1 (Static) | ? คน |
| Dashboard ต้อง Load เร็วแค่ไหน? | 2 วิ (Mock) | < ? วิ |
| ต้องการ Backup ข้อมูลบ่อยแค่ไหน? | ไม่มี | ทุก ? ชั่วโมง |

---

### 2.5 Reporting ที่ต้องการ

| คำถาม | สำคัญสำหรับ |
|-------|-----------|
| รูปแบบรายงานที่ต้องการตรง Audit Standard ไหม? | Report Format |
| ต้องนำรายงานไปประกอบงบการเงินที่ยื่นภาษีไหม? | Compliance |
| ต้องการภาษาในรายงาน: ไทย หรือ อังกฤษ หรือทั้งคู่? | Report Template |
| ต้องการ Report เป็น Format อะไร? (PDF/Excel/Word) | Export Config |
| มีโลโก้บริษัทที่ต้องใส่ในรายงานไหม? | Template Design |

---

## ด้านที่ 3: ความเสี่ยงของโปรเจกต์ 🚨

### ความเสี่ยงสูง (High Risk)

| # | ความเสี่ยง | โอกาสเกิด | ผลกระทบ | แนวทางแก้ไข |
|---|-----------|---------|---------|-----------|
| R1 | **ไม่มี Backend** ทำให้ยังใช้งานจริงไม่ได้ | 🔴 เกิดแล้ว | สูงมาก | เริ่ม Backend Sprint ทันที |
| R2 | **ข้อมูล Mock ≠ ความจริง** — Logic อาจต้องปรับ | 🟡 ปานกลาง | สูง | นำ Real Data มาทดสอบก่อน Go-live |
| R3 | **ไม่มี Authentication** — ใครก็เข้าได้ถ้ารู้ URL | 🔴 เกิดแล้ว | สูงมาก | ทำ Auth ใน Sprint แรกสุด |
| R4 | **ERP Integration ยาก** — BC API อาจมี Limitation | 🟡 ปานกลาง | สูง | ทำ POC ก่อน commit |

### ความเสี่ยงปานกลาง (Medium Risk)

| # | ความเสี่ยง | แนวทางแก้ไข |
|---|-----------|-----------|
| R5 | **Data Quality** จาก Excel Upload ผิดพลาด | Validation rules + Error report |
| R6 | **User Adoption** — ทีมใช้ Excel คุ้นชินอยู่ | Training + ทำให้ง่ายกว่า Excel |
| R7 | **Scope Creep** — ขอฟีเจอร์เพิ่มตลอด | Lock Backlog, Release cycle ชัดเจน |
| R8 | **Single Developer** — Bottleneck | Document ทุกอย่าง, พิจารณาเพิ่มทีม |

### ความเสี่ยงต่ำ (Low Risk)

| # | ความเสี่ยง | แนวทางแก้ไข |
|---|-----------|-----------|
| R9 | **Vercel Cost** เพิ่มขึ้นเมื่อ Traffic มาก | Monitor Usage, ย้าย Plan ถ้าจำเป็น |
| R10 | **Browser Compatibility** | Test บน Chrome, Edge, Firefox |

---

## ด้านที่ 4: ปัญหาทางเทคนิคที่พบ 🔧

### ปัญหาสำคัญ

#### TP-001: ไม่มี Backend — Data หายทุกครั้งที่ Refresh
- **ระดับ**: 🔴 Critical
- **รายละเอียด**: ข้อมูลทั้งหมดอยู่ใน `src/data.js` (JavaScript Memory)
- **ผลกระทบ**: ระบบใช้งานจริงไม่ได้ — บันทึกข้อมูลแล้วหายทันที
- **แก้ไข**: Phase 2B — Backend API + PostgreSQL

#### TP-002: ไม่มีระบบ Login
- **ระดับ**: 🔴 Critical
- **รายละเอียด**: URL เดียวเข้าได้โดยไม่ต้อง Login
- **ผลกระทบ**: ข้อมูลการเงินเปิดเผยต่อสาธารณะ (ถ้ารู้ URL)
- **แก้ไข**: Phase 2B — Clerk Authentication

#### TP-003: ไม่มี Build System
- **ระดับ**: 🟡 Medium
- **รายละเอียด**: ใช้ React via CDN + Babel transpile ใน Browser (ช้ากว่า Production Build)
- **ผลกระทบ**: Load ช้าในบราวเซอร์, ไม่มี Tree-shaking, Bundle ใหญ่
- **แก้ไข**: เมื่อ Backend พร้อม — ย้ายไปใช้ Next.js + Build step จริง

#### TP-004: ไม่มี Automated Tests
- **ระดับ**: 🟡 Medium
- **รายละเอียด**: ทดสอบมือทุกครั้ง
- **ผลกระทบ**: Regression bugs เมื่อเพิ่มฟีเจอร์ใหม่
- **แก้ไข**: Phase 3A — เพิ่ม Jest + Cypress

#### TP-005: Mock Data ≠ Production Data Structure
- **ระดับ**: 🟡 Medium
- **รายละเอียด**: `data.js` ออกแบบเพื่อ Display เท่านั้น อาจต้องปรับ Schema เมื่อเชื่อม Backend จริง
- **ผลกระทบ**: อาจต้องเขียน Data transformation layer ใหม่
- **แก้ไข**: Database Schema review ก่อน Backend Development

#### TP-006: package.json ประกาศ Next.js แต่ไม่ได้ใช้จริง
- **ระดับ**: 🟢 Low
- **รายละเอียด**: `package.json` มี `next: ^14` แต่ระบบไม่ได้ใช้ Next.js framework จริง
- **ผลกระทบ**: สับสนสำหรับ Developer ใหม่
- **แก้ไข**: ชี้แจง Architecture ชัดเจน หรือ Migrate ไป Next.js จริงๆ ใน Phase 2B

---

## สรุปคำถามที่ต้องถามเจ้าของระบบ (Priority Order)

### ถามทันที 🔴 (ก่อนพัฒนา Backend)

1. **Credit Term ของลูกค้าแต่ละราย** — ต้องการสร้าง Collection Schedule
2. **ERP ที่ใช้ (BC version)** — สำคัญสำหรับ GL Import
3. **มีกี่คนจะใช้ระบบ** — กำหนด Role และ Access Control
4. **ข้อมูลต้องเก็บที่ไหน** — Cloud ไทยหรือต่างประเทศ OK?
5. **ต้องการย้อนหลังข้อมูลกี่ปี** — Database sizing

### ถามในอีก 2-4 สัปดาห์ 🟡

6. **KPI ที่ CFO ดูประจำ** — ออกแบบ Dashboard ให้ตรง
7. **Approval Workflow ที่ต้องการ** — ออกแบบ Process
8. **Format รายงานที่ใช้กับ Auditor** — ออกแบบ Report
9. **Seasonality ของแต่ละธุรกิจ** — ปรับ Forecast Model

---

## Template ใบขอข้อมูลจากเจ้าของระบบ

```
วันที่: ___________
ผู้ให้ข้อมูล: ___________
ผู้รับข้อมูล: ___________

1. Credit Term ของลูกค้า:
   [ ] ดู BC         [ ] ดูสัญญา     [ ] ถามทีม AR

2. ERP Version:
   Business Central Version: ___________
   URL / Server: ___________

3. จำนวนผู้ใช้:
   Admin: ___ คน
   Finance User: ___ คน
   Accounting User: ___ คน
   Manager: ___ คน

4. ประวัติข้อมูล:
   ย้อนหลัง: ___ ปี / ตั้งแต่: ___________

5. ข้อกำหนด IT Security:
   [ ] มีนโยบาย IT Security ขององค์กร (แนบเอกสาร)
   [ ] ต้องการ 2FA: Yes / No
   [ ] Data Residency: ไทย / ต่างประเทศ OK

หมายเหตุ: ___________________________________________
```
