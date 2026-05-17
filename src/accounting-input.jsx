/* Accounting Input — GL / AR / AP / Inventory */

function AccountingInput({ toast, companyId = "CONSO" }) {
  const d = window.CFData;
  const [tab, setTab] = React.useState("gl");
  const [showImport, setShowImport] = React.useState(false);
  const activeCo = d.companies.find(c => c.id === companyId) || d.companies[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            ข้อมูลทางบัญชี
            <span className="co-chip" style={{ background: activeCo.color }}>{activeCo.short}</span>
          </h1>
          <p className="page-sub">ผังบัญชี (GL), ลูกหนี้, เจ้าหนี้ และสินค้าคงเหลือ • {companyId === "CONSO" ? "รวมทั้งกลุ่ม" : activeCo.name}</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setShowImport(true)}><Ic name="upload" size={14} /> นำเข้าจากระบบบัญชี</button>
          <button className="btn primary"><Ic name="plus" size={14} /> เพิ่มรายการ</button>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab " + (tab === "gl" ? "active" : "")} onClick={() => setTab("gl")}>Trial Balance</button>
        <button className={"tab " + (tab === "ar" ? "active" : "")} onClick={() => setTab("ar")}>ลูกหนี้ (AR)</button>
        <button className={"tab " + (tab === "ap" ? "active" : "")} onClick={() => setTab("ap")}>เจ้าหนี้ (AP)</button>
        <button className={"tab " + (tab === "inv" ? "active" : "")} onClick={() => setTab("inv")}>สินค้าคงเหลือ</button>
      </div>

      {tab === "gl" && <GLTab />}
      {tab === "ar" && <ARTab companyId={companyId} />}
      {tab === "ap" && <APTab companyId={companyId} />}
      {tab === "inv" && <InvTab />}

      {showImport && <ImportLedgerModal onClose={() => setShowImport(false)} onDone={() => {setShowImport(false);toast("นำเข้าข้อมูลจาก ERP สำเร็จ");}} />}
    </>);

}

function GLTab() {
  const d = window.CFData;
  // Mock GL balances
  const balances = {
    "1110": 28_400_000, "1120": 469_220_000, "1140": 235_400_000, "1150": 18_200_000,
    "1160": 139_422_800, "1210": 1_240_800_000, "2110": 144_500_000, "2120": 28_400_000,
    "2130": 42_100_000, "2210": 220_000_000, "2310": 480_000_000, "3110": 500_000_000,
    "3210": 686_640_800, "4110": 612_400_000, "4210": 53_300_000, "5110": 412_700_000,
    "5210": 38_900_000, "5220": 153_900_000, "5310": 38_700_000, "5410": 36_200_000, "5510": 48_700_000
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        <div className="search-wrap">
          <Ic name="search" size={14} className="search-ic" />
          <input className="input search" placeholder="ค้นหารหัสบัญชีหรือชื่อ…" style={{ width: 280 }} />
        </div>
        <select className="select"><option>ทุกประเภทบัญชี</option><option>Asset</option><option>Liability</option><option>Equity</option><option>Revenue</option><option>Expense</option></select>
        <select className="select"><option>งวด: มี.ค. 2026</option><option>ก.พ. 2026</option><option>ม.ค. 2026</option></select>
        <div className="grow" />
        <button className="btn sm"><Ic name="download" size={13} /> Export GL</button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>รหัส</th>
              <th>ชื่อบัญชี</th>
              <th>ประเภท</th>
              <th>การจัดประเภท CF</th>
              <th className="num">ยอดยกมา</th>
              <th className="num">เดบิตงวด</th>
              <th className="num">เครดิตงวด</th>
              <th className="num">ยอดยกไป</th>
            </tr>
          </thead>
          <tbody>
            {d.glAccounts.map((g) => {
              const bal = balances[g.code] || 0;
              const isExp = g.type === "Expense" || g.type === "Liability";
              const dr = isExp ? Math.round(bal * 0.6) : Math.round(bal * 0.3);
              const cr = isExp ? Math.round(bal * 0.55) : Math.round(bal * 0.32);
              const carry = Math.round(bal * 0.95);
              const cfMap = {
                "1110": "ดำเนินงาน", "1120": "ดำเนินงาน",
                "1140": "ดำเนินงาน (ลูกหนี้)", "1150": "ดำเนินงาน",
                "1160": "ดำเนินงาน (สินค้า)", "1210": "ลงทุน",
                "2110": "ดำเนินงาน (เจ้าหนี้)", "2120": "ดำเนินงาน",
                "2130": "ดำเนินงาน", "2210": "จัดหาเงิน", "2310": "จัดหาเงิน",
                "3110": "จัดหาเงิน", "3210": "จัดหาเงิน",
                "4110": "ดำเนินงาน", "4210": "ดำเนินงาน",
                "5110": "ดำเนินงาน", "5210": "ดำเนินงาน",
                "5220": "ดำเนินงาน", "5310": "ปรับปรุง (Non-cash)",
                "5410": "ดำเนินงาน", "5510": "ดำเนินงาน"
              };
              return (
                <tr key={g.code}>
                  <td className="mono small">{g.code}</td>
                  <td style={{ fontWeight: 500 }}>{g.name}</td>
                  <td><TypeTag t={g.type} /></td>
                  <td className="muted small">{cfMap[g.code]}</td>
                  <td className="num muted">{window.fmtTHB(carry)}</td>
                  <td className="num">{window.fmtTHB(dr)}</td>
                  <td className="num">{window.fmtTHB(cr)}</td>
                  <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(bal)}</td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </>);

}

function TypeTag({ t }) {
  const styles = {
    Asset: { background: "var(--accent-soft)", color: "var(--accent-text)" },
    Liability: { background: "var(--warning-soft)", color: "var(--warning)" },
    Equity: { background: "#EFE9FB", color: "#5B3DD0" },
    Revenue: { background: "var(--success-soft)", color: "var(--success)" },
    Expense: { background: "var(--danger-soft)", color: "var(--danger)" }
  };
  return <span className="tag" style={styles[t] || {}}>{t}</span>;
}

function ARTab({ companyId }) {
  const d = window.CFData;
  const arRows = d.arAging.filter(x => companyId === "CONSO" || !companyId || x.entity === companyId);
  const totals = arRows.reduce((s, x) => ({
    total: s.total + x.total, current: s.current + x.current,
    d30: s.d30 + x.d30, d60: s.d60 + x.d60, d90: s.d90 + x.d90, over: s.over + x.over
  }), { total: 0, current: 0, d30: 0, d60: 0, d90: 0, over: 0 });

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 14 }}>
        <Mini label="ลูกหนี้คงเหลือรวม" value={totals.total} accent />
        <Mini label="ภายในกำหนด" value={totals.current} color="var(--success)" />
        <Mini label="ค้าง 1–30 วัน" value={totals.d30} />
        <Mini label="ค้าง 31–60 วัน" value={totals.d60} color="var(--warning)" />
        <Mini label="ค้าง > 60 วัน" value={totals.d90 + totals.over} color="var(--danger)" />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">ลูกหนี้แยกตามอายุหนี้</div>
          <div className="grow" />
          <button className="btn sm"><Ic name="filter" size={13} /> ตัวกรอง</button>
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Entity</th>
              <th>ลูกค้า</th>
              <th className="num">ภายในกำหนด</th>
              <th className="num">1–30 วัน</th>
              <th className="num">31–60 วัน</th>
              <th className="num">61–90 วัน</th>
              <th className="num">เกิน 90 วัน</th>
              <th className="num">รวม</th>
              <th style={{ width: 130 }}>กระจาย</th>
            </tr>
          </thead>
          <tbody>
            {arRows.map((c) =>
            <tr key={c.customer}>
                <td><EntityChip entity={c.entity} /></td>
                <td style={{ fontWeight: 500 }}>{c.customer}</td>
                <td className="num">{window.fmtTHB(c.current)}</td>
                <td className="num">{window.fmtTHB(c.d30)}</td>
                <td className="num">{window.fmtTHB(c.d60)}</td>
                <td className="num warning">{c.d90 ? window.fmtTHB(c.d90) : "—"}</td>
                <td className="num neg">{c.over ? window.fmtTHB(c.over) : "—"}</td>
                <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(c.total)}</td>
                <td><AgingBar c={c} /></td>
              </tr>
            )}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td colSpan="2">รวม ({arRows.length} ราย)</td>
              <td className="num">{window.fmtTHB(totals.current)}</td>
              <td className="num">{window.fmtTHB(totals.d30)}</td>
              <td className="num">{window.fmtTHB(totals.d60)}</td>
              <td className="num">{window.fmtTHB(totals.d90)}</td>
              <td className="num">{window.fmtTHB(totals.over)}</td>
              <td className="num">{window.fmtTHB(totals.total)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>);

}

function AgingBar({ c }) {
  const parts = [
  { v: c.current, color: "#1F9D55" },
  { v: c.d30, color: "#9CB7EE" },
  { v: c.d60, color: "#C97A00" },
  { v: c.d90, color: "#E08989" },
  { v: c.over, color: "#D03434" }];

  return (
    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-hover)" }}>
      {parts.map((p, i) => p.v > 0 &&
      <div key={i} style={{ flex: p.v, background: p.color }} />
      )}
    </div>);

}

function APTab({ companyId }) {
  const d = window.CFData;
  const apRows = d.apAging.filter(x => companyId === "CONSO" || !companyId || x.entity === companyId);
  const totals = apRows.reduce((s, x) => ({
    total: s.total + x.total, current: s.current + x.current,
    d30: s.d30 + x.d30, d60: s.d60 + x.d60, d90: s.d90 + x.d90
  }), { total: 0, current: 0, d30: 0, d60: 0, d90: 0 });

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="เจ้าหนี้คงเหลือรวม" value={totals.total} accent />
        <Mini label="ยังไม่ครบกำหนด" value={totals.current} color="var(--success)" />
        <Mini label="ค้าง 1–60 วัน" value={totals.d30 + totals.d60} color="var(--warning)" />
        <Mini label="ค้าง > 60 วัน" value={totals.d90} color="var(--danger)" />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">เจ้าหนี้แยกตามอายุหนี้</div>
          <div className="grow" />
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Entity</th>
              <th>เจ้าหนี้ / ผู้จัดจำหน่าย</th>
              <th className="num">ยังไม่ครบกำหนด</th>
              <th className="num">1–30 วัน</th>
              <th className="num">31–60 วัน</th>
              <th className="num">เกิน 60 วัน</th>
              <th className="num">รวม</th>
              <th>กำหนดชำระถัดไป</th>
            </tr>
          </thead>
          <tbody>
            {apRows.map((v) =>
            <tr key={v.vendor}>
                <td><EntityChip entity={v.entity} /></td>
                <td style={{ fontWeight: 500 }}>{v.vendor}</td>
                <td className="num">{window.fmtTHB(v.current)}</td>
                <td className="num">{window.fmtTHB(v.d30)}</td>
                <td className="num warning">{v.d60 ? window.fmtTHB(v.d60) : "—"}</td>
                <td className="num neg">{v.d90 ? window.fmtTHB(v.d90) : "—"}</td>
                <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(v.total)}</td>
                <td className="muted small">5 เม.ย. 2026</td>
              </tr>
            )}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td colSpan="2">รวม ({apRows.length} ราย)</td>
              <td className="num">{window.fmtTHB(totals.current)}</td>
              <td className="num">{window.fmtTHB(totals.d30)}</td>
              <td className="num">{window.fmtTHB(totals.d60)}</td>
              <td className="num">{window.fmtTHB(totals.d90)}</td>
              <td className="num">{window.fmtTHB(totals.total)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>);

}

function InvTab() {
  const d = window.CFData;
  const total = d.inventory.reduce((s, x) => s + x.value, 0);
  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="มูลค่าสินค้าคงเหลือรวม" value={total} accent />
        <Mini label="วัตถุดิบ (RM)" value={89_138_000} />
        <Mini label="สินค้าระหว่างผลิต (WIP)" value={15_656_000} />
        <Mini label="สินค้าสำเร็จรูป (FG)" value={34_628_800} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">รายการสินค้าคงเหลือ</div>
          <div className="grow" />
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>SKU</th>
              <th>รายการ</th>
              <th>หน่วย</th>
              <th className="num">จำนวน</th>
              <th className="num">ราคาทุน/หน่วย</th>
              <th className="num">มูลค่ารวม</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {d.inventory.map((x) =>
            <tr key={x.sku}>
                <td className="mono small">{x.sku}</td>
                <td style={{ fontWeight: 500 }}>{x.name}</td>
                <td className="muted">{x.uom}</td>
                <td className="num">{x.qty.toLocaleString()}</td>
                <td className="num">{x.unit.toLocaleString()}</td>
                <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(x.value)}</td>
                <td>{x.sku.startsWith("RM") ? <span className="tag accent">RM</span> : x.sku.startsWith("WIP") ? <span className="tag warning">WIP</span> : <span className="tag success">FG</span>}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>);

}

function Mini({ label, value, color, accent }) {
  return (
    <div className="kpi" style={{ padding: "12px 14px", gap: 2 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: 20, color: accent ? "var(--accent)" : color || "var(--text)" }}>
        {window.fmtTHB(value)}
      </div>
    </div>);

}

function ImportLedgerModal({ onClose, onDone }) {
  const [source, setSource] = React.useState("erp-sap");
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">นำเข้าข้อมูลจากระบบบัญชี</div>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="small muted" style={{ marginBottom: 8 }}>เลือกระบบต้นทาง</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
            {[
            { id: "erp-sap", n: "ERP ภายในองค์กร" },
            { id: "express", n: "Express Accounting" },
            { id: "flowaccount", n: "FlowAccount" },
            { id: "excel", n: "Excel / CSV Template" },
            { id: "peak", n: "PEAK Account" },
            { id: "api", n: "API Endpoint (Custom)" }].
            map((s) =>
            <button key={s.id} className="card" style={{
              padding: 14, textAlign: "left", cursor: "pointer",
              borderColor: source === s.id ? "var(--accent)" : "var(--border)",
              background: source === s.id ? "var(--accent-soft)" : "var(--bg)"
            }} onClick={() => setSource(s.id)}>
                <div style={{ fontWeight: 500 }}>{s.n}</div>
                <div className="tiny faint" style={{ marginTop: 2 }}>{s.id === "excel" ? "อัปโหลดไฟล์" : "เชื่อมต่อระบบ"}</div>
              </button>
            )}
          </div>
          <div className="form-grid">
            <label className="field">งวดบัญชี<select className="select"><option>มี.ค. 2026</option><option>ก.พ. 2026</option><option>ม.ค. 2026</option></select></label>
            <label className="field">ประเภทข้อมูล
              <select className="select"><option>General Ledger (เต็ม)</option><option>เฉพาะลูกหนี้ (AR)</option><option>เฉพาะเจ้าหนี้ (AP)</option><option>สินค้าคงเหลือ</option></select>
            </label>
            <label className="field full"><span className="row" style={{ gap: 6 }}><input type="checkbox" defaultChecked />อัปเดต Mapping CF อัตโนมัติตามรหัส GL ที่ตั้งไว้</span></label>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" onClick={onDone}>เริ่มนำเข้า</button>
        </div>
      </div>
    </div>);

}

window.AccountingInput = AccountingInput;
window.TypeTag = TypeTag;
window.MiniKpi = Mini;