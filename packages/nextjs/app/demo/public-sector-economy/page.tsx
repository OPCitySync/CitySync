import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public-Sector Economy — City/Sync Demo",
  description:
    "How the City/Sync public-sector economy works, how it is managed in the pilot, and how governance evolves over time.",
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
  minWidth: 760,
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

export default function PublicSectorEconomyPage() {
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
          <div style={chipStyle}>Public-Sector Economy</div>
          <h1 style={h1Style}>How It Works and How It Is Managed</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            City/Sync seeks to turn civic contributions into an economic signal. In the public-sector economy, Issuers
            publish verifiable civic work, participants execute it, and redeemers convert earned credits into access for
            real goods and services. The purpose is to keep this loop useful and operationally stable while it grows.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Pilot-First
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Bounded Economy
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Adaptive Governance
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What is the Public-Sector Economy?</h2>
          <p style={pStyle}>
            The City/Sync framework proposes a public-sector economy that serves as a bounded coordination economy. It
            exists to recognize civic-labor that markets routinely fail to price, and route that recognition into a
            usable credit system that strengthens the public-service institutions that communities depend on. It is
            intentionally designed to coexist with private markets while giving the public-sector its own legible
            operating logic that operationalizes our cities abundant civic capacity.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Core Operating Loop</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Step</th>
                  <th style={thStyle}>Operational Action</th>
                  <th style={thStyle}>Managed Outcome</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Task Issue</td>
                  <td style={tdStyle}>Issuer organizations publish approved tasks with clear success criteria.</td>
                  <td style={tdStyle}>Public need becomes executable work.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Task Execution</td>
                  <td style={tdStyle}>Civic participants claim and complete tasks.</td>
                  <td style={tdStyle}>Civic-labor supply becomes measurable.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Verification + Mint</td>
                  <td style={tdStyle}>Issuers verify completion and distribute CITY and VOTE.</td>
                  <td style={tdStyle}>Verified work becomes recognized value and governance voice.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Redemption</td>
                  <td style={tdStyle}>Participants redeem CITY with accredited redeemers.</td>
                  <td style={tdStyle}>Credits are burned and circulation is bounded by real service capacity.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Governance Adjustment</td>
                  <td style={tdStyle}>Committees review metrics and adjust rates/rules.</td>
                  <td style={tdStyle}>System remains balanced as participation changes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Initial Pilot Implementation (How We Start)</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Issuer selection:</strong> start with organizations that already have strong volunteer networks
              and proven task-management capacity.
            </li>
            <li>
              <strong>Redeemer selection:</strong> prioritize organizations with sufficient service capacity and clear
              interest in attracting new participants.
            </li>
            <li>
              <strong>No issuance caps at launch:</strong> initial phase rewards existing volunteer work to establish
              baseline behavior and operational trust.
            </li>
            <li>
              <strong>No replacement of paid labor:</strong> tasks are constrained to public-good/public-service
              expansion, not wage displacement.
            </li>
            <li>
              <strong>Onchain where it matters:</strong> issuance, verification, minting, and redemption are recorded to
              maintain shared state and auditability.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Management</h2>
          <p style={pStyle}>
            The management of the public-sector economy during the pilot focuses on throughput and reliability first and
            foremost. The priority is to prove that existing volunteer work can be recognized and rewarded without
            creating institutional friction. Issuers will be coached to grow both volunteer participation and available
            task functions over time, while redeemers will learn to tune rates according to redemption demand and
            capacity metrics.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Issuer KPI:</strong> expansion of volunteer network and mission-aligned task coverage.
            </li>
            <li>
              <strong>Redeemer KPI:</strong> consistent, manageable redemption utilization with low service disruption.
            </li>
            <li>
              <strong>System KPI:</strong> healthy earn-to-burn rhythm (credits are earned and used consistently).
            </li>
            <li>
              <strong>Operations KPI:</strong> high verification quality and stable task/redemption workflows.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How It Evolves Over Time</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Economic Posture</th>
                  <th style={thStyle}>Governance Focus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Stage A — Baseline Recognition</td>
                  <td style={tdStyle}>No issuance caps, reward existing volunteer labor, observe real behavior.</td>
                  <td style={tdStyle}>Data collection, process reliability, onboarding quality.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage B — Coordinated Expansion</td>
                  <td style={tdStyle}>Increase task diversity, expand redeemer universe, tune redemption rates.</td>
                  <td style={tdStyle}>Balancing participation growth with service capacity constraints.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage C — Managed Equilibrium</td>
                  <td style={tdStyle}>Introduce adaptive issuance caps and tighter policy controls if needed.</td>
                  <td style={tdStyle}>Formalized cadence for rate reviews, issuance controls, and cross-role KPIs.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage D — Service-Backed Scaling</td>
                  <td style={tdStyle}>Deeper integration with public-service programs and regional coordination.</td>
                  <td style={tdStyle}>Interoperability, resilience, and long-term civic economic planning.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What Success Looks Like</h2>
          <ul style={ulStyle}>
            <li>More residents participating in verified civic work over time.</li>
            <li>Issuer organizations expanding task offerings without operational overload.</li>
            <li>Redeemers seeing predictable, healthy redemption demand they can support.</li>
            <li>Credits circulating through useful redemptions rather than accumulating unused balances.</li>
            <li>Governance decisions increasingly data-driven, transparent, and repeatable each epoch.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
