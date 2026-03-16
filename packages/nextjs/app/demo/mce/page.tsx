import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCE Deep Dive — City/Sync Demo",
  description:
    "Deep dive on City/Sync Mass Coordination Events (MCE): why they exist, how they operate, and how proposals become verified task execution.",
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

const timelineRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px dashed rgba(255,255,255,0.12)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(127,166,255,0.95)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: "rgba(245,245,247,0.9)",
  lineHeight: 1.65,
};

export default function MCEDivePage() {
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
          <div style={chipStyle}>MCE Deep Dive</div>
          <h1 style={h1Style}>Mass Coordination Events (MCE)</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            MCEs are city-scale initiatives where civic priority setting, task execution, and redemption incentives are
            coordinated into one operating cycle. The goal is to create a repeatable cadence that enhances coordination
            and communication among public-sector organizations around aligned goals and priorities.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Governance
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Coordination
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Verifiable Delivery
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why City/Sync Uses MCEs</h2>
          <p style={pStyle}>
            City/Sync uses MCEs to align city effort around shared priorities so organizations focus on high-need
            outcomes rather than fragmented activity, to connect governance directly to execution through proposal,
            voting, task design, and verification workflows, to create visible public legitimacy by showing how
            community preference becomes on-the-ground delivery, to coordinate public and private participation through
            issuer execution and redeemer incentive commitments, and to improve system learning each epoch with
            structured feedback loops that adjust rates, task standards, and operating processes.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What an MCE Includes</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Layer</th>
                  <th style={thStyle}>Purpose</th>
                  <th style={thStyle}>Typical Outputs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Proposal Layer</td>
                  <td style={tdStyle}>Defines the intended city outcome and target impact.</td>
                  <td style={tdStyle}>Proposal packet, objective statement, expected benefit.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Selection Layer</td>
                  <td style={tdStyle}>Chooses a limited set of candidates for city-wide voting.</td>
                  <td style={tdStyle}>Top 5 proposal slate selected by Issuer Committee process.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Voting Layer</td>
                  <td style={tdStyle}>Lets Civic Participants allocate VOTE to preferred outcomes.</td>
                  <td style={tdStyle}>Ranked winner and public vote totals.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Planning Layer</td>
                  <td style={tdStyle}>Translates intent into executable workstreams and verifiable tasks.</td>
                  <td style={tdStyle}>Task packets, verification standards, go or no-go launch gate.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Execution Layer</td>
                  <td style={tdStyle}>Issues tasks, tracks claims, and verifies completed work.</td>
                  <td style={tdStyle}>Onchain task lifecycle records and reward distribution.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Closeout Layer</td>
                  <td style={tdStyle}>Measures results and informs next-epoch adjustments.</td>
                  <td style={tdStyle}>KPI report, lessons learned, carryover opportunities.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Role Responsibilities in an MCE</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Core Responsibilities</th>
                  <th style={thStyle}>Success Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Issuer Organizations</td>
                  <td style={tdStyle}>
                    Propose initiatives, participate in top-5 selection, design task packets, issue tasks, and verify
                    completed work.
                  </td>
                  <td style={tdStyle}>High completion quality, timely verification, and measured outcome delivery.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Redeemer Organizations</td>
                  <td style={tdStyle}>
                    Commit offerings linked to active MCE proposals and honor commitments during the event period.
                  </td>
                  <td style={tdStyle}>Reliable redemption capacity and predictable participant value.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Civic Participants</td>
                  <td style={tdStyle}>
                    Vote on proposals, claim tasks, execute work, submit evidence, and redeem earned credits.
                  </td>
                  <td style={tdStyle}>Verified completion volume and clear contribution-to-benefit experience.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Issuer Committee</td>
                  <td style={tdStyle}>
                    Select top 5 proposals through a structured process and publish transparent rationale.
                  </td>
                  <td style={tdStyle}>Defensible selection quality and clear public accountability.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>End-to-End MCE Process</h2>

          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 1</div>
            <div style={bodyStyle}>
              <strong>Proposal Intake.</strong> Issuers and Redeemers submit MCE proposals describing intended outcomes,
              scope, and expected public benefit.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 2</div>
            <div style={bodyStyle}>
              <strong>Top-5 Selection.</strong> The Issuer Committee applies eligibility gates, weighted scoring, and
              ranked-ballot finalization to publish the next voting slate.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 3</div>
            <div style={bodyStyle}>
              <strong>Open Voting.</strong> Civic Participants allocate VOTE across the active proposal slate during the
              open window.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 4</div>
            <div style={bodyStyle}>
              <strong>Closed Tally.</strong> Voting closes, totals are finalized, and the winning MCE is selected.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 5</div>
            <div style={bodyStyle}>
              <strong>Planning and Readiness.</strong> Issuers complete pre-task distribution planning: workstreams,
              constraints, verification rules, and launch readiness gates.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 6</div>
            <div style={bodyStyle}>
              <strong>Task Creation and Distribution.</strong> Approved task packets are issued onchain and become
              claimable by participants.
            </div>
          </div>
          <div style={timelineRowStyle}>
            <div style={labelStyle}>Step 7</div>
            <div style={bodyStyle}>
              <strong>Execution and Verification.</strong> Participants execute tasks, submit completion evidence, and
              Issuers verify outcomes.
            </div>
          </div>
          <div style={{ ...timelineRowStyle, borderBottom: "none", paddingBottom: 0 }}>
            <div style={labelStyle}>Step 8</div>
            <div style={bodyStyle}>
              <strong>Closeout and Learning.</strong> KPI outcomes, failure points, and carryover recommendations are
              documented for the next epoch.
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Epoch Timing Framework</h2>
          <p style={pStyle}>
            City/Sync assumes a 3-month epoch (~12 weeks). This creates a stable operating window for voting, planning,
            and execution while preserving room for parameter resets at cycle boundaries.
          </p>
          <ul style={ulStyle}>
            <li>Week 1: Open voting starts.</li>
            <li>Weeks 1-4: Open voting window.</li>
            <li>Weeks 4-5: Redeemer rate-adjustment window.</li>
            <li>Weeks 5-6: Closed voting and winner finalization.</li>
            <li>Week 7: MCE planning begins.</li>
            <li>Week 10: MCE tasks are finalized for distribution.</li>
            <li>2 days before next epoch: Issuer Committee finalizes top 5 proposals for next cycle.</li>
            <li>Day 1 of next epoch: Task distribution is live.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Onchain vs Offchain Responsibilities</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Domain</th>
                  <th style={thStyle}>Recommended Location</th>
                  <th style={thStyle}>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Task issuance, claim, completion submission, verification, reward minting</td>
                  <td style={tdStyle}>Onchain</td>
                  <td style={tdStyle}>Shared state, auditability, and multi-party trust.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Proposal drafting notes and planning worksheets</td>
                  <td style={tdStyle}>Offchain</td>
                  <td style={tdStyle}>Fast iteration, low friction, easier editing.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Committee rationale reports and public summaries</td>
                  <td style={tdStyle}>Offchain (optionally hash-anchored)</td>
                  <td style={tdStyle}>Readable documentation with optional integrity proofs.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Final winner and task lifecycle events</td>
                  <td style={tdStyle}>Onchain</td>
                  <td style={tdStyle}>Single source of truth for execution state.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Quality and Integrity Standards</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Task success criteria must be explicit.</strong> If verification is not objective, outcomes are
              difficult to defend.
            </li>
            <li>
              <strong>Verification evidence must be defined before launch.</strong> Required photos, checklists, and
              signoff fields should be known in advance.
            </li>
            <li>
              <strong>No-show and invalid submission rules must be fixed pre-launch.</strong> Enforcement should be
              consistent and documented.
            </li>
            <li>
              <strong>Rejected submissions are non-appealable in MCE flows.</strong> Issuer decisions are final, but
              participants are notified and credits are still distributed for the rejected instance.
            </li>
            <li>
              <strong>Integrity incidents are silently tracked and trigger graduated sanctions.</strong> After repeated
              incidents, claim restrictions are applied and progressively tightened to prevent abuse.
            </li>
            <li>
              <strong>MCE execution must include redundancy.</strong> Critical work should have backup task coverage so
              city outcomes are protected even when individual submissions fail quality checks.
            </li>
            <li>
              <strong>Redeemer commitments should remain stable for event duration.</strong> Predictability is essential
              for participant trust.
            </li>
            <li>
              <strong>Closeout reporting is part of execution.</strong> Every MCE should produce KPI outcomes and
              next-cycle recommendations.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Implementation Resources</h2>
          <ul style={ulStyle}>
            <li>
              <strong>MCE Pre-Task Planning Template:</strong>{" "}
              <code>docs/design/mce-pre-task-distribution-template.md</code>
            </li>
            <li>
              <strong>Issuer Committee Selection Process:</strong>{" "}
              <code>docs/design/mce-issuer-committee-selection-process.md</code>
            </li>
            <li>
              <strong>Epoch Cadence Guide:</strong> <code>docs/design/epoch-cadence-and-governance-schedule.md</code>
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Current Governance Defaults</h2>
          <p style={pStyle}>The following defaults are now defined for current MCE operations:</p>
          <ul style={ulStyle}>
            <li>Top-5 proposal scoring weights are fixed for the full cycle.</li>
            <li>Public transparency is summary-level; proposer organizations receive full scoring transparency.</li>
            <li>Verification SLA is set by task type and deadline criticality.</li>
            <li>Rejected submissions do not use an appeal process; participants are notified and still credited.</li>
            <li>Repeated integrity incidents are silently tracked and handled through graduated restrictions.</li>
            <li>MCE planning must include redundancy so core work remains covered.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
