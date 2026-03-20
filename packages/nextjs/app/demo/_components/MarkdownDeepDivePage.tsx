import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type MarkdownBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "code"; text: string };

type MarkdownSection = {
  heading?: string;
  blocks: Exclude<MarkdownBlock, { type: "h1" | "h2" }>[];
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0D0D14 0%, #121227 40%, #0D0D14 100%)",
  color: "#f5f5f7",
  padding: "44px 20px 80px",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const containerStyle: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
};

const heroCard: CSSProperties = {
  background: "linear-gradient(135deg, rgba(65,105,225,0.22), rgba(221,158,51,0.16))",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 22,
  padding: "28px 24px",
  boxShadow: "0 20px 42px rgba(0,0,0,0.25)",
  marginBottom: 24,
};

const sectionCard: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 18,
  padding: "22px 20px",
  marginBottom: 16,
};

const chipStyle: CSSProperties = {
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

const h1Style: CSSProperties = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 44px)",
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: -0.4,
};

const h2Style: CSSProperties = {
  margin: "0 0 10px",
  color: "#ffffff",
  fontSize: 22,
  lineHeight: 1.35,
  fontWeight: 800,
  letterSpacing: -0.2,
};

const h3Style: CSSProperties = {
  margin: "16px 0 8px",
  color: "rgba(255,255,255,0.95)",
  fontSize: 17,
  lineHeight: 1.4,
  fontWeight: 700,
};

const paragraphStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "rgba(245,245,247,0.9)",
  fontSize: 15,
  lineHeight: 1.78,
};

const listStyle: CSSProperties = {
  margin: "2px 0 12px 0",
  paddingLeft: 22,
  color: "rgba(245,245,247,0.9)",
  fontSize: 15,
  lineHeight: 1.72,
};

const listItemStyle: CSSProperties = {
  marginBottom: 8,
};

const codeBlockStyle: CSSProperties = {
  margin: "8px 0 14px",
  background: "rgba(12,13,20,0.88)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "12px 14px",
  overflowX: "auto",
  whiteSpace: "pre",
  fontSize: 13,
  lineHeight: 1.65,
  color: "rgba(245,245,247,0.9)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const inlineCodeStyle: CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 6,
  padding: "0 6px",
  margin: "0 1px",
  fontSize: "0.92em",
  lineHeight: 1.55,
  color: "#f8f8fb",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const isSetextUnderline = (line: string) => /^={3,}$/.test(line.trim()) || /^-{3,}$/.test(line.trim());

const parseMarkdownBlocks = (raw: string): MarkdownBlock[] => {
  const normalized = raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .trim();
  const lines = normalized.split("\n");

  const blocks: MarkdownBlock[] = [];
  const paragraphBuffer: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let codeMode = false;
  let codeBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
    paragraphBuffer.length = 0;
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ type: "list", items: [...listItems], ordered: listOrdered });
    listItems = [];
  };

  const flushCode = () => {
    if (!codeBuffer.length) return;
    blocks.push({ type: "code", text: codeBuffer.join("\n") });
    codeBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (codeMode) {
      if (trimmed.startsWith("```")) {
        flushCode();
        codeMode = false;
      } else {
        codeBuffer.push(rawLine);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      codeMode = true;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      if (text) {
        blocks.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text });
      }
      continue;
    }

    if (i + 1 < lines.length && isSetextUnderline(lines[i + 1])) {
      flushParagraph();
      flushList();
      const underline = lines[i + 1].trim();
      blocks.push({ type: underline.startsWith("=") ? "h1" : "h2", text: trimmed });
      i += 1;
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextOrdered = Boolean(ordered);
      const value = (unordered?.[1] ?? ordered?.[1] ?? "").trim();
      if (listItems.length && listOrdered !== nextOrdered) flushList();
      listOrdered = nextOrdered;
      listItems.push(value);
      continue;
    }

    if (listItems.length) flushList();
    paragraphBuffer.push(trimmed);
  }

  if (codeMode) flushCode();
  flushParagraph();
  flushList();
  return blocks;
};

const groupSections = (blocks: MarkdownBlock[]): { titleFromDoc?: string; sections: MarkdownSection[] } => {
  const docTitle = blocks.find(block => block.type === "h1")?.text;
  const filtered = blocks.filter(block => block.type !== "h1");

  const sections: MarkdownSection[] = [];
  let current: MarkdownSection = { blocks: [] };

  for (const block of filtered) {
    if (block.type === "h2") {
      if (current.heading || current.blocks.length > 0) {
        sections.push(current);
      }
      current = { heading: block.text, blocks: [] };
      continue;
    }

    current.blocks.push(block);
  }

  if (current.heading || current.blocks.length > 0) {
    sections.push(current);
  }

  return { titleFromDoc: docTitle, sections };
};

const renderInlineText = (text: string): ReactNode[] => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={`code-${index}`} style={inlineCodeStyle}>
          {token.slice(1, -1)}
        </code>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={`strong-${index}`}>{token.slice(2, -2)}</strong>;
    }

    return <span key={`text-${index}`}>{token}</span>;
  });
};

export function MarkdownDeepDivePage({
  chipLabel,
  pageTitle,
  description,
  markdown,
}: {
  chipLabel: string;
  pageTitle: string;
  description?: string;
  markdown: string;
}) {
  const blocks = parseMarkdownBlocks(markdown);
  const { titleFromDoc, sections } = groupSections(blocks);
  const heroTitle = pageTitle || titleFromDoc || "Deep Dive";

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
          <div style={chipStyle}>{chipLabel}</div>
          <h1 style={h1Style}>{heroTitle}</h1>
          {description ? <p style={{ ...paragraphStyle, margin: "12px 0 0" }}>{description}</p> : null}
        </section>

        {sections.map((section, sectionIndex) => (
          <section key={`md-section-${sectionIndex}`} style={sectionCard}>
            {section.heading ? <h2 style={h2Style}>{section.heading}</h2> : null}

            {section.blocks.map((block, blockIndex) => {
              if (block.type === "h3") {
                return (
                  <h3 key={`md-h3-${sectionIndex}-${blockIndex}`} style={h3Style}>
                    {block.text}
                  </h3>
                );
              }

              if (block.type === "code") {
                return (
                  <pre key={`md-code-${sectionIndex}-${blockIndex}`} style={codeBlockStyle}>
                    {block.text}
                  </pre>
                );
              }

              if (block.type === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag key={`md-list-${sectionIndex}-${blockIndex}`} style={listStyle}>
                    {block.items.map((item, itemIndex) => (
                      <li key={`md-item-${sectionIndex}-${blockIndex}-${itemIndex}`} style={listItemStyle}>
                        {renderInlineText(item)}
                      </li>
                    ))}
                  </ListTag>
                );
              }

              return (
                <p key={`md-paragraph-${sectionIndex}-${blockIndex}`} style={paragraphStyle}>
                  {renderInlineText(block.text)}
                </p>
              );
            })}
          </section>
        ))}
      </div>
    </main>
  );
}
