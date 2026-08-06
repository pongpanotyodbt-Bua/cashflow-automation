/* Finance Input — Bank / Receipts / Payments */

function FinanceInput({ toast, companyId = "CONSO" }) {
  const d = window.CFData;
  const [tab, setTab] = React.useState("bank");
  const [showAdd, setShowAdd] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filter by entity (from selector at top of app)
  const matchEntity = (r) => companyId === "CONSO" || !companyId || r.entity === companyId;
  const filtered = (rows, keys) => rows
    .filter(matchEntity)
    .filter((r) => !search || keys.some((k) => (r[k] || "").toString().toLowerCase().includes(search.toLowerCase())));

  const activeCo = d.companies.find(c => c.id === companyId) || d.companies[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            ข้อมูลทางการเงิน
            <span className="co-chip" style={{ background: activeCo.color }}>{activeCo.short}</span>
          </h1>
          <p className="page-sub">รายการรับ–จ่าย เงินฝากธนาคาร และรายการเงินสด • {companyId === "CONSO" ? "รวมทั้งกลุ่ม" : activeCo.name}</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => setShowUpload(true)}><Ic name="upload" size={14} /> นำเข้า Bank Statement</button>
          <button className="btn primary" onClick={() => setShowAdd(true)}><Ic name="plus" size={14} /> เพิ่มรายการใหม่</button>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab " + (tab === "bank" ? "active" : "")} onClick={() => setTab("bank")}>บัญชีธนาคาร</button>
        <button className={"tab " + (tab === "receipts" ? "active" : "")} onClick={() => setTab("receipts")}>เงินรับ (Receipts)</button>
        <button className={"tab " + (tab === "payments" ? "active" : "")} onClick={() => setTab("payments")}>เงินจ่าย (Payments)</button>
        <button className={"tab " + (tab === "honda" ? "active" : "")} onClick={() => setTab("honda")}>AP HONDA Payment</button>
        <button className={"tab " + (tab === "pn" ? "active" : "")} onClick={() => setTab("pn")}>PN Payment</button>
        <button className={"tab " + (tab === "reconAR" ? "active" : "")} onClick={() => setTab("reconAR")}>Reconcile AR</button>
        <button className={"tab " + (tab === "reconAP" ? "active" : "")} onClick={() => setTab("reconAP")}>Reconcile AP</button>
      </div>

      <div className="row" style={{ marginBottom: 14, gap: 10 }}>
        <div className="search-wrap">
          <Ic name="search" size={14} className="search-ic" />
          <input className="input search" placeholder="ค้นหารายการ…" style={{ width: 280 }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select"><option>ทุกบัญชี</option>{d.bankAccounts.filter(matchEntity).map((b) => <option key={b.id}>{b.id} — {b.name}</option>)}</select>
        <select className="select"><option>ช่วงเวลา: 30 วันล่าสุด</option><option>ไตรมาสนี้</option><option>เดือนนี้</option><option>กำหนดเอง…</option></select>
        <select className="select"><option>ทุกสถานะ</option><option>Matched</option><option>Pending</option><option>Review</option></select>
        <div className="grow" />
        <button className="btn sm"><Ic name="download" size={13} /> Export</button>
      </div>

      {tab === "bank" && <BankTab companyId={companyId} />}
      {tab === "receipts" && <ReceiptsTab data={filtered(d.recentTxns.filter((t) => t.amount > 0), ["desc"])} />}
      {tab === "payments" && <PaymentsTab data={filtered(d.recentTxns.filter((t) => t.amount < 0), ["desc"])} companyId={companyId} />}
      {tab === "honda" && <APHondaTab companyId={companyId} />}
      {tab === "pn" && <PNPaymentTab companyId={companyId} />}
      {tab === "reconAR" && <ReconcileARTab companyId={companyId} />}
      {tab === "reconAP" && <ReconcileAPTab companyId={companyId} />}

      {showAdd && <AddTxnModal companyId={companyId} onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); toast("บันทึกรายการเรียบร้อย"); }} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onDone={() => { setShowUpload(false); toast("นำเข้า 184 รายการสำเร็จ"); }} />}
    </>
  );
}

function BankTab({ companyId }) {
  const d = window.CFData;
  const accounts = d.bankAccounts.filter(b => companyId === "CONSO" || !companyId || b.entity === companyId);
  return (
    <div className="card">
      <table className="tbl">
        <thead>
          <tr>
            <th>เลขที่บัญชี</th>
            <th>Entity</th>
            <th>ชื่อบัญชี</th>
            <th>ธนาคาร / สาขา</th>
            <th>ประเภท</th>
            <th>สกุลเงิน</th>
            <th className="num">ยอดคงเหลือ (บาท)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((b) => (
            <tr key={b.id}>
              <td className="mono small">{b.id}</td>
              <td><EntityChip entity={b.entity} /></td>
              <td><div style={{ fontWeight: 500 }}>{b.name}</div><div className="tiny faint">{b.no}</div></td>
              <td>{b.bank}<div className="tiny faint">{b.branch}</div></td>
              <td><span className="tag">{b.type}</span></td>
              <td className="muted">{b.ccy}</td>
              <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(b.balance)}</td>
              <td><button className="iconbtn"><Ic name="more" size={16} /></button></td>
            </tr>
          ))}
          <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
            <td colSpan="6" style={{ textAlign: "right" }}>รวมทั้งสิ้น ({accounts.length} บัญชี)</td>
            <td className="num">{window.fmtTHB(accounts.reduce((s, b) => s + b.balance, 0))}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ReceiptsTab({ data }) {
  const d = window.CFData;
  const total = data.reduce((s, t) => s + t.amount, 0);
  return (
    <div className="card">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 100 }}>วันที่</th>
            <th style={{ width: 70 }}>Entity</th>
            <th>รายละเอียด</th>
            <th>Segment</th>
            <th>บัญชีรับ</th>
            <th>แหล่งข้อมูล</th>
            <th className="num" style={{ width: 140 }}>จำนวน (บาท)</th>
            <th>สถานะ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id}>
              <td className="num small">{t.date}</td>
              <td><EntityChip entity={t.entity} /></td>
              <td>{t.desc}<div className="tiny faint">Ref: {t.id}</div></td>
              <td><span className="tag segment-tag">{d.getSegmentName(t.entity, t.segmentId, "in")}</span></td>
              <td className="mono small">{t.account}</td>
              <td className="muted small">{t.source}</td>
              <td className="num pos" style={{ fontWeight: 500 }}>+{window.fmtTHB(t.amount)}</td>
              <td><StatusTag s={t.status} /></td>
              <td><button className="iconbtn"><Ic name="more" size={16} /></button></td>
            </tr>
          ))}
          {data.length > 0 && (
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td colSpan="6" style={{ textAlign: "right" }}>รวมเงินรับ ({data.length} รายการ)</td>
              <td className="num pos">+{window.fmtTHB(total)}</td>
              <td colSpan="2"></td>
            </tr>
          )}
        </tbody>
      </table>
      <Footnote count={data.length} />
    </div>
  );
}

function PaymentsTab({ data, companyId }) {
  const d = window.CFData;
  const total = data.reduce((s, t) => s + t.amount, 0);
  return (
    <>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>วันที่</th>
              <th style={{ width: 70 }}>Entity</th>
              <th>รายละเอียด</th>
              <th>Segment</th>
              <th>บัญชีจ่าย</th>
              <th>แหล่งข้อมูล</th>
              <th className="num" style={{ width: 140 }}>จำนวน (บาท)</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id}>
                <td className="num small">{t.date}</td>
                <td><EntityChip entity={t.entity} /></td>
                <td>{t.desc}<div className="tiny faint">Ref: {t.id}</div></td>
                <td><span className="tag segment-tag mono">{d.getSegmentName(t.entity, t.segmentId, "out")}</span></td>
                <td className="mono small">{t.account}</td>
                <td className="muted small">{t.source}</td>
                <td className="num neg" style={{ fontWeight: 500 }}>{window.fmtTHB(t.amount)}</td>
                <td><StatusTag s={t.status} /></td>
                <td><button className="iconbtn"><Ic name="more" size={16} /></button></td>
              </tr>
            ))}
            {data.length > 0 && (
              <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
                <td colSpan="6" style={{ textAlign: "right" }}>รวมเงินจ่าย ({data.length} รายการ)</td>
                <td className="num neg">{window.fmtTHB(total)}</td>
                <td colSpan="2"></td>
              </tr>
            )}
          </tbody>
        </table>
        <Footnote count={data.length} />
      </div>

      {/* โอนระหว่างบัญชี — ย้ายมาอยู่ใน เงินจ่าย */}
      <div style={{ marginTop: 14 }}>
        <div className="card-head" style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
          <Ic name="swap" size={14} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 600, marginLeft: 8 }}>โอนระหว่างบัญชี (Internal Transfer)</span>
          <span className="small muted" style={{ marginLeft: 8 }}>— ไม่กระทบ Cash Flow สุทธิ (รายการหักล้างกัน)</span>
        </div>
        <TransferTab companyId={companyId} />
      </div>
    </>
  );
}

function TransferTab({ companyId }) {
  const d = window.CFData;
  const items = [
    { date: "2026-03-28", from: "BA-001", to: "BA-003", amt: 42_100_000, note: "เติมบัญชีเงินเดือน HMW" },
    { date: "2026-03-26", from: "BA-001", to: "BA-007", amt:  9_600_000, note: "เติมบัญชีเงินเดือน CLIK" },
    { date: "2026-03-22", from: "BA-002", to: "BA-005", amt: 18_000_000, note: "ลงทุนระยะสั้น" },
    { date: "2026-03-15", from: "BA-001", to: "BA-002", amt: 35_000_000, note: "เติมบัญชีดำเนินงาน HMW" },
    { date: "2026-03-14", from: "BA-001", to: "BA-006", amt: 12_000_000, note: "เติมบัญชีดำเนินงาน CLIK" },
  ];
  const enrich = items.map(t => ({
    ...t,
    fromEntity: d.getEntityForAccount(t.from),
    toEntity: d.getEntityForAccount(t.to),
  })).filter(t => companyId === "CONSO" || !companyId || t.fromEntity === companyId || t.toEntity === companyId);

  return (
    <div className="card">
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 110 }}>วันที่</th>
            <th>จาก Entity</th>
            <th>จากบัญชี</th>
            <th></th>
            <th>ถึง Entity</th>
            <th>ถึงบัญชี</th>
            <th>หมายเหตุ</th>
            <th className="num">จำนวน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {enrich.map((t, i) => (
            <tr key={i}>
              <td className="num small">{t.date}</td>
              <td><EntityChip entity={t.fromEntity} /></td>
              <td className="mono">{t.from}</td>
              <td className="faint" style={{ width: 24 }}><Ic name="arrowRight" size={14} /></td>
              <td><EntityChip entity={t.toEntity} /></td>
              <td className="mono">{t.to}</td>
              <td>
                {t.note}
                {t.fromEntity !== t.toEntity && <span className="tag warning" style={{ marginLeft: 6 }}>Inter-company</span>}
              </td>
              <td className="num">{window.fmtTHB(t.amt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// StatusTag: Transaction reconciliation status (CF_STATUS.TXN)
function StatusTag({ s }) {
  const S = window.CF_STATUS.TXN;
  if (s === S.MATCHED) return <span className="tag success"><span className="dot" />Matched</span>;
  if (s === S.PENDING)  return <span className="tag warning"><span className="dot" />Pending</span>;
  if (s === S.REVIEW)   return <span className="tag danger"><span className="dot" />Review</span>;
  if (s === S.VOID)     return <span className="tag"><span className="dot" />Void</span>;
  return <span className="tag">{s}</span>;
}

function Footnote({ count }) {
  return <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)" }} className="small muted">
    <span>แสดง {count} รายการ</span>
    <div className="row">
      <button className="btn sm ghost"><Ic name="chevron" size={12} style={{ transform: "rotate(180deg)" }} /> ก่อนหน้า</button>
      <span className="tiny">หน้า 1 / 12</span>
      <button className="btn sm ghost">ถัดไป <Ic name="chevron" size={12} /></button>
    </div>
  </div>;
}

function AddTxnModal({ onClose, onSave, companyId }) {
  const d = window.CFData;
  const [type, setType] = React.useState("in");
  // default entity = selected company, or HMW if Conso
  const defaultEntity = (companyId && companyId !== "CONSO") ? companyId : "HMW";
  const [entity, setEntity] = React.useState(defaultEntity);

  // Segments based on entity + type
  const segments = type === "out"
    ? d.expenseSegments.map(s => ({ id: s.id, label: `${s.id} – ${s.name}` }))
    : (d.incomeSegmentsByCo[entity] || []).map(s => ({ id: s.id, label: s.name }));

  // Bank accounts: filter by entity (or all)
  const accountsForEntity = d.bankAccounts.filter(b => b.entity === entity);
  const accountsToShow = accountsForEntity.length ? accountsForEntity : d.bankAccounts;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">เพิ่มรายการใหม่</div>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="segmented" style={{ marginBottom: 14 }}>
            <button className={type === "in" ? "active" : ""} onClick={() => setType("in")}>เงินรับ</button>
            <button className={type === "out" ? "active" : ""} onClick={() => setType("out")}>เงินจ่าย</button>
            <button className={type === "tf" ? "active" : ""} onClick={() => setType("tf")}>โอนระหว่างบัญชี</button>
          </div>
          <div className="form-grid">
            <label className="field">วันที่<input className="input" type="date" defaultValue="2026-03-31" /></label>
            <label className="field">เลขอ้างอิง<input className="input" placeholder="T-04222" /></label>
            <label className="field">Entity (บริษัท)
              <select className="select" value={entity} onChange={(e) => setEntity(e.target.value)}>
                {d.companies.filter(c => c.id !== "CONSO").map(c => (
                  <option key={c.id} value={c.id}>{c.short} — {c.name}</option>
                ))}
              </select>
            </label>
            <label className="field">บัญชี
              <select className="select">
                {accountsToShow.map((b) => <option key={b.id}>{b.id} — {b.name}</option>)}
              </select>
            </label>
            {type !== "tf" && (
              <label className="field full">
                Segment {type === "in" ? `(รายรับของ ${entity})` : "(รายจ่าย F1/I1/O1–O6)"}
                <select className="select">
                  {segments.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </label>
            )}
            <label className="field full">รายละเอียด<input className="input" placeholder={type === "in" ? "รับชำระจาก…" : "ค่า…"} /></label>
            <label className="field">จำนวนเงิน (บาท)<input className="input num" placeholder="0.00" defaultValue="1,000,000.00" /></label>
            <label className="field">แหล่งข้อมูล
              <select className="select"><option>Bank</option><option>AR</option><option>AP</option><option>Payroll</option><option>Manual</option></select>
            </label>
            <label className="field full">หมายเหตุ<textarea placeholder="ระบุข้อมูลเพิ่มเติม…" /></label>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" onClick={onSave}>บันทึก</button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onDone }) {
  const [step, setStep] = React.useState(1);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); setTimeout(() => setStep(3), 300); return 100; }
        return p + 8;
      });
    }, 90);
    return () => clearInterval(t);
  }, [step]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">นำเข้า Bank Statement</div>
          <span className="tag" style={{ marginLeft: 10 }}>ขั้นตอนที่ {step} / 3</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="form-grid">
                <label className="field">ธนาคาร / บัญชี
                  <select className="select">
                    {window.CFData.bankAccounts.map((b) => <option key={b.id}>{b.bank} — {b.id}</option>)}
                  </select>
                </label>
                <label className="field">รูปแบบไฟล์
                  <select className="select"><option>Excel (.xlsx)</option><option>CSV</option><option>PDF Bank Statement</option><option>MT940</option></select>
                </label>
              </div>
              <div style={{ marginTop: 14, border: "1.5px dashed var(--border-strong)", borderRadius: 10, padding: 38, textAlign: "center", background: "var(--bg-subtle)" }}>
                <Ic name="upload" size={24} style={{ color: "var(--text-tertiary)" }} />
                <div style={{ marginTop: 8, fontWeight: 500 }}>ลากไฟล์มาวาง หรือ คลิกเลือกไฟล์</div>
                <div className="small muted" style={{ marginTop: 4 }}>รองรับ .xlsx, .csv, .pdf, .txt — ขนาดไม่เกิน 25 MB</div>
                <button className="btn primary" style={{ marginTop: 14 }}>เลือกไฟล์</button>
              </div>
              <div className="small muted" style={{ marginTop: 12 }}>
                <strong>คำแนะนำ:</strong> ไฟล์ต้องประกอบด้วยคอลัมน์ <code>วันที่</code>, <code>รายละเอียด</code>, <code>เดบิต/เครดิต</code>, <code>ยอดคงเหลือ</code>
              </div>
            </>
          )}
          {step === 2 && (
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontWeight: 500 }}>กำลังประมวลผลไฟล์...</div>
              <div className="small muted" style={{ marginBottom: 14 }}>statement_BA001_032026.xlsx — 184 รายการ</div>
              <div className="progress"><span style={{ width: progress + "%" }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }} >
                <span className="small muted">กำลังจับคู่กับ GL ...</span>
                <span className="small num">{progress}%</span>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "inline-grid", placeItems: "center", marginBottom: 12 }}>
                <Ic name="check" size={26} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>นำเข้าสำเร็จ</div>
              <div className="muted" style={{ marginTop: 4 }}>184 รายการ — Matched 172 / Pending 9 / Review 3</div>
              <div className="row" style={{ justifyContent: "center", gap: 16, marginTop: 20 }}>
                <Stat label="Matched" value="172" color="var(--success)" />
                <Stat label="Pending" value="9" color="var(--warning)" />
                <Stat label="Review" value="3" color="var(--danger)" />
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step === 1 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => setStep(2)}>ประมวลผล</button>
          </>}
          {step === 3 && <button className="btn primary" onClick={onDone}>เสร็จสิ้น</button>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="num" style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
      <div className="tiny muted">{label}</div>
    </div>
  );
}

/* ============================================================================
   AP HONDA Payment Tab — การจ่ายเงินให้ HONDA (รถยนต์/อะไหล่)
   ============================================================================ */
function APHondaTab({ companyId }) {
  const d = window.CFData;
  const rows = d.apHondaPayments.filter(r => companyId === "CONSO" || !companyId || r.entity === companyId);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  // Use CF_STATUS.DOC: "outstanding" = ค้างชำระ, "paid" = ชำระแล้ว
  const S = window.CF_STATUS.DOC;
  const pending = rows.filter(r => r.status === S.OUTSTANDING || r.status === S.OVERDUE).reduce((s, r) => s + r.amount, 0);
  const paid    = rows.filter(r => r.status === S.PAID).reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="ยอด AP HONDA รวม" value={total} accent />
        <Mini label="ค้างชำระ (Outstanding)" value={pending} color="var(--warning)" />
        <Mini label="ชำระแล้ว (Paid)" value={paid} color="var(--success)" />
        <Mini label="จำนวนรายการ" value={rows.length} isCount />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">AP HONDA Payment</div>
          <div className="tiny muted" style={{ marginLeft: 8 }}>การจ่ายเงินค่ารถยนต์ Honda และอะไหล่</div>
          <div className="grow" />
          <button className="btn sm"><Ic name="filter" size={13} /> ตัวกรอง</button>
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
          <button className="btn sm primary"><Ic name="plus" size={13} /> เพิ่ม</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>วันที่</th>
              <th style={{ width: 70 }}>Entity</th>
              <th>เลข Invoice</th>
              <th>รุ่น / รายการ</th>
              <th className="num">จำนวน</th>
              <th className="num">ราคาต่อหน่วย</th>
              <th className="num">รวม (บาท)</th>
              <th>ครบกำหนด</th>
              <th>บัญชีจ่าย</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r =>
              <tr key={r.id}>
                <td className="num small">{r.date}</td>
                <td><EntityChip entity={r.entity} /></td>
                <td className="mono small">{r.invoice}</td>
                <td style={{ fontWeight: 500 }}>{r.model}</td>
                <td className="num">{r.qty}</td>
                <td className="num">{window.fmtTHB(r.unit)}</td>
                <td className="num neg" style={{ fontWeight: 500 }}>{window.fmtTHB(r.amount)}</td>
                <td className="num small">{r.dueDate}</td>
                <td className="mono small">{r.account}</td>
                <td><PNStatusTag s={r.status} /></td>
              </tr>
            )}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td colSpan="6" style={{ textAlign: "right" }}>รวมทั้งสิ้น ({rows.length} รายการ)</td>
              <td className="num neg">{window.fmtTHB(total)}</td>
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============================================================================
   PN Payment Tab — Promissory Note (ตั๋วเงินจ่าย)
   ============================================================================ */
function PNPaymentTab({ companyId }) {
  const d = window.CFData;
  const rows = d.pnPayments.filter(r => companyId === "CONSO" || !companyId || r.entity === companyId);
  const S = window.CF_STATUS.DOC;
  const total       = rows.reduce((s, r) => s + r.amount, 0);
  const outstanding = rows.filter(r => r.status === S.OUTSTANDING || r.status === S.OVERDUE).reduce((s, r) => s + r.amount, 0);
  const paid        = rows.filter(r => r.status === S.PAID).reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="ยอด PN รวม" value={total} accent />
        <Mini label="คงค้าง (Outstanding)" value={outstanding} color="var(--warning)" />
        <Mini label="ชำระแล้ว (Paid)" value={paid} color="var(--success)" />
        <Mini label="จำนวนตั๋ว" value={rows.length} isCount />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">PN Payment (ตั๋วเงินจ่าย)</div>
          <div className="tiny muted" style={{ marginLeft: 8 }}>Promissory Note สำหรับการจ่ายระยะ 30/60/90 วัน</div>
          <div className="grow" />
          <button className="btn sm"><Ic name="filter" size={13} /> ตัวกรอง</button>
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
          <button className="btn sm primary"><Ic name="plus" size={13} /> เพิ่ม PN</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 100 }}>วันที่</th>
              <th style={{ width: 70 }}>Entity</th>
              <th>เลข PN</th>
              <th>ผู้รับ (Beneficiary)</th>
              <th>วันออก</th>
              <th>ครบกำหนด</th>
              <th>เทอม</th>
              <th>บัญชีจ่าย</th>
              <th className="num">จำนวน (บาท)</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r =>
              <tr key={r.id}>
                <td className="num small">{r.date}</td>
                <td><EntityChip entity={r.entity} /></td>
                <td className="mono small">{r.pnNo}</td>
                <td style={{ fontWeight: 500 }}>{r.beneficiary}</td>
                <td className="num small">{r.issueDate}</td>
                <td className="num small">{r.dueDate}</td>
                <td><span className="tag">{r.term}</span></td>
                <td className="mono small">{r.account}</td>
                <td className="num neg" style={{ fontWeight: 500 }}>{window.fmtTHB(r.amount)}</td>
                <td><PNStatusTag s={r.status} /></td>
              </tr>
            )}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td colSpan="8" style={{ textAlign: "right" }}>รวม PN ทั้งสิ้น ({rows.length} ใบ)</td>
              <td className="num neg">{window.fmtTHB(total)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============================================================================
   Reconcile AR Tab — กระทบยอดลูกหนี้ (สำหรับ CF Indirect Method)
   ============================================================================ */
function ReconcileARTab({ companyId }) {
  const d = window.CFData;
  const recon = d.reconcileAR;
  const reconSeg = d.reconcileARBySegment;
  const [viewMode, setViewMode] = React.useState("entity"); // "entity" | "segment"
  const [expanded, setExpanded] = React.useState({});

  const entities = recon.entities.filter(e => companyId === "CONSO" || !companyId || e.entity === companyId);
  const sumOpening = entities.reduce((s, e) => s + e.opening, 0);
  const sumSales = entities.reduce((s, e) => s + e.sales, 0);
  const sumCollection = entities.reduce((s, e) => s + e.collection, 0);
  const sumAdjustments = entities.reduce((s, e) => s + e.adjustments, 0);
  const sumClosing = entities.reduce((s, e) => s + e.closing, 0);
  const sumChange = entities.reduce((s, e) => s + e.change, 0);

  const toggleExpand = (ent) => setExpanded(prev => ({ ...prev, [ent]: !prev[ent] }));

  // Segment color by id
  const segColorMap = { HONDA: "#1F9D55", TOK: "#2A6FF0", INS: "#7C4DFF", INS_OPEN: "#0E97A0", INS_LIM: "#C97A00", FIN: "#D03434", RENT: "#8B5A2B", DEL: "#8B95A1", SVC: "#7C4DFF", MGT_HMW: "#2A6FF0", MGT_CLIK: "#7C4DFF", OTH: "#8B95A1" };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="AR เปิดงวด" value={sumOpening} />
        <Mini label="AR ปิดงวด" value={sumClosing} accent />
        <Mini label="การเปลี่ยนแปลง AR" value={sumChange} color={sumChange > 0 ? "var(--warning)" : "var(--success)"} />
        <Mini label="ผลกระทบต่อ CF" value={-sumChange} color={sumChange > 0 ? "var(--danger)" : "var(--success)"} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Reconcile AR — กระทบยอดลูกหนี้การค้า</div>
          <div className="tiny muted" style={{ marginLeft: 8 }}>งวด: {recon.period} • สำหรับ CF Indirect Method</div>
          <div className="grow" />
          {/* View toggle */}
          <div className="row" style={{ gap: 4, marginRight: 8 }}>
            <button className={"btn sm" + (viewMode === "entity" ? " primary" : "")} onClick={() => setViewMode("entity")}>By Entity</button>
            <button className={"btn sm" + (viewMode === "segment" ? " primary" : "")} onClick={() => { setViewMode("segment"); setExpanded(Object.fromEntries(entities.map(e => [e.entity, true]))); }}>By Segment</button>
          </div>
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Entity / Segment</th>
              <th className="num">เปิดงวด (AR)</th>
              <th className="num">+ ยอดขาย</th>
              <th className="num">− เก็บเงิน</th>
              <th className="num">± ปรับปรุง</th>
              <th className="num">ปิดงวด (AR)</th>
              <th className="num">Δ Change</th>
              <th style={{ width: 120 }}>ผลกระทบ CF</th>
            </tr>
          </thead>
          <tbody>
            {entities.map(e => {
              const segs = reconSeg.byEntity[e.entity]?.segments || [];
              const isOpen = expanded[e.entity];
              return (
                <React.Fragment key={e.entity}>
                  {/* Entity row */}
                  <tr
                    style={{ background: isOpen && viewMode === "segment" ? "var(--accent-soft)" : undefined, cursor: viewMode === "segment" ? "pointer" : undefined }}
                    onClick={viewMode === "segment" ? () => toggleExpand(e.entity) : undefined}
                  >
                    <td>
                      <div className="row" style={{ gap: 6, alignItems: "center" }}>
                        {viewMode === "segment" && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", transition: "transform .15s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                        )}
                        <EntityChip entity={e.entity} />
                      </div>
                    </td>
                    <td className="num">{window.fmtTHB(e.opening)}</td>
                    <td className="num pos">+{window.fmtTHB(e.sales)}</td>
                    <td className="num neg">{window.fmtTHB(e.collection)}</td>
                    <td className="num">{e.adjustments ? window.fmtTHB(e.adjustments) : "—"}</td>
                    <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(e.closing)}</td>
                    <td className="num" style={{ fontWeight: 600, color: e.change > 0 ? "var(--warning)" : "var(--success)" }}>{e.change > 0 ? "+" : ""}{window.fmtTHB(e.change)}</td>
                    <td className="small muted">{e.impact}</td>
                  </tr>
                  {/* Segment rows — only when expanded in segment mode */}
                  {viewMode === "segment" && isOpen && segs.map(seg => (
                    <tr key={seg.id} style={{ background: "var(--bg-subtle)" }}>
                      <td style={{ paddingLeft: 32 }}>
                        <div className="row" style={{ gap: 6, alignItems: "center" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: segColorMap[seg.id] || "#8B95A1", flexShrink: 0 }} />
                          <span className="small">{seg.name}</span>
                          <span className="tag" style={{ fontSize: 10, padding: "1px 6px", marginLeft: 2 }}>{seg.id}</span>
                        </div>
                      </td>
                      <td className="num tiny">{window.fmtTHB(seg.opening)}</td>
                      <td className="num tiny pos">+{window.fmtTHB(seg.sales)}</td>
                      <td className="num tiny neg">{window.fmtTHB(seg.collection)}</td>
                      <td className="num tiny">{seg.adjustments ? window.fmtTHB(seg.adjustments) : "—"}</td>
                      <td className="num tiny">{window.fmtTHB(seg.closing)}</td>
                      <td className="num tiny" style={{ color: seg.change > 0 ? "var(--warning)" : "var(--success)" }}>{seg.change > 0 ? "+" : ""}{window.fmtTHB(seg.change)}</td>
                      <td className="tiny muted">{seg.change > 0 ? "AR เพิ่ม ↓CF" : "AR ลด ↑CF"}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td>รวมทั้งหมด</td>
              <td className="num">{window.fmtTHB(sumOpening)}</td>
              <td className="num pos">+{window.fmtTHB(sumSales)}</td>
              <td className="num neg">{window.fmtTHB(sumCollection)}</td>
              <td className="num">{sumAdjustments ? window.fmtTHB(sumAdjustments) : "—"}</td>
              <td className="num">{window.fmtTHB(sumClosing)}</td>
              <td className="num" style={{ color: sumChange > 0 ? "var(--warning)" : "var(--success)" }}>{sumChange > 0 ? "+" : ""}{window.fmtTHB(sumChange)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "12px 14px", background: "var(--accent-soft)", borderTop: "1px solid var(--border)" }}>
          <div className="row" style={{ alignItems: "center", gap: 8 }}>
            <Ic name="info" size={14} style={{ color: "var(--accent-text)" }} />
            <div className="small">
              <strong>สูตร CF Indirect:</strong> AR เพิ่ม = ใช้เงินสด (หักจาก Net Profit) • AR ลด = ได้เงินสด (บวกเข้า Net Profit)
              {viewMode === "segment" && <span className="muted"> • คลิกที่ Entity เพื่อ expand/collapse segments</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
   Reconcile AP Tab — กระทบยอดเจ้าหนี้ (สำหรับ CF Indirect Method)
   ============================================================================ */
function ReconcileAPTab({ companyId }) {
  const d = window.CFData;
  const recon = d.reconcileAP;
  const reconSeg = d.reconcileAPBySegment;
  const [viewMode, setViewMode] = React.useState("entity");
  const [expanded, setExpanded] = React.useState({});

  const entities = recon.entities.filter(e => companyId === "CONSO" || !companyId || e.entity === companyId);
  const sumOpening = entities.reduce((s, e) => s + e.opening, 0);
  const sumPurchases = entities.reduce((s, e) => s + e.purchases, 0);
  const sumPayment = entities.reduce((s, e) => s + e.payment, 0);
  const sumAdjustments = entities.reduce((s, e) => s + e.adjustments, 0);
  const sumClosing = entities.reduce((s, e) => s + e.closing, 0);
  const sumChange = entities.reduce((s, e) => s + e.change, 0);

  const toggleExpand = (ent) => setExpanded(prev => ({ ...prev, [ent]: !prev[ent] }));

  // Expense segment colors (from expenseSegments in data)
  const segColorMap = { F1: "#D03434", I1: "#C97A00", O1: "#2A6FF0", O2: "#1F9D55", O3: "#7C4DFF", O4: "#0E97A0", O5: "#8B5A2B", O6: "#8B95A1" };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <Mini label="AP เปิดงวด" value={sumOpening} />
        <Mini label="AP ปิดงวด" value={sumClosing} accent />
        <Mini label="การเปลี่ยนแปลง AP" value={sumChange} color={sumChange > 0 ? "var(--success)" : "var(--warning)"} />
        <Mini label="ผลกระทบต่อ CF" value={sumChange} color={sumChange > 0 ? "var(--success)" : "var(--danger)"} />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Reconcile AP — กระทบยอดเจ้าหนี้การค้า</div>
          <div className="tiny muted" style={{ marginLeft: 8 }}>งวด: {recon.period} • สำหรับ CF Indirect Method</div>
          <div className="grow" />
          {/* View toggle */}
          <div className="row" style={{ gap: 4, marginRight: 8 }}>
            <button className={"btn sm" + (viewMode === "entity" ? " primary" : "")} onClick={() => setViewMode("entity")}>By Entity</button>
            <button className={"btn sm" + (viewMode === "segment" ? " primary" : "")} onClick={() => { setViewMode("segment"); setExpanded(Object.fromEntries(entities.map(e => [e.entity, true]))); }}>By Segment</button>
          </div>
          <button className="btn sm"><Ic name="download" size={13} /> Export</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Entity / Segment</th>
              <th className="num">เปิดงวด (AP)</th>
              <th className="num">+ ซื้อ (Purchase)</th>
              <th className="num">− จ่ายเงิน</th>
              <th className="num">± ปรับปรุง</th>
              <th className="num">ปิดงวด (AP)</th>
              <th className="num">Δ Change</th>
              <th style={{ width: 120 }}>ผลกระทบ CF</th>
            </tr>
          </thead>
          <tbody>
            {entities.map(e => {
              const segs = reconSeg.byEntity[e.entity]?.segments || [];
              const isOpen = expanded[e.entity];
              return (
                <React.Fragment key={e.entity}>
                  {/* Entity row */}
                  <tr
                    style={{ background: isOpen && viewMode === "segment" ? "var(--accent-soft)" : undefined, cursor: viewMode === "segment" ? "pointer" : undefined }}
                    onClick={viewMode === "segment" ? () => toggleExpand(e.entity) : undefined}
                  >
                    <td>
                      <div className="row" style={{ gap: 6, alignItems: "center" }}>
                        {viewMode === "segment" && (
                          <span style={{ fontSize: 10, color: "var(--text-muted)", transition: "transform .15s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                        )}
                        <EntityChip entity={e.entity} />
                      </div>
                    </td>
                    <td className="num">{window.fmtTHB(e.opening)}</td>
                    <td className="num pos">+{window.fmtTHB(e.purchases)}</td>
                    <td className="num neg">{window.fmtTHB(e.payment)}</td>
                    <td className="num">{e.adjustments ? window.fmtTHB(e.adjustments) : "—"}</td>
                    <td className="num" style={{ fontWeight: 500 }}>{window.fmtTHB(e.closing)}</td>
                    <td className="num" style={{ fontWeight: 600, color: e.change > 0 ? "var(--success)" : "var(--warning)" }}>{e.change > 0 ? "+" : ""}{window.fmtTHB(e.change)}</td>
                    <td className="small muted">{e.impact}</td>
                  </tr>
                  {/* Segment rows — only when expanded in segment mode */}
                  {viewMode === "segment" && isOpen && segs.map(seg => (
                    <tr key={seg.id} style={{ background: "var(--bg-subtle)" }}>
                      <td style={{ paddingLeft: 32 }}>
                        <div className="row" style={{ gap: 6, alignItems: "center" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: segColorMap[seg.id] || "#8B95A1", flexShrink: 0 }} />
                          <span className="small">{seg.name}</span>
                          <span className="tag" style={{ fontSize: 10, padding: "1px 6px", marginLeft: 2 }}>{seg.id}</span>
                        </div>
                      </td>
                      <td className="num tiny">{window.fmtTHB(seg.opening)}</td>
                      <td className="num tiny pos">+{window.fmtTHB(seg.purchases)}</td>
                      <td className="num tiny neg">{window.fmtTHB(seg.payment)}</td>
                      <td className="num tiny">{seg.adjustments ? window.fmtTHB(seg.adjustments) : "—"}</td>
                      <td className="num tiny">{window.fmtTHB(seg.closing)}</td>
                      <td className="num tiny" style={{ color: seg.change > 0 ? "var(--success)" : "var(--warning)" }}>{seg.change > 0 ? "+" : ""}{window.fmtTHB(seg.change)}</td>
                      <td className="tiny muted">{seg.change > 0 ? "AP เพิ่ม ↑CF" : "AP ลด ↓CF"}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
              <td>รวมทั้งหมด</td>
              <td className="num">{window.fmtTHB(sumOpening)}</td>
              <td className="num pos">+{window.fmtTHB(sumPurchases)}</td>
              <td className="num neg">{window.fmtTHB(sumPayment)}</td>
              <td className="num">{sumAdjustments ? window.fmtTHB(sumAdjustments) : "—"}</td>
              <td className="num">{window.fmtTHB(sumClosing)}</td>
              <td className="num" style={{ color: sumChange > 0 ? "var(--success)" : "var(--warning)" }}>{sumChange > 0 ? "+" : ""}{window.fmtTHB(sumChange)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "12px 14px", background: "var(--accent-soft)", borderTop: "1px solid var(--border)" }}>
          <div className="row" style={{ alignItems: "center", gap: 8 }}>
            <Ic name="info" size={14} style={{ color: "var(--accent-text)" }} />
            <div className="small">
              <strong>สูตร CF Indirect:</strong> AP เพิ่ม = ได้เงินสด (บวกเข้า Net Profit) • AP ลด = ใช้เงินสด (หักจาก Net Profit)
              {viewMode === "segment" && <span className="muted"> • คลิกที่ Entity เพื่อ expand/collapse segments</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// PNStatusTag / APHondaStatusTag: Document lifecycle status (CF_STATUS.DOC)
function PNStatusTag({ s }) {
  const S = window.CF_STATUS.DOC;
  if (s === S.OUTSTANDING) return <span className="tag warning"><span className="dot" />Outstanding</span>;
  if (s === S.PARTIAL)     return <span className="tag accent"><span className="dot" />Partial</span>;
  if (s === S.PAID)        return <span className="tag success"><span className="dot" />Paid</span>;
  if (s === S.OVERDUE)     return <span className="tag danger"><span className="dot" />Overdue</span>;
  if (s === S.CANCELLED)   return <span className="tag"><span className="dot" />Cancelled</span>;
  return <span className="tag">{s}</span>;
}

window.FinanceInput = FinanceInput;
