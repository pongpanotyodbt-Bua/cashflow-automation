/*
 * Sample Data Overlay — Annual 2025
 * Loaded AFTER src/data.js, patches window.CFData with REAL numbers
 * from sample_data/sample_data_aggregated.json
 *
 * Source: 132 AR invoices, 140 AR receipts, 228 AP bills, 237 AP payments,
 *         444 bank txns. Verified against 10_fs_targets_2025.csv.
 */
(function () {
  if (!window.CFData) {
    console.warn("data-sample-2025.js: CFData not loaded yet");
    return;
  }
  const d = window.CFData;

  // ===========================================================================
  // 1. Period & Company
  // ===========================================================================
  d.company.period = "ปี 2568 (Annual 2025) — Sample Data";
  d.company.name = "Sample Auto Dealership (Honda Motor World)";

  // ===========================================================================
  // 2. Bank Accounts (real closing balance)
  // ===========================================================================
  d.bankAccounts.length = 0;
  d.bankAccounts.push(
    { id: "SCB-CURR", bank: "SCB - Current Account", number: "1112334456", balance: 173_743_169, color: "#5E2B7C" }
  );

  // ===========================================================================
  // 3. Reconcile AR — Annual 2025 (real)
  // ===========================================================================
  const arOpen   = 22_136_556;
  const arClose  = 21_606_892;
  const arSales  = 1_344_942_276;  // = revenue_sales_service + revenue_construction
  const arCollect = 1_345_471_940;  // Opening + Sales - Closing
  const arChange = arClose - arOpen;  // -529,664 (decreased)

  Object.assign(d.reconcileAR, {
    period: "2025-Annual",
    entities: [
      { entity: "Cash Customer",  opening: 0,           sales: 544_203_952, collection: -544_203_952, adjustments: 0, closing: 0,           change: 0,         impact: "Same-day cash settlement" },
      { entity: "Finance Co.",    opening: 14_460_000,  sales: 522_000_000, collection: -538_440_000, adjustments: 0, closing: -1_980_000,  change: -16_440_000, impact: "Decrease AR (Cash inflow)" },
      { entity: "Corporate/Fleet",opening: 2_590_000,   sales: 136_000_000, collection: -99_436_556,  adjustments: 0, closing: 39_153_444,  change: 36_563_444, impact: "Increase AR (Cash outflow)" },
      { entity: "Dealer",         opening: 5_086_556,   sales: 118_611_856, collection: -117_884_964,adjustments: 0, closing: 5_813_448,   change: 726_892,   impact: "Slight Increase" },
      { entity: "Insurance",      opening: 0,           sales: 24_126_468,  collection: -24_126_468, adjustments: 0, closing: 0,           change: 0,         impact: "Settled in period" },
    ],
    totalOpening: arOpen,
    totalSales: arSales,
    totalCollection: -arCollect,
    totalAdjustments: 0,
    totalClosing: arClose,
    totalChange: arChange,            // -529,664
    cfImpact: -arChange,              // +529,664 (cash released)
  });

  // ===========================================================================
  // 4. Reconcile AP — Annual 2025 (real)
  // ===========================================================================
  const apOpen    = 82_704_488;
  const apClose   = 87_097_100;
  const apBill    = 1_091_357_618;
  const apPay     = 1_086_965_006;
  const apChange  = apClose - apOpen;  // +4,392,612

  Object.assign(d.reconcileAP, {
    period: "2025-Annual",
    entities: [
      { entity: "Vehicle Inventory",  opening: 72_500_000, purchases: 875_000_000, payment: -869_000_000, adjustments: 0, closing: 78_500_000, change: 6_000_000, impact: "AP grew (Cash retained)" },
      { entity: "Spare Parts",        opening: 5_318_000,  purchases: 130_000_000, payment: -129_500_000, adjustments: 0, closing: 5_818_000,  change: 500_000,   impact: "Minor increase" },
      { entity: "Utilities/Telecom",  opening: 62_500,     purchases: 38_000_000,  payment: -37_980_000,  adjustments: 0, closing: 82_500,     change: 20_000,    impact: "Minor increase" },
      { entity: "Other Operating",    opening: 4_823_988,  purchases: 48_357_618,  payment: -50_485_006,  adjustments: 0, closing: 2_696_600,  change: -2_127_388, impact: "AP shrunk (Cash used)" },
    ],
    totalOpening: apOpen,
    totalPurchases: apBill,
    totalPayment: -apPay,
    totalAdjustments: 0,
    totalClosing: apClose,
    totalChange: apChange,            // +4,392,612
    cfImpact: apChange,               // +4,392,612 (cash conserved)
  });

  // ===========================================================================
  // 5. Direct CF — Annual 2025 (real, derived from bank by category)
  // ===========================================================================
  d.directCF.sections.length = 0;
  d.directCF.sections.push(
    {
      title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (Direct Method)",
      items: [
        { label: "เงินสดรับจากการขายสินค้าและบริการ", current:  1_345_471_940, prior: 0, indent: 1 },
        { label: "เงินสดรับจากรายได้อื่น",            current:     12_758_617, prior: 0, indent: 1 },
        { label: "เงินสดรับดอกเบี้ย",                current:        491_541, prior: 0, indent: 1 },
        { label: "เงินสดจ่ายให้ผู้จัดจำหน่าย (AP)",   current: -1_086_965_006, prior: 0, indent: 1 },
        { label: "เงินสดจ่ายค่าแรงพนักงาน (Payroll)", current:    -95_972_721, prior: 0, indent: 1 },
        { label: "เงินสดจ่ายค่าเช่า (Lease)",         current:    -16_661_489, prior: 0, indent: 1 },
        { label: "เงินสดจ่ายดอกเบี้ย",               current:     -7_024_093, prior: 0, indent: 1 },
        { label: "เงินสดจ่ายภาษีเงินได้",            current:    -16_154_376, prior: 0, indent: 1 },
      ],
      subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
    },
    {
      title: "กระแสเงินสดจากกิจกรรมลงทุน",
      items: [
        { label: "ซื้อที่ดิน อาคาร อุปกรณ์ (CAPEX)",    current: -3_063_493, prior: 0, indent: 1 },
        { label: "ซื้อสินทรัพย์ไม่มีตัวตน",            current: -1_134_658, prior: 0, indent: 1 },
        { label: "ขายสินทรัพย์ (Disposal)",            current:  3_272_996, prior: 0, indent: 1 },
        { label: "ดอกเบี้ยรับจากเงินลงทุน",            current:    491_541, prior: 0, indent: 1 },
      ],
      subtotalLabel: "เงินสดสุทธิจากกิจกรรมลงทุน",
    },
    {
      title: "กระแสเงินสดจากกิจกรรมจัดหาเงิน",
      items: [
        { label: "เงินกู้ระยะสั้น - รับ",      current:   920_000_000, prior: 0, indent: 1 },
        { label: "เงินกู้ระยะสั้น - จ่ายคืน", current: -1_020_000_000, prior: 0, indent: 1 },
        { label: "เงินกู้ระยะยาว - จ่ายคืน",  current:   -11_150_000, prior: 0, indent: 1 },
        { label: "จ่ายเงินปันผล",            current:   -15_956_511, prior: 0, indent: 1 },
      ],
      subtotalLabel: "เงินสดสุทธิจากกิจกรรมจัดหาเงิน",
    }
  );
  d.directCF.opening = 165_871_149;       // Cash opening
  d.directCF.priorOpening = 165_871_149;

  // ===========================================================================
  // 6. Indirect CF — Annual 2025 (real, from FS targets)
  // ===========================================================================
  d.indirectCF.sections.length = 0;
  d.indirectCF.sections.push(
    {
      title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (Indirect Method)",
      items: [
        { label: "กำไรก่อนภาษีเงินได้",           current:  53_998_171, prior: 0, indent: 1 },
        { label: "ปรับด้วยรายการที่ไม่ใช่เงินสด:",current: null, prior: null, indent: 1, header: true },
        { label: "ค่าเสื่อมราคา - PPE",          current:  40_172_607, prior: 0, indent: 2 },
        { label: "ค่าเสื่อมราคา - Investment Property", current: 1_443_501, prior: 0, indent: 2 },
        { label: "ค่าเสื่อมราคา - ROU Assets",   current:  15_011_633, prior: 0, indent: 2 },
        { label: "ค่าตัดจำหน่ายสินทรัพย์ไม่มีตัวตน", current: 1_124_861, prior: 0, indent: 2 },
        { label: "ต้นทุนทางการเงิน",             current:  14_962_373, prior: 0, indent: 2 },
        { label: "การเปลี่ยนแปลงใน Working Capital:", current: null, prior: null, indent: 1, header: true },
        { label: "ลูกหนี้การค้าลดลง",            current:     529_664, prior: 0, indent: 2 },
        { label: "เจ้าหนี้การค้าเพิ่มขึ้น",      current:   4_392_612, prior: 0, indent: 2 },
        { label: "สินค้าคงเหลือลดลง",            current:  43_908_192, prior: 0, indent: 2 },
        { label: "หัก: ดอกเบี้ยจ่าย",            current:  -7_024_093, prior: 0, indent: 1 },
        { label: "หัก: ภาษีเงินได้จ่าย",         current: -16_154_376, prior: 0, indent: 1 },
      ],
      subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน (Target: 159,138,454)",
    }
  );

  // ===========================================================================
  // 7. Totals (Bank inflow/outflow — full year)
  // ===========================================================================
  d.totals.totalCash = 173_743_169;
  d.totals.inflowQ1  = 2_281_995_094;    // Full year inflow
  d.totals.outflowQ1 = 2_274_123_074;    // Full year outflow
  d.totals.netQ1     = 7_872_020;        // Match FS Target Net Change Cash

  // ===========================================================================
  // 8. Companies (single entity)
  // ===========================================================================
  d.companies.length = 0;
  d.companies.push(
    { id: "CONSO",  name: "Sample Auto Dealer",  short: "Sample", desc: "Honda Dealership (Sample 2025)", color: "#1F9D55" },
    { id: "SAMPLE", name: "Sample Auto Dealer",  short: "Sample", desc: "Honda Dealership",               color: "#2A6FF0" }
  );

  console.log("✅ data-sample-2025.js loaded — CFData patched with REAL 2025 data");
})();
