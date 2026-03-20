"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ComposedChart,
  Area
} from "recharts";

const COLORS = {
  active: "#6366f1",
  dormant: "#a78bfa",
  total: "#818cf8",
  burns: "#10b981",
  expiry: "#f59e0b",
  churn: "#f97316",
  issuance: "#3b82f6",
  capacity: "#ef4444",
  eta: "#10b981",
  util: "#6366f1",
  scr: "#f59e0b",
  ascr: "#8b5cf6",
  icr: "#ef4444",
  dr: "#f97316",
};

function Slider({ label, value, onChange, min, max, step, unit = "", sublabel }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>
          {sublabel && <div className="text-[10px] text-gray-500">{sublabel}</div>}
        </div>
        <span className="text-sm font-mono font-semibold text-gray-200">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #6366f1 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%)` }}
      />
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, status, sublabel }) {
  const statusColor = {
    healthy: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    warning: "bg-amber-500/20 border-amber-500/40 text-amber-400",
    danger: "bg-red-500/20 border-red-500/40 text-red-400",
    neutral: "bg-gray-500/20 border-gray-500/40 text-gray-400",
  }[status] || "bg-gray-500/20 border-gray-500/40 text-gray-400";
  return (
    <div className={`rounded-lg border px-3 py-2 ${statusColor}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="text-lg font-mono font-bold">{value}<span className="text-xs font-normal ml-1">{unit}</span></div>
      {sublabel && <div className="text-[10px] opacity-60 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function getEtaStatus(v) { return v >= 0.70 ? "healthy" : v >= 0.50 ? "warning" : "danger"; }
function getUStatus(v) { return v <= 0.80 ? "healthy" : v <= 0.90 ? "warning" : "danger"; }
function getSCRStatus(v) { return v <= 5.0 ? "healthy" : v <= 8.0 ? "warning" : "danger"; }
function getASCRStatus(v) { return v <= 4.0 ? "healthy" : v <= 6.0 ? "warning" : "danger"; }
function getICRStatus(v, crit) { return v <= 0.85 ? "healthy" : v < crit ? "warning" : "danger"; }
function getDRStatus(v) { return v <= 0.20 ? "healthy" : v <= 0.35 ? "warning" : "danger"; }

function diagnose(eta, U, SCR, ASCR, ICR, icrCrit, DR) {
  if (eta >= 0.70 && U <= 0.75 && ASCR <= 4.0 && ICR <= 0.85) {
    return { text: "Healthy — safe to expand issuance if civic need exists", color: "text-emerald-400" };
  }
  if (eta >= 0.70 && U > 0.80) {
    return { text: "Healthy but approaching ceiling — expand Redeemer capacity before adding Issuers", color: "text-amber-400" };
  }
  if (eta < 0.50 && U < 0.50) {
    return { text: "Shallow redemption — improve offerings, lower costs, fix UX. Do NOT add Issuers.", color: "text-amber-400" };
  }
  if (eta < 0.50 && U >= 0.80) {
    return { text: "Over-issuance spiral — freeze issuance, expand Redeemer capacity urgently", color: "text-red-400" };
  }
  if (U > 0.90 && ASCR > 4.0) {
    return { text: "Saturation — system is popular but Redeemer universe is too small", color: "text-red-400" };
  }
  if (ICR >= icrCrit) {
    return { text: "Issuance exceeds sustainable threshold — reduce issuance cap immediately", color: "text-red-400" };
  }
  if (ASCR > 6.0) {
    return { text: "Active stock accumulation dangerous — governance intervention required", color: "text-red-400" };
  }
  if (DR > 0.35) {
    return { text: "High dormancy — many participants have gone inactive. Focus on retention and re-engagement.", color: "text-amber-400" };
  }
  if (eta < 0.70) {
    return { text: "Redemption efficiency below target — investigate whether it's churn or low redemption attractiveness", color: "text-amber-400" };
  }
  return { text: "System within tolerance — monitor trends", color: "text-gray-400" };
}

export default function CivicCreditSimulator() {
  const [issuance, setIssuance] = useState(500);
  const [capacity, setCapacity] = useState(600);
  const [rRate, setRRate] = useState(0.15);
  const [churnRate, setChurnRate] = useState(0.03);
  const [months, setMonths] = useState(36);

  const [shockEnabled, setShockEnabled] = useState(false);
  const [shockMonth, setShockMonth] = useState(12);
  const [shockType, setShockType] = useState("redeemer");
  const [shockAmount, setShockAmount] = useState(200);

  const { data, steadyState } = useMemo(() => {
    const data = [];
    let A = 0; // active stock
    let dormancyQueue = new Array(12).fill(0); // 12-month queue
    let I = issuance;
    let C = capacity;

    for (let t = 0; t <= months; t++) {
      if (shockEnabled && t === shockMonth) {
        if (shockType === "issuer") I += shockAmount;
        else if (shockType === "redeemer") C += shockAmount;
        else if (shockType === "churn_spike") {} // handled below
      }

      const effectiveChurn = (shockEnabled && shockType === "churn_spike" && t >= shockMonth && t < shockMonth + 6)
        ? churnRate * 3
        : churnRate;

      const D = dormancyQueue.reduce((s, v) => s + v, 0);
      const S = A + D;

      // Flows
      const attempted = rRate * A;
      const burns = Math.min(attempted, C);
      const churnFlow = effectiveChurn * A;
      const expiry = dormancyQueue[11]; // oldest cohort expires

      const iMaxCurrent = C * (rRate + effectiveChurn) / rRate;
      const icrCrit = (rRate + effectiveChurn) / rRate;
      const eta = I > 0 ? burns / I : 0;
      const U = C > 0 ? burns / C : 0;
      const SCR = C > 0 ? S / C : 0;
      const ASCR = C > 0 ? A / C : 0;
      const ICR = C > 0 ? I / C : 0;
      const DR = S > 0 ? D / S : 0;
      const lambdaEff = S > 0 ? expiry / S : 0;

      data.push({
        month: t,
        active: Math.round(A),
        dormant: Math.round(D),
        total: Math.round(S),
        burns: Math.round(burns),
        expiry: Math.round(expiry),
        churnFlow: Math.round(churnFlow),
        issuanceFlow: Math.round(I),
        capacityLine: Math.round(C),
        iMax: Math.round(iMaxCurrent),
        eta: Math.round(eta * 1000) / 1000,
        U: Math.round(U * 1000) / 1000,
        SCR: Math.round(SCR * 100) / 100,
        ASCR: Math.round(ASCR * 100) / 100,
        ICR: Math.round(ICR * 1000) / 1000,
        icrCrit: Math.round(icrCrit * 1000) / 1000,
        DR: Math.round(DR * 1000) / 1000,
        lambdaEff: Math.round(lambdaEff * 10000) / 10000,
      });

      // Update state
      A = Math.max(0, A + I - burns - churnFlow);

      // Advance dormancy queue
      const newQueue = new Array(12).fill(0);
      for (let i = 11; i >= 1; i--) {
        newQueue[i] = dormancyQueue[i - 1];
      }
      newQueue[0] = churnFlow;
      dormancyQueue = newQueue;
    }

    const last = data[data.length - 1];
    return { data, steadyState: last };
  }, [issuance, capacity, rRate, churnRate, months, shockEnabled, shockMonth, shockType, shockAmount]);

  const iMaxBase = capacity * (rRate + churnRate) / rRate;
  const icrCritical = (rRate + churnRate) / rRate;
  const lambdaEffTheory = churnRate / (1 + 12 * churnRate);
  const annualChurn = (1 - Math.pow(1 - churnRate, 12)) * 100;
  const dx = diagnose(steadyState.eta, steadyState.U, steadyState.SCR, steadyState.ASCR, steadyState.ICR, icrCritical, steadyState.DR);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs shadow-xl">
        <div className="font-semibold text-gray-300 mb-1">Month {label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-mono text-gray-200">{typeof p.value === 'number' ? (p.value < 10 ? p.value.toFixed(3) : p.value.toLocaleString()) : p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Civic Credit Economy Simulator</h1>
          <p className="text-sm text-gray-400 mt-1">
            Two-pool dormancy model — 12-month inactivity expiry, no hard cap on credit age.
          </p>
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <Slider label="Issuance (I)" value={issuance} onChange={setIssuance} min={50} max={2000} step={25} unit="/mo" />
          <Slider label="Capacity (C)" value={capacity} onChange={setCapacity} min={50} max={2000} step={25} unit="/mo" />
          <Slider label="Redemption Rate (r)" value={rRate} onChange={setRRate} min={0.02} max={0.40} step={0.01}
            sublabel="fraction of active stock redeemed/mo" />
          <Slider label="Monthly Churn (δ)" value={churnRate} onChange={setChurnRate} min={0.005} max={0.10} step={0.005}
            sublabel={`≈ ${annualChurn.toFixed(0)}% annual attrition`} />
        </div>

        {/* Growth Shock */}
        <div className="mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shockEnabled} onChange={e => setShockEnabled(e.target.checked)} className="accent-indigo-500" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Growth / Retention Shock</span>
            </label>
            {shockEnabled && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <select value={shockType} onChange={e => setShockType(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200 text-xs">
                  <option value="redeemer">+ Redeemer Capacity</option>
                  <option value="issuer">+ Issuer Volume</option>
                  <option value="churn_spike">Churn Spike (3x for 6 months)</option>
                </select>
                {shockType !== "churn_spike" && <span>+{shockAmount} at month {shockMonth}</span>}
                {shockType === "churn_spike" && <span>Starting month {shockMonth}</span>}
              </div>
            )}
          </div>
          {shockEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <Slider label="Shock Month" value={shockMonth} onChange={setShockMonth} min={1} max={months - 1} step={1} />
              {shockType !== "churn_spike" && (
                <Slider label="Shock Amount" value={shockAmount} onChange={setShockAmount} min={50} max={1000} step={25} />
              )}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          <MetricCard label="η Earn→Spend" value={steadyState.eta.toFixed(2)} status={getEtaStatus(steadyState.eta)} sublabel="target: 0.70–0.90" />
          <MetricCard label="U Utilization" value={steadyState.U.toFixed(2)} status={getUStatus(steadyState.U)} sublabel="target: 0.50–0.80" />
          <MetricCard label="ASCR Active/Cap" value={steadyState.ASCR.toFixed(1)} unit="mo" status={getASCRStatus(steadyState.ASCR)} sublabel="target: 1.0–4.0" />
          <MetricCard label="SCR Total/Cap" value={steadyState.SCR.toFixed(1)} unit="mo" status={getSCRStatus(steadyState.SCR)} sublabel="target: 1.0–5.0" />
          <MetricCard label="ICR Iss./Cap." value={steadyState.ICR.toFixed(2)} status={getICRStatus(steadyState.ICR, icrCritical)} sublabel={`crit: ${icrCritical.toFixed(2)}`} />
          <MetricCard label="DR Dormancy" value={(steadyState.DR * 100).toFixed(0) + "%"} status={getDRStatus(steadyState.DR)} sublabel="% of stock dormant" />
          <MetricCard label="λ_eff" value={steadyState.lambdaEff.toFixed(3)} status="neutral" sublabel={`theory: ${lambdaEffTheory.toFixed(3)}`} />
        </div>

        {/* Diagnosis */}
        <div className={`mb-6 px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm ${dx.color}`}>
          <span className="font-semibold">Diagnosis:</span> {dx.text}
        </div>

        {/* Chart 1: Two-Pool Stock */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-1">Credit Stock — Active vs. Dormant</h2>
          <p className="text-[11px] text-gray-500 mb-3">Active stock drives redemption. Dormant stock is inert — waiting to expire or reactivate.</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: "Month", position: "insideBottom", offset: -2, fill: "#6b7280", fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="active" name="Active Stock" stackId="1" fill={COLORS.active} fillOpacity={0.3} stroke={COLORS.active} strokeWidth={2} />
              <Area type="monotone" dataKey="dormant" name="Dormant Stock" stackId="1" fill={COLORS.dormant} fillOpacity={0.2} stroke={COLORS.dormant} strokeWidth={1.5} strokeDasharray="4 2" />
              {shockEnabled && <ReferenceLine x={shockMonth} stroke="#f472b6" strokeDasharray="3 3" label={{ value: "Shock", fill: "#f472b6", fontSize: 10, position: "top" }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Flows */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-1">Monthly Flows</h2>
          <p className="text-[11px] text-gray-500 mb-3">Credits entering (issuance) and leaving (burns + expiry) the system. Note the 12-month lag before expiry begins.</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="issuanceFlow" name="Issuance" stroke={COLORS.issuance} strokeWidth={1.5} dot={false} strokeDasharray="8 4" />
              <Line type="monotone" dataKey="burns" name="Burns" stroke={COLORS.burns} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expiry" name="Dormancy Expiry" stroke={COLORS.expiry} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="churnFlow" name="Churn → Dormant" stroke={COLORS.churn} strokeWidth={1} dot={false} strokeDasharray="3 2" />
              <Line type="monotone" dataKey="capacityLine" name="Capacity" stroke={COLORS.capacity} strokeWidth={1} dot={false} strokeDasharray="3 3" />
              {shockEnabled && <ReferenceLine x={shockMonth} stroke="#f472b6" strokeDasharray="3 3" />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Health Ratios */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-1">Health Ratios Over Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Line type="monotone" dataKey="eta" name="η (Earn→Spend)" stroke={COLORS.eta} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="U" name="U (Utilization)" stroke={COLORS.util} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ICR" name="ICR (Iss./Cap.)" stroke={COLORS.icr} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="DR" name="DR (Dormancy)" stroke={COLORS.dr} strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
              {shockEnabled && <ReferenceLine x={shockMonth} stroke="#f472b6" strokeDasharray="3 3" />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: SCR vs ASCR */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-1">Stock-to-Capacity: Total vs. Active Only</h2>
          <p className="text-[11px] text-gray-500 mb-3">ASCR (active only) is the true pressure metric. SCR includes dormant credits waiting to expire.</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={4.0} stroke="#8b5cf6" strokeDasharray="3 3" label={{ value: "ASCR ceiling", fill: "#8b5cf6", fontSize: 10, position: "right" }} />
              <ReferenceLine y={5.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "SCR ceiling", fill: "#f59e0b", fontSize: 10, position: "right" }} />
              <Line type="monotone" dataKey="SCR" name="SCR (Total)" stroke={COLORS.scr} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ASCR" name="ASCR (Active)" stroke={COLORS.ascr} strokeWidth={2} dot={false} />
              {shockEnabled && <ReferenceLine x={shockMonth} stroke="#f472b6" strokeDasharray="3 3" />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Formulas */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-xs text-gray-400">
          <h2 className="text-sm font-semibold text-gray-300 mb-2">Key Formulas (Dormancy Model)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono">
            <div>A* = I/(r+δ) = <span className="text-gray-200">{Math.round(issuance / (rRate + churnRate)).toLocaleString()}</span></div>
            <div>D* = 12·I·δ/(r+δ) = <span className="text-gray-200">{Math.round(12 * issuance * churnRate / (rRate + churnRate)).toLocaleString()}</span></div>
            <div>S* = I·(1+12δ)/(r+δ) = <span className="text-gray-200">{Math.round(issuance * (1 + 12 * churnRate) / (rRate + churnRate)).toLocaleString()}</span></div>
            <div>I_max = C·(r+δ)/r = <span className="text-gray-200">{Math.round(iMaxBase)}</span></div>
            <div>η* = r/(r+δ) = <span className="text-gray-200">{(rRate / (rRate + churnRate)).toFixed(3)}</span></div>
            <div>λ_eff = δ/(1+12δ) = <span className="text-gray-200">{lambdaEffTheory.toFixed(4)}</span></div>
            <div>DR* = 12δ/(1+12δ) = <span className="text-gray-200">{(12 * churnRate / (1 + 12 * churnRate)).toFixed(3)}</span></div>
            <div>t_half ≈ <span className="text-gray-200">{(Math.log(2) / Math.log(1 / (1 - rRate - churnRate))).toFixed(1)}</span> months</div>
            <div>Headroom: I_max−I = <span className={`${issuance > iMaxBase ? 'text-red-400' : 'text-emerald-400'}`}>{Math.round(iMaxBase - issuance)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
