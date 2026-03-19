"use client";

import React from "react";

export interface NavTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  tabs: NavTab[];
  active: string;
  onChange: (key: string) => void;
  accentColor?: string;
  locked?: boolean;
}

export default function BottomNav({ tabs, active, onChange, accentColor = "#4169E1", locked = false }: BottomNavProps) {
  const activeBg = `${accentColor}20`;
  const lastIdx = tabs.length - 1;

  return (
    <nav
      className="absolute left-0 right-0 z-40 flex items-stretch"
      style={{
        bottom: 0,
        minHeight: 69,
        background: "rgba(24,24,38,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
        backdropFilter: "blur(14px)",
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === active;
        const isFirst = index === 0;
        const isLast = index === lastIdx;
        const borderRadius = isFirst ? "0 0 0 20px" : isLast ? "0 0 20px 0" : 0;
        return (
          <button
            key={tab.key}
            onClick={() => {
              if (!locked) onChange(tab.key);
            }}
            disabled={locked}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
            style={{
              color: isActive ? accentColor : "rgba(255,255,255,0.45)",
              flex: 1,
              background: isActive ? activeBg : "transparent",
              border: "none",
              paddingTop: 8,
              paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
              borderRadius,
              cursor: locked ? "not-allowed" : "pointer",
              opacity: locked ? 0.72 : 1,
            }}
          >
            <span
              className="transition-transform"
              style={{
                transform: isActive ? "scale(1.08)" : "scale(1)",
                display: "flex",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
