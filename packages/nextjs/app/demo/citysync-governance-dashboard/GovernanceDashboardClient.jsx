"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from "recharts";

/* ─── Simulation with dormancy queue ─── */
function generateHistory(months, seed) {
  const data = [];
  let A = 0;
  let dormancyQueue = new Array(12).fill(0);
  let I = seed.issuance;
  let C = seed.capacity;
  const r = seed.r;
  const delta = seed.delta;

  for (let t = 0; t <= months; t++) {
    if (t === 6) C += 80;
    if (t === 8) I += 40;
    if (t === 12) C += 120;
    if (t === 14) I += 60;

    const D = dormancyQueue.reduce((s, v) => s + v, 0);
    const S = A + D;

    const attempted = r * A;
    const burns = Math.min(attempted, C);
    const churnFlow = delta * A;
    const expiry = dormancyQueue[11];

    const iMax = C * (r + delta) / r;
    const eta = I > 0 ? burns / I : 0;
    const U = C > 0 ? burns / C : 0;
    const SCR = C > 0 ? S / C : 0;
    const ASCR = C > 0 ? A / C : 0;
    const ICR = C > 0 ? I / C : 0;
    const DR = S > 0 ? D / S : 0;

    data.push({
      month: t, monthLabel: `M${t}`,
      active: Math.round(A), dormant: Math.round(D), stock: Math.round(S),
      burns: Math.round(burns), expiry: Math.round(expiry),
      issuance: Math.round(I), capacity: Math.round(C), iMax: Math.round(iMax),
      eta: Math.round(eta * 1000) / 1000,
      U: Math.round(U * 1000) / 1000,
      SCR: Math.round(SCR * 100) / 100,
      ASCR: Math.round(ASCR * 100) / 100,
      ICR: Math.round(ICR * 1000) / 1000,
      DR: Math.round(DR * 1000) / 1000,
    });

    A = Math.max(0, A + I - burns - churnFlow);
    const newQueue = new Array(12).fill(0);
    for (let i = 11; i >= 1; i--) newQueue[i] = dormancyQueue[i - 1];
    newQueue[0] = churnFlow;
    dormancyQueue = newQueue;
  }
  return data;
}

/* ─── Health assessment ─── */
function assessHealth(d) {
  let overall = "healthy", overallMsg = "", overallAdvice = "";

  if (d.eta < 0.50 && d.U >= 0.80) {
    overall = "critical";
    overallMsg = "Credits are piling up and services are maxed out.";
    overallAdvice = "Urgent: Pause new task approvals. Expand redemption options immediately.";
  } else if (d.ICR > 1.15) {
    overall = "critical";
    overallMsg = "We're issuing credits faster than the system can handle.";
    overallAdvice = "Urgent: Lower the issuance cap. Do not onboard new Issuers until this stabilizes.";
  } else if (d.ASCR > 6.0) {
    overall = "critical";
    overallMsg = "Active credit balances are dangerously high.";
    overallAdvice = "Urgent: Reduce issuance and expand redemption options.";
  } else if (d.U > 0.85) {
    overall = "caution";
    overallMsg = "Services are getting close to full.";
    overallAdvice = "Priority: Bring in new Redeemer organizations before adding any new Issuers.";
  } else if (d.DR > 0.35) {
    overall = "caution";
    overallMsg = "A large share of participants have gone inactive.";
    overallAdvice = "Focus on retention: survey inactive participants, improve onboarding, make tasks and redemption more appealing.";
  } else if (d.eta < 0.60) {
    overall = "caution";
    overallMsg = "People are earning credits but not spending them.";
    overallAdvice = "Focus on making redemption more attractive — lower prices, better options, simpler process.";
  } else if (d.ASCR > 4.0) {
    overall = "caution";
    overallMsg = "Active credit balances are growing faster than people spend them.";
    overallAdvice = "Watch this closely. If the trend continues, reduce issuance.";
  } else {
    overall = "healthy";
    overallMsg = "Everything is in good shape. There's room to grow if civic need exists.";
    overallAdvice = "Safe to consider onboarding new Issuers or expanding the task catalog.";
  }

  const earning = {
    status: d.eta >= 0.70 ? "good" : d.eta >= 0.50 ? "watch" : "problem",
    label: d.eta >= 0.70 ? "Healthy" : d.eta >= 0.50 ? "Needs attention" : "Problem",
    msg: d.eta >= 0.70
      ? "Most credits earned are also being spent. The earn-spend loop is working."
      : d.eta >= 0.50
        ? "About half of credits go unspent. People may not find redemption options appealing enough, or some are leaving the system."
        : "Most credits aren't being redeemed. This could be a retention problem (people leaving) or a redemption problem (nothing worth spending on)."
  };

  const services = {
    status: d.U <= 0.75 ? "good" : d.U <= 0.85 ? "watch" : "problem",
    label: d.U <= 0.75 ? "Plenty of room" : d.U <= 0.85 ? "Getting busy" : "Near capacity",
    msg: d.U <= 0.75
      ? "Redeemer organizations have capacity to absorb more."
      : d.U <= 0.85
        ? "Services are getting well-used. Start planning for expansion before they fill up."
        : "Services are close to full. New Issuers should wait until capacity expands."
  };

  const backlog = {
    status: d.ASCR <= 3.0 ? "good" : d.ASCR <= 5.0 ? "watch" : "problem",
    label: d.ASCR <= 3.0 ? "Low" : d.ASCR <= 5.0 ? "Building" : "High",
    msg: d.ASCR <= 3.0
      ? "Active participants have manageable credit balances."
      : d.ASCR <= 5.0
        ? "Balances among active participants are growing. If this continues, credits may start to feel less valuable."
        : "Active participants have large unspent balances. They're looking at credits they can't spend. Act soon."
  };

  const retention = {
    status: d.DR <= 0.20 ? "good" : d.DR <= 0.35 ? "watch" : "problem",
    label: d.DR <= 0.20 ? "Strong" : d.DR <= 0.35 ? "Some attrition" : "Losing people",
    msg: d.DR <= 0.20
      ? "Most participants are staying active. The community is engaged."
      : d.DR <= 0.35
        ? "Some participants have gone inactive. Their credits are waiting to expire in 12 months."
        : "A large share of the community has gone quiet. This is a retention issue — review task quality, onboarding, and redemption attractiveness."
  };

  return { overall, overallMsg, overallAdvice, earning, services, backlog, retention };
}

/* ─── Components ─── */
const statusColors = {
  healthy: { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46", dot: "#10b981", glow: "0 0 20px rgba(16,185,129,0.15)" },
  caution: { bg: "#fffbeb", border: "#fcd34d", text: "#78350f", dot: "#f59e0b", glow: "0 0 20px rgba(245,158,11,0.15)" },
  critical: { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", dot: "#ef4444", glow: "0 0 20px rgba(239,68,68,0.15)" },
};
const indicatorColors = {
  good: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", text: "#166534" },
  watch: { bg: "#fefce8", border: "#fef08a", dot: "#eab308", text: "#713f12" },
  problem: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", text: "#991b1b" },
};

function OverallBanner({ health }) {
  const c = statusColors[health.overall];
  const icon = health.overall === "healthy" ? "✓" : health.overall === "caution" ? "⚠" : "✕";
  return (
    <div style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 16, padding: "24px 28px", boxShadow: c.glow, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.dot, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>
            {health.overall === "healthy" ? "System is Healthy" : health.overall === "caution" ? "Needs Attention" : "Action Required"}
          </div>
          <div style={{ fontSize: 14, color: c.text, opacity: 0.8, marginTop: 2 }}>{health.overallMsg}</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: c.text, fontWeight: 500, marginTop: 8, borderLeft: `4px solid ${c.dot}` }}>
        <span style={{ fontWeight: 700 }}>Recommendation: </span>{health.overallAdvice}
      </div>
    </div>
  );
}

function IndicatorCard({ title, subtitle, value, unit, health, icon }) {
  const c = indicatorColors[health.status];
  return (
    <div style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 14, padding: "16px 18px", flex: "1 1 0", minWidth: 180 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 18 }}>{icon}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: c.text, fontFamily: "'Georgia', serif" }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "#6b7280" }}>{unit}</span>}
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: "4px 10px", marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{health.label}</span>
      </div>
      <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>{health.msg}</div>
    </div>
  );
}

function ActionItem({ text, priority }) {
  const colors = {
    now: { bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444", label: "Act Now" },
    soon: { bg: "#fffbeb", border: "#fcd34d", dot: "#f59e0b", label: "Plan For" },
    ready: { bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", label: "When Ready" },
  };
  const c = colors[priority];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 13 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: c.dot, background: "white", borderRadius: 4, padding: "2px 6px", flexShrink: 0, marginTop: 1, border: `1px solid ${c.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
      <div style={{ color: "#374151", lineHeight: 1.4 }}>{text}</div>
    </div>
  );
}

function SimpleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>Month {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: "#6b7280" }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontWeight: 600, color: "#111827", fontFamily: "monospace" }}>
            {typeof p.value === 'number' ? (p.value < 10 ? p.value.toFixed(2) : p.value.toLocaleString()) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Scenarios ─── */
const scenarios = {
  healthy: { label: "Healthy Growth", issuance: 400, capacity: 650, r: 0.15, delta: 0.02 },
  ceiling: { label: "Approaching Ceiling", issuance: 550, capacity: 550, r: 0.14, delta: 0.025 },
  shallow: { label: "Shallow Redemption", issuance: 400, capacity: 700, r: 0.07, delta: 0.02 },
  churn: { label: "High Churn", issuance: 450, capacity: 600, r: 0.13, delta: 0.07 },
};

/* ─── Main ─── */
export default function GovernanceDashboard() {
  const [scenario, setScenario] = useState("healthy");
  const [viewMonth, setViewMonth] = useState(18);

  const seed = scenarios[scenario];
  const history = useMemo(() => generateHistory(24, seed), [scenario]);
  const current = history[Math.min(viewMonth, history.length - 1)];
  const health = assessHealth(current);

  const actions = [];
  if (health.overall === "critical") {
    if (current.ICR > 1.0) actions.push({ text: "Lower the issuance cap. We are issuing more credits than the system can absorb.", priority: "now" });
    if (current.U > 0.85) actions.push({ text: "Bring in new Redeemer organizations to increase service capacity.", priority: "now" });
    if (current.ASCR > 6) actions.push({ text: "Pause all new Issuer onboarding until active credit balances come down.", priority: "now" });
  }
  if (health.retention.status === "problem") {
    actions.push({ text: "Participant retention is the top priority. Survey inactive members. Simplify onboarding. Review task quality and redemption satisfaction.", priority: health.overall === "critical" ? "now" : "soon" });
  }
  if (health.services.status === "problem" || health.services.status === "watch") {
    actions.push({ text: "Identify which services are busiest (transit? childcare?) and explore expanding those first.", priority: current.U > 0.85 ? "now" : "soon" });
  }
  if (health.earning.status === "problem" || health.earning.status === "watch") {
    actions.push({ text: "Are people not spending because options aren't appealing, or because they've gone inactive? Check if low earn-spend is driven by churn or by poor redemption options.", priority: "soon" });
  }
  if (health.backlog.status === "watch") {
    actions.push({ text: "Active participants are accumulating credits. Consider lowering redemption prices or adding new services.", priority: "soon" });
  }
  if (health.overall === "healthy" && current.U < 0.65 && current.eta > 0.70) {
    actions.push({ text: "The system has room. If there are neighborhoods without an Issuer, or civic needs going unmet, now is a good time to expand.", priority: "ready" });
  }
  if (actions.length === 0) {
    actions.push({ text: "Continue monthly monitoring. The system is operating well within its targets.", priority: "ready" });
  }

  const trendStart = Math.max(0, viewMonth - 5);
  const trendData = history.slice(trendStart, viewMonth + 1);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif", padding: "24px 20px", color: "#1e293b" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>CS</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>CitySync Governance Dashboard</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Monthly health check for the civic-credit economy. Credits expire after 12 months of inactivity.</p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Scenario</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(scenarios).map(([key, val]) => (
                <button key={key} onClick={() => setScenario(key)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid",
                  borderColor: scenario === key ? "#6366f1" : "#e2e8f0",
                  background: scenario === key ? "#eef2ff" : "white",
                  color: scenario === key ? "#4338ca" : "#64748b",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{val.label}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Viewing Month {viewMonth}</div>
            <input type="range" min={3} max={24} value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))} style={{ width: "100%", accentColor: "#6366f1" }} />
          </div>
        </div>

        <OverallBanner health={health} />

        {/* Four Indicators */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <IndicatorCard title="Earn → Spend Loop" subtitle="Are credits being used?" value={(current.eta * 100).toFixed(0) + "%"} health={health.earning} icon="🔄" />
          <IndicatorCard title="Service Capacity" subtitle="How full are Redeemers?" value={(current.U * 100).toFixed(0) + "%"} health={health.services} icon="🏛️" />
          <IndicatorCard title="Active Backlog" subtitle="Months of active credit pressure" value={current.ASCR.toFixed(1)} unit="months" health={health.backlog} icon="📊" />
          <IndicatorCard title="Retention" subtitle="Are people staying active?" value={((1 - current.DR) * 100).toFixed(0) + "%"} unit="active" health={health.retention} icon="👥" />
        </div>

        {/* Actions */}
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>What Should We Do?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map((a, i) => <ActionItem key={i} text={a.text} priority={a.priority} />)}
          </div>
        </div>

        {/* Credit Flow Chart */}
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Credit Balances — Active vs. Inactive</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>Active credits are held by engaged participants. Inactive credits belong to people who've stopped participating and will expire after 12 months of inactivity.</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip content={<SimpleTooltip />} />
              <Area type="monotone" dataKey="active" name="Active Credits" stackId="1" fill="#6366f1" fillOpacity={0.15} stroke="#6366f1" strokeWidth={2} />
              <Area type="monotone" dataKey="dormant" name="Inactive Credits" stackId="1" fill="#c4b5fd" fillOpacity={0.12} stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Flows Chart */}
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Monthly Credit Flow</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>Credits issued each month vs. credits spent. The gap between them accumulates as unspent balance.</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthLabel" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip content={<SimpleTooltip />} />
              <Line type="monotone" dataKey="issuance" name="Credits Issued" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3, fill: "#3b82f6" }} strokeDasharray="6 3" />
              <Line type="monotone" dataKey="burns" name="Credits Spent" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
              <Line type="monotone" dataKey="expiry" name="Expired (inactive)" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2, fill: "#f59e0b" }} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="capacity" name="Max Capacity" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Numbers */}
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "18px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>This Month's Numbers</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { label: "Credits Issued", value: current.issuance.toLocaleString(), sub: "new this month" },
              { label: "Credits Spent", value: current.burns.toLocaleString(), sub: "redeemed & burned" },
              { label: "Credits Expired", value: current.expiry.toLocaleString(), sub: "from inactive accounts" },
              { label: "Active Balance", value: current.active.toLocaleString(), sub: "held by active people" },
              { label: "Inactive Balance", value: current.dormant.toLocaleString(), sub: "held by inactive people" },
              { label: "Growth Headroom", value: Math.max(0, current.iMax - current.issuance).toLocaleString(), sub: "credits before limit" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", fontFamily: "'Georgia', serif", margin: "2px 0" }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <details style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "14px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer" }}>
          <summary style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", outline: "none" }}>What Do These Terms Mean?</summary>
          <div style={{ marginTop: 12, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
            <p><strong>Earn → Spend Loop:</strong> When someone does civic work and earns credits, do they actually use those credits? This measures what percentage of credits issued get redeemed. Higher is better — it means the system is delivering value on both sides.</p>
            <p><strong>Service Capacity:</strong> Redeemer organizations (transit, libraries, museums, etc.) can only absorb so many credits per month. This shows how close we are to those limits.</p>
            <p><strong>Active Backlog:</strong> How many months it would take for active participants to spend all their credits if they redeemed as fast as possible. A small backlog (1-3 months) is normal. A large one means credits are losing their meaning for active participants.</p>
            <p><strong>Retention:</strong> What percentage of all outstanding credits belong to people who are still active? When someone stops earning and redeeming for 12 months, their credits expire automatically. This indicator shows whether we're keeping people engaged. High retention means a healthy, active community.</p>
            <p><strong>Inactive Credits:</strong> Credits held by people who haven't earned or redeemed in a while. After 12 months of inactivity, these credits expire and leave the system. This keeps the numbers clean without penalizing anyone who's actively participating.</p>
            <p><strong>Growth Headroom:</strong> How many more credits per month we could safely issue before the system hits its limit. When this number is large, it's safe to expand. When it's small or zero, we need to expand services before issuing more.</p>
          </div>
        </details>

        <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", padding: "8px 0 20px" }}>
          CitySync Governance Dashboard · Dormancy-Based Expiry Model · Simulation Mode
        </div>
      </div>
    </div>
  );
}
