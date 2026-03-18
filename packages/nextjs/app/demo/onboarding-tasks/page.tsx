import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding Tasks — City/Sync Demo",
  description:
    "Why onboarding tasks exist for civic participants, how issuers issue them, and how they activate safe network participation.",
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

export default function OnboardingTasksPage() {
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
          <div style={chipStyle}>Onboarding Tasks</div>
          <h1 style={h1Style}>How Civic Participants Enter the Network</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Onboarding tasks are the first civic tasks participants complete before interacting with the broader task
            ecosystem. They establish participant legitimacy, teach core workflow behavior, and create a low-friction
            bridge into full protocol participation.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              First Touchpoint
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Issuer-Facilitated
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Activation Gate
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Onboarding Tasks Exist</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Identity-to-action bridge:</strong> new users move from account creation into real civic action.
            </li>
            <li>
              <strong>Trust and legitimacy:</strong> participants demonstrate baseline engagement before broad access.
            </li>
            <li>
              <strong>Workflow literacy:</strong> participants learn claim, execute, and completion behavior in a safe
              starter flow.
            </li>
            <li>
              <strong>Operational quality:</strong> issuers can filter out low-intent accounts before higher-value task
              circulation.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Onboarding Tasks Are Issued</h2>
          <p style={pStyle}>
            Each issuer organization maintains a small set of onboarding tasks designed to be easy to facilitate and
            easy for participants to complete. These tasks are intentionally simple, low-risk, and operationally
            repeatable, so onboarding can happen consistently without overloading issuer teams.
          </p>
          <ul style={ulStyle}>
            <li>Issuer defines onboarding task templates and facilitation steps.</li>
            <li>Tasks are issued as recurring onboarding opportunities.</li>
            <li>Participant claims and executes the onboarding task.</li>
            <li>Issuer confirms completion and activates participant for broader network access.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Onboarding Task Design Requirements</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Design Area</th>
                  <th style={thStyle}>Requirement</th>
                  <th style={thStyle}>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Facilitation</td>
                  <td style={tdStyle}>Must be easy for issuer staff/volunteer leads to run repeatedly.</td>
                  <td style={tdStyle}>Prevents onboarding bottlenecks.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Complexity</td>
                  <td style={tdStyle}>Must be low-complexity and clear for first-time participants.</td>
                  <td style={tdStyle}>Improves completion rates and reduces confusion.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Verification</td>
                  <td style={tdStyle}>Must have straightforward completion checks.</td>
                  <td style={tdStyle}>Enables fast and consistent activation decisions.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Accessibility</td>
                  <td style={tdStyle}>Must be broadly accessible across participant constraints.</td>
                  <td style={tdStyle}>Ensures onboarding is not exclusionary.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Risk Profile</td>
                  <td style={tdStyle}>Must avoid high-risk activities and specialized barriers.</td>
                  <td style={tdStyle}>Protects participants and issuer operations during entry.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Lifecycle and Activation Flow</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Primary Actor</th>
                  <th style={thStyle}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Publish Onboarding Task</td>
                  <td style={tdStyle}>Issuer</td>
                  <td style={tdStyle}>Starter task is available to new participants.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Claim and Execute</td>
                  <td style={tdStyle}>Participant</td>
                  <td style={tdStyle}>Participant demonstrates basic task lifecycle engagement.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Completion Check</td>
                  <td style={tdStyle}>Issuer</td>
                  <td style={tdStyle}>Issuer confirms onboarding completion criteria.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Network Activation</td>
                  <td style={tdStyle}>Protocol + Issuer workflow</td>
                  <td style={tdStyle}>Participant receives access to full set of available tasks.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Role in Long-Term Network Health</h2>
          <p style={pStyle}>
            Onboarding tasks are not just an entry requirement; they are a quality control layer. As the network scales,
            they help maintain participant readiness, reduce low-intent activity, and keep issuer verification workflows
            manageable. Standardized onboarding templates across issuers can eventually improve cross-city consistency
            while still allowing local adaptation.
          </p>
        </section>
      </div>
    </main>
  );
}
