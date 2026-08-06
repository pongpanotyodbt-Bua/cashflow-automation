/*
 * cashflow-logic.js — Pure business-logic functions, zero UI dependencies.
 *
 * All functions here are:
 *   - Pure (same input → same output, no side effects)
 *   - Framework-agnostic (no React, no window)
 *   - Directly testable with Vitest / Jest
 *
 * In-browser: window.CFLogic = { ... }
 * In Node/test: module.exports = { ... }  (via the footer shim)
 */

// ─── 1. Number formatting helpers ────────────────────────────────────────────

/** Format a THB amount: 1,234,567.89 */
function fmtTHB(v) {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

/** Shortened version: "61.2M", "412.3K" */
function fmtTHBShort(v) {
  if (v == null || isNaN(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + "B";
  if (abs >= 1_000_000)     return sign + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000)         return sign + (abs / 1_000).toFixed(1) + "K";
  return sign + abs.toFixed(0);
}

// ─── 2. Trial Balance helpers ─────────────────────────────────────────────────

/**
 * Look up a single account balance from a Trial Balance snapshot.
 * @param {Object} trialBalance  - { "2026-Q1": [{code, name, type, balance},...], ... }
 * @param {string} period        - e.g. "2026-Q1"
 * @param {string} code          - GL account code e.g. "1130"
 * @returns {number}
 */
function tbBal(trialBalance, period, code) {
  const row = (trialBalance[period] || []).find(r => r.code === code);
  return row ? row.balance : 0;
}

/**
 * Balance change between two periods (closing - opening).
 * Positive = balance went up.
 */
function tbDelta(trialBalance, curPeriod, priorPeriod, code) {
  return tbBal(trialBalance, curPeriod, code) - tbBal(trialBalance, priorPeriod, code);
}

// ─── 3. Working Capital change calculations (Indirect Method) ─────────────────
//
//  Convention (TFRS / TAS 7):
//    AR increase  → less cash → negative CF adjustment
//    AP increase  → more cash → positive CF adjustment
//    Inv increase → less cash → negative CF adjustment
//    Accrued increase → more cash → positive CF adjustment

/**
 * Net AR change adjusted for bad debt allowance.
 * Returns negative number when AR increased (cash-consuming).
 */
function getARChange(trialBalance, curPeriod, priorPeriod) {
  const arCur   = tbBal(trialBalance, curPeriod,   "1130") + tbBal(trialBalance, curPeriod,   "1140");
  const arPrior = tbBal(trialBalance, priorPeriod, "1130") + tbBal(trialBalance, priorPeriod, "1140");
  return -(arCur - arPrior);
}

/** AP change. Positive when AP increased (cash-preserving). */
function getAPChange(trialBalance, curPeriod, priorPeriod) {
  return tbDelta(trialBalance, curPeriod, priorPeriod, "2110");
}

/** Inventory change. Negative when inventory increased (cash-consuming). */
function getInventoryChange(trialBalance, curPeriod, priorPeriod) {
  return -tbDelta(trialBalance, curPeriod, priorPeriod, "1200");
}

/** Accrued expense change. Positive when accruals increased (cash-preserving). */
function getAccruedExpChange(trialBalance, curPeriod, priorPeriod) {
  return tbDelta(trialBalance, curPeriod, priorPeriod, "2120");
}

/** Depreciation from Income Statement (always non-cash add-back, positive). */
function getDepreciation(incomeStatement, period) {
  return incomeStatement[period]?.depreciation || 0;
}

/** Net PPE addition (CapEx net of disposals). Negative = cash out. */
function getPPEAcquisition(trialBalance, curPeriod, priorPeriod) {
  return tbDelta(trialBalance, curPeriod, priorPeriod, "1500");
}

/** Short-term loan change. Negative = repaid more than borrowed. */
function getShortTermLoanChange(trialBalance, curPeriod, priorPeriod) {
  return tbDelta(trialBalance, curPeriod, priorPeriod, "2210");
}

/** Long-term loan change. Negative = repaid more than borrowed. */
function getLongTermLoanChange(trialBalance, curPeriod, priorPeriod) {
  return tbDelta(trialBalance, curPeriod, priorPeriod, "2310");
}

// ─── 4. Working Capital impact summary ───────────────────────────────────────

/**
 * Sum up all WC adjustments into a single net figure.
 * @param {{ arCF: number, apCF: number, invCF: number, accrCF: number }} wc
 * @returns {number}
 */
function calcWCImpact({ arCF, apCF, invCF, accrCF }) {
  return (arCF || 0) + (apCF || 0) + (invCF || 0) + (accrCF || 0);
}

// ─── 5. CF Statement section calculations ────────────────────────────────────

/**
 * Compute subtotals for every section of a CF statement object.
 * Works for both direct and indirect format.
 *
 * @param {{ sections: Array<{ items: Array<{current?: number, prior?: number, header?: boolean}> }> }} cfObj
 * @returns {Array<{ title: string, subtotalLabel: string, items: any[], sub: number, subPrior: number }>}
 */
function calcSectionSubtotals(cfObj) {
  return (cfObj.sections || []).map(sec => {
    const dataItems = sec.items.filter(i => !i.header);
    const sub      = dataItems.reduce((s, i) => s + (i.current || 0), 0);
    const subPrior = dataItems.reduce((s, i) => s + (i.prior   || 0), 0);
    return { ...sec, sub, subPrior };
  });
}

/**
 * Compute net cash change and closing balance for a CF statement.
 * @param {{ sections: any[], opening: number }} cfObj
 * @returns {{ netCF: number, opening: number, closing: number, sectionSubs: number[] }}
 */
function calcNetCF(cfObj) {
  const secs    = calcSectionSubtotals(cfObj);
  const netCF   = secs.reduce((s, x) => s + x.sub, 0);
  const opening = cfObj.opening || 0;
  return {
    netCF,
    opening,
    closing: opening + netCF,
    sectionSubs: secs.map(s => s.sub),
  };
}

// ─── 6. Direct Method: operating cash item extraction ────────────────────────

/**
 * Extract inflow, outflow, and net from the Operating section of a Direct CF.
 * @param {Array<{current: number, header?: boolean}>} opItems - section[0].items
 * @returns {{ cashIn: number, cashOut: number, netOp: number }}
 */
function calcOperatingItems(opItems) {
  const dataItems = (opItems || []).filter(i => !i.header);
  const cashIn  = dataItems.filter(i => (i.current || 0) > 0).reduce((s, i) => s + i.current, 0);
  const cashOut = dataItems.filter(i => (i.current || 0) < 0).reduce((s, i) => s + i.current, 0);
  return { cashIn, cashOut, netOp: cashIn + cashOut };
}

// ─── 7. AR / AP Reconcile totals ─────────────────────────────────────────────

/**
 * Summarise AR reconcile entity rows into group totals.
 * @param {Array<{ opening, sales, collection, adjustments, closing, change }>} entities
 * @returns {{ totalOpening, totalSales, totalCollection, totalAdjustments, totalClosing, totalChange, cfImpact }}
 */
function calcARReconcileTotals(entities) {
  let totalOpening = 0, totalSales = 0, totalCollection = 0,
      totalAdjustments = 0, totalClosing = 0;
  (entities || []).forEach(e => {
    totalOpening     += e.opening     || 0;
    totalSales       += e.sales       || 0;
    totalCollection  += e.collection  || 0;
    totalAdjustments += e.adjustments || 0;
    totalClosing     += e.closing     || 0;
  });
  const totalChange = totalClosing - totalOpening;
  return {
    totalOpening, totalSales, totalCollection,
    totalAdjustments, totalClosing, totalChange,
    cfImpact: -totalChange, // AR up = cash out = negative
  };
}

/**
 * Summarise AP reconcile entity rows into group totals.
 * @param {Array<{ opening, purchases, payment, adjustments, closing, change }>} entities
 * @returns {{ totalOpening, totalPurchases, totalPayment, totalAdjustments, totalClosing, totalChange, cfImpact }}
 */
function calcAPReconcileTotals(entities) {
  let totalOpening = 0, totalPurchases = 0, totalPayment = 0,
      totalAdjustments = 0, totalClosing = 0;
  (entities || []).forEach(e => {
    totalOpening     += e.opening     || 0;
    totalPurchases   += e.purchases   || 0;
    totalPayment     += e.payment     || 0;
    totalAdjustments += e.adjustments || 0;
    totalClosing     += e.closing     || 0;
  });
  const totalChange = totalClosing - totalOpening;
  return {
    totalOpening, totalPurchases, totalPayment,
    totalAdjustments, totalClosing, totalChange,
    cfImpact: totalChange, // AP up = cash preserved = positive
  };
}

// ─── 8. Cash Ending Reconcile ─────────────────────────────────────────────────

/**
 * Reconcile CF closing balance vs total bank balances.
 * @param {{ sections: any[], opening: number }} directCF
 * @param {Array<{ balance: number }>} bankAccounts
 * @param {number} [tolerance=1_000_000]
 * @returns {{ cfClosing, bankTotal, diff, isBalanced }}
 */
function calcCashEndingReconcile(directCF, bankAccounts, tolerance = 1_000_000) {
  const { netCF, closing: cfClosing } = calcNetCF(directCF);
  const bankTotal = (bankAccounts || []).reduce((s, b) => s + (b.balance || 0), 0);
  const diff      = bankTotal - cfClosing;
  return { cfClosing, bankTotal, diff, isBalanced: Math.abs(diff) < tolerance };
}

// ─── 9. Direct vs Indirect reconciliation ─────────────────────────────────────

/**
 * Compare net CF from Direct and Indirect methods.
 * @param {{ sections: any[], opening: number }} directCF
 * @param {{ sections: any[], opening: number }} indirectCF
 * @param {number} [tolerance=500_000]
 * @returns {{ directNet, indirectNet, diff, isMatch, sectionDiffs }}
 */
function compareDirectIndirect(directCF, indirectCF, tolerance = 500_000) {
  const dSecs = calcSectionSubtotals(directCF);
  const iSecs = calcSectionSubtotals(indirectCF);
  const directNet   = dSecs.reduce((s, x) => s + x.sub, 0);
  const indirectNet = iSecs.reduce((s, x) => s + x.sub, 0);
  const diff        = directNet - indirectNet;
  const sectionDiffs = dSecs.map((ds, i) => ({
    section: i,
    direct: ds.sub,
    indirect: iSecs[i]?.sub ?? 0,
    diff: ds.sub - (iSecs[i]?.sub ?? 0),
  }));
  return { directNet, indirectNet, diff, isMatch: Math.abs(diff) < tolerance, sectionDiffs };
}

// ─── 10. Cross-validation gaps ───────────────────────────────────────────────

/**
 * Compute the 3-way cross-check gaps (CF vs AR vs Bank).
 * @param {{ cfCashFromSales: number, cfNetAll: number, cfOpening: number }} cfMetrics
 * @param {{ arCollections: number, bankInflowQ1: number, bankNetQ1: number, bankClosing: number }} externalMetrics
 * @param {number} [tightTol=5_000_000]
 * @param {number} [medTol=30_000_000]
 * @returns {{ cashSalesGap, bankVsCFGap, closingVsBankGap, checks }}
 */
function calcCrossValidationGaps(cfMetrics, externalMetrics, tightTol = 5_000_000, medTol = 30_000_000) {
  const { cfCashFromSales, cfNetAll, cfOpening } = cfMetrics;
  const { arCollections, bankInflowQ1, bankNetQ1, bankClosing } = externalMetrics;

  const cfClosing          = cfOpening + cfNetAll;
  const cashSalesGap       = cfCashFromSales - arCollections;
  const bankVsCFGap        = bankNetQ1 - cfNetAll;
  const closingVsBankGap   = bankClosing - cfClosing;

  const status = v =>
    Math.abs(v) < tightTol ? "ok" : Math.abs(v) < medTol ? "warn" : "danger";

  return {
    cashSalesGap,
    bankVsCFGap,
    closingVsBankGap,
    checks: [
      { label: "CF Cash from Sales vs AR Collections", gap: cashSalesGap,     status: status(cashSalesGap) },
      { label: "CF Net vs Bank Net",                   gap: bankVsCFGap,       status: status(bankVsCFGap) },
      { label: "CF Closing vs Bank Balance",           gap: closingVsBankGap,  status: status(closingVsBankGap) },
    ],
  };
}

// ─── 11. Segment CF allocation ───────────────────────────────────────────────

/**
 * Allocate consolidated CF amounts down to income segments proportionally.
 *
 * All inputs are plain data (no window references) — pass them in explicitly
 * so this function is fully testable.
 *
 * @param {{
 *   directSections:     Array<{ items: any[] }>,
 *   incomeByCoMonth:    Object,        // { HMW: { HONDA: number[], ... }, ... }
 *   incomeSegmentsByCo: Object,        // { HMW: [{ id, name },...], ... }
 *   companies:          Array<{ id, short, color }>,
 *   reconcileARBySegment: { byEntity: Object },
 *   entities:           string[],      // e.g. ['HMW','CLIK','ACG']
 *   q1SliceStart:       number,        // index where Q1 starts (usually 3)
 * }} params
 * @returns {Array<SegmentCFRow>}
 */
function buildSegmentCF({
  directSections,
  incomeByCoMonth,
  incomeSegmentsByCo,
  companies,
  reconcileARBySegment,
  entities = ['HMW', 'CLIK', 'ACG'],
  q1SliceStart = 3,
}) {
  const sumQ1 = arr => (arr || []).slice(q1SliceStart).reduce((s, v) => s + (v || 0), 0);

  const [opSec, invSec, finSec] = directSections;
  const opItems       = opSec.items.filter(i => !i.header);
  const mainLabel     = "เงินสดรับจากการขายสินค้าและบริการ";
  const cfMainCur     = (opSec.items.find(i => i.label === mainLabel) || {}).current || 0;
  const totalOpOtherIn = opItems.filter(i => (i.current || 0) > 0 && i.label !== mainLabel)
                                .reduce((s, i) => s + i.current, 0);
  const totalOpOut    = opItems.filter(i => (i.current || 0) < 0)
                               .reduce((s, i) => s + i.current, 0);
  const totalInvCF    = invSec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
  const totalFinCF    = finSec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);

  const totalIncQ1 = Object.values(incomeByCoMonth)
    .flatMap(co => Object.values(co))
    .reduce((s, arr) => s + sumQ1(arr), 0);

  const segs = [];
  entities.forEach(entity => {
    const co     = companies.find(c => c.id === entity);
    const arSegs = (reconcileARBySegment.byEntity[entity] || {}).segments || [];
    (incomeSegmentsByCo[entity] || []).forEach(seg => {
      const incQ1    = sumQ1((incomeByCoMonth[entity] || {})[seg.id] || []);
      const pct      = totalIncQ1 > 0 ? incQ1 / totalIncQ1 : 0;
      const scaledInc   = Math.round(cfMainCur * pct);
      const arSeg       = arSegs.find(s => s.id === seg.id);
      const arCFImpact  = arSeg ? -(arSeg.change) : 0;
      const allocOtherIn = Math.round(totalOpOtherIn * pct);
      const allocOpOut   = Math.round(totalOpOut * pct);
      const operatingCF  = scaledInc + arCFImpact + allocOtherIn + allocOpOut;
      const investingCF  = Math.round(totalInvCF * pct);
      const financingCF  = Math.round(totalFinCF * pct);
      segs.push({
        id: seg.id, name: seg.name, entity,
        entityColor: co?.color || '#888',
        entityShort: co?.short || entity,
        incQ1: scaledInc, pct, arSeg, arCFImpact, allocOtherIn, allocOpOut,
        invItems: invSec.items.filter(i => !i.header).map(i => ({
          label: i.label, amt: Math.round((i.current || 0) * pct),
        })),
        finItems: finSec.items.filter(i => !i.header).map(i => ({
          label: i.label, amt: Math.round((i.current || 0) * pct),
        })),
        operatingCF, investingCF, financingCF,
        netCF: operatingCF + investingCF + financingCF,
      });
    });
  });
  return segs;
}

// ─── 12. Indirect CF builder from TB + IS ────────────────────────────────────

/**
 * Build the Indirect CF statement dynamically from Trial Balance and Income Statement.
 * Returns an object shaped identically to the static indirectCF in data.js.
 *
 * @param {Object} trialBalance    - { [period]: [{code, balance},...] }
 * @param {Object} incomeStatement - { [period]: { profitBeforeTax, depreciation, ... } }
 * @param {string} curPeriod       - e.g. "2026-Q1"
 * @param {string} priorPeriod     - e.g. "2025-Q4"
 * @param {string} [priorPriorPeriod] - for prior column WC calcs, e.g. "2025-Q3"
 */
function buildIndirectCF(trialBalance, incomeStatement, curPeriod, priorPeriod, priorPriorPeriod = "2025-Q3") {
  const is      = incomeStatement[curPeriod]      || {};
  const isPrior = incomeStatement[priorPeriod]    || {};

  return {
    sections: [
      {
        title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (วิธีอ้อม)",
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
        items: [
          { label: "กำไรก่อนภาษีเงินได้",                        current: is.profitBeforeTax,      prior: isPrior.profitBeforeTax,      indent: 1 },
          { label: "ปรับด้วยรายการที่ไม่ใช่เงินสด:",             current: null,                     prior: null,                         indent: 1, header: true },
          { label: "ค่าเสื่อมราคาและค่าตัดจำหน่าย",              current: is.depreciation,          prior: isPrior.depreciation,         indent: 2 },
          { label: "หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ",           current: is.badDebt,               prior: isPrior.badDebt,              indent: 2 },
          { label: "ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน",           current: is.fxLoss,                prior: isPrior.fxLoss,               indent: 2 },
          { label: "ดอกเบี้ยจ่าย",                               current: is.interestExp,           prior: isPrior.interestExp,          indent: 2 },
          { label: "การเปลี่ยนแปลงในสินทรัพย์/หนี้สินดำเนินงาน:", current: null,                    prior: null,                         indent: 1, header: true },
          { label: "ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง",             current: getARChange(trialBalance, curPeriod, priorPeriod),       prior: getARChange(trialBalance, priorPeriod, priorPriorPeriod),       indent: 2 },
          { label: "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง",             current: getInventoryChange(trialBalance, curPeriod, priorPeriod), prior: getInventoryChange(trialBalance, priorPeriod, priorPriorPeriod), indent: 2 },
          { label: "เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง)",            current: getAPChange(trialBalance, curPeriod, priorPeriod),       prior: getAPChange(trialBalance, priorPeriod, priorPriorPeriod),       indent: 2 },
          { label: "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)",        current: getAccruedExpChange(trialBalance, curPeriod, priorPeriod), prior: getAccruedExpChange(trialBalance, priorPeriod, priorPriorPeriod), indent: 2 },
          { label: "เงินสดจ่ายดอกเบี้ย",                         current: -(is.interestExp || 0),   prior: -(isPrior.interestExp || 0),  indent: 1 },
          { label: "เงินสดจ่ายภาษีเงินได้",                      current: -(is.tax || 0),           prior: -(isPrior.tax || 0),          indent: 1 },
        ],
      },
      {
        title: "กระแสเงินสดจากกิจกรรมลงทุน",
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมลงทุน",
        items: [
          { label: "ซื้อที่ดิน อาคารและอุปกรณ์",     current: getPPEAcquisition(trialBalance, curPeriod, priorPeriod),                       indent: 1 },
          { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด",   current: -(tbDelta(trialBalance, curPeriod, priorPeriod, "1300") || 0),                 indent: 1 },
        ],
      },
      {
        title: "กระแสเงินสดจากกิจกรรมจัดหาเงิน",
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมจัดหาเงิน",
        items: [
          { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)",  current: getShortTermLoanChange(trialBalance, curPeriod, priorPeriod),                indent: 1 },
          { label: "เงินกู้ระยะยาว – เปลี่ยนแปลง",     current: getLongTermLoanChange(trialBalance, curPeriod, priorPeriod),                 indent: 1 },
        ],
      },
    ],
    opening: tbBal(trialBalance, priorPeriod, "1010"),
  };
}

// ─── 13. Cash health status ───────────────────────────────────────────────────

/** @returns {"good"|"warn"|"danger"} */
function cashHealthStatus(balance, { target = 600_000_000, minimum = 200_000_000 } = {}) {
  if (balance >= target)  return "good";
  if (balance >= minimum) return "warn";
  return "danger";
}

// ─── Export (dual-mode: browser + Node/test) ─────────────────────────────────

const CFLogic = {
  // Formatting
  fmtTHB,
  fmtTHBShort,
  // TB helpers
  tbBal,
  tbDelta,
  // WC change calculations
  getARChange,
  getAPChange,
  getInventoryChange,
  getAccruedExpChange,
  getDepreciation,
  getPPEAcquisition,
  getShortTermLoanChange,
  getLongTermLoanChange,
  // WC impact
  calcWCImpact,
  // CF statement
  calcSectionSubtotals,
  calcNetCF,
  calcOperatingItems,
  // Reconcile totals
  calcARReconcileTotals,
  calcAPReconcileTotals,
  // High-level checks
  calcCashEndingReconcile,
  compareDirectIndirect,
  calcCrossValidationGaps,
  // Builders
  buildSegmentCF,
  buildIndirectCF,
  // Dashboard
  cashHealthStatus,
};

// Browser
if (typeof window !== "undefined") window.CFLogic = CFLogic;
// Node.js / Vitest / Jest
if (typeof module !== "undefined" && module.exports) module.exports = CFLogic;
