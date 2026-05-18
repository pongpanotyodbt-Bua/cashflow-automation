/* Cash Flow Reports — Direct + Indirect Method */

function ReportPage({ method, onExport, companyId = "CONSO", chartStyle }) {
  const d = window.CFData;
  const report = method === "direct" ? d.directCF : d.indirectCF;
  const [period, setPeriod] = React.useState("Q1 2569");
  const [showCompare, setShowCompare] = React.useState(true);
  const [showFormulas, setShowFormulas] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState(new Set());
  const activeCo = d.companies.find(c => c.id === companyId) || d.companies[0];

  // Segment matrices (filtered by company)
  const incMatrix = d.getIncomeMatrix(companyId);
  const expMatrix = d.getExpenseMatrix(companyId);

  // Q1 sum (last 3 months) per segment
  const sumQ1 = (arr) => (arr || []).slice(3).reduce((s, v) => s + (v || 0), 0);
  const sumQ0 = (arr) => (arr || []).slice(0, 3).reduce((s, v) => s + (v || 0), 0);

  const incomeSegRows = incMatrix.segments.map(s => ({
    id: s.id,
    name: s.name,
    current: sumQ1(incMatrix.data[s.id]),
    prior: sumQ0(incMatrix.data[s.id]),
  }));
  const expenseSegRows = expMatrix.segments.map(s => ({
    id: s.id,
    name: s.name,
    current: sumQ1(expMatrix.data[s.id]),
    prior: sumQ0(expMatrix.data[s.id]),
  }));

  const toggleRow = (key) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Compute subtotals
  const sections = report.sections.map((sec) => {
    const cur = sec.items.filter((i) => !i.header).reduce((s, i) => s + (i.current || 0), 0);
    const pri = sec.items.filter((i) => !i.header).reduce((s, i) => s + (i.prior || 0), 0);
    return { ...sec, subtotalCurrent: cur, subtotalPrior: pri };
  });

  const netCurrent = sections.reduce((s, x) => s + x.subtotalCurrent, 0);
  const netPrior = sections.reduce((s, x) => s + x.subtotalPrior, 0);
  const closing = report.opening + netCurrent;
  const priorClosing = report.priorOpening + netPrior;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            งบกระแสเงินสด – {method === "direct" ? "วิธีตรง" : "วิธีอ้อม"}
            <span className="co-chip" style={{ background: activeCo.color }}>{activeCo.short}</span>
          </h1>
          <p className="page-sub">
            {method === "direct"
              ? "แสดงรายการเงินสดรับและจ่ายโดยตรงจากกิจกรรมดำเนินงาน"
              : "เริ่มจากกำไรก่อนภาษี และปรับด้วยรายการที่ไม่ใช่เงินสด"} • {activeCo.desc}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="eye" size={14} /> ดู Working Paper</button>
          <button className="btn primary" onClick={onExport}><Ic name="fileExcel" size={14} /> Export Excel</button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 14, gap: 10 }}>
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option>Q1 2569</option>
          <option>ม.ค. 2569</option>
          <option>ก.พ. 2569</option>
          <option>มี.ค. 2569</option>
          <option>YTD 2569</option>
          <option>ปี 2568 (เต็มปี)</option>
          <option>กำหนดเอง…</option>
        </select>
        <select className="select"><option>หน่วย: บาท</option><option>หน่วย: พันบาท</option><option>หน่วย: ล้านบาท</option></select>
        <label className="row small" style={{ gap: 6, marginLeft: 6 }}>
          <input type="checkbox" checked={showCompare} onChange={(e) => setShowCompare(e.target.checked)} />
          เปรียบเทียบกับงวดก่อน
        </label>
        {method === "indirect" && (
          <label className="row small" style={{ gap: 6, marginLeft: 6 }}>
            <input type="checkbox" checked={showFormulas} onChange={(e) => setShowFormulas(e.target.checked)} />
            แสดงสูตรคำนวณ
          </label>
        )}
        <div className="grow" />
        <span className="small muted" style={{ alignSelf: "center" }}>
          <Ic name="chevronDown" size={11} style={{ marginRight: 4 }} />
          คลิกแถวเพื่อดู Segment breakdown
        </span>
        <span className="tag accent"><Ic name="check" size={11} /> ยืนยันแล้ว • โดย K. ปริญญา ส. • 31 มี.ค. 2026</span>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{window.CFData.company.name}</div>
          <div className="grow" />
          <div className="small muted">งบกระแสเงินสด • สำหรับงวด {period} • (หน่วย: บาท)</div>
        </div>

        <div style={{ padding: "8px 0 18px" }}>
          <table className="report-tbl">
            <thead>
              <tr>
                <th style={{ width: "auto" }}>รายการ</th>
                <th style={{ width: 180 }}>งวดปัจจุบัน</th>
                {showCompare && <th style={{ width: 180 }}>งวดก่อนหน้า</th>}
                {showCompare && <th style={{ width: 130 }}>เปลี่ยนแปลง</th>}
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, si) => (
                <React.Fragment key={si}>
                  <tr className="section">
                    <td>{sec.title}</td>
                    <td className="num"></td>
                    {showCompare && <td className="num"></td>}
                    {showCompare && <td className="num"></td>}
                  </tr>
                  {sec.items.map((it, ii) => {
                    if (it.header) {
                      return (
                        <tr key={ii}>
                          <td className={"label indent-" + (it.indent || 1)} style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{it.label}</td>
                          <td className="num"></td>
                          {showCompare && <td className="num"></td>}
                          {showCompare && <td className="num"></td>}
                        </tr>
                      );
                    }
                    const key = `${si}-${ii}`;
                    const isExpanded = expandedRows.has(key);
                    const diff = (it.current || 0) - (it.prior || 0);
                    const mapping = d.cfMapping[it.label];
                    const isIncome = mapping ? mapping.type === "income" : (it.current || 0) >= 0;
                    const allSegRows = isIncome ? incomeSegRows : expenseSegRows;
                    const segRows = mapping
                      ? d.filterSegmentsByMapping(allSegRows, it.label, companyId)
                      : allSegRows;
                    const segTotal = segRows.reduce((s, r) => s + r.current, 0);

                    return (
                      <React.Fragment key={ii}>
                        <tr
                          className={"drill-row" + (isExpanded ? " drill-open" : "")}
                          onClick={() => toggleRow(key)}
                        >
                          <td className={"label indent-" + (it.indent || 1)}>
                            <span className="row" style={{ gap: 7, alignItems: "center" }}>
                              <span className={"drill-chevron" + (isExpanded ? " open" : "")}>
                                <Ic name="chevron" size={11} />
                              </span>
                              <span>
                                {it.label}
                                {showFormulas && it.formula && (
                                  <div className="tiny" style={{ color: "var(--accent-text)", marginTop: 2, fontStyle: "italic", fontWeight: 400 }}>
                                    <Ic name="sparkles" size={10} style={{ marginRight: 4 }} />
                                    สูตร: {it.formula}
                                  </div>
                                )}
                              </span>
                            </span>
                          </td>
                          <td className="num">{window.fmtTHB(it.current)}</td>
                          {showCompare && <td className="num muted">{window.fmtTHB(it.prior)}</td>}
                          {showCompare && <td className={"num small " + (diff > 0 ? "pos" : diff < 0 ? "neg" : "")}>{diff > 0 ? "+" : ""}{window.fmtTHB(diff)}</td>}
                        </tr>

                        {isExpanded && (
                          <React.Fragment>
                            {/* Segment header */}
                            <tr className="drill-seg-head">
                              <td colSpan={showCompare ? 4 : 2}>
                                <span className="row" style={{ gap: 8, alignItems: "center" }}>
                                  <Ic name="boxes" size={12} style={{ color: "var(--accent)" }} />
                                  <span style={{ fontWeight: 600, color: "var(--accent-text)" }}>
                                    Segment Breakdown — {isIncome ? "รายรับ" : "รายจ่าย"} ({activeCo.short})
                                  </span>
                                  <span className="small muted" style={{ marginLeft: 4 }}>
                                    {segRows.length} segments
                                  </span>
                                </span>
                              </td>
                            </tr>

                            {/* Segment rows */}
                            {segRows.length === 0 && (
                              <tr className="drill-seg-row">
                                <td colSpan={showCompare ? 4 : 2} style={{ paddingLeft: 52, fontStyle: "italic", color: "var(--text-tertiary)" }}>
                                  — ยังไม่มี segment ที่ผูกกับรายการนี้ (กำหนดได้ที่ Settings → Cash Flow Mapping)
                                </td>
                              </tr>
                            )}
                            {segRows.map((sr) => {
                              const segDiff = sr.current - sr.prior;
                              return (
                                <tr key={"seg-" + sr.id} className="drill-seg-row">
                                  <td className="label" style={{ paddingLeft: 52 }}>
                                    <span style={{ fontSize: 12.5 }}>{sr.name}</span>
                                  </td>
                                  <td className="num small">{window.fmtTHB(sr.current)}</td>
                                  {showCompare && <td className="num small muted">{window.fmtTHB(sr.prior)}</td>}
                                  {showCompare && <td className={"num small " + (isIncome ? (segDiff > 0 ? "pos" : segDiff < 0 ? "neg" : "") : (segDiff < 0 ? "pos" : segDiff > 0 ? "neg" : ""))}>{segDiff > 0 ? "+" : ""}{window.fmtTHB(segDiff)}</td>}
                                </tr>
                              );
                            })}

                            {/* Segment subtotal */}
                            <tr className="drill-seg-total">
                              <td style={{ paddingLeft: 52, fontSize: 12, fontWeight: 600 }}>รวม Segment ทั้งหมด</td>
                              <td className="num small" style={{ fontWeight: 600 }}>{window.fmtTHB(segTotal)}</td>
                              {showCompare && <td className="num small muted" style={{ fontWeight: 600 }}>{window.fmtTHB(segRows.reduce((s, r) => s + r.prior, 0))}</td>}
                              {showCompare && <td className="num small"></td>}
                            </tr>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <tr className="subtotal">
                    <td className="label">{sec.subtotalLabel}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{window.fmtTHB(sec.subtotalCurrent)}</td>
                    {showCompare && <td className="num muted" style={{ fontWeight: 600 }}>{window.fmtTHB(sec.subtotalPrior)}</td>}
                    {showCompare && <td className="num small"></td>}
                  </tr>
                </React.Fragment>
              ))}
              <tr className="total">
                <td>การเปลี่ยนแปลงสุทธิของเงินสด</td>
                <td className="num" style={{ fontWeight: 600 }}>{window.fmtTHB(netCurrent)}</td>
                {showCompare && <td className="num muted" style={{ fontWeight: 600 }}>{window.fmtTHB(netPrior)}</td>}
                {showCompare && <td className="num"></td>}
              </tr>
              <tr>
                <td className="label">เงินสดและรายการเทียบเท่าเงินสด ณ ต้นงวด</td>
                <td className="num">{window.fmtTHB(report.opening)}</td>
                {showCompare && <td className="num muted">{window.fmtTHB(report.priorOpening)}</td>}
                {showCompare && <td className="num"></td>}
              </tr>
              <tr className="grand">
                <td>เงินสดและรายการเทียบเท่าเงินสด ณ สิ้นงวด</td>
                <td className="num">{window.fmtTHB(closing)}</td>
                {showCompare && <td className="num">{window.fmtTHB(priorClosing)}</td>}
                {showCompare && <td className="num"></td>}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="small muted">
          <span>หมายเหตุประกอบงบฯ: ดูหมายเหตุข้อ 12 ถึง 18 สำหรับการแสดงรายการเพิ่มเติม</span>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm ghost"><Ic name="file" size={13} /> หมายเหตุประกอบ</button>
            <button className="btn sm"><Ic name="download" size={13} /> Excel</button>
            <button className="btn sm"><Ic name="file" size={13} /> PDF</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
        {sections.map((sec, i) => (
          <div className="card" key={i}>
            <div className="card-pad">
              <div className="small muted">{sec.title.replace("กระแสเงินสดจาก", "")}</div>
              <div className="kpi-value" style={{ fontSize: 22, marginTop: 6, color: sec.subtotalCurrent >= 0 ? "var(--success)" : "var(--danger)" }}>
                {sec.subtotalCurrent >= 0 ? "+" : ""}{window.fmtTHB(sec.subtotalCurrent)}
              </div>
              <div className="tiny muted" style={{ marginTop: 4 }}>
                งวดก่อน: {window.fmtTHB(sec.subtotalPrior)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

window.ReportPage = ReportPage;
