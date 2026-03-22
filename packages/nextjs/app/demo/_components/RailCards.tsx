"use client";

import React from "react";

export type RelatedReadingLink = { label: string; href: string };

const railCardStyle: React.CSSProperties = {
  background: "var(--cs-rail-surface, rgba(255,255,255,0.9))",
  border: "1px solid var(--cs-rail-border, rgba(31,45,86,0.12))",
  borderRadius: 16,
  padding: 14,
};

export function RailInfoPlaceholderCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...railCardStyle,
        fontSize: 12,
        color: "var(--cs-rail-text, rgba(27,45,95,0.72))",
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}

export function RelatedDeepDivesCard({
  links,
  emptyText,
  keyPrefix,
}: {
  links: RelatedReadingLink[];
  emptyText: string;
  keyPrefix: string;
}) {
  return (
    <div style={railCardStyle}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--cs-rail-text-muted, rgba(27,45,95,0.5))",
          marginBottom: 6,
        }}
      >
        Related Deep Dives
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--cs-rail-text-strong, #1b2e63)", marginBottom: 8 }}>
        Additional Reading
      </div>
      {links.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {links.map(link => (
            <a
              key={`${keyPrefix}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--cs-rail-text-strong, rgba(27,45,95,0.92))",
                background: "var(--cs-rail-chip-bg, rgba(246,249,255,0.95))",
                border: "1px solid var(--cs-rail-chip-border, rgba(31,45,86,0.16))",
                borderRadius: 9,
                padding: "6px 8px",
              }}
            >
              <span>{link.label}</span>
              <span style={{ color: "var(--cs-rail-text-muted, rgba(27,45,95,0.5))", fontSize: 10 }}>↗</span>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--cs-rail-text, rgba(27,45,95,0.62))", lineHeight: 1.55 }}>
          {emptyText}
        </div>
      )}
    </div>
  );
}

export function TutorialWalkthroughButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: "1px solid rgba(255,226,162,0.9)",
        background: "linear-gradient(145deg, rgba(221,158,51,0.98), rgba(221,158,51,0.82))",
        color: "#15151E",
        borderRadius: 10,
        padding: "9px 10px",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 0 0 1px rgba(255,226,162,0.35), 0 0 12px rgba(221,158,51,0.35)",
      }}
    >
      Tutorial Walkthrough
    </button>
  );
}
