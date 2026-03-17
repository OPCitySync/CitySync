import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redeemer Organizations — City/Sync Demo",
  description:
    "Which Redeemer organizations are the best fit for City/Sync, why they participate, and how participation scales safely.",
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

export default function RedeemerFitPage() {
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
          <div style={chipStyle}>Redeemer Organizations</div>
          <h1 style={h1Style}>Who Is a Good Fit and Why They Participate</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Redeemers are the service side of the civic-credit loop. They accept CITY credits for goods or services and
            make civic work feel real in everyday life. The strongest redeemers are organizations that can absorb
            redemptions reliably and see community participation as part of their mission.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Public Benefit
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Capacity-Aware
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Predictable Delivery
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Redeemers Participate</h2>
          <p style={pStyle}>
            Redeemer participation is practical, mission-aligned, and strategic. Many organizations already have unused
            or underused service capacity at certain times. City/Sync helps convert that capacity into civic impact,
            brings in new participants, and gives organizations a structured channel to support local outcomes while
            staying inside a bounded public-sector economy.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Mission expansion:</strong> serve more residents through a civic-credit access path.
            </li>
            <li>
              <strong>Capacity utilization:</strong> fill underused seats, time windows, or inventory with predictable
              redemption flow.
            </li>
            <li>
              <strong>Community trust:</strong> visibly contribute to local public outcomes.
            </li>
            <li>
              <strong>Demand signaling:</strong> redemption behavior provides real usage data for future planning.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>High-Fit Redeemer Categories</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Typical Examples</th>
                  <th style={thStyle}>Why It Fits Well</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Essential Access</td>
                  <td style={tdStyle}>Transit programs, utilities support, childcare access.</td>
                  <td style={tdStyle}>High public value, clear redemption utility, broad participant relevance.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Public Culture and Learning</td>
                  <td style={tdStyle}>Museums, libraries, classes, workshops, community education.</td>
                  <td style={tdStyle}>Often has expandable off-peak capacity and strong inclusion value.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Health and Wellness</td>
                  <td style={tdStyle}>Preventative health programs, recreation centers, wellness services.</td>
                  <td style={tdStyle}>Direct quality-of-life impact and measurable community benefits.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Community Commerce Partners</td>
                  <td style={tdStyle}>Local businesses providing relevant goods/services.</td>
                  <td style={tdStyle}>Can support local outcomes while attracting new civic participants.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>MCE-Specific Sponsors</td>
                  <td style={tdStyle}>Time-bound offerings linked to a Mass Coordination Event.</td>
                  <td style={tdStyle}>Creates strong participation incentives around city-scale priorities.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What Makes a Redeemer a Poor Fit</h2>
          <ul style={ulStyle}>
            <li>Low fulfillment reliability or inability to honor committed offerings consistently.</li>
            <li>No practical service capacity and no plan to manage redemption peaks.</li>
            <li>Offerings that are hard to validate at point-of-service or easy to game.</li>
            <li>Misalignment with public benefit goals or unwillingness to follow committee operating rules.</li>
            <li>Frequent unilateral policy changes that reduce participant predictability and trust.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Risk Is Managed During Pilot</h2>
          <p style={pStyle}>
            Redeemers retain flexibility to adjust redemption rates based on observed usage, but the system expects
            transparent, structured adjustments. The aim is stable redemption access without overwhelming providers.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Rate tuning windows:</strong> redeemers can recalibrate offerings and rates on governance cadence.
            </li>
            <li>
              <strong>Capacity-aware commitments:</strong> offer only what can be honored within operational limits.
            </li>
            <li>
              <strong>Epoch predictability:</strong> commitments stay stable within period rules to protect
              participants.
            </li>
            <li>
              <strong>Performance signals:</strong> fulfillment data and redemption metrics inform future eligibility.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How This Evolves Over Time</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Phase</th>
                  <th style={thStyle}>Redeemer Management Approach</th>
                  <th style={thStyle}>Primary Objective</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Phase 1 — Pilot Onboarding</td>
                  <td style={tdStyle}>Select high-capacity, high-interest organizations and validate basic flow.</td>
                  <td style={tdStyle}>Prove reliable redemption and service honorability.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 2 — Structured Expansion</td>
                  <td style={tdStyle}>Add more categories and tune rates against real redemption behavior.</td>
                  <td style={tdStyle}>Increase utility without destabilizing providers.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 3 — Committee-Guided Maturity</td>
                  <td style={tdStyle}>Use formal classification and performance tiers for onboarding and policy.</td>
                  <td style={tdStyle}>Predictable, scalable, cross-city redeemer governance.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
