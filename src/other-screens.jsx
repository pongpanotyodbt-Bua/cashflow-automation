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
  const items = d.reconItems.filter((r) => filter === "all" || (filter === "matched" ? r.status === "matched" : r.status !== "matched"));
  const counts = {
    matched: d.reconItems.filter((r) => r.status === "matched").length,
    unmatched: d.reconItems.filter((r) => r.status !== "matched").length,
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
                  {r.status === "matched" ? <Ic name="check" size={14} style={{ color: "var(--success)" }} /> :
                    r.status === "needs-review" ? <Ic name="alert" size={14} style={{ color: "var(--warning)" }} /> :
                      <Ic name="arrowRight" size={14} />}
                </td>
                <td className="num small">{r.gl?.date.slice(5) || <span className="faint">—</span>}</td>
                <td className="small">{r.gl?.desc || <span className="faint">ไม่พบใน GL</span>}{r.gl && <div className="tiny faint">{r.gl.account}</div>}</td>
                <td className={"num " + (r.gl?.amount > 0 ? "pos" : r.gl?.amount < 0 ? "neg" : "")}>{r.gl ? window.fmtTHB(r.gl.amount) : "—"}</td>
                <td>
                  {r.status === "matched" && <span className="tag success"><span className="dot" />Matched</span>}
                  {r.status === "unmatched-bank" && <span className="tag warning"><span className="dot" />Bank Only</span>}
                  {r.status === "unmatched-gl" && <span className="tag warning"><span className="dot" />GL Only</span>}
                  {r.status === "needs-review" && <span className="tag danger"><span className="dot" />Review</span>}
                </td>
                <td>
                  {r.status === "matched"
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
  const [tab, setTab] = React.useState("categories");
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">ตั้งค่าระบบ การจัดประเภท GL Mapping และผู้ใช้งาน</p>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab " + (tab === "categories" ? "active" : "")} onClick={() => setTab("categories")}>หมวดหมู่ Cash Flow</button>
        <button className={"tab " + (tab === "cfmap" ? "active" : "")} onClick={() => setTab("cfmap")}>Cash Flow Mapping</button>
        <button className={"tab " + (tab === "mapping" ? "active" : "")} onClick={() => setTab("mapping")}>GL Mapping</button>
        <button className={"tab " + (tab === "company" ? "active" : "")} onClick={() => setTab("company")}>บริษัท</button>
        <button className={"tab " + (tab === "users" ? "active" : "")} onClick={() => setTab("users")}>ผู้ใช้งาน</button>
        <button className={"tab " + (tab === "integrations" ? "active" : "")} onClick={() => setTab("integrations")}>การเชื่อมต่อ</button>
      </div>

      {tab === "cfmap" && <CFMappingTab toast={toast} />}

      {tab === "categories" && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">หมวดหมู่ Cash Flow Categories</div>
            <div className="grow" />
            <button className="btn sm"><Ic name="plus" size={12} /> เพิ่มหมวดหมู่</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>รหัส</th><th>ชื่อหมวดหมู่</th><th>กิจกรรม</th><th>ทิศทาง</th><th>GL ที่ผูก</th><th></th></tr>
            </thead>
            <tbody>
              {d.categories.map((c) => (
                <tr key={c.code}>
                  <td className="mono small">{c.code}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className="tag accent">{c.method}</span></td>
                  <td>{c.direction === "in" ? <span className="tag success">รับ</span> : <span className="tag danger">จ่าย</span>}</td>
                  <td className="mono small">{c.gl}</td>
                  <td><button className="iconbtn"><Ic name="edit" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "mapping" && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">GL Account → Cash Flow Mapping</div>
            <div className="grow" />
            <button className="btn sm"><Ic name="sparkles" size={12} /> Auto-map</button>
          </div>
          <table className="tbl">
            <thead><tr><th>GL Code</th><th>ชื่อบัญชี</th><th>ประเภท</th><th>Cash Flow Section</th><th>หมวดหมู่</th><th></th></tr></thead>
            <tbody>
              {d.glAccounts.slice(0, 14).map((g) => (
                <tr key={g.code}>
                  <td className="mono small">{g.code}</td>
                  <td>{g.name}</td>
                  <td><TypeTag t={g.type} /></td>
                  <td>
                    <select className="select" style={{ height: 26, fontSize: 12 }}>
                      <option>ดำเนินงาน</option><option>ลงทุน</option><option>จัดหาเงิน</option><option>ปรับปรุง (Non-cash)</option><option>ไม่ใช่กระแสเงินสด</option>
                    </select>
                  </td>
                  <td className="muted small">{d.categories[Math.floor(Math.random() * d.categories.length)].name}</td>
                  <td><button className="iconbtn"><Ic name="more" size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "company" && (
        <div className="card card-pad" style={{ maxWidth: 720 }}>
          <div className="form-grid">
            <label className="field full">ชื่อบริษัท<input className="input" defaultValue={d.company.name} /></label>
            <label className="field">รหัสย่อ<input className="input" defaultValue={d.company.short} /></label>
            <label className="field">สกุลเงินหลัก<select className="select"><option>THB - บาทไทย</option><option>USD</option><option>EUR</option><option>JPY</option><option>CNY</option></select></label>
            <label className="field">รอบบัญชี<select className="select"><option>1 ม.ค. – 31 ธ.ค.</option><option>1 เม.ย. – 31 มี.ค.</option><option>1 ก.ค. – 30 มิ.ย.</option></select></label>
            <label className="field">เลขประจำตัวผู้เสียภาษี<input className="input" defaultValue="0107542000XXX" /></label>
            <label className="field full">ที่อยู่<textarea defaultValue={"เลขที่ 1 อาคาร TIH ชั้น 28\nถนนสาทรเหนือ แขวงสีลม เขตบางรัก\nกรุงเทพมหานคร 10500"} /></label>
          </div>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn">ยกเลิก</button>
            <button className="btn primary" onClick={() => toast("บันทึกการตั้งค่าสำเร็จ")}>บันทึก</button>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card">
          <table className="tbl">
            <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>หน่วยงาน</th><th>เข้าใช้งานล่าสุด</th><th></th></tr></thead>
            <tbody>
              {[
                { n: "ปริญญา สวัสดิ์โสภณ", e: "parinya.s@tih.co.th", r: "CFO / Admin", u: "Finance", t: "2026-03-31 15:42" },
                { n: "รดา มงคลเกียรติ", e: "rada.m@tih.co.th", r: "Treasury Manager", u: "Finance", t: "2026-03-31 11:22" },
                { n: "ธนวรรธน์ คงวรรณ", e: "thanawat.k@tih.co.th", r: "Accountant", u: "Accounting", t: "2026-03-31 09:14" },
                { n: "พิชญา ตรีรัตน์", e: "phichaya.t@tih.co.th", r: "Approver", u: "Finance", t: "2026-03-30 18:02" },
                { n: "สุทธิพงศ์ บูรพา", e: "suttiphong.b@tih.co.th", r: "Viewer", u: "Internal Audit", t: "2026-03-28 14:51" },
              ].map((u, i) => (
                <tr key={i}>
                  <td><div className="row" style={{ gap: 10 }}><div className="sb-avatar" style={{ width: 28, height: 28 }}>{u.n[0]}</div><div style={{ fontWeight: 500 }}>{u.n}</div></div></td>
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
      )}

      {tab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[
            { n: "ERP ภายในองค์กร", s: "เชื่อมต่อแล้ว", k: "1,420 รายการ/วัน", on: true },
            { n: "Bank Connectivity Service", s: "เชื่อมต่อแล้ว", k: "5 บัญชี", on: true },
            { n: "FlowAccount", s: "ยังไม่ได้เชื่อมต่อ", k: "—", on: false },
            { n: "Power BI Connector", s: "เชื่อมต่อแล้ว", k: "API key — สร้างเมื่อ 12 ม.ค.", on: true },
            { n: "Email Notification", s: "เชื่อมต่อแล้ว", k: "SMTP – treasury@tih.co.th", on: true },
            { n: "LINE Notify (Alert)", s: "ยังไม่ได้เชื่อมต่อ", k: "—", on: false },
          ].map((i, idx) => (
            <div key={idx} className="card card-pad" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: i.on ? "var(--accent-soft)" : "var(--bg-hover)", color: i.on ? "var(--accent-text)" : "var(--text-tertiary)", display: "grid", placeItems: "center" }}>
                <Ic name="link" size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{i.n}</div>
                <div className="small muted">{i.k}</div>
              </div>
              {i.on
                ? <span className="tag success"><span className="dot" />Active</span>
                : <button className="btn sm">เชื่อมต่อ</button>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ----- CF Mapping tab (Settings) — upload-based ----- */
function CFMappingTab({ toast }) {
  const d = window.CFData;
  const [mapping, setMapping] = React.useState(d.cfMapping);
  const [showUpload, setShowUpload] = React.useState(false);
  const [history, setHistory] = React.useState([
    { id: "MAP-2026-003", name: "CF_Mapping_Q1_2026_v3.xlsx", by: "K. ปริญญา ส.", at: "2026-03-28 14:32", rows: 32, status: "active" },
    { id: "MAP-2026-002", name: "CF_Mapping_Q1_2026_v2.xlsx", by: "K. ปริญญา ส.", at: "2026-02-15 10:18", rows: 28, status: "archived" },
    { id: "MAP-2026-001", name: "CF_Mapping_Initial.xlsx",   by: "K. รดา ม.",     at: "2026-01-08 09:45", rows: 24, status: "archived" },
  ]);

  React.useEffect(() => { d.cfMapping = mapping; }, [mapping]);

  // Build flat preview rows from current mapping, grouped by activity
  const activityFor = (label) => {
    if (["ซื้อที่ดิน อาคารและอุปกรณ์","ขายสินทรัพย์ถาวร","เงินลงทุนระยะสั้น (เพิ่ม)/ลด","เงินปันผลรับจากเงินลงทุน"].includes(label)) return "Investing";
    if (["เงินกู้ระยะสั้นเพิ่มขึ้น/(ลดลง)","เงินกู้ระยะยาว – รับ","เงินกู้ระยะยาว – ชำระคืน","จ่ายเงินปันผล"].includes(label)) return "Financing";
    return "Operating";
  };
  const activityColor = (a) => a === "Operating" ? "#2A6FF0" : a === "Investing" ? "#C97A00" : "#7C4DFF";

  // Flatten mapping into rows for table view
  const rows = [];
  Object.entries(mapping).forEach(([label, m]) => {
    const activity = activityFor(label);
    if (m.type === "expense") {
      (m.expenseSegments || []).forEach(sid => {
        const ex = d.expenseSegments.find(x => x.id === sid);
        rows.push({ activity, label, type: "expense", entity: "*", segmentId: sid, segmentName: ex?.name || sid, group: ex?.group || "—" });
      });
    } else {
      Object.entries(m.incomeSegments || {}).forEach(([entity, segs]) => {
        (segs || []).forEach(sid => {
          rows.push({ activity, label, type: "income", entity, segmentId: sid, segmentName: d.getSegmentName(entity, sid, "in"), group: "INC" });
        });
      });
    }
  });

  // Counts
  const counts = {
    lines: Object.keys(mapping).length,
    income: rows.filter(r => r.type === "income").length,
    expense: rows.filter(r => r.type === "expense").length,
    total: rows.length,
  };

  // Group rows by activity for display
  const groupedByActivity = rows.reduce((acc, r) => {
    (acc[r.activity] = acc[r.activity] || []).push(r);
    return acc;
  }, {});

  const downloadTemplate = () => {
    toast && toast("ดาวน์โหลด Template: CF_Mapping_Template.xlsx");
  };

  const onUploadDone = (newMapping, fileName) => {
    if (newMapping) setMapping(newMapping);
    const id = "MAP-2026-" + String(history.length + 4).padStart(3, "0");
    setHistory(h => [
      { id, name: fileName, by: "K. ปริญญา ส.", at: "2026-05-17 10:00", rows: rows.length, status: "active" },
      ...h.map(x => ({ ...x, status: "archived" })),
    ]);
    setShowUpload(false);
    toast && toast("อัปเดต CF Mapping จากไฟล์ " + fileName + " สำเร็จ");
  };

  return (
    <>
      {/* Info banner */}
      <div className="card" style={{ marginBottom: 14, padding: 14, background: "var(--accent-soft)", border: "1px solid var(--accent-soft-strong)" }}>
        <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
          <Ic name="sparkles" size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "var(--accent-text)", marginBottom: 2 }}>นำเข้าไฟล์ Mapping สำหรับ Cash Flow</div>
            <div className="small" style={{ color: "var(--text-secondary)" }}>
              อัปโหลดไฟล์ Excel/CSV เพื่อกำหนดความสัมพันธ์ระหว่าง <strong>Segment → ประเภทกิจกรรม → รายการในงบฯ</strong><br />
              ระบบจะจัดกลุ่ม Segment อัตโนมัติตาม Activity (Operating / Investing / Financing) และ Group (Income / F1 / I1 / O1–O6)
            </div>
          </div>
        </div>
      </div>

      {/* Status + Actions */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <MiniStat label="รายการที่ Map แล้ว" value={counts.lines} raw />
        <MiniStat label="Segment รายรับ" value={counts.income} raw color="var(--success)" />
        <MiniStat label="Segment รายจ่าย" value={counts.expense} raw color="var(--danger)" />
        <MiniStat label="แถวรวมในไฟล์" value={counts.total} raw accent />
      </div>

      {/* Upload card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div>
            <div className="card-title">นำเข้าไฟล์ CF Mapping</div>
            <div className="card-sub">รองรับ Excel (.xlsx) และ CSV — มีคอลัมน์มาตรฐานสำหรับ Activity / Group / Segment</div>
          </div>
          <div className="grow" />
          <button className="btn sm" onClick={downloadTemplate}><Ic name="download" size={13} /> ดาวน์โหลด Template</button>
          <button className="btn sm primary" onClick={() => setShowUpload(true)}><Ic name="upload" size={13} /> อัปโหลดไฟล์</button>
        </div>
        <div className="card-pad">
          <div className="row" style={{ gap: 14, alignItems: "stretch" }}>
            {/* Template columns */}
            <div style={{ flex: 1, padding: 14, background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div className="small" style={{ fontWeight: 600, marginBottom: 8 }}>คอลัมน์ที่ระบบรองรับ</div>
              <div className="col" style={{ gap: 6, fontSize: 12 }}>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Activity</span><span className="muted">Operating / Investing / Financing</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>CF_Line</span><span className="muted">ชื่อบรรทัดในงบกระแสเงินสด</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Type</span><span className="muted">Income / Expense</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Group</span><span className="muted">INC / F1 / I1 / O1–O6</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Entity</span><span className="muted">ACG / HMW / CLIK / * (รายจ่ายร่วม)</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Segment_ID</span><span className="muted">เช่น HONDA, TOK, F1, O1</span></div>
                <div className="row"><span className="mono small" style={{ minWidth: 110, color: "var(--accent-text)" }}>Segment_Name</span><span className="muted">ชื่อแสดงผลของ segment</span></div>
              </div>
            </div>
            {/* Sample row */}
            <div style={{ flex: 1.4, padding: 14, background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)", overflow: "auto" }}>
              <div className="small" style={{ fontWeight: 600, marginBottom: 8 }}>ตัวอย่างข้อมูล</div>
              <table className="tbl" style={{ fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "4px 8px" }}>Activity</th>
                    <th style={{ padding: "4px 8px" }}>CF_Line</th>
                    <th style={{ padding: "4px 8px" }}>Type</th>
                    <th style={{ padding: "4px 8px" }}>Group</th>
                    <th style={{ padding: "4px 8px" }}>Entity</th>
                    <th style={{ padding: "4px 8px" }}>Segment_ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: "4px 8px" }}>Operating</td><td style={{ padding: "4px 8px" }}>เงินสดรับจากการขาย…</td><td style={{ padding: "4px 8px" }}>Income</td><td style={{ padding: "4px 8px" }}>INC</td><td style={{ padding: "4px 8px" }}>HMW</td><td className="mono" style={{ padding: "4px 8px" }}>HONDA</td></tr>
                  <tr><td style={{ padding: "4px 8px" }}>Operating</td><td style={{ padding: "4px 8px" }}>เงินสดจ่ายดอกเบี้ย</td><td style={{ padding: "4px 8px" }}>Expense</td><td style={{ padding: "4px 8px" }}>F1</td><td style={{ padding: "4px 8px" }}>*</td><td className="mono" style={{ padding: "4px 8px" }}>F1</td></tr>
                  <tr><td style={{ padding: "4px 8px" }}>Investing</td><td style={{ padding: "4px 8px" }}>ซื้อที่ดิน อาคาร…</td><td style={{ padding: "4px 8px" }}>Expense</td><td style={{ padding: "4px 8px" }}>I1</td><td style={{ padding: "4px 8px" }}>*</td><td className="mono" style={{ padding: "4px 8px" }}>I1</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Current mapping — read-only grouped view */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <div>
            <div className="card-title">Mapping ปัจจุบัน (จัดกลุ่มตาม Activity / Group)</div>
            <div className="card-sub">{counts.total} แถว • {counts.lines} CF lines</div>
          </div>
          <div className="grow" />
          <div className="legend">
            <span><span className="sw" style={{ background: "#2A6FF0" }} />Operating</span>
            <span><span className="sw" style={{ background: "#C97A00" }} />Investing</span>
            <span><span className="sw" style={{ background: "#7C4DFF" }} />Financing</span>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Activity</th>
              <th>CF Line</th>
              <th style={{ width: 80 }}>Type</th>
              <th style={{ width: 80 }}>Group</th>
              <th style={{ width: 70 }}>Entity</th>
              <th style={{ width: 110 }}>Segment ID</th>
              <th>Segment Name</th>
            </tr>
          </thead>
          <tbody>
            {["Operating", "Investing", "Financing"].map(act => {
              const grp = groupedByActivity[act] || [];
              if (grp.length === 0) return null;
              return (
                <React.Fragment key={act}>
                  <tr style={{ background: "var(--bg-subtle)" }}>
                    <td colSpan="7" style={{ fontWeight: 600, fontSize: 12 }}>
                      <span className="row" style={{ gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: activityColor(act) }} />
                        {act} Activities ({grp.length} แถว)
                      </span>
                    </td>
                  </tr>
                  {grp.map((r, i) => (
                    <tr key={act + "-" + i}>
                      <td><span className="tag" style={{ background: activityColor(r.activity) + "1f", color: activityColor(r.activity) }}>{r.activity}</span></td>
                      <td>{r.label}</td>
                      <td>{r.type === "income"
                        ? <span className="tag success">Income</span>
                        : <span className="tag danger">Expense</span>}
                      </td>
                      <td><span className="tag segment-tag mono" style={{ fontSize: 10.5 }}>{r.group}</span></td>
                      <td>{r.entity === "*" ? <span className="faint mono small">*</span> : <EntityChip entity={r.entity} />}</td>
                      <td className="mono small">{r.segmentId}</td>
                      <td>{r.segmentName}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload history */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">ประวัติการอัปโหลด Mapping</div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>เลขที่</th>
              <th>ชื่อไฟล์</th>
              <th>ผู้อัปโหลด</th>
              <th>วันที่/เวลา</th>
              <th className="num">จำนวนแถว</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td className="mono small">{h.id}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Ic name="fileExcel" size={16} style={{ color: "#1F9D55" }} />
                    <span style={{ fontWeight: 500 }}>{h.name}</span>
                  </div>
                </td>
                <td>{h.by}</td>
                <td className="num small muted">{h.at}</td>
                <td className="num">{h.rows}</td>
                <td>
                  {h.status === "active"
                    ? <span className="tag success"><span className="dot" />ใช้งานอยู่</span>
                    : <span className="tag">เก็บถาวร</span>}
                </td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn sm ghost" onClick={() => toast && toast("ดาวน์โหลด " + h.name)}><Ic name="download" size={12} /></button>
                    <button className="iconbtn"><Ic name="more" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpload && <CFMappingUploadModal onClose={() => setShowUpload(false)} onDone={onUploadDone} />}
    </>
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

window.Forecast = Forecast;
window.Reconciliation = Reconciliation;
window.ExportCenter = ExportCenter;
window.Settings = Settings;
