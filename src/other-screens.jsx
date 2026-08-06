/* Forecast + Reconciliation + Export Center + Settings */

function Forecast({ chartStyle }) {
  const d = window.CFData;
  const [scenario, setScenario] = React.useState("base");
  const adjust = scenario === "base" ? 1 : scenario === "bull" ? 1.15 : 0.85;
  const data = d.forecast.map((w) => ({
    ...w,
    inflow: Math.round(w.inflow * adjust),
    outflow: w.outflow,
    net: Math.round(w.inflow * adjust) - w.outflow,
  }));
  // Recompute running balance
  let bal = 469_220_000;
  const dataB = data.map((w) => { bal += w.net; return { ...w, balance: bal }; });
  const minBal = Math.min(...dataB.map((x) => x.balance));
  const maxBal = Math.max(...dataB.map((x) => x.balance));

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Cash Flow Forecast</h1>
          <p className="page-sub">คาดการณ์กระแสเงินสด 8 สัปดาห์ข้างหน้า • ตั้งค่า scenario เพื่อจำลองสถานการณ์</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="sparkles" size={14} /> สร้าง Forecast อัตโนมัติ</button>
          <button className="btn primary"><Ic name="download" size={14} /> Export</button>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="segmented">
          <button className={scenario === "bear" ? "active" : ""} onClick={() => setScenario("bear")}>Bear (–15%)</button>
          <button className={scenario === "base" ? "active" : ""} onClick={() => setScenario("base")}>Base</button>
          <button className={scenario === "bull" ? "active" : ""} onClick={() => setScenario("bull")}>Bull (+15%)</button>
        </div>
        <select className="select"><option>ช่วงเวลา: 8 สัปดาห์</option><option>4 สัปดาห์</option><option>13 สัปดาห์</option><option>26 สัปดาห์</option></select>
        <div className="grow" />
        <span className="tag accent">อิงข้อมูล AR/AP, Forecast Sales และคำสั่งซื้อยืนยัน</span>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Kpi label="ยอดคาดการณ์ ณ สิ้นช่วง" value={dataB[dataB.length - 1].balance} spark={dataB.map((x) => x.balance)} color="#2A6FF0" delta={`${data.length} สัปดาห์`} />
        <Kpi label="รับสุทธิรวมในช่วง" value={dataB.reduce((s, x) => s + x.inflow, 0)} spark={dataB.map((x) => x.inflow)} color="#1F9D55" delta="คาดการณ์" deltaUp />
        <Kpi label="จ่ายสุทธิรวมในช่วง" value={dataB.reduce((s, x) => s + x.outflow, 0)} spark={dataB.map((x) => x.outflow)} color="#D03434" delta="คาดการณ์" deltaDown />
        <Kpi label="ยอดต่ำสุดในช่วง" value={minBal} spark={dataB.map((x) => x.balance)} color="#C97A00" delta={`สูงสุด ${window.fmtTHBShort(maxBal)}`} />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Forecast รายสัปดาห์</div>
            <div className="card-sub">Net cash flow + cumulative balance projection</div>
          </div>
          <div className="grow" />
          <div className="legend">
            <span><span className="sw" style={{ background: "#1F9D55" }} />รับ</span>
            <span><span className="sw" style={{ background: "#D03434" }} />จ่าย</span>
            <span><span className="sw" style={{ background: "#2A6FF0" }} />Balance</span>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <ForecastChart data={dataB} height={260} style={chartStyle} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <div className="card-title">ตารางคาดการณ์</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>สัปดาห์</th>
              <th>ช่วงวันที่</th>
              <th className="num">เงินสดรับ</th>
              <th className="num">เงินสดจ่าย</th>
              <th className="num">สุทธิ</th>
              <th className="num">ยอดคงเหลือสะสม</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {dataB.map((w, i) => {
              const start = new Date(2026, 3, 1 + i * 7);
              const end = new Date(start); end.setDate(end.getDate() + 6);
              const fmt = (dt) => `${dt.getDate()}/${dt.getMonth() + 1}`;
              return (
                <tr key={i}>
                  <td><span className="tag accent">{w.week}</span></td>
                  <td className="muted small">{fmt(start)} – {fmt(end)}</td>
                  <td className="num pos">+{window.fmtTHB(w.inflow)}</td>
                  <td className="num neg">{window.fmtTHB(-w.outflow)}</td>
                  <td className={"num " + (w.net >= 0 ? "pos" : "neg")} style={{ fontWeight: 500 }}>
                    {w.net >= 0 ? "+" : ""}{window.fmtTHB(w.net)}
                  </td>
                  <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(w.balance)}</td>
                  <td className="small muted">{i === 4 ? "ครบกำหนดชำระเงินกู้" : i === 1 ? "ปันผลรับจาก JV" : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ForecastChart({ data, height = 260, style = "line" }) {
  const ref = React.useRef(null);
  const { w } = window.useSize(ref);
  const padL = 70, padR = 70, padT = 18, padB = 28;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = height - padT - padB;
  const maxFlow = Math.max(...data.flatMap((d) => [d.inflow, d.outflow])) * 1.15;
  const balVals = data.map((x) => x.balance);
  const minBal = Math.min(...balVals) * 0.95, maxBal = Math.max(...balVals) * 1.05;
  const n = data.length;
  const stepX = innerW / (n - 1);
  const barW = (innerW / n) * 0.28;
  const yFlow = (v) => padT + innerH - (v / maxFlow) * innerH;
  const yBal = (v) => padT + innerH - ((v - minBal) / (maxBal - minBal)) * innerH;
  const xFor = (i) => padL + i * stepX;
  const balPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yBal(d.balance)}`).join(" ");
  return (
    <div ref={ref} style={{ width: "100%", height }}>
      <svg width="100%" height={height} style={{ overflow: "visible" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={padT + innerH * t} y2={padT + innerH * t} stroke="#EEF0F3" />
        ))}
        {data.map((d, i) => (
          <g key={i}>
            <rect x={xFor(i) - barW - 1} y={yFlow(d.inflow)} width={barW} height={innerH - (yFlow(d.inflow) - padT)} fill="#1F9D55" opacity="0.85" rx="2" />
            <rect x={xFor(i) + 1} y={yFlow(d.outflow)} width={barW} height={innerH - (yFlow(d.outflow) - padT)} fill="#D03434" opacity="0.85" rx="2" />
            <text x={xFor(i)} y={height - 10} fontSize="10.5" textAnchor="middle" fill="#5C6470">{d.week}</text>
          </g>
        ))}
        <path d={balPath} fill="none" stroke="#2A6FF0" strokeWidth="2.4" />
        {data.map((d, i) => (
          <circle key={i} cx={xFor(i)} cy={yBal(d.balance)} r="3.5" fill="white" stroke="#2A6FF0" strokeWidth="2" />
        ))}
        {/* Y axis labels - flow */}
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={padL - 8} y={padT + innerH * (1 - t) + 4} fontSize="10.5" textAnchor="end" fill="#8B95A1" fontFamily="IBM Plex Mono, monospace">
            {window.fmtTHBShort(maxFlow * t)}
          </text>
        ))}
        {/* Y axis labels - balance (right) */}
        {[0, 0.5, 1].map((t, i) => (
          <text key={i} x={w - padR + 8} y={padT + innerH * (1 - t) + 4} fontSize="10.5" textAnchor="start" fill="#2A6FF0" fontFamily="IBM Plex Mono, monospace">
            {window.fmtTHBShort(minBal + (maxBal - minBal) * t)}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ----- Reconciliation ----- */
function Reconciliation({ toast }) {
  const d = window.CFData;
  const [filter, setFilter] = React.useState("all");
  const S = window.CF_STATUS.TXN;
  const items = d.reconItems.filter((r) => filter === "all" || (filter === "matched" ? r.status === S.MATCHED : r.status !== S.MATCHED));
  const counts = {
    matched:   d.reconItems.filter((r) => r.status === S.MATCHED).length,
    unmatched: d.reconItems.filter((r) => r.status !== S.MATCHED).length,
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Reconciliation</h1>
          <p className="page-sub">จับคู่รายการระหว่างบัญชีธนาคารและสมุดบัญชี (GL) เพื่อยืนยันความถูกต้อง</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="refresh" size={14} /> Run Auto-match</button>
          <button className="btn primary"><Ic name="check" size={14} /> ยืนยันการกระทบยอด</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <MiniStat label="รายการทั้งหมด" value={d.reconItems.length} raw />
        <MiniStat label="จับคู่อัตโนมัติแล้ว" value={counts.matched} raw color="var(--success)" />
        <MiniStat label="ต้องตรวจสอบ" value={counts.unmatched} raw color="var(--warning)" />
        <MiniStat label="ผลต่างคงเหลือ (บาท)" value={1_180_000} accent />
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="segmented">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>ทั้งหมด ({d.reconItems.length})</button>
          <button className={filter === "unmatched" ? "active" : ""} onClick={() => setFilter("unmatched")}>ต้องตรวจสอบ ({counts.unmatched})</button>
          <button className={filter === "matched" ? "active" : ""} onClick={() => setFilter("matched")}>Matched ({counts.matched})</button>
        </div>
        <div className="grow" />
        <select className="select"><option>บัญชี BA-001 (หลัก)</option><option>ทุกบัญชี</option></select>
        <select className="select"><option>วันที่ 24–29 มี.ค. 2026</option></select>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th colSpan="3" style={{ background: "#EAF1FE" }}>ข้อมูลธนาคาร</th>
              <th style={{ background: "var(--bg-subtle)", width: 50 }}></th>
              <th colSpan="3" style={{ background: "var(--success-soft)" }}>ข้อมูล GL (สมุดบัญชี)</th>
              <th style={{ width: 110 }}>สถานะ</th>
              <th style={{ width: 60 }}></th>
            </tr>
            <tr>
              <th>วันที่</th>
              <th>รายการ</th>
              <th className="num">จำนวน</th>
              <th></th>
              <th>วันที่</th>
              <th>รายการ</th>
              <th className="num">จำนวน</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td className="num small">{r.bank?.date.slice(5) || <span className="faint">—</span>}</td>
                <td className="small">{r.bank?.desc || <span className="faint">—</span>}</td>
                <td className={"num " + (r.bank?.amount > 0 ? "pos" : r.bank?.amount < 0 ? "neg" : "")}>{r.bank ? window.fmtTHB(r.bank.amount) : "—"}</td>
                <td className="center faint">
                  {r.status === S.MATCHED ? <Ic name="check" size={14} style={{ color: "var(--success)" }} /> :
                    r.status === S.REVIEW ? <Ic name="alert" size={14} style={{ color: "var(--warning)" }} /> :
                      <Ic name="arrowRight" size={14} />}
                </td>
                <td className="num small">{r.gl?.date.slice(5) || <span className="faint">—</span>}</td>
                <td className="small">{r.gl?.desc || <span className="faint">ไม่พบใน GL</span>}{r.gl && <div className="tiny faint">{r.gl.account}</div>}</td>
                <td className={"num " + (r.gl?.amount > 0 ? "pos" : r.gl?.amount < 0 ? "neg" : "")}>{r.gl ? window.fmtTHB(r.gl.amount) : "—"}</td>
                <td>
                  {r.status === S.MATCHED        && <span className="tag success"><span className="dot" />Matched</span>}
                  {r.status === "unmatched-bank" && <span className="tag warning"><span className="dot" />Bank Only</span>}
                  {r.status === "unmatched-gl"   && <span className="tag warning"><span className="dot" />GL Only</span>}
                  {r.status === S.REVIEW         && <span className="tag danger"><span className="dot" />Review</span>}
                </td>
                <td>
                  {r.status === S.MATCHED
                    ? <button className="iconbtn" title="แยกออก"><Ic name="more" size={14} /></button>
                    : <button className="btn sm" onClick={() => toast("เปิดกล่องจับคู่")}><Ic name="link" size={12} /> จับคู่</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ----- Export Center ----- */
function ExportCenter({ toast, onShowExport }) {
  const d = window.CFData;
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Export Center</h1>
          <p className="page-sub">สร้างและจัดการรายงานทั้งหมดในรูปแบบ Excel / PDF</p>
        </div>
        <div className="page-actions">
          <button className="btn primary" onClick={onShowExport}><Ic name="plus" size={14} /> สร้าง Export ใหม่</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { ic: "chart", title: "งบกระแสเงินสด – วิธีตรง", sub: "Direct Method", color: "#1F9D55" },
          { ic: "barChart", title: "งบกระแสเงินสด – วิธีอ้อม", sub: "Indirect Method", color: "#2A6FF0" },
          { ic: "forecast", title: "Forecast 13 สัปดาห์", sub: "Rolling forecast", color: "#7C4DFF" },
          { ic: "boxes", title: "Aging Reports", sub: "AR + AP", color: "#C97A00" },
        ].map((q, i) => (
          <button key={i} className="card" style={{ padding: 16, textAlign: "left", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }} onClick={onShowExport}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: q.color + "1a", color: q.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Ic name={q.ic} size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div className="tiny muted" style={{ marginTop: 2 }}>{q.sub}</div>
              <div className="row" style={{ marginTop: 8, gap: 4 }}>
                <span className="tag">Excel</span>
                <span className="tag">PDF</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">ประวัติการ Export</div>
          <div className="grow" />
          <div className="search-wrap">
            <Ic name="search" size={14} className="search-ic" />
            <input className="input search" placeholder="ค้นหา…" style={{ width: 200 }} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>ชื่อไฟล์</th>
              <th>ประเภทรายงาน</th>
              <th>งวด</th>
              <th>ผู้สร้าง</th>
              <th>เวลา</th>
              <th>ขนาด</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {d.exports.map((e) => (
              <tr key={e.id}>
                <td className="mono small">{e.id}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Ic name="fileExcel" size={16} style={{ color: "#1F9D55" }} />
                    <span style={{ fontWeight: 500 }}>{e.name}</span>
                  </div>
                </td>
                <td className="muted small">{e.type}</td>
                <td className="muted small">{e.period}</td>
                <td>{e.by}</td>
                <td className="num small muted">{e.at}</td>
                <td className="muted small">{e.size}</td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn sm ghost" onClick={() => toast("เริ่มดาวน์โหลด " + e.name)}><Ic name="download" size={12} /></button>
                    <button className="iconbtn"><Ic name="more" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ----- Settings ----- */
function Settings({ toast }) {
  const d = window.CFData;
  const [tab, setTab] = React.useState("cfmap");
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">ตั้งค่าระบบ Cash Flow Mapping, บัญชี GL, ผู้ใช้งาน และการเชื่อมต่อ</p>
        </div>
      </div>

      {/* 4 Tabs (รวมที่ซ้อนกัน) */}
      <div className="tabs">
        <button className={"tab " + (tab === "cfmap" ? "active" : "")} onClick={() => setTab("cfmap")}>
          <Ic name="chart" size={13} style={{ marginRight: 5 }} />CF Mapping
        </button>
        <button className={"tab " + (tab === "gl" ? "active" : "")} onClick={() => setTab("gl")}>
          <Ic name="book" size={13} style={{ marginRight: 5 }} />GL Accounts
        </button>
        <button className={"tab " + (tab === "company" ? "active" : "")} onClick={() => setTab("company")}>
          <Ic name="bank" size={13} style={{ marginRight: 5 }} />บริษัท & ผู้ใช้
        </button>
        <button className={"tab " + (tab === "integrations" ? "active" : "")} onClick={() => setTab("integrations")}>
          <Ic name="link" size={13} style={{ marginRight: 5 }} />การเชื่อมต่อ
        </button>
      </div>

      {tab === "cfmap" && <CFMappingTab toast={toast} />}

      {tab === "gl" && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">GL Account → Cash Flow Mapping</div>
              <div className="card-sub">กำหนดว่าบัญชี GL แต่ละตัวอยู่ใน Activity ไหนของ Cash Flow</div>
            </div>
            <div className="grow" />
            <button className="btn sm"><Ic name="sparkles" size={12} /> Auto-map ทั้งหมด</button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>GL Code</th>
                <th>ชื่อบัญชี</th>
                <th>ประเภท</th>
                <th>CF Activity</th>
                <th>ทิศทาง</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {d.glAccounts.map((g) => {
                const cfActivity = g.type === "Asset" ? "ดำเนินงาน" : g.type === "Liability" ? "จัดหาเงิน" : g.type === "Revenue" ? "ดำเนินงาน" : g.type === "Expense" ? "ดำเนินงาน" : "—";
                const dir = g.type === "Revenue" ? "in" : g.type === "Expense" ? "out" : "—";
                return (
                  <tr key={g.code}>
                    <td className="mono small" style={{ fontWeight: 500 }}>{g.code}</td>
                    <td>{g.name}</td>
                    <td><TypeTag t={g.type} /></td>
                    <td>
                      <select className="select" style={{ height: 26, fontSize: 12 }} defaultValue={cfActivity}>
                        <option>ดำเนินงาน</option>
                        <option>ลงทุน</option>
                        <option>จัดหาเงิน</option>
                        <option>ปรับปรุง (Non-cash)</option>
                        <option>ไม่ใช่กระแสเงินสด</option>
                      </select>
                    </td>
                    <td>
                      {dir === "in" ? <span className="tag success small">รับ</span>
                        : dir === "out" ? <span className="tag danger small">จ่าย</span>
                        : <span className="tag small muted">—</span>}
                    </td>
                    <td><button className="iconbtn"><Ic name="edit" size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "company" && (
        <>
          {/* Company Info */}
          <div className="card card-pad" style={{ maxWidth: 760, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>
              <Ic name="bank" size={14} style={{ marginRight: 6, color: "var(--accent)" }} />ข้อมูลบริษัท
            </div>
            <div className="form-grid">
              <label className="field full">ชื่อบริษัท<input className="input" defaultValue={d.company.name} /></label>
              <label className="field">รหัสย่อ<input className="input" defaultValue={d.company.short} /></label>
              <label className="field">สกุลเงินหลัก
                <select className="select"><option>THB - บาทไทย</option><option>USD</option><option>EUR</option><option>JPY</option></select>
              </label>
              <label className="field">รอบบัญชี
                <select className="select"><option>1 ม.ค. – 31 ธ.ค.</option><option>1 เม.ย. – 31 มี.ค.</option><option>1 ก.ค. – 30 มิ.ย.</option></select>
              </label>
              <label className="field">เลขประจำตัวผู้เสียภาษี<input className="input" defaultValue="0107542000XXX" /></label>
              <label className="field full">ที่อยู่<textarea defaultValue={"เลขที่ 1 อาคาร TIH ชั้น 28\nถนนสาทรเหนือ แขวงสีลม เขตบางรัก\nกรุงเทพมหานคร 10500"} /></label>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
              <button className="btn">ยกเลิก</button>
              <button className="btn primary" onClick={() => toast("บันทึกการตั้งค่าสำเร็จ")}>บันทึก</button>
            </div>
          </div>

          {/* Users */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">ผู้ใช้งานระบบ</div>
                <div className="card-sub">จัดการสิทธิ์การเข้าถึงข้อมูล</div>
              </div>
              <div className="grow" />
              <button className="btn sm primary"><Ic name="plus" size={12} /> เพิ่มผู้ใช้</button>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>หน่วยงาน</th><th>เข้าใช้งานล่าสุด</th><th></th></tr>
              </thead>
              <tbody>
                {[
                  { n: "ปริญญา สวัสดิ์โสภณ", e: "parinya.s@tih.co.th", r: "CFO / Admin", u: "Finance", t: "2026-03-31 15:42", color: "#2A6FF0" },
                  { n: "รดา มงคลเกียรติ", e: "rada.m@tih.co.th", r: "Treasury Manager", u: "Finance", t: "2026-03-31 11:22", color: "#1F9D55" },
                  { n: "ธนวรรธน์ คงวรรณ", e: "thanawat.k@tih.co.th", r: "Accountant", u: "Accounting", t: "2026-03-31 09:14", color: "#7C4DFF" },
                  { n: "พิชญา ตรีรัตน์", e: "phichaya.t@tih.co.th", r: "Approver", u: "Finance", t: "2026-03-30 18:02", color: "#C97A00" },
                  { n: "สุทธิพงศ์ บูรพา", e: "suttiphong.b@tih.co.th", r: "Viewer", u: "Internal Audit", t: "2026-03-28 14:51", color: "#8B95A1" },
                ].map((u, i) => (
                  <tr key={i}>
                    <td>
                      <div className="row" style={{ gap: 10 }}>
                        <div className="sb-avatar" style={{ width: 28, height: 28, background: u.color, color: "#fff", fontSize: 11 }}>{u.n[0]}</div>
                        <div style={{ fontWeight: 500 }}>{u.n}</div>
                      </div>
                    </td>
                    <td className="muted small">{u.e}</td>
                    <td><span className="tag accent">{u.r}</span></td>
                    <td className="muted">{u.u}</td>
                    <td className="num small muted">{u.t}</td>
                    <td><button className="iconbtn"><Ic name="more" size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[
            { n: "ERP ภายในองค์กร", desc: "ซิงก์ข้อมูล GL, AP/AR อัตโนมัติ", k: "1,420 รายการ/วัน", on: true, icon: "settings" },
            { n: "Bank Connectivity", desc: "ดึง Bank Statement อัตโนมัติ", k: "5 บัญชี — รับข้อมูลล่าสุด 29 มี.ค.", on: true, icon: "bank" },
            { n: "FlowAccount", desc: "เชื่อมต่อบัญชีจาก FlowAccount", k: "ยังไม่ได้ตั้งค่า API Key", on: false, icon: "receipt" },
            { n: "Power BI", desc: "ส่งออกข้อมูลสำหรับ Dashboard BI", k: "API key — สร้างเมื่อ 12 ม.ค.", on: true, icon: "barChart" },
            { n: "Email Notification", desc: "แจ้งเตือนทางอีเมลเมื่อมีรายการสำคัญ", k: "SMTP – treasury@tih.co.th", on: true, icon: "bell" },
            { n: "LINE Notify", desc: "แจ้งเตือนผ่าน LINE เมื่อ CF ต่ำกว่าเกณฑ์", k: "ต้องการ LINE Notify Token", on: false, icon: "alert" },
          ].map((item, idx) => (
            <div key={idx} className="card card-pad" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: item.on ? "var(--accent-soft)" : "var(--bg-hover)", color: item.on ? "var(--accent-text)" : "var(--text-tertiary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Ic name={item.icon} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{item.n}</div>
                <div className="small muted" style={{ marginTop: 2 }}>{item.desc}</div>
                <div className="tiny faint" style={{ marginTop: 4 }}>{item.k}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {item.on
                  ? <span className="tag success"><span className="dot" />Active</span>
                  : <button className="btn sm">เชื่อมต่อ</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ----- CF Mapping tab (Settings) — redesigned user-friendly ----- */
function CFMappingTab({ toast }) {
  const d = window.CFData;
  const [mapping, setMapping] = React.useState(d.cfMapping);
  const [showUpload, setShowUpload] = React.useState(false);
  const [editLine, setEditLine] = React.useState(null); // label being edited
  const [filterAct, setFilterAct] = React.useState("all");
  const [history, setHistory] = React.useState([
    { id: "MAP-2026-003", name: "CF_Mapping_Q1_2026_v3.xlsx", by: "K. ปริญญา ส.", at: "2026-03-28 14:32", rows: 32, status: "active" },
    { id: "MAP-2026-002", name: "CF_Mapping_Q1_2026_v2.xlsx", by: "K. ปริญญา ส.", at: "2026-02-15 10:18", rows: 28, status: "archived" },
    { id: "MAP-2026-001", name: "CF_Mapping_Initial.xlsx",   by: "K. รดา ม.",     at: "2026-01-08 09:45", rows: 24, status: "archived" },
  ]);

  React.useEffect(() => { d.cfMapping = mapping; }, [mapping]);

  const activityFor = (label) => {
    if (["ซื้อที่ดิน อาคารและอุปกรณ์","ขายสินทรัพย์ถาวร","เงินลงทุนระยะสั้น (เพิ่ม)/ลด","เงินปันผลรับจากเงินลงทุน"].includes(label)) return "Investing";
    if (["เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)","เงินกู้ระยะยาว – รับ","เงินกู้ระยะยาว – ชำระคืน","จ่ายเงินปันผล"].includes(label)) return "Financing";
    return "Operating";
  };
  const actColor = (a) => a === "Operating" ? "#2A6FF0" : a === "Investing" ? "#C97A00" : "#7C4DFF";

  // Count segments per CF line
  const segCountFor = (label, m) => {
    if (!m) return 0;
    if (m.type === "expense") return (m.expenseSegments || []).length;
    return Object.values(m.incomeSegments || {}).reduce((s, arr) => s + arr.length, 0);
  };

  // Status: complete / partial / empty
  const statusFor = (label, m) => {
    const n = segCountFor(label, m);
    if (n === 0) return "empty";
    return "complete";
  };
  const statusBadge = (s) => {
    if (s === "complete") return <span className="tag success" style={{ fontSize: 11 }}><Ic name="check" size={10} /> ครบ</span>;
    if (s === "partial")  return <span className="tag warning" style={{ fontSize: 11 }}>บางส่วน</span>;
    return <span className="tag danger" style={{ fontSize: 11 }}>ยังไม่มี</span>;
  };

  // Build CF lines list
  const cfLines = Object.entries(mapping).map(([label, m]) => ({
    label,
    m,
    activity: activityFor(label),
    segCount: segCountFor(label, m),
    status: statusFor(label, m),
  }));

  const filtered = filterAct === "all" ? cfLines : cfLines.filter(x => x.activity === filterAct);
  const countComplete = cfLines.filter(x => x.status === "complete").length;
  const countEmpty    = cfLines.filter(x => x.status === "empty").length;
  const totalSegs     = cfLines.reduce((s, x) => s + x.segCount, 0);

  // Get chip text for segments
  const segChips = (label, m) => {
    if (!m) return [];
    if (m.type === "expense") {
      return (m.expenseSegments || []).map(sid => {
        const ex = d.expenseSegments.find(x => x.id === sid);
        return { id: sid, name: ex ? sid + " " + ex.name : sid, color: ex?.color || "#888" };
      });
    }
    const chips = [];
    Object.entries(m.incomeSegments || {}).forEach(([entity, segs]) => {
      (segs || []).forEach(sid => chips.push({ id: entity + ":" + sid, name: d.getSegmentName(entity, sid, "in"), color: d.companies.find(c => c.id === entity)?.color || "#888" }));
    });
    return chips;
  };

  const onUploadDone = (newMapping, fileName) => {
    if (newMapping) setMapping(newMapping);
    const id = "MAP-2026-" + String(history.length + 4).padStart(3, "0");
    setHistory(h => [
      { id, name: fileName, by: "K. ปริญญา ส.", at: "2026-05-18 10:00", rows: totalSegs, status: "active" },
      ...h.map(x => ({ ...x, status: "archived" })),
    ]);
    setShowUpload(false);
    toast && toast("อัปเดต CF Mapping สำเร็จ");
  };

  return (
    <>
      {/* ── Summary KPIs ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <MiniStat label="CF Lines ทั้งหมด" value={cfLines.length} raw />
        <MiniStat label="ครบแล้ว" value={countComplete} raw color="var(--success)" />
        <MiniStat label="ยังไม่มี Segment" value={countEmpty} raw color={countEmpty > 0 ? "var(--danger)" : "var(--text-tertiary)"} />
        <MiniStat label="Segments รวม" value={totalSegs} raw accent />
      </div>

      {/* ── Actions bar ── */}
      <div className="row" style={{ marginBottom: 14, gap: 8 }}>
        <div className="segmented">
          {["all","Operating","Investing","Financing"].map(a => (
            <button key={a} className={filterAct === a ? "active" : ""} onClick={() => setFilterAct(a)}>
              {a === "all" ? "ทั้งหมด" : a}
            </button>
          ))}
        </div>
        <div className="grow" />
        <button className="btn sm" onClick={() => toast && toast("ดาวน์โหลด CF_Mapping_Template.xlsx")}><Ic name="download" size={13} /> Template</button>
        <button className="btn sm primary" onClick={() => setShowUpload(true)}><Ic name="upload" size={13} /> อัปโหลด Mapping</button>
      </div>

      {/* ── CF Lines Cards ── */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div className="card-title">CF Lines — Mapping ปัจจุบัน</div>
          <div className="grow" />
          <div className="legend" style={{ marginRight: 4 }}>
            <span><span className="sw" style={{ background: "#2A6FF0" }} />Operating</span>
            <span><span className="sw" style={{ background: "#C97A00" }} />Investing</span>
            <span><span className="sw" style={{ background: "#7C4DFF" }} />Financing</span>
          </div>
        </div>

        <div style={{ padding: "4px 0 8px" }}>
          {filtered.map(({ label, m, activity, segCount, status }) => {
            const chips = segChips(label, m);
            const ac = actColor(activity);
            return (
              <div key={label} style={{
                display: "flex", alignItems: "flex-start", gap: 0,
                borderBottom: "1px solid var(--border)",
                padding: "10px 16px",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                {/* Activity color strip */}
                <div style={{ width: 3, borderRadius: 2, background: ac, alignSelf: "stretch", marginRight: 12, flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{label}</span>
                    <span className="tag" style={{ background: ac + "1f", color: ac, fontSize: 10.5 }}>{activity}</span>
                    <span className="tag" style={{ fontSize: 10.5 }}>{m.type === "income" ? "รับ" : "จ่าย"}</span>
                    {statusBadge(status)}
                    <span className="small muted">{segCount} segments</span>
                  </div>
                  {/* Segment chips */}
                  <div className="row" style={{ gap: 5, flexWrap: "wrap" }}>
                    {chips.length === 0
                      ? <span className="tiny muted" style={{ fontStyle: "italic" }}>— ยังไม่มี segment ที่ผูก กดแก้ไขเพื่อเพิ่ม</span>
                      : chips.map(chip => (
                        <span key={chip.id} style={{
                          fontSize: 11, padding: "1px 8px", borderRadius: 10,
                          background: chip.color + "22", color: chip.color,
                          fontWeight: 500, border: "1px solid " + chip.color + "44",
                        }}>{chip.name}</span>
                      ))
                    }
                  </div>
                </div>

                {/* Edit button */}
                <button
                  className="btn sm"
                  style={{ marginLeft: 12, flexShrink: 0 }}
                  onClick={() => setEditLine(label)}
                >
                  <Ic name="edit" size={12} /> แก้ไข
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Upload history (collapsed) ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">ประวัติการอัปโหลด Mapping</div>
            <div className="card-sub">ไฟล์ล่าสุด: {history[0]?.name}</div>
          </div>
          <div className="grow" />
          <button className="btn sm primary" onClick={() => setShowUpload(true)}><Ic name="upload" size={13} /> อัปโหลดใหม่</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>ไฟล์</th>
              <th>อัปโหลดโดย</th>
              <th className="num">วันที่</th>
              <th className="num">Rows</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Ic name="fileExcel" size={16} style={{ color: "#1F9D55" }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{h.name}</div>
                      <div className="tiny faint">{h.id}</div>
                    </div>
                  </div>
                </td>
                <td className="muted">{h.by}</td>
                <td className="num small muted">{h.at}</td>
                <td className="num">{h.rows}</td>
                <td>
                  {h.status === "active"
                    ? <span className="tag success"><span className="dot" />ใช้งานอยู่</span>
                    : <span className="tag muted">เก็บถาวร</span>}
                </td>
                <td>
                  <button className="btn sm ghost" onClick={() => toast && toast("ดาวน์โหลด " + h.name)}>
                    <Ic name="download" size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showUpload && <CFMappingUploadModal onClose={() => setShowUpload(false)} onDone={onUploadDone} />}
      {editLine   && <CFLineEditModal label={editLine} mapping={mapping} setMapping={setMapping} onClose={() => setEditLine(null)} toast={toast} />}
    </>
  );
}

/* ----- Quick Edit Modal for a single CF Line ----- */
function CFLineEditModal({ label, mapping, setMapping, onClose, toast }) {
  const d = window.CFData;
  const m = mapping[label] || { type: "expense", expenseSegments: [], incomeSegments: {} };
  const isExpense = m.type === "expense";

  const activityFor = (lbl) => {
    if (["ซื้อที่ดิน อาคารและอุปกรณ์","ขายสินทรัพย์ถาวร","เงินลงทุนระยะสั้น (เพิ่ม)/ลด","เงินปันผลรับจากเงินลงทุน"].includes(lbl)) return "Investing";
    if (["เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)","เงินกู้ระยะยาว – รับ","เงินกู้ระยะยาว – ชำระคืน","จ่ายเงินปันผล"].includes(lbl)) return "Financing";
    return "Operating";
  };
  const activity = activityFor(label);
  const actColor = activity === "Operating" ? "#2A6FF0" : activity === "Investing" ? "#C97A00" : "#7C4DFF";

  // Local state for editing
  const [selExpSegs, setSelExpSegs] = React.useState(new Set(m.expenseSegments || []));
  const [selIncSegs, setSelIncSegs] = React.useState(() => {
    const init = {};
    Object.entries(m.incomeSegments || {}).forEach(([ent, segs]) => { init[ent] = new Set(segs); });
    return init;
  });

  const toggleExpSeg = (sid) => {
    setSelExpSegs(prev => {
      const next = new Set(prev);
      next.has(sid) ? next.delete(sid) : next.add(sid);
      return next;
    });
  };
  const toggleIncSeg = (entity, sid) => {
    setSelIncSegs(prev => {
      const next = { ...prev };
      const s = new Set(next[entity] || []);
      s.has(sid) ? s.delete(sid) : s.add(sid);
      next[entity] = s;
      return next;
    });
  };

  const handleSave = () => {
    const updated = { ...mapping };
    if (isExpense) {
      updated[label] = { ...m, expenseSegments: [...selExpSegs] };
    } else {
      const inc = {};
      Object.entries(selIncSegs).forEach(([ent, s]) => { if (s.size > 0) inc[ent] = [...s]; });
      updated[label] = { ...m, incomeSegments: inc };
    }
    setMapping(updated);
    toast && toast("บันทึก Mapping: " + label + " สำเร็จ");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">แก้ไข CF Mapping</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>{label}</div>
          </div>
          <span className="tag" style={{ marginLeft: 10, background: actColor + "1f", color: actColor }}>{activity}</span>
          <span className={"tag " + (isExpense ? "danger" : "success")} style={{ marginLeft: 6 }}>{isExpense ? "จ่าย (Expense)" : "รับ (Income)"}</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>

        <div className="modal-body">
          {/* CF Line info */}
          <div style={{ padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: 8, marginBottom: 16, borderLeft: "3px solid " + actColor }}>
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {activity} Activity • {isExpense ? "เงินสดจ่าย" : "เงินสดรับ"} • เลือก Segment ที่ต้องการผูก
            </div>
          </div>

          {isExpense ? (
            /* Expense: checkboxes per expense segment */
            <div>
              <div className="small" style={{ fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
                Expense Segments (F1 / I1 / O1–O6)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {d.expenseSegments.map(seg => {
                  const checked = selExpSegs.has(seg.id);
                  return (
                    <label key={seg.id}
                      className="row"
                      style={{
                        gap: 10, padding: "10px 12px",
                        border: "1px solid " + (checked ? seg.color : "var(--border)"),
                        borderRadius: 8, cursor: "pointer",
                        background: checked ? seg.color + "12" : "var(--bg)",
                        transition: "all 0.15s",
                      }}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggleExpSeg(seg.id)} />
                      <div style={{ minWidth: 0 }}>
                        <div className="row" style={{ gap: 6 }}>
                          <span className="mono small" style={{ fontWeight: 600, color: seg.color }}>{seg.id}</span>
                          <span style={{ fontWeight: 500 }}>{seg.name}</span>
                        </div>
                        <div className="tiny muted">
                          {seg.group === "F" ? "กิจกรรมจัดหาเงิน (Financing)" : seg.group === "I" ? "กิจกรรมลงทุน (Investing)" : "กิจกรรมดำเนินงาน (Operating)"}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Income: checkboxes per company × segment */
            <div>
              <div className="small" style={{ fontWeight: 600, marginBottom: 10, color: "var(--text-secondary)" }}>
                Income Segments (แยกตามบริษัท)
              </div>
              {d.companies.filter(c => c.id !== "CONSO").map(co => {
                const segs = d.incomeSegmentsByCo[co.id] || [];
                if (segs.length === 0) return null;
                const coSel = selIncSegs[co.id] || new Set();
                return (
                  <div key={co.id} style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                      <EntityChip entity={co.id} />
                      <span className="small muted">{co.name}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      {segs.map(seg => {
                        const checked = coSel.has(seg.id);
                        return (
                          <label key={seg.id}
                            className="row"
                            style={{
                              gap: 8, padding: "8px 10px",
                              border: "1px solid " + (checked ? co.color : "var(--border)"),
                              borderRadius: 7, cursor: "pointer",
                              background: checked ? co.color + "10" : "var(--bg)",
                              transition: "all 0.15s",
                            }}
                          >
                            <input type="checkbox" checked={checked} onChange={() => toggleIncSeg(co.id, seg.id)} />
                            <span className="small" style={{ fontWeight: checked ? 500 : 400 }}>{seg.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" onClick={handleSave}><Ic name="check" size={13} /> บันทึก</button>
        </div>
      </div>
    </div>
  );
}

/* ----- CF Mapping Upload Modal ----- */
function CFMappingUploadModal({ onClose, onDone }) {
  const d = window.CFData;
  const [step, setStep] = React.useState(1);
  const [progress, setProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState("CF_Mapping_Q2_2026.xlsx");

  React.useEffect(() => {
    if (step !== 2) return;
    setProgress(0);
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setTimeout(() => setStep(3), 300); return 100; }
        return p + 9;
      });
    }, 80);
    return () => clearInterval(t);
  }, [step]);

  // Simulated preview (using current mapping for demo)
  const previewRows = [];
  Object.entries(d.cfMapping).forEach(([label, m]) => {
    if (m.type === "expense") {
      (m.expenseSegments || []).forEach(sid => previewRows.push({ label, type: "Expense", entity: "*", sid, group: d.expenseSegments.find(x => x.id === sid)?.group || "—" }));
    } else {
      Object.entries(m.incomeSegments || {}).forEach(([entity, segs]) => {
        (segs || []).forEach(sid => previewRows.push({ label, type: "Income", entity, sid, group: "INC" }));
      });
    }
  });
  const valid = previewRows.length;
  const warnings = 0;
  const errors = 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">นำเข้าไฟล์ CF Mapping</div>
          <span className="tag" style={{ marginLeft: 10 }}>ขั้นตอนที่ {step} / 3</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="small muted" style={{ marginBottom: 8 }}>
                อัปโหลดไฟล์ Mapping (Excel/CSV) เพื่อจัดประเภท Segment, Activity และรายการในงบฯ
              </div>
              <div style={{ marginTop: 8, border: "1.5px dashed var(--border-strong)", borderRadius: 10, padding: 38, textAlign: "center", background: "var(--bg-subtle)" }}>
                <Ic name="upload" size={24} style={{ color: "var(--text-tertiary)" }} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>ลากไฟล์มาวาง หรือ คลิกเลือกไฟล์</div>
                <div className="small muted" style={{ marginTop: 4 }}>รองรับ .xlsx, .csv — ขนาดไม่เกิน 10 MB</div>
                <button className="btn primary" style={{ marginTop: 14 }} onClick={() => { setFileName("CF_Mapping_Q2_2026.xlsx"); }}>เลือกไฟล์</button>
                <div style={{ marginTop: 12, fontSize: 12 }} className="muted">
                  <Ic name="fileExcel" size={14} style={{ color: "#1F9D55", verticalAlign: "middle" }} /> {fileName}
                </div>
              </div>

              <div className="row" style={{ marginTop: 14, padding: 12, background: "var(--bg-subtle)", borderRadius: 6, gap: 12, alignItems: "flex-start" }}>
                <Ic name="alert" size={14} style={{ color: "var(--warning)", marginTop: 2, flexShrink: 0 }} />
                <div className="small muted">
                  <strong>คอลัมน์ที่ต้องมี:</strong> Activity, CF_Line, Type, Group, Entity, Segment_ID, Segment_Name<br />
                  หากไม่มี Template สามารถกดปุ่ม "ดาวน์โหลด Template" ก่อนได้
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: 14 }}>
                <label className="field"><span className="row" style={{ gap: 6 }}><input type="checkbox" defaultChecked />แทนที่ Mapping ปัจจุบัน</span></label>
                <label className="field"><span className="row" style={{ gap: 6 }}><input type="checkbox" defaultChecked />เก็บไฟล์เก่าเป็น Archive</span></label>
                <label className="field"><span className="row" style={{ gap: 6 }}><input type="checkbox" />ตรวจสอบเฉพาะ (Dry-run)</span></label>
                <label className="field"><span className="row" style={{ gap: 6 }}><input type="checkbox" defaultChecked />อัปเดต Mapping CF อัตโนมัติในรายงาน</span></label>
              </div>
            </>
          )}

          {step === 2 && (
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontWeight: 500 }}>กำลังตรวจสอบและประมวลผลไฟล์...</div>
              <div className="small muted" style={{ marginBottom: 14 }}>{fileName}</div>
              <div className="progress"><span style={{ width: progress + "%" }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <span className="small muted">
                  {progress < 30 ? "อ่านไฟล์ Excel..." :
                    progress < 60 ? "ตรวจสอบรูปแบบคอลัมน์..." :
                      progress < 90 ? "ตรวจสอบ Activity / Group / Segment..." : "เกือบเสร็จแล้ว..."}
                </span>
                <span className="small num">{Math.round(progress)}%</span>
              </div>

              <div style={{ marginTop: 18, border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg-subtle)" }}>
                <div className="small" style={{ fontWeight: 500, marginBottom: 8 }}>ขั้นตอนการตรวจสอบ</div>
                <div className="col" style={{ gap: 4, fontSize: 12 }}>
                  {["ตรวจหัวคอลัมน์","ตรวจ Activity (Operating/Investing/Financing)","ตรวจ Group (INC/F1/I1/O1–O6)","ตรวจ Entity","ตรวจ Segment_ID","สรุปผล"].map((s, i) => (
                    <div key={i} className="row" style={{ gap: 8 }}>
                      {progress > (i + 1) * 15 ? <Ic name="check" size={12} style={{ color: "var(--success)" }} /> : <span style={{ width: 12, height: 12, display: "inline-block", border: "1.5px solid var(--border-strong)", borderRadius: "50%" }} />}
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "inline-grid", placeItems: "center", marginBottom: 8 }}>
                  <Ic name="check" size={22} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>ตรวจสอบไฟล์เรียบร้อย</div>
                <div className="muted small" style={{ marginTop: 2 }}>{fileName} • {valid} แถว</div>
              </div>

              <div className="row" style={{ justifyContent: "center", gap: 24, marginBottom: 18 }}>
                <Stat label="ผ่านการตรวจ" value={String(valid)} color="var(--success)" />
                <Stat label="คำเตือน" value={String(warnings)} color="var(--warning)" />
                <Stat label="ผิดพลาด" value={String(errors)} color="var(--danger)" />
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 8, maxHeight: 280, overflow: "auto" }}>
                <table className="tbl" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>CF Line</th>
                      <th>Activity</th>
                      <th>Type</th>
                      <th>Group</th>
                      <th>Entity</th>
                      <th>Segment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 50).map((r, i) => {
                      const act = ["ซื้อที่ดิน อาคารและอุปกรณ์","ขายสินทรัพย์ถาวร","เงินลงทุนระยะสั้น (เพิ่ม)/ลด","เงินปันผลรับจากเงินลงทุน"].includes(r.label) ? "Investing"
                        : ["เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)","เงินกู้ระยะยาว – รับ","เงินกู้ระยะยาว – ชำระคืน","จ่ายเงินปันผล"].includes(r.label) ? "Financing"
                        : "Operating";
                      const ac = act === "Operating" ? "#2A6FF0" : act === "Investing" ? "#C97A00" : "#7C4DFF";
                      return (
                        <tr key={i}>
                          <td>{r.label}</td>
                          <td><span className="tag" style={{ background: ac + "1f", color: ac }}>{act}</span></td>
                          <td>{r.type === "Income" ? <span className="tag success">{r.type}</span> : <span className="tag danger">{r.type}</span>}</td>
                          <td><span className="tag segment-tag mono" style={{ fontSize: 10.5 }}>{r.group}</span></td>
                          <td>{r.entity === "*" ? <span className="faint mono small">*</span> : <EntityChip entity={r.entity} />}</td>
                          <td className="mono small">{r.sid}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-foot">
          {step === 1 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => setStep(2)}><Ic name="upload" size={13} /> ประมวลผล</button>
          </>}
          {step === 3 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => onDone(d.cfMapping, fileName)}><Ic name="check" size={13} /> นำมาใช้งาน</button>
          </>}
        </div>
      </div>
    </div>
  );
}

/* Reusable Mini KPI override for non-currency */
function MiniStat({ label, value, color, accent, raw }) {
  return (
    <div className="kpi" style={{ padding: "12px 14px", gap: 2 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: 20, color: accent ? "var(--accent)" : color || "var(--text)" }}>
        {raw ? value : window.fmtTHB(value)}
      </div>
    </div>
  );
}

/* ===========================================
   Upload Center — All Excel Templates
   =========================================== */

const UPLOAD_TEMPLATES = [
  {
    id: "gl", group: "บัญชี (Accounting)",
    title: "General Ledger", icon: "book",
    color: "#2A6FF0", filename: "01_GL_Template.xlsx",
    desc: "Journal entries จากระบบบัญชี — แหล่งข้อมูลหลักสำหรับ Cash Flow",
    columns: ["Date","JE_No","Account_Code","Account_Name","Debit","Credit","Entity","Segment"],
    freq: "รายเดือน",
  },
  {
    id: "tb", group: "บัญชี (Accounting)",
    title: "Trial Balance", icon: "barChart",
    color: "#2A6FF0", filename: "02_Trial_Balance_Template.xlsx",
    desc: "งบทดลองสิ้นเดือน — ใช้คำนวณ Indirect Cash Flow",
    columns: ["Period","Account_Code","Account_Type","Opening_Debit","Closing_Debit","Entity"],
    freq: "รายเดือน",
  },
  {
    id: "ar", group: "การเงิน (Finance)",
    title: "AR / Invoices", icon: "fileText",
    color: "#1F9D55", filename: "03_AR_Invoices_Template.xlsx",
    desc: "ใบแจ้งหนี้ + Credit Term — สำหรับ AR Aging และ Cash forecast",
    columns: ["Invoice_No","Date","Customer","Amount","Credit_Term","Due_Date","Status","Entity"],
    freq: "รายสัปดาห์",
  },
  {
    id: "ap", group: "การเงิน (Finance)",
    title: "AP / Bills", icon: "fileText",
    color: "#C97A00", filename: "04_AP_Bills_Template.xlsx",
    desc: "ใบวางบิลจากผู้ขาย — สำหรับ AP Aging และตารางเงินจ่าย",
    columns: ["Bill_No","Date","Vendor","Amount","Credit_Term","Due_Date","Status","Entity"],
    freq: "รายสัปดาห์",
  },
  {
    id: "bank", group: "การเงิน (Finance)",
    title: "Bank Transactions", icon: "bank",
    color: "#1F9D55", filename: "05_Bank_Transactions_Template.xlsx",
    desc: "รายการเดินบัญชีธนาคาร — สำหรับ Reconciliation",
    columns: ["Date","Bank_Account","Type","Amount","Description","Reference","Entity"],
    freq: "รายสัปดาห์",
  },
  {
    id: "receipts", group: "การเงิน (Finance)",
    title: "Cash Receipts", icon: "dollar",
    color: "#1F9D55", filename: "06_Cash_Receipts_Template.xlsx",
    desc: "บันทึกเงินรับ (Direct Method input)",
    columns: ["Date","Receipt_No","Customer","Amount","Payment_Method","Entity","Segment"],
    freq: "รายวัน",
  },
  {
    id: "payments", group: "การเงิน (Finance)",
    title: "Cash Payments", icon: "dollar",
    color: "#D03434", filename: "07_Cash_Payments_Template.xlsx",
    desc: "บันทึกเงินจ่าย (Direct Method input)",
    columns: ["Date","Payment_No","Vendor","Amount","Payment_Method","Entity","CF_Group"],
    freq: "รายวัน",
  },
  {
    id: "customers", group: "Master Data",
    title: "Customer Master", icon: "users",
    color: "#7C4DFF", filename: "08_Customer_Master_Template.xlsx",
    desc: "ฐานข้อมูลลูกค้า + Credit Term",
    columns: ["Customer_Code","Name","Type","Credit_Term","Credit_Limit","Entity","Status"],
    freq: "ตั้งค่าครั้งเดียว",
  },
  {
    id: "vendors", group: "Master Data",
    title: "Vendor Master", icon: "users",
    color: "#7C4DFF", filename: "09_Vendor_Master_Template.xlsx",
    desc: "ฐานข้อมูลผู้ขาย + Payment Term",
    columns: ["Vendor_Code","Name","Category","Credit_Term","Entity","CF_Group","Status"],
    freq: "ตั้งค่าครั้งเดียว",
  },
  {
    id: "inventory", group: "บัญชี (Accounting)",
    title: "Inventory", icon: "boxes",
    color: "#2A6FF0", filename: "10_Inventory_Template.xlsx",
    desc: "สินค้าคงเหลือสิ้นเดือน — ใช้คำนวณ Inventory Change",
    columns: ["Period","Item_Code","Item_Name","Quantity","Unit_Cost","Total_Value","Entity"],
    freq: "สิ้นเดือน",
  },
  {
    id: "cfmap", group: "Settings",
    title: "Cash Flow Mapping", icon: "settings",
    color: "#7C4DFF", filename: "11_CF_Mapping_Template.xlsx",
    desc: "กำหนด Segment → CF Line — ตั้งค่าครั้งเดียวก่อนใช้งาน",
    columns: ["Activity","CF_Line","Type","Group","Entity","Segment_ID","Segment_Name"],
    freq: "ตั้งค่าครั้งเดียว",
  },
];

function UploadCenter({ toast, companyId }) {
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [uploadTpl, setUploadTpl] = React.useState(null);
  const [recentUploads, setRecentUploads] = React.useState([
    { id: "UP-001", template: "GL Template", filename: "GL_2026-03_HMW.xlsx", at: "2026-03-31 16:42", rows: 248, status: "applied", by: "K. ปริญญา" },
    { id: "UP-002", template: "Trial Balance", filename: "TB_2026-03_CONSO.xlsx", at: "2026-03-31 16:50", rows: 86, status: "applied", by: "K. ปริญญา" },
    { id: "UP-003", template: "AR Invoices", filename: "AR_Q1_2026.xlsx", at: "2026-03-15 10:18", rows: 145, status: "applied", by: "K. รดา" },
    { id: "UP-004", template: "Bank Transactions", filename: "Kbank_032026.xlsx", at: "2026-03-31 09:32", rows: 312, status: "applied", by: "K. รดา" },
  ]);

  const groups = ["all", ...new Set(UPLOAD_TEMPLATES.map(t => t.group))];
  const filtered = UPLOAD_TEMPLATES.filter(t =>
    (filter === "all" || t.group === filter) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) ||
     t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const downloadTemplate = (tpl) => {
    const a = document.createElement("a");
    a.href = `templates/${tpl.filename}`;
    a.download = tpl.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast && toast(`ดาวน์โหลด ${tpl.filename}`);
  };

  const onUploadDone = (tpl, fileName, rows) => {
    setRecentUploads(prev => [{
      id: "UP-" + String(prev.length + 5).padStart(3, "0"),
      template: tpl.title,
      filename: fileName,
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      rows: rows || 0,
      status: "applied",
      by: "K. ปริญญา"
    }, ...prev]);
    setUploadTpl(null);
    toast && toast(`อัปเดต ${tpl.title} จากไฟล์ ${fileName} สำเร็จ`);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Upload Center
            <span className="tag accent" style={{ marginLeft: 8, fontSize: 11 }}>{UPLOAD_TEMPLATES.length} templates</span>
          </h1>
          <p className="page-sub">ดาวน์โหลด Template Excel หรือ Upload ข้อมูลเข้าสู่ระบบ Cash Flow</p>
        </div>
        <div className="page-actions">
          <button className="btn"><Ic name="download" size={14} /> ดาวน์โหลดทั้งหมด</button>
          <button className="btn primary"><Ic name="sparkles" size={14} /> AI Auto-Map</button>
        </div>
      </div>

      {/* Info banner */}
      <div className="card" style={{ marginBottom: 14, padding: 14, background: "var(--accent-soft)", border: "1px solid var(--accent-soft-strong)" }}>
        <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
          <Ic name="sparkles" size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "var(--accent-text)", marginBottom: 4 }}>วิธีใช้งาน Upload Center</div>
            <div className="small" style={{ color: "var(--text-secondary)" }}>
              1) คลิก <strong>Download</strong> เพื่อรับไฟล์ Template • 2) กรอกข้อมูลตามรูปแบบ (ตัวอย่างในไฟล์) • 3) คลิก <strong>Upload</strong> ส่งกลับเข้าระบบ • 4) ระบบจะ Auto-calculate Cash Flow ให้
            </div>
          </div>
        </div>
      </div>

      {/* KPI summary */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <MiniStat label="Templates พร้อมใช้" value={UPLOAD_TEMPLATES.length} raw accent />
        <MiniStat label="อัปโหลดล่าสุด (Q1)" value={recentUploads.length} raw color="var(--success)" />
        <MiniStat label="รายการรวม" value={recentUploads.reduce((s, r) => s + r.rows, 0)} raw />
        <MiniStat label="สถานะระบบ" value="✓ Online" raw color="var(--success)" />
      </div>

      {/* Filter + Search */}
      <div className="row" style={{ marginBottom: 14, gap: 10 }}>
        <div className="segmented">
          {groups.map(g => (
            <button key={g} className={filter === g ? "active" : ""} onClick={() => setFilter(g)}>
              {g === "all" ? "ทั้งหมด" : g}
            </button>
          ))}
        </div>
        <div className="grow" />
        <div className="search-wrap">
          <Ic name="search" size={14} className="search-ic" />
          <input className="input search" placeholder="ค้นหา template…" style={{ width: 220 }}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Template grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginBottom: 18 }}>
        {filtered.map(tpl => (
          <div key={tpl.id} className="card" style={{ padding: 0, transition: "all 0.15s", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: tpl.color + "20", color: tpl.color,
                display: "grid", placeItems: "center", flexShrink: 0
              }}>
                <Ic name={tpl.icon} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tpl.title}</div>
                <div className="tiny muted">{tpl.group} • {tpl.freq}</div>
              </div>
            </div>
            <div style={{ padding: "10px 16px 12px" }}>
              <div className="small muted" style={{ minHeight: 36, lineHeight: 1.4 }}>{tpl.desc}</div>
              <div style={{ marginTop: 10, padding: 8, background: "var(--bg-subtle)", borderRadius: 6 }}>
                <div className="tiny muted" style={{ marginBottom: 4 }}>คอลัมน์หลัก:</div>
                <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                  {tpl.columns.slice(0, 5).map(c => (
                    <span key={c} className="tag" style={{ fontSize: 10, padding: "1px 6px" }}>{c}</span>
                  ))}
                  {tpl.columns.length > 5 && <span className="tag" style={{ fontSize: 10, padding: "1px 6px" }}>+{tpl.columns.length - 5}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
              <button className="btn sm ghost" style={{ flex: 1, borderRadius: 0, border: "none", justifyContent: "center" }}
                onClick={() => downloadTemplate(tpl)}>
                <Ic name="download" size={13} /> Template
              </button>
              <div style={{ width: 1, background: "var(--border)" }} />
              <button className="btn sm" style={{ flex: 1, borderRadius: 0, border: "none", justifyContent: "center", color: tpl.color, fontWeight: 600 }}
                onClick={() => setUploadTpl(tpl)}>
                <Ic name="upload" size={13} /> Upload
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent uploads */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">การอัปโหลดล่าสุด</div>
            <div className="card-sub">รายการที่ระบบรับเข้าและประมวลผลแล้ว</div>
          </div>
          <div className="grow" />
          <button className="btn sm"><Ic name="download" size={13} /> Export Log</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Upload ID</th>
              <th>Template</th>
              <th>ไฟล์</th>
              <th style={{ width: 150 }}>เวลา</th>
              <th className="num" style={{ width: 100 }}>รายการ</th>
              <th style={{ width: 120 }}>โดย</th>
              <th style={{ width: 100 }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {recentUploads.map(r => (
              <tr key={r.id}>
                <td className="mono small">{r.id}</td>
                <td><strong>{r.template}</strong></td>
                <td className="mono small">{r.filename}</td>
                <td className="small muted">{r.at}</td>
                <td className="num">{r.rows.toLocaleString()}</td>
                <td className="small">{r.by}</td>
                <td>
                  <span className="tag" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                    <Ic name="check" size={10} /> Applied
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {uploadTpl && (
        <TemplateUploadModal
          template={uploadTpl}
          onClose={() => setUploadTpl(null)}
          onDone={(fileName, rows) => onUploadDone(uploadTpl, fileName, rows)}
        />
      )}
    </>
  );
}

function TemplateUploadModal({ template, onClose, onDone }) {
  const [step, setStep] = React.useState(1);
  const [progress, setProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState(template.filename);
  const [parsedRows, setParsedRows] = React.useState(0);
  const [errors, setErrors] = React.useState(0);

  React.useEffect(() => {
    if (step !== 2) return;
    setProgress(0);
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(t);
          // Simulate parse result
          const r = Math.floor(Math.random() * 200) + 50;
          setParsedRows(r);
          setErrors(Math.floor(Math.random() * 3));
          setTimeout(() => setStep(3), 300);
          return 100;
        }
        return p + 9;
      });
    }, 80);
    return () => clearInterval(t);
  }, [step]);

  const stepLabels = {
    1: "เลือกไฟล์", 2: "ประมวลผล", 3: "ยืนยัน"
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: template.color + "20", color: template.color, display: "grid", placeItems: "center" }}>
            <Ic name={template.icon} size={18} />
          </div>
          <div className="modal-title">Upload {template.title}</div>
          <span className="tag" style={{ marginLeft: 10 }}>{stepLabels[step]} ({step}/3)</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}>
            <Ic name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="card" style={{ padding: 12, marginBottom: 14, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>โครงสร้างที่ระบบรองรับ</div>
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {template.columns.map(c => (
                    <span key={c} className="tag" style={{ background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 11 }}>{c}</span>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <label className="field">รูปแบบไฟล์
                  <select className="select"><option>Excel (.xlsx)</option><option>CSV</option></select>
                </label>
                <label className="field">งวด
                  <select className="select"><option>มี.ค. 2569</option><option>ก.พ. 2569</option><option>ม.ค. 2569</option><option>YTD 2569</option></select>
                </label>
              </div>

              <div style={{ marginTop: 14, border: "1.5px dashed var(--border-strong)", borderRadius: 10, padding: 38, textAlign: "center", background: "var(--bg-subtle)" }}>
                <Ic name="upload" size={28} style={{ color: template.color }} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>ลากไฟล์มาวาง หรือ คลิกเลือกไฟล์</div>
                <div className="small muted" style={{ marginTop: 4 }}>{template.filename} • ขนาดไม่เกิน 25 MB</div>
                <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setFileName(`uploaded_${template.filename}`)}>
                  <Ic name="upload" size={13} /> เลือกไฟล์
                </button>
              </div>

              {fileName !== template.filename && (
                <div className="row" style={{ marginTop: 12, padding: 10, background: "var(--accent-soft)", borderRadius: 6, gap: 10 }}>
                  <Ic name="fileExcel" size={16} style={{ color: "#1F9D55" }} />
                  <span className="small" style={{ fontWeight: 500 }}>{fileName}</span>
                  <span className="tiny muted">~ 12 KB</span>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontWeight: 500 }}>กำลังประมวลผล {template.title}...</div>
              <div className="small muted" style={{ marginBottom: 14 }}>{fileName}</div>
              <div className="progress"><span style={{ width: progress + "%" }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <span className="small muted">
                  {progress < 25 ? "อ่านไฟล์ Excel..." :
                    progress < 50 ? "ตรวจสอบโครงสร้างคอลัมน์..." :
                      progress < 75 ? "Validate ข้อมูลและ mapping..." :
                        "บันทึกเข้าระบบ..."}
                </span>
                <span className="small num">{Math.round(progress)}%</span>
              </div>

              <div style={{ marginTop: 18, border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg-subtle)" }}>
                <div className="small" style={{ fontWeight: 500, marginBottom: 8 }}>Validation Steps</div>
                <div className="col" style={{ gap: 6, fontSize: 12 }}>
                  {[
                    "ตรวจสอบ Header ตรงกับ Template",
                    "ตรวจสอบประเภทข้อมูลของแต่ละคอลัมน์",
                    "Validate Entity และ Segment ที่อ้างอิง",
                    "ตรวจสอบ Balance / Duplicate / Date range",
                    "Apply mapping + commit เข้าฐานข้อมูล",
                  ].map((s, i) => (
                    <div key={i} className="row" style={{ gap: 8 }}>
                      {progress > (i + 1) * 18 ?
                        <Ic name="check" size={12} style={{ color: "var(--success)" }} /> :
                        <span style={{ width: 12, height: 12, display: "inline-block", border: "1.5px solid var(--border-strong)", borderRadius: "50%" }} />
                      }
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "inline-grid", placeItems: "center", marginBottom: 12 }}>
                  <Ic name="check" size={26} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>ประมวลผลสำเร็จ</div>
                <div className="muted" style={{ marginTop: 4 }}>{fileName}</div>
              </div>

              <div className="row" style={{ justifyContent: "center", gap: 22, marginBottom: 18 }}>
                <Stat2 label="แถวที่อ่านได้" value={parsedRows + errors} color="var(--text)" />
                <Stat2 label="ผ่าน Validation" value={parsedRows} color="var(--success)" />
                <Stat2 label="ต้องตรวจสอบ" value={errors} color={errors > 0 ? "var(--warning)" : "var(--text-tertiary)"} />
              </div>

              {errors > 0 && (
                <div className="card" style={{ padding: 12, background: "var(--bg-subtle)", border: "1px solid var(--warning-soft)" }}>
                  <div className="row small" style={{ gap: 8, alignItems: "flex-start" }}>
                    <Ic name="alert" size={14} style={{ color: "var(--warning)", marginTop: 2 }} />
                    <span>มี <strong>{errors} แถว</strong> ที่ Entity/Segment ไม่ตรงกับ Master Data — สามารถเลือก map ภายหลังหรือข้ามได้</span>
                  </div>
                </div>
              )}

              <div className="card" style={{ marginTop: 14, padding: 12, background: "var(--accent-soft)", border: "1px solid var(--accent-soft-strong)" }}>
                <div className="row" style={{ gap: 8 }}>
                  <Ic name="sparkles" size={14} style={{ color: "var(--accent)" }} />
                  <span className="small" style={{ color: "var(--accent-text)" }}>
                    หลัง <strong>Apply</strong> ระบบจะ recalculate Cash Flow ทั้ง Direct + Indirect Method อัตโนมัติ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step === 1 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => setStep(2)}>
              <Ic name="upload" size={13} /> ประมวลผล
            </button>
          </>}
          {step === 3 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => onDone(fileName, parsedRows)}>
              <Ic name="check" size={13} /> Apply เข้าระบบ
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

function Stat2({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="num" style={{ fontSize: 24, fontWeight: 600, color }}>{value}</div>
      <div className="tiny muted">{label}</div>
    </div>
  );
}

window.Forecast = Forecast;
window.Reconciliation = Reconciliation;
window.ExportCenter = ExportCenter;
window.Settings = Settings;
window.UploadCenter = UploadCenter;
