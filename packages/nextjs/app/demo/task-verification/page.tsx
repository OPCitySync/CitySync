import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Verification — City/Sync Demo",
  description:
    "Verification models for City/Sync tasks, from pilot-friendly attestations to high-assurance multi-signal validation.",
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

export default function TaskVerificationPage() {
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
          <div style={chipStyle}>Task Verification</div>
          <h1 style={h1Style}>How Tasks are Verified</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Verification is the trust layer between task execution and reward distribution. The City/Sync framework can
            support multiple verification pathways depending on task complexity and operational capacity, while keeping
            the final verification decision accountable to Issuer governance.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Verification Models
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Assurance Levels
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Governance Controls
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Verification Design Principles</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Match rigor to risk:</strong> higher-impact and higher-risk tasks require stronger verification.
            </li>
            <li>
              <strong>Stay operationally feasible:</strong> verification workflows should be realistic for issuer teams.
            </li>
            <li>
              <strong>Use legible criteria:</strong> success conditions must be clear before task issuance.
            </li>
            <li>
              <strong>Keep auditability:</strong> enough evidence should exist to defend decisions after the fact.
            </li>
            <li>
              <strong>Protect participants:</strong> apply consistent standards and transparent notification outcomes.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Verification Pathways (Outline)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>How It Works</th>
                  <th style={thStyle}>Best Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Issuer Supervisor Attestation</td>
                  <td style={tdStyle}>Assigned issuer lead confirms completion directly.</td>
                  <td style={tdStyle}>Pilot baseline for low-to-medium complexity tasks.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Checklist + Evidence Submission</td>
                  <td style={tdStyle}>Participant submits required checklist/photos/notes for review.</td>
                  <td style={tdStyle}>Tasks with tangible outputs and clear completion artifacts.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Witness Co-Sign</td>
                  <td style={tdStyle}>Second authorized person confirms participant was present/executed.</td>
                  <td style={tdStyle}>Group tasks, public events, or no-show-sensitive workflows.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Location/Time Check-In</td>
                  <td style={tdStyle}>Participant confirms arrival/departure through bounded check-in flow.</td>
                  <td style={tdStyle}>Scheduled in-person tasks with strict timing requirements.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>QR/NFC Point Verification</td>
                  <td style={tdStyle}>Issuer-side check verifies completion at event/service point.</td>
                  <td style={tdStyle}>High-volume tasks requiring fast throughput verification.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Multi-Signal Verification</td>
                  <td style={tdStyle}>Combines evidence, witness, and issuer review before final decision.</td>
                  <td style={tdStyle}>Higher-value or higher-dispute-risk task categories.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Randomized Audit Layer</td>
                  <td style={tdStyle}>Subset of completed tasks gets secondary review for quality control.</td>
                  <td style={tdStyle}>Program integrity checks as network scale increases.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Assurance Levels by Task Type</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Level 1 (Starter):</strong> issuer attestation with lightweight checklist.
            </li>
            <li>
              <strong>Level 2 (Standard):</strong> checklist + evidence + issuer review.
            </li>
            <li>
              <strong>Level 3 (Enhanced):</strong> multi-signal verification and/or witness co-sign.
            </li>
            <li>
              <strong>Level 4 (High Assurance):</strong> multi-signal plus audit requirement and stricter evidence.
            </li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            Issuers can map task families in the catalog to a default assurance level so verification expectations are
            consistent before tasks are issued.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Evolution: Issuer-Only to Delegated Verification</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Phase</th>
                  <th style={thStyle}>Who Can Verify</th>
                  <th style={thStyle}>Control Model</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Phase 1 — Issuer-Only</td>
                  <td style={tdStyle}>Certified issuer wallet/account only.</td>
                  <td style={tdStyle}>Simple accountability while pilot standards are established.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 2 — Delegated Verifiers</td>
                  <td style={tdStyle}>Issuer-approved delegates (staff/leads) scoped by task family.</td>
                  <td style={tdStyle}>Issuer retains responsibility, delegates increase operational throughput.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Phase 3 — Task-Based Verification Routing</td>
                  <td style={tdStyle}>Verifier role selected by task type, assurance level, and risk profile.</td>
                  <td style={tdStyle}>Policy-driven routing with auditable assignment logic and review trails.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul style={ulStyle}>
            <li>
              <strong>Delegation should be explicit:</strong> verifier assignments must be recorded with scope and
              expiration.
            </li>
            <li>
              <strong>High-risk tasks stay restricted:</strong> certain categories remain issuer-only or require
              co-sign.
            </li>
            <li>
              <strong>Revocation must be fast:</strong> issuers can immediately remove verifier authority when quality
              drops.
            </li>
            <li>
              <strong>Audit burden increases with delegation:</strong> random audits and consistency checks become
              mandatory as verifier surface area expands.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Verification Lifecycle in Practice</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Actor</th>
                  <th style={thStyle}>Output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Criteria Set Pre-Issuance</td>
                  <td style={tdStyle}>Issuer/Catalog governance</td>
                  <td style={tdStyle}>Success criteria + verification method attached to task template.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Execution Evidence Capture</td>
                  <td style={tdStyle}>Participant (+ witness if required)</td>
                  <td style={tdStyle}>Checklist, media, check-in traces, or co-sign record.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Issuer Review Decision</td>
                  <td style={tdStyle}>Issuer verifier</td>
                  <td style={tdStyle}>Verified or rejected decision with reason code and participant notice.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Mint + Log</td>
                  <td style={tdStyle}>Protocol write path</td>
                  <td style={tdStyle}>Onchain finalization for verified flow and associated activity history.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Integrity Monitoring</td>
                  <td style={tdStyle}>Issuer + committee governance</td>
                  <td style={tdStyle}>Pattern analysis for no-shows/rejections, sanctions, and process tuning.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Failure Modes and Guardrails</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Overly subjective review:</strong> solved by template criteria and reason-coded decisions.
            </li>
            <li>
              <strong>Evidence spoofing:</strong> reduced with multi-signal checks and random audits.
            </li>
            <li>
              <strong>Verifier inconsistency:</strong> reduced with assurance-level defaults and reviewer calibration.
            </li>
            <li>
              <strong>Operational backlog:</strong> managed by tiered verification rigor and clear SLA targets.
            </li>
            <li>
              <strong>Participant trust erosion:</strong> managed by notification clarity and consistent sanction rules.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
