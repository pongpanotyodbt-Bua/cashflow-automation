/* Sidebar + Topbar */

const NAV = [
  {
    label: "ภาพรวม",
    items: [
      { id: "dashboard", name: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "บันทึกข้อมูล",
    items: [
      { id: "finance", name: "ข้อมูลทางการเงิน", icon: "bank", badge: "12" },
      { id: "accounting", name: "ข้อมูลทางบัญชี", icon: "book", badge: "8" },
    ],
  },
  {
    label: "งบกระแสเงินสด",
    items: [
      { id: "direct", name: "วิธีตรง (Direct)", icon: "chart" },
      { id: "indirect", name: "วิธีอ้อม (Indirect)", icon: "barChart" },
      { id: "forecast", name: "Forecast", icon: "forecast" },
    ],
  },
  {
    label: "อื่นๆ",
    items: [
      { id: "export", name: "Export Center", icon: "download" },
      { id: "settings", name: "Settings", icon: "settings" },
    ],
  },
];

function Sidebar({ active, setActive }) {
  const d = window.CFData;
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">฿</div>
        <div>
          <div className="sb-brand-name">CashFlow</div>
          <div className="sb-brand-sub">{d.company.short} Treasury</div>
        </div>
      </div>

      <nav style={{ overflowY: "auto", flex: 1, paddingBottom: 8 }}>
        {NAV.map((g) => (
          <div key={g.label} className="sb-section">
            <div className="sb-section-label">{g.label}</div>
            {g.items.map((it) => (
              <button
                key={it.id}
                className={"sb-item " + (active === it.id ? "active" : "")}
                onClick={() => setActive(it.id)}
              >
                <Ic name={it.icon} size={15} />
                <span>{it.name}</span>
                {it.badge && <span className="sb-item-badge">{it.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-avatar">ปร</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>K. ปริญญา ส.</div>
          <div className="tiny faint">CFO Office</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, period, setPeriod, onSearch, companyId, setCompanyId }) {
  // period = API code (e.g. "2026-Q1") — display label derived from CF_PERIODS
  const periods = window.CF_PERIODS;
  const companies = window.CFData.companies;
  const activeCo = companies.find(c => c.id === companyId) || companies[0];
  const activePeriod = periods.find(p => p.code === period) || periods[0];

  return (
    <header className="topbar">
      <div className="crumbs">
        <span>{activeCo.short}</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "here" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="tb-spacer" />
      <div className="search-wrap">
        <Ic name="search" size={14} className="search-ic" />
        <input className="input search" placeholder="ค้นหา รายการ / บัญชี / ลูกค้า…" style={{ width: 220 }} onChange={(e) => onSearch && onSearch(e.target.value)} />
      </div>

      {/* Company selector */}
      <div className="company-picker" title={activeCo.desc}>
        <Ic name="bank" size={13} />
        <select className="select co-select" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.id === "CONSO" ? "◆ " : ""}{c.short} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Period selector — stores code, displays Thai label */}
      <select
        className="select"
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        title={`งวด: ${activePeriod.label} (code: ${activePeriod.code})`}
      >
        {periods.map((p) => (
          <option key={p.code} value={p.code}>{p.label}</option>
        ))}
      </select>
      <button className="iconbtn" title="แจ้งเตือน"><Ic name="bell" size={16} /></button>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
