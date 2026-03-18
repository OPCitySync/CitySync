import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Issuer Organizations — City/Sync Demo",
  description:
    "Which Issuer organizations are the best fit for City/Sync, why they participate, and how issuer governance scales safely.",
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

export default function IssuerFitPage() {
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
          <div style={chipStyle}>Issuer Organizations</div>
          <h1 style={h1Style}>Who Is a Good Fit and Why They Participate</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Issuers are the work-design layer of the protocol. They identify civic needs, define and issue tasks, verify
            outcomes, and distribute CITY and VOTE to participants. Strong issuers are organizations that can manage
            volunteer workflows responsibly and expand public-service impact through structured task governance.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Mission-Aligned
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Verification-Ready
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Governance-Disciplined
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Issuers Participate</h2>
          <p style={pStyle}>
            Issuer participation gives organizations a structured way to scale mission impact. Instead of running
            informal or disconnected volunteer pipelines, issuers can define repeatable task functions, measure
            execution, and align contributions with clear public outcomes. Issuers also gain coordination visibility
            through shared onchain lifecycle data and protocol-level catalog standards.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Impact expansion:</strong> convert civic demand into trackable execution capacity.
            </li>
            <li>
              <strong>Operational clarity:</strong> standardize task types, criteria, and verification workflows.
            </li>
            <li>
              <strong>Network growth:</strong> attract and retain participants through predictable issuance pathways.
            </li>
            <li>
              <strong>Governance voice:</strong> shape catalog and rate policy through committee processes.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Eligibility Baseline</h2>
          <ul style={ulStyle}>
            <li>Must be an incorporated public-service organization.</li>
            <li>Must have a local service track record.</li>
            <li>Must have capacity to manage a volunteer program.</li>
            <li>Ideally already supports an active volunteer base.</li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            These conditions reduce onboarding risk and make early issuance reliable enough to validate the pilot loop.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>High-Fit Issuer Categories</h2>
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
                  <td style={tdStyle}>Public-Service Nonprofits</td>
                  <td style={tdStyle}>Food security, youth support, neighborhood programs.</td>
                  <td style={tdStyle}>Mission-aligned civic tasks with existing community trust.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Local Service Agencies</td>
                  <td style={tdStyle}>Libraries, community centers, parks programs.</td>
                  <td style={tdStyle}>Strong verification pathways and recurring public-good workflows.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Specialized Service Providers</td>
                  <td style={tdStyle}>Environmental groups, elder-care support, education programs.</td>
                  <td style={tdStyle}>Can define clear credentialed task functions and measurable outcomes.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>MCE Collaboration Issuers</td>
                  <td style={tdStyle}>Organizations coordinating on city-wide event priorities.</td>
                  <td style={tdStyle}>High coordination value and visible impact potential.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What Makes an Issuer a Poor Fit</h2>
          <ul style={ulStyle}>
            <li>Inability to verify task execution consistently.</li>
            <li>Task designs that drift into replacing paid labor obligations.</li>
            <li>Weak safety or credential controls for higher-risk task types.</li>
            <li>No operational discipline for catalog governance and reporting.</li>
            <li>Frequent ad hoc rule changes that reduce participant trust and task legibility.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Issuer Risk Is Managed During Pilot</h2>
          <p style={pStyle}>
            Pilot management emphasizes reliable execution over scale-at-all-costs. Issuers are expected to operate
            within task rules, follow catalog governance, and maintain verification quality while expanding task
            coverage.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Task rules enforcement:</strong> no paid labor displacement and public-good mission fit.
            </li>
            <li>
              <strong>Catalog discipline:</strong> template-first task issuance and one-hour normalization logic.
            </li>
            <li>
              <strong>Verification quality:</strong> clear evidence criteria and consistent completion review.
            </li>
            <li>
              <strong>Performance oversight:</strong> no-show/rejection patterns and throughput metrics inform guidance.
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
                  <th style={thStyle}>Issuer Management Approach</th>
                  <th style={thStyle}>Primary Objective</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Phase 1 — Pilot Onboarding</td>
                  <td style={tdStyle}>Start with high-readiness issuers and validate task lifecycle reliability.</td>
                  <td style={tdStyle}>Prove safe, consistent issuance and verification.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 2 — Catalog Expansion</td>
                  <td style={tdStyle}>Grow task diversity and improve normalization across similar task types.</td>
                  <td style={tdStyle}>Increase predictable civic-labor throughput.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 3 — Committee-Guided Maturity</td>
                  <td style={tdStyle}>Committee assumes deeper control over catalog policy and calibration cadence.</td>
                  <td style={tdStyle}>Cross-issuer consistency and scalable governance standards.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
