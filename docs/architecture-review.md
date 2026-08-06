# Architecture Review
# การทบทวนสถาปัตยกรรม — สิ่งที่ขาด, ซ้ำซ้อน, และข้อเสนอแนะ

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## G. Missing Documentation (สิ่งที่ขาดหายไป)

### G1. ไม่มี Authentication / Authorization
**ความเสี่ยง:** สูงมาก  
**รายละเอียด:** ระบบปัจจุบันไม่มีหน้า Login ใครเปิด URL ก็เข้าได้ทันที Role (CFO/Admin/Viewer) มีอยู่ใน Settings แต่ไม่มีการ enforce จริง  
**ผลกระทบ:** ข้อมูลการเงินสำคัญเปิดเผยให้ทุกคนเห็น  
**แนะนำ:** เพิ่ม Auth0 / Clerk / Firebase Auth ก่อน Production

### G2. ไม่มีฐานข้อมูลจริง
**ความเสี่ยง:** สูงมาก  
**รายละเอียด:** ข้อมูลทั้งหมดอยู่ใน `window.CFData` (JavaScript object) — หายทุกครั้งที่ Refresh  
**ผลกระทบ:** ข้อมูลที่ Import หรือบันทึกใหม่ไม่ถาวร  
**แนะนำ:** เพิ่ม PostgreSQL + API Layer (Node/NestJS)

### G3. ไม่มี API Backend จริง
**ความเสี่ยง:** สูง  
**รายละเอียด:** `server.js` เป็นแค่ static file server, `app.py` เป็น Flask experimental ที่ยังไม่ fully connected  
**แนะนำ:** สร้าง REST API หรือ GraphQL สำหรับ CRUD operations

### G4. Opening Balance Forecast Hardcoded
**ความเสี่ยง:** ปานกลาง  
**รายละเอียด:** `let bal = 469_220_000;` ใน `other-screens.jsx:14` — ค่า opening balance คงที่  
**แนะนำ:** ดึงจาก bank accounts balance หรือ CF closing

### G5. Badge ใน Sidebar Hardcoded
**ความเสี่ยง:** ต่ำ  
**รายละเอียด:** `badge: "12"` และ `badge: "8"` ใน `nav.jsx` ไม่ได้คำนวณจากข้อมูลจริง  
**แนะนำ:** คำนวณจากจำนวนรายการ Pending จริง

### G6. ไม่มี Error Handling
**ความเสี่ยง:** ปานกลาง  
**รายละเอียด:** ไม่มี try/catch สำหรับ Import operations, ไม่มี Error boundaries  
**แนะนำ:** เพิ่ม Error handling + User-friendly error messages

### G7. ไม่มี Data Validation
**ความเสี่ยง:** ปานกลาง  
**รายละเอียด:** ฟอร์มต่างๆ ไม่มี Validation (เช่น AddTxnModal, Settings form)  
**แนะนำ:** เพิ่ม Zod / Yup validation

### G8. ไม่มี Audit Trail
**ความเสี่ยง:** ปานกลาง  
**รายละเอียด:** ไม่มีการบันทึกว่าใครแก้ไขข้อมูลอะไร เมื่อไร  
**แนะนำ:** เพิ่ม Activity Log / Audit table

### G9. ไม่มี URL Routing
**ความเสี่ยง:** ต่ำ  
**รายละเอียด:** SPA ใช้ `React.useState("dashboard")` — ไม่มี URL เปลี่ยนเมื่อสลับ screen  
**ผลกระทบ:** ไม่สามารถ bookmark หน้าที่ต้องการ, Back button ไม่ทำงาน  
**แนะนำ:** เพิ่ม React Router หรือ Next.js routing

### G10. ไม่มี Unit Tests
**ความเสี่ยง:** ปานกลาง  
**รายละเอียด:** ไม่มีไฟล์ test ใดๆ  
**แนะนำ:** เพิ่ม Vitest/Jest สำหรับ calculation functions โดยเฉพาะ buildSegmentCF

---

## H. Unused Pages / Components (หน้าที่ไม่ได้ใช้)

### H1. Reconciliation Screen
**ไฟล์:** `other-screens.jsx` — `Reconciliation` component  
**สถานะ:** Implemented แต่ **ไม่มีใน NAV Sidebar**  
**Confidence:** สูง — ตรวจสอบ `NAV` array ใน nav.jsx แล้ว  
**แนะนำ:** เพิ่มใน Sidebar หรือ link จาก Finance Input

### H2. Sample 2025 HTML Page
**ไฟล์:** `public/sample-2025.html`  
**สถานะ:** ไฟล์แยกต่างหาก ไม่ได้ integrate กับ app หลัก  
**แนะนำ:** Archive หรือ Integrate เป็น Tab ใน CF Report

### H3. app.py (Flask)
**ไฟล์:** `app.py`  
**สถานะ:** มีอยู่แต่ไม่ถูกใช้จริงใน production flow  
**แนะนำ:** ถ้าไม่ใช้ ควร Archive หรือ Document ว่า roadmap ไว้ทำอะไร

### H4. Working Paper Excel
**ไฟล์:** `public/Working_Paper_WC_Drill_Down.xlsx`  
**สถานะ:** ใช้เป็น Download link ใน CF Report  
**ข้อสังเกต:** ไฟล์ Static — ไม่ได้ generate จากข้อมูล live  
**แนะนำ:** Generate dynamically จาก reconcile data

### H5. Finance Statement Files
**โฟลเดอร์:** `Finance Statement/` (ACG, HMW, CLIK)  
**สถานะ:** ไฟล์ Excel ต้นฉบับ ถูกใช้ใน data-sample-2025.js เท่านั้น  
**แนะนำ:** เก็บเป็น Reference หรือ Archive เมื่อ move to DB

---

## I. Duplicate Features (ฟีเจอร์ที่ซ้ำซ้อน)

### I1. Export Button ซ้ำ 3 จุด
| จุด | หน้าจอ |
|-----|--------|
| Dashboard → ปุ่ม "Export Excel" | เปิด ExportModal |
| CF Report Direct/Indirect → ปุ่ม Export | เปิด ExportModal เดียวกัน |
| Export Center → Quick Cards | เปิด ExportModal เดียวกัน |

**ข้อสังเกต:** ExportModal เหมือนกันทุกจุด — ดี (ไม่ต้อง maintain หลายที่)  
**แนะนำ:** ไม่ต้องแก้ — Single modal เป็น Good practice

### I2. Search Input ซ้ำ
- Topbar มี Global Search
- Finance Input มี Search ของตัวเอง
- Accounting Input GL Tab มี Search ของตัวเอง

**ข้อสังเกต:** Global Search ใน Topbar ยังไม่ทำงาน (placeholder)  
**แนะนำ:** Implement Global Search หรือ ลบออกจาก Topbar

### I3. Export Button ใน Dashboard Table
Dashboard Recent Transactions มีปุ่ม "Export" แยก + ปุ่ม Export ที่ header  
**แนะนำ:** รวมเป็นปุ่มเดียว

### I4. Reconcile Tab ซ้อนกัน 2 ระดับ
- Finance Input มี "Reconcile AR" Tab
- CF Report มี "Working Capital กระทบยอด" Tab (ซึ่งรวม AR reconcile)
- Settings → ยังมีข้อมูล AR/AP Aging ใน GL Accounts

**แนะนำ:** Define scope ชัดเจน: Finance Input = Transaction-level, CF Report Tab 2 = Period-level summary

---

## J. Recommendations for Simplification (ข้อเสนอแนะ)

### J1. ลำดับความสำคัญ: Authentication ก่อนทุกอย่าง
**Priority:** Critical  
ก่อน Production ต้องเพิ่ม Login / Role-based access control  
แนะนำ: Clerk.com (ง่าย integrate กับ React, มี Free tier)

### J2. ย้ายไป Next.js + Supabase
**Priority:** High (Phase 2)  
ปัจจุบัน SPA + Mock data → ควรย้ายไป:
- **Next.js 14** — App Router, Server Components
- **Supabase** — PostgreSQL + Auth + Realtime
- เก็บ React components ได้เลย — migration cost ต่ำ

### J3. แยก data.js ออกเป็นหลายไฟล์
**Priority:** Medium  
`data.js` ขนาด 95KB เดียว — ยากต่อการ maintain  
แนะนำแยกเป็น:
- `data/companies.js`
- `data/transactions.js`
- `data/cf-statements.js`
- `data/ar-ap.js`
- `data/forecast.js`

### J4. เพิ่ม Reconciliation ใน Sidebar
**Priority:** Medium  
`Reconciliation` component implement แล้วแต่ไม่มี navigation entry  
แนะนำ: เพิ่มใน Group "บันทึกข้อมูล" หรือ "งบกระแสเงินสด"

### J5. Implement Global Search
**Priority:** Medium  
Search ใน Topbar เป็น placeholder — ควร implement search ข้าม screens  
แนะนำ: Command Palette (Cmd+K) style search

### J6. เพิ่ม Mobile Responsive
**Priority:** Medium  
UI ปัจจุบันออกแบบสำหรับ Desktop เท่านั้น  
CFO มักต้องการดูข้อมูลใน Mobile เช่นกัน

### J7. Dynamic Opening Balance ใน Forecast
**Priority:** Medium  
`let bal = 469_220_000` hardcoded ควรดึงจาก:
```javascript
const bal = window.CFData.bankAccounts.reduce((s, b) => s + b.balance, 0);
```

### J8. เพิ่ม Notification System จริง
**Priority:** Low  
Bell icon ใน Topbar ยังเป็น placeholder  
แนะนำ: เพิ่ม notification เมื่อ CF ต่ำกว่า threshold / รายการ Review เพิ่มขึ้น

### J9. เพิ่ม Bulk Export
**Priority:** Low  
CFO ต้องการ Export หลาย report ในครั้งเดียวสำหรับ Board Meeting  
แนะนำ: "Board Pack Export" รวม Direct CF + Indirect CF + Forecast ในไฟล์เดียว

### J10. ลบ Debug/Dev Components ก่อน Production
**Priority:** Low  
Tweaks Panel เหมาะสำหรับ Development เท่านั้น  
แนะนำ: ซ่อนใน Production build (`process.env.NODE_ENV === 'production'`)

---

## สรุป Action Items

### ต้องทำก่อน Production (Critical)
| # | Action | ผู้รับผิดชอบ |
|---|--------|------------|
| 1 | เพิ่ม Authentication (Clerk/Auth0) | Dev Team |
| 2 | เพิ่ม Database (PostgreSQL/Supabase) | Dev Team |
| 3 | สร้าง API Layer | Dev Team |

### Phase 2 (High Priority)
| # | Action | ผู้รับผิดชอบ |
|---|--------|------------|
| 4 | ย้ายไป Next.js | Dev Team |
| 5 | เพิ่ม Reconciliation ใน Sidebar | Dev Team |
| 6 | Fix Opening Balance Forecast | Dev Team |
| 7 | Error Handling + Validation | Dev Team |

### Phase 3 (Nice to Have)
| # | Action | ผู้รับผิดชอบ |
|---|--------|------------|
| 8 | Global Search (Command Palette) | Dev Team |
| 9 | Mobile Responsive | Dev Team |
| 10 | Bulk Export / Board Pack | Dev Team |
| 11 | Unit Tests สำหรับ Calculation | Dev Team |
| 12 | Audit Trail | Dev Team |

---

## ข้อสรุปภาพรวม

ระบบ Cashflow Automation MVP นี้มีโครงสร้าง **Front-End ที่แข็งแกร่ง** ครอบคลุม:
- งบ CF ครบ 2 วิธี (Direct + Indirect) ตาม TAS 7
- Drill-down ระดับ Segment ที่ละเอียด
- Working Capital Reconciliation ที่ถูกต้องตามหลักบัญชี
- UI/UX ที่ใช้งานง่าย เหมาะกับ CFO Office

**จุดแข็ง:**
- Business logic ถูกต้องตามมาตรฐานบัญชี
- Data structure ออกแบบดี รองรับ multi-entity
- Component structure clean, reusable

**จุดที่ต้องพัฒนา:**
- ยังไม่มี Backend จริง — ทั้งหมดเป็น Mock
- ไม่มี Authentication — Security Risk
- ไม่มี Persistent Data
- ขาด Mobile Support

**คะแนนความพร้อม Production:** 3/10  
**คะแนน Business Logic Correctness:** 8/10  
**คะแนน UX Design:** 8/10
