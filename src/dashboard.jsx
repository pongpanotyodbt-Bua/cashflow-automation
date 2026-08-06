/* ============================================================
   CFO Dashboard — Redesigned
   Focus: 60-second executive read, alerts, waterfall, drill-down
   ============================================================ */

// ─── Constants ────────────────────────────────────────────────────────────────
const CASH_TARGET  = 600_000_000;   // ยอดเงินสดเป้าหมาย 600M
const CASH_MINIMUM = 200_000_000;   // ยอดเงินสดขั้นต่ำ  200M

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cashHealthStatus(bal) {
  if (bal >= CASH_TARGET)  return "good";
  if (bal >= CASH_MINIMUM) return "warn";
  return "danger";
}

function cashHealthColor(status) {
  return status === "good" ? "var(--success)" : status === "warn" ? "var(--warning)" : "var(--danger)";
}

// ─── Cash Waterfall Bridge ────────────────────────────────────────────────────
function WaterfallBridge({ opening, sections, closing }) {
  const fmt  = window.fmtTHBShort;
  const items = [
    { label: "เปิดงวด",            value: opening,      type: "open",  color: "#2A6FF0" },
    { label: "กิจกรรมดำเนินงาน",  value: sections[0]?.sub ?? 0, type: "flow",  color: "#1F9D55" },
    { label: "กิจกรรมลงทุน",      value: sections[1]?.sub ?? 0, type: "flow",  color: "#C97A00" },
    { label: "กิจกรรมจัดหาเงิน",  value: sections[2]?.sub ?? 0, type: "flow",  color: "#7C4DFF" },
    { label: "ปลายงวด",           value: closing,      type: "close", color: closing >= opening ? "#1F9D55" : "#D03434" },
  ];

  const maxAbs = Math.max(opening, closing, ...items.slice(1, 4).map(i => Math.abs(i.value)), 1);
  const MAXH   = 72; // px bar max height

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 0, height: MAXH + 52 }}>
      {items.map((item, i) => {
        const barH  = Math.max(8, (Math.abs(item.value) / maxAbs) * MAXH);
        const isNeg = item.value < 0;
        const col   = isNeg ? "#D03434" : item.color;
        const net   = item.type === "open" || item.type === "close"
          ? fmt(item.value)
          : (item.value >= 0 ? "+" : "") + fmt(item.value);

        return (
          <React.Fragment key={i}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* Value label */}
              <div style={{
                fontSize: 11, fontFamily: "IBM Plex Mono, monospace",
                fontWeight: 700, color: isNeg ? "var(--danger)" : col,
                letterSpacing: "-0.02em"
              }}>
                {net}
              </div>

              {/* Bar */}
              <div style={{
                width: "62%", height: barH, borderRadius: 5,
                background: col + "22",
                border: `2px solid ${col}`,
                position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "100%",
                  background: col, opacity: 0.28
                }} />
                {/* Pulse dot for opening/closing */}
                {(item.type === "open" || item.type === "close") && (
                  <div style={{
                    position: "absolute", top: 4, right: 4,
                    width: 6, height: 6, borderRadius: "50%", background: col
                  }} />
                )}
              </div>

              {/* Arrow connector (rendered below bar) */}
              <div className="tiny" style={{
                fontSize: 10, color: "var(--text-tertiary)", textAlign: "center",
                lineHeight: 1.3, maxWidth: 72
              }}>
                {item.label}
              </div>
            </div>

            {/* Arrow between bars */}
            {i < items.length - 1 && (
              <div style={{
                flex: "0 0 20px", display: "flex", alignItems: "center",
                justifyContent: "center", paddingBottom: 28
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {alerts.map((a, i) => {
        const isDanger  = a.type === "danger";
        const bg        = isDanger ? "var(--danger-soft)"  : "var(--warning-soft)";
        const border    = isDanger ? "#f5c0c0"             : "#f5dfa0";
        const iconColor = isDanger ? "var(--danger)"       : "var(--warning)";
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 14px", marginBottom: 6, borderRadius: 8,
            background: bg, border: `1px solid ${border}`
          }}>
            <Ic name="alert" size={14} style={{ color: iconColor, flexShrink: 0 }} />
            <span className="small" style={{ flex: 1 }}>{a.msg}</span>
            <button className="btn sm" style={{ flexShrink: 0 }}>{a.action} →</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Cash Status Hero ─────────────────────────────────────────────────────────
function CashHero({ cashBalance, runway, periodLabel }) {
  const status   = cashHealthStatus(cashBalance);
  const statCol  = cashHealthColor(status);
  const cashPct  = Math.min(100, (cashBalance / CASH_TARGET) * 100);
  const minPct   = (CASH_MINIMUM / CASH_TARGET) * 100;

  const statusLabel = status === "good"   ? "✓ เหนือ Target"
                    : status === "warn"   ? "⚠ ต่ำกว่า Target"
                    : "⚠ ต่ำกว่า Minimum";

  return (
    <div className="card" style={{
      marginBottom: 14,
      background: "linear-gradient(135deg, #f8faff 0%, #eef5ff 100%)",
      borderColor: "var(--accent-soft-strong)"
    }}>
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "flex-start" }}>

          {/* Left: balance + progress */}
          <div>
            <div className="small muted" style={{ marginBottom: 6 }}>
              ยอดเงินสดคงเหลือรวม (Consolidated) • {periodLabel}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{
                fontSize: 32, fontWeight: 700,
                fontFamily: "IBM Plex Mono, monospace",
                letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1
              }}>
                {window.fmtTHB(cashBalance)}
              </div>
              <span style={{
                fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                background: statCol + "18", color: statCol, border: `1px solid ${statCol}40`
              }}>
                {statusLabel}
              </span>
              <span className="small muted">+4.2% vs งวดก่อน</span>
            </div>

            {/* Progress bar with min line */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="tiny muted">Minimum ฿200M</span>
                <span className="tiny muted">Target ฿600M</span>
              </div>
              <div style={{
                height: 9, background: "var(--bg-hover)", borderRadius: 5,
                overflow: "hidden", position: "relative"
              }}>
                {/* Minimum threshold marker */}
                <div style={{
                  position: "absolute", left: `${minPct}%`, top: 0, bottom: 0,
                  width: 2, background: "var(--warning)", zIndex: 2, opacity: 0.9
                }} />
                {/* Fill bar */}
                <div style={{
                  width: `${cashPct}%`, height: "100%", borderRadius: 5,
                  background: statCol, transition: "width 0.7s ease", opacity: 0.85
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span className="tiny muted">{cashPct.toFixed(1)}% ของ Target</span>
                <span className="tiny" style={{ color: statCol, fontWeight: 500 }}>
                  {cashBalance >= CASH_TARGET
                    ? `เกิน Target ${window.fmtTHBShort(cashBalance - CASH_TARGET)}`
                    : `เหลืออีก ${window.fmtTHBShort(CASH_TARGET - cashBalance)} ถึง Target`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Right: Cash Runway */}
          <div style={{
            textAlign: "center", minWidth: 110,
            padding: "12px 16px", borderRadius: 10,
            background: "var(--bg)", border: "1px solid var(--border)"
          }}>
            <div className="tiny muted" style={{ marginBottom: 6 }}>Cash Runway</div>
            <div style={{
              fontSize: 38, fontWeight: 700, lineHeight: 1,
              fontFamily: "IBM Plex Mono, monospace",
              color: runway > 60 ? "var(--success)" : runway > 30 ? "var(--warning)" : "var(--danger)"
            }}>
              {runway}
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>วัน</div>
            <div className="tiny faint" style={{ marginTop: 6, lineHeight: 1.4 }}>
              อิง Burn Rate<br />{periodLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clickable KPI Card ────────────────────────────────────────────────────────
function KpiCard({ id, label, value, delta, deltaUp, spark, color, sub, monthly, expanded, onToggle }) {
  return (
    <div
      className="kpi"
      style={{
        cursor: "pointer",
        border: expanded ? "1px solid var(--accent)" : "1px solid var(--border)",
        boxShadow: expanded ? "0 0 0 3px var(--accent-soft)" : undefined,
        transition: "border 0.15s, box-shadow 0.15s"
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="kpi-label" style={{ paddingRight: 8 }}>{label}</div>
        <Ic name={expanded ? "chevronDown" : "chevron"} size={12}
            style={{ color: "var(--text-tertiary)", marginTop: 2, flexShrink: 0 }} />
      </div>

      {/* Main value */}
      <div className="kpi-value">{window.fmtTHB(value)}</div>

      {/* Delta + Sparkline */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div className="kpi-delta">
          {deltaUp === true  && <span className="up"><Ic name="arrowUp" size={11} /> {delta}</span>}
          {deltaUp === false && <span className="down"><Ic name="arrowDown" size={11} /> {delta}</span>}
          {deltaUp === null  && <span className="muted">{delta}</span>}
        </div>
        {spark && (
          <div style={{ width: 100, height: 30 }}>
            <Sparkline data={spark} color={color} height={30} fill />
          </div>
        )}
      </div>

      {/* Sub label */}
      {sub && <div className="tiny muted" style={{ marginTop: 2 }}>{sub}</div>}

      {/* Expanded monthly breakdown */}
      {expanded && monthly && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <div className="tiny muted" style={{ marginBottom: 6 }}>รายเดือน</div>
          {monthly.map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span className="tiny muted">{row.label}</span>
              <span className="tiny num" style={{
                color: row.value > 0 ? "var(--success)" : row.value < 0 ? "var(--danger)" : "var(--text-secondary)"
              }}>
                {row.value >= 0 ? "+" : ""}{window.fmtTHBShort(row.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Forecast Preview Widget ──────────────────────────────────────────────────
function ForecastPreview({ forecastData, cashBalance, onViewAll }) {
  let bal = cashBalance;
  const rows = forecastData.slice(0, 4).map(w => {
    bal += w.net;
    return { ...w, balance: bal };
  });
  const minBal = Math.min(...rows.map(x => x.balance));

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">Forecast 4 สัปดาห์ข้างหน้า</div>
          <div className="card-sub">
            ยอดต่ำสุดคาดการณ์:
            <span style={{
              fontWeight: 600, marginLeft: 4,
              color: minBal < CASH_MINIMUM ? "var(--danger)" : "var(--text)"
            }}>
              {window.fmtTHBShort(minBal)}
            </span>
            {minBal < CASH_MINIMUM && (
              <span className="tag danger" style={{ marginLeft: 6, fontSize: 10 }}>⚠ ต่ำกว่า Min</span>
            )}
          </div>
        </div>
        <button className="btn ghost sm" style={{ marginLeft: "auto" }}
                onClick={onViewAll}>
          ดูทั้งหมด <Ic name="arrowRight" size={12} />
        </button>
      </div>

      <div style={{ padding: "8px 14px 12px" }}>
        {rows.map((w, i) => {
          const pct     = Math.min(100, (w.balance / cashBalance) * 100);
          const barCol  = w.balance < CASH_MINIMUM ? "var(--danger)" : w.balance < CASH_TARGET ? "#2A6FF0" : "var(--success)";
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
              borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <span className="tag accent" style={{ fontSize: 10.5, minWidth: 30, textAlign: "center", flexShrink: 0 }}>
                {w.week}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ height: 5, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: barCol, borderRadius: 3 }} />
                </div>
              </div>
              <span className="tiny num" style={{
                minWidth: 56, textAlign: "right", fontWeight: 500,
                color: w.balance < CASH_MINIMUM ? "var(--danger)" : "var(--text)"
              }}>
                {window.fmtTHBShort(w.balance)}
              </span>
              <span className="tiny num" style={{
                minWidth: 48, textAlign: "right",
                color: w.net >= 0 ? "var(--success)" : "var(--danger)"
              }}>
                {w.net >= 0 ? "+" : ""}{window.fmtTHBShort(w.net)}
              </span>
            </div>
          );
        })}

        {/* Scenario tag */}
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <span className="tag" style={{ fontSize: 10.5 }}>Base Scenario • อิง AR/AP/Sales</span>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Actions Panel ────────────────────────────────────────────────────
function PendingActionsPanel({ alerts, pnPayments }) {
  const S    = window.CF_STATUS?.DOC || {};
  const duePn = (pnPayments || [])
    .filter(p => p.status === S.OUTSTANDING || p.status === S.OVERDUE)
    .slice(0, 3);

  const hasItems = alerts.length > 0 || duePn.length > 0;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">รายการที่ต้องดำเนินการ</div>
          <div className="card-sub">Pending Actions</div>
        </div>
        {hasItems && (
          <span className="tag danger" style={{ marginLeft: "auto" }}>
            {alerts.length + duePn.length} รายการ
          </span>
        )}
      </div>

      <div style={{ padding: "4px 0" }}>
        {!hasItems && (
          <div style={{ padding: "22px 16px", textAlign: "center", color: "var(--text-tertiary)" }}>
            <Ic name="check" size={22} style={{ marginBottom: 8 }} />
            <div className="small">ไม่มีรายการค้างดำเนินการ</div>
          </div>
        )}

        {/* Alerts */}
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "9px 14px",
            borderBottom: "1px solid var(--border)"
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: a.type === "danger" ? "var(--danger)" : "var(--warning)"
            }} />
            <span className="small" style={{ flex: 1, lineHeight: 1.45 }}>{a.msg}</span>
            <button className="btn sm ghost" style={{ flexShrink: 0, color: "var(--accent-text)", fontSize: 11.5 }}>
              {a.action}
            </button>
          </div>
        ))}

        {/* PN near due */}
        {duePn.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "9px 14px",
            borderBottom: i < duePn.length - 1 ? "1px solid var(--border)" : "none"
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
              background: p.status === S.OVERDUE ? "var(--danger)" : "var(--warning)"
            }} />
            <div style={{ flex: 1 }}>
              <div className="small" style={{ fontWeight: 500 }}>
                PN {p.pnNo}
                {p.status === S.OVERDUE && (
                  <span className="tag danger" style={{ marginLeft: 6, fontSize: 10 }}>Overdue</span>
                )}
              </div>
              <div className="tiny muted">{p.beneficiary} • ครบ {p.dueDate} • {window.fmtTHBShort(p.amount)}</div>
            </div>
            <button className="btn sm ghost" style={{ flexShrink: 0, color: "var(--accent-text)", fontSize: 11.5 }}>
              ดูรายการ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
function Dashboard({ chartStyle, companyId = "CONSO", period = window.CF_PERIOD_DEFAULT, onNavigate }) {
  const periodLabel = window.getPeriodLabel(period);
  const d           = window.CFData;
  const S           = window.CF_STATUS || { TXN: {}, DOC: {} };

  const [view,        setView]        = React.useState("monthly");
  const [expandedKpi, setExpandedKpi] = React.useState(null);

  const activeCo   = d.companies.find(c => c.id === companyId) || d.companies[0];
  const coTotals   = d.getCompanyTotals(companyId);
  const coMonthly  = coTotals.monthly;
  const inflowQ1   = coTotals.inflowQ1;
  const outflowQ1  = coTotals.outflowQ1;
  const netQ1      = coTotals.netQ1;
  const cashBalance = d.totals.totalCash;

  // ── Waterfall data ──
  const effectiveDirect = d.getCFData ? d.getCFData(period).direct : d.directCF;
  const cfSections = effectiveDirect.sections.map(sec => ({
    ...sec,
    sub: sec.items.filter(i => !i.header).reduce((s, i) => s + (i.current || 0), 0)
  }));
  const netCF  = cfSections.reduce((s, x) => s + x.sub, 0);
  const opening = effectiveDirect.opening;
  const closing = opening + netCF;

  // ── Cash Runway ──
  const dailyBurn = outflowQ1 > 0 ? outflowQ1 / 90 : 1;
  const runway    = Math.round(cashBalance / dailyBurn);

  // ── Build Alerts ──
  const alerts = React.useMemo(() => {
    const list = [];
    const status = cashHealthStatus(cashBalance);

    if (status === "danger")
      list.push({ type: "danger", msg: "ยอดเงินสดต่ำกว่า Minimum Threshold ต้องวางแผนเพิ่มสภาพคล่องทันที", action: "ดู Forecast" });
    else if (status === "warn")
      list.push({ type: "warning", msg: "ยอดเงินสดยังต่ำกว่า Target (฿600M) — ควรวางแผนเพิ่มสภาพคล่อง", action: "ดู Forecast" });

    const reviewCount = d.recentTxns.filter(t => t.status === S.TXN.REVIEW).length;
    if (reviewCount > 0)
      list.push({ type: "danger", msg: `${reviewCount} รายการต้องตรวจสอบ (Review) — อาจส่งผลต่อยอด CF`, action: "ตรวจสอบ" });

    const overduePN  = (d.pnPayments  || []).filter(p => p.status === S.DOC.OVERDUE).length;
    const overdueAP  = (d.apHondaPayments || []).filter(p => p.status === S.DOC.OVERDUE).length;
    if (overduePN > 0)
      list.push({ type: "danger",  msg: `PN Payment เกินกำหนด ${overduePN} รายการ`, action: "ดูรายการ" });
    if (overdueAP > 0)
      list.push({ type: "warning", msg: `AP HONDA ใกล้ครบกำหนด ${overdueAP} รายการ`, action: "ดูรายการ" });

    return list;
  }, [cashBalance, d, S]);

  // ── Trend data ──
  const trendData = view === "monthly"
    ? coMonthly
    : d.trend30.slice(-14).map(x => ({ ...x, m: x.date.slice(5) }));

  // ── KPI toggle ──
  const toggleKpi = (id) => setExpandedKpi(prev => prev === id ? null : id);

  // ── KPI monthly drill-down builders ──
  const kpiMonthly = {
    inflow:  coMonthly.map(m => ({ label: m.m, value: m.inflow })),
    outflow: coMonthly.map(m => ({ label: m.m, value: m.outflow })),
    net:     coMonthly.map(m => ({ label: m.m, value: m.inflow - m.outflow })),
    closing: coMonthly.map((m, i) => ({
      label: m.m,
      value: opening + coMonthly.slice(0, i + 1).reduce((s, x) => s + x.inflow - x.outflow, 0)
    })),
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Dashboard
            <span className="co-chip" style={{ background: activeCo.color, marginLeft: 10 }}>
              {activeCo.short}
            </span>
          </h1>
          <p className="page-sub">
            {activeCo.desc} • {periodLabel} • อัปเดตล่าสุด: 31 มี.ค. 2569 เวลา 14:22 น.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="refresh" size={14} /> รีเฟรชข้อมูล</button>
          <button className="btn primary"><Ic name="download" size={14} /> Export Excel</button>
        </div>
      </div>

      {/* ── Alert Banners ── */}
      <AlertBanner alerts={alerts} />

      {/* ── Cash Status Hero ── */}
      <CashHero cashBalance={cashBalance} runway={runway} periodLabel={periodLabel} />

      {/* ── KPI Cards (4 cards, all clickable) ── */}
      <div className="kpi-grid" style={{ marginBottom: 14 }}>
        <KpiCard
          id="inflow"
          label={`กระแสเงินสดรับ (Q1) – ${activeCo.short}`}
          value={inflowQ1}
          delta="+12.6% YoY"
          deltaUp={true}
          spark={coMonthly.map(m => m.inflow)}
          color="#1F9D55"
          sub="3 เดือน • Operating Inflow"
          monthly={kpiMonthly.inflow}
          expanded={expandedKpi === "inflow"}
          onToggle={() => toggleKpi("inflow")}
        />
        <KpiCard
          id="outflow"
          label={`กระแสเงินสดจ่าย (Q1) – ${activeCo.short}`}
          value={outflowQ1}
          delta="+8.1% YoY"
          deltaUp={false}
          spark={coMonthly.map(m => m.outflow)}
          color="#D03434"
          sub="3 เดือน • Operating Outflow"
          monthly={kpiMonthly.outflow}
          expanded={expandedKpi === "outflow"}
          onToggle={() => toggleKpi("outflow")}
        />
        <KpiCard
          id="net"
          label={`กระแสเงินสดสุทธิ – ${activeCo.short}`}
          value={netQ1}
          delta={inflowQ1 > 0 ? `CF Margin ${((netQ1 / inflowQ1) * 100).toFixed(1)}%` : "—"}
          deltaUp={netQ1 >= 0 ? true : false}
          spark={coMonthly.map(m => m.inflow - m.outflow)}
          color="#7C4DFF"
          sub="Net Operating CF"
          monthly={kpiMonthly.net}
          expanded={expandedKpi === "net"}
          onToggle={() => toggleKpi("net")}
        />
        <KpiCard
          id="closing"
          label="เงินสดปลายงวด (ตาม CF)"
          value={closing}
          delta={netCF >= 0
            ? `+${window.fmtTHBShort(netCF)} vs ต้นงวด`
            : `${window.fmtTHBShort(netCF)} vs ต้นงวด`
          }
          deltaUp={netCF >= 0 ? true : false}
          spark={kpiMonthly.closing.map(x => x.value)}
          color="#2A6FF0"
          sub={`เปิดงวด ${window.fmtTHBShort(opening)}`}
          monthly={kpiMonthly.closing}
          expanded={expandedKpi === "closing"}
          onToggle={() => toggleKpi("closing")}
        />
      </div>

      {/* ── Cash Waterfall Bridge ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Cash Bridge — เส้นทางเงินสด {periodLabel}</div>
            <div className="card-sub">
              เปิดงวด + กิจกรรมดำเนินงาน + กิจกรรมลงทุน + กิจกรรมจัดหาเงิน = ปลายงวด
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {/* Net CF badge */}
            <span className={`tag ${netCF >= 0 ? "success" : "danger"}`}>
              Net CF: {netCF >= 0 ? "+" : ""}{window.fmtTHBShort(netCF)}
            </span>
          </div>
        </div>
        <div style={{ padding: "18px 28px 8px" }}>
          <WaterfallBridge opening={opening} sections={cfSections} closing={closing} />
        </div>
      </div>

      {/* ── Main 2-col Grid: Trend | Forecast+Bank ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Trend Chart */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">กระแสเงินสดเข้า – ออก ({activeCo.short})</div>
              <div className="card-sub">6 เดือนล่าสุด (THB)</div>
            </div>
            <div style={{ marginLeft: "auto" }} className="row">
              <div className="legend">
                <span><span className="sw" style={{ background: "#1F9D55" }} />รับ</span>
                <span><span className="sw" style={{ background: "#D03434" }} />จ่าย</span>
              </div>
              <div className="segmented" style={{ marginLeft: 10 }}>
                <button className={view === "monthly" ? "active" : ""} onClick={() => setView("monthly")}>เดือน</button>
                <button className={view === "daily"   ? "active" : ""} onClick={() => setView("daily")}>วัน</button>
              </div>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <TrendChart data={trendData} height={248} style={chartStyle} />
          </div>
        </div>

        {/* Right column: stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Forecast Preview */}
          <ForecastPreview
            forecastData={d.forecast}
            cashBalance={cashBalance}
            onViewAll={() => {}}
          />

          {/* Bank Accounts */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-head">
              <div>
                <div className="card-title">บัญชีธนาคาร</div>
                <div className="card-sub">
                  {d.bankAccounts.length} บัญชี • 31 มี.ค. 2569 เวลา 14:22 น.
                </div>
              </div>
              <button className="btn ghost sm" style={{ marginLeft: "auto" }}>
                ดูทั้งหมด <Ic name="arrowRight" size={12} />
              </button>
            </div>
            <div style={{ padding: "4px 0" }}>
              {d.bankAccounts.map(b => (
                <div key={b.id} style={{
                  display: "flex", alignItems: "center",
                  padding: "9px 14px", gap: 12, borderRadius: 6
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "var(--accent-soft)", color: "var(--accent-text)",
                    display: "grid", placeItems: "center", flexShrink: 0
                  }}>
                    <Ic name="bank" size={13} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {b.name}
                    </div>
                    <div className="tiny faint">{b.bank} • {b.ccy}</div>
                  </div>
                  <div className="num" style={{ fontWeight: 500, fontSize: 13, flexShrink: 0 }}>
                    {window.fmtTHB(b.balance)}
                  </div>
                </div>
              ))}

              {/* Bank total */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 14px", borderTop: "1px solid var(--border)",
                marginTop: 2
              }}>
                <span className="small muted">รวมทุกบัญชี</span>
                <span className="num" style={{ fontWeight: 700 }}>
                  {window.fmtTHB(d.bankAccounts.reduce((s, b) => s + b.balance, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 3-col: Inflow | Outflow | Pending Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">รายการเข้าหลัก (Top Inflow)</div>
              <div className="card-sub">{periodLabel}</div>
            </div>
          </div>
          <div className="card-pad"><BarList items={d.topInflowCats} color="#1F9D55" /></div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">รายการจ่ายหลัก (Top Outflow)</div>
              <div className="card-sub">{periodLabel}</div>
            </div>
          </div>
          <div className="card-pad"><BarList items={d.topOutflowCats} color="#D03434" /></div>
        </div>

        <PendingActionsPanel alerts={alerts} pnPayments={d.pnPayments} />
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">รายการเดินบัญชีล่าสุด</div>
            <div className="card-sub">{d.recentTxns.length} รายการ ภายใน 5 วันทำการล่าสุด</div>
          </div>
          <div style={{ marginLeft: "auto" }} className="row">
            <button className="btn sm ghost"><Ic name="filter" size={13} /> ตัวกรอง</button>
            <button className="btn sm"><Ic name="download" size={13} /> Export</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 88 }}>วันที่</th>
              <th>รายละเอียด</th>
              <th>หมวดหมู่</th>
              <th>บัญชี</th>
              <th>แหล่ง</th>
              <th className="num" style={{ width: 130 }}>จำนวน (THB)</th>
              <th style={{ width: 110 }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {d.recentTxns.slice(0, 8).map(t => (
              <tr key={t.id}>
                <td className="num small muted">{t.date.slice(5).replace("-", "/")}</td>
                <td>{t.desc}</td>
                <td className="muted">{t.category}</td>
                <td className="muted small">{t.account}</td>
                <td><span className="tag">{t.source}</span></td>
                <td className={"num " + (t.amount > 0 ? "pos" : "neg")} style={{ fontWeight: 500 }}>
                  {t.amount > 0 ? "+" : ""}{window.fmtTHB(t.amount)}
                </td>
                <td>
                  {t.status === S.TXN.MATCHED && (
                    <span className="tag success"><span className="dot" />Matched</span>
                  )}
                  {t.status === S.TXN.PENDING && (
                    <span className="tag warning"><span className="dot" />Pending</span>
                  )}
                  {t.status === S.TXN.REVIEW && (
                    <span className="tag danger" style={{ cursor: "pointer" }} title="คลิกเพื่อตรวจสอบ">
                      <span className="dot" />Review →
                    </span>
                  )}
                  {t.status === S.TXN.VOID && (
                    <span className="tag"><span className="dot" />Void</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

window.Dashboard = Dashboard;

// ─── Legacy Kpi component (used by Forecast + other screens) ─────────────────
// Fixed: deltaDown now correctly uses arrowDown icon instead of arrowUp
function Kpi({ label, value, delta, deltaUp, deltaDown, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{window.fmtTHB(value)}</div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div className="kpi-delta">
          {deltaUp   && <span className="up"><Ic name="arrowUp" size={11} /> {delta}</span>}
          {deltaDown && <span className="down"><Ic name="arrowDown" size={11} /> {delta}</span>}
          {!deltaUp && !deltaDown && <span>{delta}</span>}
        </div>
        {spark && (
          <div style={{ width: 110, height: 32, opacity: 0.9 }}>
            <Sparkline data={spark} color={color} height={32} fill />
          </div>
        )}
      </div>
    </div>
  );
}
window.Kpi = Kpi;
