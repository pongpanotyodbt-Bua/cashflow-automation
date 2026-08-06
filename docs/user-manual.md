# SOP User Manual
# คู่มือการใช้งานระบบ Cashflow Automation MVP

> เวอร์ชัน: MVP v1 | วันที่จัดทำ: 6 มิถุนายน 2569

---

## ส่วนที่ 1: การเริ่มต้นใช้งาน

### 1.1 การเข้าสู่ระบบ

1. เปิด Web Browser (Chrome แนะนำ)
2. พิมพ์ URL ของระบบ หรือเปิดไฟล์ `index.html` / `bundle.html`
3. ระบบจะแสดง Dashboard โดยอัตโนมัติ
4. **หมายเหตุ:** ขณะนี้ไม่มีหน้า Login — ระบบยังไม่มี Authentication

### 1.2 การเลือกบริษัท

บริษัทที่แสดงอยู่ใน Topbar ด้านบน:

| ตัวเลือก | ความหมาย |
|---------|---------|
| ◆ Conso — งบรวมกลุ่ม | แสดงข้อมูลรวมทุก entity |
| ACG — ACG Holding | แสดงเฉพาะ ACG |
| HMW — HMW | แสดงเฉพาะ HMW |
| CLIK — CLIK | แสดงเฉพาะ CLIK |

**วิธีเลือก:** คลิก Dropdown ที่ Topbar → เลือกบริษัทที่ต้องการ

### 1.3 การเลือกงวดบัญชี

1. คลิก Dropdown งวดที่ Topbar (ขวามือ)
2. เลือก Quarter หรือ Month ที่ต้องการ
3. ทุก Screen จะ refresh ข้อมูลตามงวดที่เลือกทันที

### 1.4 การปรับแต่ง UI (Tweaks Panel)

คลิกไอคอน Tweaks (มุมล่างขวา) เพื่อปรับ:
- **สี Accent** — เลือกจาก 4 สี (น้ำเงิน, เขียว, ม่วง, ดำ)
- **Chart Style** — Line / Area / Bar
- **Sidebar** — ซ้าย / ขวา
- **Density** — Compact / ปกติ / Roomy
- **Font Scale** — 0.85× ถึง 1.2×

---

## ส่วนที่ 2: Dashboard

### 2.1 การใช้งาน Dashboard

**ขั้นตอน:**
1. คลิก "Dashboard" ที่ Sidebar ซ้าย
2. ดู KPI 4 ตัว:
   - ยอดเงินสดคงเหลือรวม
   - กระแสเงินสดรับ Q1
   - กระแสเงินสดจ่าย Q1
   - กระแสเงินสดสุทธิ

### 2.2 การดู Trend Chart

1. ดู Chart "กระแสเงินสดเข้า–ออก" ด้านซ้าย
2. คลิก **"เดือน"** = ดูรายเดือน 6 เดือน
3. คลิก **"วัน"** = ดูรายวัน 30 วันล่าสุด
4. เส้นสีเขียว = เงินรับ, สีแดง = เงินจ่าย

### 2.3 การดูบัญชีธนาคาร

- ดูยอดคงเหลือทุกบัญชีที่ Panel ขวา
- คลิก "ดูทั้งหมด" เพื่อไปหน้า Finance Input

### 2.4 การ Export จาก Dashboard

1. คลิกปุ่ม **"Export Excel"** ที่มุมขวาบน
2. จะเปิด Export Modal
3. ทำตามขั้นตอน Section 6

---

## ส่วนที่ 3: บันทึกข้อมูลทางการเงิน (Finance Input)

### 3.1 การนำเข้า Bank Statement

**ขั้นตอน:**
1. คลิก "ข้อมูลทางการเงิน" ที่ Sidebar
2. คลิกปุ่ม **"นำเข้า Bank Statement"**
3. เลือกไฟล์ Excel หรือ CSV จากคอมพิวเตอร์
4. ระบบจะ parse และ import รายการอัตโนมัติ
5. แสดงผล: "นำเข้า X รายการสำเร็จ"

**รูปแบบไฟล์ที่รองรับ:**
- Excel (.xlsx) — ใช้ Template จาก `/templates/05_Bank_Transactions_Template.xlsx`
- CSV (.csv)

### 3.2 การเพิ่มรายการด้วยตนเอง

1. คลิกปุ่ม **"เพิ่มรายการใหม่"**
2. กรอกข้อมูล:
   - วันที่
   - รายละเอียด
   - จำนวนเงิน
   - บัญชีธนาคาร
   - ประเภท (เงินรับ/เงินจ่าย)
3. คลิก **"บันทึก"**

### 3.3 การตรวจสอบรายการ

1. คลิก Tab **"เงินรับ"** หรือ **"เงินจ่าย"**
2. Filter สถานะ: "ทั้งหมด / Matched / Pending / Review"
3. รายการสีแดง (Review) = ต้องตรวจสอบ
4. คลิก "จับคู่" เพื่อ manual match กับ GL

### 3.4 การกระทบยอด AR

1. คลิก Tab **"Reconcile AR"**
2. ดูรายการลูกหนี้ที่ค้างชำระ
3. เปรียบเทียบกับยอดใน Accounting Input → AR Tab

---

## ส่วนที่ 4: บันทึกข้อมูลทางบัญชี (Accounting Input)

### 4.1 การ Import GL จาก Business Central

**ข้อกำหนดเบื้องต้น:** มีไฟล์ GL Export จาก Business Central (format Excel)

**ขั้นตอน:**
1. คลิก "ข้อมูลทางบัญชี" ที่ Sidebar
2. ตรวจสอบว่าอยู่ที่ Tab **"Trial Balance"**
3. คลิกปุ่ม **"นำเข้าจากระบบบัญชี"**
4. เลือกไฟล์ Excel GL จาก Business Central
5. รอการประมวลผล
6. ดูผลลัพธ์: Banner สีเขียว + จำนวนรายการ + จำนวน GL accounts

### 4.2 การดู AR Aging

1. คลิก Tab **"ลูกหนี้ (AR)"**
2. ดู Aging buckets:
   - **Current** = ยังไม่ครบกำหนด
   - **30 วัน** = เกิน 30 วัน
   - **60 วัน** = เกิน 60 วัน
   - **90 วัน** = เกิน 90 วัน
   - **Over** = เกิน 90 วัน (Risk สูง — แดง)
3. ดู Total = ยอดลูกหนี้คงค้างทั้งหมด

### 4.3 การดู AP Aging

1. คลิก Tab **"เจ้าหนี้ (AP)"**
2. ดู Next Due Date ของแต่ละ Vendor
3. วางแผนการชำระ: Vendor ที่ Due ใกล้ที่สุดต้องชำระก่อน

---

## ส่วนที่ 5: งบกระแสเงินสด

### 5.1 การดูงบ CF แบบ Direct Method

1. คลิก **"วิธีตรง (Direct)"** ที่ Sidebar
2. ดู Tab 0 **"งบกระแสเงินสด"**:
   - กิจกรรมดำเนินงาน (Operating)
   - กิจกรรมลงทุน (Investing)
   - กิจกรรมจัดหาเงิน (Financing)
   - เงินสดต้นงวด + สุทธิ = เงินสดปลายงวด

### 5.2 การ Drill-down ระดับ Segment

1. Tab 1 **"CF แยก Segment"**
2. เลือก Filter บริษัท: ทุกบริษัท / HMW / CLIK / ACG
3. ดู Card ของแต่ละ Income Segment
4. แต่ละ Card แสดง: Operating CF, Investing CF, Financing CF, Net CF

### 5.3 การตรวจสอบ Working Capital

1. Tab 2 **"Working Capital กระทบยอด"**
2. ดู AR Reconcile: เปิดงวด + ยอดขาย − เก็งเงิน = ปิดงวด
3. ดู AP Reconcile: เปิดงวด + ซื้อ − จ่าย = ปิดงวด
4. ดู "ผลต่อ CF" ทางขวา:
   - AR เพิ่ม = CF ลด (สีแดง)
   - AP เพิ่ม = CF เพิ่ม (สีเขียว)
5. คลิกแถว Entity เพื่อ Expand ดูระดับ Segment

### 5.4 การตรวจสอบ Direct vs Indirect

1. Tab 3 **"เปรียบเทียบ Direct vs Indirect"**
2. ดู Operating CF ของทั้ง 2 วิธี ต้องเท่ากัน
3. ถ้า Difference ≠ 0 = มีข้อผิดพลาดในข้อมูล

### 5.5 การกระทบยอดเงินสดปลายงวด

1. Tab 4 **"กระทบยอดเงินสดปลายงวด"**
2. ดู 3 ตัวเลข:
   - CF Closing (ตามงบ CF)
   - Trial Balance (1010) 
   - ยอดรวมเงินฝากธนาคาร
3. Status:
   - **✓ ยอดตรง** = สมดุล (ผลต่าง < 1 ล้านบาท)
   - **⚠ มีผลต่าง** = ต้องตรวจสอบ

### 5.6 การดูงบ CF แบบ Indirect Method

1. คลิก **"วิธีอ้อม (Indirect)"** ที่ Sidebar
2. ขั้นตอนเหมือน Direct Method ทุกประการ
3. Tab 0 แสดงรูปแบบ: กำไร → ปรับ Non-cash → ปรับ WC

---

## ส่วนที่ 6: Export รายงาน

### 6.1 การสร้าง Export ผ่าน Export Center

1. คลิก **"Export Center"** ที่ Sidebar
2. คลิก Quick Export Card ที่ต้องการ หรือปุ่ม **"สร้าง Export ใหม่"**
3. เปิด Export Modal — ขั้น 1: ตั้งค่า

### 6.2 การตั้งค่า Export (ขั้น 1)

| Field | ตัวเลือก |
|-------|---------|
| รายงาน | Direct CF / Indirect CF / Forecast / Bank / AR / AP |
| งวด | เลือกจาก Dropdown |
| รูปแบบ | Excel Formatted / Raw Data |
| หน่วย | บาท / พันบาท / ล้านบาท |
| ส่วนที่รวม | Summary / 3 Activities / Notes / Supporting / Charts |

4. คลิก **"สร้างไฟล์"**

### 6.3 รอการสร้างไฟล์ (ขั้น 2)

- ดู Progress bar
- ระบบแสดง sheets ที่กำลังสร้าง:
  Summary → Operating → Investing → Financing → Notes → Pivot → Raw Data

### 6.4 ดาวน์โหลด (ขั้น 3)

1. ดูชื่อไฟล์ที่สร้าง
2. คลิกปุ่ม **"ดาวน์โหลด"**
3. ไฟล์จะบันทึกในโฟลเดอร์ Downloads

---

## ส่วนที่ 7: Forecast

### 7.1 การดู Forecast

1. คลิก **"Forecast"** ที่ Sidebar
2. ดู KPI Cards: ยอดสิ้นงวด, รับสุทธิ, จ่ายสุทธิ, ยอดต่ำสุด
3. ดู Chart: Bar (เงินรับ/จ่าย) + Line (Balance)

### 7.2 การปรับ Scenario

| Scenario | ความหมาย |
|---------|---------|
| Bear (–15%) | สถานการณ์แย่ — เงินรับลด 15% |
| Base | สถานการณ์ปกติ |
| Bull (+15%) | สถานการณ์ดี — เงินรับเพิ่ม 15% |

**ขั้นตอน:** คลิก Toggle Scenario → ดูตัวเลขเปลี่ยน

### 7.3 การเลือกช่วงเวลา Forecast

คลิก Dropdown → เลือก 4 / 8 / 13 / 26 สัปดาห์

### 7.4 การตีความ Forecast

- **ยอดต่ำสุด** = Critical: ถ้าต่ำมาก อาจมีปัญหา Liquidity
- **ยอดสิ้นงวด** = เงินสดที่คาดว่าจะมีเมื่อสิ้นช่วง
- **หมายเหตุในตาราง** = เหตุการณ์สำคัญ (ครบกำหนดชำระเงินกู้ ฯลฯ)

---

## ส่วนที่ 8: การตั้งค่าระบบ (Settings)

### 8.1 การจัดการ CF Mapping

1. คลิก **"Settings"** → Tab **"CF Mapping"**
2. ดูตาราง Mapping 22 บรรทัด
3. Filter Activity: All / Operating / Investing / Financing
4. คลิก **"แก้ไข"** เพื่อเปลี่ยน Segment allocation
5. Upload mapping ใหม่: คลิก "Upload" → เลือกไฟล์ Excel

### 8.2 การ Map GL Account

1. Tab **"GL Accounts"**
2. ดูตาราง GL Code → CF Activity
3. เปลี่ยน CF Activity: คลิก Dropdown ในแถวนั้น
4. คลิก **"Auto-map ทั้งหมด"** เพื่อ map อัตโนมัติ

### 8.3 การจัดการผู้ใช้

1. Tab **"บริษัท & ผู้ใช้"**
2. คลิก **"เพิ่มผู้ใช้"**
3. กรอก: ชื่อ, อีเมล, Role, หน่วยงาน
4. Role options: CFO/Admin, Treasury Manager, Accountant, Approver, Viewer

### 8.4 การจัดการ Integration

1. Tab **"การเชื่อมต่อ"**
2. Integration ที่ Active: ERP, Bank, Power BI, Email
3. Integration ที่ยังไม่ตั้งค่า:
   - FlowAccount: ต้องกรอก API Key
   - LINE Notify: ต้องกรอก LINE Notify Token
4. คลิก **"เชื่อมต่อ"** เพื่อเริ่มตั้งค่า

---

## ส่วนที่ 9: Templates สำหรับ Import ข้อมูล

ไฟล์ Template ทั้งหมดอยู่ที่โฟลเดอร์ `/templates/`

| ไฟล์ | วัตถุประสงค์ |
|------|------------|
| `00_README_Index.xlsx` | คำอธิบาย template ทั้งหมด |
| `01_GL_Template.xlsx` | Import GL Journal |
| `02_Trial_Balance_Template.xlsx` | Import Trial Balance |
| `03_AR_Invoices_Template.xlsx` | Import AR Invoices |
| `04_AP_Bills_Template.xlsx` | Import AP Bills |
| `05_Bank_Transactions_Template.xlsx` | Import Bank Statement |
| `06_Cash_Receipts_Template.xlsx` | Import รายการรับเงินสด |
| `07_Cash_Payments_Template.xlsx` | Import รายการจ่ายเงินสด |
| `08_Customer_Master_Template.xlsx` | Import ข้อมูลลูกค้า |
| `09_Vendor_Master_Template.xlsx` | Import ข้อมูล Vendor |
| `10_Inventory_Template.xlsx` | Import สินค้าคงเหลือ |
| `11_CF_Mapping_Template.xlsx` | Import CF Mapping |

---

## ส่วนที่ 10: Troubleshooting

### ปัญหา: ตัวเลขไม่แสดง หรือ 0

| สาเหตุ | วิธีแก้ |
|-------|--------|
| เลือก Company ไม่ตรง | ตรวจสอบ Company Selector ที่ Topbar |
| เลือก Period ไม่ตรง | เปลี่ยน Period ที่ Topbar |
| ไม่มีข้อมูล Mock | ตรวจสอบ data.js โหลดสำเร็จหรือไม่ |

### ปัญหา: CF Closing ≠ Bank Total

| สาเหตุ | วิธีแก้ |
|-------|--------|
| รายการระหว่างทาง | ตรวจสอบ In-transit items ใน Finance Input |
| เช็คค้างจ่าย | ตรวจสอบ Pending AP |
| ข้อมูล GL ยังไม่ครบ | Re-import GL จาก Business Central |

### ปัญหา: Direct ≠ Indirect (Tab 3)

| สาเหตุ | วิธีแก้ |
|-------|--------|
| CF Mapping ไม่ครบ | Settings → CF Mapping → ตรวจสอบทุก line |
| WC Adjustment ผิด | Tab 2 → ตรวจสอบ AR/AP reconcile |

### ปัญหา: Import ไม่สำเร็จ

| สาเหตุ | วิธีแก้ |
|-------|--------|
| Format ไฟล์ผิด | ใช้ Template จาก /templates/ |
| Column headers ไม่ตรง | ดู README Index template |
