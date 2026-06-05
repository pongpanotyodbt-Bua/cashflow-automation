/* Mock data — Thai enterprise listed company, THB millions */
/* Numbers in THB (raw baht); display helper formats them. */

window.CFData = (function () {
  const company = {
    name: "กลุ่มบริษัท ACG / HMW / CLIK",
    short: "GROUP",
    period: "ไตรมาส 1/2569 (ม.ค. – มี.ค. 2026)",
    currency: "THB",
  };

  // -------- Companies in the group --------
  const companies = [
    { id: "CONSO", name: "งบรวมกลุ่ม (Consolidated)", short: "Conso", desc: "รวมทั้งกลุ่ม ACG + HMW + CLIK", color: "#1A1D21" },
    { id: "ACG",   name: "ACG Holding",               short: "ACG",   desc: "บริหารจัดการกลุ่ม (รายได้หลัก: Management Fee)", color: "#2A6FF0" },
    { id: "HMW",   name: "HMW",                       short: "HMW",   desc: "ตัวแทนจำหน่าย Honda + บริการที่เกี่ยวข้อง",       color: "#1F9D55" },
    { id: "CLIK",  name: "CLIK",                      short: "CLIK",  desc: "ธุรกิจบริการ (Service)",                          color: "#7C4DFF" },
  ];

  // -------- Income segments per company --------
  const incomeSegmentsByCo = {
    ACG: [
      { id: "MGT_HMW",  name: "ค่าบริหารจัดการ HMW" },
      { id: "MGT_CLIK", name: "ค่าบริหารจัดการ CLIK" },
      { id: "OTH",      name: "อื่นๆ" },
    ],
    HMW: [
      { id: "HONDA",    name: "HONDA (ขายรถ)" },
      { id: "TOK",      name: "ตอกเข็ม" },
      { id: "INS",      name: "ประกัน" },
      { id: "INS_OPEN", name: "ประกันภัยเปิด" },
      { id: "INS_LIM",  name: "ประวางวง" },
      { id: "FIN",      name: "ไฟแนนซ์" },
      { id: "RENT",     name: "รถเช่า" },
      { id: "DEL",      name: "รถส่ง" },
      { id: "OTH",      name: "อื่นๆ" },
    ],
    CLIK: [
      { id: "SVC",      name: "Service" },
      { id: "OTH",      name: "อื่นๆ" },
    ],
  };

  // -------- Expense segments (เหมือนกันทุกบริษัท) --------
  const expenseSegments = [
    { id: "F1", name: "Loan & Int",         group: "F", color: "#D03434" },
    { id: "I1", name: "Fixed assets",       group: "I", color: "#C97A00" },
    { id: "O1", name: "Staff exp",          group: "O", color: "#2A6FF0" },
    { id: "O2", name: "Inventory",          group: "O", color: "#1F9D55" },
    { id: "O3", name: "Sub contract",       group: "O", color: "#7C4DFF" },
    { id: "O4", name: "Rental & Facilities",group: "O", color: "#0E97A0" },
    { id: "O5", name: "Tax",                group: "O", color: "#8B5A2B" },
    { id: "O6", name: "Others",             group: "O", color: "#8B95A1" },
  ];

  const segmentMonths = ["ต.ค. 68", "พ.ย. 68", "ธ.ค. 68", "ม.ค. 69", "ก.พ. 69", "มี.ค. 69"];

  // Helper to generate deterministic pseudo-random monthly values
  const seg = (base, variance, seed) => segmentMonths.map((_, i) => {
    const v = base + Math.sin((i + seed) * 0.9) * variance + Math.cos((i + seed) * 1.3) * variance * 0.4;
    return Math.max(Math.round(base * 0.4), Math.round(v / 100_000) * 100_000);
  });

  // -------- Per-company income breakdown (monthly × segment) --------
  const incomeByCoMonth = {
    ACG: {
      MGT_HMW:  seg( 8_400_000, 1_200_000, 1),
      MGT_CLIK: seg( 4_200_000,   600_000, 2),
      OTH:      seg(   620_000,   180_000, 3),
    },
    HMW: {
      HONDA:    seg(82_000_000, 14_000_000, 1),
      TOK:      seg( 6_400_000,  1_200_000, 2),
      INS:      seg( 8_900_000,  1_400_000, 3),
      INS_OPEN: seg( 4_200_000,    900_000, 4),
      INS_LIM:  seg( 2_600_000,    600_000, 5),
      FIN:      seg(11_400_000,  2_100_000, 6),
      RENT:     seg( 5_800_000,  1_400_000, 7),
      DEL:      seg( 3_100_000,    700_000, 8),
      OTH:      seg( 1_600_000,    400_000, 9),
    },
    CLIK: {
      SVC:      seg(26_500_000,  4_200_000, 1),
      OTH:      seg(   900_000,    200_000, 2),
    },
  };

  // -------- Per-company expense breakdown (monthly × segment) --------
  const expenseByCoMonth = {
    ACG: {
      F1: seg( 2_400_000,   400_000, 1),
      I1: seg(   800_000,   300_000, 2),
      O1: seg( 4_200_000,   500_000, 3),
      O2: seg(   120_000,    50_000, 4),
      O3: seg( 1_400_000,   300_000, 5),
      O4: seg( 1_800_000,   200_000, 6),
      O5: seg( 1_100_000,   200_000, 7),
      O6: seg(   600_000,   150_000, 8),
    },
    HMW: {
      F1: seg( 6_800_000, 1_100_000, 1),
      I1: seg( 5_200_000, 2_400_000, 2),
      O1: seg(18_400_000, 2_200_000, 3),
      O2: seg(58_000_000, 9_000_000, 4),
      O3: seg( 4_800_000, 1_200_000, 5),
      O4: seg( 6_200_000,   900_000, 6),
      O5: seg( 4_600_000,   800_000, 7),
      O6: seg( 2_400_000,   500_000, 8),
    },
    CLIK: {
      F1: seg( 1_200_000,   300_000, 1),
      I1: seg(   900_000,   400_000, 2),
      O1: seg( 9_600_000, 1_300_000, 3),
      O2: seg( 1_400_000,   400_000, 4),
      O3: seg( 6_400_000, 1_400_000, 5),
      O4: seg( 2_800_000,   500_000, 6),
      O5: seg( 1_800_000,   400_000, 7),
      O6: seg( 1_100_000,   300_000, 8),
    },
  };

  // Helper: get income/expense for a company (or consolidated)
  function getIncomeMatrix(coId) {
    if (coId === "CONSO" || !coId) {
      // Build a unioned segment list across all companies (preserve company prefix)
      const segs = [];
      const data = {};
      Object.entries(incomeByCoMonth).forEach(([co, map]) => {
        const segDefs = incomeSegmentsByCo[co];
        Object.entries(map).forEach(([sid, arr]) => {
          const segDef = segDefs.find(s => s.id === sid);
          const key = `${co}:${sid}`;
          segs.push({ id: key, name: `[${co}] ${segDef ? segDef.name : sid}` });
          data[key] = arr.slice();
        });
      });
      return { months: segmentMonths, segments: segs, data };
    }
    const segDefs = incomeSegmentsByCo[coId] || [];
    const map = incomeByCoMonth[coId] || {};
    return {
      months: segmentMonths,
      segments: segDefs.map(s => ({ id: s.id, name: s.name })),
      data: Object.fromEntries(segDefs.map(s => [s.id, (map[s.id] || segmentMonths.map(() => 0))])),
    };
  }

  function getExpenseMatrix(coId) {
    if (coId === "CONSO" || !coId) {
      const summed = {};
      expenseSegments.forEach(s => {
        summed[s.id] = segmentMonths.map((_, i) =>
          Object.values(expenseByCoMonth).reduce((sum, co) => sum + (co[s.id]?.[i] || 0), 0)
        );
      });
      return {
        months: segmentMonths,
        segments: expenseSegments.map(s => ({ id: s.id, name: s.name, color: s.color })),
        data: summed,
      };
    }
    const map = expenseByCoMonth[coId] || {};
    return {
      months: segmentMonths,
      segments: expenseSegments.map(s => ({ id: s.id, name: s.name, color: s.color })),
      data: Object.fromEntries(expenseSegments.map(s => [s.id, (map[s.id] || segmentMonths.map(() => 0))])),
    };
  }

  function getCompanyTotals(coId) {
    const inc = getIncomeMatrix(coId);
    const exp = getExpenseMatrix(coId);
    const inflowByMonth = inc.months.map((_, i) =>
      inc.segments.reduce((s, sg) => s + (inc.data[sg.id]?.[i] || 0), 0)
    );
    const outflowByMonth = exp.months.map((_, i) =>
      exp.segments.reduce((s, sg) => s + (exp.data[sg.id]?.[i] || 0), 0)
    );
    // Q1 = last 3 months
    const inflowQ1 = inflowByMonth.slice(3).reduce((s, v) => s + v, 0);
    const outflowQ1 = outflowByMonth.slice(3).reduce((s, v) => s + v, 0);
    return {
      monthly: segmentMonths.map((m, i) => ({ m, inflow: inflowByMonth[i], outflow: outflowByMonth[i] })),
      inflowQ1, outflowQ1, netQ1: inflowQ1 - outflowQ1,
    };
  }

  const bankAccounts = [
    { id: "BA-001", entity: "ACG",  name: "บัญชีหลัก – ออมทรัพย์",         bank: "ธนาคารพาณิชย์ A", branch: "สำนักงานใหญ่", no: "xxx-x-12345-6", balance: 248_650_000, type: "ออมทรัพย์",   ccy: "THB" },
    { id: "BA-002", entity: "HMW",  name: "บัญชีดำเนินงาน – กระแสรายวัน",   bank: "ธนาคารพาณิชย์ B", branch: "สีลม",         no: "xxx-x-22334-1", balance:  92_140_000, type: "กระแสรายวัน", ccy: "THB" },
    { id: "BA-003", entity: "HMW",  name: "บัญชีเงินเดือน HMW",            bank: "ธนาคารพาณิชย์ A", branch: "สำนักงานใหญ่", no: "xxx-x-44778-9", balance:  18_220_000, type: "กระแสรายวัน", ccy: "THB" },
    { id: "BA-004", entity: "ACG",  name: "บัญชีต่างประเทศ – USD",         bank: "ธนาคารพาณิชย์ C", branch: "สาทร",         no: "xxx-x-99812-0", balance:  64_310_000, type: "FCD",          ccy: "USD" },
    { id: "BA-005", entity: "ACG",  name: "บัญชีลงทุนระยะสั้น",            bank: "ธนาคารพาณิชย์ A", branch: "สำนักงานใหญ่", no: "xxx-x-55611-3", balance:  45_900_000, type: "ออมทรัพย์",   ccy: "THB" },
    { id: "BA-006", entity: "CLIK", name: "บัญชีดำเนินงาน CLIK",           bank: "ธนาคารพาณิชย์ B", branch: "สีลม",         no: "xxx-x-66422-7", balance:  32_480_000, type: "กระแสรายวัน", ccy: "THB" },
    { id: "BA-007", entity: "CLIK", name: "บัญชีเงินเดือน CLIK",           bank: "ธนาคารพาณิชย์ A", branch: "สำนักงานใหญ่", no: "xxx-x-77133-2", balance:   8_640_000, type: "กระแสรายวัน", ccy: "THB" },
  ];

  // -------- CF line → segment mapping --------
  // Each cash flow report line is mapped to the segments that should appear
  // when drilled down. Income lines map per-entity; expense lines map to
  // shared expense codes (F1, I1, O1–O6).
  const cfMapping = {
    // ================================================================
    // กิจกรรมดำเนินงาน (Operating Activities)
    // ================================================================

    // --- เงินสดรับ (Cash Inflows) ---
    // รายรับจากลูกค้า = ยอดขาย + ลูกหนี้ต้นงวด − ลูกหนี้ปลายงวด
    "เงินสดรับจากการขายสินค้าและบริการ": {
      type: "income",
      incomeSegments: {
        ACG:  ["MGT_HMW", "MGT_CLIK"],
        HMW:  ["HONDA", "TOK", "INS", "INS_OPEN", "INS_LIM", "FIN", "RENT", "DEL"],
        CLIK: ["SVC"],
      },
    },
    // ดอกเบี้ยรับ + เงินปันผลรับ (TAS 7: จัดเป็น Operating หรือ Investing ได้)
    "เงินสดรับจากดอกเบี้ยและเงินปันผล": {
      type: "income",
      incomeSegments: { ACG: ["OTH"], HMW: ["OTH"], CLIK: ["OTH"] },
    },
    "เงินสดรับอื่น": {
      type: "income",
      incomeSegments: { ACG: ["OTH"], HMW: ["OTH"], CLIK: ["OTH"] },
    },

    // --- เงินสดจ่าย (Cash Outflows) ---
    // จ่ายผู้จัดจำหน่าย = ต้นทุนขาย + สินค้าปลายงวด − สินค้าต้นงวด ± เจ้าหนี้
    // จ่ายพนักงาน = ค่าแรง + ค่าใช้จ่าย ± ค้างจ่าย
    "เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน": {
      type: "expense",
      expenseSegments: ["O1", "O2", "O3", "O4", "O6"],
      // O1=Staff, O2=Inventory/COGS, O3=Sub-contract, O4=Rental&Facilities, O6=Others
    },
    // ดอกเบี้ยจ่าย = F1 (Loan & Interest)
    "เงินสดจ่ายดอกเบี้ย": {
      type: "expense",
      expenseSegments: ["F1"],
    },
    // ภาษีเงินได้ = O5 (Tax)
    "เงินสดจ่ายภาษีเงินได้": {
      type: "expense",
      expenseSegments: ["O5"],
    },

    // ================================================================
    // กิจกรรมดำเนินงาน — Indirect Method adjustments
    // ================================================================

    // กำไรก่อนภาษี = จุดเริ่มต้น (แสดง income ทุกประเภท)
    "กำไรก่อนภาษีเงินได้": {
      type: "income",
      incomeSegments: {
        ACG:  ["MGT_HMW", "MGT_CLIK", "OTH"],
        HMW:  ["HONDA", "TOK", "INS", "INS_OPEN", "INS_LIM", "FIN", "RENT", "DEL", "OTH"],
        CLIK: ["SVC", "OTH"],
      },
    },
    // ค่าเสื่อมราคา = I1 (Fixed Assets — บวกกลับ เพราะไม่ใช่เงินสดออก)
    "ค่าเสื่อมราคาและค่าตัดจำหน่าย": {
      type: "expense",
      expenseSegments: ["I1"],
    },
    // หนี้สูญ = O6 (Others — บวกกลับ เพราะไม่ใช่เงินสดออก)
    "หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ": {
      type: "expense",
      expenseSegments: ["O6"],
    },
    // ผลต่างอัตราแลกเปลี่ยน = F1 (Financial items)
    "ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน": {
      type: "expense",
      expenseSegments: ["F1"],
    },
    // ดอกเบี้ยจ่าย (บวกกลับใน Indirect ก่อนหัก) = F1
    "ดอกเบี้ยจ่าย": {
      type: "expense",
      expenseSegments: ["F1"],
    },
    // Working Capital changes:
    // ลูกหนี้เพิ่ม = เงินสดลด (ลูกค้ายังไม่จ่าย) → แสดง income segments
    "ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง": {
      type: "income",
      incomeSegments: {
        ACG:  ["MGT_HMW", "MGT_CLIK"],
        HMW:  ["HONDA", "TOK", "INS", "INS_OPEN", "INS_LIM", "FIN", "RENT", "DEL"],
        CLIK: ["SVC"],
      },
    },
    // สินค้าเพิ่ม = เงินสดลด (ซื้อมากขึ้น) → O2 Inventory
    "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง": {
      type: "expense",
      expenseSegments: ["O2"],
    },
    // เจ้าหนี้เพิ่ม = เงินสดเพิ่ม (ยังไม่จ่าย) → O2, O3 (Supplier/Sub-contract)
    "เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง)": {
      type: "expense",
      expenseSegments: ["O2", "O3"],
    },
    // ค้างจ่ายเพิ่ม = เงินสดเพิ่ม (ยังไม่จ่าย) → O1 Staff, O4 Facilities
    "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)": {
      type: "expense",
      expenseSegments: ["O1", "O4"],
    },

    // ================================================================
    // กิจกรรมลงทุน (Investing Activities)
    // ================================================================

    // ซื้อสินทรัพย์ถาวร = จ่ายเงินสด → I1 Fixed Assets
    "ซื้อที่ดิน อาคารและอุปกรณ์": {
      type: "expense",
      expenseSegments: ["I1"],
    },
    // ขายสินทรัพย์ถาวร = รับเงินสด → OTH (กำไรจากการขาย)
    "ขายสินทรัพย์ถาวร": {
      type: "income",
      incomeSegments: { ACG: ["OTH"], HMW: ["OTH"], CLIK: ["OTH"] },
    },
    // เงินลงทุนระยะสั้น = I1 (ลงทุนชั่วคราว — Fixed assets bucket)
    "เงินลงทุนระยะสั้น (เพิ่ม)/ลด": {
      type: "expense",
      expenseSegments: ["I1"],
    },
    // เงินปันผลรับจากเงินลงทุน (TAS 7: อาจเป็น Operating/Investing)
    "เงินปันผลรับจากเงินลงทุน": {
      type: "income",
      incomeSegments: { ACG: ["OTH"], HMW: ["OTH"], CLIK: ["OTH"] },
    },

    // ================================================================
    // กิจกรรมจัดหาเงิน (Financing Activities)
    // ================================================================

    // เงินกู้ระยะสั้น ลด = จ่ายคืน (F1) / เพิ่ม = รับเงินกู้
    "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)": {
      type: "expense",
      expenseSegments: ["F1"],
    },
    // รับเงินกู้ระยะยาว = inflow → OTH (รับเงิน)
    "เงินกู้ระยะยาว – รับ": {
      type: "income",
      incomeSegments: { ACG: ["OTH"], HMW: ["OTH"], CLIK: ["OTH"] },
    },
    // ชำระคืนเงินกู้ระยะยาว = outflow → F1
    "เงินกู้ระยะยาว – ชำระคืน": {
      type: "expense",
      expenseSegments: ["F1"],
    },
    // จ่ายเงินปันผล = outflow → F1 (financing cost)
    "จ่ายเงินปันผล": {
      type: "expense",
      expenseSegments: ["F1"],
    },
  };

  // Filter income/expense segments by the mapping for a given line label
  function filterSegmentsByMapping(segments, label, companyId) {
    const m = cfMapping[label];
    if (!m) return segments;
    if (m.type === "expense") {
      return segments.filter(s => (m.expenseSegments || []).includes(s.id));
    }
    if (m.type === "income") {
      const inc = m.incomeSegments || {};
      if (companyId && companyId !== "CONSO") {
        const allowed = inc[companyId] || [];
        return segments.filter(s => allowed.includes(s.id));
      }
      const allCombos = [];
      Object.entries(inc).forEach(([entity, segs]) => {
        (segs || []).forEach(sid => allCombos.push(`${entity}:${sid}`));
      });
      return segments.filter(s => allCombos.includes(s.id));
    }
    return segments;
  }

  // helper: get entity by account id
  function getEntityForAccount(accountId) {
    const b = bankAccounts.find(x => x.id === accountId);
    return b ? b.entity : null;
  }
  // helper: get segment display name
  function getSegmentName(entity, segmentId, type) {
    if (type === "out") {
      const s = expenseSegments.find(x => x.id === segmentId);
      return s ? `${s.id} – ${s.name}` : segmentId;
    }
    const list = incomeSegmentsByCo[entity] || [];
    const s = list.find(x => x.id === segmentId);
    return s ? s.name : segmentId;
  }

  // Daily inflow/outflow for past 30 days (THB), approx values
  const trend30 = (() => {
    const days = [];
    let d = new Date(2026, 2, 31);
    for (let i = 29; i >= 0; i--) {
      const dt = new Date(d);
      dt.setDate(d.getDate() - i);
      const baseIn = 6_200_000 + Math.sin(i * 0.7) * 2_800_000 + (i % 7 === 0 ? -3_400_000 : 0);
      const baseOut = 5_400_000 + Math.cos(i * 0.55) * 2_200_000 + (i % 11 === 0 ? 4_200_000 : 0);
      days.push({
        date: dt.toISOString().slice(0, 10),
        inflow: Math.max(800_000, Math.round(baseIn / 10_000) * 10_000),
        outflow: Math.max(700_000, Math.round(baseOut / 10_000) * 10_000),
      });
    }
    return days;
  })();

  const monthly = [
    { m: "ต.ค. 68", inflow: 198_400_000, outflow: 176_200_000 },
    { m: "พ.ย. 68", inflow: 212_800_000, outflow: 188_900_000 },
    { m: "ธ.ค. 68", inflow: 245_600_000, outflow: 219_400_000 },
    { m: "ม.ค. 69", inflow: 188_700_000, outflow: 174_300_000 },
    { m: "ก.พ. 69", inflow: 224_500_000, outflow: 195_800_000 },
    { m: "มี.ค. 69", inflow: 261_300_000, outflow: 218_700_000 },
  ];

  const topInflowCats = [
    { cat: "รายได้จากการขาย – กลุ่มอุตสาหกรรม", amt: 412_300_000, pct: 0.61 },
    { cat: "รายได้จากการขาย – กลุ่มบริการ", amt: 158_700_000, pct: 0.235 },
    { cat: "เงินรับจากลูกหนี้การค้า", amt: 64_400_000, pct: 0.096 },
    { cat: "เงินปันผลรับ", amt: 22_800_000, pct: 0.034 },
    { cat: "ดอกเบี้ยรับ", amt: 16_300_000, pct: 0.024 },
  ];

  const topOutflowCats = [
    { cat: "จ่ายชำระเจ้าหนี้การค้า", amt: 268_900_000, pct: 0.46 },
    { cat: "เงินเดือน & สวัสดิการ", amt: 114_600_000, pct: 0.197 },
    { cat: "ค่าใช้จ่ายดำเนินงาน", amt: 92_800_000, pct: 0.160 },
    { cat: "ภาษีเงินได้นิติบุคคล", amt: 48_700_000, pct: 0.084 },
    { cat: "ดอกเบี้ยจ่าย", amt: 36_200_000, pct: 0.062 },
    { cat: "ลงทุนในสินทรัพย์ถาวร", amt: 21_400_000, pct: 0.037 },
  ];

  const recentTxns = [
    { id: "T-04221", date: "2026-03-29", desc: "รับชำระจากลูกค้า – Honda CRV (พรีเมียร์ เทรดดิ้ง)", account: "BA-002", entity: "HMW",  segmentId: "HONDA",    amount:  18_420_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04220", date: "2026-03-29", desc: "ค่าสินค้า/อะไหล่รถยนต์ – INV-2026/0312",         account: "BA-002", entity: "HMW",  segmentId: "O2",       amount: -12_840_000, type: "out", status: "matched", source: "Bank" },
    { id: "T-04219", date: "2026-03-28", desc: "เงินเดือนพนักงาน HMW – มี.ค. 69",                 account: "BA-003", entity: "HMW",  segmentId: "O1",       amount: -42_100_000, type: "out", status: "matched", source: "Payroll" },
    { id: "T-04218", date: "2026-03-28", desc: "รับชำระค่าตอกเข็ม – Site บางพลี",                  account: "BA-002", entity: "HMW",  segmentId: "TOK",      amount:   6_480_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04217", date: "2026-03-27", desc: "ภาษีหัก ณ ที่จ่าย ภงด.53 (HMW)",                  account: "BA-002", entity: "HMW",  segmentId: "O5",       amount:  -4_280_000, type: "out", status: "pending", source: "Manual" },
    { id: "T-04216", date: "2026-03-27", desc: "ดอกเบี้ยรับ เงินฝากประจำ – Treasury",              account: "BA-005", entity: "ACG",  segmentId: "OTH",      amount:   1_240_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04215", date: "2026-03-26", desc: "ชำระค่าไฟฟ้า – สาขาบางนา",                       account: "BA-002", entity: "HMW",  segmentId: "O4",       amount:  -2_960_000, type: "out", status: "matched", source: "Bank" },
    { id: "T-04214", date: "2026-03-26", desc: "Commission ไฟแนนซ์ – Honda Leasing",            account: "BA-002", entity: "HMW",  segmentId: "FIN",      amount:   3_180_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04213", date: "2026-03-25", desc: "ค่า Sub Contract – บริการขนส่ง CLIK",            account: "BA-006", entity: "CLIK", segmentId: "O3",       amount:  -3_540_000, type: "out", status: "review",  source: "AP" },
    { id: "T-04212", date: "2026-03-25", desc: "ชำระเงินกู้ + ดอกเบี้ย – ACG Treasury",          account: "BA-001", entity: "ACG",  segmentId: "F1",       amount: -25_000_000, type: "out", status: "matched", source: "Bank" },
    { id: "T-04211", date: "2026-03-24", desc: "รับชำระ Service – สัญญา C-2026/044",            account: "BA-006", entity: "CLIK", segmentId: "SVC",      amount:   6_500_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04210", date: "2026-03-24", desc: "ค่าที่ปรึกษากฎหมาย Q1 – ACG",                    account: "BA-001", entity: "ACG",  segmentId: "O6",       amount:  -1_820_000, type: "out", status: "matched", source: "AP" },
    { id: "T-04209", date: "2026-03-24", desc: "ค่าบริหารจัดการ Mar – HMW → ACG",                account: "BA-001", entity: "ACG",  segmentId: "MGT_HMW",  amount:   8_400_000, type: "in",  status: "matched", source: "Manual" },
    { id: "T-04208", date: "2026-03-24", desc: "ค่าบริหารจัดการ Mar – CLIK → ACG",               account: "BA-001", entity: "ACG",  segmentId: "MGT_CLIK", amount:   4_200_000, type: "in",  status: "matched", source: "Manual" },
    { id: "T-04207", date: "2026-03-23", desc: "เงินเดือนพนักงาน CLIK – มี.ค. 69",                account: "BA-007", entity: "CLIK", segmentId: "O1",       amount:  -9_600_000, type: "out", status: "matched", source: "Payroll" },
    { id: "T-04206", date: "2026-03-23", desc: "Commission ประกัน – AIA Honda Plan",            account: "BA-002", entity: "HMW",  segmentId: "INS",      amount:   2_140_000, type: "in",  status: "matched", source: "Bank" },
    { id: "T-04205", date: "2026-03-22", desc: "ค่าเช่าโชว์รูม – HMW (สาขาบางนา)",                account: "BA-002", entity: "HMW",  segmentId: "O4",       amount:  -3_200_000, type: "out", status: "matched", source: "AP" },
    { id: "T-04204", date: "2026-03-22", desc: "รับเงินค่ารถเช่า – Fleet Q1",                    account: "BA-002", entity: "HMW",  segmentId: "RENT",     amount:   1_780_000, type: "in",  status: "matched", source: "Bank" },
  ];

  const arAging = [
    { customer: "บมจ. สยามอุตสาหกรรมเหล็ก",        entity: "HMW",  total: 84_200_000, current: 52_400_000, d30: 18_200_000, d60: 8_900_000, d90: 4_700_000, over: 0 },
    { customer: "บจก. นอร์ทเทิร์น แมนูแฟคเจอริ่ง", entity: "HMW",  total: 38_700_000, current: 22_500_000, d30: 10_100_000, d60: 4_200_000, d90: 1_900_000, over: 0 },
    { customer: "บริษัท พรีเมียร์ เทรดดิ้ง จก.",     entity: "HMW",  total: 26_400_000, current: 14_200_000, d30:  8_600_000, d60: 3_600_000, d90: 0,         over: 0 },
    { customer: "บจก. อีสเทิร์น ปิโตรเคมิคอล",       entity: "CLIK", total: 49_800_000, current: 28_900_000, d30: 12_400_000, d60: 5_500_000, d90: 3_000_000, over: 0 },
    { customer: "บจก. ทรอปิคัล อะกริ",              entity: "CLIK", total: 14_200_000, current:  4_900_000, d30:  3_400_000, d60: 2_800_000, d90: 1_700_000, over: 1_400_000 },
    { customer: "บจก. เซ็นทรัล แพ็คเกจจิ้ง",         entity: "CLIK", total: 22_100_000, current: 16_400_000, d30:  4_200_000, d60: 1_500_000, d90: 0,         over: 0 },
    { customer: "HMW (ค่าบริหารจัดการ)",           entity: "ACG",  total: 12_600_000, current: 12_600_000, d30:          0, d60:         0, d90: 0,         over: 0 },
    { customer: "CLIK (ค่าบริหารจัดการ)",          entity: "ACG",  total:  6_300_000, current:  4_200_000, d30:  2_100_000, d60:         0, d90: 0,         over: 0 },
  ];

  const apAging = [
    { vendor: "บจก. วัตถุดิบเอเชีย",                 entity: "HMW",  total: 64_700_000, current: 38_400_000, d30: 16_200_000, d60: 6_100_000, d90: 4_000_000 },
    { vendor: "บมจ. พลังงานไทยจำกัด",                entity: "HMW",  total: 38_900_000, current: 24_500_000, d30:  9_800_000, d60: 4_600_000, d90: 0         },
    { vendor: "บจก. โลจิสติกส์ไทย",                  entity: "CLIK", total: 12_400_000, current:  8_700_000, d30:  2_600_000, d60: 1_100_000, d90: 0         },
    { vendor: "บจก. เครื่องจักรอุตสาหกรรม KK",      entity: "HMW",  total: 21_300_000, current: 12_400_000, d30:  5_900_000, d60: 3_000_000, d90: 0         },
    { vendor: "บจก. เทคโนโลยีสารสนเทศ",            entity: "ACG",  total:  7_200_000, current:  5_100_000, d30:  1_400_000, d60:   700_000, d90: 0         },
  ];

  const glAccounts = [
    { code: "1110", name: "เงินสด", type: "Asset" },
    { code: "1120", name: "เงินฝากธนาคาร", type: "Asset" },
    { code: "1140", name: "ลูกหนี้การค้า", type: "Asset" },
    { code: "1150", name: "ลูกหนี้อื่น", type: "Asset" },
    { code: "1160", name: "สินค้าคงเหลือ", type: "Asset" },
    { code: "1210", name: "ที่ดิน อาคารและอุปกรณ์", type: "Asset" },
    { code: "2110", name: "เจ้าหนี้การค้า", type: "Liability" },
    { code: "2120", name: "เจ้าหนี้อื่น", type: "Liability" },
    { code: "2130", name: "ค่าใช้จ่ายค้างจ่าย", type: "Liability" },
    { code: "2210", name: "เงินกู้ระยะสั้น", type: "Liability" },
    { code: "2310", name: "เงินกู้ระยะยาว", type: "Liability" },
    { code: "3110", name: "ทุนจดทะเบียน", type: "Equity" },
    { code: "3210", name: "กำไรสะสม", type: "Equity" },
    { code: "4110", name: "รายได้จากการขาย", type: "Revenue" },
    { code: "4210", name: "รายได้อื่น", type: "Revenue" },
    { code: "5110", name: "ต้นทุนขาย", type: "Expense" },
    { code: "5210", name: "ค่าใช้จ่ายในการขาย", type: "Expense" },
    { code: "5220", name: "ค่าใช้จ่ายในการบริหาร", type: "Expense" },
    { code: "5310", name: "ค่าเสื่อมราคา", type: "Expense" },
    { code: "5410", name: "ดอกเบี้ยจ่าย", type: "Expense" },
    { code: "5510", name: "ภาษีเงินได้", type: "Expense" },
  ];

  // Inventory
  const inventory = [
    { sku: "RM-STL-001", name: "เหล็กม้วน HR Coil", uom: "ตัน", qty: 1_240, unit: 28_400, value: 35_216_000 },
    { sku: "RM-STL-002", name: "เหล็กแผ่นรีดเย็น CR", uom: "ตัน", qty: 860, unit: 31_200, value: 26_832_000 },
    { sku: "RM-PLY-014", name: "เม็ดพลาสติก PE", uom: "ตัน", qty: 420, unit: 64_500, value: 27_090_000 },
    { sku: "FG-PIP-090", name: "ท่อเหล็กกล้า 4 นิ้ว", uom: "ชิ้น", qty: 18_400, unit: 1_240, value: 22_816_000 },
    { sku: "FG-PCK-220", name: "แพ็คเกจอุตสาหกรรม L", uom: "ชิ้น", qty: 64_200, unit: 184, value: 11_812_800 },
    { sku: "WIP-A-101", name: "สินค้าระหว่างผลิต กลุ่ม A", uom: "ล็อต", qty: 38, unit: 412_000, value: 15_656_000 },
  ];

  // ===========================================================================
  // AP HONDA Payments — การจ่ายเงินให้ HONDA (รถยนต์/อะไหล่)
  // ไม่อยู่ใน Payments ทั่วไป เพราะมีลักษณะพิเศษ (Stock Financing)
  // ===========================================================================
  const apHondaPayments = [
    { id: "HD-2603-01", date: "2026-03-28", entity: "HMW", invoice: "HD-INV-26030145", model: "Honda Civic RS 2026", qty: 8, unit: 1_124_000, amount: 8_992_000, dueDate: "2026-04-15", status: "pending", account: "BA-002" },
    { id: "HD-2603-02", date: "2026-03-25", entity: "HMW", invoice: "HD-INV-26030122", model: "Honda CR-V 2026", qty: 5, unit: 1_490_000, amount: 7_450_000, dueDate: "2026-04-12", status: "pending", account: "BA-002" },
    { id: "HD-2603-03", date: "2026-03-20", entity: "HMW", invoice: "HD-INV-26030089", model: "Honda HR-V 2026", qty: 6, unit: 1_009_000, amount: 6_054_000, dueDate: "2026-04-08", status: "paid", account: "BA-002" },
    { id: "HD-2603-04", date: "2026-03-15", entity: "HMW", invoice: "HD-INV-26030054", model: "Honda Accord 2026", qty: 3, unit: 1_790_000, amount: 5_370_000, dueDate: "2026-04-02", status: "paid", account: "BA-002" },
    { id: "HD-2603-05", date: "2026-03-12", entity: "HMW", invoice: "HD-INV-26030041", model: "อะไหล่ Genuine Parts Q1", qty: 1, unit: 2_840_000, amount: 2_840_000, dueDate: "2026-03-30", status: "paid", account: "BA-002" },
    { id: "HD-2602-06", date: "2026-02-28", entity: "HMW", invoice: "HD-INV-26020198", model: "Honda City 2026", qty: 10, unit: 729_000, amount: 7_290_000, dueDate: "2026-03-18", status: "paid", account: "BA-002" },
    { id: "HD-2602-07", date: "2026-02-20", entity: "HMW", invoice: "HD-INV-26020156", model: "Honda BR-V 2026", qty: 4, unit: 894_000, amount: 3_576_000, dueDate: "2026-03-10", status: "paid", account: "BA-002" },
  ];

  // ===========================================================================
  // PN Payments — Promissory Note Payment (ตั๋วเงินจ่าย)
  // ใช้สำหรับการจ่ายค่ารถยนต์/อะไหล่ผ่านตั๋วเงิน
  // ===========================================================================
  const pnPayments = [
    { id: "PN-2603-01", date: "2026-03-30", entity: "HMW", pnNo: "PN-HMW-26-0145", beneficiary: "Honda Automobile (Thailand)", amount: 12_500_000, issueDate: "2026-01-30", dueDate: "2026-04-30", term: "90 วัน", status: "outstanding", account: "BA-002" },
    { id: "PN-2603-02", date: "2026-03-25", entity: "HMW", pnNo: "PN-HMW-26-0142", beneficiary: "TC Subaru Thailand", amount: 8_400_000, issueDate: "2026-01-25", dueDate: "2026-04-25", term: "90 วัน", status: "outstanding", account: "BA-002" },
    { id: "PN-2603-03", date: "2026-03-15", entity: "HMW", pnNo: "PN-HMW-26-0138", beneficiary: "Honda Automobile (Thailand)", amount: 6_200_000, issueDate: "2025-12-15", dueDate: "2026-03-15", term: "90 วัน", status: "paid", account: "BA-002" },
    { id: "PN-2602-04", date: "2026-02-20", entity: "CLIK", pnNo: "PN-CLIK-26-0098", beneficiary: "บจก. เครื่องจักรอุตสาหกรรม KK", amount: 4_500_000, issueDate: "2025-11-20", dueDate: "2026-02-20", term: "90 วัน", status: "paid", account: "BA-007" },
    { id: "PN-2602-05", date: "2026-02-15", entity: "HMW", pnNo: "PN-HMW-26-0095", beneficiary: "Honda Automobile (Thailand)", amount: 9_800_000, issueDate: "2025-11-15", dueDate: "2026-02-15", term: "90 วัน", status: "paid", account: "BA-002" },
  ];

  // ===========================================================================
  // Reconcile AR — กระทบยอดลูกหนี้สำหรับ CF Indirect Method
  // เปิดงวด + Sales − Collection = ปิดงวด
  // Change = WC Adjustment สำหรับ Operating CF (Indirect)
  // ===========================================================================
  const reconcileAR = {
    period: "2026-Q1",
    entities: [
      {
        entity: "HMW",
        opening: 224_000_000,
        sales: 412_400_000,
        collection: -385_200_000,
        adjustments: 0,
        closing: 251_200_000,
        change: 27_200_000,
        impact: "Decrease Cash (AR เพิ่ม = ใช้เงิน)",
      },
      {
        entity: "CLIK",
        opening: 86_100_000,
        sales: 165_300_000,
        collection: -148_900_000,
        adjustments: -1_200_000,
        closing: 101_300_000,
        change: 15_200_000,
        impact: "Decrease Cash (AR เพิ่ม = ใช้เงิน)",
      },
      {
        entity: "ACG",
        opening: 14_500_000,
        sales: 32_400_000,
        collection: -27_100_000,
        adjustments: 0,
        closing: 19_800_000,
        change: 5_300_000,
        impact: "Decrease Cash (AR เพิ่ม = ใช้เงิน)",
      },
    ],
    totalOpening: 324_600_000,
    totalSales: 610_100_000,
    totalCollection: -561_200_000,
    totalAdjustments: -1_200_000,
    totalClosing: 372_300_000,
    totalChange: 47_700_000,
    cfImpact: -47_700_000, // Negative = Cash Outflow
  };

  // ===========================================================================
  // Reconcile AP — กระทบยอดเจ้าหนี้สำหรับ CF Indirect Method
  // เปิดงวด + Purchase − Payment = ปิดงวด
  // ===========================================================================
  const reconcileAP = {
    period: "2026-Q1",
    entities: [
      {
        entity: "HMW",
        opening: 98_400_000,
        purchases: 268_900_000,
        payment: -245_300_000,
        adjustments: 0,
        closing: 122_000_000,
        change: 23_600_000,
        impact: "Increase Cash (AP เพิ่ม = ได้เงิน)",
      },
      {
        entity: "CLIK",
        opening: 18_500_000,
        purchases: 84_200_000,
        payment: -78_400_000,
        adjustments: -300_000,
        closing: 24_000_000,
        change: 5_500_000,
        impact: "Increase Cash (AP เพิ่ม = ได้เงิน)",
      },
      {
        entity: "ACG",
        opening: 5_200_000,
        purchases: 12_400_000,
        payment: -11_100_000,
        adjustments: 0,
        closing: 6_500_000,
        change: 1_300_000,
        impact: "Increase Cash (AP เพิ่ม = ได้เงิน)",
      },
    ],
    totalOpening: 122_100_000,
    totalPurchases: 365_500_000,
    totalPayment: -334_800_000,
    totalAdjustments: -300_000,
    totalClosing: 152_500_000,
    totalChange: 30_400_000,
    cfImpact: 30_400_000, // Positive = Cash Inflow
  };

  // ===========================================================================
  // Reconcile AR by Segment — กระทบยอดลูกหนี้แยกตาม Income Segment
  // Opening + Sales − Collection ± Adj = Closing (per segment per entity)
  // ===========================================================================
  const reconcileARBySegment = {
    period: "2026-Q1",
    byEntity: {
      HMW: {
        segments: [
          { id: "HONDA",    name: "HONDA (ขายรถ)",  opening: 135_000_000, sales: 248_000_000, collection: -228_500_000, adjustments: 0, closing: 154_500_000, change: 19_500_000 },
          { id: "TOK",      name: "ตอกเข็ม",         opening:  11_000_000, sales:  20_000_000, collection:  -18_500_000, adjustments: 0, closing:  12_500_000, change:  1_500_000 },
          { id: "INS",      name: "ประกัน",           opening:  15_000_000, sales:  28_000_000, collection:  -26_000_000, adjustments: 0, closing:  17_000_000, change:  2_000_000 },
          { id: "INS_OPEN", name: "ประกันภัยเปิด",     opening:   8_000_000, sales:  14_000_000, collection:  -13_500_000, adjustments: 0, closing:   8_500_000, change:    500_000 },
          { id: "INS_LIM",  name: "ประวางวง",         opening:   5_000_000, sales:  10_000_000, collection:   -9_800_000, adjustments: 0, closing:   5_200_000, change:    200_000 },
          { id: "FIN",      name: "ไฟแนนซ์",         opening:  21_000_000, sales:  38_000_000, collection:  -37_500_000, adjustments: 0, closing:  21_500_000, change:    500_000 },
          { id: "RENT",     name: "รถเช่า",           opening:  11_000_000, sales:  20_000_000, collection:  -19_300_000, adjustments: 0, closing:  11_700_000, change:    700_000 },
          { id: "DEL",      name: "รถส่ง",            opening:   7_000_000, sales:  12_000_000, collection:  -12_100_000, adjustments: 0, closing:   6_900_000, change:   -100_000 },
          { id: "OTH",      name: "อื่นๆ",            opening:  11_000_000, sales:  22_400_000, collection:  -20_000_000, adjustments: 0, closing:  13_400_000, change:  2_400_000 },
        ],
      },
      CLIK: {
        segments: [
          { id: "SVC", name: "Service", opening: 78_000_000, sales: 155_000_000, collection: -140_000_000, adjustments: -1_100_000, closing:  91_900_000, change: 13_900_000 },
          { id: "OTH", name: "อื่นๆ",   opening:  8_100_000, sales:  10_300_000, collection:   -8_900_000, adjustments:   -100_000, closing:   9_400_000, change:  1_300_000 },
        ],
      },
      ACG: {
        segments: [
          { id: "MGT_HMW",  name: "ค่าบริหารจัดการ HMW",  opening: 9_500_000, sales: 22_000_000, collection: -18_000_000, adjustments: 0, closing: 13_500_000, change: 4_000_000 },
          { id: "MGT_CLIK", name: "ค่าบริหารจัดการ CLIK", opening: 4_000_000, sales:  9_000_000, collection:  -7_800_000, adjustments: 0, closing:  5_200_000, change: 1_200_000 },
          { id: "OTH",      name: "อื่นๆ",                opening: 1_000_000, sales:  1_400_000, collection:  -1_300_000, adjustments: 0, closing:  1_100_000, change:   100_000 },
        ],
      },
    },
  };

  // ===========================================================================
  // Reconcile AP by Segment — กระทบยอดเจ้าหนี้แยกตาม Expense Segment
  // Opening + Purchases − Payment ± Adj = Closing (per segment per entity)
  // ===========================================================================
  const reconcileAPBySegment = {
    period: "2026-Q1",
    byEntity: {
      HMW: {
        segments: [
          { id: "F1", name: "Loan & Int",          opening:  6_900_000, purchases:  18_800_000, payment: -17_200_000, adjustments: 0, closing:  8_500_000, change:  1_600_000 },
          { id: "I1", name: "Fixed assets",        opening:  4_900_000, purchases:  13_500_000, payment: -12_300_000, adjustments: 0, closing:  6_100_000, change:  1_200_000 },
          { id: "O1", name: "Staff exp",           opening: 16_700_000, purchases:  45_700_000, payment: -41_700_000, adjustments: 0, closing: 20_700_000, change:  4_000_000 },
          { id: "O2", name: "Inventory",           opening: 51_200_000, purchases: 139_800_000, payment:-127_600_000, adjustments: 0, closing: 63_400_000, change: 12_200_000 },
          { id: "O3", name: "Sub contract",        opening:  3_900_000, purchases:  10_800_000, payment:  -9_800_000, adjustments: 0, closing:  4_900_000, change:  1_000_000 },
          { id: "O4", name: "Rental & Fac.",       opening:  4_900_000, purchases:  13_400_000, payment: -12_200_000, adjustments: 0, closing:  6_100_000, change:  1_200_000 },
          { id: "O5", name: "Tax",                 opening:  3_000_000, purchases:   8_100_000, payment:  -7_300_000, adjustments: 0, closing:  3_800_000, change:    800_000 },
          { id: "O6", name: "Others",              opening:  6_900_000, purchases:  18_800_000, payment: -17_200_000, adjustments: 0, closing:  8_500_000, change:  1_600_000 },
        ],
      },
      CLIK: {
        segments: [
          { id: "O1", name: "Staff exp",           opening:  7_400_000, purchases: 33_700_000, payment: -31_400_000, adjustments:         0, closing:  9_700_000, change:  2_300_000 },
          { id: "O3", name: "Sub contract",        opening:  5_600_000, purchases: 25_300_000, payment: -23_500_000, adjustments:         0, closing:  7_400_000, change:  1_800_000 },
          { id: "O4", name: "Rental & Fac.",       opening:  2_200_000, purchases: 10_100_000, payment:  -9_400_000, adjustments:         0, closing:  2_900_000, change:    700_000 },
          { id: "F1", name: "Loan & Int",          opening:  1_100_000, purchases:  5_100_000, payment:  -4_700_000, adjustments:         0, closing:  1_500_000, change:    400_000 },
          { id: "O5", name: "Tax",                 opening:    900_000, purchases:  4_200_000, payment:  -3_900_000, adjustments:         0, closing:  1_200_000, change:    300_000 },
          { id: "O2", name: "Inventory",           opening:    600_000, purchases:  2_500_000, payment:  -2_400_000, adjustments:         0, closing:    700_000, change:    100_000 },
          { id: "I1", name: "Fixed assets",        opening:    400_000, purchases:  1_700_000, payment:  -1_600_000, adjustments:         0, closing:    500_000, change:    100_000 },
          { id: "O6", name: "Others",              opening:    300_000, purchases:  1_600_000, payment:  -1_500_000, adjustments:  -300_000, closing:    100_000, change:   -200_000 },
        ],
      },
      ACG: {
        segments: [
          { id: "O1", name: "Staff exp",           opening: 2_100_000, purchases: 5_000_000, payment: -4_500_000, adjustments: 0, closing: 2_600_000, change:   500_000 },
          { id: "F1", name: "Loan & Int",          opening:   900_000, purchases: 2_200_000, payment: -2_000_000, adjustments: 0, closing: 1_100_000, change:   200_000 },
          { id: "O4", name: "Rental & Fac.",       opening:   800_000, purchases: 1_900_000, payment: -1_700_000, adjustments: 0, closing: 1_000_000, change:   200_000 },
          { id: "O3", name: "Sub contract",        opening:   600_000, purchases: 1_500_000, payment: -1_300_000, adjustments: 0, closing:   800_000, change:   200_000 },
          { id: "O5", name: "Tax",                 opening:   400_000, purchases: 1_000_000, payment:   -900_000, adjustments: 0, closing:   500_000, change:   100_000 },
          { id: "O6", name: "Others",              opening:   300_000, purchases:   600_000, payment:   -500_000, adjustments: 0, closing:   400_000, change:   100_000 },
          { id: "I1", name: "Fixed assets",        opening:         0, purchases:   100_000, payment:   -100_000, adjustments: 0, closing:         0, change:         0 },
          { id: "O2", name: "Inventory",           opening:   100_000, purchases:   100_000, payment:   -100_000, adjustments: 0, closing:   100_000, change:         0 },
        ],
      },
    },
  };

  // Forecast (next 8 weeks)
  const forecast = (() => {
    const weeks = [];
    let bal = 469_220_000;
    for (let i = 1; i <= 8; i++) {
      const inflow = 38_000_000 + Math.round((Math.sin(i * 0.8) + 1) * 12_000_000);
      const outflow = 34_000_000 + Math.round((Math.cos(i * 0.6) + 1) * 9_000_000);
      bal += inflow - outflow;
      weeks.push({ week: `W${i}`, label: `สัปดาห์ที่ ${i}`, inflow, outflow, net: inflow - outflow, balance: bal });
    }
    return weeks;
  })();

  // Reconciliation pairs
  const reconItems = [
    { id: "R-01", bank: { date: "2026-03-29", desc: "TFR IN – PREMIER TRADING", amount: 18_420_000 }, gl: { date: "2026-03-29", desc: "รับชำระลูกหนี้ – พรีเมียร์", account: "1140", amount: 18_420_000 }, status: "matched" },
    { id: "R-02", bank: { date: "2026-03-29", desc: "PAY – Asia Materials INV-0312", amount: -12_840_000 }, gl: { date: "2026-03-29", desc: "จ่ายเจ้าหนี้ – วัตถุดิบเอเชีย", account: "2110", amount: -12_840_000 }, status: "matched" },
    { id: "R-03", bank: { date: "2026-03-28", desc: "PAYROLL – Mar 2026", amount: -42_100_000 }, gl: { date: "2026-03-28", desc: "เงินเดือนพนักงาน มี.ค.", account: "5220", amount: -42_100_000 }, status: "matched" },
    { id: "R-04", bank: { date: "2026-03-27", desc: "WHT ภงด.53", amount: -4_280_000 }, gl: null, status: "unmatched-bank" },
    { id: "R-05", bank: null, gl: { date: "2026-03-26", desc: "ขายสด – หน้าร้านระยอง", account: "4110", amount: 1_180_000 }, status: "unmatched-gl" },
    { id: "R-06", bank: { date: "2026-03-26", desc: "FEE – Service charge", amount: -28_400 }, gl: { date: "2026-03-26", desc: "ค่าธรรมเนียมธนาคาร", account: "5220", amount: -28_400 }, status: "matched" },
    { id: "R-07", bank: { date: "2026-03-25", desc: "TFR OUT – LOGISTIC TH", amount: -3_540_000 }, gl: { date: "2026-03-25", desc: "ค่าขนส่ง – โลจิสติกส์ไทย", account: "5210", amount: -3_540_000 }, status: "matched" },
    { id: "R-08", bank: { date: "2026-03-24", desc: "DEPOSIT – Contract C-2026/044", amount: 6_500_000 }, gl: { date: "2026-03-24", desc: "เงินมัดจำสัญญา", account: "2120", amount: 6_500_000 }, status: "needs-review" },
  ];

  // Direct method CF
  const directCF = {
    sections: [
      {
        title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (วิธีตรง)",
        items: [
          { label: "เงินสดรับจากการขายสินค้าและบริการ", current: 612_400_000, prior: 548_900_000, indent: 1 },
          { label: "เงินสดรับจากดอกเบี้ยและเงินปันผล", current: 39_100_000, prior: 32_700_000, indent: 1 },
          { label: "เงินสดรับอื่น", current: 14_200_000, prior: 11_400_000, indent: 1 },
          { label: "เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน", current: -483_700_000, prior: -441_200_000, indent: 1 },
          { label: "เงินสดจ่ายดอกเบี้ย", current: -36_200_000, prior: -34_800_000, indent: 1 },
          { label: "เงินสดจ่ายภาษีเงินได้", current: -48_700_000, prior: -41_600_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
      },
      {
        title: "กระแสเงินสดจากกิจกรรมลงทุน",
        items: [
          { label: "ซื้อที่ดิน อาคารและอุปกรณ์", current: -21_400_000, prior: -38_900_000, indent: 1 },
          { label: "ขายสินทรัพย์ถาวร", current: 4_200_000, prior: 1_800_000, indent: 1 },
          { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด", current: -8_600_000, prior: 3_400_000, indent: 1 },
          { label: "เงินปันผลรับจากเงินลงทุน", current: 6_800_000, prior: 5_900_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมลงทุน",
      },
      {
        title: "กระแสเงินสดจากกิจกรรมจัดหาเงิน",
        items: [
          { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)", current: -25_000_000, prior: 12_000_000, indent: 1 },
          { label: "เงินกู้ระยะยาว – รับ", current: 0, prior: 60_000_000, indent: 1 },
          { label: "เงินกู้ระยะยาว – ชำระคืน", current: -18_400_000, prior: -16_200_000, indent: 1 },
          { label: "จ่ายเงินปันผล", current: -32_000_000, prior: -28_000_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมจัดหาเงิน",
      },
    ],
    opening: 446_780_000,
    priorOpening: 412_400_000,
  };

  // Indirect method CF
  const indirectCF = {
    sections: [
      {
        title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (วิธีอ้อม)",
        items: [
          { label: "กำไรก่อนภาษีเงินได้", current: 142_800_000, prior: 118_400_000, indent: 1 },
          { label: "ปรับด้วยรายการที่ไม่ใช่เงินสด:", current: null, prior: null, indent: 1, header: true },
          { label: "ค่าเสื่อมราคาและค่าตัดจำหน่าย", current: 38_700_000, prior: 35_200_000, indent: 2 },
          { label: "หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ", current: 4_200_000, prior: 3_100_000, indent: 2 },
          { label: "ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน", current: -2_400_000, prior: 1_800_000, indent: 2 },
          { label: "ดอกเบี้ยจ่าย", current: 36_200_000, prior: 34_800_000, indent: 2 },
          { label: "การเปลี่ยนแปลงในสินทรัพย์/หนี้สินดำเนินงาน:", current: null, prior: null, indent: 1, header: true },
          { label: "ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง", current: -28_400_000, prior: -22_100_000, indent: 2 },
          { label: "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง", current: -14_800_000, prior: -9_600_000, indent: 2 },
          { label: "เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง)", current: 18_600_000, prior: 12_400_000, indent: 2 },
          { label: "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)", current: 6_200_000, prior: 4_900_000, indent: 2 },
          { label: "เงินสดจ่ายดอกเบี้ย", current: -36_200_000, prior: -34_800_000, indent: 1 },
          { label: "เงินสดจ่ายภาษีเงินได้", current: -48_700_000, prior: -41_600_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
      },
      {
        title: "กระแสเงินสดจากกิจกรรมลงทุน",
        items: [
          { label: "ซื้อที่ดิน อาคารและอุปกรณ์", current: -21_400_000, prior: -38_900_000, indent: 1 },
          { label: "ขายสินทรัพย์ถาวร", current: 4_200_000, prior: 1_800_000, indent: 1 },
          { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด", current: -8_600_000, prior: 3_400_000, indent: 1 },
          { label: "เงินปันผลรับจากเงินลงทุน", current: 6_800_000, prior: 5_900_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมลงทุน",
      },
      {
        title: "กระแสเงินสดจากกิจกรรมจัดหาเงิน",
        items: [
          { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)", current: -25_000_000, prior: 12_000_000, indent: 1 },
          { label: "เงินกู้ระยะยาว – รับ", current: 0, prior: 60_000_000, indent: 1 },
          { label: "เงินกู้ระยะยาว – ชำระคืน", current: -18_400_000, prior: -16_200_000, indent: 1 },
          { label: "จ่ายเงินปันผล", current: -32_000_000, prior: -28_000_000, indent: 1 },
        ],
        subtotalLabel: "เงินสดสุทธิจากกิจกรรมจัดหาเงิน",
      },
    ],
    opening: 446_780_000,
    priorOpening: 412_400_000,
  };

  // Export history
  const exports = [
    { id: "EXP-2026-038", name: "Cash Flow Q1 2026 - Indirect.xlsx", type: "งบกระแสเงินสด (วิธีอ้อม)", period: "Q1 2026", by: "K. ปริญญา ส.", at: "2026-03-31 16:42", size: "212 KB", status: "ready" },
    { id: "EXP-2026-037", name: "Cash Flow Q1 2026 - Direct.xlsx", type: "งบกระแสเงินสด (วิธีตรง)", period: "Q1 2026", by: "K. ปริญญา ส.", at: "2026-03-31 16:38", size: "198 KB", status: "ready" },
    { id: "EXP-2026-036", name: "Bank Balances Mar 26.xlsx", type: "ยอดเงินฝากธนาคาร", period: "มี.ค. 2026", by: "K. รดา ม.", at: "2026-03-30 11:20", size: "84 KB", status: "ready" },
    { id: "EXP-2026-035", name: "AR Aging Mar 26.xlsx", type: "ลูกหนี้ค้างชำระ", period: "มี.ค. 2026", by: "K. ธนวรรธน์ ค.", at: "2026-03-29 09:14", size: "146 KB", status: "ready" },
    { id: "EXP-2026-034", name: "AP Aging Mar 26.xlsx", type: "เจ้าหนี้ค้างชำระ", period: "มี.ค. 2026", by: "K. ธนวรรธน์ ค.", at: "2026-03-29 09:13", size: "118 KB", status: "ready" },
    { id: "EXP-2026-033", name: "Forecast 8W Apr-May 2026.xlsx", type: "Forecast", period: "เม.ย. – พ.ค. 2026", by: "K. ปริญญา ส.", at: "2026-03-28 18:05", size: "164 KB", status: "ready" },
    { id: "EXP-2026-032", name: "Cash Flow Feb 2026 - Indirect.xlsx", type: "งบกระแสเงินสด (วิธีอ้อม)", period: "ก.พ. 2026", by: "K. ปริญญา ส.", at: "2026-02-28 17:00", size: "208 KB", status: "ready" },
  ];

  // Categories for settings
  const categories = [
    { code: "OP-IN-01", name: "เงินรับจากการขาย", method: "ดำเนินงาน", gl: "4110", direction: "in" },
    { code: "OP-IN-02", name: "เงินรับจากลูกหนี้", method: "ดำเนินงาน", gl: "1140", direction: "in" },
    { code: "OP-IN-03", name: "ดอกเบี้ยรับ", method: "ดำเนินงาน", gl: "4210", direction: "in" },
    { code: "OP-OUT-01", name: "จ่ายเจ้าหนี้การค้า", method: "ดำเนินงาน", gl: "2110", direction: "out" },
    { code: "OP-OUT-02", name: "เงินเดือนและสวัสดิการ", method: "ดำเนินงาน", gl: "5220", direction: "out" },
    { code: "OP-OUT-03", name: "ค่าใช้จ่ายดำเนินงานอื่น", method: "ดำเนินงาน", gl: "5210", direction: "out" },
    { code: "OP-OUT-04", name: "ดอกเบี้ยจ่าย", method: "ดำเนินงาน", gl: "5410", direction: "out" },
    { code: "OP-OUT-05", name: "ภาษีเงินได้", method: "ดำเนินงาน", gl: "5510", direction: "out" },
    { code: "IV-OUT-01", name: "ซื้อทรัพย์สินถาวร", method: "ลงทุน", gl: "1210", direction: "out" },
    { code: "IV-IN-01", name: "ขายทรัพย์สินถาวร", method: "ลงทุน", gl: "1210", direction: "in" },
    { code: "FN-IN-01", name: "เงินกู้ – รับ", method: "จัดหาเงิน", gl: "2210", direction: "in" },
    { code: "FN-OUT-01", name: "เงินกู้ – ชำระ", method: "จัดหาเงิน", gl: "2210", direction: "out" },
    { code: "FN-OUT-02", name: "จ่ายเงินปันผล", method: "จัดหาเงิน", gl: "3210", direction: "out" },
  ];

  // -------- Trial Balance (multi-period) for Auto-Calc --------
  // Account_Type: Asset / Liability / Equity / Revenue / Expense
  // Use to auto-derive: AR Change, AP Change, Inventory Change, Depreciation, PPE addition
  const trialBalance = {
    "2025-Q4": [  // Prior quarter (opening)
      { code: "1010", name: "เงินสดและรายการเทียบเท่า", type: "Asset", balance: 446_780_000 },  // Q4/2025 closing = Q1/2026 opening
      { code: "1130", name: "ลูกหนี้การค้า",            type: "Asset", balance: 168_300_000 },
      { code: "1140", name: "ค่าเผื่อหนี้สงสัยจะสูญ",        type: "Asset", balance: -8_200_000 },
      { code: "1200", name: "สินค้าคงเหลือ",            type: "Asset", balance: 142_800_000 },
      { code: "1500", name: "ที่ดิน อาคารและอุปกรณ์",      type: "Asset", balance: 982_400_000 },
      { code: "1590", name: "ค่าเสื่อมราคาสะสม",          type: "Asset", balance: -286_500_000 },
      { code: "2110", name: "เจ้าหนี้การค้า",            type: "Liability", balance: 95_400_000 },
      { code: "2120", name: "ค่าใช้จ่ายค้างจ่าย",          type: "Liability", balance: 42_100_000 },
      { code: "2210", name: "เงินกู้ระยะสั้น",           type: "Liability", balance: 180_000_000 },
      { code: "2310", name: "เงินกู้ระยะยาว",            type: "Liability", balance: 240_000_000 },
      { code: "3000", name: "ทุนจดทะเบียน",              type: "Equity", balance: 500_000_000 },
      { code: "3100", name: "กำไรสะสม",                  type: "Equity", balance: 354_900_000 },
    ],
    "2026-Q1": [  // Current quarter (closing)
      { code: "1010", name: "เงินสดและรายการเทียบเท่า", type: "Asset", balance: 465_220_000 },
      { code: "1130", name: "ลูกหนี้การค้า",            type: "Asset", balance: 196_700_000 },  // +28.4M (AR up)
      { code: "1140", name: "ค่าเผื่อหนี้สงสัยจะสูญ",        type: "Asset", balance: -12_400_000 }, // +4.2M (bad debt)
      { code: "1200", name: "สินค้าคงเหลือ",            type: "Asset", balance: 157_600_000 },  // +14.8M (inv up)
      { code: "1500", name: "ที่ดิน อาคารและอุปกรณ์",      type: "Asset", balance: 999_600_000 },  // +21.4M - 4.2M = +17.2M net
      { code: "1590", name: "ค่าเสื่อมราคาสะสม",          type: "Asset", balance: -325_200_000 }, // +38.7M
      { code: "2110", name: "เจ้าหนี้การค้า",            type: "Liability", balance: 114_000_000 }, // +18.6M (AP up)
      { code: "2120", name: "ค่าใช้จ่ายค้างจ่าย",          type: "Liability", balance: 48_300_000 },  // +6.2M
      { code: "2210", name: "เงินกู้ระยะสั้น",           type: "Liability", balance: 155_000_000 }, // -25M (paid down)
      { code: "2310", name: "เงินกู้ระยะยาว",            type: "Liability", balance: 221_600_000 }, // -18.4M (paid down)
      { code: "3000", name: "ทุนจดทะเบียน",              type: "Equity", balance: 500_000_000 },
      { code: "3100", name: "กำไรสะสม",                  type: "Equity", balance: 415_700_000 },  // +94.1M (Net Income - Dividend)
    ],
  };

  // -------- Income Statement summary (for Net Profit) --------
  const incomeStatement = {
    "2026-Q1": {
      revenue:           1_242_000_000,
      cogs:                845_000_000,
      grossProfit:         397_000_000,
      opEx:                182_000_000,
      depreciation:         38_700_000,  // non-cash, added back in Indirect
      badDebt:               4_200_000,  // non-cash, added back
      fxLoss:               -2_400_000,
      interestExp:          36_200_000,
      profitBeforeTax:     142_800_000,
      tax:                  48_700_000,
      netProfit:            94_100_000,
    },
    "2025-Q4": {
      revenue:           1_098_000_000,
      cogs:                756_000_000,
      grossProfit:         342_000_000,
      opEx:                166_400_000,
      depreciation:         35_200_000,
      badDebt:               3_100_000,
      fxLoss:                1_800_000,
      interestExp:          34_800_000,
      profitBeforeTax:     118_400_000,
      tax:                  41_600_000,
      netProfit:            76_800_000,
    },
  };

  // -------- Auto-calc helpers (derive CF items from TB + IS) --------
  // Lookup helper
  function tbBal(period, code) {
    const row = (trialBalance[period] || []).find(r => r.code === code);
    return row ? row.balance : 0;
  }
  // Delta: closing - opening (positive = balance went up)
  function tbDelta(curPeriod, priorPeriod, code) {
    return tbBal(curPeriod, code) - tbBal(priorPeriod, code);
  }

  // Working capital changes (Indirect Method conventions: use sign that makes cash effect explicit)
  // AR up → cash down → negative adjustment
  // AP up → cash up → positive adjustment
  // Inventory up → cash down → negative
  function getARChange(cur, prior) {
    // Net AR = 1130 - 1140 (allowance)
    const arCur = tbBal(cur, "1130") + tbBal(cur, "1140");
    const arPri = tbBal(prior, "1130") + tbBal(prior, "1140");
    return -(arCur - arPri);  // negative if AR increased
  }
  function getAPChange(cur, prior) {
    return tbDelta(cur, prior, "2110");
  }
  function getInventoryChange(cur, prior) {
    return -tbDelta(cur, prior, "1200");
  }
  function getAccruedExpChange(cur, prior) {
    return tbDelta(cur, prior, "2120");
  }
  function getDepreciation(period) {
    return incomeStatement[period]?.depreciation || 0;
  }
  function getPPEAcquisition(cur, prior) {
    // Gross PPE change minus disposals; for simplicity here, we expose net addition
    return tbDelta(cur, prior, "1500");
  }
  function getShortTermLoanChange(cur, prior) {
    return tbDelta(cur, prior, "2210");
  }
  function getLongTermLoanChange(cur, prior) {
    return tbDelta(cur, prior, "2310");
  }

  // Build Indirect CF dynamically from TB + IS (returns array of section items)
  function buildIndirectCF(curPeriod, priorPeriod) {
    const is = incomeStatement[curPeriod] || {};
    const isPrior = incomeStatement[priorPeriod] || {};

    return {
      sections: [
        {
          title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (วิธีอ้อม)",
          items: [
            { label: "กำไรก่อนภาษีเงินได้", current: is.profitBeforeTax, prior: isPrior.profitBeforeTax, indent: 1, formula: "จาก Income Statement" },
            { label: "ปรับด้วยรายการที่ไม่ใช่เงินสด:", current: null, prior: null, indent: 1, header: true },
            { label: "ค่าเสื่อมราคาและค่าตัดจำหน่าย", current: is.depreciation, prior: isPrior.depreciation, indent: 2, formula: "ΔAccumulated Depreciation (1590)" },
            { label: "หนี้สูญและค่าเผื่อหนี้สงสัยจะสูญ", current: is.badDebt, prior: isPrior.badDebt, indent: 2, formula: "ΔAllowance for Doubtful Accounts (1140)" },
            { label: "ขาดทุน/(กำไร) จากอัตราแลกเปลี่ยน", current: is.fxLoss, prior: isPrior.fxLoss, indent: 2, formula: "จาก Income Statement" },
            { label: "ดอกเบี้ยจ่าย", current: is.interestExp, prior: isPrior.interestExp, indent: 2, formula: "Interest Expense จาก Income Statement" },
            { label: "การเปลี่ยนแปลงในสินทรัพย์/หนี้สินดำเนินงาน:", current: null, prior: null, indent: 1, header: true },
            { label: "ลูกหนี้การค้า (เพิ่มขึ้น)/ลดลง", current: getARChange(curPeriod, priorPeriod), prior: getARChange(priorPeriod, "2025-Q3"), indent: 2, formula: "-(AR Cur - AR Prior)" },
            { label: "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง", current: getInventoryChange(curPeriod, priorPeriod), prior: getInventoryChange(priorPeriod, "2025-Q3"), indent: 2, formula: "-(Inv Cur - Inv Prior)" },
            { label: "เจ้าหนี้การค้า เพิ่มขึ้น/(ลดลง)", current: getAPChange(curPeriod, priorPeriod), prior: getAPChange(priorPeriod, "2025-Q3"), indent: 2, formula: "AP Cur - AP Prior" },
            { label: "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)", current: getAccruedExpChange(curPeriod, priorPeriod), prior: getAccruedExpChange(priorPeriod, "2025-Q3"), indent: 2, formula: "ΔAccrued Expenses (2120)" },
            { label: "เงินสดจ่ายดอกเบี้ย", current: -is.interestExp, prior: -isPrior.interestExp, indent: 1, formula: "-Interest Expense" },
            { label: "เงินสดจ่ายภาษีเงินได้", current: -is.tax, prior: -isPrior.tax, indent: 1, formula: "-Income Tax" },
          ],
          subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
        },
        {
          title: "กระแสเงินสดจากกิจกรรมลงทุน",
          items: [
            { label: "ซื้อที่ดิน อาคารและอุปกรณ์", current: -21_400_000, prior: -38_900_000, indent: 1, formula: "ΔPPE Gross (1500) + Disposal" },
            { label: "ขายสินทรัพย์ถาวร", current: 4_200_000, prior: 1_800_000, indent: 1 },
            { label: "เงินลงทุนระยะสั้น (เพิ่ม)/ลด", current: -8_600_000, prior: 3_400_000, indent: 1 },
            { label: "เงินปันผลรับจากเงินลงทุน", current: 6_800_000, prior: 5_900_000, indent: 1 },
          ],
          subtotalLabel: "เงินสดสุทธิจากกิจกรรมลงทุน",
        },
        {
          title: "กระแสเงินสดจากกิจกรรมจัดหาเงิน",
          items: [
            { label: "เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)", current: getShortTermLoanChange(curPeriod, priorPeriod), prior: 12_000_000, indent: 1, formula: "ΔShort-term Loan (2210)" },
            { label: "เงินกู้ระยะยาว – รับ", current: 0, prior: 60_000_000, indent: 1 },
            { label: "เงินกู้ระยะยาว – ชำระคืน", current: getLongTermLoanChange(curPeriod, priorPeriod), prior: -16_200_000, indent: 1, formula: "ΔLong-term Loan (2310)" },
            { label: "จ่ายเงินปันผล", current: -32_000_000, prior: -28_000_000, indent: 1 },
          ],
          subtotalLabel: "เงินสดสุทธิจากกิจกรรมจัดหาเงิน",
        },
      ],
      opening: tbBal(priorPeriod, "1010"),
      priorOpening: 412_400_000,
    };
  }

  // Build Direct CF dynamically — guarantees Operating CF (Direct) = Operating CF (Indirect)
  function buildDirectCF(curPeriod, priorPeriod) {
    const is = incomeStatement[curPeriod] || {};

    // Compute Indirect Operating CF as ground truth
    const indData = buildIndirectCF(curPeriod, priorPeriod);
    const indirectOpCF = indData.sections[0].items
      .filter(i => !i.header)
      .reduce((s, i) => s + (i.current || 0), 0);

    // Cash from customers: actual collections from AR reconciliation
    const cashFromCustomers          = Math.abs(reconcileAR.totalCollection);
    const interestDivReceived        = 39_100_000;
    const otherCashReceived          = 14_200_000;
    const interestPaid               = -(is.interestExp || 0);
    const taxPaid                    = -(is.tax || 0);

    // Back-calculate suppliers+employees so Direct Operating CF = Indirect exactly
    const cashToSuppliersAndEmployees =
      indirectOpCF - cashFromCustomers - interestDivReceived - otherCashReceived - interestPaid - taxPaid;

    return {
      sections: [
        {
          title: "กระแสเงินสดจากกิจกรรมดำเนินงาน (วิธีตรง)",
          items: [
            { label: "เงินสดรับจากการขายสินค้าและบริการ",        current: cashFromCustomers,           prior: 548_900_000,  indent: 1 },
            { label: "เงินสดรับจากดอกเบี้ยและเงินปันผล",         current: interestDivReceived,          prior:  32_700_000,  indent: 1 },
            { label: "เงินสดรับอื่น",                           current: otherCashReceived,            prior:  11_400_000,  indent: 1 },
            { label: "เงินสดจ่ายให้แก่ผู้จัดจำหน่ายและพนักงาน", current: cashToSuppliersAndEmployees,  prior: -441_200_000, indent: 1 },
            { label: "เงินสดจ่ายดอกเบี้ย",                      current: interestPaid,                 prior:  -34_800_000, indent: 1 },
            { label: "เงินสดจ่ายภาษีเงินได้",                   current: taxPaid,                      prior:  -41_600_000, indent: 1 },
          ],
          subtotalLabel: "เงินสดสุทธิจากกิจกรรมดำเนินงาน",
        },
        indData.sections[1],  // Investing (shared)
        indData.sections[2],  // Financing (shared)
      ],
      opening:      tbBal(priorPeriod, "1010"),
      priorOpening: 412_400_000,
    };
  }

  // Overwrite indirectCF with auto-calculated version
  Object.assign(indirectCF, buildIndirectCF("2026-Q1", "2025-Q4"));

  // Overwrite directCF with auto-calculated version (ensures Direct Operating CF = Indirect)
  Object.assign(directCF, buildDirectCF("2026-Q1", "2025-Q4"));

  // Totals derived
  const totalCash = bankAccounts.reduce((s, b) => s + b.balance, 0);
  const inflowQ1 = monthly.slice(3).reduce((s, m) => s + m.inflow, 0);
  const outflowQ1 = monthly.slice(3).reduce((s, m) => s + m.outflow, 0);

  return {
    company, companies, bankAccounts, trend30, monthly,
    topInflowCats, topOutflowCats, recentTxns,
    arAging, apAging, glAccounts, inventory,
    // Phase A additions
    apHondaPayments, pnPayments, reconcileAR, reconcileAP,
    reconcileARBySegment, reconcileAPBySegment,
    forecast, reconItems, directCF, indirectCF,
    exports, categories,
    // Auto-calc CF
    trialBalance, incomeStatement,
    getARChange, getAPChange, getInventoryChange, getAccruedExpChange,
    getDepreciation, getPPEAcquisition, getShortTermLoanChange, getLongTermLoanChange,
    buildIndirectCF, buildDirectCF, tbBal, tbDelta,
    // segment data
    incomeSegmentsByCo, expenseSegments, segmentMonths,
    incomeByCoMonth, expenseByCoMonth,
    getIncomeMatrix, getExpenseMatrix, getCompanyTotals,
    getEntityForAccount, getSegmentName,
    cfMapping, filterSegmentsByMapping,
    totals: { totalCash, inflowQ1, outflowQ1, netQ1: inflowQ1 - outflowQ1 },
  };
})();

window.fmtTHB = function (n, opts = {}) {
  if (n == null || isNaN(n)) return "—";
  const { compact = false, sign = false, decimals = 0 } = opts;
  const abs = Math.abs(n);
  let str;
  if (compact && abs >= 1_000_000) {
    str = (abs / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " ลบ.";
  } else {
    str = abs.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  if (n < 0) return "(" + str + ")";
  return sign && n > 0 ? "+" + str : str;
};

window.fmtTHBShort = function (n) {
  if (n == null) return "—";
  const abs = Math.abs(n);
  let v, suf;
  if (abs >= 1_000_000_000) { v = n / 1_000_000_000; suf = " พันลบ."; }
  else if (abs >= 1_000_000) { v = n / 1_000_000; suf = " ลบ."; }
  else if (abs >= 1_000) { v = n / 1_000; suf = " พัน"; }
  else { v = n; suf = ""; }
  return v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + suf;
};
