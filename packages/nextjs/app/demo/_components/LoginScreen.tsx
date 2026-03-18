"use client";

import { useAuthModal, useSignerStatus } from "@account-kit/react";
import Image from "next/image";
import Link from "next/link";

export function LoginScreen() {
  const { openAuthModal } = useAuthModal();
  const { isAuthenticating } = useSignerStatus();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#15151E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "0 24px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ marginBottom: 16, display: "inline-flex", justifyContent: "center" }}>
          <Image
            src="/citysync-wordmark-frame3.png"
            alt="City/Sync"
            width={240}
            height={64}
            style={{ width: "min(240px, 72vw)", height: "auto" }}
            priority
          />
        </div>

        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            maxWidth: "none",
            lineHeight: 1.5,
            margin: "0 auto",
            whiteSpace: "nowrap",
          }}
        >
          Civic Coordination Infrastructure for the 21st Century.
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#1E1E2C",
          border: "1px solid rgba(65,105,225,0.2)",
          borderRadius: 24,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Welcome to the Demo</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.5 }}>
          Sign in to explore the City/Sync protocol — earn civic credits, post community tasks, and manage redemption
          offers.
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {["🏃 Participant", "🏛 Issuer", "🏪 Redeemer"].map(label => (
            <span
              key={label}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(65,105,225,0.12)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(65,105,225,0.2)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <button
          onClick={openAuthModal}
          disabled={isAuthenticating}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 14,
            background: isAuthenticating ? "rgba(65,105,225,0.4)" : "linear-gradient(135deg, #4169E1 0%, #23128F 100%)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: isAuthenticating ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {isAuthenticating ? "Signing in…" : "Get Started →"}
        </button>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
          Sign in with email, passkey, or Google. No wallet or ETH required.
        </p>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Powered by Base Sepolia Testnet</p>

      <div style={{ display: "flex", gap: 20, marginTop: 16, alignItems: "center" }}>
        <Link href="/demo/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
          Privacy Policy
        </Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.12)" }}>·</span>
        <Link href="/demo/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
