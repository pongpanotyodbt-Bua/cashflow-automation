/* Icon set — minimal stroke icons */
const Ic = ({ name, size = 16, className = "ic", style }) => {
  const s = size;
  const sw = 1.6;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", className, style };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.2" /><rect x="14" y="3" width="7" height="5" rx="1.2" /><rect x="14" y="12" width="7" height="9" rx="1.2" /><rect x="3" y="16" width="7" height="5" rx="1.2" /></>,
    bank: <><path d="M3 9.5 12 4l9 5.5" /><path d="M5 9.5v9" /><path d="M9 9.5v9" /><path d="M15 9.5v9" /><path d="M19 9.5v9" /><path d="M3 20h18" /></>,
    book: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5v0A1.5 1.5 0 0 1 5.5 19H19" /></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
    arrowUp: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    chart: <><path d="M4 20V4" /><path d="M20 20H4" /><path d="m8 16 3-4 4 3 5-7" /></>,
    barChart: <><rect x="4" y="11" width="3" height="9" rx="0.5" /><rect x="10" y="6" width="3" height="14" rx="0.5" /><rect x="16" y="14" width="3" height="6" rx="0.5" /></>,
    compare: <><path d="M3 6h12l-3-3" /><path d="M21 18H9l3 3" /></>,
    download: <><path d="M12 4v12" /><path d="m6 10 6 6 6-6" /><path d="M4 20h16" /></>,
    upload: <><path d="M12 20V8" /><path d="m6 14 6-6 6 6" /><path d="M4 4h16" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="1.5" /><path d="M3 9h18" /><path d="M8 3v4M16 3v4" /></>,
    check: <><path d="m5 12 5 5L20 7" /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    chevron: <><path d="m9 6 6 6-6 6" /></>,
    chevronDown: <><path d="m6 9 6 6 6-6" /></>,
    inbox: <><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" /><path d="M3 13 6 4h12l3 9" /><path d="M3 13h5l1 3h6l1-3h5" /></>,
    fileExcel: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /><path d="m9 13 3 5M12 13l-3 5" /></>,
    file: <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></>,
    refresh: <><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 4v4h4M21 20v-4h-4" /></>,
    swap: <><path d="m7 4-4 4 4 4" /><path d="M3 8h13" /><path d="m17 20 4-4-4-4" /><path d="M21 16H8" /></>,
    boxes: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
    coins: <><circle cx="9" cy="9" r="6" /><circle cx="15" cy="15" r="6" /></>,
    forecast: <><path d="M3 17 9 11l4 4 8-10" /><path d="M14 5h7v7" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" /></>,
    alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.7 2 18a2 2 0 0 0 1.7 3h16.5a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /></>,
    dot: <circle cx="12" cy="12" r="3" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    edit: <><path d="M4 20h4l11-11-4-4L4 16Z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="m5 6 1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" /></>,
    sparkles: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z" /><path d="M19 14v4M17 16h4" /></>,
  };
  const p = paths[name];
  if (!p) return <span style={{ display: "inline-block", width: s, height: s }} />;
  return <svg {...common}>{p}</svg>;
};

window.Ic = Ic;

/* EntityChip — colored chip showing entity (company) */
function EntityChip({ entity, size = "sm" }) {
  const co = (window.CFData.companies || []).find(c => c.id === entity);
  if (!co) return <span className="tag muted">—</span>;
  const fontSize = size === "xs" ? 10 : 11;
  const pad = size === "xs" ? "1px 6px" : "2px 8px";
  return (
    <span className="entity-chip"
          style={{ background: co.color, color: "#fff", fontSize, padding: pad, borderRadius: 10, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap" }}
          title={co.name}>
      {co.short}
    </span>
  );
}
window.EntityChip = EntityChip;
