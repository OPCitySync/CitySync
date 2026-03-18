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

type PilotBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const sectionHeadingSet = new Set([
  "A Deployment Model for Programmable Public Coordination",
  "Procedural Implementation",
  "Roles",
  "Deployment Models as Instruments of Administrative Change",
  "Objectives of the City/Sync Pilot",
  "Cross-Governance Deployment",
  "The Dual-Market Coordination Engine",
  "Issuer Onboarding as Infrastructure",
  "Redemption Architecture",
  "Designing for Replication",
  "Governance of the Pilot",
  "What Success Looks Like",
  "The Direction of Public Coordination",
]);

const normalizePilotText = (rawText: string) =>
  rawText
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const isLikelyHeading = (line: string) => {
  if (!line || line.length > 80) {
    return false;
  }
  if (/[.:;!?]$/.test(line)) {
    return false;
  }
  if (/^\d+[\).]/.test(line)) {
    return false;
  }
  const words = line.split(" ");
  if (words.length > 10) {
    return false;
  }
  return /^[A-Z0-9]/.test(line);
};

const parsePilotBlocks = (rawText: string): PilotBlock[] => {
  const normalized = normalizePilotText(rawText);
  const lines = normalized.split("\n");

  if (lines[0]?.trim() === "The City/Sync Pilot Framework") {
    lines.shift();
  }

  const blocks: PilotBlock[] = [];
  const listBuffer: string[] = [];

  const flushList = () => {
    if (!listBuffer.length) {
      return;
    }
    blocks.push({ type: "list", items: [...listBuffer] });
    listBuffer.length = 0;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t+/g, " ").replace(/\s+/g, " ").trim();

    if (!line) {
      flushList();
      continue;
    }

    if (/^[•*-]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[•*-]\s+/, "").trim());
      continue;
    }

    if (sectionHeadingSet.has(line) || isLikelyHeading(line)) {
      flushList();
      blocks.push({ type: "heading", text: line });
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();

  return blocks;
};

const pilotBlocks = parsePilotBlocks(pilotProgramText);

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

const docHeadingStyle: React.CSSProperties = {
  margin: "14px 0 8px",
  color: "#ffffff",
  fontSize: 22,
  lineHeight: 1.35,
  fontWeight: 800,
  letterSpacing: -0.2,
};

const docParagraphStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "rgba(245,245,247,0.9)",
  fontSize: 15,
  lineHeight: 1.78,
};

const docListStyle: React.CSSProperties = {
  margin: "2px 0 12px 0",
  paddingLeft: 22,
  listStyleType: "disc",
  color: "rgba(245,245,247,0.9)",
  fontSize: 15,
  lineHeight: 1.72,
};

const docListItemStyle: React.CSSProperties = {
  marginBottom: 8,
};

const renderParagraph = (text: string) => {
  const labelMatch = text.match(/^([A-Za-z0-9$()/&,'’ -]{3,60}:)\s*(.+)$/);
  if (labelMatch && labelMatch[1].split(" ").length <= 8) {
    return (
      <p style={docParagraphStyle}>
        <strong>{labelMatch[1]}</strong> {labelMatch[2]}
      </p>
    );
  }

  return <p style={docParagraphStyle}>{text}</p>;
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
        </section>

        <section style={sectionCard}>
          {pilotBlocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2 key={`heading-${index}`} style={docHeadingStyle}>
                  {block.text}
                </h2>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={`list-${index}`} style={docListStyle}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`item-${itemIndex}`} style={docListItemStyle}>
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            return <div key={`paragraph-${index}`}>{renderParagraph(block.text)}</div>;
          })}
        </section>
      </div>
    </main>
  );
}
