import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graduate Sanctions — City/Sync Demo",
  description:
    "Internal control framework for graduated sanctions using Reliability Score (RS) and Risk Debt (RD) without permanent bans.",
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

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(127,166,255,0.95)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
};

export default function GraduateSanctionsPage() {
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
          <div style={chipStyle}>Graduate Sanctions</div>
          <h1 style={h1Style}>A Recovery-First Internal Control System for Participant Abuse Risk</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            City/Sync uses graduated sanctions to manage abuse while preserving access. Participants are never
            permanently banned. Instead, claim permissions tighten when risk rises and expand again through verified
            improvement. This keeps the system fair, legible, and resilient without relying on appeals-heavy overhead.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              No Permanent Bans
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Recovery Path Always Open
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Anti-Gaming by Design
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Design Objectives</h2>
          <ul style={ulStyle}>
            <li>Prevent repeated low-quality execution and no-show behavior from degrading shared trust.</li>
            <li>Ensure sanctions are understandable, predictable, and tied to observable behavior.</li>
            <li>Maintain participation access at all times while limiting higher-risk claim opportunities.</li>
            <li>Require sustained good behavior for full restoration, not one-off “reset” events.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Two Internal Control Signals: RS and RD</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Signal</th>
                  <th style={thStyle}>Purpose</th>
                  <th style={thStyle}>Control Use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Reliability Score (RS)</td>
                  <td style={tdStyle}>
                    Longitudinal behavior trend. Indicates whether a participant is moving toward reliable execution or
                    repeated quality failure.
                  </td>
                  <td style={tdStyle}>
                    Secondary control and reporting signal used for rehabilitation gates, risk communication, and policy
                    review analytics.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>Risk Debt (RD)</td>
                  <td style={tdStyle}>
                    Immediate risk accumulator. Measures current system exposure to participant behavior.
                  </td>
                  <td style={tdStyle}>
                    Primary access control signal. RD determines task claim permissions, restrictions, and sanction
                    tier.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ ...pStyle, marginTop: 10 }}>
            Control rule: <strong>RD governs permissions.</strong> RS supports recovery quality and governance insight.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Event Weights (Default)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>RS Change</th>
                  <th style={thStyle}>RD Change</th>
                  <th style={thStyle}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Successful verified completion</td>
                  <td style={tdStyle}>+0.5</td>
                  <td style={tdStyle}>-0.5 (floor at 0)</td>
                  <td style={tdStyle}>Reward steady reliability, but require repeated proof to restore full access.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>No-show</td>
                  <td style={tdStyle}>-1.0</td>
                  <td style={tdStyle}>+1.0</td>
                  <td style={tdStyle}>Missed execution reduces operational trust and planning confidence.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Rejected verification</td>
                  <td style={tdStyle}>-1.5</td>
                  <td style={tdStyle}>+2.0</td>
                  <td style={tdStyle}>
                    Highest integrity risk in this model because credits are still distributed after rejection.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Task Commitment Abuse Controls (Claim and Unclaim Attacks)</h2>
          <p style={pStyle}>
            To prevent participants from reserving tasks and dropping them right before start time, unclaim behavior is
            treated as time-sensitive risk. Earlier exits remain flexible, while late exits are scored as reliability
            violations.
          </p>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Cancellation Timing</th>
                  <th style={thStyle}>RS Change</th>
                  <th style={thStyle}>RD Change</th>
                  <th style={thStyle}>Rule</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Within 30 minutes of claim</td>
                  <td style={tdStyle}>0</td>
                  <td style={tdStyle}>0</td>
                  <td style={tdStyle}>Grace unclaim window; no penalty.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>More than 72 hours before start</td>
                  <td style={tdStyle}>0</td>
                  <td style={tdStyle}>0</td>
                  <td style={tdStyle}>Early release is acceptable.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>48 to 24 hours before start</td>
                  <td style={tdStyle}>-0.1</td>
                  <td style={tdStyle}>+0.1</td>
                  <td style={tdStyle}>Low-severity reliability penalty.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>24 to 6 hours before start</td>
                  <td style={tdStyle}>-0.5</td>
                  <td style={tdStyle}>+0.5</td>
                  <td style={tdStyle}>Late cancellation treated as elevated risk.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Less than 6 hours before start</td>
                  <td style={tdStyle}>-1.5</td>
                  <td style={tdStyle}>+1.5</td>
                  <td style={tdStyle}>High-severity breach (RD harsher than No-Show).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul style={ulStyle}>
            <li>Self-unclaim is disabled inside T-24h unless emergency exception is granted.</li>
            <li>Emergency exception is limited (example: one per epoch) and must include a reason code.</li>
            <li>Near-date cap: within 48h of start, participant can hold at most one active claim.</li>
            <li>Standby queue auto-fills released slots to minimize disruption.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Sanction Tiers (RD-Driven)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Tier</th>
                  <th style={thStyle}>RD Range</th>
                  <th style={thStyle}>Participant Permissions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Green</td>
                  <td style={tdStyle}>RD &lt; 1.5</td>
                  <td style={tdStyle}>Standard claiming permissions.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Yellow</td>
                  <td style={tdStyle}>1.5 ≤ RD &lt; 3</td>
                  <td style={tdStyle}>Max 1 active claim, no premium/high-rate task claims.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Orange</td>
                  <td style={tdStyle}>3 ≤ RD &lt; 5</td>
                  <td style={tdStyle}>Max 1 active claim, only tasks ≤ 1 hour, premium tasks blocked.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Red</td>
                  <td style={tdStyle}>RD ≥ 5</td>
                  <td style={tdStyle}>
                    Max 1 low-risk claim at a time, mandatory cooldown between claims (e.g., 24–72 hours).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Recovery Logic (How Restrictions Are Lifted)</h2>
          <ul style={ulStyle}>
            <li>Red → Orange: RD below 5 and 2 consecutive successful verified completions.</li>
            <li>Orange → Yellow: RD below 3 and 2 consecutive successful verified completions.</li>
            <li>Yellow → Green: RD below 1.5, 3 consecutive successful verified completions, and RS &gt; 0.</li>
          </ul>
          <p style={{ ...pStyle, marginTop: 10 }}>
            This structure prevents one small successful task from wiping out high-severity abuse behavior.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Anti-Gaming Example</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={labelStyle}>Scenario</div>
              <p style={pStyle}>Participant gets two rejected high-rate tasks, then one successful low-risk task.</p>
            </div>
            <div>
              <div style={labelStyle}>RS Calculation</div>
              <p style={pStyle}>
                -1.5 + -1.5 + 0.5 = <strong>-2.5 RS</strong>
              </p>
            </div>
            <div>
              <div style={labelStyle}>RD Calculation</div>
              <p style={pStyle}>
                +2 + +2 + -0.5 = <strong>+3.5 RD</strong>
              </p>
            </div>
            <div>
              <div style={labelStyle}>Result</div>
              <p style={pStyle}>
                Participant remains in Orange restrictions and cannot keep cycling into high-rate claims.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Epoch Rules</h2>
          <ul style={ulStyle}>
            <li>RD and RS are tracked continuously during the active epoch.</li>
            <li>
              At epoch rollover, reset RD to 0 and keep RS as governance history (recommended), or reset both for a
              clean pilot.
            </li>
            <li>
              All participants re-enter the new epoch with at least minimum claim access; no permanent lockout is
              permitted.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance and Oversight Responsibilities</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Issuer Committee:</strong> define event classifications, verification quality standards, and
              no-show evidence thresholds.
            </li>
            <li>
              <strong>Civic Committee:</strong> review sanction equity outcomes and recommend calibration changes.
            </li>
            <li>
              <strong>City/Sync (early phase):</strong> maintain control parameters and publish transparent RD/RS policy
              revisions.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Policy Summary</h2>
          <p style={pStyle}>
            Graduate Sanctions is designed to preserve trust without excluding people from participation. Participants
            who create risk are routed into progressively narrower claim windows, while repeated quality execution
            restores full access over time. The system is strict on behavior, flexible on recovery, and always keeps a
            pathway forward.
          </p>
        </section>
      </div>
    </main>
  );
}
