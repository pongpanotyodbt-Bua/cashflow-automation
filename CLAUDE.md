# CASHFLOW AUTOMATION SYSTEM
# Project Requirement + Skill Command Guide
# Version: MVP v1

---

# 1. ภาพรวมโปรเจกต์

โปรเจกต์นี้คือระบบ Web Application สำหรับบริหารและวิเคราะห์ Cash Flow ของบริษัท

ระบบถูกออกแบบเพื่อ:
- รวมข้อมูลจากฝ่าย Finance
- รวมข้อมูลจาก AR (Account Receivable)
- รวมข้อมูลจากระบบบัญชี
- คำนวณกระแสเงินสด (Cash Flow)
- แสดงผล Dashboard
- สร้างรายงานสำหรับ Manager
- วิเคราะห์กระแสเงินสดทั้งแบบ Direct Method และ Indirect Method

เป้าหมายของระบบ:
ทำให้ผู้บริหารเห็นสถานะเงินสดของบริษัทแบบ Real-Time และวิเคราะห์ Performance ของเงินเข้า-ออกได้ในแต่ละเดือน

---

# 2. ปัญหาที่ระบบนี้ต้องแก้

ปัจจุบันข้อมูลกระจายอยู่หลายฝ่าย:
- Finance
- AR
- Accounting

ทำให้:
- รวมข้อมูลยาก
- วิเคราะห์ Cash Flow ช้า
- มองภาพรวมลำบาก
- ต้องใช้ Excel หลายไฟล์
- ตรวจสอบ Credit Term ยาก

---

# 3. เป้าหมายหลักของระบบ

## MVP GOAL

สร้าง Dashboard กลางที่สามารถ:
- รับข้อมูลจากหลายฝ่าย
- คำนวณ Cash Flow อัตโนมัติ
- แสดงผลทั้ง Direct และ Indirect Method
- วิเคราะห์ลูกหนี้ Credit Term
- วิเคราะห์เงินจริงที่เข้าในแต่ละเดือน
- สร้าง Report สำหรับ Manager Review

---

# 4. Core Features

## 4.1 Dashboard

Dashboard ต้องแสดง:

### Summary
- Cash In
- Cash Out
- Net Cash Flow
- Opening Balance
- Closing Balance

### วิเคราะห์รายเดือน
- Monthly Performance
- Trend เงินเข้า-ออก
- Forecast Cash

### วิเคราะห์ประเภทลูกค้า
แยก:
- Cash Customer
- Credit Term Customer

### วิเคราะห์ Credit Term
เช่น:
- รายได้เกิดเดือนนี้
- แต่เงินจะเข้าเดือนหน้า
- หรือเข้าอีก 30/60/90 วัน

ระบบต้องสามารถ:
- แยก Revenue ออกจาก Actual Cash Received
- แสดง Aging / Due
- วิเคราะห์กระแสเงินจริง

---

## 4.2 Data Input Module

ระบบต้องรองรับการรับข้อมูลจาก:

### Finance
เช่น:
- Payment
- Transfer
- Cash Expense
- Bank Transaction

### AR
เช่น:
- Invoice
- Credit Term
- Customer Payment

### Accounting
เช่น:
- GL
- Trial Balance
- AP/AR
- Journal Entry

---

## 4.3 Cash Flow Engine

ระบบต้องคำนวณ:

### Direct Method
- เงินรับจริง
- เงินจ่ายจริง

### Indirect Method
เริ่มจาก:
- Net Profit

แล้วปรับ:
- Depreciation
- Working Capital
- AP / AR
- Inventory

---

## 4.4 Reporting Module

สร้าง Report สำหรับ:
- Finance Manager
- Accounting Manager
- Executive

รูปแบบ:
- Monthly Report
- Quarterly Report
- Export Excel
- Export PDF

---

# 5. Business Logic สำคัญ

## Revenue ≠ Cash

บริษัทมีทั้ง:
- ลูกค้าจ่ายสด
- ลูกค้า Credit Term

ดังนั้น:
รายได้ที่เกิดขึ้นในเดือนนี้
อาจยังไม่ใช่เงินจริงที่ได้รับในเดือนนี้

ตัวอย่าง:
- ลูกค้าใช้บริการเดือนมกราคม
- ออก Invoice มกราคม
- จ่ายเงินจริง กุมภาพันธ์

ระบบต้องแยก:
- Revenue Performance
- Cash Performance

---

# 6. User Roles

## Admin
- จัดการระบบ
- จัดการสิทธิ์

## Finance User
- Upload ข้อมูลการเงิน

## Accounting User
- Upload GL / Accounting Data

## Manager
- ดู Dashboard
- ดู Report
- วิเคราะห์ Performance

---

# 7. Suggested Tech Stack

## Frontend
- Next.js
- React
- TailwindCSS

## Backend
- Node.js
- Express / NestJS

## Database
- PostgreSQL

## Authentication
- Clerk / Auth0 / Firebase Auth

## File Upload
- Excel Upload
- CSV Import

## Charts
- Recharts
- ECharts

---

# 8. Suggested System Structure

## Modules

### 1. Authentication Module
Login / Permission

### 2. Dashboard Module
Visualization

### 3. Upload Module
Excel / CSV Upload

### 4. Cash Flow Engine
Calculation Logic

### 5. Reporting Module
Generate Report

### 6. Forecast Module
Cash Prediction

---

# 9. Skill Commands for Code Agent

## skill.dashboard
สร้าง Dashboard แสดง:
- Cash In
- Cash Out
- Net Cash Flow
- Monthly Trend
- Credit Term Analysis

---

## skill.upload.finance
ระบบ Upload ข้อมูลจาก Finance

รองรับ:
- Excel
- CSV

---

## skill.upload.accounting
ระบบ Upload ข้อมูลจากบัญชี

รองรับ:
- GL
- Trial Balance
- Journal Entry

---

## skill.cashflow.direct
คำนวณ Cash Flow แบบ Direct Method

---

## skill.cashflow.indirect
คำนวณ Cash Flow แบบ Indirect Method

---

## skill.credit.analysis
วิเคราะห์ลูกหนี้ Credit Term

เช่น:
- Outstanding
- Due Date
- Aging

---

## skill.report.generator
สร้าง:
- PDF Report
- Excel Report
- Monthly Summary

---

# 10. Future Features

## AI Forecast
คาดการณ์เงินสดล่วงหน้า

## Auto Classification
AI ช่วยแยกประเภทรายการ

## ERP Integration
เชื่อม:
- SAP
- Oracle
- Dynamics
- Xero

## Real-time Bank Sync
ดึงข้อมูลธนาคารอัตโนมัติ

---

# 11. MVP Priority

## Phase 1
- Dashboard
- Upload Data
- Direct Method
- Basic Report

## Phase 2
- Indirect Method
- Credit Analysis
- Forecast

## Phase 3
- AI
- ERP Integration
- Automation

---

# 12. Final Goal

สร้างระบบกลางสำหรับ:
- วิเคราะห์ Cash Flow
- ลดงาน Manual
- ช่วยผู้บริหารตัดสินใจ
- เห็นสถานะเงินจริงของบริษัท
- วิเคราะห์อนาคตของเงินสดได้แม่นยำขึ้น
