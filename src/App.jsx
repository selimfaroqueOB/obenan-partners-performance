import { useState, useMemo, useEffect } from "react";
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
} from "recharts";
import { fetchAllData } from "./fetchData.js";
import {
  CURRENT_MONTH_IDX as FALLBACK_MONTH, MONTHS, CHANNEL_COLORS,
  PERF as FALLBACK_PERF, PARTNERS as FALLBACK_PARTNERS,
} from "./data.js";

const fmt = (n) => n >= 1000 ? `€${(n/1000).toFixed(1)}k` : `€${Math.round(n)}`;
const fmtFull = (n) => `€${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

function KPICard({ label, value, sub, accent, status }) {
  const statusColor = status === "positive" ? "#4ADE80" : status === "negative" ? "#F87171" : "#94A3B8";
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "28px 24px",
      flex: 1, minWidth: 200, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accent || "rgba(255,255,255,0.1)",
      }} />
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8B95A5", marginBottom: 12, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#F0F2F5", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 13, color: statusColor, marginTop: 8, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F0F2F5", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{children}</h2>
      {sub && <p style={{ fontSize: 13, color: "#6B7585", margin: "4px 0 0", fontWeight: 400 }}>{sub}</p>}
    </div>
  );
}

function ChannelBadge({ channel }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: CHANNEL_COLORS[channel] + "22",
      color: CHANNEL_COLORS[channel],
      letterSpacing: "0.02em",
    }}>
      {channel}
    </span>
  );
}

function StatusDot({ value }) {
  const color = value > 0 ? "#4ADE80" : "#334155";
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, marginRight: 6 }} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E2433", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "12px 16px", fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, color: "#F0F2F5", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginTop: 3 }}>
          {p.name}: {fmtFull(Math.round(p.value))}
        </div>
      ))}
    </div>
  );
};

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0F1219", color: "#F0F2F5",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "linear-gradient(135deg, #7CB5E8, #A8D5A2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 700, color: "#0F1219",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>O</div>
      <div style={{ fontSize: 15, color: "#6B7585" }}>Loading partner data from Google Sheets...</div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }`}</style>
    </div>
  );
}

function MonthSelect({ value, onChange, label }) {
  const selectStyle = {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#F0F2F5",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#6B7585" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} style={selectStyle}>
        {MONTHS.map((m, i) => (
          <option key={i} value={i} style={{ background: "#1E2433" }}>{m}</option>
        ))}
      </select>
    </div>
  );
}

export default function App() {
  const [PERF, setPERF] = useState(null);
  const [PARTNERS, setPARTNERS] = useState(null);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(FALLBACK_MONTH);
  const [dataSource, setDataSource] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [partnerSort, setPartnerSort] = useState("mrr2026");
  const [showInactive, setShowInactive] = useState(false);
  const [periodFrom, setPeriodFrom] = useState(0);
  const [periodTo, setPeriodTo] = useState(FALLBACK_MONTH);

  useEffect(() => {
    fetchAllData()
      .then(({ perf, partners }) => {
        setPERF(perf);
        setPARTNERS(partners);
        setCurrentMonthIdx(perf.currentMonthIdx);
        setPeriodTo(perf.currentMonthIdx);
        setDataSource("live");
        setLastUpdated(new Date());
      })
      .catch((err) => {
        console.warn("Failed to fetch live data, using fallback:", err);
        setPERF(FALLBACK_PERF);
        setPARTNERS(FALLBACK_PARTNERS);
        setCurrentMonthIdx(FALLBACK_MONTH);
        setDataSource("fallback");
      });
  }, []);

  // useMemo hooks must be called before any early returns to maintain consistent hook ordering
  const allPartners = useMemo(() => {
    if (!PARTNERS) return [];
    const list = [];
    ["referrals", "resellers", "agencies"].forEach(ch => {
      (PARTNERS[ch] || []).forEach(p => {
        const ytd = p.mrr2026.reduce((a, b) => a + b, 0);
        list.push({ ...p, channel: ch.charAt(0).toUpperCase() + ch.slice(1), ytdMRR: ytd });
      });
    });
    return list;
  }, [PARTNERS]);

  const filteredPartners = useMemo(() => {
    let list = allPartners;
    if (selectedChannel !== "all") list = list.filter(p => p.channel === selectedChannel);
    if (!showInactive) list = list.filter(p => p.arr > 0 || p.ytdMRR > 0);
    list = [...list].sort((a, b) => {
      if (partnerSort === "mrr2026") return b.ytdMRR - a.ytdMRR || b.arr - a.arr;
      if (partnerSort === "mrrMonthly") return (b.ytdMRR / 12) - (a.ytdMRR / 12) || b.arr - a.arr;
      if (partnerSort === "arr") return b.arr - a.arr;
      if (partnerSort === "mrrAvg") return b.mrrAvg - a.mrrAvg;
      if (partnerSort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [allPartners, selectedChannel, showInactive, partnerSort]);

  const inactivePartnersByCountry = useMemo(() => {
    // Include partners with no ARR activity (both historical and 2026)
    const inactive = allPartners.filter(p => p.arr === 0 && p.ytdMRR === 0);
    const grouped = {};
    inactive.forEach(p => {
      const country = p.country || "Unknown";
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(p);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allPartners]);

  if (!PERF || !PARTNERS) return <LoadingScreen />;

  // Use period range for calculations
  const fromIdx = Math.min(periodFrom, periodTo);
  const toIdx = Math.max(periodFrom, periodTo);

  const periodMRR = PERF.totalClosedMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0);
  const periodTargetMRR = PERF.totalTargetMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0);
  const periodARR = PERF.totalClosedARR ? PERF.totalClosedARR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0) : 0;
  const achievement = periodTargetMRR > 0 ? periodMRR / periodTargetMRR : 0;
  const variance = periodMRR - periodTargetMRR;

  const channelData = MONTHS.map((m, i) => ({
    month: m,
    "Referrals Actual": PERF.referrals.closedMRR[i],
    "Resellers Actual": PERF.resellers.closedMRR[i],
    "Agencies Actual": PERF.agencies.closedMRR[i],
    "Target": PERF.totalTargetMRR[i],
  }));

  const channelSummary = [
    {
      name: "Referrals",
      actual: PERF.referrals.closedMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      target: PERF.referrals.targetMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      allocation: "30%",
      partners: PARTNERS.referrals.length,
      active: PARTNERS.referrals.filter(p => p.arr > 0 || p.mrr2026.reduce((a, b) => a + b, 0) > 0).length,
    },
    {
      name: "Resellers",
      actual: PERF.resellers.closedMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      target: PERF.resellers.targetMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      allocation: "60%",
      partners: PARTNERS.resellers.length,
      active: PARTNERS.resellers.filter(p => p.arr > 0 || p.mrr2026.reduce((a, b) => a + b, 0) > 0).length,
    },
    {
      name: "Agencies",
      actual: PERF.agencies.closedMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      target: PERF.agencies.targetMRR.slice(fromIdx, toIdx + 1).reduce((a, b) => a + b, 0),
      allocation: "10%",
      partners: PARTNERS.agencies.length,
      active: PARTNERS.agencies.filter(p => p.arr > 0 || p.mrr2026.reduce((a, b) => a + b, 0) > 0).length,
    },
  ];

  const trendData = MONTHS.map((m, i) => {
    const actual = PERF.totalClosedMRR.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const target = PERF.totalTargetMRR.slice(0, i + 1).reduce((a, b) => a + b, 0);
    return { month: m, "Actual Cumulative": i <= currentMonthIdx ? actual : null, "Target Cumulative": target };
  });

  const inactiveCount = allPartners.filter(p => p.arr === 0 && p.ytdMRR === 0).length;
  const activeCount = allPartners.length - inactiveCount;

  const btnStyle = (active) => ({
    padding: "6px 16px", borderRadius: 8,
    border: "1px solid " + (active ? "rgba(124,181,232,0.4)" : "rgba(255,255,255,0.08)"),
    background: active ? "rgba(124,181,232,0.12)" : "transparent",
    color: active ? "#7CB5E8" : "#8B95A5",
    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
  });

  const periodLabel = fromIdx === 0 && toIdx === currentMonthIdx
    ? "YTD"
    : fromIdx === toIdx
    ? MONTHS[fromIdx]
    : `${MONTHS[fromIdx]}-${MONTHS[toIdx]}`;

  return (
    <div style={{
      minHeight: "100vh", background: "#0F1219", color: "#F0F2F5",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "40px 48px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(124,181,232,0.04) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #7CB5E8, #A8D5A2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#0F1219",
            }}>O</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Partner Performance</h1>
              <p style={{ fontSize: 13, color: "#6B7585", margin: "2px 0 0" }}>
                OBENAN · 2026 · Updated through {MONTHS[currentMonthIdx]}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MonthSelect value={periodFrom} onChange={setPeriodFrom} label="From" />
              <MonthSelect value={periodTo} onChange={setPeriodTo} label="To" />
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: dataSource === "live" ? "#4ADE80" : dataSource === "fallback" ? "#FBBF24" : "#6B7585",
              }} />
              <span style={{ fontSize: 12, color: "#6B7585" }}>
                {dataSource === "live" && lastUpdated
                  ? `Live · ${lastUpdated.toLocaleTimeString()}`
                  : dataSource === "fallback"
                  ? "Offline mode (cached data)"
                  : "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "32px 48px 48px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPI Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          <KPICard label={`${periodLabel} Partner MRR`} value={fmtFull(periodMRR)}
            sub={`${variance >= 0 ? "+" : ""}${fmtFull(variance)} vs target`}
            accent="#7CB5E8" status={variance >= 0 ? "positive" : "negative"} />
          <KPICard label="Target Achievement" value={pct(achievement)}
            accent={achievement >= 1 ? "#4ADE80" : "#F87171"}
            status={achievement >= 1 ? "positive" : "negative"} />
          <KPICard label={`${periodLabel} ARR Closed`} value={fmtFull(periodARR)} accent="#A8D5A2" />
          <KPICard label="Active Partners" value={`${activeCount} / ${allPartners.length}`}
            accent="#E8927C" />
        </div>

        {/* Channel Cards */}
        <SectionTitle sub={`Actual vs. target by partner channel — ${periodLabel}`}>Channel Performance</SectionTitle>
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          {channelSummary.map(ch => {
            const ratio = ch.target > 0 ? ch.actual / ch.target : 0;
            const isOver = ratio >= 1;
            return (
              <div key={ch.name} style={{
                flex: 1, minWidth: 280, background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 4, background: CHANNEL_COLORS[ch.name] }} />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{ch.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#6B7585" }}>Allocation: {ch.allocation}</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#6B7585", textTransform: "uppercase", letterSpacing: "0.08em" }}>Actual</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{fmtFull(ch.actual)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#6B7585", textTransform: "uppercase", letterSpacing: "0.08em" }}>Target</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#6B7585" }}>{fmtFull(Math.round(ch.target))}</div>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{
                    height: "100%", borderRadius: 6,
                    width: `${Math.min(ratio * 100, 100)}%`,
                    background: isOver ? `linear-gradient(90deg, ${CHANNEL_COLORS[ch.name]}, #4ADE80)` : CHANNEL_COLORS[ch.name],
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: isOver ? "#4ADE80" : "#F87171", fontWeight: 600 }}>{pct(ratio)} achieved</span>
                  <span style={{ color: "#6B7585" }}>{ch.active}/{ch.partners} active</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie Charts Row */}
        {(() => {
          const allocationData = [
            { name: "Referrals", value: (PERF.refTargetPct || 0.3) * 100, color: CHANNEL_COLORS.Referrals },
            { name: "Resellers", value: (PERF.resTargetPct || 0.6) * 100, color: CHANNEL_COLORS.Resellers },
            { name: "Agencies", value: (PERF.agTargetPct || 0.1) * 100, color: CHANNEL_COLORS.Agencies },
          ];
          const annualTargetData = [
            { name: "Referrals", value: PERF.refTargetAnnual || 0, color: CHANNEL_COLORS.Referrals },
            { name: "Resellers", value: PERF.resTargetAnnual || 0, color: CHANNEL_COLORS.Resellers },
            { name: "Agencies", value: PERF.agTargetAnnual || 0, color: CHANNEL_COLORS.Agencies },
          ];
          const totalAnnualTarget = annualTargetData.reduce((a, b) => a + b.value, 0);
          const partnerDistData = [
            { name: "Referrals", value: PARTNERS.referrals.length, color: CHANNEL_COLORS.Referrals },
            { name: "Resellers", value: PARTNERS.resellers.length, color: CHANNEL_COLORS.Resellers },
            { name: "Agencies", value: PARTNERS.agencies.length, color: CHANNEL_COLORS.Agencies },
          ];
          const totalPartners = partnerDistData.reduce((a, b) => a + b.value, 0);

          const pieCardStyle = {
            flex: 1, minWidth: 280, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24,
          };

          const legendStyle = {
            display: "flex", flexDirection: "column", gap: 8, justifyContent: "center",
          };

          const legendItemStyle = {
            display: "flex", alignItems: "center", gap: 8, fontSize: 13,
          };

          const legendDotStyle = (color) => ({
            width: 10, height: 10, borderRadius: "50%", background: color,
          });

          return (
            <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
              {/* Target Allocation */}
              <div style={pieCardStyle}>
                <SectionTitle sub="MRR split across partner types">Target Allocation</SectionTitle>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={legendStyle}>
                    {allocationData.map((entry, i) => (
                      <div key={i} style={legendItemStyle}>
                        <div style={legendDotStyle(entry.color)} />
                        <span style={{ color: "#8B95A5" }}>{entry.name}</span>
                        <span style={{ color: "#F0F2F5", fontWeight: 600, marginLeft: "auto" }}>{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Annual MRR Target */}
              <div style={pieCardStyle}>
                <SectionTitle sub="Full year target by channel">Annual MRR Target</SectionTitle>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={annualTargetData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          dataKey="value"
                          stroke="none"
                        >
                          {annualTargetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F0F2F5" }}>{fmt(totalAnnualTarget)}</div>
                      <div style={{ fontSize: 10, color: "#6B7585" }}>Total</div>
                    </div>
                  </div>
                  <div style={legendStyle}>
                    {annualTargetData.map((entry, i) => (
                      <div key={i} style={legendItemStyle}>
                        <div style={legendDotStyle(entry.color)} />
                        <span style={{ color: "#8B95A5" }}>{entry.name}</span>
                        <span style={{ color: "#F0F2F5", fontWeight: 600, marginLeft: "auto" }}>{fmtFull(Math.round(entry.value))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Partner Distribution */}
              <div style={pieCardStyle}>
                <SectionTitle sub="Number of partners by channel">Partner Distribution</SectionTitle>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={partnerDistData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          dataKey="value"
                          stroke="none"
                        >
                          {partnerDistData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#F0F2F5" }}>{totalPartners}</div>
                      <div style={{ fontSize: 10, color: "#6B7585" }}>Total</div>
                    </div>
                  </div>
                  <div style={legendStyle}>
                    {partnerDistData.map((entry, i) => (
                      <div key={i} style={legendItemStyle}>
                        <div style={legendDotStyle(entry.color)} />
                        <span style={{ color: "#8B95A5" }}>{entry.name}</span>
                        <span style={{ color: "#F0F2F5", fontWeight: 600, marginLeft: "auto" }}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Charts Row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
          <div style={{
            flex: 2, minWidth: 400, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24,
          }}>
            <SectionTitle sub="Monthly closed MRR by channel vs. total target">Monthly Performance</SectionTitle>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={channelData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#6B7585", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7585", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value) => <span style={{ color: "#8B95A5", fontSize: 12 }}>{value.replace(" Actual", "")}</span>}
                />
                <Bar dataKey="Target" fill="#4A5568" name="Target" radius={[4,4,0,0]} />
                <Bar dataKey="Referrals Actual" stackId="a" fill={CHANNEL_COLORS.Referrals} name="Referrals Actual" />
                <Bar dataKey="Resellers Actual" stackId="a" fill={CHANNEL_COLORS.Resellers} name="Resellers Actual" />
                <Bar dataKey="Agencies Actual" stackId="a" fill={CHANNEL_COLORS.Agencies} radius={[4,4,0,0]} name="Agencies Actual" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            flex: 1, minWidth: 320, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24,
          }}>
            <SectionTitle sub="Cumulative MRR actual vs. target">YTD Trajectory</SectionTitle>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#6B7585", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7585", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Target Cumulative" stroke="#6B7585" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                <Line type="monotone" dataKey="Actual Cumulative" stroke="#7CB5E8" strokeWidth={2.5} dot={{ fill: "#7CB5E8", r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partner Table */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: 24, marginBottom: 40,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <SectionTitle sub="Click column headers to sort · Filter by channel or toggle inactive partners">Partner Breakdown</SectionTitle>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {["all", "Referrals", "Resellers", "Agencies"].map(ch => (
                <button key={ch} onClick={() => setSelectedChannel(ch)} style={btnStyle(selectedChannel === ch)}>
                  {ch === "all" ? "All Channels" : ch}
                </button>
              ))}
              <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
              <button onClick={() => setShowInactive(!showInactive)} style={btnStyle(showInactive)}>
                {showInactive ? "Hide" : "Show"} Inactive ({inactiveCount})
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {[
                    { key: "name", label: "Partner", align: "left" },
                    { key: null, label: "Channel", align: "left" },
                    { key: null, label: "Country", align: "left" },
                    { key: null, label: "Contract", align: "center" },
                    { key: "arr", label: "ARR Closed Until 2025", align: "right" },
                    { key: "mrrAvg", label: "Avg Monthly MRR", align: "right" },
                    { key: "mrr2026", label: "ARR Closed 2026 YTD", align: "right" },
                    { key: "mrrMonthly", label: "MRR Closed 2026 YTD", align: "right" },
                  ].map((col, i) => (
                    <th key={i} onClick={() => col.key && setPartnerSort(col.key)} style={{
                      padding: "12px 14px", textAlign: col.align,
                      color: partnerSort === col.key ? "#7CB5E8" : "#6B7585",
                      fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                      letterSpacing: "0.08em", cursor: col.key ? "pointer" : "default",
                      whiteSpace: "nowrap", userSelect: "none",
                    }}>
                      {col.label} {partnerSort === col.key ? "↓" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px", fontWeight: 500 }}>
                      <StatusDot value={p.ytdMRR} />{p.name}
                    </td>
                    <td style={{ padding: "12px 14px" }}><ChannelBadge channel={p.channel} /></td>
                    <td style={{ padding: "12px 14px", color: "#8B95A5" }}>{p.country}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600, color: p.contract === "V" ? "#4ADE80" : "#F87171" }}>
                      {p.contract || "V"}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                      {p.arr > 0 ? fmtFull(p.arr) : <span style={{ color: "#334155" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                      {p.mrrAvg > 0 ? fmtFull(Math.round(p.mrrAvg)) : <span style={{ color: "#334155" }}>—</span>}
                    </td>
                    <td style={{
                      padding: "12px 14px", textAlign: "right", fontFamily: "monospace",
                      fontSize: 13, fontWeight: 600, color: p.ytdMRR > 0 ? "#4ADE80" : "#334155",
                    }}>
                      {p.ytdMRR > 0 ? fmtFull(p.ytdMRR) : "—"}
                    </td>
                    <td style={{
                      padding: "12px 14px", textAlign: "right", fontFamily: "monospace",
                      fontSize: 13, color: p.ytdMRR > 0 ? "#F0F2F5" : "#334155",
                    }}>
                      {p.ytdMRR > 0 ? fmtFull(Math.round(p.ytdMRR / 12)) : "—"}
                    </td>
                  </tr>
                ))}
                {filteredPartners.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#6B7585" }}>No partners match the current filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#6B7585" }}>
            Showing {filteredPartners.length} of {allPartners.length} partners
          </div>
        </div>

        {/* Inactive Alert */}
        <div style={{
          background: "rgba(232,146,124,0.08)", border: "1px solid rgba(232,146,124,0.2)",
          borderRadius: 16, padding: 24,
        }}>
          <SectionTitle sub={`${inactiveCount} partners have generated zero ARR (both historical and 2026)`}>
            Inactive Partners Requiring Attention
          </SectionTitle>
          {inactivePartnersByCountry.map(([country, partners]) => (
            <div key={country} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#8B95A5", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {country}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {partners.map((p, i) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 12,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8B95A5",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {p.name}
                    {p.contract === "X" && (
                      <span style={{ color: "#F87171", fontWeight: 600 }}>✗</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p style={{ fontSize: 13, color: "#8B95A5", marginTop: 16, lineHeight: 1.6 }}>
            Consider scheduling check-ins with these partners to assess engagement, or archive those with no pipeline potential.
          </p>
        </div>

        {/* Partners Without Contract */}
        {(() => {
          const noContractPartners = allPartners.filter(p => p.contract === "X");
          const byChannel = {
            Referrals: noContractPartners.filter(p => p.channel === "Referrals"),
            Resellers: noContractPartners.filter(p => p.channel === "Resellers"),
            Agencies: noContractPartners.filter(p => p.channel === "Agencies"),
          };
          return (
            <div style={{
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: 16, padding: 24, marginTop: 40,
            }}>
              <SectionTitle sub={`${noContractPartners.length} partners without signed agreements`}>
                Partners Without Contract
              </SectionTitle>
              {Object.entries(byChannel).map(([channel, partners]) => partners.length > 0 && (
                <div key={channel} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: CHANNEL_COLORS[channel] }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8B95A5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {channel}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {partners.map((p, i) => (
                      <span key={i} style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 12,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8B95A5",
                      }}>
                        {p.name} {p.country && <span style={{ color: "#6B7585" }}>({p.country})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {noContractPartners.length === 0 && (
                <p style={{ fontSize: 13, color: "#6B7585" }}>All partners have signed contracts.</p>
              )}
            </div>
          );
        })()}

        {/* Partner Directory */}
        {(() => {
          const [dirSort, setDirSort] = [partnerSort, setPartnerSort];
          const sortedAll = [...allPartners].sort((a, b) => {
            if (dirSort === "name") return a.name.localeCompare(b.name);
            if (dirSort === "channel") return a.channel.localeCompare(b.channel);
            return a.name.localeCompare(b.name);
          });
          return (
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 24, marginTop: 40,
            }}>
              <SectionTitle sub="Complete list of all partners with contact and contract details">Partner Directory</SectionTitle>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {[
                        { key: "name", label: "Partner Name", align: "left" },
                        { key: "channel", label: "Channel", align: "left" },
                        { key: null, label: "Country", align: "left" },
                        { key: null, label: "Contact Person", align: "left" },
                        { key: null, label: "Commission Structure", align: "left" },
                        { key: null, label: "Start Date", align: "left" },
                        { key: null, label: "Contract", align: "center" },
                      ].map((col, i) => (
                        <th key={i} onClick={() => col.key && setPartnerSort(col.key)} style={{
                          padding: "12px 14px", textAlign: col.align,
                          color: partnerSort === col.key ? "#7CB5E8" : "#6B7585",
                          fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                          letterSpacing: "0.08em", cursor: col.key ? "pointer" : "default",
                          whiteSpace: "nowrap", userSelect: "none",
                        }}>
                          {col.label} {partnerSort === col.key ? "↓" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAll.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px", fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: "12px 14px" }}><ChannelBadge channel={p.channel} /></td>
                        <td style={{ padding: "12px 14px", color: "#8B95A5" }}>{p.country || "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#8B95A5" }}>{p.contactPerson || "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#8B95A5", fontSize: 12, maxWidth: 200 }}>{p.commission || "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#8B95A5", fontFamily: "monospace" }}>{p.start || "—"}</td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600, color: p.contract === "V" ? "#4ADE80" : "#F87171" }}>
                          {p.contract}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#6B7585" }}>
                Total: {allPartners.length} partners
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
