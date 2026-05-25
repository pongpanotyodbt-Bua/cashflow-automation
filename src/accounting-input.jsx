/* Accounting Input — GL / AR / AP / Inventory */

function AccountingInput({ toast, companyId = "CONSO" }) {
  const d = window.CFData;
  const [tab, setTab] = React.useState("gl");
  const [showImport, setShowImport] = React.useState(false);
  const [glData, setGlData] = React.useState(window.glImported || null);
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

      {tab === "gl" && <GLTab glData={glData} onClear={() => { window.glImported = null; setGlData(null); }} />}
      {tab === "ar" && <ARTab companyId={companyId} />}
      {tab === "ap" && <APTab companyId={companyId} />}
      {tab === "inv" && <InvTab />}

      {showImport && <ImportLedgerModal onClose={() => setShowImport(false)} onDone={(rows) => {
        window.glImported = rows;
        setGlData(rows);
        setShowImport(false);
        toast(`นำเข้า GL สำเร็จ ${rows.length.toLocaleString()} รายการ`);
      }} />}
    </>);

}

function GLTab({ glData, onClear }) {
  const d = window.CFData;
  const [search, setSearch] = React.useState("");

  // ── Imported GL data from Business Central ──
  if (glData && glData.length > 0) {
    const byAccount = {};
    glData.forEach(r => {
      if (!r.glAccount) return;
      if (!byAccount[r.glAccount]) {
        byAccount[r.glAccount] = { code: r.glAccount, description: r.description, debit: 0, credit: 0, entries: 0 };
      }
      byAccount[r.glAccount].debit += r.debit;
      byAccount[r.glAccount].credit += r.credit;
      byAccount[r.glAccount].entries++;
    });
    let rows = Object.values(byAccount).sort((a, b) => a.code.localeCompare(b.code));
    if (search) rows = rows.filter(r => r.code.includes(search) || r.description.toLowerCase().includes(search.toLowerCase()));
    const totDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totCredit = rows.reduce((s, r) => s + r.credit, 0);

    return (
      <>
        <div style={{ background: "var(--success-soft)", border: "1px solid var(--success)", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "var(--success)", display: "flex", alignItems: "center", gap: 8 }}>
          <Ic name="check" size={14} />
          <span>ข้อมูล GL จาก Business Central — {glData.length.toLocaleString()} รายการ • {rows.length} GL accounts</span>
          <button className="btn sm" style={{ marginLeft: "auto" }} onClick={onClear}>ล้างข้อมูล</button>
        </div>
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="search-wrap">
            <Ic name="search" size={14} className="search-ic" />
            <input className="input search" placeholder="ค้นหารหัสหรือชื่อบัญชี…" style={{ width: 280 }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grow" />
          <button className="btn sm"><Ic name="download" size={13} /> Export GL</button>
        </div>
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>รหัส GL</th>
                <th>ชื่อบัญชี / รายละเอียด</th>
                <th className="num">รายการ</th>
                <th className="num">รวมเดบิต</th>
                <th className="num">รวมเครดิต</th>
                <th className="num">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code}>
                  <td className="mono small">{r.code}</td>
                  <td style={{ fontWeight: 500 }}>{r.description}</td>
                  <td className="num muted small">{r.entries.toLocaleString()}</td>
                  <td className="num">{window.fmtTHB(r.debit)}</td>
                  <td className="num neg">{window.fmtTHB(r.credit)}</td>
                  <td className="num" style={{ fontWeight: 600, color: r.debit - r.credit >= 0 ? "var(--success)" : "var(--danger)" }}>{window.fmtTHB(r.debit - r.credit)}</td>
                </tr>
              ))}
              <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
                <td colSpan="3">รวม ({rows.length} accounts)</td>
                <td className="num">{window.fmtTHB(totDebit)}</td>
                <td className="num neg">{window.fmtTHB(totCredit)}</td>
                <td className="num">{window.fmtTHB(totDebit - totCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // ── Mock GL data (default) ──
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

// ── Business Central GL column mapping ──
const BC_GL_COLUMNS = {
  postingDate: ["Posting Date"],
  glAccount:   ["G/L Account No.", "G/L Account No"],
  description: ["Description"],
  description2:["Description 2"],
  amount:      ["Amount"],
  documentType:["Document Type"],
  documentNo:  ["Document No.", "Document No"],
  genPostingType: ["Gen. Posting Type"],
  customerNo:  ["Cutomer No", "Customer No.", "Customer No"],
  customerName:["Cutomer Name", "Customer Name"],
  vendorName:  ["Vendor Name"],
  departmentCode: ["Department Code"],
  entryNo:     ["Entry No.", "Entry No"],
};

function findColIndex(headers, aliases) {
  for (const alias of aliases) {
    const idx = headers.findIndex(h => h && h.toString().trim() === alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseGLExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
  if (raw.length < 2) return { rows: [], colMap: {} };

  const headers = raw[0];
  const colMap = {};
  for (const [key, aliases] of Object.entries(BC_GL_COLUMNS)) {
    const idx = findColIndex(headers, aliases);
    if (idx !== -1) colMap[key] = idx;
  }

  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    const acct = colMap.glAccount !== undefined ? r[colMap.glAccount] : "";
    if (!acct || acct.toString().trim() === "") continue;
    const amt = parseFloat((r[colMap.amount] || "0").toString().replace(/,/g, "")) || 0;
    rows.push({
      postingDate:    colMap.postingDate  !== undefined ? r[colMap.postingDate]  : "",
      glAccount:      acct.toString().trim(),
      description:    colMap.description  !== undefined ? r[colMap.description]  : "",
      description2:   colMap.description2 !== undefined ? r[colMap.description2] : "",
      amount:         amt,
      debit:          amt > 0 ? amt : 0,
      credit:         amt < 0 ? Math.abs(amt) : 0,
      documentType:   colMap.documentType !== undefined ? r[colMap.documentType] : "",
      documentNo:     colMap.documentNo   !== undefined ? r[colMap.documentNo]   : "",
      genPostingType: colMap.genPostingType !== undefined ? r[colMap.genPostingType] : "",
      customerNo:     colMap.customerNo   !== undefined ? r[colMap.customerNo]   : "",
      customerName:   colMap.customerName !== undefined ? r[colMap.customerName] : "",
      vendorName:     colMap.vendorName   !== undefined ? r[colMap.vendorName]   : "",
      departmentCode: colMap.departmentCode !== undefined ? r[colMap.departmentCode] : "",
      entryNo:        colMap.entryNo      !== undefined ? r[colMap.entryNo]      : "",
    });
  }
  return { rows, colMap };
}

function ImportLedgerModal({ onClose, onDone }) {
  const [source, setSource] = React.useState("bc");
  const [step, setStep] = React.useState(1);
  const [fileName, setFileName] = React.useState("");
  const [parsed, setParsed] = React.useState(null);
  const [error, setError] = React.useState("");
  const fileRef = React.useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = parseGLExcel(e.target.result);
        if (result.rows.length === 0) { setError("ไม่พบข้อมูลในไฟล์ หรือ format ไม่ถูกต้อง — ตรวจสอบว่ามี column: Posting Date, G/L Account No., Amount"); return; }
        setParsed(result);
        setStep(2);
      } catch (err) { setError("อ่านไฟล์ไม่ได้: " + err.message); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => onDone(parsed.rows), 400);
  };

  const stats = parsed ? {
    totalRows:  parsed.rows.length,
    glAccounts: [...new Set(parsed.rows.map(r => r.glAccount))].length,
    totalDebit: parsed.rows.reduce((s, r) => s + r.debit, 0),
    totalCredit: parsed.rows.reduce((s, r) => s + r.credit, 0),
    dateMin: parsed.rows.map(r => r.postingDate).filter(Boolean).sort()[0] || "—",
    dateMax: parsed.rows.map(r => r.postingDate).filter(Boolean).sort().slice(-1)[0] || "—",
  } : null;

  const sources = [
    { id: "bc",          n: "Business Central (D365)", sub: "Excel GL Entries export" },
    { id: "express",     n: "Express Accounting",      sub: "เชื่อมต่อระบบ" },
    { id: "flowaccount", n: "FlowAccount",             sub: "เชื่อมต่อระบบ" },
    { id: "peak",        n: "PEAK Account",            sub: "เชื่อมต่อระบบ" },
    { id: "excel",       n: "Excel / CSV ทั่วไป",       sub: "อัปโหลดไฟล์" },
    { id: "api",         n: "API Endpoint (Custom)",   sub: "เชื่อมต่อระบบ" },
  ];
  const canUpload = source === "bc" || source === "excel";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">นำเข้าข้อมูล GL จากระบบบัญชี</div>
          <span className="tag" style={{ marginLeft: 10 }}>ขั้นตอน {step}/3</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">

          {step === 1 && (
            <>
              <div className="small muted" style={{ marginBottom: 8 }}>เลือกระบบต้นทาง</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
                {sources.map((s) => (
                  <button key={s.id} className="card" style={{ padding: 14, textAlign: "left", cursor: "pointer", borderColor: source === s.id ? "var(--accent)" : "var(--border)", background: source === s.id ? "var(--accent-soft)" : "var(--bg)" }} onClick={() => setSource(s.id)}>
                    <div style={{ fontWeight: 500 }}>{s.n}</div>
                    <div className="tiny faint" style={{ marginTop: 2 }}>{s.sub}</div>
                  </button>
                ))}
              </div>
              {canUpload && (
                <div style={{ border: "1.5px dashed var(--border-strong)", borderRadius: 10, padding: 38, textAlign: "center", background: "var(--bg-subtle)", cursor: "pointer" }}
                  onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current.click()}>
                  <Ic name="upload" size={24} style={{ color: "var(--text-tertiary)" }} />
                  <div style={{ marginTop: 8, fontWeight: 500 }}>ลากไฟล์มาวาง หรือ คลิกเลือกไฟล์</div>
                  <div className="small muted" style={{ marginTop: 4 }}>รองรับ .xlsx — General Ledger Entries จาก Business Central</div>
                  <button className="btn primary" style={{ marginTop: 14 }} onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>เลือกไฟล์</button>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              )}
              {error && <div style={{ color: "var(--danger)", marginTop: 10, fontSize: 13 }}>{error}</div>}
              <div className="small muted" style={{ marginTop: 12 }}>
                <strong>Columns ที่ต้องการ:</strong> <code>Posting Date</code> · <code>G/L Account No.</code> · <code>Description</code> · <code>Amount</code> (ลำดับคอลัมน์ไม่สำคัญ)
              </div>
            </>
          )}

          {step === 2 && parsed && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                <div className="kpi" style={{ padding: "10px 14px" }}><div className="kpi-label">รายการทั้งหมด</div><div className="kpi-value" style={{ fontSize: 20 }}>{stats.totalRows.toLocaleString()}</div></div>
                <div className="kpi" style={{ padding: "10px 14px" }}><div className="kpi-label">รหัส GL</div><div className="kpi-value" style={{ fontSize: 20 }}>{stats.glAccounts}</div></div>
                <div className="kpi" style={{ padding: "10px 14px" }}><div className="kpi-label">รวมเดบิต</div><div className="kpi-value" style={{ fontSize: 20, color: "var(--success)" }}>{window.fmtTHB(stats.totalDebit)}</div></div>
                <div className="kpi" style={{ padding: "10px 14px" }}><div className="kpi-label">รวมเครดิต</div><div className="kpi-value" style={{ fontSize: 20, color: "var(--danger)" }}>{window.fmtTHB(stats.totalCredit)}</div></div>
              </div>
              <div className="small muted" style={{ marginBottom: 8 }}>ตัวอย่างข้อมูล (10 รายการแรก) · ช่วงเวลา: {stats.dateMin} — {stats.dateMax} · ไฟล์: {fileName}</div>
              <div style={{ overflowX: "auto", maxHeight: 240, overflowY: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Posting Date</th><th>GL Account</th><th>Description</th><th>Doc Type</th><th className="num">Debit</th><th className="num">Credit</th><th>Dept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="mono small">{r.postingDate}</td>
                        <td className="mono small">{r.glAccount}</td>
                        <td className="small">{r.description}</td>
                        <td className="small muted">{r.documentType}</td>
                        <td className="num small">{r.debit > 0 ? window.fmtTHB(r.debit) : "—"}</td>
                        <td className="num small neg">{r.credit > 0 ? window.fmtTHB(r.credit) : "—"}</td>
                        <td className="small muted">{r.departmentCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "inline-grid", placeItems: "center", marginBottom: 12 }}>
                <Ic name="check" size={26} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>นำเข้าสำเร็จ</div>
              <div className="muted" style={{ marginTop: 4 }}>{stats?.totalRows.toLocaleString()} รายการ · {stats?.glAccounts} GL accounts</div>
            </div>
          )}

        </div>
        <div className="modal-foot">
          {step === 1 && <button className="btn" onClick={onClose}>ยกเลิก</button>}
          {step === 2 && <>
            <button className="btn" onClick={() => { setParsed(null); setStep(1); }}>← เลือกใหม่</button>
            <button className="btn primary" onClick={handleConfirm}>นำเข้า {stats?.totalRows.toLocaleString()} รายการ →</button>
          </>}
        </div>
      </div>
    </div>
  );
}

window.AccountingInput = AccountingInput;
window.TypeTag = TypeTag;
window.MiniKpi = Mini;