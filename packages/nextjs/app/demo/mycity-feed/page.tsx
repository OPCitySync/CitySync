import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyCity Feed — City/Sync Demo",
  description: "How the MyCity Feed works as a public-sector communication layer for active Issuers and Redeemers.",
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

export default function MyCityFeedPage() {
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
          <div style={chipStyle}>MyCity Feed</div>
          <h1 style={h1Style}>Public-Sector News, Updates, and Reach</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            The MyCity Feed is a communication layer for active Issuers and Redeemers to engage residents, publish
            updates, and increase visibility of civic opportunities. It turns protocol participation into public-facing
            momentum.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Audience Growth
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Community Updates
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Active-Status Posting
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why the Feed Exists</h2>
          <ul style={ulStyle}>
            <li>
              <strong>For Issuers:</strong> attract participants to active tasks and communicate mission priorities.
            </li>
            <li>
              <strong>For Redeemers:</strong> promote active offerings and increase community participation.
            </li>
            <li>
              <strong>For the City:</strong> create a visible channel for local civic news and public updates.
            </li>
            <li>
              <strong>For participants:</strong> understand what is happening now, not just what exists in the catalog.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Posting Rule: Active Status Required</h2>
          <p style={pStyle}>
            Only active Issuers and active Redeemers can publish to the MyCity Feed. Active status means the
            organization has issued tasks or offerings in the current epoch. If an organization has no active issuance
            during the current epoch, posting permissions are suspended until activity resumes.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Issuer active condition:</strong> has tasks issued in current epoch.
            </li>
            <li>
              <strong>Redeemer active condition:</strong> has offerings issued in current epoch.
            </li>
            <li>
              <strong>No active issuance:</strong> no feed posting until status is restored.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why Active-Only Posting Matters</h2>
          <ul style={ulStyle}>
            <li>Aligns public communication with real protocol participation.</li>
            <li>Reduces stale promotion from inactive organizations.</li>
            <li>Improves feed trust by tying visibility to operational contribution.</li>
            <li>Keeps the feed focused on current civic opportunities and updates.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Potential Role for Local News Networks</h2>
          <p style={pStyle}>
            MyCity can evolve into a civic information bridge for local news organizations. Local media partners can use
            feed content as a signal layer for what is actively happening in community services, civic priorities, and
            public participation trends.
          </p>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Opportunity</th>
                  <th style={thStyle}>How Local News Can Engage</th>
                  <th style={thStyle}>Public Benefit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Activity Monitoring</td>
                  <td style={tdStyle}>Track active posts and surface high-relevance local updates.</td>
                  <td style={tdStyle}>Faster awareness of real-time civic activity.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Issue Amplification</td>
                  <td style={tdStyle}>Highlight mission-critical updates from active issuers/redeemers.</td>
                  <td style={tdStyle}>Increases reach for important public information.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Contextual Reporting</td>
                  <td style={tdStyle}>Pair feed posts with local reporting and resident context.</td>
                  <td style={tdStyle}>Improves civic literacy and informed participation.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Accountability Signals</td>
                  <td style={tdStyle}>Observe consistency between posted updates and active issuance behavior.</td>
                  <td style={tdStyle}>Strengthens transparency and institutional accountability.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Operational Path to Integrate Local News</h2>
          <ul style={ulStyle}>
            <li>Start with open visibility and citation workflows for active posts.</li>
            <li>Add structured feed tags for local-news relevance (events, alerts, opportunities, outcomes).</li>
            <li>Introduce editorial guidance so news usage preserves context and avoids misinterpretation.</li>
            <li>Explore API/read-only channels for vetted local media partners in mature phases.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
