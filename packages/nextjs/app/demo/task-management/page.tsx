import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Management — City/Sync Demo",
  description:
    "How City/Sync tasks are defined, normalized, cataloged, issued, and governed across the full lifecycle.",
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

export default function TaskManagementPage() {
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
          <div style={chipStyle}>Task Management</div>
          <h1 style={h1Style}>Task Lifecycle, Decision Space, and Catalog Governance</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            City/Sync tasks are managed as civic infrastructure. Issuers define and propose task functions, City/Sync
            and participating issuers normalize rates, and approved task types enter catalog systems that separate local
            issuing flexibility from protocol-wide transparency and standardization.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Lifecycle Controls
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Catalog Governance
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Epoch Normalization
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot Program Task Rules (Current Non-Negotiables)</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Rule 1 — No labor displacement:</strong> approved tasks cannot replace existing paid functions of
              issuer organizations.
            </li>
            <li>
              <strong>Rule 2 — Public mission fit:</strong> approved tasks must facilitate delivery of a public good or
              public service.
            </li>
            <li>
              <strong>Rule 3 — Verifiability:</strong> tasks must include legible success criteria and evidence
              expectations before issuance.
            </li>
            <li>
              <strong>Rule 4 — Accessibility:</strong> task design should be understandable and executable by diverse
              participant populations, with clear instructions and realistic requirements.
            </li>
            <li>
              <strong>Rule 5 — Safety and credential matching:</strong> tasks with elevated risk or specialized scope
              require explicit credential requirements and supervision standards.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Task Catalog Structure and Governance Intent</h2>
          <p style={pStyle}>
            The catalog is not just a list of tasks. It is a governance mechanism for consistency. Each approved task
            type carries standardized metadata: scope, expected duration, civic benefit statement, success criteria,
            rate per hour, and credential expectations where relevant. This structure allows City/Sync and issuers to
            normalize similar work into similar rates, reserve categories for inclusion/equity priorities, and keep
            issuance predictable enough for redemption planning.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Task Lifecycle and Decision Space</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Lifecycle Stage</th>
                  <th style={thStyle}>Primary Decision Maker</th>
                  <th style={thStyle}>Decisions at This Stage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Define Task Function</td>
                  <td style={tdStyle}>Issuer Organization</td>
                  <td style={tdStyle}>
                    Title, function, success criteria, implementation intent, and one-hour value basis.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Propose to Catalog</td>
                  <td style={tdStyle}>Issuer → Catalog Managers</td>
                  <td style={tdStyle}>
                    Task is submitted for legibility/accessibility refinement and policy fit review.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Rate Normalization</td>
                  <td style={tdStyle}>City/Sync + Issuer oversight (later committee-led)</td>
                  <td style={tdStyle}>Similar tasks are priced similarly; rates standardized per one hour of work.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Catalog Finalization</td>
                  <td style={tdStyle}>Catalog Managers</td>
                  <td style={tdStyle}>Task enters approved catalog(s); rate locked for current epoch.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Task Issuance</td>
                  <td style={tdStyle}>Issuer Organization</td>
                  <td style={tdStyle}>
                    Set date, location, time, hours, and implementation details for each issued instance.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>6. Open / Claim / Execute</td>
                  <td style={tdStyle}>Civic Participant + Issuer operations</td>
                  <td style={tdStyle}>Open pool claim, execution, no-show handling, verification review.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>7. Mint / Infractions / Reissue</td>
                  <td style={tdStyle}>Issuer Organization</td>
                  <td style={tdStyle}>
                    Verify and mint, or reject with notification + tracked infraction; unissued from catalog as needed.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>The Two Catalogs and Why Both Exist</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Organizational Task Catalog:</strong> each issuer operational library of approved task types that
              can be rapidly issued during an epoch.
            </li>
            <li>
              <strong>Master Task Catalog:</strong> protocol-level registry of all approved task types across issuers
              and cities, managed by City/Sync as the source of truth for transparency and rate logic.
            </li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            Issuers are not allowed to create tasks at will because unrestricted creation would produce inconsistent
            rates, ambiguous task definitions, low comparability across organizations, and reduced public trust in
            issuance quality. The catalog layer creates governance memory: task types become legible, repeatable,
            auditable, and calibratable over time.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Rate Normalization and Epoch Rules</h2>
          <ul style={ulStyle}>
            <li>All task rates are normalized on a one-hour basis to improve comparability.</li>
            <li>After proposals are submitted, similar task functions are priced similarly.</li>
            <li>
              Once finalized, the rate for a task type is locked for the active epoch; only issuance parameters can be
              adjusted by issuers.
            </li>
            <li>
              New rate calibration occurs in epoch governance windows, including midpoint review and pre-next-epoch
              review.
            </li>
            <li>
              Catalog managers maintain a written rationale trail for normalization decisions to preserve transparency
              and future auditability.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Issuance and Open Pool Behavior</h2>
          <ul style={ulStyle}>
            <li>Issuers can issue from their organizational catalog at any time during the epoch.</li>
            <li>Issued tasks enter the open task pool and can be claimed by any civic participant.</li>
            <li>Issuers may also issue directly to a specified user when needed.</li>
            <li>Any unclaimed open-pool task can be unissued by the issuing organization.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Claimed, No-Show, Verification, and Infractions</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Rule</th>
                  <th style={thStyle}>System Consequence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>No Show</td>
                  <td style={tdStyle}>Can only be selected after scheduled task date/time has passed.</td>
                  <td style={tdStyle}>Task removed from circulation; issuer may reissue from catalog.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Verification Rejection</td>
                  <td style={tdStyle}>Issuer deems execution unsatisfactory or poorly completed.</td>
                  <td style={tdStyle}>
                    Participant is notified; credits are still distributed; infraction is tracked.
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>No Show or Rejection Infraction</td>
                  <td style={tdStyle}>Does not auto-ban participation.</td>
                  <td style={tdStyle}>Recorded for graduated sanctions and potential claim restrictions over time.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance Evolution of Catalog Management</h2>
          <p style={pStyle}>
            In the initial phase, City/Sync runs task catalog management with oversight from participating issuers.
            During this stage, catalog managers actively help issuers refine proposed tasks for clarity, accessibility,
            and consistency. As participation matures, management authority transitions to committee governance, where
            review, normalization, and approval cadence are handled by representative bodies.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Current state:</strong> City/Sync-led management with issuer oversight.
            </li>
            <li>
              <strong>Target state:</strong> committee-led management with standardized process discipline.
            </li>
            <li>
              <strong>Review cadence:</strong> new task proposals reviewed halfway through each epoch and again before
              each new epoch.
            </li>
            <li>
              <strong>Expected evolution:</strong> as committee maturity improves, calibration shifts from
              City/Sync-facilitated normalization toward committee-owned rate governance with formal reporting.
            </li>
            <li>
              <strong>Long-term objective:</strong> the master catalog becomes cross-city standard infrastructure for
              interoperable civic-labor classification and comparable pricing logic.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Additional Controls That Close Process Gaps</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Template before issuance:</strong> no task instance is issued unless it is tied to an approved
              catalog template.
            </li>
            <li>
              <strong>Mutable vs locked fields:</strong> issuers can modify schedule/location/implementation details at
              issuance time, but not hourly rate during the active epoch.
            </li>
            <li>
              <strong>Open-pool hygiene:</strong> unissue is limited to unclaimed tasks to avoid hidden cancellations of
              active participant commitments.
            </li>
            <li>
              <strong>No-show timing guard:</strong> no-show decisions are only valid after scheduled event time passes.
            </li>
            <li>
              <strong>Graduated sanctions model:</strong> no-show and rejection events are logged as infractions for
              potential restrictions, without immediate exclusion from participation.
            </li>
            <li>
              <strong>Onchain/offchain split:</strong> template governance and review are policy workflows, while
              issuance, claims, verification, and rewards are shared-state lifecycle events.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
