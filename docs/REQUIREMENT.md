# CASHFLOW MANAGEMENT SYSTEM - REQUIREMENT SPECIFICATION

**Version**: MVP v1  
**Last Updated**: 2026-06-05

---

## 1. ภาพรวมโปรเจกต์

**Cashflow Management System** เป็น Web Application สำหรับบริหารและวิเคราะห์ Cash Flow ของบริษัท

### วัตถุประสงค์หลัก
- รวมข้อมูลจากหลายฝ่าย (Finance, AR, Accounting)
- คำนวณกระแสเงินสดอัตโนมัติ (Direct & Indirect Method)
- แสดงผล Dashboard เพื่อให้ผู้บริหารมองเห็นสถานะเงินสดแบบ Real-Time
- สร้างรายงานสำหรับ Manager Review

---

## 2. ปัญหาที่ระบบนี้แก้

| ปัญหา | ผลกระทบ |
|------|---------|
| ข้อมูลกระจายอยู่หลายฝ่าย | ยาก/ช้าในการรวมข้อมูล |
| ใช้ Excel หลายไฟล์ | ไม่เป็นระบบ, ยากต่อการติดตาม |
| การคำนวณ Manual | เสี่ยงข้อผิดพลาด |
| ไม่มี Dashboard รวม | ผู้บริหารมองภาพรวมลำบาก |

---

## 3. Core Features

### 3.1 Dashboard
Dashboard ต้องแสดง:

#### Summary
- **Cash In** - เงินรับทั้งหมด
- **Cash Out** - เงินจ่ายทั้งหมด
- **Net Cash Flow** - Net (Cash In - Cash Out)
- **Opening Balance** - ยอดเงินคงเหลือ ต้นงวด
- **Closing Balance** - ยอดเงินคงเหลือ ปลายงวด

#### Analysis
- **Monthly Performance** - วิเคราะห์รายเดือน
- **Trend Analysis** - แนวโน้มเงินเข้า-ออก
- **Customer Type** - แยก Cash vs Credit Customer
- **Credit Term Analysis** - วิเคราะห์ลูกค้าไม่เก็บเงินสด
  - ระบุเงินเข้าที่ Pending (ยังไม่ได้รับ)
  - Aging / Due Date
  - Outstanding สินค้า

### 3.2 Data Input Module
รองรับการรับข้อมูลจาก:

#### Finance Department
- Payment
- Transfer
- Cash Expense
- Bank Transaction
- Format: Excel, CSV

#### AR Department
- Invoice
- Credit Term
- Customer Payment
- Format: Excel, CSV

#### Accounting Department
- GL (General Ledger)
- Trial Balance
- AP/AR
- Journal Entry
- Format: Excel, CSV

### 3.3 Cash Flow Engine

#### Direct Method
```
Cash Flow = Cash Inflow - Cash Outflow
- Cash Inflow (เงินรับจริง)
- Cash Outflow (เงินจ่ายจริง)
```

#### Indirect Method
```
Net Cash Flow = Net Profit
  + Depreciation & Amortization
  + Changes in Working Capital
    - Increase in AR
    - Decrease in AP
    - Inventory Changes
  + Other Adjustments
```

### 3.4 Reporting Module

#### Report Type
- **Monthly Report** - รายงานรายเดือน
- **Quarterly Report** - รายงานรายไตรมาส
- **Summary Report** - สรุป Cash Flow Position

#### Export Format
- PDF
- Excel

#### Recipient
- Finance Manager
- Accounting Manager
- Executive / C-Level

---

## 4. Business Logic

### Business Rule: Revenue ≠ Cash

บริษัทมีลูกค้าสองประเภท:

#### Cash Customer
- ออก Invoice → จ่ายเงินสด
- Revenue = Cash (เดือนเดียวกัน)

#### Credit Term Customer
- ออก Invoice → จ่ายเงิน หลังจากประเวิน 30/60/90 วัน
- Revenue ≠ Cash (ต่างเดือน)

### ตัวอย่าง
```
Invoice Date: 1 Jan
Revenue Recognition: Jan
Credit Term: Net 30
Payment Date: 1 Feb
Cash Received: Feb

→ System ต้องแยก:
  - Jan Revenue: ✓ (ได้รับ)
  - Jan Cash: ✗ (ยังไม่ได้)
  - Feb Cash: ✓ (ได้รับ)
```

### Implication
ระบบต้องแยก:
- **Revenue Performance** - วิเคราะห์การขาย
- **Cash Performance** - วิเคราะห์เงินจริง

---

## 5. User Roles & Permissions

| Role | Responsibility |
|------|-----------------|
| **Admin** | จัดการระบบ, จัดการสิทธิ์ผู้ใช้, System Configuration |
| **Finance User** | Upload ข้อมูลการเงิน, บันทึกรายการ |
| **Accounting User** | Upload GL, Trial Balance, Journal Entry |
| **Manager** | ดู Dashboard, ดู Report, วิเคราะห์ Performance |

---

## 6. Technical Specifications

### Frontend Stack
- **Framework**: Next.js + React
- **Styling**: TailwindCSS
- **Charts**: Recharts / ECharts
- **File Upload**: Excel / CSV

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js / NestJS
- **Language**: JavaScript / TypeScript

### Database
- **Primary**: PostgreSQL
- **Caching**: Redis (Optional)

### Authentication & Authorization
- Clerk / Auth0 / Firebase Auth

---

## 7. Data Model Overview

### Core Entities

#### 1. Company
```
- id
- name
- fiscal_year_start
- created_at
```

#### 2. Transaction
```
- id
- date
- type (income/expense/transfer)
- amount
- description
- source (Finance/AR/Accounting)
- category
```

#### 3. Invoice
```
- id
- invoice_number
- customer_id
- amount
- invoice_date
- due_date
- credit_term_days
- payment_date
- status (pending/paid)
```

#### 4. GL Account
```
- id
- account_code
- account_name
- type (asset/liability/equity/income/expense)
- balance
```

#### 5. CashFlow Report
```
- id
- period (month/quarter)
- opening_balance
- cash_in
- cash_out
- closing_balance
- method (direct/indirect)
```

---

## 8. MVP Roadmap

### Phase 1: MVP (Core Functionality)
**Timeline**: Priority 1

- [x] User Authentication & Roles
- [ ] Dashboard (Summary)
- [ ] Upload Module (Finance)
- [ ] Direct Method Calculation
- [ ] Basic Monthly Report

**Deliverables**:
- Functional Dashboard
- Data Upload Capability
- Cash Flow Calculation (Direct Method)
- Simple Report

### Phase 2: Enhanced Analysis
**Timeline**: Priority 2

- [ ] Credit Term Analysis
- [ ] Indirect Method Calculation
- [ ] Advanced Dashboard (Trend, Aging)
- [ ] Forecast Module (3-month prediction)
- [ ] Multi-period Comparison

**Deliverables**:
- Enhanced Dashboard
- Credit Analysis Report
- Cash Flow Forecast

### Phase 3: Advanced Features
**Timeline**: Priority 3

- [ ] AI Auto-Classification
- [ ] ERP Integration (SAP, Oracle, Dynamics, Xero)
- [ ] Real-time Bank Sync
- [ ] Advanced Forecasting (ML-based)
- [ ] Workflow Automation

**Deliverables**:
- Automated Data Import
- Advanced Forecasting Engine
- System Integrations

---

## 9. Success Criteria

### MVP Success Metrics
- ✓ Dashboard loads in < 2 seconds
- ✓ Data upload & processing accuracy > 99%
- ✓ Cash Flow calculation matches manual verification
- ✓ Users can generate reports in < 5 minutes
- ✓ System supports ≥ 6 months historical data

### Business Success
- ✓ Reduce manual Excel work by 80%
- ✓ Provide real-time cash visibility
- ✓ Enable faster decision-making for management
- ✓ Improve cash forecasting accuracy

---

## 10. Constraints & Assumptions

### Constraints
- Initial focus on Thai Baht (THB) currency
- Monthly reporting cycle
- Up to 12 months historical data in MVP
- Max 1000 transactions per month

### Assumptions
- Credit terms range from 0-120 days
- All transactions in single currency
- Manual data entry via Excel/CSV upload
- Single company instance (Phase 1)

---

## 11. Out of Scope (Future)

- Multi-currency support
- Real-time bank API integration
- Budget vs Actual analysis
- Multiple company management
- Mobile app (Phase 3+)

---

## 12. Acceptance Criteria

### Dashboard Feature
- [ ] Displays Cash In, Cash Out, Net CF, Balance summary
- [ ] Updates when new data is uploaded
- [ ] Shows monthly trend chart
- [ ] Displays credit term analysis
- [ ] Responsive on desktop & tablet

### Upload Feature
- [ ] Accept Excel & CSV files
- [ ] Validate data before import
- [ ] Show import summary & errors
- [ ] Support batch upload
- [ ] Reject duplicate transactions

### Cash Flow Calculation
- [ ] Direct Method matches input data
- [ ] Indirect Method matches trial balance
- [ ] Results auditable (show calculation steps)
- [ ] Accurate to 2 decimal places

### Report Generation
- [ ] Generate PDF report
- [ ] Export to Excel
- [ ] Include dashboard snapshot
- [ ] Show calculation methodology

---

## 13. Reference Materials

- CLAUDE.md (Project Instructions)
- Data samples in `sample-data/`
- Excel import examples in `Finance Statement/`
