import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The City/Sync Framework — City/Sync Demo",
  description:
    "How the pilot validates the City/Sync base mechanism and unlocks a broader framework for decentralized public administration networks.",
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

const stageLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(127,166,255,0.95)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 6,
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
          <h1 style={h1Style}>From Pilot Validation to a Global Public Coordination Stack</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            The pilot is the procedural artifact that tests whether this model can reliably convert civic contribution
            into verifiable public value. If the pilot works, City/Sync is not just a demo outcome. It becomes a
            reusable framework for decentralized public administration that other cities can adopt, adapt, and extend.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(52,238,182,0.4)", color: "#34eeb6" }}>
              Local-First
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(221,158,51,0.4)", color: "#DD9E33" }}>
              Procedural Validation
            </span>
            <span style={{ ...chipStyle, marginBottom: 0, borderColor: "rgba(65,105,225,0.5)", color: "#7fa6ff" }}>
              Replicable by Design
            </span>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Why the Pilot Matters</h2>
          <p style={pStyle}>
            City/Sync is built on a core thesis: public administration can evolve from centralized, opaque process
            control into transparent, participatory coordination without collapsing institutional stability. The pilot
            exists to prove this thesis through operating evidence, not theory alone. It tests whether local
            organizations can issue public tasks, participants can execute them, verifiers can validate outcomes, and
            redemption systems can convert civic work into real utility in a way that is auditable, governable, and
            socially legible.
          </p>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>The Base Mechanism (What Gets Validated)</h2>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Layer</th>
                  <th style={thStyle}>Function</th>
                  <th style={thStyle}>Pilot Validation Question</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>Role Infrastructure</td>
                  <td style={tdStyle}>Issuer, Redeemer, and Civic Participant workflows.</td>
                  <td style={tdStyle}>Can each role perform reliably with clear responsibilities and low friction?</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Task Coordination Loop</td>
                  <td style={tdStyle}>Issue → claim → execute → verify/mint lifecycle.</td>
                  <td style={tdStyle}>Can civic work be converted into verifiable outcomes at repeatable scale?</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Public-Sector Economy</td>
                  <td style={tdStyle}>Budget-bounded issuance and redemption throughput.</td>
                  <td style={tdStyle}>Can credits retain practical value without speculative drift?</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Governance Signaling</td>
                  <td style={tdStyle}>VOTE-driven preference expression for MCE pathways.</td>
                  <td style={tdStyle}>Can contribution and decision influence remain credibly linked?</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Shared Transparency</td>
                  <td style={tdStyle}>Onchain visibility for execution and accountability events.</td>
                  <td style={tdStyle}>Can stakeholders audit what happened without relying on trust claims alone?</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Pilot as Procedural Artifact</h2>
          <p style={pStyle}>
            The pilot is not only a product test. It is a standards test. It yields the operating playbooks, policy
            boundaries, and governance procedures that define how future deployments should launch. In this sense, the
            pilot becomes the first procedural artifact of the City/Sync Framework: a documented method for onboarding
            institutions, managing risk, defining role accountability, and running measurable civic coordination cycles
            inside real communities.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Institutional onboarding method:</strong> how cities and organizations activate safely.
            </li>
            <li>
              <strong>Operational standards:</strong> task legibility, verification integrity, and redemption rules.
            </li>
            <li>
              <strong>Governance cadence:</strong> epoch timing, proposal flow, and committee responsibilities.
            </li>
            <li>
              <strong>Economic guardrails:</strong> issuance and redemption balancing with transparent adjustment rules.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Framework Evolution Path</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={stageLabel}>Stage 1</div>
              <p style={pStyle}>
                <strong>Validated Local Pilot.</strong> One city proves that the base loop is functionally stable and
                socially understandable.
              </p>
            </div>
            <div>
              <div style={stageLabel}>Stage 2</div>
              <p style={pStyle}>
                <strong>Multi-City Replication.</strong> Additional cities reuse the same procedural stack while tuning
                policy parameters to local needs.
              </p>
            </div>
            <div>
              <div style={stageLabel}>Stage 3</div>
              <p style={pStyle}>
                <strong>dPAN Expansion.</strong> Beyond volunteer coordination, cities begin deploying new decentralized
                public administration applications for specific service domains.
              </p>
            </div>
            <div>
              <div style={stageLabel}>Stage 4</div>
              <p style={pStyle}>
                <strong>Interoperable Local Chains.</strong> Civic reputation, participation history, and governance
                contribution become portable between compatible city networks.
              </p>
            </div>
            <div>
              <div style={stageLabel}>Stage 5</div>
              <p style={pStyle}>
                <strong>Framework Economy.</strong> A global ecosystem emerges where cities can adopt tested governance
                and service-delivery models rather than reinventing them from scratch.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>What Could Be Built After Validation</h2>
          <p style={pStyle}>
            Once the base mechanism is validated, City/Sync can move from a single pilot into a framework economy of
            civic coordination infrastructure. This is where the long-term upside becomes transformative. Cities,
            cooperatives, institutions, and developers can build on a shared protocol layer while preserving local
            governance autonomy.
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>dPAN Application Libraries:</strong> reusable modules for public works, service verification,
              youth programs, sanitation campaigns, and neighborhood safety coordination.
            </li>
            <li>
              <strong>Local Chain Deployment Kits:</strong> standardized launch packages for municipal and community-led
              validator cohorts with known governance safeguards.
            </li>
            <li>
              <strong>Civic Model Marketplaces:</strong> exportable policy and operations templates where one city can
              adopt a proven task or redemption model from another.
            </li>
            <li>
              <strong>Public-Service Delivery Benchmarks:</strong> transparent cross-city metrics on participation
              throughput, verification quality, and budget efficiency.
            </li>
            <li>
              <strong>Participatory Budget Engines:</strong> vote-weighted allocation systems that connect contribution
              history to local spending influence.
            </li>
            <li>
              <strong>Portable Civic Identity Rails:</strong> long-lived contribution records that travel across
              interoperable city networks.
            </li>
          </ul>
        </section>

        <section style={sectionCard}>
          <h2 style={h2Style}>Toward Decentralized Public Administration</h2>
          <p style={pStyle}>
            The City/Sync Framework is not pursuing disruption for its own sake. It is pursuing a managed transition:
            from brittle centralized administration to resilient coordination systems that communities can see, shape,
            and trust. If the pilot proves the mechanism, what follows is a decade-scale opportunity to build a new
            public infrastructure layer where local experimentation, transparent governance, and shared procedural
            knowledge compound globally.
          </p>
          <p style={{ ...pStyle, marginTop: 12 }}>
            In that future, cities do not compete only on tax incentives or private investment capture. They also
            compete on their ability to coordinate public value creation with precision, legitimacy, and civic
            participation. That is the strategic promise of the framework: a world where better governance models can be
            built, validated, and exported as openly as software.
          </p>
        </section>
      </div>
    </main>
  );
}
