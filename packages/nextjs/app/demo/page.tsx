"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLogout, useSignerStatus } from "@account-kit/react";
import { LoginScreen } from "./_components/LoginScreen";
import { useDemo } from "./_context/DemoContext";

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLES = [
  {
    key: "participant" as const,
    href: "/demo/participant",
    emoji: "🏙️",
    title: "Civic Participant",
    tagline: "Earn. Vote. Redeem.",
    accent: "#4169E1",
    description:
      "Civic Participants are the core of the City/Sync protocol. As a community member, you will complete local civic-labor tasks ranging from neighborhood cleanups to civic surveys, and by doing so, will earn $CITY credits and $VOTE tokens for your contributions. $CITY credits can be redeemed at partner businesses and services, while your $VOTE tokens let you have a direct say in selecting Mass Coordination Events, Participatory Budgeting decisions, and future applications that will shape the direction of your city.",
    tabs: [
      {
        key: "Profile",
        desc: "Edit your City/Sync Identity, Track Token Balances, and View your completed tasks and Voting History.",
      },
      {
        key: "Explore",
        desc: "Browse Issued tasks from Issuers, filter by category, and claim tasks you want to complete for $CITY credits. Each $CITY is matched 1:1 with $VOTE.",
      },
      {
        key: "MyCity",
        desc: "See the impact the network is having on your City, Keep track of upcoming events, and get engaged with your community.",
      },
      {
        key: "Vote",
        desc: "Cast $VOTE to support upcoming Mass Coordination Events and Participatory Budgeting Proposals.",
      },
      {
        key: "Redeem",
        desc: "Browse offerings within the Redemption Universe, and redeem your $CITY credits for goods, services, and exclusive community benefits.",
      },
    ],
    eligibility: {
      title: "Onboarding for Civic Participants",
      body: "New Participants must complete an in-person onboarding task to activate their wallet and join the platform. All issuers will provide a continuous set of onboarding tasks available to new participants. This initial task is how the protocol ensures real community membership. Upon completion, your wallet is whitelisted and you will receive your first $CITY credits. From there, you're free to explore and claim any available tasks on the platform.",
    },
    buttonLabel: "Enter as Civic Participant",
  },
  {
    key: "issuer" as const,
    href: "/demo/issuer",
    emoji: "📋",
    title: "Issuer Organization",
    tagline: "Create. Verify. Distribute.",
    accent: "#DD9E33",
    description:
      "Issuer Organizations are the public-sector organizations that power the civic economy. As an Issuer, you represent a community organization, public agency, or public-benefit entity that creates and manages civic-labor opportunities. You will be able to post tasks from the approved and curated Task Catalog, propose new tasks to the Task Catalog, and set $CITY credit rates for tasks. Issuers will also be responsible for verifying task completion, providing feedback on participants, and distributing rewards.",
    tabs: [
      {
        key: "Profile",
        desc: "Manage your organizational profile, view the amount of $CITY credits available for issuance, and track your Issuance history.",
      },
      {
        key: "Tasks",
        desc: "Issue tasks, propose new tasks to the task catalog, and manage your task listings.",
      },
      {
        key: "MyCity",
        desc: "Post articles, events, photos, and promotions for your organization.",
      },
      {
        key: "Verify",
        desc: "View task performance data, Verify completed tasks, and distribute rewards to Civic Participants.",
      },
      {
        key: "MCE",
        desc: "View active Mass Coordination Events, Propose new MCE's, and monitor community vote outcomes.",
      },
    ],
    eligibility: {
      title: "Becoming an Issuer Organization",
      body: "To become an Issuer Organization, you need to apply and satisfy the eligibility requirements. Eligible organizations are initially defined as any public-sector organization that is providing a measurable public good or service. Approved Issuers are granted a credit allocation based on the total number of active issuers and the platform's Issuance Cap, which is a mechanism that keeps the civic economy balanced. The more Issuers participating, the more thoughtfully each one must allocate their credits across their task portfolio.",
    },
    buttonLabel: "Enter as Issuer Organization",
  },
  {
    key: "redeemer" as const,
    href: "/demo/redeemer",
    emoji: "🏪",
    title: "Redeemer Organization",
    tagline: "Incentivize. Reward. Track.",
    accent: "#34eeb6",
    description:
      "Redeemer organizations are any businesses, venues, or service providers that give $CITY credits real-world value, and create the incentives for activating latent civic capacity. As a Redeemer Organization, you decide what type of offering you want to present, the credit rate for each offering, and the terms of that redemption. Most private-sector entities will be unable to provide continuous offerings, but will be able to opt-in by providing offerings for specific MCE events that they support and make an impact on their city.",
    tabs: [
      {
        key: "Profile",
        desc: "Manage your organizational profile, and track your Redemption History.",
      },
      {
        key: "Offerings",
        desc: "Create Redemption Offerings, set and modify Rates, and generate QR codes for in-person point-of-sale flows.",
      },
      {
        key: "MyCity",
        desc: "Post articles, events, photos, and promotions for your organization.",
      },
      {
        key: "Dashboard",
        desc: "Track your redemption metrics: total credits accepted, $ value of redemptions issued, and statistical history of each of your offerings.",
      },
      {
        key: "MCE",
        desc: "View active Mass Coordination Events, Propose new MCE's, and monitor community vote outcomes.",
      },
    ],
    eligibility: {
      title: "Becoming a Redeemer Organization",
      body: "To become a Redeemer Organization, you need to apply through City/Sync. Redeemer Organizations can be any entity ranging from a local coffee shop to a transit authority, as long as they commit to honoring their offerings according to the rules set by the Representative Redeemer Committee. Redeemers have full autonomy over what they offer, the rates for each offering, and can create time-limited offers tied to specific credit types like MCE's. This flexibility allows both small businesses and large public service providers to participate on their own terms.",
    },
    buttonLabel: "Enter as Redeemer Organization",
  },
] as const;

const ROLE_ORDER: Record<(typeof ROLES)[number]["key"], number> = {
  issuer: 0,
  redeemer: 1,
  participant: 2,
};

// ─── Economy section data ─────────────────────────────────────────────────────

const ECONOMY_INTRO = {
  sectionLabel: "The Public Sector Economy",
  heading: "How it Works",
  body1:
    "City/Sync proposes the creation of a bifurcated economy that exists entirely within the public-sector, and is separate from the domain of financial markets and fiat currency. $CITY credits cannot be transferred, bought, or sold. They are earned through civic-labor contributions and spent on access to public goods and services. This keeps the system grounded in real civic value rather than through market dynamics.",
  body2:
    "For this economy to function sustainably, the rate at which credits are issued must remain in balance with the capacity of the Redeemer network to absorb them. Too many credits chasing too few redemption offerings erodes value and destroys incentives. Too few credits stifles participation and interest. The protocol is designed to maintain the equilibrium between Issuance and Redemption through Issuance Caps, Governance feedback loops, and transparent rate guidance for Redeemers.",
};

const ECONOMY_CARDS = [
  {
    icon: "📊",
    title: "Issuance Caps",
    body: "The Issuance Cap is the total amount of $CITY credits that can be issued for a given time period. This is an economic control tool that keeps the civic economy from inflating beyond what the Redemption side can absorb. The Issuance Cap is determined by the amount of unused Credits in circulation and the maximum absorption capacity of the smallest redeemer. This ensures that Redeemer Organizations cannot get overwhelmed. Each Issuer is allocated Credits from this cap evenly, ensuring no single organization can dominate credit creation.",
  },
  {
    icon: "⚖️",
    title: "Issuance & Redemption Balance",
    body: "The health of the public-sector economy depends on a fundamental balance between Issuance & Redemption. The primary economic objective of this system is throughput optimization: increasing the volume and efficiency of civic contribution without destabilizing institutional capacity. The system only works if two things feel true at the same time: (1) it feels possible to earn credits, and (2) it feels possible to use them. City/Sync's governance model is designed to monitor this balance in real time, and establish Issuance Caps that are adjusted with growth, redemption targets, and building our network of Issuers and Redeemers.",
  },
  {
    icon: "🧭",
    title: "Rate Guidance",
    body: "Redeemers set their own credit rates, but they don't do so blindly. The platform provides guidance benchmarks based on the current credit supply, average redemption volumes, and community feedback that provides Redeemers a principled starting point for valuing their offerings. The Representative Redeemer Committee also plays a governance role in flagging rates that fall outside of community norms.",
  },
  {
    icon: "🌐",
    title: "Mass Coordination Events",
    body: "Mass Coordination Events (MCEs) are city-wide initiatives that mobilize civic participation at scale for a common purpose or mission (remove unwanted graffiti city-wide, park restorations, etc.). MCEs can be proposed by participating Issuer & Redeemer Organizations, and voted on by Civic Participants using their earned $VOTE tokens. Once an MCE has been selected, it enters a Planning phase where Issuer Organizations create specialized tasks to execute the mission. During an active MCE, participants earn a dedicated MCE Credit that can be used to expand the redemption universe, and new entities (restaurants, coffee shops, and other fiat-based businesses) agree to accept those special credits for a limited time period. As a result, it creates more powerful incentives for Civic Participants to execute, and a pathway for the private-sector to give back to their city.",
  },
  {
    icon: "📋",
    title: "Task Catalog",
    body: "The Task Catalog is a curated, governance-approved list of civic-labor opportunities available to Issuer Organizations. Tasks are proposed by Issuers and reviewed by the Representative Issuer Committee, which defines scope, time commitment, success criteria, and credit value for each entry. This standardization ensures consistency among Issuer Organizations and creates a predictable supply of credits when executing formal public planning. Additionally, the categorization of tasks will establish how task credential requirements are handled (elder care, specialization functions), and will reserve some categories of tasks toward equity and inclusion initiatives (tasks for disabled, mentally impaired, etc.).",
  },
  {
    icon: "🏛️",
    title: "Role Governance",
    body: "Each role in the protocol is self-governed by a Representative Committee. The Representative Issuer Committee manages the Task Catalog, Task Rules, Issuer onboarding, and the Issuance Cap. The Representative Redeemer Committee governs redemption rules, rate guidance targets, and Redeemer onboarding. The Representative Civic Committee, which is drawn from top participants by $VOTE balance, will aggregate community feedback and resolve conflicts across governance bodies.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const GUEST_KEY = "citysync:demo:guestMode";

export default function DemoHome() {
  const { setRole } = useDemo();
  const { isConnected } = useSignerStatus();
  const { logout } = useLogout();
  const [guestMode, setGuestMode] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(GUEST_KEY) === "1";
  });
  const orderedRoles = [...ROLES].sort((a, b) => ROLE_ORDER[a.key] - ROLE_ORDER[b.key]);

  if (!isConnected && !guestMode)
    return <LoginScreen onGuest={() => { window.localStorage.setItem(GUEST_KEY, "1"); setGuestMode(true); }} />;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "#0D0D14", fontFamily: "system-ui, -apple-system, sans-serif", color: "#fff" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(13,13,20,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Link href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#23128F" }}>
            <Image src="/favicon.png" alt="City/Sync Symbol" width={20} height={20} style={{ borderRadius: 4 }} />
          </div>
          <span className="text-base font-bold text-white">City/Sync DEMO</span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.localStorage.removeItem(GUEST_KEY);
              setGuestMode(false);
              if (isConnected) logout();
            }}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {guestMode ? "Sign In" : "Sign Out"}
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="w-full px-6 py-20"
        style={{ background: "linear-gradient(180deg, #0D0D14 0%, #111128 50%, #0D0D14 100%)" }}
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-6" style={{ transform: "translate(calc(clamp(28px, 4vw, 60px) - 26px), 2px)" }}>
            <Image
              src="/citysync-wordmark-frame3.png"
              alt="City/Sync"
              width={320}
              height={72}
              priority
              style={{ width: "min(320px, 85vw)", height: "auto" }}
            />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "#4169E1" }}>
            Programmable Civic Coordination Infrastructure
          </p>
          <p className="mb-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            In this DEMO you can move between the 3 different roles that serve as the fundamental incentive engine for a
            Public-Sector Economy.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Live demo on Base Sepolia Testnet · No real funds required
          </p>
        </div>
      </section>

      {/* ── Role cards ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-3 text-center text-2xl font-bold text-white">Choose Your Role</h2>
        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)", marginBottom: 48 }}>
          All three roles share the same state — switch freely to see the full loop.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {orderedRoles.map(role => (
            <div
              key={role.key}
              className="rounded-3xl overflow-hidden"
              style={{
                background: "#15151E",
                border: `1px solid rgba(255,255,255,0.07)`,
                display: "grid",
                /* row 1: header  row 2: tabs (grows)  row 3: eligibility  row 4: CTA */
                gridTemplateRows: "auto 1fr auto auto",
              }}
            >
              {/* Card header — row 1. minHeight matches the longest description (Redeemer) */}
              <div className="p-6 pb-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)`, minHeight: 260 }}>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${role.accent}18` }}
                  >
                    {role.emoji}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{role.title}</div>
                    <div className="text-xs font-semibold" style={{ color: role.accent }}>
                      {role.tagline}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {role.description}
                </p>
              </div>

              {/* Tabs — row 2 (1fr): grows to fill remaining card height */}
              <div className="p-6 pb-4">
                <div
                  className="mb-3 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  What You Can Do{" "}
                  <span style={{ color: "rgba(255,255,255,0.2)", textTransform: "none", letterSpacing: "normal" }}>
                    (Tabs on the Mobile Application)
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {role.tabs.map(tab => (
                    <div key={tab.key} className="flex gap-3" style={{ minHeight: 80 }}>
                      <span
                        className="mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: `${role.accent}18`,
                          color: role.accent,
                          minWidth: 90,
                          textAlign: "center",
                          alignSelf: "start",
                        }}
                      >
                        {tab.key}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {tab.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility — row 3. minHeight matches the longest eligibility text (Redeemer) */}
              <div
                className="mx-6 mb-6 rounded-2xl p-4"
                style={{ background: `${role.accent}0a`, border: `1px solid ${role.accent}22`, minHeight: 320 }}
              >
                <div className="mb-1.5 text-xs font-semibold" style={{ color: role.accent }}>
                  {role.eligibility.title}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {role.eligibility.body}
                </p>
              </div>

              {/* CTA — row 4 */}
              <div className="px-6 pb-6">
                <Link
                  href={role.href}
                  onClick={() => setRole(role.key)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: role.accent, color: "#0D0D14", textDecoration: "none" }}
                >
                  {role.buttonLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Public Sector Economy ───────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: "#111120", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-7xl">
          {/* Prose intro */}
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#4169E1" }}>
              {ECONOMY_INTRO.sectionLabel}
            </div>
            <h2 className="mb-5 text-3xl font-bold text-white">{ECONOMY_INTRO.heading}</h2>
            <p className="mb-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {ECONOMY_INTRO.body1}
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {ECONOMY_INTRO.body2}
            </p>
          </div>

          {/* Key Concepts heading */}
          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold text-white">Key Concepts</h3>
          </div>

          {/* Visual cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ECONOMY_CARDS.map(card => (
              <div
                key={card.title}
                className="rounded-2xl p-6"
                style={{ background: "#15151E", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="mb-4 text-3xl">{card.icon}</div>
                <div className="mb-3 text-base font-bold text-white">{card.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-8 text-center text-xs"
        style={{ color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        City/Sync Demo · Base Sepolia Testnet · All roles share live state
      </footer>
    </div>
  );
}
