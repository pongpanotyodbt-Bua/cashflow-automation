/* Chart components — pure SVG, no library */

function useSize(ref) {
  const [size, setSize] = React.useState({ w: 600, h: 240 });
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(() => {
      if (ref.current) setSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return size;
}

/* TrendChart: line/bar/area for monthly inflow vs outflow */
function TrendChart({ data, height = 260, style = "line" }) {
  const ref = React.useRef(null);
  const { w } = useSize(ref);
  const padL = 56, padR = 16, padT = 12, padB = 28;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = height - padT - padB;

  const maxVal = Math.max(...data.flatMap((d) => [d.inflow, d.outflow])) * 1.1;
  const n = data.length;
  const stepX = n > 1 ? innerW / (n - 1) : innerW;
  const barW = n > 0 ? (innerW / n) * 0.32 : 0;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);

  const xFor = (i) => padL + i * stepX;
  const xForBar = (i, j) => padL + i * stepX - barW + (j === 0 ? 0 : barW);
  const yFor = (v) => padT + innerH - (v / maxVal) * innerH;

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d[key])}`).join(" ");

  const areaPath = (key) =>
    `M ${padL} ${padT + innerH} ` +
    data.map((d, i) => `L ${xFor(i)} ${yFor(d[key])}`).join(" ") +
    ` L ${padL + (n - 1) * stepX} ${padT + innerH} Z`;

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      <svg width="100%" height={height} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F9D55" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1F9D55" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D03434" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D03434" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={yFor(t)} y2={yFor(t)} stroke="#EEF0F3" strokeWidth="1" />
            <text x={padL - 8} y={yFor(t) + 3} fontSize="10.5" textAnchor="end" fill="#8B95A1" fontFamily="IBM Plex Mono, monospace">{(t / 1_000_000).toFixed(0)}M</text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={xFor(i)} y={height - 10} fontSize="10.5" textAnchor="middle" fill="#5C6470">{d.m || d.label || d.date?.slice(5)}</text>
        ))}

        {style === "bar" && data.map((d, i) => (
          <g key={i}>
            <rect x={xFor(i) - barW - 1} y={yFor(d.inflow)} width={barW} height={innerH - (yFor(d.inflow) - padT)} fill="#1F9D55" rx="2" />
            <rect x={xFor(i) + 1} y={yFor(d.outflow)} width={barW} height={innerH - (yFor(d.outflow) - padT)} fill="#D03434" rx="2" />
          </g>
        ))}

        {style === "area" && (
          <>
            <path d={areaPath("inflow")} fill="url(#gIn)" />
            <path d={areaPath("outflow")} fill="url(#gOut)" />
            <path d={linePath("inflow")} fill="none" stroke="#1F9D55" strokeWidth="2" />
            <path d={linePath("outflow")} fill="none" stroke="#D03434" strokeWidth="2" />
          </>
        )}

        {style === "line" && (
          <>
            <path d={linePath("inflow")} fill="none" stroke="#1F9D55" strokeWidth="2" />
            <path d={linePath("outflow")} fill="none" stroke="#D03434" strokeWidth="2" />
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={xFor(i)} cy={yFor(d.inflow)} r="3" fill="white" stroke="#1F9D55" strokeWidth="1.8" />
                <circle cx={xFor(i)} cy={yFor(d.outflow)} r="3" fill="white" stroke="#D03434" strokeWidth="1.8" />
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

/* Mini sparkline */
function Sparkline({ data, color = "#2A6FF0", height = 38, fill = false }) {
  const ref = React.useRef(null);
  const { w } = useSize(ref);
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? w / (data.length - 1) : w;
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${height - 2 - ((v - min) / range) * (height - 6)}`).join(" ");
  const area = path + ` L ${(data.length - 1) * stepX} ${height} L 0 ${height} Z`;
  return (
    <div ref={ref} style={{ width: "100%", height }}>
      <svg width="100%" height={height}>
        {fill && <path d={area} fill={color} fillOpacity="0.12" />}
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" />
      </svg>
    </div>
  );
}

/* Bar list — horizontal mini bars next to category names */
function BarList({ items, color = "#2A6FF0", showSign = false }) {
  const max = Math.max(...items.map((i) => i.amt));
  return (
    <div className="col" style={{ gap: 10 }}>
      {items.map((it) => (
        <div key={it.cat}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <div className="small" style={{ color: "var(--text)" }}>{it.cat}</div>
            <div className="small num">{showSign ? "−" : ""}{window.fmtTHB(it.amt, { compact: true })}</div>
          </div>
          <div style={{ height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(it.amt / max) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Donut: list of items with amt */
function Donut({ items, total, size = 140, thickness = 22 }) {
  const r = size / 2 - thickness / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const palette = ["#2A6FF0", "#1F9D55", "#7C4DFF", "#C97A00", "#D03434", "#0E97A0"];
  return (
    <div className="row" style={{ gap: 18, alignItems: "center" }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF0F3" strokeWidth={thickness} />
        {items.map((it, i) => {
          const frac = it.amt / total;
          const dash = frac * C;
          const off = -acc * C;
          acc += frac;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none"
              stroke={palette[i % palette.length]}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={off}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="#8B95A1">รวม</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="IBM Plex Mono, monospace" fill="#1A1D21">{window.fmtTHBShort(total)}</text>
      </svg>
      <div className="col" style={{ gap: 6, flex: 1 }}>
        {items.map((it, i) => (
          <div key={i} className="row" style={{ justifyContent: "space-between", fontSize: 12 }}>
            <div className="row" style={{ gap: 6 }}>
              <span className="sw" style={{ background: palette[i % palette.length], width: 9, height: 9, borderRadius: 2 }} />
              <span>{it.cat}</span>
            </div>
            <span className="num muted">{(it.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* StackedBarChart: stacked bars per month, one segment per stack */
function StackedBarChart({ months, segments, data, height = 280, palette }) {
  const ref = React.useRef(null);
  const { w } = useSize(ref);
  const padL = 56, padR = 16, padT = 14, padB = 28;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = height - padT - padB;
  const defaultPalette = ["#2A6FF0", "#1F9D55", "#7C4DFF", "#C97A00", "#D03434", "#0E97A0", "#8B5A2B", "#8B95A1", "#E15A8A", "#3D8B40"];

  const colorFor = (seg, i) => seg.color || (palette && palette[i % palette.length]) || defaultPalette[i % defaultPalette.length];

  // Totals per month for max value
  const totals = months.map((_, i) => segments.reduce((s, sg) => s + (data[sg.id]?.[i] || 0), 0));
  const maxVal = (Math.max(...totals, 1)) * 1.12;
  const n = months.length;
  const slotW = innerW / n;
  const barW = slotW * 0.62;
  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);
  const yFor = (v) => padT + innerH - (v / maxVal) * innerH;
  const xFor = (i) => padL + i * slotW + slotW / 2;

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      <svg width="100%" height={height} style={{ overflow: "visible" }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={yFor(t)} y2={yFor(t)} stroke="#EEF0F3" strokeWidth="1" />
            <text x={padL - 8} y={yFor(t) + 3} fontSize="10.5" textAnchor="end" fill="#8B95A1" fontFamily="IBM Plex Mono, monospace">
              {(t / 1_000_000).toFixed(0)}M
            </text>
          </g>
        ))}

        {months.map((m, i) => {
          let yCursor = padT + innerH;
          return (
            <g key={i}>
              {segments.map((sg, sIdx) => {
                const v = data[sg.id]?.[i] || 0;
                if (v <= 0) return null;
                const h = (v / maxVal) * innerH;
                yCursor -= h;
                return (
                  <rect key={sg.id}
                        x={xFor(i) - barW / 2}
                        y={yCursor}
                        width={barW}
                        height={h}
                        fill={colorFor(sg, sIdx)}
                        opacity={0.92}>
                    <title>{sg.name}: {window.fmtTHB(v)}</title>
                  </rect>
                );
              })}
              <text x={xFor(i)} y={height - 10} fontSize="10.5" textAnchor="middle" fill="#5C6470">{m}</text>
              <text x={xFor(i)} y={yFor(totals[i]) - 5} fontSize="10" textAnchor="middle" fill="#5C6470" fontFamily="IBM Plex Mono, monospace">
                {window.fmtTHBShort(totals[i])}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* SegmentTable: months × segments with row/col totals */
function SegmentTable({ months, segments, data, palette, valueColor = "var(--text)" }) {
  const defaultPalette = ["#2A6FF0", "#1F9D55", "#7C4DFF", "#C97A00", "#D03434", "#0E97A0", "#8B5A2B", "#8B95A1", "#E15A8A", "#3D8B40"];
  const colorFor = (seg, i) => seg.color || (palette && palette[i % palette.length]) || defaultPalette[i % defaultPalette.length];
  const rowTotal = (sg) => (data[sg.id] || []).reduce((s, v) => s + v, 0);
  const colTotal = (i) => segments.reduce((s, sg) => s + (data[sg.id]?.[i] || 0), 0);
  const grand = segments.reduce((s, sg) => s + rowTotal(sg), 0);
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tbl segment-tbl">
        <thead>
          <tr>
            <th style={{ minWidth: 200 }}>Segment</th>
            {months.map(m => <th key={m} className="num" style={{ minWidth: 90 }}>{m}</th>)}
            <th className="num" style={{ minWidth: 110, background: "var(--bg-subtle)" }}>รวม</th>
            <th className="num" style={{ width: 60 }}>%</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((sg, i) => {
            const tot = rowTotal(sg);
            const pct = grand > 0 ? (tot / grand) * 100 : 0;
            return (
              <tr key={sg.id}>
                <td>
                  <span className="row" style={{ gap: 8 }}>
                    <span className="sw" style={{ width: 10, height: 10, borderRadius: 2, background: colorFor(sg, i) }} />
                    <span>{sg.name}</span>
                  </span>
                </td>
                {months.map((m, mi) => (
                  <td key={m} className="num" style={{ color: valueColor }}>
                    {(data[sg.id]?.[mi] || 0) === 0 ? <span className="faint">–</span> : window.fmtTHB(data[sg.id][mi])}
                  </td>
                ))}
                <td className="num" style={{ fontWeight: 600, background: "var(--bg-subtle)" }}>{window.fmtTHB(tot)}</td>
                <td className="num small muted">{pct.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "var(--bg-subtle)", fontWeight: 600 }}>
            <td>Grand Total</td>
            {months.map((m, i) => <td key={m} className="num">{window.fmtTHB(colTotal(i))}</td>)}
            <td className="num">{window.fmtTHB(grand)}</td>
            <td className="num">100.0%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

window.TrendChart = TrendChart;
window.Sparkline = Sparkline;
window.BarList = BarList;
window.Donut = Donut;
window.StackedBarChart = StackedBarChart;
window.SegmentTable = SegmentTable;
window.useSize = useSize;
