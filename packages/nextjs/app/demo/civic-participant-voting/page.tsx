import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Civic Participant Voting — City/Sync Demo",
  description:
    "How Civic Participants vote on MCE proposals today and how VOTE governance can expand public-sector decision-making over time.",
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

export default function CivicParticipantVotingPage() {
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
          <div style={chipStyle}>Civic Participant Voting</div>
          <h1 style={h1Style}>How MCE Voting Works and Where VOTE Goes Next</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            During the pilot, Civic Participants use $VOTE to signal which Mass Coordination Event (MCE) proposals
            should become city execution priorities. This voting process is the first governance layer in City/Sync, and
            it establishes how participant voice can shape public-sector activity.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              MCE Voting
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Participant Voice
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Governance Expansion
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why MCE Voting Exists</h2>
          <ul style={ulStyle}>
            <li>Converts civic participation into directional governance signal.</li>
            <li>Prioritizes community needs through participant preference.</li>
            <li>Creates legitimacy for which initiatives become execution focus.</li>
            <li>Connects earned contribution (`CITY`) with governance power (`VOTE`).</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Current MCE Voting Process</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Step</th>
                  <th style={thStyle}>What Happens</th>
                  <th style={thStyle}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>1. Proposal Slate</td>
                  <td style={tdStyle}>MCE proposals are prepared and narrowed to a voting slate.</td>
                  <td style={tdStyle}>Participants vote from a defined set of candidate initiatives.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>2. Open Voting Window</td>
                  <td style={tdStyle}>Civic Participants allocate their `VOTE` during the open period.</td>
                  <td style={tdStyle}>Live preference signal forms around proposal options.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>3. Voting Close</td>
                  <td style={tdStyle}>Voting locks and final tallies are calculated.</td>
                  <td style={tdStyle}>Winning proposal is selected for execution planning.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>4. Issuer Planning</td>
                  <td style={tdStyle}>Issuers convert winning proposal into executable task packages.</td>
                  <td style={tdStyle}>MCE tasks are added and prepared for next execution cycle.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>5. Task Distribution</td>
                  <td style={tdStyle}>Participants can claim and execute tasks tied to the selected MCE.</td>
                  <td style={tdStyle}>Voting signal becomes measurable civic delivery.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>How Civic Participants earn VOTE</h2>
          <p style={pStyle}>
            In the pilot, participants receive VOTE 1:1 with the CITY they earn through verified civic work. This aligns
            governance influence with real participation in public-service activity. Users execute verified civic tasks,
            receive CITY and VOTE through issuance workflows, and use accumulated VOTE to influence MCE direction. Like
            CITY, participants VOTE tokens are non-transferrable.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>MCE Voting Is the Beginning, Not the End</h2>
          <p style={pStyle}>
            MCE voting is the first governance capability, but not the ceiling. Over time, `VOTE` can expand into a
            broader public-sector decision layer where participants influence more than proposal preference.
          </p>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Potential Future Capability</th>
                  <th style={thStyle}>What VOTE Could Influence</th>
                  <th style={thStyle}>Public-Sector Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Task Priority Signaling</td>
                  <td style={tdStyle}>Which task categories receive expansion attention.</td>
                  <td style={tdStyle}>Better alignment between labor supply and community need.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Policy Preference Input</td>
                  <td style={tdStyle}>Structured participant signal on selected governance decisions.</td>
                  <td style={tdStyle}>Stronger democratic legitimacy in operating choices.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Epoch Planning Guidance</td>
                  <td style={tdStyle}>Directional input for next-epoch focus and proposal framing.</td>
                  <td style={tdStyle}>More responsive civic planning cycles.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Feedback Weighting</td>
                  <td style={tdStyle}>Priority ranking of participant feedback signals.</td>
                  <td style={tdStyle}>Higher quality operational adjustments and accountability.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>dPAN Management</td>
                  <td style={tdStyle}>Influence future application on the City/Sync Framework.</td>
                  <td style={tdStyle}>Modular governance over public-service delivery.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Participatory Budgeting</td>
                  <td style={tdStyle}>
                    Integration with local governments could include opportunities to influence real policy decisions.
                  </td>
                  <td style={tdStyle}>
                    Expanded influence and engagement from local citizens through direct democracy.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance Expansion Principles</h2>
          <ul style={ulStyle}>
            <li>Expand capabilities gradually as operational reliability improves.</li>
            <li>Preserve transparency on what VOTE can and cannot decide at each phase.</li>
            <li>Keep anti-capture controls and committee safeguards in place.</li>
            <li>Ensure that governance influence remains linked to verifiable civic contribution.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
