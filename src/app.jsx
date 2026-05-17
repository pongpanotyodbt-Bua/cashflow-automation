/* Main app — orchestration, tweaks, export modal, toast */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2A6FF0",
  "chartStyle": "line",
  "sidebar": "left",
  "density": "default",
  "fontScale": 1
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  "#2A6FF0": { hover: "#1F5BD8", soft: "#EAF1FE", softStrong: "#D6E4FD", text: "#1F5BD8" },
  "#1F9D55": { hover: "#178044", soft: "#E6F5EC", softStrong: "#C9E8D5", text: "#178044" },
  "#7C4DFF": { hover: "#5F36D9", soft: "#EFE9FB", softStrong: "#DECDF6", text: "#5F36D9" },
  "#1A1D21": { hover: "#000", soft: "#F0F1F3", softStrong: "#E0E2E6", text: "#1A1D21" },
};

function App() {
  const [active, setActive] = React.useState("dashboard");
  const [period, setPeriod] = React.useState("ไตรมาส 1/2569");
  const [companyId, setCompanyId] = React.useState("CONSO");
  const [toasts, setToasts] = React.useState([]);
  const [showExport, setShowExport] = React.useState(false);
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const toast = (msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((cur) => [...cur, { id, msg }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 3200);
  };

  // Apply accent CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    const a = tweaks.accent;
    const preset = ACCENT_PRESETS[a] || ACCENT_PRESETS["#2A6FF0"];
    root.style.setProperty("--accent", a);
    root.style.setProperty("--accent-hover", preset.hover);
    root.style.setProperty("--accent-soft", preset.soft);
    root.style.setProperty("--accent-soft-strong", preset.softStrong);
    root.style.setProperty("--accent-text", preset.text);
    root.style.setProperty("--font-base", (13.5 * tweaks.fontScale) + "px");
    document.body.dataset.density = tweaks.density;
  }, [tweaks.accent, tweaks.fontScale, tweaks.density]);

  const crumbs = {
    dashboard: ["Dashboard"],
    finance: ["บันทึกข้อมูล", "ข้อมูลทางการเงิน"],
    accounting: ["บันทึกข้อมูล", "ข้อมูลทางบัญชี"],
    reconcile: ["บันทึกข้อมูล", "Reconciliation"],
    direct: ["งบกระแสเงินสด", "วิธีตรง"],
    indirect: ["งบกระแสเงินสด", "วิธีอ้อม"],
    forecast: ["งบกระแสเงินสด", "Forecast"],
    export: ["Export Center"],
    settings: ["Settings"],
  };

  return (
    <div className="app" data-sidebar={tweaks.sidebar} data-screen-label={`Cash Flow / ${active}`}>
      <window.Sidebar active={active} setActive={setActive} />
      <main className="main">
        <window.Topbar crumbs={crumbs[active]} period={period} setPeriod={setPeriod} companyId={companyId} setCompanyId={setCompanyId} />
        <div className="scroll-area">
          <div className="page">
            {active === "dashboard" && <window.Dashboard chartStyle={tweaks.chartStyle} companyId={companyId} />}
            {active === "finance" && <window.FinanceInput toast={toast} companyId={companyId} />}
            {active === "accounting" && <window.AccountingInput toast={toast} companyId={companyId} />}
            {active === "reconcile" && <window.Reconciliation toast={toast} />}
            {active === "direct" && <window.ReportPage method="direct" companyId={companyId} chartStyle={tweaks.chartStyle} onExport={() => setShowExport(true)} />}
            {active === "indirect" && <window.ReportPage method="indirect" companyId={companyId} chartStyle={tweaks.chartStyle} onExport={() => setShowExport(true)} />}
            {active === "forecast" && <window.Forecast chartStyle={tweaks.chartStyle} />}
            {active === "export" && <window.ExportCenter toast={toast} onShowExport={() => setShowExport(true)} />}
            {active === "settings" && <window.Settings toast={toast} />}
          </div>
        </div>
      </main>

      {showExport && <ExportModal onClose={() => setShowExport(false)} onDone={(name) => { setShowExport(false); toast("ดาวน์โหลด " + name + " เรียบร้อย"); }} initialReport={active === "direct" ? "direct" : active === "indirect" ? "indirect" : "indirect"} />}

      {/* Toasts */}
      <div className="toast-host">
        {toasts.map((t) => (
          <div key={t.id} className="toast"><Ic name="check" size={14} />{t.msg}</div>
        ))}
      </div>

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="ลักษณะ">
          <window.TweakColor
            label="สี Accent"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#2A6FF0", "#1F9D55", "#7C4DFF", "#1A1D21"]}
          />
          <window.TweakRadio
            label="Chart style"
            value={tweaks.chartStyle}
            onChange={(v) => setTweak("chartStyle", v)}
            options={[
              { value: "line", label: "Line" },
              { value: "area", label: "Area" },
              { value: "bar", label: "Bar" },
            ]}
          />
          <window.TweakRadio
            label="Sidebar"
            value={tweaks.sidebar}
            onChange={(v) => setTweak("sidebar", v)}
            options={[
              { value: "left", label: "ซ้าย" },
              { value: "right", label: "ขวา" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection label="ความหนาแน่น">
          <window.TweakRadio
            label="Density"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "compact", label: "Compact" },
              { value: "default", label: "ปกติ" },
              { value: "comfortable", label: "Roomy" },
            ]}
          />
          <window.TweakSlider
            label={`Font scale (${tweaks.fontScale.toFixed(2)}×)`}
            min={0.85}
            max={1.2}
            step={0.05}
            value={tweaks.fontScale}
            onChange={(v) => setTweak("fontScale", v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

/* ----- Export Modal (simulate Excel export) ----- */
function ExportModal({ onClose, onDone, initialReport }) {
  const [step, setStep] = React.useState(1);
  const [progress, setProgress] = React.useState(0);
  const [report, setReport] = React.useState(initialReport || "indirect");
  const [period, setPeriod] = React.useState("Q1 2026");
  const [includes, setIncludes] = React.useState({
    summary: true, sections: true, notes: true, supporting: false, charts: true,
  });

  React.useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); setTimeout(() => setStep(3), 300); return 100; }
        return p + Math.max(4, 12 - p / 12);
      });
    }, 80);
    return () => clearInterval(t);
  }, [step]);

  const reportName = {
    direct: "Cash Flow - Direct Method",
    indirect: "Cash Flow - Indirect Method",
    forecast: "Cash Flow Forecast",
    bank: "Bank Balances",
    ar: "AR Aging",
    ap: "AP Aging",
  }[report];
  const fileName = `${reportName} ${period}.xlsx`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Export Excel</div>
          <span className="tag" style={{ marginLeft: 10 }}>ขั้นตอนที่ {step} / 3</span>
          <button className="iconbtn" style={{ marginLeft: "auto" }} onClick={onClose}><Ic name="x" size={16} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="form-grid">
                <label className="field">รายงาน
                  <select className="select" value={report} onChange={(e) => setReport(e.target.value)}>
                    <option value="direct">งบกระแสเงินสด – วิธีตรง</option>
                    <option value="indirect">งบกระแสเงินสด – วิธีอ้อม</option>
                    <option value="forecast">Cash Flow Forecast</option>
                    <option value="bank">ยอดเงินฝากธนาคาร</option>
                    <option value="ar">AR Aging</option>
                    <option value="ap">AP Aging</option>
                  </select>
                </label>
                <label className="field">งวด
                  <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option>Q1 2026</option><option>ม.ค. 2026</option><option>ก.พ. 2026</option><option>มี.ค. 2026</option><option>YTD 2026</option><option>ปี 2025</option>
                  </select>
                </label>
                <label className="field">รูปแบบ
                  <select className="select"><option>Excel (.xlsx) – Formatted</option><option>Excel (.xlsx) – Raw data</option></select>
                </label>
                <label className="field">หน่วย
                  <select className="select"><option>บาท</option><option>พันบาท</option><option>ล้านบาท</option></select>
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="small muted" style={{ marginBottom: 8 }}>เลือกส่วนที่ต้องการรวมในไฟล์ Excel</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  {[
                    { k: "summary", n: "หน้าสรุป (Executive summary)" },
                    { k: "sections", n: "รายละเอียดทุกกิจกรรม (3 sections)" },
                    { k: "notes", n: "หมายเหตุประกอบงบฯ" },
                    { k: "supporting", n: "ข้อมูลสนับสนุน (Working paper)" },
                    { k: "charts", n: "กราฟ + Pivot tables" },
                  ].map((o) => (
                    <label key={o.k} className="row" style={{ gap: 8, padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: includes[o.k] ? "var(--accent-soft)" : "var(--bg)" }}>
                      <input type="checkbox" checked={includes[o.k]} onChange={(e) => setIncludes({ ...includes, [o.k]: e.target.checked })} />
                      <span className="small">{o.n}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="small muted" style={{ marginTop: 14, padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 6 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Ic name="fileExcel" size={14} style={{ color: "#1F9D55" }} />
                  <span style={{ fontWeight: 500 }}>{fileName}</span>
                  <span className="faint" style={{ marginLeft: "auto" }}>~ 220 KB</span>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontWeight: 500 }}>กำลังสร้างไฟล์ Excel...</div>
              <div className="small muted" style={{ marginBottom: 14 }}>{fileName}</div>
              <div className="progress"><span style={{ width: progress + "%" }} /></div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <span className="small muted">
                  {progress < 30 ? "กำลังดึงข้อมูลจาก GL..." :
                    progress < 65 ? "กำลังจัดรูปแบบเซลล์ + สูตร..." :
                      progress < 95 ? "กำลังสร้าง Pivot tables..." : "เกือบเสร็จแล้ว..."}
                </span>
                <span className="small num">{Math.round(progress)}%</span>
              </div>

              <div style={{ marginTop: 18, border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "var(--bg-subtle)" }}>
                <div className="small" style={{ fontWeight: 500, marginBottom: 8 }}>Sheets ที่กำลังสร้าง</div>
                <div className="col" style={{ gap: 4, fontSize: 12 }}>
                  {["Summary", "Operating Activities", "Investing Activities", "Financing Activities", "Notes", "Pivot - By Month", "Raw Data"].map((s, i) => (
                    <div key={i} className="row" style={{ gap: 8 }}>
                      {progress > (i + 1) * 13 ? <Ic name="check" size={12} style={{ color: "var(--success)" }} /> : <span style={{ width: 12, height: 12, display: "inline-block", border: "1.5px solid var(--border-strong)", borderRadius: "50%" }} />}
                      <span className="mono">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "inline-grid", placeItems: "center", marginBottom: 12 }}>
                <Ic name="fileExcel" size={28} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>สร้างไฟล์สำเร็จ</div>
              <div className="muted" style={{ marginTop: 4 }}>{fileName}</div>

              <div style={{ marginTop: 22, padding: 14, border: "1px solid var(--border)", borderRadius: 8, textAlign: "left" }}>
                <div className="row" style={{ gap: 12 }}>
                  <Ic name="fileExcel" size={32} style={{ color: "#1F9D55" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{fileName}</div>
                    <div className="tiny muted">7 sheets • Pivot + สูตร • 218 KB</div>
                  </div>
                  <button className="btn primary"><Ic name="download" size={13} /> ดาวน์โหลด</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step === 1 && <>
            <button className="btn" onClick={onClose}>ยกเลิก</button>
            <button className="btn primary" onClick={() => setStep(2)}><Ic name="fileExcel" size={13} /> สร้างไฟล์</button>
          </>}
          {step === 3 && <>
            <button className="btn" onClick={onClose}>ปิด</button>
            <button className="btn primary" onClick={() => onDone(reportName)}><Ic name="download" size={13} /> ดาวน์โหลด</button>
          </>}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
