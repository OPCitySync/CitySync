import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Civic Participant Growth — City/Sync Demo",
  description:
    "Roadmap for growing civic participant adoption by starting with existing volunteers, then expanding to redeemer audiences and broader community channels.",
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

export default function CivicParticipantGrowthPage() {
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
          <div style={chipStyle}>Civic Participant Growth</div>
          <h1 style={h1Style}>Roadmap to Expand Participation at City Scale</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            Growth starts by meeting people where civic participation already exists, then expanding outward in layers.
            The strategy is to convert existing volunteer behavior into visible protocol activity, then unlock adjacent
            audiences who can become new civic contributors over time.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Layered Growth
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Audience Expansion
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Retention by Utility
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Growth Thesis</h2>
          <ul style={ulStyle}>
            <li>Do not begin with abstract outreach; begin with active civic behavior already happening.</li>
            <li>Convert existing volunteer work into recognized and redeemable participation.</li>
            <li>Use redemption utility to pull in adjacent populations who are not yet frequent volunteers.</li>
            <li>
              Guide those participants into task participation through simple onboarding and low-friction entry tasks.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Phased Audience Roadmap</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Phase</th>
                  <th style={thStyle}>Primary Audience</th>
                  <th style={thStyle}>Why This Audience First</th>
                  <th style={thStyle}>Primary Conversion Goal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Existing Volunteers</td>
                  <td style={tdStyle}>People already volunteering with active issuer organizations.</td>
                  <td style={tdStyle}>Lowest acquisition friction and highest trust in issuer-led onboarding.</td>
                  <td style={tdStyle}>Convert known volunteers into active protocol participants.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Redeemer Users</td>
                  <td style={tdStyle}>People already using redeemer services but not volunteering regularly.</td>
                  <td style={tdStyle}>High utility sensitivity; redemption can motivate first civic action.</td>
                  <td style={tdStyle}>Turn service users into occasional civic participants.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Community Adjacent Audiences</td>
                  <td style={tdStyle}>Friends/family networks, neighborhood groups, and local event attendees.</td>
                  <td style={tdStyle}>Social proof + proximity to active participants increases trust and adoption.</td>
                  <td style={tdStyle}>Drive referral-based onboarding and first task completion.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Institutional Channels</td>
                  <td style={tdStyle}>Schools, workforce programs, community colleges, faith/community centers.</td>
                  <td style={tdStyle}>Built-in distribution channels for sustained participant recruitment.</td>
                  <td style={tdStyle}>Establish recurring recruitment and onboarding pipelines.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Citywide Participation Layer</td>
                  <td style={tdStyle}>General public across neighborhoods and demographics.</td>
                  <td style={tdStyle}>System has enough legitimacy, utility, and proof to scale broadly.</td>
                  <td style={tdStyle}>Normalize civic participation as a repeatable public behavior.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Phase 1: Existing Volunteers (Foundation)</h2>
          <ul style={ulStyle}>
            <li>Onboard directly through active issuer organizations with current volunteer programs.</li>
            <li>Map existing volunteer activities to task templates to reduce transition complexity.</li>
            <li>Prioritize tasks with clear verification and high completion confidence.</li>
            <li>Use this phase to establish baseline participation, retention, and verification quality metrics.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Phase 2: Redeemer Users (Adjacency Expansion)</h2>
          <ul style={ulStyle}>
            <li>Target people already interacting with redeemer offerings but not yet contributing regularly.</li>
            <li>Use redemption utility as motivation for first civic task participation.</li>
            <li>Pair onboarding tasks with redeemer touchpoints to lower first-action friction.</li>
            <li>Design messaging around practical value and low initial commitment.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Growth Beyond Phase 2: What to Build Next</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Expansion Lever</th>
                  <th style={thStyle}>How It Works</th>
                  <th style={thStyle}>Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Referral Loops</td>
                  <td style={tdStyle}>Participants invite peers into onboarding task flows.</td>
                  <td style={tdStyle}>Reduces trust barrier through social proof.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Institutional Partnerships</td>
                  <td style={tdStyle}>Embed onboarding pathways in local programs and community institutions.</td>
                  <td style={tdStyle}>Creates durable recruitment channels beyond ad hoc campaigns.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>MCE Campaign Funnels</td>
                  <td style={tdStyle}>Use MCE visibility to recruit new participants through clear calls to action.</td>
                  <td style={tdStyle}>Converts citywide attention into measurable participation.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Neighborhood Activation Pods</td>
                  <td style={tdStyle}>Localized onboarding pushes tied to specific issuers/redeemers.</td>
                  <td style={tdStyle}>Improves equity of adoption across neighborhoods.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Retention Journeys</td>
                  <td style={tdStyle}>Move users from first task to recurring contribution via task ladders.</td>
                  <td style={tdStyle}>Prevents one-and-done participation patterns.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Participant Lifecycle Targets</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Acquisition:</strong> account creation + first onboarding task claim.
            </li>
            <li>
              <strong>Activation:</strong> first verified completion + first reward receipt.
            </li>
            <li>
              <strong>Utility adoption:</strong> first redemption and return redemption behavior.
            </li>
            <li>
              <strong>Contribution recurrence:</strong> repeat task completion over multiple epochs.
            </li>
            <li>
              <strong>Governance participation:</strong> VOTE usage in MCE and later decision layers.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Core KPI Stack for Growth Decisions</h2>
          <ul style={ulStyle}>
            <li>First-task completion rate by audience segment.</li>
            <li>Time from signup to first verified task completion.</li>
            <li>Redeemer-user to first-task conversion rate.</li>
            <li>30/60/90 day repeat participation retention.</li>
            <li>Neighborhood and demographic distribution of active participants.</li>
            <li>Share of participants using both tasks and redemptions each epoch.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
