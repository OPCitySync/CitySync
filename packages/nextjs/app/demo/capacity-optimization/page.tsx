import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capacity Optimization for Redeemers — City/Sync Demo",
  description:
    "Framework for redeemers to optimize off-peak capacity by offering lower CITY redemption costs during non-peak windows.",
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0D0D14 0%, #121227 40%, #0D0D14 100%)",
  color: "#f5f5f7",
  padding: "44px 20px 80px",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
};

const heroCard: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(65,105,225,0.22), rgba(221,158,51,0.16))",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
  padding: "28px 24px",
  boxShadow: "0 20px 42px rgba(0,0,0,0.25)",
  marginBottom: 24,
};

const sectionCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 18,
  padding: "22px 20px",
  marginBottom: 16,
};

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 44px)",
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: -0.4,
};

const h2Style: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 22,
  fontWeight: 760,
  letterSpacing: -0.2,
};

const pStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(245,245,247,0.84)",
  fontSize: 15,
  lineHeight: 1.72,
};

const ulStyle: React.CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 18,
  color: "rgba(245,245,247,0.84)",
  fontSize: 15,
  lineHeight: 1.72,
};

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.9)",
  marginBottom: 10,
};

const tableWrapStyle: React.CSSProperties = {
  overflowX: "auto",
  marginTop: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 780,
  background: "rgba(15,15,24,0.55)",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.75)",
  padding: "12px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 12px",
  fontSize: 14,
  color: "rgba(245,245,247,0.86)",
  lineHeight: 1.55,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  verticalAlign: "top",
};

export default function CapacityOptimizationPage() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/demo"
            style={{
              color: "rgba(127,166,255,0.95)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Back to Demo
          </Link>
        </div>

        <section style={heroCard}>
          <div style={chipStyle}>Capacity Optimization for Redeemers</div>
          <h1 style={h1Style}>Lower CITY Costs During Non-Peak Hours</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            This framework helps redeemers fill off-time capacity by lowering CITY redemption costs during non-peak
            windows. The objective is simple: move demand into underused hours without forcing major operational changes
            to point-of-service workflows.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Off-Peak Fill
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Time-Banded Pricing
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Minimal Operational Change
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Program Premise</h2>
          <p style={pStyle}>
            Redeemers set a base CITY cost for each offering, then define lower-cost windows for non-peak times. Civic
            participants receive better redemption value when they redeem during those windows. This creates demand
            shaping without adding bonus systems or complex incentives.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pricing Framework</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Band</th>
                  <th style={thStyle}>Time Window</th>
                  <th style={thStyle}>CITY Cost Strategy</th>
                  <th style={thStyle}>Intent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Peak</td>
                  <td style={tdStyle}>High-demand hours</td>
                  <td style={tdStyle}>Base cost</td>
                  <td style={tdStyle}>Protect core capacity and maintain service balance.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Shoulder</td>
                  <td style={tdStyle}>Moderate-demand hours</td>
                  <td style={tdStyle}>Small discount vs base</td>
                  <td style={tdStyle}>Smooth demand before/after peak periods.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Off-Peak</td>
                  <td style={tdStyle}>Low-demand hours</td>
                  <td style={tdStyle}>Largest discount</td>
                  <td style={tdStyle}>Fill underused capacity and increase utilization.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Redeemers Configure It</h2>
          <ul style={ulStyle}>
            <li>Select offerings eligible for time-banded pricing.</li>
            <li>Define peak, shoulder, and off-peak windows by day and hour.</li>
            <li>Set discounted CITY amounts per window.</li>
            <li>Set optional capacity limits for each discounted window.</li>
            <li>Publish schedule for the current epoch and follow update policy windows.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Operational Guardrails</h2>
          <ul style={ulStyle}>
            <li>Use canonical server/chain time for window enforcement.</li>
            <li>Display active redemption cost clearly before participant confirms.</li>
            <li>Apply per-window redemption caps for constrained services.</li>
            <li>Keep staff flow simple: scan, confirm cost, provide service.</li>
            <li>Restrict frequent ad hoc price changes to preserve participant trust.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Employee Enablement (Meet Staff Where They Are)</h2>
          <p style={pStyle}>
            The program should feel like a pricing schedule, not a new software system. Staff should not need to learn a
            complex new workflow to process redemptions.
          </p>
          <ul style={ulStyle}>
            <li>Use one-page quick guides with active window examples.</li>
            <li>Keep a single service script for redemption confirmation.</li>
            <li>Provide fallback escalation steps for ambiguous transactions.</li>
            <li>Run short refreshers after any schedule change.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Measurement and Optimization KPIs</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>KPI</th>
                  <th style={thStyle}>What It Measures</th>
                  <th style={thStyle}>Decision Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Off-Peak Utilization Lift</td>
                  <td style={tdStyle}>Change in redemption volume during discounted windows.</td>
                  <td style={tdStyle}>Increase/decrease discount depth.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Peak Spillover Reduction</td>
                  <td style={tdStyle}>Whether demand shifts out of congested peak windows.</td>
                  <td style={tdStyle}>Tune shoulder/off-peak schedule boundaries.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Redemption Fulfillment Quality</td>
                  <td style={tdStyle}>On-time, accurate service delivery after redemption confirmation.</td>
                  <td style={tdStyle}>Adjust staffing and cap strategy.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Staff Friction Rate</td>
                  <td style={tdStyle}>Checkout confusion and escalation incidence.</td>
                  <td style={tdStyle}>Improve training and simplify rules.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Participant Repeat Redemption</td>
                  <td style={tdStyle}>Return usage in discounted windows.</td>
                  <td style={tdStyle}>Validate whether pricing is both clear and attractive.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
