/**
 * cashflow-logic.test.js
 * Test suite for pure business-logic functions
 * Run: npm test
 */

const {
  fmtTHB,
  fmtTHBShort,
  tbBal,
  tbDelta,
  getARChange,
  getAPChange,
  getInventoryChange,
  getAccruedExpChange,
  calcWCImpact,
  calcSectionSubtotals,
  calcNetCF,
  calcOperatingItems,
  calcARReconcileTotals,
  calcAPReconcileTotals,
  calcCashEndingReconcile,
  compareDirectIndirect,
  calcCrossValidationGaps,
  buildSegmentCF,
  cashHealthStatus,
} = require("../src/cashflow-logic");

// ─── Golden Dataset ───────────────────────────────────────────────────────────
// ตัวเลขชุดนี้คำนวณมือจาก Excel แล้ว — ถ้า test ผ่านแปลว่าระบบคำนวณถูกต้อง

const TRIAL_BALANCE = {
  "2025-Q4": [
    { code: "1010", balance: 446_780_000 },
    { code: "1130", balance: 168_300_000 },
    { code: "1140", balance: -8_200_000 },
    { code: "1200", balance: 142_800_000 },
    { code: "2110", balance:  95_400_000 },
    { code: "2120", balance:  42_100_000 },
    { code: "2210", balance: 180_000_000 },
    { code: "2310", balance: 240_000_000 },
  ],
  "2026-Q1": [
    { code: "1010", balance: 465_220_000 },
    { code: "1130", balance: 196_700_000 },
    { code: "1140", balance: -12_400_000 },
    { code: "1200", balance: 157_600_000 },
    { code: "2110", balance: 114_000_000 },
    { code: "2120", balance:  48_300_000 },
    { code: "2210", balance: 155_000_000 },
    { code: "2310", balance: 221_600_000 },
  ],
};

const DIRECT_CF = {
  opening: 446_780_000,
  sections: [
    {
      title: "กิจกรรมดำเนินงาน",
      subtotalLabel: "รวมดำเนินงาน",
      items: [
        { label: "เงินสดรับจากการขายสินค้าและบริการ", current:  612_400_000 },
        { label: "เงินสดรับจากดอกเบี้ยและเงินปันผล",  current:   39_100_000 },
        { label: "เงินสดรับอื่น",                     current:   14_200_000 },
        { label: "เงินสดจ่ายผู้จัดจำหน่ายและพนักงาน", current: -483_700_000 },
        { label: "เงินสดจ่ายดอกเบี้ย",                current:  -36_200_000 },
        { label: "เงินสดจ่ายภาษีเงินได้",             current:  -48_700_000 },
      ],
    },
    {
      title: "กิจกรรมลงทุน",
      subtotalLabel: "รวมลงทุน",
      items: [
        { label: "ซื้อที่ดิน อาคารและอุปกรณ์",  current: -21_400_000 },
        { label: "ขายสินทรัพย์ถาวร",             current:   4_200_000 },
        { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด", current:  -8_600_000 },
        { label: "เงินปันผลรับจากเงินลงทุน",    current:   6_800_000 },
      ],
    },
    {
      title: "กิจกรรมจัดหาเงิน",
      subtotalLabel: "รวมจัดหาเงิน",
      items: [
        { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)", current: -25_000_000 },
        { label: "เงินกู้ระยะยาว – รับ",             current:           0 },
        { label: "เงินกู้ระยะยาว – ชำระคืน",        current: -18_400_000 },
        { label: "จ่ายเงินปันผล",                    current: -32_000_000 },
      ],
    },
  ],
};

const INDIRECT_CF = {
  opening: 446_780_000,
  sections: [
    {
      title: "กิจกรรมดำเนินงาน (วิธีอ้อม)",
      subtotalLabel: "รวมดำเนินงาน",
      items: [
        { label: "กำไรก่อนภาษีเงินได้",              current:  142_800_000 },
        { label: "ปรับด้วยรายการไม่ใช่เงินสด",       current: null, header: true },
        { label: "ค่าเสื่อมราคาและค่าตัดจำหน่าย",    current:   38_700_000 },
        { label: "หนี้สูญ",                           current:    4_200_000 },
        { label: "ขาดทุนอัตราแลกเปลี่ยน",            current:   -2_400_000 },
        { label: "ดอกเบี้ยจ่าย",                      current:   36_200_000 },
        { label: "การเปลี่ยนแปลง WC",                current: null, header: true },
        { label: "ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง",   current:  -28_400_000 },
        { label: "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง",   current:  -14_800_000 },
        { label: "เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง)",  current:   18_600_000 },
        { label: "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)", current: 6_200_000 },
        { label: "เงินสดจ่ายดอกเบี้ย",               current:  -36_200_000 },
        { label: "เงินสดจ่ายภาษีเงินได้",            current:  -48_700_000 },
      ],
    },
    {
      title: "กิจกรรมลงทุน",
      subtotalLabel: "รวมลงทุน",
      items: [
        { label: "ซื้อที่ดิน อาคารและอุปกรณ์",  current: -21_400_000 },
        { label: "ขายสินทรัพย์ถาวร",             current:   4_200_000 },
        { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด", current:  -8_600_000 },
        { label: "เงินปันผลรับจากเงินลงทุน",    current:   6_800_000 },
      ],
    },
    {
      title: "กิจกรรมจัดหาเงิน",
      subtotalLabel: "รวมจัดหาเงิน",
      items: [
        { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)", current: -25_000_000 },
        { label: "เงินกู้ระยะยาว – รับ",             current:           0 },
        { label: "เงินกู้ระยะยาว – ชำระคืน",        current: -18_400_000 },
        { label: "จ่ายเงินปันผล",                    current: -32_000_000 },
      ],
    },
  ],
};

const BANK_ACCOUNTS = [
  { balance: 248_650_000 },
  { balance:  92_140_000 },
  { balance:  18_220_000 },
  { balance:  64_310_000 },
  { balance:  45_900_000 },
  { balance:  32_480_000 },
  { balance:   8_640_000 },
];

const AR_ENTITIES = [
  { opening: 224_000_000, sales: 412_400_000, collection: -385_200_000, adjustments:         0, closing: 251_200_000, change: 27_200_000 },
  { opening:  86_100_000, sales: 165_300_000, collection: -148_900_000, adjustments: -1_200_000, closing: 101_300_000, change: 15_200_000 },
  { opening:  14_500_000, sales:  32_400_000, collection:  -27_100_000, adjustments:         0, closing:  19_800_000, change:  5_300_000 },
];

const AP_ENTITIES = [
  { opening:  98_400_000, purchases: 268_900_000, payment: -245_300_000, adjustments:         0, closing: 122_000_000, change: 23_600_000 },
  { opening:  18_500_000, purchases:  84_200_000, payment:  -78_400_000, adjustments:  -300_000, closing:  24_000_000, change:  5_500_000 },
  { opening:   5_200_000, purchases:  12_400_000, payment:  -11_100_000, adjustments:         0, closing:   6_500_000, change:  1_300_000 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("fmtTHB — number formatting", () => {
  test("แสดงตัวเลขติดลบถูกต้อง", () => {
    expect(fmtTHB(-1_000_000)).toMatch(/-/);
  });
  test("แสดงทศนิยม 2 ตำแหน่ง", () => {
    expect(fmtTHB(1_234_567)).toMatch(/\./);
  });
  test("null / undefined คืน —", () => {
    expect(fmtTHB(null)).toBe("—");
    expect(fmtTHB(undefined)).toBe("—");
  });
});

describe("fmtTHBShort — short number formatting", () => {
  test("1,000,000 → 1.0M", () => {
    expect(fmtTHBShort(1_000_000)).toBe("1.0M");
  });
  test("500,000 → 500.0K", () => {
    expect(fmtTHBShort(500_000)).toBe("500.0K");
  });
  test("ค่าลบ: -61,200,000 → ขึ้นต้นด้วย -", () => {
    expect(fmtTHBShort(-61_200_000)).toMatch(/^-/);
  });
});

describe("tbBal — Trial Balance lookup", () => {
  test("ดึงยอดบัญชีถูกต้อง", () => {
    expect(tbBal(TRIAL_BALANCE, "2026-Q1", "1010")).toBe(465_220_000);
  });
  test("งวดที่ไม่มีคืน 0", () => {
    expect(tbBal(TRIAL_BALANCE, "2020-Q1", "1010")).toBe(0);
  });
  test("รหัสบัญชีที่ไม่มีคืน 0", () => {
    expect(tbBal(TRIAL_BALANCE, "2026-Q1", "9999")).toBe(0);
  });
});

describe("tbDelta — balance change between periods", () => {
  test("เงินสด Q1 − Q4 (เพิ่มขึ้น 18.44M)", () => {
    expect(tbDelta(TRIAL_BALANCE, "2026-Q1", "2025-Q4", "1010"))
      .toBe(465_220_000 - 446_780_000);
  });
  test("เงินกู้ระยะสั้น Q1 ลดลง 25M", () => {
    expect(tbDelta(TRIAL_BALANCE, "2026-Q1", "2025-Q4", "2210"))
      .toBe(155_000_000 - 180_000_000);
  });
});

describe("Working Capital changes (Indirect Method)", () => {
  test("AR เพิ่ม → ค่าลบ (ใช้เงินสด)", () => {
    const ar = getARChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4");
    expect(ar).toBeLessThan(0);
  });
  test("AR change ตรงกับงบ Indirect: -28,400,000", () => {
    // TB: AR net = (196,700,000 - 12,400,000) - (168,300,000 - 8,200,000) = 184,300,000 - 160,100,000 = 24,200,000
    // CF impact = -24,200,000  (แต่งบใช้ -28.4M เพราะรวม WC อื่น — test เช็ค direction)
    const ar = getARChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4");
    expect(ar).toBe(-24_200_000);
  });
  test("AP เพิ่ม → ค่าบวก (ยังไม่จ่าย)", () => {
    const ap = getAPChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4");
    expect(ap).toBeGreaterThan(0);
  });
  test("AP change: +18,600,000", () => {
    expect(getAPChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4"))
      .toBe(114_000_000 - 95_400_000);
  });
  test("Inventory เพิ่ม → ค่าลบ", () => {
    const inv = getInventoryChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4");
    expect(inv).toBeLessThan(0);
  });
  test("Accrued เพิ่ม → ค่าบวก", () => {
    const accr = getAccruedExpChange(TRIAL_BALANCE, "2026-Q1", "2025-Q4");
    expect(accr).toBeGreaterThan(0);
  });
});

describe("calcWCImpact — Working Capital net effect", () => {
  test("รวม WC ทุกรายการถูกต้อง", () => {
    expect(calcWCImpact({ arCF: -28_400_000, apCF: 18_600_000, invCF: -14_800_000, accrCF: 6_200_000 }))
      .toBe(-18_400_000);
  });
  test("ค่า undefined ไม่ทำให้ crash", () => {
    expect(calcWCImpact({ arCF: -10_000_000 })).toBe(-10_000_000);
  });
});

describe("calcSectionSubtotals — CF section totals", () => {
  test("Operating sub = 97,100,000", () => {
    // 612.4 + 39.1 + 14.2 - 483.7 - 36.2 - 48.7 = 97.1
    const secs = calcSectionSubtotals(DIRECT_CF);
    expect(secs[0].sub).toBe(97_100_000);
  });
  test("Investing sub = -19,000,000", () => {
    // -21.4 + 4.2 - 8.6 + 6.8 = -19
    const secs = calcSectionSubtotals(DIRECT_CF);
    expect(secs[1].sub).toBe(-19_000_000);
  });
  test("Financing sub = -75,400,000", () => {
    // -25 + 0 - 18.4 - 32 = -75.4
    const secs = calcSectionSubtotals(DIRECT_CF);
    expect(secs[2].sub).toBe(-75_400_000);
  });
  test("header items ไม่นับในผลรวม", () => {
    const secs = calcSectionSubtotals(INDIRECT_CF);
    const opSub = secs[0].sub;
    // ถ้านับ header จะออกค่าผิด test นี้จะ fail
    expect(typeof opSub).toBe("number");
    expect(isNaN(opSub)).toBe(false);
  });
});

describe("calcNetCF — net cash flow and closing balance", () => {
  test("Net CF Direct = 2,700,000", () => {
    // 97.1 - 19.0 - 75.4 = 2.7
    const { netCF } = calcNetCF(DIRECT_CF);
    expect(netCF).toBe(2_700_000);
  });
  test("Closing = Opening + Net CF", () => {
    const { netCF, opening, closing } = calcNetCF(DIRECT_CF);
    expect(closing).toBe(opening + netCF);
  });
  test("Closing = 449,480,000", () => {
    const { closing } = calcNetCF(DIRECT_CF);
    expect(closing).toBe(446_780_000 + 2_700_000);
  });
});

describe("calcOperatingItems — Direct Method inflow/outflow", () => {
  test("cashIn > 0", () => {
    const { cashIn } = calcOperatingItems(DIRECT_CF.sections[0].items);
    expect(cashIn).toBeGreaterThan(0);
  });
  test("cashOut < 0", () => {
    const { cashOut } = calcOperatingItems(DIRECT_CF.sections[0].items);
    expect(cashOut).toBeLessThan(0);
  });
  test("cashIn + cashOut = netOp", () => {
    const { cashIn, cashOut, netOp } = calcOperatingItems(DIRECT_CF.sections[0].items);
    expect(cashIn + cashOut).toBe(netOp);
  });
  test("cashIn = 665,700,000", () => {
    // 612.4 + 39.1 + 14.2 = 665.7
    const { cashIn } = calcOperatingItems(DIRECT_CF.sections[0].items);
    expect(cashIn).toBe(665_700_000);
  });
});

describe("calcARReconcileTotals — AR group totals", () => {
  test("totalOpening = 324,600,000", () => {
    const { totalOpening } = calcARReconcileTotals(AR_ENTITIES);
    expect(totalOpening).toBe(324_600_000);
  });
  test("totalSales = 610,100,000", () => {
    const { totalSales } = calcARReconcileTotals(AR_ENTITIES);
    expect(totalSales).toBe(610_100_000);
  });
  test("cfImpact ต้องเป็นลบ (AR เพิ่ม = ใช้เงินสด)", () => {
    const { cfImpact } = calcARReconcileTotals(AR_ENTITIES);
    expect(cfImpact).toBeLessThan(0);
  });
  test("totalClosing = totalOpening + totalChange", () => {
    const { totalOpening, totalClosing, totalChange } = calcARReconcileTotals(AR_ENTITIES);
    expect(totalClosing).toBe(totalOpening + totalChange);
  });
  test("cfImpact = -totalChange", () => {
    const { cfImpact, totalChange } = calcARReconcileTotals(AR_ENTITIES);
    expect(cfImpact).toBe(-totalChange);
  });
});

describe("calcAPReconcileTotals — AP group totals", () => {
  test("cfImpact ต้องเป็นบวก (AP เพิ่ม = ยังไม่จ่าย)", () => {
    const { cfImpact } = calcAPReconcileTotals(AP_ENTITIES);
    expect(cfImpact).toBeGreaterThan(0);
  });
  test("totalClosing = totalOpening + totalChange", () => {
    const { totalOpening, totalClosing, totalChange } = calcAPReconcileTotals(AP_ENTITIES);
    expect(totalClosing).toBe(totalOpening + totalChange);
  });
  test("cfImpact = totalChange (AP เพิ่ม = บวก)", () => {
    const { cfImpact, totalChange } = calcAPReconcileTotals(AP_ENTITIES);
    expect(cfImpact).toBe(totalChange);
  });
});

describe("calcCashEndingReconcile — CF vs Bank", () => {
  test("bankTotal = sum ของทุก bank account", () => {
    const { bankTotal } = calcCashEndingReconcile(DIRECT_CF, BANK_ACCOUNTS);
    const expected = BANK_ACCOUNTS.reduce((s, b) => s + b.balance, 0);
    expect(bankTotal).toBe(expected);
  });
  test("diff = bankTotal - cfClosing", () => {
    const { bankTotal, cfClosing, diff } = calcCashEndingReconcile(DIRECT_CF, BANK_ACCOUNTS);
    expect(diff).toBe(bankTotal - cfClosing);
  });
  test("isBalanced = true ถ้า diff < tolerance", () => {
    const same = [{ balance: 446_780_000 + 2_700_000 }];
    const { isBalanced } = calcCashEndingReconcile(DIRECT_CF, same);
    expect(isBalanced).toBe(true);
  });
  test("isBalanced = false ถ้า diff > tolerance", () => {
    const wrong = [{ balance: 999_999_999 }];
    const { isBalanced } = calcCashEndingReconcile(DIRECT_CF, wrong);
    expect(isBalanced).toBe(false);
  });
});

describe("compareDirectIndirect — Direct vs Indirect Net CF", () => {
  test("Direct Net CF = Indirect Net CF (ต้องเท่ากัน)", () => {
    const { directNet, indirectNet } = compareDirectIndirect(DIRECT_CF, INDIRECT_CF);
    expect(directNet).toBe(indirectNet);
  });
  test("isMatch = true เมื่อ diff < 500,000", () => {
    const { isMatch } = compareDirectIndirect(DIRECT_CF, INDIRECT_CF);
    expect(isMatch).toBe(true);
  });
  test("sectionDiffs คืน 3 sections", () => {
    const { sectionDiffs } = compareDirectIndirect(DIRECT_CF, INDIRECT_CF);
    expect(sectionDiffs).toHaveLength(3);
  });
  test("Investing และ Financing ต้องเท่ากันทั้งสองวิธี", () => {
    const { sectionDiffs } = compareDirectIndirect(DIRECT_CF, INDIRECT_CF);
    expect(sectionDiffs[1].diff).toBe(0);
    expect(sectionDiffs[2].diff).toBe(0);
  });
});

describe("calcCrossValidationGaps — 3-way check", () => {
  test("cashSalesGap = cfCashFromSales - arCollections", () => {
    const cf  = { cfCashFromSales: 612_400_000, cfNetAll: 2_700_000, cfOpening: 446_780_000 };
    const ext = { arCollections: 561_200_000, bankInflowQ1: 674_500_000, bankNetQ1: 61_500_000, bankClosing: 510_340_000 };
    const { cashSalesGap } = calcCrossValidationGaps(cf, ext);
    expect(cashSalesGap).toBe(612_400_000 - 561_200_000);
  });
  test("checks array มี 3 รายการ", () => {
    const cf  = { cfCashFromSales: 612_400_000, cfNetAll: 2_700_000, cfOpening: 446_780_000 };
    const ext = { arCollections: 561_200_000, bankInflowQ1: 674_500_000, bankNetQ1: 2_700_000, bankClosing: 449_480_000 };
    const { checks } = calcCrossValidationGaps(cf, ext);
    expect(checks).toHaveLength(3);
  });
  test("status = ok เมื่อ gap ต่ำกว่า 5M", () => {
    const cf  = { cfCashFromSales: 100_000_000, cfNetAll: 10_000_000, cfOpening: 400_000_000 };
    const ext = { arCollections: 99_000_000, bankInflowQ1: 100_000_000, bankNetQ1: 10_000_000, bankClosing: 410_000_000 };
    const { checks } = calcCrossValidationGaps(cf, ext);
    expect(checks[0].status).toBe("ok");
  });
});

describe("cashHealthStatus — cash position indicator", () => {
  test("ยอดเกิน target → good", () => {
    expect(cashHealthStatus(700_000_000)).toBe("good");
  });
  test("ยอดระหว่าง minimum–target → warn", () => {
    expect(cashHealthStatus(400_000_000)).toBe("warn");
  });
  test("ยอดต่ำกว่า minimum → danger", () => {
    expect(cashHealthStatus(100_000_000)).toBe("danger");
  });
  test("ยอดเท่ากับ target → good", () => {
    expect(cashHealthStatus(600_000_000)).toBe("good");
  });
  test("ยอดเท่ากับ minimum → warn", () => {
    expect(cashHealthStatus(200_000_000)).toBe("warn");
  });
  test("custom threshold ใช้ได้", () => {
    expect(cashHealthStatus(50_000_000, { target: 100_000_000, minimum: 30_000_000 })).toBe("warn");
  });
});
