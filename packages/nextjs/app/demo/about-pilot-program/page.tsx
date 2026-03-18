import { readFileSync } from "node:fs";
import path from "node:path";

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Pilot Program — City/Sync Demo",
  description: "Direct text of the official City/Sync Pilot Deployment framework document.",
};

const pilotProgramPath = path.join(process.cwd(), "app/demo/about-pilot-program/pilot-program.txt");
const pilotProgramText = readFileSync(pilotProgramPath, "utf8").trim();

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

const h1Style: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 44px)",
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: -0.4,
};

const pStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(245,245,247,0.84)",
  fontSize: 15,
  lineHeight: 1.72,
};

const documentStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(245,245,247,0.9)",
  fontSize: 15,
  lineHeight: 1.75,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};

export default function AboutPilotProgramPage() {
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
          <div style={chipStyle}>About the Pilot Program</div>
          <h1 style={h1Style}>The City/Sync Pilot Framework</h1>
          <p style={{ ...pStyle, marginTop: 14, fontSize: 16 }}>
            The content below is copied directly from your official pilot deployment document.
          </p>
        </section>

        <section style={sectionCard}>
          <p style={documentStyle}>{pilotProgramText}</p>
        </section>
      </div>
    </main>
  );
}
