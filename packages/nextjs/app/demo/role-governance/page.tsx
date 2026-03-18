import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Governance — City/Sync Demo",
  description:
    "Polycentric role governance for City/Sync: decision rights by role, committee authority, and the transition from City/Sync stewardship to mature decentralized governance.",
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

const processLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(127,166,255,0.95)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 4,
};

export default function RoleGovernancePage() {
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
          <div style={chipStyle}>Role Governance</div>
          <h1 style={h1Style}>Polycentric Governance for a Public-Sector Coordination Economy</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            City/Sync governance is intentionally polycentric: authority is distributed across multiple centers rather
            than concentrated in a single controller. This matters because public coordination systems fail when one
            group controls issuance, redemption, and rules without checks. Polycentric design keeps the system adaptive,
            transparent, and harder to capture, while allowing each role to govern the decisions it understands best.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Polycentric Authority
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Role-Scoped Decisions
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Decentralization Over Time
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Polycentric Governance Is Foundational</h2>
          <p style={pStyle}>
            City/Sync does not treat governance as a single election or one governance dashboard. Governance is a
            continuous operating function: setting task rules, calibrating redemption behavior, validating quality,
            handling disputes, and updating policy as conditions change. Polycentric governance ensures those decisions
            are distributed to the stakeholders with the right context, while preserving cross-role accountability. The
            objective is not decentralization theater. The objective is resilient decision quality at scale.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance Decision Rights by Role</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Governance Body</th>
                  <th style={thStyle}>Primary Decisions</th>
                  <th style={thStyle}>What They Must Protect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Representative Issuer Committee</td>
                  <td style={tdStyle}>
                    Task catalog admission rules, task normalization, task rate standards, issuer onboarding quality,
                    verification policy updates, and issuance guardrails.
                  </td>
                  <td style={tdStyle}>
                    Public-service integrity, task quality, non-displacement of paid labor, and reliable completion
                    throughput.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>Representative Redeemer Committee</td>
                  <td style={tdStyle}>
                    Redemption policy standards, rate guidance practices, offering classification norms, redeemer
                    onboarding criteria, and fulfillment reliability requirements.
                  </td>
                  <td style={tdStyle}>
                    Redemption predictability, participant trust, anti-abuse behavior, and sustainable service capacity.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>Representative Civic Committee</td>
                  <td style={tdStyle}>
                    Participant protections, feedback escalation, sanctions oversight recommendations, and cross-role
                    legitimacy review for disputed governance outcomes.
                  </td>
                  <td style={tdStyle}>
                    Fair access, transparent treatment of participants, and alignment between contribution and
                    influence.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>City/Sync (Early-Stage Steward)</td>
                  <td style={tdStyle}>
                    Bootstraps governance defaults, enforces initial safety guardrails, publishes process transparency,
                    and manages migration toward committee-led autonomy.
                  </td>
                  <td style={tdStyle}>
                    System coherence during early growth, anti-capture protections, and successful handoff design.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Governance Works in Practice</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={processLabelStyle}>Process 1</div>
              <p style={pStyle}>
                <strong>Proposal Intake and Scoping.</strong> Any governance change request enters a role-scoped queue
                (issuer, redeemer, or participant-domain). Each request is categorized as policy, operational, or
                emergency.
              </p>
            </div>
            <div>
              <div style={processLabelStyle}>Process 2</div>
              <p style={pStyle}>
                <strong>Committee Deliberation.</strong> The relevant committee evaluates impact, tradeoffs, and
                compliance with framework principles. Cross-role consultation is required when decisions affect multiple
                domains.
              </p>
            </div>
            <div>
              <div style={processLabelStyle}>Process 3</div>
              <p style={pStyle}>
                <strong>Decision and Publication.</strong> Outcomes are recorded with rationale, implementation timing,
                and expected metrics so governance remains inspectable and legible.
              </p>
            </div>
            <div>
              <div style={processLabelStyle}>Process 4</div>
              <p style={pStyle}>
                <strong>Epoch Review Loop.</strong> At fixed epoch checkpoints, committees evaluate observed outcomes
                and tune rules using shared evidence rather than one-off political pressure.
              </p>
            </div>
            <div>
              <div style={processLabelStyle}>Process 5</div>
              <p style={pStyle}>
                <strong>Incident and Escalation Path.</strong> High-risk failures (capture attempts, fulfillment
                collapse, verification abuse) trigger predefined escalation steps, temporary safeguards, and
                post-incident governance adjustments.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance Principles</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Polycentrism:</strong> no single body controls all key decisions.
            </li>
            <li>
              <strong>Subsidiarity:</strong> decisions should be made by the closest competent role.
            </li>
            <li>
              <strong>Transparency:</strong> decision rationales, not only outcomes, must be published.
            </li>
            <li>
              <strong>Non-Coercion:</strong> participation is earned and voluntary, not forced.
            </li>
            <li>
              <strong>Bounded Authority:</strong> each committee has explicit scope and escalation boundaries.
            </li>
            <li>
              <strong>Adaptation:</strong> policies are revisable by epoch evidence and lived system behavior.
            </li>
            <li>
              <strong>Contribution-Linked Voice:</strong> governance influence grows from civic contribution through
              earned VOTE, not purchase power.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Maturity Transition: From City/Sync-Led to Committee-Led</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Maturity Stage</th>
                  <th style={thStyle}>Authority Pattern</th>
                  <th style={thStyle}>Transition Goal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Stage A: Bootstrapping</td>
                  <td style={tdStyle}>
                    City/Sync sets baseline rules, safety constraints, and committee operating procedures.
                  </td>
                  <td style={tdStyle}>Establish procedural clarity and prevent early capture.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage B: Co-Governance</td>
                  <td style={tdStyle}>
                    Committees co-author policy updates while City/Sync provides review and constitutional guardrails.
                  </td>
                  <td style={tdStyle}>Build committee competence and governance memory.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage C: Committee Primary</td>
                  <td style={tdStyle}>
                    Representative committees become default decision centers; City/Sync becomes auditor and standards
                    maintainer.
                  </td>
                  <td style={tdStyle}>Operational decentralization with retained integrity checks.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage D: Framework Stewardship Network</td>
                  <td style={tdStyle}>
                    Local governance bodies coordinate across cities through shared process standards and federation
                    mechanisms.
                  </td>
                  <td style={tdStyle}>Enable cross-city scaling without re-centralizing authority.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>VOTE Expansion in the dPAN Era</h2>
          <p style={pStyle}>
            VOTE governance begins with core domains like MCE direction, public proposals, and participatory budgeting.
            As dPAN applications arrive, VOTE expands into application-specific governance. Each dPAN is governed in
            isolation by its relevant roles, with role-scoped authority and policy boundaries. This prevents one
            application from overpowering the whole system while allowing deep specialization where needed.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>App-scoped governance:</strong> each dPAN defines its own decision space, quorum logic, and role
              permissions.
            </li>
            <li>
              <strong>Role-local authority:</strong> only affected roles govern app-specific operations.
            </li>
            <li>
              <strong>Framework-level constitution:</strong> cross-app principles remain shared to preserve legitimacy.
            </li>
            <li>
              <strong>Interoperable learning:</strong> successful governance processes can be adopted by other dPANs
              without forcing uniformity.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why This Matters Long-Term</h2>
          <p style={pStyle}>
            If City/Sync succeeds, governance will no longer be treated as a static control layer on top of civic
            software. Governance becomes a living public capability: distributed, accountable, and continuously
            improvable. The long-term value is not simply better voting mechanics. It is the ability for cities to run
            high-trust coordination systems where authority is earned, scoped, and auditable, and where committees can
            mature into legitimate stewards of public-sector infrastructure.
          </p>
        </section>
      </div>
    </main>
  );
}
