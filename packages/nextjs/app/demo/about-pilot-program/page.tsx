import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Pilot Program — City/Sync Demo",
  description:
    "Detailed outline and rollout framework for the City/Sync pilot deployment across roles, governance, and operational phases.",
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
  minWidth: 800,
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

export default function AboutPilotProgramPage() {
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
          <div style={chipStyle}>About the Pilot Program</div>
          <h1 style={h1Style}>Deployment Model for Programmable Public Coordination</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            The pilot is designed to establish operational precedent: how institutional authority and structured civic
            participation can run together as a governable, repeatable public coordination layer. The goal is not a
            one-off experiment, but a model cities can observe, evaluate, and replicate.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Procedural Rollout
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Cross-Governance Test
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Replication-Oriented
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Purpose and Locations</h2>
          <p style={pStyle}>
            This pilot is proposed across Berkeley, California and Mexico City, Mexico to validate that programmable
            coordination can integrate with distinct governance environments without requiring structural disruption of
            existing administrative systems.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Four Deployment Objectives</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Procedural:</strong> establish a repeatable municipal onboarding process.
            </li>
            <li>
              <strong>Economic:</strong> validate participation issuance and service redemption mechanisms.
            </li>
            <li>
              <strong>Social:</strong> validate Mass Coordination Events (MCEs) as civic mobilization infrastructure.
            </li>
            <li>
              <strong>Governance:</strong> expand issuer and redeemer ecosystems through real operational use.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Operational Roles in the Pilot</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Function</th>
                  <th style={thStyle}>Eligibility and Governance Condition</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Issuers</td>
                  <td style={tdStyle}>Issue tasks, verify completion, distribute rewards.</td>
                  <td style={tdStyle}>Public-service organizations with local history and volunteer capacity.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Redeemers</td>
                  <td style={tdStyle}>Offer goods/services redeemable with civic credits.</td>
                  <td style={tdStyle}>Public or private orgs able to honor redemption commitments consistently.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Civic Participants</td>
                  <td style={tdStyle}>Claim, execute, and redeem within the civic coordination loop.</td>
                  <td style={tdStyle}>Any capable resident willing to follow participation and governance rules.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Validators</td>
                  <td style={tdStyle}>Verify completion quality for issued tasks.</td>
                  <td style={tdStyle}>Individuals/orgs authorized by reporting issuer governance controls.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Rollout Architecture (Detailed)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Phase</th>
                  <th style={thStyle}>What Is Deployed</th>
                  <th style={thStyle}>Decision Focus</th>
                  <th style={thStyle}>Success Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Phase 0: Municipal Setup</td>
                  <td style={tdStyle}>Administrative onboarding, policy alignment, baseline governance definitions.</td>
                  <td style={tdStyle}>Can this run inside existing institutional workflows?</td>
                  <td style={tdStyle}>Onboarding protocol is repeatable and legible.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 1: Issuer Infrastructure</td>
                  <td style={tdStyle}>Active issuer cohort, task definitions, verification pathways.</td>
                  <td style={tdStyle}>Can issuers integrate without operational disruption?</td>
                  <td style={tdStyle}>Stable issued-task supply and reliable verification throughput.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 2: Redemption Infrastructure</td>
                  <td style={tdStyle}>Redeemer onboarding, redemption flows, bounded service-access pathways.</td>
                  <td style={tdStyle}>Can redemption remain politically legible and operationally stable?</td>
                  <td style={tdStyle}>Continuous redemption with low service friction.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 3: MCE Activation</td>
                  <td style={tdStyle}>Time-bound citywide coordination events around shared public goals.</td>
                  <td style={tdStyle}>Can the system coordinate at visible community scale?</td>
                  <td style={tdStyle}>High-volume execution and broad legitimacy signal.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 4: Ecosystem Expansion</td>
                  <td style={tdStyle}>New issuers/redeemers join based on observed value.</td>
                  <td style={tdStyle}>Is growth becoming self-reinforcing?</td>
                  <td style={tdStyle}>Issuer persistence, redeemer continuity, participation stability.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 5: Replication Readiness</td>
                  <td style={tdStyle}>Process artifacts, governance templates, implementation blueprint.</td>
                  <td style={tdStyle}>Can other jurisdictions copy this without special conditions?</td>
                  <td style={tdStyle}>Adoption posture shifts from curiosity to implementation planning.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Dual-Market Coordination Engine</h2>
          <p style={pStyle}>
            Pilot durability depends on balanced growth between issuer-side opportunity supply and participant-side
            execution capacity, with redeemers completing the loop through service access. The system is designed to
            produce coordination momentum, where issuance, participation, and redemption reinforce one another over
            time.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Economic and Governance Posture</h2>
          <ul style={ulStyle}>
            <li>Treat civic credits as a bounded coordination instrument, not a speculative currency.</li>
            <li>Start with organizations already capable of integrating task and redemption flows naturally.</li>
            <li>Use parameter control and transparent oversight for bounded adaptability.</li>
            <li>
              Preserve administrative clarity: onboarding, verification, redemption, and governance rights are explicit.
            </li>
            <li>Apply issuance and redemption controls based on observed equilibrium and service capacity signals.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What Success Looks Like</h2>
          <ul style={ulStyle}>
            <li>Municipal operability: pilot runs inside normal administrative workflows.</li>
            <li>Issuer persistence: organizations continue and deepen integration after initial launch.</li>
            <li>
              Ecosystem expansion: additional issuers/redeemers join through observed value, not forced recruitment.
            </li>
            <li>Participation stability: engagement becomes predictable, not episodic.</li>
            <li>Redemption continuity: service pathways remain active without operational strain.</li>
            <li>Governance confidence: policymakers see the layer as observable, controllable, and responsible.</li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            The pilot is successful when other cities move from asking &quot;is this possible?&quot; to asking &quot;how
            do we deploy it here?&quot;
          </p>
        </section>
      </div>
    </main>
  );
}
