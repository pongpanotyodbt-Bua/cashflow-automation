/* Dashboard screen */

function Dashboard({ chartStyle, companyId = "CONSO" }) {
  const d = window.CFData;
  const [view, setView] = React.useState("monthly"); // monthly | daily
  const activeCo = d.companies.find(c => c.id === companyId) || d.companies[0];

  // Company-filtered totals (from segment data)
  const coTotals = d.getCompanyTotals(companyId);
  const coMonthly = coTotals.monthly;
  const inflowQ1 = coTotals.inflowQ1;
  const outflowQ1 = coTotals.outflowQ1;
  const netQ1 = coTotals.netQ1;

  const trendData = view === "monthly"
    ? coMonthly
    : d.trend30.slice(-14).map((x) => ({ ...x, m: x.date.slice(5) }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Dashboard
            <span className="co-chip" style={{ background: activeCo.color }}>{activeCo.short}</span>
          </h1>
          <p className="page-sub">{activeCo.desc} • {d.company.period}</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="refresh" size={14} /> รีเฟรชข้อมูล</button>
          <button className="btn primary"><Ic name="download" size={14} /> Export Excel</button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi
          label={companyId === "CONSO" ? "ยอดเงินสดคงเหลือรวม" : "ยอดเงินสดคงเหลือ"}
          value={d.totals.totalCash}
          delta="+4.2% vs ก่อนหน้า"
          deltaUp
          spark={coMonthly.map((m) => m.inflow - m.outflow + 200_000_000)}
          color="#2A6FF0"
        />
        <Kpi
          label={`กระแสเงินสดรับ (Q1) – ${activeCo.short}`}
          value={inflowQ1}
          delta={`+12.6% YoY`}
          deltaUp
          spark={coMonthly.map((m) => m.inflow)}
          color="#1F9D55"
        />
        <Kpi
          label={`กระแสเงินสดจ่าย (Q1) – ${activeCo.short}`}
          value={outflowQ1}
          delta="+8.1% YoY"
          deltaDown
          spark={coMonthly.map((m) => m.outflow)}
          color="#D03434"
        />
        <Kpi
          label={`กระแสเงินสดสุทธิ – ${activeCo.short}`}
          value={netQ1}
          delta={inflowQ1 > 0 ? `อัตรา ${((netQ1 / inflowQ1) * 100).toFixed(1)}%` : "—"}
          spark={coMonthly.map((m) => m.inflow - m.outflow)}
          color="#7C4DFF"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 14, marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">กระแสเงินสดเข้า – ออก ({activeCo.short})</div>
              <div className="card-sub">รายเดือน 6 เดือนล่าสุด (THB)</div>
            </div>
            <div style={{ marginLeft: "auto" }} className="row">
              <div className="legend">
                <span><span className="sw" style={{ background: "#1F9D55" }} />รับ</span>
                <span><span className="sw" style={{ background: "#D03434" }} />จ่าย</span>
              </div>
              <div className="segmented" style={{ marginLeft: 10 }}>
                <button className={view === "monthly" ? "active" : ""} onClick={() => setView("monthly")}>เดือน</button>
                <button className={view === "daily" ? "active" : ""} onClick={() => setView("daily")}>วัน</button>
              </div>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <TrendChart data={trendData} height={280} style={chartStyle} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">บัญชีธนาคาร</div>
              <div className="card-sub">{d.bankAccounts.length} บัญชี • ปรับปรุงล่าสุด 14:22</div>
            </div>
            <button className="btn ghost sm" style={{ marginLeft: "auto" }}>ดูทั้งหมด <Ic name="arrowRight" size={12} /></button>
          </div>
          <div style={{ padding: 6 }}>
            {d.bankAccounts.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 6, gap: 12 }}
                   onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-subtle)"}
                   onMouseLeave={(e) => e.currentTarget.style.background = ""}
              >
                <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-text)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Ic name="bank" size={15} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{b.name}</div>
                  <div className="tiny faint">{b.bank} • {b.no} • {b.ccy}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(b.balance)}</div>
                  <div className="tiny faint">บาท</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">รายการเข้าหลัก (Top Inflow)</div>
              <div className="card-sub">ไตรมาส 1/2569 จัดเรียงตามจำนวนเงิน</div>
            </div>
          </div>
          <div className="card-pad">
            <BarList items={d.topInflowCats} color="#1F9D55" />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">รายการจ่ายหลัก (Top Outflow)</div>
              <div className="card-sub">ไตรมาส 1/2569 จัดเรียงตามจำนวนเงิน</div>
            </div>
          </div>
          <div className="card-pad">
            <BarList items={d.topOutflowCats} color="#D03434" />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
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
              <th style={{ width: 90 }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {d.recentTxns.slice(0, 8).map((t) => (
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
                  {t.status === "matched" && <span className="tag success"><span className="dot" />Matched</span>}
                  {t.status === "pending" && <span className="tag warning"><span className="dot" />Pending</span>}
                  {t.status === "review" && <span className="tag danger"><span className="dot" />Review</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Kpi({ label, value, delta, deltaUp, deltaDown, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{window.fmtTHB(value)}</div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div className="kpi-delta">
          {deltaUp && <span className="up"><Ic name="arrowUp" size={11} /> {delta}</span>}
          {deltaDown && <span className="down"><Ic name="arrowUp" size={11} /> {delta}</span>}
          {!deltaUp && !deltaDown && <span>{delta}</span>}
        </div>
        <div style={{ width: 110, height: 32, opacity: 0.9 }}>
          {spark && <Sparkline data={spark} color={color} height={32} fill />}
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
