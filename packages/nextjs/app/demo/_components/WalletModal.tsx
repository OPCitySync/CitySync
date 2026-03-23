"use client";

import React from "react";
import { BOTTOM_NAV_OFFSET_CSS } from "../_utils/sheetStyles";

interface WalletModalProps {
  address: string;
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  orgName?: string;
  role: string;
  tutorialHighlightCloseButton?: boolean;
  onClose: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  participant: "#4169E1",
  issuer: "#DD9E33",
  redeemer: "#34eeb6",
};

export default function WalletModal({
  address,
  cityBalance,
  voteBalance,
  mceBalance,
  orgName,
  role,
  tutorialHighlightCloseButton = false,
  onClose,
}: WalletModalProps) {
  const color = ROLE_COLOR[role] ?? "#4169E1";

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes tutorialWalletPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.35), 0 0 10px rgba(221,158,51,0.24); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.72), 0 0 18px rgba(221,158,51,0.46); }
        }
      `}</style>

      {/* Backdrop — closes on tap */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          bottom: BOTTOM_NAV_OFFSET_CSS,
          background: "rgba(0,0,0,0.45)",
          zIndex: 220,
        }}
        onClick={onClose}
      />

      {/* Sheet — slides up from tab bar, constrained to ~quarter screen */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: BOTTOM_NAV_OFFSET_CSS,
          maxHeight: "50%",
          overflowY: "auto",
          zIndex: 221,
          background: "#1E1E2C",
          borderTop: `3px solid ${color}`,
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.55)",
          padding: "20px 18px 24px",
          animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            margin: "0 auto 16px",
          }}
        />

        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
            style={{ background: color, color: "#15151E" }}
          >
            {role === "participant" ? "P" : role === "issuer" ? "I" : "R"}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{orgName ?? "Wallet"}</div>
            <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="mb-1 text-xs font-medium uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Balances
          </div>
          <div className="mt-3 space-y-3">
            <BalanceRow label="CITY Credits" value={cityBalance} color="#4169E1" symbol="CITY" />
            <BalanceRow label="Vote Tokens" value={voteBalance} color="#DD9E33" symbol="VOTE" />
            <BalanceRow label="MCE Credits" value={mceBalance} color="#34eeb6" symbol="MCE" />
          </div>
        </div>

        <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            This is a wallet on Base Sepolia testnet. All tokens are non-transferable and earned through civic
            participation.
          </div>
        </div>

        <button
          onClick={onClose}
          data-tutorial-allow={tutorialHighlightCloseButton ? "true" : undefined}
          className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold transition"
          style={{
            background: tutorialHighlightCloseButton
              ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
              : color,
            color: "#15151E",
            border: tutorialHighlightCloseButton ? "1px solid rgba(255,226,162,0.92)" : "none",
            animation: tutorialHighlightCloseButton ? "tutorialWalletPulse 1.55s ease-in-out infinite" : undefined,
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}

function BalanceRow({ label, value, color, symbol }: { label: string; value: number; color: string; symbol: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-white">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">{value.toLocaleString()}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {symbol}
        </span>
      </div>
    </div>
  );
}
