import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The City/Sync Framework — City/Sync Demo",
  description:
    "Comprehensive overview of the City/Sync Framework: pilot validation, base mechanism, dPAN development, local-chain architecture, and global replication pathway.",
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

export default function CitySyncFrameworkPage() {
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
          <div style={chipStyle}>The City/Sync Framework</div>
          <h1 style={h1Style}>A Replicable Framework for Decentralized Public Administration</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            City/Sync is not just a pilot product. It is a framework for transforming how cities coordinate civic
            capacity, allocate public attention, and execute service delivery. The pilot is the first procedural
            artifact: a real-world validation of the base mechanism that future applications, local chains, and dPANs
            can be built on top of.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Pilot as Artifact
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Local-First Governance
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              dPAN Expansion Path
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What the Framework Is</h2>
          <p style={pStyle}>
            The City/Sync Framework is a method for introducing programmable public coordination into real institutional
            environments without collapsing governance legitimacy. It combines role-based operations, transparent
            lifecycle state, bounded civic economics, and committee-governed adaptation into one coherent system. The
            objective is to make public coordination measurable, auditable, and replicable across cities with different
            political and administrative contexts.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why the Pilot Is Foundational</h2>
          <p style={pStyle}>
            The pilot exists to answer one core question: can a city run a civic contribution system that is operational
            under real constraints, not ideal theory. If yes, the result is bigger than one deployment. It creates a
            transferable operating pattern that other jurisdictions can adopt with confidence.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Procedural output:</strong> onboarding, governance, and workflow standards that can be reused.
            </li>
            <li>
              <strong>Economic output:</strong> observable earn-to-burn behavior grounded in service capacity.
            </li>
            <li>
              <strong>Governance output:</strong> role accountability and committee decision rights under live
              conditions.
            </li>
            <li>
              <strong>Replication output:</strong> documented model cities can deploy without reinventing the stack.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>The Base Mechanism (What Must Be Validated)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Mechanism</th>
                  <th style={thStyle}>Why It Matters</th>
                  <th style={thStyle}>Pilot Validation Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Role Coordination (Issuer, Redeemer, Civic Participant)</td>
                  <td style={tdStyle}>Defines who does what, with clear rights and responsibilities.</td>
                  <td style={tdStyle}>Low-friction workflow execution across all three roles.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Task Lifecycle (Issue → Claim → Execute → Verify)</td>
                  <td style={tdStyle}>Converts civic effort into legible public-service activity.</td>
                  <td style={tdStyle}>Reliable movement through lifecycle states with shared visibility.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Verification and Distribution</td>
                  <td style={tdStyle}>Protects trust between execution claims and reward distribution.</td>
                  <td style={tdStyle}>Consistent verification quality and accountable decision records.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Redemption Continuity</td>
                  <td style={tdStyle}>Ensures earned credits remain materially meaningful.</td>
                  <td style={tdStyle}>Redeemer stability with manageable service throughput.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Governance Signaling (VOTE)</td>
                  <td style={tdStyle}>Links participation to decision influence in MCE direction.</td>
                  <td style={tdStyle}>Stable voting participation and coherent selection outcomes.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Administrative Legibility</td>
                  <td style={tdStyle}>Allows oversight without opaque discretionary bottlenecks.</td>
                  <td style={tdStyle}>Stakeholders can audit activity and understand decisions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>The City/Sync Stack</h2>
          <ul style={ulStyle}>
            <li>
              <strong>Coordination Role Layer:</strong> clearly bounded participation roles and governance rights.
            </li>
            <li>
              <strong>Public-Sector Economy Layer:</strong> CITY and VOTE as bounded civic coordination assets.
            </li>
            <li>
              <strong>Workflow Layer:</strong> issuance, verification, and redemption processes with shared state.
            </li>
            <li>
              <strong>Application Layer:</strong> Volunteer Network dApp first, domain-specific dPANs next.
            </li>
            <li>
              <strong>Replication Layer:</strong> governance templates, operating standards, and deployment playbooks.
            </li>
          </ul>
          <p style={{ ...pStyle, marginTop: 12 }}>
            The strategic point is continuity: each layer should reinforce the others so that local deployments produce
            durable institutional learning rather than one-off experimentation.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>dPAN Development Path</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Primary Focus</th>
                  <th style={thStyle}>Governance Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Stage 1: Core Pilot Reliability</td>
                  <td style={tdStyle}>Make base task/redemption loop dependable in real operations.</td>
                  <td style={tdStyle}>Tight role controls and explicit committee oversight.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage 2: Domain Packet Design</td>
                  <td style={tdStyle}>Define specific service domains suitable for dPAN implementation.</td>
                  <td style={tdStyle}>Published criteria for inclusion, risk, and feasibility.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage 3: dPAN Prototyping</td>
                  <td style={tdStyle}>Ship narrow-scope apps with clear administrative boundaries.</td>
                  <td style={tdStyle}>Role-specific accountability and auditable routing logic.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage 4: Multi-dPAN Governance</td>
                  <td style={tdStyle}>Operate parallel applications under one coordination framework.</td>
                  <td style={tdStyle}>Committee maturity and policy synchronization mechanisms.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Stage 5: Cross-City Portability</td>
                  <td style={tdStyle}>Enable reuse of validated dPAN designs in new jurisdictions.</td>
                  <td style={tdStyle}>Standardized compliance packets and adaptation protocols.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Local-Chain Infrastructure and Interoperability</h2>
          <p style={pStyle}>
            Local chains are not cosmetic infrastructure. They are the administrative substrate for coordination
            credibility. A local chain model allows each city to maintain governance autonomy while still participating
            in shared standards for portability, auditing, and model reuse.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Local autonomy:</strong> each jurisdiction governs participation and policy boundaries locally.
            </li>
            <li>
              <strong>Common standards:</strong> shared interfaces for task, verification, and redemption records.
            </li>
            <li>
              <strong>Portable civic history:</strong> contribution records can become interoperable across deployments.
            </li>
            <li>
              <strong>Reduced implementation risk:</strong> validated templates lower uncertainty for new adopters.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Toward a Market for Civic Models</h2>
          <p style={pStyle}>
            After validation, City/Sync can support a new type of exchange: a market for tested civic models and
            service-delivery methods. Instead of every city rebuilding coordination logic from zero, jurisdictions can
            adopt, adapt, and improve validated models from peers.
          </p>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Exportable Asset</th>
                  <th style={thStyle}>What Gets Shared</th>
                  <th style={thStyle}>Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Task Model Libraries</td>
                  <td style={tdStyle}>Standardized civic-labor templates and rate logic patterns.</td>
                  <td style={tdStyle}>Faster rollout with stronger comparability across cities.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Verification Packets</td>
                  <td style={tdStyle}>Assurance pathways, evidence standards, and rejection policies.</td>
                  <td style={tdStyle}>Improves trust and consistency in completion decisions.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Redemption Architectures</td>
                  <td style={tdStyle}>Capacity strategies, pricing frameworks, and POS workflows.</td>
                  <td style={tdStyle}>Supports sustainable service access and burn continuity.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Governance Blueprints</td>
                  <td style={tdStyle}>Committee structures, voting gates, and escalation controls.</td>
                  <td style={tdStyle}>Creates legitimacy and reduces political adoption friction.</td>
                </tr>
                <tr>
                  <td style={tdStyle}>dPAN Modules</td>
                  <td style={tdStyle}>Domain-specific decentralized public administration applications.</td>
                  <td style={tdStyle}>Transforms local administrative innovation into reusable infrastructure.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Governance Posture: Polycentric and Transitional</h2>
          <p style={pStyle}>
            Governance in this framework is intentionally transitional. City/Sync helps establish standards and
            procedural discipline early, then authority progressively shifts to role-based committees as operational
            maturity increases. This is how control is decentralized without sacrificing administrative reliability.
          </p>
          <ul style={ulStyle}>
            <li>Early phase: tighter safeguards, explicit policy defaults, and strong process monitoring.</li>
            <li>Middle phase: committee-led adaptation with transparent rationale and published rule changes.</li>
            <li>Mature phase: polycentric governance where each application is governed in its own bounded context.</li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Strategic Direction</h2>
          <p style={pStyle}>
            The framework ambition is straightforward: prove that civic coordination can become a durable administrative
            capability, then make that capability exportable. If the pilot validates the base mechanism, City/Sync can
            help move public administration from static bureaucracy toward living coordination infrastructure that is
            auditable, participatory, and continuously improvable. This is the pathway for decentralized public
            administration to move from theory into global practice.
          </p>
        </section>
      </div>
    </main>
  );
}
