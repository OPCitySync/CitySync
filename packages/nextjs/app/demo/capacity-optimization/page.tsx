import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capacity Optimization — City/Sync Demo",
  description:
    "Why capacity optimization matters for redeemers, and how dynamic CITY pricing could improve redemption utilization after the pilot.",
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
          <div style={chipStyle}>Capacity Optimization</div>
          <h1 style={h1Style}>Capacity Optimization</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            This is an aspirational, iterative development goal for City/Sync. During the pilot, dynamic CITY pricing
            will not be implemented. The long-term objective is to design a mechanism that helps Redeemers satisfy
            capacity more consistently across their full operating hours by adjusting redemption costs over time.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Post-Pilot Goal
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Dynamic CITY Pricing
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Redeemer Stability
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Problem Statement</h2>
          <p style={pStyle}>
            Many Redeemers face uneven demand across the day. At some hours, capacity goes unused; at others, demand
            exceeds what can be served smoothly. This creates operational stress, inconsistent participant experience,
            and missed opportunities to deliver public goods/services at times when organizations could actually serve
            more people.
          </p>
          <ul style={ulStyle}>
            <li>Underutilized hours produce avoidable idle capacity.</li>
            <li>Peak-time congestion creates service strain and staff pressure.</li>
            <li>Static redemption pricing does not help redistribute demand over time.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Solving This Matters</h2>
          <p style={pStyle}>
            Capacity optimization is important because Redeemers are critical service endpoints in the public-sector
            economy. If Redeemers cannot absorb demand reliably, redemption value weakens and participant trust falls.
            Solving this problem supports stronger service delivery, better predictability, and healthier earn-to-burn
            circulation.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>For public-good/service providers:</strong> better alignment between mission delivery and real
              operating capacity.
            </li>
            <li>
              <strong>For high-capacity organizations:</strong> improved utilization of underused hours without
              overwhelming peak periods.
            </li>
            <li>
              <strong>For participants:</strong> clearer redemption options and more reliable access to offerings.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What City/Sync Is Trying to Build (After Pilot)</h2>
          <p style={pStyle}>
            The target mechanism is dynamic CITY pricing for redemption windows. Instead of one static cost throughout
            the day, approved offerings could use policy-bounded rate adjustments to shift demand toward underused hours
            and reduce peak stress. This is not a live pilot feature; it is a research-and-development direction.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Bounded dynamic pricing:</strong> rates move only within governance-approved ranges.
            </li>
            <li>
              <strong>Time-aware redemption windows:</strong> pricing responds to predictable demand patterns.
            </li>
            <li>
              <strong>Operational simplicity:</strong> staff workflows should remain straightforward at point of
              service.
            </li>
            <li>
              <strong>Transparency by default:</strong> participants can see current redemption cost before they
              confirm.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Implications If Capacity Optimization Works</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Domain</th>
                  <th style={thStyle}>Implication</th>
                  <th style={thStyle}>Public-Sector Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Redeemer Operations</td>
                  <td style={tdStyle}>More even demand distribution and fewer overload windows.</td>
                  <td style={tdStyle}>Higher service reliability and reduced operational friction.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Participant Experience</td>
                  <td style={tdStyle}>More usable redemption opportunities across the day.</td>
                  <td style={tdStyle}>Stronger trust in CITY as a practical civic reward.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Protocol Economics</td>
                  <td style={tdStyle}>Healthier and more predictable burn behavior.</td>
                  <td style={tdStyle}>Improved stability of the public-sector economy loop.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Mission Outcomes</td>
                  <td style={tdStyle}>Better utilization for organizations delivering public goods/services.</td>
                  <td style={tdStyle}>Greater capacity to serve community needs without expansion shock.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Boundary and Development Posture</h2>
          <p style={pStyle}>
            Capacity optimization is not a pilot deliverable. The pilot is focused on proving reliable task issuance,
            verification, and redemption operations first. Dynamic pricing is a later-stage capability that should only
            be introduced after baseline reliability, policy clarity, and governance controls are established.
          </p>
          <ul style={ulStyle}>
            <li>Pilot now: prove stable workflows and trusted redemption execution.</li>
            <li>Next phase: model demand patterns and define bounded pricing rules.</li>
            <li>Later phase: deploy and tune dynamic pricing with committee oversight.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
