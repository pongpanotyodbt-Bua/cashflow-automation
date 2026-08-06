# PROJECT HANDOVER DOCUMENT
# ระบบบริหารกระแสเงินสด (Cashflow Management System)

**วันที่จัดทำ**: 5 มิถุนายน 2569  
**เวอร์ชัน**: 1.0  
**จุดประสงค์**: เอกสารนี้ช่วยให้ Developer หรือ AI ใหม่เข้าใจโปรเจกต์ทั้งหมดได้ทันที โดยไม่ต้องอ่านทุกไฟล์ใน Repository  

---

## สารบัญ

1. [Executive Summary](#1-executive-summary)
2. [Business Objective](#2-business-objective)
3. [Scope](#3-scope)
4. [User Roles](#4-user-roles)
5. [System Workflow](#5-system-workflow)
6. [Data Sources](#6-data-sources)
7. [Database Overview](#7-database-overview)
8. [Cash Flow Logic](#8-cash-flow-logic)
9. [Existing Modules](#9-existing-modules)
10. [Current Progress](#10-current-progress)
11. [Missing Requirements](#11-missing-requirements)
12. [Open Questions](#12-open-questions)
13. [Next Recommended Actions](#13-next-recommended-actions)

---

## 1. Executive Summary

### โปรเจกต์คืออะไร

**Cashflow Management System** คือระบบ Web Application สำหรับบริหารและวิเคราะห์กระแสเงินสด (Cash Flow) ของกลุ่มบริษัท ACG ซึ่งประกอบด้วย 3 บริษัทในเครือ ได้แก่:

| บริษัท | ชื่อเต็ม | ประเภทธุรกิจ |
|--------|---------|------------|
| **ACG** | Autocorp Holding | บริษัทแม่ (Holding Company) |
| **HMW** | Honda Maliwan | ตัวแทนจำหน่ายรถยนต์ Honda |
| **CLIK** | Autoclick | ธุรกิจบริการและซ่อมบำรุง |
| **CONSO** | Group Consolidated | มุมมองรวมกลุ่ม (Consolidated View) |

### สถานะปัจจุบัน (ณ วันที่จัดทำเอกสาร)

```
Frontend / UI          ████████████████████ 100% ✅ สมบูรณ์
Cash Flow Logic        ████████████████████  95% ✅ สมบูรณ์
Sample Data            ████████████████████  90% ✅ ตรวจสอบกับงบจริงแล้ว
Backend / Database     ░░░░░░░░░░░░░░░░░░░░   0% ❌ ยังไม่มี
Authentication         ░░░░░░░░░░░░░░░░░░░░   0% ❌ ยังไม่มี
Production-Ready       ███░░░░░░░░░░░░░░░░░  15% ⚠️ ยังไม่พร้อมใช้จริง
```

### จุดสำคัญที่ต้องเข้าใจก่อน

> ⚠️ **ระบบนี้คือ High-Quality Prototype ไม่ใช่ Production System**
> 
> - ข้อมูลทั้งหมดอยู่ในหน่วยความจำ (JavaScript Memory) → **หายทุกครั้งที่ Refresh**
> - ไม่มีระบบ Login → ใครรู้ URL ก็เข้าได้
> - ไม่มี Database → ไม่สามารถบันทึกข้อมูลถาวรได้
> - ตัวเลขที่แสดงใน Dashboard คือ **ข้อมูลสมมติ (Mock Data)** ไม่ใช่ข้อมูลจริงของบริษัท

### Live URL
```
https://cashflow-management-alpha.vercel.app
```

---

## 2. Business Objective

### ปัญหาที่ระบบนี้ต้องแก้

กลุ่มบริษัท ACG มีปัญหาด้านข้อมูลการเงิน ดังนี้:

| ปัญหา | ผลกระทบต่อธุรกิจ |
|------|----------------|
| ข้อมูลกระจายอยู่ใน Excel หลายไฟล์ | ใช้เวลาหลายวันในการรวบรวมข้อมูล |
| ไม่มี Dashboard รวมศูนย์ | CFO/CEO มองภาพรวมเงินสดไม่ได้ |
| ไม่แยก Revenue กับ Cash | ไม่รู้ว่าเงินจะเข้าจริงเมื่อไหร่ |
| ไม่มี Cash Flow Forecast | วางแผนการเงินล่วงหน้าลำบาก |
| ทีม Finance, AR, Accounting ทำงานแยกกัน | ข้อมูลไม่สอดคล้องกัน |

### สิ่งที่ระบบต้องทำได้

1. **รวมข้อมูล** จาก Finance, AR, Accounting ไว้ในที่เดียว
2. **คำนวณ Cash Flow** อัตโนมัติ — ทั้ง Direct Method และ Indirect Method ตามมาตรฐาน TAS 7
3. **แสดง Dashboard** ให้ CFO/CEO เห็นสถานะเงินสด Real-Time
4. **วิเคราะห์ Credit Term** — แยกรายได้ที่ออก Invoice แล้ว กับเงินที่รับจริง
5. **สร้างรายงาน** สำหรับผู้บริหารและ Auditor

### Business Rule ที่สำคัญที่สุด: Revenue ≠ Cash

```
ตัวอย่าง:
  1 มกราคม  → ออก Invoice ให้ลูกค้า 1,000,000 บาท
              → บันทึก Revenue: มกราคม +1,000,000 บาท (P&L)
  1 กุมภาพันธ์ → ลูกค้าจ่ายเงินจริง (Credit Term 30 วัน)
              → บันทึก Cash In: กุมภาพันธ์ +1,000,000 บาท (Cash Flow)

ผล: มกราคม Revenue สูง แต่ Cash เป็นศูนย์
    กุมภาพันธ์ Revenue ศูนย์ แต่ Cash เข้า 1,000,000 บาท
```

ระบบต้องแสดงทั้งสอง Perspective แยกจากกันชัดเจน

---

## 3. Scope

### ขอบเขตที่อยู่ในระบบ (In Scope)

#### Phase 1 — MVP Core ✅ (สำเร็จแล้ว)
- Dashboard แสดง KPI กระแสเงินสด
- กรอกข้อมูล Finance (Bank, รับเงิน, จ่ายเงิน)
- กรอกข้อมูล Accounting (GL, AR Aging, AP Aging, Inventory)
- คำนวณ Cash Flow Direct Method
- คำนวณ Cash Flow Indirect Method (TAS 7)
- Forecast กระแสเงินสด 8 สัปดาห์
- Export PDF และ Excel
- รองรับ 4 หน่วยงาน: ACG, HMW, CLIK, CONSO

#### Phase 2 — Enhanced (กำลังพัฒนา)
- Credit Term Analysis — แสดงว่าเงินจะเข้าเดือนไหน
- Excel Upload สำหรับ Import ข้อมูล
- GL Import จาก Business Central
- Multi-period Comparison
- Audit Trail

#### Phase 3 — Advanced (ยังไม่เริ่ม)
- AI Cash Flow Forecasting
- ERP Integration (SAP, Oracle, Dynamics, Xero)
- Real-time Bank Sync
- Multi-currency (USD, JPY)
- Mobile Application

### ขอบเขตที่ไม่อยู่ในระบบ (Out of Scope)

- ระบบบัญชี (ไม่ใช่ ERP/Accounting Software)
- ระบบ Payroll
- ระบบ Tax Filing
- Multi-currency (Phase 3)
- Budget Planning แบบ Full-featured
- Mobile App (Phase 3)

---

## 4. User Roles

### บทบาทผู้ใช้งาน 4 ระดับ

#### Admin
- **หน้าที่**: จัดการระบบ, จัดการสิทธิ์ผู้ใช้, กำหนด CF Mapping
- **เห็นข้อมูล**: ทุกอย่าง
- **แก้ไขได้**: ทุกอย่าง รวม Settings และ User Management
- **ตัวอย่างผู้ใช้**: IT Manager, System Administrator

#### Finance User
- **หน้าที่**: บันทึกและ Upload ข้อมูลการเงิน
- **เห็นข้อมูล**: Finance Input, Dashboard (View Only)
- **แก้ไขได้**: Bank Transactions, Cash Receipts, Cash Payments
- **ตัวอย่างผู้ใช้**: Finance Officer, Treasury Staff

#### Accounting User
- **หน้าที่**: บันทึกและ Upload ข้อมูลบัญชี
- **เห็นข้อมูล**: Accounting Input, Dashboard (View Only)
- **แก้ไขได้**: GL Entries, AR/AP Aging, Inventory
- **ตัวอย่างผู้ใช้**: Accountant, GL Officer

#### Manager
- **หน้าที่**: ดู Dashboard, ดู Report, วิเคราะห์
- **เห็นข้อมูล**: Dashboard, Reports, Forecast ทั้งหมด
- **แก้ไขได้**: ไม่สามารถแก้ไขข้อมูลได้ (View Only)
- **ตัวอย่างผู้ใช้**: CFO, Finance Director, CEO

### Matrix สิทธิ์การเข้าถึง

| Module | Admin | Finance | Accounting | Manager |
|--------|-------|---------|------------|---------|
| Dashboard | ✅ | ✅ View | ✅ View | ✅ View |
| Finance Input | ✅ | ✅ Edit | ❌ | ❌ |
| Accounting Input | ✅ | ❌ | ✅ Edit | ❌ |
| Reports | ✅ | ✅ View | ✅ View | ✅ View |
| Forecast | ✅ | ✅ View | ✅ View | ✅ View |
| Export | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

> ⚠️ **หมายเหตุ**: Role-based Access ยังไม่ได้ Implement จริง เพราะยังไม่มีระบบ Authentication

---

## 5. System Workflow

### Workflow หลักของระบบ

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INPUT LAYER                             │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Finance   │    │ Accounting  │    │     AR      │         │
│  │    Team     │    │    Team     │    │    Team     │         │
│  │             │    │             │    │             │         │
│  │ Bank Txn    │    │ GL Entries  │    │ Invoices    │         │
│  │ Cash In/Out │    │ Trial Bal.  │    │ Credit Term │         │
│  │ AP/PN Pay   │    │ AR/AP Aging │    │ Collections │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                   │                │
│  ┌──────▼──────────────────▼───────────────────▼──────┐        │
│  │           UPLOAD / MANUAL ENTRY                     │        │
│  │     (Excel Templates / Direct Input Form)           │        │
│  └──────────────────────────┬──────────────────────────┘        │
└─────────────────────────────│───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                   PROCESSING LAYER                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Cash Flow Engine                         │   │
│  │                                                          │   │
│  │   Direct Method          Indirect Method                 │   │
│  │   Cash In - Cash Out     Net Profit ± Adjustments        │   │
│  │   per TAS 7              per TAS 7                       │   │
│  │                                                          │   │
│  │   + Revenue vs Cash Reconciliation                       │   │
│  │   + Credit Term Analysis                                 │   │
│  │   + Intercompany Elimination                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Consolidation Engine                        │   │
│  │                                                          │   │
│  │   ACG + HMW + CLIK → CONSO (หัก Intercompany)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    OUTPUT LAYER                                 │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Reports  │  │ Forecast │  │  Export  │       │
│  │          │  │          │  │          │  │          │       │
│  │KPI Cards │  │Direct CF │  │8-Week    │  │PDF       │       │
│  │Trend     │  │Indirect  │  │3 Scenar. │  │Excel     │       │
│  │Segment   │  │Cross-Val │  │Bear/Base │  │Working   │       │
│  │AR/AP Age │  │Work Paper│  │/Bull     │  │Paper     │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│                   [CFO / Finance Director / Manager]            │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow การ Upload ข้อมูล (เมื่อ Backend พร้อม)

```
1. ดาวน์โหลด Template Excel (12 แม่แบบ)
   ↓
2. กรอกข้อมูลใน Template
   ↓
3. Upload ไฟล์เข้าระบบ
   ↓
4. ระบบ Validate ข้อมูล (format, completeness, duplicates)
   ↓
5. แสดง Preview + Error Summary
   ↓
6. User Confirm → บันทึกลง Database
   ↓
7. Dashboard อัปเดตอัตโนมัติ
```

### Workflow การดู Cash Flow Report

```
1. เลือกบริษัท (ACG / HMW / CLIK / CONSO)
   ↓
2. เลือกช่วงเวลา (เดือน / ไตรมาส)
   ↓
3. เลือก Method (Direct / Indirect)
   ↓
4. ระบบคำนวณและแสดงผล
   ↓
5. Drill-down รายการที่ต้องการ
   ↓
6. Export PDF หรือ Excel
```

---

## 6. Data Sources

### แหล่งข้อมูลที่ระบบต้องการ

#### 6.1 Finance Department (ฝ่ายการเงิน)

| ข้อมูล | รายละเอียด | Format ที่รองรับ |
|-------|-----------|---------------|
| Bank Transactions | รายการเดินบัญชีทุกบัญชีธนาคาร | Excel, CSV |
| Cash Receipts | เงินรับจากลูกค้า | Excel, CSV |
| Cash Payments | เงินจ่ายให้ Supplier/Vendor | Excel, CSV |
| AP Honda | ยอดค้างชำระ Honda Parts | Excel |
| PN Payments | การชำระ Promissory Note | Excel |
| Inter-account Transfers | โอนเงินระหว่างบัญชี | Excel, CSV |

#### 6.2 Accounting Department (ฝ่ายบัญชี)

| ข้อมูล | รายละเอียด | Format ที่รองรับ |
|-------|-----------|---------------|
| GL Journal | สมุดรายวันทั่วไป | Excel (BC Export), CSV |
| Trial Balance | งบทดลอง | Excel |
| AR Aging | ลูกหนี้แยกตามอายุ | Excel, CSV |
| AP Aging | เจ้าหนี้แยกตามอายุ | Excel, CSV |
| Inventory | สินค้าคงเหลือ | Excel, CSV |
| Fixed Assets | ทะเบียนสินทรัพย์ถาวร | Excel |

#### 6.3 AR Department (ฝ่ายลูกหนี้)

| ข้อมูล | รายละเอียด | Format ที่รองรับ |
|-------|-----------|---------------|
| AR Invoices | ใบแจ้งหนี้ที่ออกแล้ว | Excel, CSV |
| Customer Master | ข้อมูลลูกค้า + Credit Term | Excel |
| Cash Receipts | เงินที่รับจากลูกค้าจริง | Excel, CSV |
| Collection Schedule | กำหนดการรับเงิน | Excel |

#### 6.4 Excel Templates ที่เตรียมไว้แล้ว (12 ไฟล์)

```
templates/
├── 00_README_Index.xlsx          — คู่มือการใช้ Template
├── 01_GL_Template.xlsx           — GL Journal Entry
├── 02_Trial_Balance_Template.xlsx — งบทดลอง
├── 03_AR_Invoices_Template.xlsx  — ใบแจ้งหนี้ลูกหนี้
├── 04_AP_Bills_Template.xlsx     — ใบแจ้งหนี้เจ้าหนี้
├── 05_Bank_Transactions_Template.xlsx — รายการธนาคาร
├── 06_Cash_Receipts_Template.xlsx — รายการเงินรับ
├── 07_Cash_Payments_Template.xlsx — รายการเงินจ่าย
├── 08_Customer_Master_Template.xlsx — ข้อมูลลูกค้า
├── 09_Vendor_Master_Template.xlsx — ข้อมูล Supplier
├── 10_Inventory_Template.xlsx    — สินค้าคงเหลือ
└── 11_CF_Mapping_Template.xlsx   — CF Activity Mapping
```

#### 6.5 ข้อมูลจริงที่มีอยู่แล้วในโปรเจกต์

```
Finance Statement/
├── ACG/
│   ├── Q1'26/FINANCIAL_STATEMENTS.XLSX  — งบจริง ACG Q1/2569
│   └── Year 25/FINANCIAL_STATEMENTS.XLSX — งบจริง ACG ปี 2568
├── HMW/
│   ├── HMW_BS.xlsx  — งบดุล HMW
│   └── HMW_PL.xlsx  — งบกำไรขาดทุน HMW
└── CLIK/
    ├── CLIK_BS.xlsx — งบดุล CLIK
    └── CLIK_PL.xlsx — งบกำไรขาดทุน CLIK
```

---

## 7. Database Overview

### สถานะปัจจุบัน: ยังไม่มี Database

ปัจจุบันข้อมูลทั้งหมดอยู่ใน `src/data.js` (JavaScript Object ในหน่วยความจำ)

### Database Schema ที่ต้องสร้าง (PostgreSQL)

#### Core Tables

```sql
-- บริษัท
companies
  id, code (ACG/HMW/CLIK/CONSO), name_th, name_en,
  type (HOLDING/SUBSIDIARY/CONSOLIDATED), parent_id,
  currency, fiscal_year_start

-- ผู้ใช้งาน
users
  id, email, name, role (ADMIN/FINANCE/ACCOUNTING/MANAGER),
  company_access (array), is_active, created_at

-- ผังบัญชี (Chart of Accounts)
chart_of_accounts
  id, account_code, account_name_th, account_name_en,
  account_type (ASSET/LIABILITY/EQUITY/INCOME/EXPENSE),
  statement (BS/PL), normal_balance (DR/CR), parent_id,
  cf_activity (O/I/F), cf_segment (F1/I1/O1-O6)

-- สมุดรายวัน (GL Journal)
gl_journal
  id, date, entity_id, account_id, debit, credit,
  description, reference, source, created_by, created_at

-- ใบแจ้งหนี้ลูกหนี้ (AR Invoices)
ar_invoices
  id, invoice_number, company_id, customer_id,
  invoice_date, due_date, amount, credit_term_days,
  payment_date, amount_paid, status (PENDING/PARTIAL/PAID)

-- ใบแจ้งหนี้เจ้าหนี้ (AP Bills)
ap_bills
  id, bill_number, company_id, vendor_id,
  bill_date, due_date, amount, credit_term_days,
  payment_date, amount_paid, status

-- รายการธนาคาร (Bank Transactions)
bank_transactions
  id, date, bank_account_id, type (IN/OUT/TRANSFER),
  amount, balance_after, description, reference,
  reconciled, created_by

-- บัญชีธนาคาร
bank_accounts
  id, company_id, account_number, bank_name,
  account_type, currency, gl_account_id, is_active

-- ลูกค้า
customers
  id, company_id, customer_code, name,
  customer_type (CASH/CREDIT), credit_term_days,
  credit_limit, contact_info

-- Supplier/Vendor
vendors
  id, company_id, vendor_code, name,
  payment_term_days, contact_info

-- CF Mapping (GL → CF Activity)
cf_mapping
  id, account_id, cf_activity (O/I/F),
  cf_segment (F1/I1/O1-O6), direction (IN/OUT)

-- Audit Log
audit_logs
  id, table_name, record_id, action (CREATE/UPDATE/DELETE),
  old_values (JSON), new_values (JSON),
  user_id, timestamp
```

#### Relationships

```
companies ──< gl_journal
companies ──< ar_invoices ──< customers
companies ──< ap_bills    ──< vendors
companies ──< bank_transactions ──< bank_accounts
chart_of_accounts ──< gl_journal
chart_of_accounts ──< cf_mapping
users ──< audit_logs
```

### ข้อมูล Sample ที่เตรียมไว้แล้ว

```
sample-data/
├── master/
│   ├── 01_companies.csv         — 4 บริษัท
│   ├── 02_chart_of_accounts.csv — 97 บัญชี (TAS 7 structure)
│   ├── 03_customers.csv         — ลูกค้า 8 ราย
│   ├── 04_vendors.csv           — Vendor 5 ราย
│   ├── 05_fixed_assets.csv      — ทะเบียนสินทรัพย์
│   ├── 06_loans.csv             — เงินกู้ (920M proceeds, 1,020M repaid)
│   ├── 07_leases_tfrs16.csv     — Lease TFRS 16
│   └── 08_intercompany.csv      — รายการ IC
├── transactions/
│   ├── gl_journal.csv           — ~2,000 รายการ (ยืนยันกับงบจริงแล้ว)
│   ├── ar_invoices.csv          — ใบแจ้งหนี้
│   ├── ar_receipts.csv          — การรับชำระ
│   ├── ap_bills.csv             — ใบแจ้งหนี้จ่าย
│   ├── ap_payments.csv          — การชำระเจ้าหนี้
│   ├── bank_transactions.csv    — รายการธนาคาร
│   └── ... (อื่นๆ)
└── reconciliation/
    ├── fs_targets_2568.csv      — เป้าหมายงบการเงินจริง
    └── fs_vs_tb_reconciliation.csv — ผล Reconcile
```

**ผลการตรวจสอบ Sample Data**:
- ✅ DR = CR ทุก Journal Entry
- ✅ Assets = Liabilities + Equity (ทุกบริษัท)
- ✅ ตัวเลขตรงกับงบการเงินจริงของ ACG/HMW/CLIK

---

## 8. Cash Flow Logic

### มาตรฐานที่ใช้: TAS 7 (Thai Accounting Standard 7) = IAS 7

### 8.1 โครงสร้าง Cash Flow Statement (3 Activities)

```
CASH FLOW STATEMENT
══════════════════════════════════════════════════════

1. กิจกรรมดำเนินงาน (Operating Activities — "O")
   ├── Segment O1: ค่าใช้จ่ายพนักงาน
   ├── Segment O2: สินค้าคงเหลือและต้นทุน
   ├── Segment O3: ค่าจ้างเหมา
   ├── Segment O4: ค่าเช่าและสิ่งอำนวยความสะดวก
   ├── Segment O5: ภาษี
   └── Segment O6: อื่นๆ (ค่าเสื่อม, หนี้สูญ)

2. กิจกรรมลงทุน (Investing Activities — "I")
   └── Segment I1: ซื้อ/ขายสินทรัพย์ถาวร, Capex

3. กิจกรรมจัดหาเงิน (Financing Activities — "F")
   └── Segment F1: เงินกู้, ดอกเบี้ย, Lease Payment

══════════════════════════════════════════════════════
Net Cash Flow = Operating + Investing + Financing
Closing Balance = Opening Balance + Net Cash Flow
```

### 8.2 Direct Method (วิธีตรง)

ใช้ยอดเงินสดที่รับและจ่ายจริง

```
เงินสดรับจากลูกค้า (Cash from Customers)
  = Revenue - เพิ่มขึ้นใน AR + ลดลงใน AR

เงินสดจ่ายให้ Supplier (Cash to Suppliers)
  = Cost of Goods - เพิ่มขึ้นใน AP + สินค้าคงเหลือเพิ่ม

เงินสดจ่ายค่าใช้จ่ายอื่น (Other Operating Cash)
  = ค่าพนักงาน + ค่าเช่า + ภาษี + อื่นๆ (จ่ายจริง)

กระแสเงินสดจากกิจกรรมดำเนินงาน
= เงินรับจากลูกค้า - เงินจ่ายทั้งหมด
```

### 8.3 Indirect Method (วิธีอ้อม)

เริ่มจากกำไรสุทธิ แล้วปรับด้วยรายการที่ไม่ใช่เงินสด

```
กำไรสุทธิก่อนภาษี (Net Profit Before Tax)
  + ค่าเสื่อมราคา PPE (Depreciation — non-cash)
  + ค่าเสื่อมสิทธิ์การใช้ ROU Assets (TFRS 16)
  + ค่าตัดจำหน่าย (Amortization)
  + หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ
  +/- ผลต่างจากอัตราแลกเปลี่ยน (FX)
  - ดอกเบี้ยจ่าย (แยกไปใส่ Financing)
  ─────────────────────────────────────
  การเปลี่ยนแปลงใน Working Capital:
  +/- การเปลี่ยนแปลงลูกหนี้การค้า (AR)
      เพิ่ม AR = เงินยังไม่ได้รับ = หักออก (-)
      ลด AR  = เก็บเงินได้แล้ว = บวกเข้า (+)
  +/- การเปลี่ยนแปลงสินค้าคงเหลือ
      เพิ่ม Inventory = ใช้เงินซื้อ = หักออก (-)
      ลด Inventory  = ขายออก = บวกเข้า (+)
  +/- การเปลี่ยนแปลงเจ้าหนี้การค้า (AP)
      เพิ่ม AP = ยังไม่ได้จ่าย = บวกเข้า (+)
      ลด AP  = จ่ายแล้ว = หักออก (-)
  +/- ค้างจ่าย / ค้างรับอื่นๆ
  ─────────────────────────────────────
  = กระแสเงินสดจากกิจกรรมดำเนินงาน (Operating CF)

  กิจกรรมลงทุน (Investing):
  - ซื้อสินทรัพย์ถาวร (Capex)
  + ขายสินทรัพย์ถาวร

  กิจกรรมจัดหาเงิน (Financing):
  + เงินกู้รับใหม่
  - ชำระคืนเงินกู้
  - ดอกเบี้ยจ่าย
  - ชำระหนี้ Lease (TFRS 16)
  ─────────────────────────────────────
  กระแสเงินสดสุทธิ = Operating + Investing + Financing
  ยอดเงินสดปลายงวด = ยอดต้นงวด + กระแสเงินสดสุทธิ
```

### 8.4 Revenue vs Cash — Credit Term Calculation

```python
# Logic การคำนวณ Expected Cash Date
def calculate_expected_cash_date(invoice_date, credit_term_days, customer_type):
    if customer_type == "CASH":
        return invoice_date  # รับเงินวันเดียวกัน
    else:
        return invoice_date + timedelta(days=credit_term_days)

# Aging Bucket Classification
def classify_aging(due_date, today):
    days_overdue = (today - due_date).days
    if days_overdue <= 0:     return "Current"
    elif days_overdue <= 30:  return "1-30 days"
    elif days_overdue <= 60:  return "31-60 days"
    elif days_overdue <= 90:  return "61-90 days"
    else:                     return "Over 90 days"
```

### 8.5 Segment Mapping (CF Line → Activity + Segment)

| Segment | ประเภท | ตัวอย่างรายการ |
|---------|--------|-------------|
| F1 | Financing | เงินกู้, ดอกเบี้ย, ค่างวด Lease |
| I1 | Investing | ซื้อ/ขายสินทรัพย์, ค่าเสื่อมราคา |
| O1 | Operating | เงินเดือน, สวัสดิการ |
| O2 | Operating | สินค้าคงเหลือ, ต้นทุนขาย, Honda Parts |
| O3 | Operating | ค่าจ้างเหมา, Subcontract |
| O4 | Operating | ค่าเช่าสำนักงาน, สาธารณูปโภค |
| O5 | Operating | ภาษีเงินได้, VAT, WHT |
| O6 | Operating | ค่าใช้จ่ายอื่น, หนี้สูญ, FX |

---

## 9. Existing Modules

### โครงสร้างไฟล์ Source Code

```
src/
├── app.jsx              (298 บรรทัด)  — Main App Orchestration
├── nav.jsx              (120 บรรทัด)  — Navigation Sidebar + Topbar
├── dashboard.jsx        (216 บรรทัด)  — Dashboard + KPIs
├── finance-input.jsx    (442 บรรทัด)  — Finance Data Entry
├── accounting-input.jsx (390 บรรทัด)  — Accounting Data Entry
├── reports.jsx          (288 บรรทัด)  — Cash Flow Reports
├── other-screens.jsx  (1,583 บรรทัด)  — Forecast, Export, Settings
├── charts.jsx           (315 บรรทัด)  — Chart Components (Recharts)
├── tweaks-panel.jsx     (568 บรรทัด)  — UI Customization
├── icons.jsx             (71 บรรทัด)  — Icon Library (~50 icons)
├── data.js              (864 บรรทัด)  — Mock Data (แทน Database)
├── data-sample-2025.js  (xxx บรรทัด)  — ข้อมูล ACG Q1/2569 จริง
└── styles.css            (18 KB)      — CSS ทั้งระบบ
```

**รวม**: ~5,155 บรรทัด | Bundle: 339 KB (minified)

### Module 1: Dashboard (`dashboard.jsx`)

**หน้าที่**: แสดงภาพรวมกระแสเงินสดของบริษัท

**ประกอบด้วย**:
- KPI Cards 7 ใบ (Cash In, Cash Out, Net CF, Opening Balance, Closing Balance, Total Cash, Bank Count)
- Monthly Trend Chart (6 เดือน, เลือก Line/Bar/Area ได้)
- Bank Accounts Widget (7 บัญชีธนาคาร)
- Income Segment Breakdown (แยกตามบริษัทและประเภทรายได้)
- Company Selector (ACG / HMW / CLIK / CONSO)
- Period Selector (เดือน / ไตรมาส)

### Module 2: Finance Input (`finance-input.jsx`)

**หน้าที่**: บันทึกข้อมูลการเงิน — 7 แท็บ

| แท็บ | รายละเอียด |
|------|----------|
| Bank Accounts | 7 บัญชีธนาคาร พร้อม GL Mapping |
| Cash Receipts | บันทึกเงินรับรายการ |
| Cash Payments | บันทึกเงินจ่าย + โอนระหว่างบัญชี |
| AP Honda | ติดตามการชำระ Honda Parts |
| PN Payment | ติดตามการชำระ Promissory Note |
| Reconcile AR | จับคู่ลูกหนี้ |
| Reconcile AP | จับคู่เจ้าหนี้ |

### Module 3: Accounting Input (`accounting-input.jsx`)

**หน้าที่**: บันทึกข้อมูลบัญชี — 4 แท็บ

| แท็บ | รายละเอียด |
|------|----------|
| GL Trial Balance | 21 บัญชีหลัก |
| AR Aging | ลูกหนี้ 8 ราย × 5 ช่วงอายุ (Current / 30 / 60 / 90 / 90+) |
| AP Aging | เจ้าหนี้ 5 ราย × 4 ช่วงอายุ |
| Inventory | สินค้าคงเหลือ 5 รายการ |

### Module 4: Reports (`reports.jsx`)

**หน้าที่**: คำนวณและแสดง Cash Flow Statement — 5 แท็บ

| แท็บ | รายละเอียด |
|------|----------|
| Direct Method | Cash Inflow/Outflow จริง แยก Operating/Investing/Financing |
| Indirect Method | Net Profit → CF Adjustments ตาม TAS 7 |
| Direct vs Indirect | เปรียบเทียบทั้งสอง Method พร้อม Variance |
| Working Capital Impact | วิเคราะห์ผลกระทบ WC ต่อ Cash Flow |
| Cross-Validation | ตรวจสอบ GL ↔ CF ↔ FS |

**Export**: Excel (Working Paper 6 Sheets) และ PDF

### Module 5: Forecast (`other-screens.jsx`)

**หน้าที่**: คาดการณ์กระแสเงินสด 8 สัปดาห์ข้างหน้า

- KPI Cards: Forecast Balance, Inflow, Outflow, Min Balance
- 3 Scenarios: Bear (-15%), Base, Bull (+15%)
- รายสัปดาห์ Table View
- ยังใช้ข้อมูล Mock ไม่ใช่ข้อมูลจริง

### Module 6: Settings (`other-screens.jsx`)

**หน้าที่**: กำหนดค่าระบบ — 6 แท็บ

| แท็บ | รายละเอียด |
|------|----------|
| CF Mapping | Map GL Accounts → CF Activity + Segment |
| GL Accounts | ดู/แก้ ผังบัญชีและทิศทาง DR/CR |
| Company & Users | จัดการบริษัทและผู้ใช้ (UI เท่านั้น) |
| Integrations | รายการ Partner Systems ที่จะเชื่อมต่อ |
| Appearance | สี, Chart Type, Layout, Font Size |
| System | ข้อมูลระบบ |

### Module 7: Data Layer (`data.js`)

**หน้าที่**: แทน Database ชั่วคราว (ต้องเปลี่ยนเป็น API calls จริง)

```javascript
window.CFData = {
  company: { name, short, period, currency },
  companies: [CONSO, ACG, HMW, CLIK],
  bankAccounts: [...],         // 7 บัญชี
  arAging: [...],              // ลูกหนี้ aging
  apAging: [...],              // เจ้าหนี้ aging
  inventory: [...],            // สินค้าคงเหลือ
  glAccounts: [...],           // 21 บัญชีหลัก
  cfMapping: {...},            // GL → CF mapping
  getIncomeMatrix(coId),       // Income data by company
  getExpenseMatrix(coId),      // Expense data by company
  getCompanyTotals(coId)       // Summary totals
}
```

---

## 10. Current Progress

### ภาพรวมความคืบหน้า

| หมวด | ความคืบหน้า | สถานะ |
|-----|-----------|-------|
| **Frontend UI** | 100% | ✅ สมบูรณ์ |
| **Cash Flow Logic (Direct)** | 100% | ✅ สมบูรณ์ |
| **Cash Flow Logic (Indirect)** | 95% | ✅ สมบูรณ์ |
| **Dashboard** | 100% | ✅ สมบูรณ์ |
| **Forecast (8-week)** | 85% | ✅ ใช้ Mock data |
| **Export (Excel/PDF)** | 90% | ✅ ทำงานได้ |
| **Sample Data** | 90% | ✅ ตรวจสอบแล้ว |
| **Excel Templates** | 100% | ✅ ครบ 12 ไฟล์ |
| **Credit Analysis** | 40% | ⚠️ ยังไม่สมบูรณ์ |
| **Excel Upload Processing** | 10% | ⚠️ Template พร้อม แต่ Logic ยังไม่มี |
| **Backend API** | 0% | ❌ ยังไม่มี |
| **Database** | 0% | ❌ ยังไม่มี |
| **Authentication** | 0% | ❌ ยังไม่มี |
| **ERP Integration** | 5% | ❌ มีแค่ UI Placeholder |

### รายการที่สำเร็จ (เรียงตาม Commit)

```
✅ Phase 1 MVP Core
   - Dashboard, Finance Input, Accounting Input
   - Direct Method Report
   - Settings + CF Mapping
   - Excel Templates 12 ไฟล์
   - Vercel Deployment

✅ Phase 2A Enhanced
   - Indirect Method Report (TAS 7)
   - Working Capital Impact Analysis
   - Cross-Validation Panel
   - Working Paper Drill-down (6 Excel Sheets)
   - Reconcile AR/AP tabs
   - AP Honda + PN Payment tracking
   - Sample 2025 page (ข้อมูลจริง ACG)
   - GL Import UI (Business Central format)
```

### ปัญหาที่พบ

| ปัญหา | ระดับ | แนวทางแก้ไข |
|------|-------|-----------|
| ไม่มี Backend — ข้อมูลหายทุก Refresh | 🔴 Critical | สร้าง Backend API + PostgreSQL |
| ไม่มี Login | 🔴 Critical | ติดตั้ง Clerk / Auth0 |
| ข้อมูลเป็น Mock ทั้งหมด | 🔴 Critical | เชื่อมต่อ BC และ Import จริง |
| ไม่มี Build System (CDN-based) | 🟡 Medium | ย้ายไป Next.js จริงเมื่อ Backend พร้อม |
| ไม่มี Automated Tests | 🟡 Medium | เพิ่ม Jest + Cypress ใน Phase 3 |
| package.json ระบุ Next.js แต่ไม่ได้ใช้จริง | 🟢 Low | ชี้แจงหรือ Migrate |

---

## 11. Missing Requirements

### สิ่งที่ขาดแต่จำเป็นก่อน Go-live

#### ด้าน Infrastructure

| สิ่งที่ขาด | ผลกระทบ |
|-----------|---------|
| Backend API (Node.js/Express) | ไม่สามารถ Persist ข้อมูลได้ |
| PostgreSQL Database | ไม่มีที่เก็บข้อมูลถาวร |
| Authentication (Clerk/Auth0) | ไม่มีการควบคุมการเข้าถึง |
| Role-Based Access Control | ทุกคนเห็นข้อมูลทุกอย่าง |
| Audit Trail | ไม่รู้ว่าใครแก้อะไร เมื่อไหร่ |
| Error Handling / Retry Logic | ระบบแครชโดยไม่มีการแจ้งเตือน |

#### ด้านข้อมูลธุรกิจ

| ข้อมูลที่ขาด | ผลกระทบ |
|-----------|---------|
| Credit Term รายลูกค้า | ไม่สามารถ Forecast Cash Collection ได้ |
| Committed Monthly Payments | Forecast Outflow ไม่แม่นยำ |
| Bank Overdraft / Credit Line | ไม่รู้ Safety Buffer |
| Cash Minimum Policy | ไม่รู้ว่าต้องแจ้งเตือนเมื่อไหร่ |
| Approval Workflow | ไม่รู้ว่าใคร Approve อะไรก่อน |

#### ด้านการเชื่อมต่อ

| สิ่งที่ขาด | ผลกระทบ |
|-----------|---------|
| BC GL Export Format | ยังไม่รู้ว่า Format จริงเป็นอย่างไร |
| Excel Upload Processing Logic | Template มีแล้ว แต่ยังอ่านไม่ได้ |
| Bank Statement Auto-import | ต้อง Manual กรอกทุกครั้ง |

---

## 12. Open Questions

### คำถามที่ต้องถาม Business Owner ก่อนพัฒนาต่อ

#### 🔴 ต้องการคำตอบทันที (ก่อน Backend Sprint)

| # | คำถาม | เหตุผลที่สำคัญ |
|---|-------|-------------|
| Q1 | **Export GL จาก Business Central ได้ไหม?** Format Excel/CSV มีหน้าตาอย่างไร? | กำหนดแนวทาง Data Import ทั้งระบบ |
| Q2 | **มีกี่คนที่จะใช้ระบบ?** แต่ละคนมีบทบาทอะไร? | ออกแบบ Role + Access Control |
| Q3 | **ข้อมูลการเงินเก็บบน Cloud ได้ไหม?** หรือต้องอยู่ใน Server บริษัท? | กำหนด Hosting Architecture |
| Q4 | **Cash Minimum ที่ต้องรักษาไว้คือเท่าไหร่?** (per company) | ตั้ง Alert Threshold ใน Dashboard |
| Q5 | **ต้องเก็บข้อมูลย้อนหลังกี่ปี?** | Database sizing และ Import scope |

#### 🟠 ต้องการก่อน Go-live

| # | คำถาม |
|---|-------|
| Q6 | Customer แต่ละรายมี Credit Term กี่วัน? (ขอ List) |
| Q7 | Payment ที่แน่นอนทุกเดือนมีอะไรบ้าง? (เงินเดือน, ค่าเช่า, ค่างวด) |
| Q8 | มี Overdraft / Credit Line กับธนาคารอะไรบ้าง? วงเงินเท่าไหร่? |
| Q9 | การ Approve Payment ต้องผ่านกี่ขั้น? ใคร Approve ได้บ้าง? |
| Q10 | CFO ต้องการ Report ทุกเช้าจันทร์? หรือสิ้นเดือน? |

#### 🟡 ต้องการก่อน Phase 2C

| # | คำถาม |
|---|-------|
| Q11 | HMW และ CLIK มีลูกค้า Cash vs Credit สัดส่วนเท่าไหร่โดยประมาณ? |
| Q12 | มีฤดูกาลขายดี/ขายน้อยไหม? เดือนไหนบ้าง? |
| Q13 | Intercompany ระหว่าง ACG-HMW-CLIK มีรูปแบบอะไรบ้าง? |
| Q14 | ต้องการ Report เป็นภาษาไทย, อังกฤษ หรือทั้งสองภาษา? |
| Q15 | มีโลโก้บริษัทที่ต้องใส่ในรายงานไหม? |

---

## 13. Next Recommended Actions

### ลำดับที่แนะนำสำหรับ Developer/AI ที่รับงานต่อ

---

### ขั้นตอนที่ 1: เก็บข้อมูลจาก Business Owner (สัปดาห์ที่ 0)

ก่อนเขียนโค้ด ต้องได้คำตอบสำหรับ Q1–Q5 จาก Open Questions ด้านบน
เพราะคำตอบเหล่านั้นกำหนดสถาปัตยกรรมทั้งระบบ

```
Action Items:
  □ นัดประชุมกับ CFO / Finance Director
  □ ขอ Export GL Sample จาก Business Central
  □ ขอ List Credit Term ของลูกค้าทุกราย
  □ ยืนยัน Cloud Hosting Policy
  □ ยืนยัน User List + Role
```

---

### ขั้นตอนที่ 2: Setup Backend Infrastructure (สัปดาห์ที่ 1–2)

```
2.1 เลือก Database Hosting
    แนะนำ: Neon (PostgreSQL, Serverless, Free tier ใหญ่)
    ทางเลือก: Supabase, PlanetScale, Railway

2.2 สร้าง Database Schema
    □ รัน migration scripts จาก schema ใน MISSING_REQUIREMENTS.md
    □ Import sample-data/ เพื่อทดสอบ
    □ ตรวจสอบ constraints และ foreign keys

2.3 สร้าง Backend API
    แนะนำ: Node.js + Express + Prisma ORM
    □ สร้าง CRUD endpoints ทุก Entity
    □ Validation ด้วย Zod หรือ Joi
    □ Error handling middleware
    □ API Documentation ด้วย Swagger
```

---

### ขั้นตอนที่ 3: Authentication (สัปดาห์ที่ 3)

```
3.1 ติดตั้ง Clerk (แนะนำ — ง่ายสุด)
    หรือ Auth0, Firebase Auth (ถ้า Policy บังคับ)

3.2 สร้าง Roles
    □ ADMIN, FINANCE_USER, ACCOUNTING_USER, MANAGER

3.3 ผูก Roles กับ API
    □ Middleware ตรวจสอบ JWT token ทุก request
    □ Row-level security (เห็นได้เฉพาะบริษัทที่ Assign)

3.4 อัปเดต Frontend
    □ เพิ่ม Login page
    □ Redirect ตาม Role
    □ ซ่อน Menu ที่ไม่มีสิทธิ์
```

---

### ขั้นตอนที่ 4: เชื่อมต่อ Frontend กับ Backend (สัปดาห์ที่ 4)

```
4.1 แทน data.js ด้วย API calls
    □ ติดตั้ง SWR หรือ React Query สำหรับ data fetching
    □ แทน window.CFData.xxx ด้วย useSWR('/api/...')
    □ Loading states และ Error states

4.2 ทดสอบ Data Persistence
    □ กรอกข้อมูล → Refresh → ข้อมูลต้องยังอยู่
    □ กรอกจากบัญชีหนึ่ง → Login อีกบัญชี → เห็นข้อมูลเดียวกัน

4.3 Performance Testing
    □ Load test กับข้อมูล 12 เดือน × 3 บริษัท
    □ Dashboard ต้อง Load < 2 วินาที
```

---

### ขั้นตอนที่ 5: Excel Upload Processing (สัปดาห์ที่ 5–6)

```
5.1 สร้าง Upload Endpoint
    □ รับ Excel/CSV file
    □ Parse ด้วย SheetJS (มีใช้อยู่แล้วใน Frontend)
    □ Validate format ตาม Template spec
    □ Return preview + errors

5.2 Import Logic
    □ Duplicate detection (reference + date + amount)
    □ Auto-classify GL → CF Activity (ใช้ cf_mapping table)
    □ Transaction rollback ถ้า Validation ล้มเหลว

5.3 Import Templates สำคัญก่อน
    ลำดับที่แนะนำ:
    1. GL Journal (01_GL_Template.xlsx)
    2. AR Invoices (03_AR_Invoices_Template.xlsx)
    3. Bank Transactions (05_Bank_Transactions_Template.xlsx)
    4. AP Bills (04_AP_Bills_Template.xlsx)
```

---

### ขั้นตอนที่ 6: Credit Analysis (สัปดาห์ที่ 7–8)

```
6.1 Credit Term Mapping
    □ เพิ่ม credit_term_days ใน customers table
    □ คำนวณ expected_payment_date = invoice_date + credit_days
    □ แสดงใน AR Aging พร้อม Due Date

6.2 Expected Cash Collection Schedule
    □ ตาราง: เดือนนี้จะรับเงินจาก Invoice เดือนไหนบ้าง
    □ กราฟ Revenue vs Cash Received (Waterfall)
    □ Collection Efficiency Metric (% เก็บตรงเวลา)

6.3 30-Day Cash Outlook
    □ เงินที่ต้องรับในอีก 30 วัน (จาก AR)
    □ เงินที่ต้องจ่ายในอีก 30 วัน (จาก AP + Committed)
    □ Net Cash Position Forecast
```

---

### สรุป Sprint Plan (8 สัปดาห์สู่ Production-Ready MVP)

| สัปดาห์ | งาน | Deliverable |
|---------|-----|------------|
| 0 | เก็บข้อมูลจาก Business Owner | คำตอบ Q1-Q5 |
| 1-2 | Database + Backend API | API ทำงานได้ + Data Persist |
| 3 | Authentication + Roles | Login + Access Control |
| 4 | Frontend-Backend Integration | ใช้งานจริงได้ครั้งแรก |
| 5-6 | Excel Upload Processing | ทีม Upload Excel ได้ |
| 7-8 | Credit Analysis + Testing | Cash Collection Forecast |

**เป้าหมาย**: หลังสัปดาห์ที่ 8 CFO สามารถ Login เข้าระบบ ดูยอดเงินสดจริง และรู้ว่าเงินจะเข้าเดือนไหน

---

## ภาคผนวก: ไฟล์สำคัญที่ควรอ่านต่อ

| ไฟล์ | อ่านถ้าต้องการรู้เรื่อง |
|------|----------------------|
| `CLAUDE.md` | Requirements ต้นฉบับของ Project |
| `REQUIREMENT.md` | Specification ครบถ้วน + Acceptance Criteria |
| `PROJECT_STATUS.md` | สถานะปัจจุบันและ Architecture |
| `PROJECT_BACKLOG.md` | รายการงานทั้งหมด + Sprint Plan |
| `PROJECT_ROADMAP.md` | Timeline Phase 2B → 3B |
| `MISSING_REQUIREMENTS.md` | สิ่งที่ขาดและคำถามที่ต้องถาม |
| `src/data.js` | โครงสร้างข้อมูลปัจจุบัน (แทน DB) |
| `src/reports.jsx` | Logic การคำนวณ Cash Flow |
| `sample-data/README.md` | คำอธิบาย Sample Data ทั้งหมด |
| `templates/00_README_Index.xlsx` | คู่มือ Excel Templates |

---

*เอกสารนี้จัดทำโดยการวิเคราะห์ Repository ทั้งหมด ณ วันที่ 5 มิถุนายน 2569*  
*อัปเดตเมื่อมีการเปลี่ยนแปลงสำคัญในโปรเจกต์*
