"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useLogout, useSignerStatus } from "@account-kit/react";
import { useDemo } from "../_context/DemoContext";

type RoleKey = "issuer" | "participant" | "redeemer";

const ROLES: Array<{
  key: RoleKey;
  href: string;
  emoji: string;
  title: string;
  tagline: string;
  accent: string;
  description: string;
  tabs: Array<{ key: string; desc: string }>;
}> = [
  {
    key: "issuer",
    href: "/demo/redesign?role=issuer",
    emoji: "📋",
    title: "Issuer Organization",
    tagline: "Create. Verify. Distribute.",
    accent: "#DD9E33",
    description:
      "Issuer Organizations facilitate civic-labor by issuing tasks, verifying completion, and distributing rewards.",
    tabs: [
      { key: "Profile", desc: "Manage organization identity and issuance metrics." },
      { key: "Tasks", desc: "Issue from catalog and propose new task types." },
      { key: "Verify", desc: "Review completed work and execute mint workflows." },
      { key: "Community", desc: "Post updates and track MCE proposal activity." },
    ],
  },
  {
    key: "participant",
    href: "/demo/redesign?role=participant",
    emoji: "🏙️",
    title: "Civic Participant",
    tagline: "Earn. Vote. Redeem.",
    accent: "#4169E1",
    description:
      "Civic Participants claim and execute tasks, earn CITY/VOTE, and redeem credits for local goods and services.",
    tabs: [
      { key: "Profile", desc: "Track balances, activity, and scoring signals." },
      { key: "Explore", desc: "Browse issued tasks and claim opportunities." },
      { key: "Community", desc: "Follow MyCity updates and voting context." },
      { key: "Redeem", desc: "Spend earned CITY on available offerings." },
    ],
  },
  {
    key: "redeemer",
    href: "/demo/redesign?role=redeemer",
    emoji: "🏪",
    title: "Redeemer Organization",
    tagline: "Commit. Fulfill. Track.",
    accent: "#34eeb6",
    description:
      "Redeemers convert civic credits into real access by publishing offerings and honoring redemption commitments.",
    tabs: [
      { key: "Profile", desc: "Manage organization details and redemption metrics." },
      { key: "Offerings", desc: "Create catalog entries and commit active offers." },
      { key: "Community", desc: "Share updates and view proposal cycles." },
      { key: "MCE", desc: "Publish MCE-linked offerings during event windows." },
    ],
  },
];

const HOW_IT_WORKS_CARDS = [
  {
    icon: "📊",
    title: "Issuance Caps",
    body: "Credits are issued within an epoch cap to keep the system stable as participation grows.",
  },
  {
    icon: "⚖️",
    title: "Issuance and Redemption Balance",
    body: "The protocol aims for healthy circulation: credits earned through work and reliably redeemed through offerings.",
  },
  {
    icon: "🧭",
    title: "Rate Guidance",
    body: "Rate-setting is informed by usage patterns so organizations can calibrate without creating service disruption.",
  },
  {
    icon: "🌐",
    title: "Mass Coordination Events",
    body: "MCE voting prioritizes city-scale initiatives and coordinates tasks and incentives around shared outcomes.",
  },
];

export default function DemoLandingPage() {
  const router = useRouter();
  const { setRole } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { isAuthenticating } = useSignerStatus();
  const { logout } = useLogout({
    onSuccess: () => router.replace("/demo/login"),
  });

  useEffect(() => {
    if (!address && !isAuthenticating) {
      router.replace("/demo/login");
    }
  }, [address, isAuthenticating, router]);

  const handleRoleEnter = (role: RoleKey) => {
    setRole(role);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0D14",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#ffffff",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(13,13,20,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <a
          href="https://www.city-sync.org"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}
          aria-label="Go to city-sync.org"
        >
          <Image src="/citysync-wordmark-frame3.png" alt="City/Sync" width={170} height={40} priority />
        </a>

        <button
          onClick={() => logout()}
          style={{
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.78)",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </header>

      <section
        style={{
          padding: "72px 24px 58px",
          background: "linear-gradient(180deg, #0D0D14 0%, #111128 52%, #0D0D14 100%)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: 860,
            textAlign: "center",
            display: "grid",
            gap: 12,
            justifyItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#4169E1",
            }}
          >
            Programmable Civic Coordination Infrastructure
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", lineHeight: 1.08 }}>City/Sync Demo</h1>
          <p style={{ margin: 0, maxWidth: 740, color: "rgba(255,255,255,0.62)", lineHeight: 1.6 }}>
            Choose a role to enter the live simulation. All three roles share the same state, so you can switch between
            Issuer, Civic Participant, and Redeemer to follow the full public-sector economy loop.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
            Base Sepolia testnet · Sponsored transactions · No real funds required
          </p>
        </div>
      </section>

      <section style={{ margin: "0 auto", maxWidth: 1320, padding: "0 24px 70px" }}>
        <h2 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 30 }}>Choose Your Role</h2>
        <p style={{ margin: "0 0 36px", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
          Enter as any role. You can switch roles later from inside the app.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {ROLES.map(role => (
            <div
              key={role.key}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 24,
                overflow: "hidden",
                background: "#15151E",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 14,
                      background: `${role.accent}1f`,
                      fontSize: 23,
                    }}
                  >
                    {role.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{role.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: role.accent }}>{role.tagline}</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.58)", lineHeight: 1.55, fontSize: 14 }}>
                  {role.description}
                </p>
              </div>

              <div style={{ padding: "16px 20px", display: "grid", gap: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  What you can do
                </div>
                {role.tabs.map(tab => (
                  <div key={tab.key} style={{ display: "flex", gap: 10 }}>
                    <span
                      style={{
                        minWidth: 92,
                        textAlign: "center",
                        alignSelf: "flex-start",
                        fontSize: 11,
                        fontWeight: 700,
                        color: role.accent,
                        border: `1px solid ${role.accent}5e`,
                        background: `${role.accent}1e`,
                        borderRadius: 999,
                        padding: "4px 8px",
                      }}
                    >
                      {tab.key}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.48)" }}>{tab.desc}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "auto", padding: "0 20px 20px" }}>
                <Link
                  href={role.href}
                  onClick={() => handleRoleEnter(role.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: 14,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontWeight: 700,
                    background: role.accent,
                    color: "#0D0D14",
                    textDecoration: "none",
                  }}
                >
                  Enter as {role.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "68px 24px 76px",
          background: "#111120",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ margin: "0 auto", maxWidth: 1240 }}>
          <div style={{ maxWidth: 780, margin: "0 auto 36px", textAlign: "center", display: "grid", gap: 12 }}>
            <div
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#4169E1",
              }}
            >
              The Public-Sector Economy
            </div>
            <h2 style={{ margin: 0, fontSize: 34 }}>How it Works</h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.57)", lineHeight: 1.65 }}>
              City/Sync aligns issuance, verification, and redemption into one civic operating loop. Participants earn
              through verified work, then use credits through Redeemer offerings, while governance adjusts policy each
              epoch to keep the system reliable and legible.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {HOW_IT_WORKS_CARDS.map(card => (
              <div
                key={card.title}
                style={{
                  borderRadius: 18,
                  padding: "18px 16px",
                  background: "#15151E",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{card.title}</div>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.52)", fontSize: 13, lineHeight: 1.55 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
