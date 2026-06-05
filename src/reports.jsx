/* Cash Flow Reports — Direct + Indirect Method + Phase B Report Enhancements */

// ─── Module helpers ───────────────────────────────────────────────────────────
const _q1 = arr => (arr || []).slice(3).reduce((s, v) => s + (v || 0), 0);

function buildSegmentCF() {
  const d = window.CFData;
  const [opSec, invSec, finSec] = d.directCF.sections;
  const opItems = opSec.items.filter(i => !i.header);
  const mainLabel = "เงินสดรับจากการขายสินค้าและบริการ";
  const totalOpOtherIn = opItems.filter(i => (i.current || 0) > 0 && i.label !== mainLabel)
    .reduce((s, i) => s + i.current, 0);
  const totalOpOut = opItems.filter(i => (i.current || 0) < 0)
    .reduce((s, i) => s + i.current, 0);
  const totalInvCF = invSec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
  const totalFinCF = finSec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
  const totalIncQ1 = Object.values(d.incomeByCoMonth)
    .flatMap(co => Object.values(co))
    .reduce((s, arr) => s + _q1(arr), 0);

  const segs = [];
  ['HMW', 'CLIK', 'ACG'].forEach(entity => {
    const co = d.companies.find(c => c.id === entity);
    const arSegs = (d.reconcileARBySegment.byEntity[entity] || {}).segments || [];
    (d.incomeSegmentsByCo[entity] || []).forEach(seg => {
      const incQ1 = _q1((d.incomeByCoMonth[entity] || {})[seg.id] || []);
      const pct = totalIncQ1 > 0 ? incQ1 / totalIncQ1 : 0;
      const arSeg = arSegs.find(s => s.id === seg.id);
      const arCFImpact = arSeg ? -(arSeg.change) : 0;
      const allocOtherIn = Math.round(totalOpOtherIn * pct);
      const allocOpOut = Math.round(totalOpOut * pct);
      const operatingCF = incQ1 + arCFImpact + allocOtherIn + allocOpOut;
      const investingCF = Math.round(totalInvCF * pct);
      const financingCF = Math.round(totalFinCF * pct);
      segs.push({
        id: seg.id, name: seg.name, entity,
        entityColor: co?.color || '#888',
        entityShort: co?.short || entity,
        incQ1, pct, arSeg, arCFImpact, allocOtherIn, allocOpOut,
        invItems: invSec.items.filter(i => !i.header).map(i => ({ label: i.label, amt: Math.round((i.current || 0) * pct) })),
        finItems: finSec.items.filter(i => !i.header).map(i => ({ label: i.label, amt: Math.round((i.current || 0) * pct) })),
        operatingCF, investingCF, financingCF,
        netCF: operatingCF + investingCF + financingCF,
      });
    });
  });
  return segs;
}

// ─── Req 3.1 – Segment CF Card ────────────────────────────────────────────────
function SegmentCFCard({ seg }) {
  const fmt = window.fmtTHB;
  const nc = v => "num" + (v > 0 ? " pos" : v < 0 ? " neg" : "");

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-head" style={{ borderLeft: "4px solid " + seg.entityColor, paddingLeft: 14 }}>
        <div>
          <div className="card-title" style={{ fontSize: 13.5 }}>{seg.name}</div>
          <span className="co-chip" style={{ background: seg.entityColor }}>{seg.entityShort}</span>
        </div>
        <div className="grow" />
        <div style={{ textAlign: "right" }}>
          <div className="tiny muted">Net CF Q1/2569</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: seg.netCF >= 0 ? "var(--success)" : "var(--danger)" }}>
            {seg.netCF >= 0 ? "+" : ""}{fmt(seg.netCF)}
          </div>
        </div>
      </div>

      <table className="report-tbl" style={{ margin: "4px 0 8px" }}>
        <tbody>
          <tr className="section"><td colSpan={2} style={{ fontSize: 11 }}>กิจกรรมดำเนินงาน</td></tr>
          <tr><td className="label indent-1" style={{ fontSize: 12.5 }}>รายรับจากลูกค้า</td><td className={nc(seg.incQ1) + " small"}>{fmt(seg.incQ1)}</td></tr>
          <tr><td className="label indent-1" style={{ fontSize: 12.5 }}>ผลกระทบลูกหนี้การค้า (AR)</td><td className={nc(seg.arCFImpact) + " small"}>{fmt(seg.arCFImpact)}</td></tr>
          {seg.allocOtherIn !== 0 && (
            <tr><td className="label indent-1" style={{ fontSize: 12.5 }}>รายรับอื่น (สัดส่วน)</td><td className={nc(seg.allocOtherIn) + " small"}>{fmt(seg.allocOtherIn)}</td></tr>
          )}
          <tr><td className="label indent-1" style={{ fontSize: 12.5 }}>ค่าใช้จ่ายดำเนินงาน (สัดส่วน)</td><td className={nc(seg.allocOpOut) + " small"}>{fmt(seg.allocOpOut)}</td></tr>
          <tr className="subtotal">
            <td className="label">รวมกิจกรรมดำเนินงาน</td>
            <td className={nc(seg.operatingCF)} style={{ fontWeight: 600 }}>{fmt(seg.operatingCF)}</td>
          </tr>
          <tr className="section"><td colSpan={2} style={{ fontSize: 11 }}>กิจกรรมลงทุน</td></tr>
          {seg.invItems.map((it, i) => (
            <tr key={i}><td className="label indent-1" style={{ fontSize: 12.5 }}>{it.label}</td><td className={nc(it.amt) + " small"}>{fmt(it.amt)}</td></tr>
          ))}
          <tr className="subtotal">
            <td className="label">รวมกิจกรรมลงทุน</td>
            <td className={nc(seg.investingCF)} style={{ fontWeight: 600 }}>{fmt(seg.investingCF)}</td>
          </tr>
          <tr className="section"><td colSpan={2} style={{ fontSize: 11 }}>กิจกรรมจัดหาเงิน</td></tr>
          {seg.finItems.map((it, i) => (
            <tr key={i}><td className="label indent-1" style={{ fontSize: 12.5 }}>{it.label}</td><td className={nc(it.amt) + " small"}>{fmt(it.amt)}</td></tr>
          ))}
          <tr className="subtotal">
            <td className="label">รวมกิจกรรมจัดหาเงิน</td>
            <td className={nc(seg.financingCF)} style={{ fontWeight: 600 }}>{fmt(seg.financingCF)}</td>
          </tr>
          <tr className="grand">
            <td style={{ fontWeight: 700 }}>เงินสดสุทธิ Q1/2569</td>
            <td className={nc(seg.netCF)} style={{ fontWeight: 700 }}>{seg.netCF >= 0 ? "+" : ""}{fmt(seg.netCF)}</td>
          </tr>
        </tbody>
      </table>
      {seg.arSeg && (
        <div style={{ margin: "0 12px 10px", padding: "6px 10px", background: "var(--bg-2,#f5f5f5)", borderRadius: 6, fontSize: 12 }}>
          <div className="tiny muted" style={{ marginBottom: 3 }}>AR Reconciliation Q1/2569</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span>เปิด {fmt(seg.arSeg.opening)}</span>
            <span className="muted">+รายได้ {fmt(seg.arSeg.sales)}</span>
            <span className="muted">−เก็บ {fmt(Math.abs(seg.arSeg.collection))}</span>
            <span><strong>ปิด {fmt(seg.arSeg.closing)}</strong></span>
            <span style={{ marginLeft: "auto", fontWeight: 600, color: seg.arCFImpact >= 0 ? "var(--success)" : "var(--danger)" }}>
              CF {seg.arCFImpact >= 0 ? "+" : ""}{fmt(seg.arCFImpact)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Req 3.1 – Segment CF Tab ─────────────────────────────────────────────────
function SegmentCFTab() {
  const d = window.CFData;
  const [filter, setFilter] = React.useState("ALL");
  const allSegs = React.useMemo(() => buildSegmentCF(), []);
  const segs = filter === "ALL" ? allSegs : allSegs.filter(s => s.entity === filter);

  return (
    <>
      <div className="row" style={{ marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
        {[["ALL", "ทุกบริษัท", null], ["HMW", "HMW", "#1F9D55"], ["CLIK", "CLIK", "#7C4DFF"], ["ACG", "ACG", "#2A6FF0"]].map(([id, label, color]) => (
          <button key={id} className={"btn" + (filter === id ? " primary" : "")} onClick={() => setFilter(id)}>
            {color && <span className="co-chip" style={{ background: color, marginRight: 5 }}>{id}</span>}
            {label}
          </button>
        ))}
        <span className="grow" />
        <span className="small muted" style={{ alignSelf: "center" }}>
          <Ic name="boxes" size={12} style={{ marginRight: 4 }} />
          {segs.length} segments • Investing/Financing แบ่งสัดส่วนตามยอดรายได้
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
        {segs.map(seg => <SegmentCFCard key={seg.entity + seg.id} seg={seg} />)}
      </div>
    </>
  );
}

// ─── Req 3.2 – WC Reconcile Tab ──────────────────────────────────────────────
function WCReconcileTab() {
  const d = window.CFData;
  const fmt = window.fmtTHB;
  const [expandedAR, setExpandedAR] = React.useState(new Set());
  const [expandedAP, setExpandedAP] = React.useState(new Set());
  const toggleSet = (setter, id) => setter(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const indOp = d.indirectCF.sections[0].items;
  const invCF = (indOp.find(i => i.label === "สินค้าคงเหลือ (เพิ่มขึ้น)/ลดลง") || {}).current || 0;
  const accrCF = (indOp.find(i => i.label === "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)") || {}).current || 0;
  const ar = d.reconcileAR;
  const ap = d.reconcileAP;
  const totalWC = ar.cfImpact + ap.cfImpact + invCF + accrCF;

  const thS = { background: "var(--bg-2,#f3f4f6)", fontSize: 11.5, fontWeight: 600, padding: "6px 10px", whiteSpace: "nowrap" };
  const tdS = { fontSize: 12.5, padding: "5px 10px" };
  const numS = right => ({ ...tdS, textAlign: "right" });

  const ReconcileTable = ({ title, entities, bySegData, expandedSet, toggleFn, isAR, cfImpact, totals }) => (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="card-head">
        <div>
          <div className="card-title">{title}</div>
          <div className="small muted">
            {isAR ? "เปิดงวด + ยอดขาย − เก็บเงิน ± ปรับ = ปิดงวด • AR เพิ่ม = ใช้เงินสด (CF ลด)"
                  : "เปิดงวด + ซื้อ − จ่าย ± ปรับ = ปิดงวด • AP เพิ่ม = ยังไม่จ่าย (CF เพิ่ม)"}
          </div>
        </div>
        <span className={"tag " + (cfImpact >= 0 ? "success" : "accent")} style={{ alignSelf: "center", marginLeft: 10 }}>
          ผลต่อ CF: {cfImpact >= 0 ? "+" : ""}{fmt(cfImpact)}
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thS, textAlign: "left" }}>บริษัท / Segment</th>
              <th style={{ ...thS, textAlign: "right" }}>เปิดงวด</th>
              <th style={{ ...thS, textAlign: "right" }}>{isAR ? "+ยอดขาย" : "+ซื้อ"}</th>
              <th style={{ ...thS, textAlign: "right" }}>{isAR ? "−เก็บเงิน" : "−จ่าย"}</th>
              <th style={{ ...thS, textAlign: "right" }}>±ปรับ</th>
              <th style={{ ...thS, textAlign: "right" }}>ปิดงวด</th>
              <th style={{ ...thS, textAlign: "right" }}>เปลี่ยนแปลง</th>
              <th style={{ ...thS, textAlign: "right" }}>ผลต่อ CF</th>
            </tr>
          </thead>
          <tbody>
            {entities.map(e => {
              const co = d.companies.find(c => c.id === e.entity);
              const isExp = expandedSet.has(e.entity);
              const segRows = (bySegData.byEntity[e.entity] || {}).segments || [];
              const rowCF = isAR ? -(e.change) : e.change;
              return (
                <React.Fragment key={e.entity}>
                  <tr style={{ cursor: "pointer", background: isExp ? "var(--accent-bg,#eff6ff)" : undefined }}
                      onClick={() => toggleFn(e.entity)}>
                    <td style={tdS}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className={"drill-chevron" + (isExp ? " open" : "")}><Ic name="chevron" size={10} /></span>
                        <span className="co-chip" style={{ background: co?.color || '#888' }}>{e.entity}</span>
                        <strong>{e.entity}</strong>
                      </span>
                    </td>
                    <td style={{ ...tdS, textAlign: "right" }}>{fmt(e.opening)}</td>
                    <td style={{ ...tdS, textAlign: "right" }}>{fmt(isAR ? e.sales : e.purchases)}</td>
                    <td style={{ ...tdS, textAlign: "right", color: "var(--danger)" }}>{fmt(isAR ? e.collection : e.payment)}</td>
                    <td style={{ ...tdS, textAlign: "right" }}>{e.adjustments !== 0 ? fmt(e.adjustments) : "—"}</td>
                    <td style={{ ...tdS, textAlign: "right", fontWeight: 600 }}>{fmt(e.closing)}</td>
                    <td style={{ ...tdS, textAlign: "right", color: e.change > 0 ? (isAR ? "var(--danger)" : "var(--success)") : (isAR ? "var(--success)" : "var(--danger)") }}>
                      {e.change > 0 ? "+" : ""}{fmt(e.change)}
                    </td>
                    <td style={{ ...tdS, textAlign: "right", fontWeight: 600, color: rowCF >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {rowCF >= 0 ? "+" : ""}{fmt(rowCF)}
                    </td>
                  </tr>
                  {isExp && segRows.map(seg => {
                    const segCF = isAR ? -(seg.change) : seg.change;
                    return (
                      <tr key={seg.id} style={{ background: "var(--bg-2,#f8f9fa)" }}>
                        <td style={{ ...tdS, paddingLeft: 36, fontSize: 12, color: "var(--text-secondary)" }}>↳ {seg.name}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12 }}>{fmt(seg.opening)}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12 }}>{fmt(isAR ? seg.sales : seg.purchases)}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12, color: "var(--danger)" }}>{fmt(isAR ? seg.collection : seg.payment)}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12 }}>{seg.adjustments !== 0 ? fmt(seg.adjustments) : "—"}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12 }}>{fmt(seg.closing)}</td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12, color: seg.change > 0 ? (isAR ? "var(--danger)" : "var(--success)") : (isAR ? "var(--success)" : "var(--danger)") }}>
                          {seg.change > 0 ? "+" : ""}{fmt(seg.change)}
                        </td>
                        <td style={{ ...tdS, textAlign: "right", fontSize: 12, color: segCF >= 0 ? "var(--success)" : "var(--danger)" }}>
                          {segCF >= 0 ? "+" : ""}{fmt(segCF)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
            <tr style={{ background: "var(--bg-3,#eef0f4)", fontWeight: 700, borderTop: "2px solid var(--border)" }}>
              <td style={{ ...tdS, fontWeight: 700 }}>รวมทั้งหมด</td>
              <td style={{ ...tdS, textAlign: "right" }}>{fmt(totals.opening)}</td>
              <td style={{ ...tdS, textAlign: "right" }}>{fmt(totals.flowIn)}</td>
              <td style={{ ...tdS, textAlign: "right", color: "var(--danger)" }}>{fmt(totals.flowOut)}</td>
              <td style={{ ...tdS, textAlign: "right" }}>{totals.adj !== 0 ? fmt(totals.adj) : "—"}</td>
              <td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{fmt(totals.closing)}</td>
              <td style={{ ...tdS, textAlign: "right", color: isAR ? "var(--danger)" : "var(--success)" }}>
                {isAR ? "+" : "+"}{fmt(totals.change)}
              </td>
              <td style={{ ...tdS, textAlign: "right", fontWeight: 700, color: cfImpact >= 0 ? "var(--success)" : "var(--danger)" }}>
                {cfImpact >= 0 ? "+" : ""}{fmt(cfImpact)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const invOpen = d.tbBal("2025-Q4", "1200");
  const invClose = d.tbBal("2026-Q1", "1200");
  const invChange = invClose - invOpen;

  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center" }}>
        <div>
          <div className="card-title">Working Capital กระทบยอด</div>
          <div className="small muted">ผลกระทบการเปลี่ยนแปลง AR / AP / สินค้าคงเหลือ ต่อกระแสเงินสด (Indirect Method)</div>
        </div>
        <div className="grow" />
        <span className="tag accent">Q1 2569 • คลิกแถวบริษัทเพื่อดูแยก Segment</span>
      </div>

      <ReconcileTable
        title="กระทบยอดลูกหนี้การค้า (Accounts Receivable)"
        entities={ar.entities} bySegData={d.reconcileARBySegment}
        expandedSet={expandedAR} toggleFn={id => toggleSet(setExpandedAR, id)}
        isAR={true} cfImpact={ar.cfImpact}
        totals={{ opening: ar.totalOpening, flowIn: ar.totalSales, flowOut: ar.totalCollection, adj: ar.totalAdjustments, closing: ar.totalClosing, change: ar.totalChange }}
      />

      <ReconcileTable
        title="กระทบยอดเจ้าหนี้การค้า (Accounts Payable)"
        entities={ap.entities} bySegData={d.reconcileAPBySegment}
        expandedSet={expandedAP} toggleFn={id => toggleSet(setExpandedAP, id)}
        isAR={false} cfImpact={ap.cfImpact}
        totals={{ opening: ap.totalOpening, flowIn: ap.totalPurchases, flowOut: ap.totalPayment, adj: ap.totalAdjustments, closing: ap.totalClosing, change: ap.totalChange }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">สินค้าคงเหลือ (Inventory Change)</div>
          </div>
          <div className="card-pad">
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div><div className="small muted">ต้นงวด</div><div style={{ fontSize: 18, fontWeight: 600 }}>{fmt(invOpen)}</div></div>
              <span style={{ fontSize: 18, color: "var(--text-secondary)" }}>→</span>
              <div><div className="small muted">ปลายงวด</div><div style={{ fontSize: 18, fontWeight: 600 }}>{fmt(invClose)}</div></div>
              <div><div className="small muted">เพิ่มขึ้น</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--danger)" }}>+{fmt(invChange)}</div></div>
              <div><div className="small muted">ผลต่อ CF</div><div style={{ fontSize: 16, fontWeight: 700, color: "var(--danger)" }}>{fmt(invCF)}</div></div>
            </div>
            <div className="small muted" style={{ marginTop: 8 }}>สินค้าเพิ่มขึ้น = ซื้อมากกว่าขาย → ใช้เงินสด → CF ลด</div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">สรุปผลกระทบ Working Capital รวม</div></div>
          <div className="card-pad">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["ลูกหนี้การค้า (AR เพิ่ม = ใช้เงิน)", ar.cfImpact],
                  ["เจ้าหนี้การค้า (AP เพิ่ม = ยังไม่จ่าย)", ap.cfImpact],
                  ["สินค้าคงเหลือ (Inv เพิ่ม = ซื้อมาก)", invCF],
                  ["ค่าใช้จ่ายค้างจ่าย (Accrued เพิ่ม = ยังไม่จ่าย)", accrCF],
                ].map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ fontSize: 12.5, padding: "6px 0" }}>{label}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, padding: "6px 0", color: val >= 0 ? "var(--success)" : "var(--danger)", fontSize: 13 }}>
                      {val >= 0 ? "+" : ""}{fmt(val)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontSize: 13, fontWeight: 700, padding: "8px 0 4px" }}>ผลกระทบ WC รวม</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 16, padding: "8px 0 4px", color: totalWC >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {totalWC >= 0 ? "+" : ""}{fmt(totalWC)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Req 3.4 – Cash Ending Reconcile Tab ─────────────────────────────────────
function CashEndingTab() {
  const d = window.CFData;
  const fmt = window.fmtTHB;

  const cfSections = d.directCF.sections.map(sec => {
    const sub = sec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
    return { ...sec, sub };
  });
  const netCF = cfSections.reduce((s, x) => s + x.sub, 0);
  const opening = d.directCF.opening;
  const cfClosing = opening + netCF;
  const bankTotal = d.bankAccounts.reduce((s, b) => s + b.balance, 0);
  const tbCash = d.tbBal("2026-Q1", "1010");
  const diff = bankTotal - cfClosing;
  const isBalanced = Math.abs(diff) < 1_000_000;

  const sectionLabels = ["กิจกรรมดำเนินงาน", "กิจกรรมลงทุน", "กิจกรรมจัดหาเงิน"];
  const sectionColors = ["var(--success)", "var(--warning,#f59e0b)", "#7C4DFF"];

  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center" }}>
        <div>
          <div className="card-title">กระทบยอดเงินสดปลายงวด</div>
          <div className="small muted">Operating + Investing + Financing = Net Change → เงินสดปลายงวด vs ยอดเงินฝากธนาคาร</div>
        </div>
        <div className="grow" />
        <span className={"tag " + (isBalanced ? "success" : "accent")}>
          {isBalanced ? "✓ ยอดตรง" : "⚠ มีผลต่าง"} Q1/2569
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* CF Bridge */}
        <div className="card">
          <div className="card-head"><div className="card-title">สรุปกระแสเงินสดสุทธิ (Direct Method)</div></div>
          <div className="card-pad">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {cfSections.map((sec, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ fontSize: 12.5, padding: "7px 0" }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: sectionColors[i], marginRight: 8, verticalAlign: "middle" }} />
                      {sectionLabels[i]}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, padding: "7px 0", fontSize: 13, color: sec.sub >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {sec.sub >= 0 ? "+" : ""}{fmt(sec.sub)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--border)" }}>
                  <td style={{ fontSize: 13, fontWeight: 700, padding: "8px 0 4px" }}>การเปลี่ยนแปลงสุทธิ</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 15, padding: "8px 0 4px", color: netCF >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {netCF >= 0 ? "+" : ""}{fmt(netCF)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: 12.5, padding: "5px 0", color: "var(--text-secondary)" }}>บวก: เงินสดต้นงวด (1 ม.ค. 2569)</td>
                  <td style={{ textAlign: "right", fontSize: 12.5, padding: "5px 0" }}>{fmt(opening)}</td>
                </tr>
                <tr style={{ background: "var(--bg-2,#f5f5f5)", borderRadius: 6 }}>
                  <td style={{ fontSize: 13, fontWeight: 700, padding: "8px 0 4px" }}>เงินสดปลายงวด (ตามงบ CF)</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 16, padding: "8px 0 4px" }}>{fmt(cfClosing)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reconciliation */}
        <div className="card">
          <div className="card-head"><div className="card-title">กระทบยอดเงินสดปลายงวด vs ธนาคาร</div></div>
          <div className="card-pad">
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12 }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ fontSize: 12.5, padding: "7px 0" }}>เงินสดปลายงวด (ตามงบ CF)</td>
                  <td style={{ textAlign: "right", fontSize: 13, fontWeight: 600, padding: "7px 0" }}>{fmt(cfClosing)}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ fontSize: 12.5, padding: "7px 0" }}>เงินสดตาม Trial Balance (1010)</td>
                  <td style={{ textAlign: "right", fontSize: 13, fontWeight: 600, padding: "7px 0" }}>{fmt(tbCash)}</td>
                </tr>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <td style={{ fontSize: 12.5, padding: "7px 0" }}>ยอดรวมเงินฝากธนาคาร</td>
                  <td style={{ textAlign: "right", fontSize: 13, fontWeight: 600, padding: "7px 0" }}>{fmt(bankTotal)}</td>
                </tr>
                <tr>
                  <td style={{ fontSize: 13, fontWeight: 700, padding: "8px 0 4px" }}>ผลต่าง (ธนาคาร − งบ CF)</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 16, padding: "8px 0 4px", color: isBalanced ? "var(--success)" : "var(--danger)" }}>
                    {diff >= 0 ? "+" : ""}{fmt(diff)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: isBalanced ? "rgba(31,157,85,0.08)" : "rgba(220,38,38,0.08)", border: "1px solid " + (isBalanced ? "var(--success)" : "var(--danger)") }}>
              <div style={{ fontWeight: 700, color: isBalanced ? "var(--success)" : "var(--danger)", marginBottom: 4 }}>
                {isBalanced ? "✓ ยอดสอดคล้องกัน" : "⚠ ยอดไม่สอดคล้อง — ต้องตรวจสอบ"}
              </div>
              <div className="small muted">
                {isBalanced
                  ? "เงินสดตามงบ CF ตรงกับยอดธนาคาร"
                  : "อาจเกิดจาก: รายการระหว่างทาง (In-transit), เช็คค้างจ่าย, เงินฝากผ่านบัญชีพักชั่วคราว หรือข้อมูลยังไม่ครบ"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank accounts detail */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">รายละเอียดเงินฝากธนาคาร ณ 31 มี.ค. 2569</div>
          <div className="grow" />
          <span className="small muted">รวม: <strong>{fmt(bankTotal)}</strong></span>
        </div>
        <div style={{ padding: "8px 0 12px" }}>
          <table className="report-tbl">
            <thead>
              <tr>
                <th>ธนาคาร / บัญชี</th>
                <th>บริษัท</th>
                <th>ประเภท</th>
                <th style={{ width: 160 }}>ยอดคงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {d.bankAccounts.map(b => {
                const co = d.companies.find(c => c.id === b.entity);
                return (
                  <tr key={b.id}>
                    <td className="label indent-1">
                      <div style={{ fontWeight: 500 }}>{b.name}</div>
                      <div className="tiny muted">{b.bank} • {b.no}</div>
                    </td>
                    <td><span className="co-chip" style={{ background: co?.color || '#888' }}>{b.entity}</span></td>
                    <td className="small muted">{b.type} • {b.ccy}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmt(b.balance)}</td>
                  </tr>
                );
              })}
              <tr className="grand">
                <td colSpan={3} style={{ fontWeight: 700 }}>รวมยอดเงินฝากทั้งหมด</td>
                <td className="num" style={{ fontWeight: 700 }}>{fmt(bankTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Req 3.3 – Direct vs Indirect Comparison Tab ─────────────────────────────
function CompareMethodsTab() {
  const d = window.CFData;
  const fmt = window.fmtTHB;

  // ─ WC Data ─
  const ar = (() => {
    const entities = Object.keys(d.reconcileARBySegment.byEntity || {});
    let totalOpening = 0, totalSales = 0, totalCollection = 0, totalClosing = 0, totalAdjustments = 0;
    entities.forEach(ent => {
      const ent_data = d.reconcileARBySegment.byEntity[ent];
      ent_data.segments.forEach(seg => {
        totalOpening += seg.opening;
        totalSales += seg.sales;
        totalCollection += seg.collection;
        totalClosing += seg.closing;
        totalAdjustments += seg.adjustments || 0;
      });
    });
    const totalChange = totalClosing - totalOpening;
    const cfImpact = -totalChange;
    return { entities, totalOpening, totalSales, totalCollection, totalClosing, totalAdjustments, totalChange, cfImpact };
  })();

  const ap = (() => {
    const entities = Object.keys(d.reconcileAPBySegment.byEntity || {});
    let totalOpening = 0, totalPurchases = 0, totalPayment = 0, totalClosing = 0, totalAdjustments = 0;
    entities.forEach(ent => {
      const ent_data = d.reconcileAPBySegment.byEntity[ent];
      ent_data.segments.forEach(seg => {
        totalOpening += seg.opening;
        totalPurchases += seg.purchases;
        totalPayment += seg.payment;
        totalClosing += seg.closing;
        totalAdjustments += seg.adjustments || 0;
      });
    });
    const totalChange = totalClosing - totalOpening;
    const cfImpact = totalChange;
    return { entities, totalOpening, totalPurchases, totalPayment, totalClosing, totalAdjustments, totalChange, cfImpact };
  })();

  const invOpen = d.tbBal("2025-Q4", "1200");
  const invClose = d.tbBal("2026-Q1", "1200");
  const invChange = invClose - invOpen;
  const invCF = -invChange;

  const indOpItems = d.indirectCF.sections[0].items;
  const accrCF = (indOpItems.find(i => i.label === "ค่าใช้จ่ายค้างจ่าย เพิ่มขึ้น/(ลดลง)") || {}).current || 0;
  const totalWC = ar.cfImpact + ap.cfImpact + invCF + accrCF;

  const computeSections = (cfData) => cfData.sections.map(sec => {
    const sub = sec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
    return { title: sec.title, subtotalLabel: sec.subtotalLabel, items: sec.items, sub };
  });

  const directSecs = computeSections(d.directCF);
  const indirectSecs = computeSections(d.indirectCF);
  const directNet = directSecs.reduce((s, x) => s + x.sub, 0);
  const indirectNet = indirectSecs.reduce((s, x) => s + x.sub, 0);
  const diff = directNet - indirectNet;
  const isMatch = Math.abs(diff) < 500_000;

  const colStyle = { width: "50%", verticalAlign: "top", padding: "0 8px" };
  const secLabels = ["กิจกรรมดำเนินงาน", "กิจกรรมลงทุน", "กิจกรรมจัดหาเงิน"];

  const renderColumn = (secs, method, net, opening) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, padding: "8px 12px", background: method === "direct" ? "rgba(31,157,85,0.1)" : "rgba(42,111,240,0.1)", borderRadius: 8, border: "1px solid " + (method === "direct" ? "rgba(31,157,85,0.3)" : "rgba(42,111,240,0.3)") }}>
        {method === "direct" ? "📥 Direct Method (วิธีตรง)" : "📊 Indirect Method (วิธีอ้อม)"}
      </div>
      <table className="report-tbl" style={{ fontSize: 12.5 }}>
        <tbody>
          {secs.map((sec, si) => (
            <React.Fragment key={si}>
              <tr className="section"><td colSpan={2} style={{ fontSize: 11 }}>{secLabels[si]}</td></tr>
              {sec.items.map((it, ii) => {
                if (it.header) return (
                  <tr key={ii}><td colSpan={2} className="label indent-1" style={{ fontSize: 12, fontStyle: "italic", color: "var(--text-secondary)" }}>{it.label}</td></tr>
                );
                return (
                  <tr key={ii}>
                    <td className={"label indent-" + (it.indent || 1)} style={{ fontSize: 12 }}>{it.label}</td>
                    <td className={"num small " + ((it.current || 0) >= 0 ? "pos" : "neg")}>{fmt(it.current || 0)}</td>
                  </tr>
                );
              })}
              <tr className="subtotal">
                <td className="label" style={{ fontSize: 12 }}>{sec.subtotalLabel}</td>
                <td className={"num " + (sec.sub >= 0 ? "pos" : "neg")} style={{ fontWeight: 700 }}>{fmt(sec.sub)}</td>
              </tr>
            </React.Fragment>
          ))}
          <tr className="total">
            <td>การเปลี่ยนแปลงสุทธิของเงินสด</td>
            <td className={"num " + (net >= 0 ? "pos" : "neg")} style={{ fontWeight: 700 }}>{fmt(net)}</td>
          </tr>
          <tr>
            <td className="label">เงินสดต้นงวด</td>
            <td className="num">{fmt(opening)}</td>
          </tr>
          <tr className="grand">
            <td>เงินสดปลายงวด</td>
            <td className="num">{fmt(opening + net)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center" }}>
        <div>
          <div className="card-title">เปรียบเทียบ Direct vs Indirect Method</div>
          <div className="small muted">ทั้งสองวิธีต้องได้ Net CF เท่ากัน • ผลต่างแสดงถึงการปรับปรุงรายการที่ยังไม่ครบ</div>
        </div>
        <div className="grow" />
        <span className={"tag " + (isMatch ? "success" : "accent")}>
          {isMatch ? "✓ Net CF ตรงกัน" : "⚠ Net CF ต่างกัน " + fmt(Math.abs(diff))}
        </span>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-pad">
          <div style={{ display: "flex", gap: 16 }}>
            {renderColumn(directSecs, "direct", directNet, d.directCF.opening)}
            <div style={{ width: 1, background: "var(--border)", flexShrink: 0 }} />
            {renderColumn(indirectSecs, "indirect", indirectNet, d.indirectCF.opening)}
          </div>
        </div>
      </div>

      {/* Operating CF comparison highlight */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        {["กิจกรรมดำเนินงาน", "กิจกรรมลงทุน", "กิจกรรมจัดหาเงิน"].map((label, i) => {
          const d1 = directSecs[i]?.sub || 0;
          const d2 = indirectSecs[i]?.sub || 0;
          const ok = Math.abs(d1 - d2) < 500_000;
          return (
            <div className="card" key={i}>
              <div className="card-pad">
                <div className="small muted" style={{ marginBottom: 4 }}>{label}</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div>
                    <div className="tiny muted">Direct</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: d1 >= 0 ? "var(--success)" : "var(--danger)" }}>{d1 >= 0 ? "+" : ""}{fmt(d1)}</div>
                  </div>
                  <div style={{ fontSize: 18, color: ok ? "var(--success)" : "var(--danger)" }}>{ok ? "=" : "≠"}</div>
                  <div>
                    <div className="tiny muted">Indirect</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: d2 >= 0 ? "var(--success)" : "var(--danger)" }}>{d2 >= 0 ? "+" : ""}{fmt(d2)}</div>
                  </div>
                </div>
                {!ok && <div className="tiny" style={{ color: "var(--danger)", marginTop: 4 }}>ผลต่าง {fmt(Math.abs(d1 - d2))}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Working Capital Impact – Indirect Method Adjustments */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">Working Capital Impact (Indirect Method Adjustments)</div>
          <div className="grow" />
          <span className="small muted">Q1 2569 • ส่วนปรับปรุงจากการเปลี่ยนแปลง WC</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "16px" }}>
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["ลูกหนี้การค้า (AR เพิ่ม = ใช้เงิน)", ar.cfImpact],
                  ["เจ้าหนี้การค้า (AP เพิ่ม = ยังไม่จ่าย)", ap.cfImpact],
                  ["สินค้าคงเหลือ (Inv เพิ่ม = ซื้อมาก)", invCF],
                  ["ค่าใช้จ่ายค้างจ่าย (Accrued เพิ่ม = ยังไม่จ่าย)", accrCF],
                ].map(([label, val], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ fontSize: 12.5, padding: "7px 0" }}>{label}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, padding: "7px 0", color: val >= 0 ? "var(--success)" : "var(--danger)", fontSize: 13 }}>
                      {val >= 0 ? "+" : ""}{fmt(val)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--border)" }}>
                  <td style={{ fontSize: 13, fontWeight: 700, padding: "8px 0 4px" }}>ผลกระทบ WC รวม</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 16, padding: "8px 0 4px", color: totalWC >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {totalWC >= 0 ? "+" : ""}{fmt(totalWC)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px", background: "var(--bg-2,#f5f5f5)", borderRadius: 8 }}>
            <div className="small muted" style={{ marginBottom: 8 }}>💡 วิธีการอ่าน:</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5 }}>
              <li><strong>AR เพิ่มขึ้น</strong> = ขายเพิ่มแต่ยังไม่เก็บเงิน → ใช้เงินสด → CF ลด</li>
              <li><strong>AP เพิ่มขึ้น</strong> = ซื้อเพิ่มแต่ยังไม่จ่าย → ยังมีเงินสด → CF เพิ่ม</li>
              <li><strong>Inv เพิ่มขึ้น</strong> = ซื้อของมากกว่าขาย → ใช้เงินสด → CF ลด</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Task #33 – Cross-validation Panel ───────────────────────────────────────
function CrossValidationTab() {
  const d = window.CFData;
  const fmt = window.fmtTHB;

  // ─ Direct CF ─
  const opItems = d.directCF.sections[0].items;
  const cfCashFromSales = opItems.find(i => i.label.includes("ขายสินค้า"))?.current || 0;
  const cfCashIn  = opItems.filter(i => (i.current || 0) > 0).reduce((s, i) => s + i.current, 0);
  const cfCashOut = opItems.filter(i => (i.current || 0) < 0).reduce((s, i) => s + i.current, 0);
  const cfNetOp   = opItems.reduce((s, i) => s + (i.current || 0), 0);
  const cfNetAll  = d.directCF.sections.flatMap(s => s.items).filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
  const cfOpening = d.directCF.opening;
  const cfClosing = cfOpening + cfNetAll;

  // ─ AR ─
  const arCollections = Math.abs(d.reconcileAR.totalCollection);
  const arSales       = d.reconcileAR.totalSales;
  const arChange      = d.reconcileAR.totalChange;
  const arCFImpact    = d.reconcileAR.cfImpact;

  // ─ AP ─
  const apPayments = Math.abs(d.reconcileAP.totalPayment);
  const apChange   = d.reconcileAP.totalChange;
  const apCFImpact = d.reconcileAP.cfImpact;

  // ─ Bank ─
  const bankInflowQ1  = d.totals.inflowQ1;
  const bankOutflowQ1 = d.totals.outflowQ1;
  const bankNetQ1     = bankInflowQ1 - bankOutflowQ1;
  const bankClosing   = d.bankAccounts.reduce((s, b) => s + b.balance, 0);

  // ─ Gap calculations ─
  // Cash from sales via CF vs AR reconcile
  const cashSalesGap = cfCashFromSales - arCollections;
  // Theoretical AR: Revenue - AR change = cash expected
  const theoreticalCash = arSales - arChange;
  const theoreticalGap  = cfCashFromSales - theoreticalCash;

  // AP: CF cash out vs AP payments
  const apGap = Math.abs(cfCashOut) - apPayments;

  // Net CF vs Bank net
  const cfNetOpFmtd = cfNetAll;
  const bankVsCFGap = bankNetQ1 - cfNetAll;

  // Closing balance check
  const closingVsBankGap = bankClosing - cfClosing;

  // Status helpers
  const isOk  = v => Math.abs(v) < 5_000_000;
  const isMed = v => Math.abs(v) < 30_000_000;
  const tag = (v, label) => {
    const ok = isOk(v);
    const med = isMed(v);
    return React.createElement('span', {
      className: 'tag ' + (ok ? 'success' : med ? 'accent' : 'danger'),
    }, ok ? '✓ ตรงกัน' : med ? '⚠ ต่างเล็กน้อย' : '✗ ต่างมาก');
  };

  const metricCard = (title, value, sub, color) => (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-pad">
        <div className="small muted" style={{ marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color }}>{fmt(value)}</div>
        <div className="tiny muted" style={{ marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );

  const row = (label, cfVal, arVal, bankVal, note) => {
    const gap1 = cfVal != null && arVal  != null ? cfVal - arVal  : null;
    const gap2 = cfVal != null && bankVal != null ? cfVal - bankVal : null;
    return (
      <tr>
        <td style={{ fontSize: 12.5, padding: "6px 4px" }}>{label}</td>
        <td style={{ textAlign: "right", padding: "6px 8px", fontWeight: 600, fontSize: 12.5, color: cfVal >= 0 ? "var(--success)" : "var(--danger)" }}>{cfVal != null ? fmt(cfVal) : "—"}</td>
        <td style={{ textAlign: "right", padding: "6px 8px", fontSize: 12.5, color: arVal >= 0 ? "var(--success)" : "var(--danger)" }}>{arVal != null ? fmt(arVal) : "—"}</td>
        <td style={{ textAlign: "right", padding: "6px 8px", fontSize: 12.5, color: bankVal >= 0 ? "var(--success)" : "var(--danger)" }}>{bankVal != null ? fmt(bankVal) : "—"}</td>
        <td style={{ textAlign: "right", padding: "6px 8px" }}>
          {gap1 != null && <span style={{ fontSize: 11, color: isOk(gap1) ? "var(--success)" : isMed(gap1) ? "#E67700" : "var(--danger)" }}>Δ {fmt(gap1)}</span>}
        </td>
        <td style={{ padding: "6px 4px", fontSize: 11, color: "var(--text-secondary)" }}>{note}</td>
      </tr>
    );
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center" }}>
        <div>
          <div className="card-title">Cross-Validation: Direct CF vs AR vs Bank</div>
          <div className="small muted">ตรวจสอบความสอดคล้องระหว่าง 3 แหล่งข้อมูล • Q1 2569</div>
        </div>
      </div>

      {/* 3 metric cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        {metricCard("เงินสดรับ (Direct CF)", cfCashIn, "Operating Cash Inflows", "var(--success)")}
        {metricCard("เก็บหนี้จริง (AR Reconcile)", arCollections, "Q1 Collections per AR system", "#2A6FF0")}
        {metricCard("เงินเข้าธนาคาร (Bank)", bankInflowQ1, "Q1 Bank Inflows (Monthly statement)", "#7C4DFF")}
      </div>

      {/* Main comparison table */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div className="card-title">ตาราง 3-Way Cross-Check</div>
          <div className="grow" />
          <span className="small muted">CF Statement | AR/AP System | Bank Statement</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["รายการ", "Direct CF", "AR/AP System", "Bank", "Δ (CF−AR)", "หมายเหตุ"].map((h, i) => (
                  <th key={i} style={{ textAlign: i > 0 ? "right" : "left", padding: "8px 8px", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "var(--bg-2,#f5f5f5)" }}>
                <td colSpan={6} style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>เงินสดรับ (Cash Inflows)</td>
              </tr>
              {row("รับจากการขายสินค้าและบริการ", cfCashFromSales, arCollections, null, "CF vs เก็บหนี้ AR")}
              {row("รับดอกเบี้ย + ปันผล + อื่นๆ", cfCashIn - cfCashFromSales, null, null, "Non-sales inflows")}
              {row("รวมเงินสดรับ (Operating)", cfCashIn, arCollections, bankInflowQ1, "Bank = รวมทุกประเภท")}

              <tr style={{ background: "var(--bg-2,#f5f5f5)" }}>
                <td colSpan={6} style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>เงินสดจ่าย (Cash Outflows)</td>
              </tr>
              {row("จ่ายผู้จัดจำหน่ายและพนักงาน", cfCashOut, -apPayments, null, "CF vs จ่าย AP")}
              {row("รวมเงินสดจ่าย (Operating)", cfCashOut, -apPayments, -bankOutflowQ1, "Bank = รวมทุกประเภท")}

              <tr style={{ background: "var(--bg-2,#f5f5f5)" }}>
                <td colSpan={6} style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>ยอดสุทธิ (Net)</td>
              </tr>
              {row("Net Cash (Operating)", cfNetOp, null, null, "เฉพาะ Operating")}
              {row("Net Cash (All Activities)", cfNetAll, null, bankNetQ1, "Bank Q1 Net")}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance reconciliation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>เงินสดรับ: CF vs AR Reconcile</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["CF: เงินสดรับจากการขาย", cfCashFromSales],
                  ["AR: ยอดเก็บหนี้ Q1", arCollections],
                  ["ผลต่าง (Cash Customers)", cashSalesGap],
                ].map(([l, v], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ fontSize: 12.5, padding: "6px 0" }}>{l}</td>
                    <td style={{ textAlign: "right", fontWeight: i === 2 ? 700 : 500, fontSize: 12.5, padding: "6px 0",
                      color: i === 2 ? (isOk(v) ? "var(--success)" : "#E67700") : (v >= 0 ? "var(--success)" : "var(--danger)") }}>
                      {fmt(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--bg-2,#f5f5f5)", borderRadius: 6, fontSize: 11.5, color: "var(--text-secondary)" }}>
              💡 ผลต่าง = ลูกค้าจ่ายสดโดยตรง หรือ เก็บหนี้งวดก่อน
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>ยอดปิด: CF vs Bank Balance</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["เงินสดเปิดงวด (CF Opening)", cfOpening],
                  ["Net Change per CF Statement", cfNetAll],
                  ["เงินสดปิดงวด (CF Closing)", cfClosing],
                  ["ยอดรวมบัญชีธนาคาร (Q1 End)", bankClosing],
                  ["ผลต่าง", closingVsBankGap],
                ].map(([l, v], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i === 4 ? "rgba(255,200,0,0.08)" : "transparent" }}>
                    <td style={{ fontSize: 12.5, padding: "6px 0", fontWeight: i === 2 || i === 4 ? 700 : 400 }}>{l}</td>
                    <td style={{ textAlign: "right", fontWeight: i === 2 || i === 4 ? 700 : 500, fontSize: 12.5, padding: "6px 0",
                      color: i === 4 ? (isOk(v) ? "var(--success)" : "#E67700") : (v >= 0 ? "var(--success)" : "var(--danger)") }}>
                      {fmt(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status summary */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">ผลการตรวจสอบ</div>
          <div className="grow" />
          <span className="small muted">Tolerance: ±5M = ตรง, ±30M = ต่างเล็กน้อย, >30M = ต้องตรวจสอบ</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: "16px" }}>
          {[
            { label: "CF Cash from Sales vs AR Collections", gap: cashSalesGap, note: "ผลต่าง = ลูกค้าสด / เก็บหนี้งวดก่อน" },
            { label: "CF Net vs Bank Net Q1", gap: cfNetAll - bankNetQ1, note: "ผลต่าง = Investing/Financing items" },
            { label: "CF Closing vs Bank Balance", gap: closingVsBankGap, note: "ตรวจ Bank Reconciliation" },
          ].map(({ label, gap, note }, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border)", background: isOk(gap) ? "rgba(31,157,85,0.06)" : isMed(gap) ? "rgba(230,119,0,0.06)" : "rgba(208,52,52,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: isOk(gap) ? "var(--success)" : isMed(gap) ? "#E67700" : "var(--danger)" }}>
                {gap >= 0 ? "+" : ""}{fmt(gap)}
              </div>
              <div style={{ marginTop: 6 }}>
                {tag(gap)}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Main Report Page ─────────────────────────────────────────────────────────
function ReportPage({ method, onExport, companyId = "CONSO", chartStyle }) {
  const d = window.CFData;
  const report = method === "direct" ? d.directCF : d.indirectCF;
  const [activeTab, setActiveTab] = React.useState(0);
  const [period, setPeriod] = React.useState("Q1 2569");
  const [showCompare, setShowCompare] = React.useState(true);
  const [showFormulas, setShowFormulas] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState(new Set());
  const activeCo = d.companies.find(c => c.id === companyId) || d.companies[0];

  const incMatrix = d.getIncomeMatrix(companyId);
  const expMatrix = d.getExpenseMatrix(companyId);
  const sumQ1 = arr => (arr || []).slice(3).reduce((s, v) => s + (v || 0), 0);
  const sumQ0 = arr => (arr || []).slice(0, 3).reduce((s, v) => s + (v || 0), 0);

  const incomeSegRows = incMatrix.segments.map(s => ({ id: s.id, name: s.name, current: sumQ1(incMatrix.data[s.id]), prior: sumQ0(incMatrix.data[s.id]) }));
  const expenseSegRows = expMatrix.segments.map(s => ({ id: s.id, name: s.name, current: sumQ1(expMatrix.data[s.id]), prior: sumQ0(expMatrix.data[s.id]) }));

  const toggleRow = key => setExpandedRows(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const sections = report.sections.map(sec => {
    const cur = sec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0);
    const pri = sec.items.filter(i => !i.header).reduce((s, i) => s + (i.prior || 0), 0);
    return { ...sec, subtotalCurrent: cur, subtotalPrior: pri };
  });
  const netCurrent = sections.reduce((s, x) => s + x.subtotalCurrent, 0);
  const netPrior = sections.reduce((s, x) => s + x.subtotalPrior, 0);
  const closing = report.opening + netCurrent;
  const priorClosing = report.priorOpening + netPrior;

  const tabs = [
    method === "direct" ? "งบ Direct CF" : "งบ Indirect CF",
    "CF แยก Segment",
    "กระทบยอด Cash",
    "Direct vs Indirect",
    "Cross-Check",
  ];

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
          <a href="/Working_Paper_WC_Drill_Down.xlsx" download className="btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}><Ic name="download" size={14} /> ดู Working Paper</a>
          <button className="btn primary" onClick={onExport}><Ic name="fileExcel" size={14} /> Export Excel</button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="row" style={{ gap: 3, marginBottom: 16, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
        {tabs.map((label, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "7px 14px", fontSize: 13, fontWeight: activeTab === i ? 600 : 400, border: "none",
              background: activeTab === i ? "var(--accent)" : "transparent",
              color: activeTab === i ? "var(--accent-text,#fff)" : "var(--text-secondary)",
              borderRadius: "6px 6px 0 0", cursor: "pointer", marginBottom: -2,
              borderBottom: activeTab === i ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 0: CF Statement */}
      {activeTab === 0 && (
        <>
          <div className="row" style={{ marginBottom: 14, gap: 10 }}>
            <select className="select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option>Q1 2569</option><option>ม.ค. 2569</option><option>ก.พ. 2569</option>
              <option>มี.ค. 2569</option><option>YTD 2569</option><option>ปี 2568 (เต็มปี)</option>
            </select>
            <select className="select"><option>หน่วย: บาท</option><option>หน่วย: พันบาท</option><option>หน่วย: ล้านบาท</option></select>
            <label className="row small" style={{ gap: 6, marginLeft: 6 }}>
              <input type="checkbox" checked={showCompare} onChange={e => setShowCompare(e.target.checked)} />
              เปรียบเทียบกับงวดก่อน
            </label>
            {method === "indirect" && (
              <label className="row small" style={{ gap: 6, marginLeft: 6 }}>
                <input type="checkbox" checked={showFormulas} onChange={e => setShowFormulas(e.target.checked)} />
                แสดงสูตรคำนวณ
              </label>
            )}
            <div className="grow" />
            <span className="small muted" style={{ alignSelf: "center" }}>
              <Ic name="chevronDown" size={11} style={{ marginRight: 4 }} />คลิกแถวเพื่อดู Segment breakdown
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
                        if (it.header) return (
                          <tr key={ii}>
                            <td className={"label indent-" + (it.indent || 1)} style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{it.label}</td>
                            <td className="num"></td>
                            {showCompare && <td className="num"></td>}
                            {showCompare && <td className="num"></td>}
                          </tr>
                        );
                        const key = `${si}-${ii}`;
                        const isExpanded = expandedRows.has(key);
                        const diff = (it.current || 0) - (it.prior || 0);
                        const mapping = d.cfMapping[it.label];
                        const isIncome = mapping ? mapping.type === "income" : (it.current || 0) >= 0;
                        const allSegRows = isIncome ? incomeSegRows : expenseSegRows;
                        const segRows = mapping ? d.filterSegmentsByMapping(allSegRows, it.label, companyId) : allSegRows;
                        const segTotal = segRows.reduce((s, r) => s + r.current, 0);
                        return (
                          <React.Fragment key={ii}>
                            <tr className={"drill-row" + (isExpanded ? " drill-open" : "")} onClick={() => toggleRow(key)}>
                              <td className={"label indent-" + (it.indent || 1)}>
                                <span className="row" style={{ gap: 7, alignItems: "center" }}>
                                  <span className={"drill-chevron" + (isExpanded ? " open" : "")}><Ic name="chevron" size={11} /></span>
                                  <span>
                                    {it.label}
                                    {showFormulas && it.formula && (
                                      <div className="tiny" style={{ color: "var(--accent-text)", marginTop: 2, fontStyle: "italic", fontWeight: 400 }}>
                                        <Ic name="sparkles" size={10} style={{ marginRight: 4 }} />สูตร: {it.formula}
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
                                <tr className="drill-seg-head">
                                  <td colSpan={showCompare ? 4 : 2}>
                                    <span className="row" style={{ gap: 8, alignItems: "center" }}>
                                      <Ic name="boxes" size={12} style={{ color: "var(--accent)" }} />
                                      <span style={{ fontWeight: 600, color: "var(--accent-text)" }}>
                                        Segment Breakdown — {isIncome ? "รายรับ" : "รายจ่าย"} ({activeCo.short})
                                      </span>
                                      <span className="small muted" style={{ marginLeft: 4 }}>{segRows.length} segments</span>
                                    </span>
                                  </td>
                                </tr>
                                {segRows.length === 0 && (
                                  <tr className="drill-seg-row">
                                    <td colSpan={showCompare ? 4 : 2} style={{ paddingLeft: 52, fontStyle: "italic", color: "var(--text-tertiary)" }}>
                                      — ยังไม่มี segment ที่ผูกกับรายการนี้
                                    </td>
                                  </tr>
                                )}
                                {segRows.map(sr => {
                                  const segDiff = sr.current - sr.prior;
                                  return (
                                    <tr key={"seg-" + sr.id} className="drill-seg-row">
                                      <td className="label" style={{ paddingLeft: 52 }}><span style={{ fontSize: 12.5 }}>{sr.name}</span></td>
                                      <td className="num small">{window.fmtTHB(sr.current)}</td>
                                      {showCompare && <td className="num small muted">{window.fmtTHB(sr.prior)}</td>}
                                      {showCompare && <td className={"num small " + (isIncome ? (segDiff > 0 ? "pos" : segDiff < 0 ? "neg" : "") : (segDiff < 0 ? "pos" : segDiff > 0 ? "neg" : ""))}>{segDiff > 0 ? "+" : ""}{window.fmtTHB(segDiff)}</td>}
                                    </tr>
                                  );
                                })}
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
                  <div className="tiny muted" style={{ marginTop: 4 }}>งวดก่อน: {window.fmtTHB(sec.subtotalPrior)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 1 && <SegmentCFTab />}
      {activeTab === 2 && <CashEndingTab />}
      {activeTab === 3 && <CompareMethodsTab />}
      {activeTab === 4 && <CrossValidationTab />}
    </>
  );
}

window.ReportPage = ReportPage;
