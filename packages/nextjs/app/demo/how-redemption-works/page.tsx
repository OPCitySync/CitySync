import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Redemption Works — City/Sync Demo",
  description:
    "How CITY redemption works in practice using QR workflows, point-of-service burn confirmation, and low-friction redeemer operations.",
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

export default function HowRedemptionWorksPage() {
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
          <div style={chipStyle}>How Redemption Works</div>
          <h1 style={h1Style}>QR Based Point of Sale Systems</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Redemption is finalized when CITY is burned for a specific offering at the rate that offering is priced. The
            QR flow is the most pragmatic starting method because it works with existing point of sale behaviors and
            avoids heavy system replacement and training for Redeemer organizations.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Burn-Based Settlement
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              QR Pragmatism
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              POS-Compatible
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Core Redemption Flow</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Step</th>
                  <th style={thStyle}>Actor</th>
                  <th style={thStyle}>What Happens</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Offer Commitment</td>
                  <td style={tdStyle}>Redeemer</td>
                  <td style={tdStyle}>Redeemer commits offering(s) with defined CITY redemption amounts.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Selection</td>
                  <td style={tdStyle}>Participant</td>
                  <td style={tdStyle}>Participant selects the offering at point-of-sale system.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. QR Scan</td>
                  <td style={tdStyle}>Participant + Staff</td>
                  <td style={tdStyle}>Participant scans the redeemer QR code tied to that offering flow.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Burn Call</td>
                  <td style={tdStyle}>Participant wallet flow</td>
                  <td style={tdStyle}>
                    Protocol calls burn for the offering amount and records redemption. Visible/Audible cues provide
                    verification.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Confirmation</td>
                  <td style={tdStyle}>Staff</td>
                  <td style={tdStyle}>Staff verifies successful redemption and delivers the good/service.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Redeemers Are Issued QR Codes</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Step 1 — Redeemer onboarding:</strong> organization is approved and active in registry.
            </li>
            <li>
              <strong>Step 2 — Offering commit:</strong> each redeemable offer is defined with amount and constraints.
            </li>
            <li>
              <strong>Step 3 — QR generation:</strong> City/Sync generates a QR payload for redemption routing (offer
              ID, redeemer context, and verification route metadata).
            </li>
            <li>
              <strong>Step 4 — Distribution kit:</strong> redeemer receives printable and digital QR assets.
            </li>
            <li>
              <strong>Step 5 — Placement:</strong> QR is placed at checkout or service desk source locations.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Where QR Codes Should Be Placed</h2>
          <ul style={ulStyle}>
            <li>At checkout counters for staffed transactions.</li>
            <li>At service desks where staff can immediately confirm redemption.</li>
            <li>At dedicated redemption lanes/areas for high-volume events.</li>
            <li>In digital checkout views where in-app scan handoff is possible.</li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            Placement should minimize ambiguity and keep the employee confirmation step within normal service flow.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why QR Is the Pragmatic First Model</h2>
          <ul style={ulStyle}>
            <li>Requires minimal infrastructure change for most redeemers.</li>
            <li>Works across small organizations and large institutions without custom POS rebuilds.</li>
            <li>Keeps the redemption event visible and teachable to frontline staff.</li>
            <li>Provides a clear migration path toward deeper POS integration later.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Integration Paths with Existing POS Systems</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Integration Level</th>
                  <th style={thStyle}>Operational Pattern</th>
                  <th style={thStyle}>When to Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Level 1 — QR + Manual Confirm</td>
                  <td style={tdStyle}>Staff watches confirmation on participant device and proceeds.</td>
                  <td style={tdStyle}>Pilot onboarding and low-complexity deployment.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Level 2 — QR + Staff Dashboard</td>
                  <td style={tdStyle}>Staff confirms against a simple redemption queue/history view.</td>
                  <td style={tdStyle}>Medium-volume sites needing faster confidence checks.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Level 3 — POS-Assisted Trigger</td>
                  <td style={tdStyle}>POS opens or passes context into QR redemption flow.</td>
                  <td style={tdStyle}>Organizations with modest integration capability.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Level 4 — POS Native Integration</td>
                  <td style={tdStyle}>Burn confirmation appears directly in POS workflow.</td>
                  <td style={tdStyle}>Mature deployments with internal technical resources.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Employee Education: Meet Staff Where They Are</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Train to one habit first:</strong> &quot;Scan, confirm burn, provide service.&quot;
            </li>
            <li>
              <strong>Use quick scripts:</strong> one-page job aids at counter/service points.
            </li>
            <li>
              <strong>Minimize new tooling:</strong> avoid requiring staff to learn complex dashboards on day one.
            </li>
            <li>
              <strong>Escalation clarity:</strong> provide clear fallback steps when redemption confirmation is unclear.
            </li>
            <li>
              <strong>Short refresher loops:</strong> 5-10 minute retraining cycles reduce drift in practice.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
