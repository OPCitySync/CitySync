"use client";

import React from "react";
import { BOTTOM_NAV_OFFSET_CSS } from "../_utils/sheetStyles";

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
  theme?: "dark" | "light" | "brand";
  locked?: boolean;
  allowedWhenLocked?: string[];
}

export default function BottomNav({
  tabs,
  active,
  onChange,
  accentColor = "#4169E1",
  theme = "dark",
  locked = false,
  allowedWhenLocked = [],
}: BottomNavProps) {
  const lightTheme = theme === "light";
  const brandTheme = theme === "brand";
  const activeBg = brandTheme ? "rgba(255,255,255,0.14)" : lightTheme ? `${accentColor}16` : `${accentColor}20`;
  const lastIdx = tabs.length - 1;
  const allowedSet = new Set(allowedWhenLocked);

  return (
    <nav
      className="absolute left-0 right-0 z-40 flex items-stretch"
      style={{
        bottom: 0,
        height: BOTTOM_NAV_OFFSET_CSS,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: brandTheme
          ? "#15151E"
          : locked
            ? lightTheme
              ? "#e9edf8"
              : "#181826"
            : lightTheme
              ? "rgba(246,248,253,0.96)"
              : "rgba(24,24,38,0.97)",
        borderTop: brandTheme
          ? "1px solid rgba(255,255,255,0.14)"
          : lightTheme
            ? "1px solid rgba(27,43,84,0.14)"
            : "1px solid rgba(255,255,255,0.07)",
        boxShadow: brandTheme
          ? "0 -8px 24px rgba(0,0,0,0.38)"
          : lightTheme
            ? "0 -8px 24px rgba(28,42,78,0.14)"
            : "0 -8px 24px rgba(0,0,0,0.35)",
        backdropFilter: locked ? "none" : "blur(14px)",
      }}
    >
      {locked && allowedWhenLocked.length > 0 && (
        <style>{`
          @keyframes tutorialNavPulse {
            0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.52), 0 0 12px rgba(221,158,51,0.34); }
            50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.95), 0 0 22px rgba(221,158,51,0.62); }
          }
        `}</style>
      )}
      {tabs.map((tab, index) => {
        const isActive = tab.key === active;
        const isAllowedWhenLocked = !locked || allowedSet.has(tab.key);
        const isFirst = index === 0;
        const isLast = index === lastIdx;
        const borderRadius = isFirst ? "0 0 0 20px" : isLast ? "0 0 20px 0" : 0;
        return (
          <button
            key={tab.key}
            onClick={() => {
              if (isAllowedWhenLocked) onChange(tab.key);
            }}
            disabled={!isAllowedWhenLocked}
            className="flex flex-col items-center justify-center gap-0.5 transition-all"
            style={{
              color:
                locked && isAllowedWhenLocked
                  ? "#ffe2a2"
                  : isActive
                    ? brandTheme
                      ? "#ffffff"
                      : accentColor
                    : lightTheme
                      ? "rgba(30,45,86,0.55)"
                      : brandTheme
                        ? "rgba(255,255,255,0.72)"
                        : "rgba(255,255,255,0.45)",
              flex: 1,
              background:
                isActive || !locked
                  ? isActive
                    ? activeBg
                    : "transparent"
                  : isAllowedWhenLocked
                    ? "linear-gradient(145deg, rgba(221,158,51,0.34), rgba(221,158,51,0.2))"
                    : "transparent",
              border: "none",
              boxShadow: locked && isAllowedWhenLocked ? "inset 0 0 0 1px rgba(255,226,162,0.88)" : undefined,
              paddingTop: 8,
              paddingBottom: 10,
              borderRadius,
              cursor: isAllowedWhenLocked ? "pointer" : "not-allowed",
              opacity: locked && !isAllowedWhenLocked ? 0.72 : 1,
              animation: locked && isAllowedWhenLocked ? "tutorialNavPulse 1.55s ease-in-out infinite" : undefined,
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
                fontWeight: isActive || (locked && isAllowedWhenLocked) ? 700 : 400,
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
