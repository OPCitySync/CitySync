import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "City/Sync Redesign Prototype",
  description: "Civic Wallet OS concept page with an embedded live demo shell.",
};

type RoleKey = "issuer" | "participant" | "redeemer";

const roleCards: Array<{ key: RoleKey; title: string; blurb: string; accent: "gold" | "blue" | "mint" }> = [
  { key: "issuer", title: "Issuer", blurb: "Define, issue, and verify civic tasks.", accent: "gold" },
  {
    key: "participant",
    title: "Civic Participant",
    blurb: "Claim tasks, execute work, earn CITY + VOTE.",
    accent: "blue",
  },
  { key: "redeemer", title: "Redeemer", blurb: "Commit offerings and process redemption flows.", accent: "mint" },
];

const roleEmbedPath: Record<RoleKey, string> = {
  issuer: "/demo/issuer",
  participant: "/demo/participant",
  redeemer: "/demo/redeemer",
};

const deepLinks = [
  { href: "/demo/mce", label: "Mass Coordination Events" },
  { href: "/demo/public-sector-economy", label: "Public-Sector Economy" },
  { href: "/demo/task-management", label: "Task Management" },
] as const;

const activityLog = [
  { title: "Task Issued", detail: "Neighborhood Garden Support · 3 slots", time: "2m ago", status: "Confirmed" },
  { title: "Task Claimed", detail: "Transit Accessibility Survey", time: "8m ago", status: "Pending" },
  { title: "Redemption Burn", detail: "Farmers Market Voucher · 10 CITY", time: "14m ago", status: "Confirmed" },
] as const;

type RedesignPageProps = {
  searchParams?: Promise<{
    role?: string | string[];
  }>;
};

export default async function DemoRedesignPage({ searchParams }: RedesignPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedRole = Array.isArray(resolvedSearchParams?.role)
    ? resolvedSearchParams.role[0]
    : resolvedSearchParams?.role;
  const activeRole: RoleKey =
    requestedRole === "participant" || requestedRole === "redeemer" ? requestedRole : "issuer";
  const embedSrc = `${roleEmbedPath[activeRole]}?embed=1&skin=redesign`;

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.brandWrap}>
            <Image
              src="/citysync-wordmark-frame3.png"
              alt="City/Sync"
              width={192}
              height={44}
              className={styles.wordmark}
            />
            <span className={styles.prototypeBadge}>Prototype - UI only</span>
          </div>
          <div className={styles.topActions}>
            <Link href="/demo" className={styles.ghostBtn}>
              Open Current Demo
            </Link>
            <button className={styles.primaryBtn} type="button">
              Request Pilot Access
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Live Mobile Application DEMO</p>
            <h1 className={styles.title}>Civic Wallet OS</h1>
            <p className={styles.subtitle}>
              In this DEMO you can move between the 3 different roles that serve as the fundamental incentive engine for
              the City/Sync protocol. It utilizes sponsored transactions on the Base Sepolia testnet, and no real funds
              are required. All three roles share the same state, so please switch freely to understand the full loop
              for the proposed public-sector economy.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.primaryBtn} type="button">
                Start the Guided Tour
              </button>
            </div>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.heroImageFrame}>
              <Image src="/pitch/image-4.png" alt="City/Sync concept art" fill sizes="(max-width: 900px) 90vw, 38vw" />
            </div>
            <div className={styles.heroFloatingCard}>
              <p className={styles.cardLabel}>Phase 1: Local Coordination Infrastructure</p>
              <p className={styles.cardText}>
                The City/Sync protocol starts with the validation of a new incentive mechanism that facilitates local
                coordination around public initiatives.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.workspace}>
          <aside className={styles.leftRail}>
            <h2 className={styles.railTitle}>Choose your Role</h2>
            <div className={styles.roleStack}>
              {roleCards.map(role => (
                <Link
                  key={role.key}
                  href={`/demo/redesign?role=${role.key}`}
                  className={`${styles.roleCard} ${styles[role.accent]} ${
                    activeRole === role.key ? styles.roleCardActive : ""
                  }`}
                >
                  <h3>{role.title}</h3>
                  <p>{role.blurb}</p>
                </Link>
              ))}
            </div>

            <div className={styles.panelCard}>
              <p className={styles.cardLabel}>Activity Panel</p>
              <h3>Live App Activity</h3>
              <ul className={styles.activityList}>
                {activityLog.map(item => (
                  <li key={`${item.title}-${item.time}`} className={styles.activityItem}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <div className={styles.activityMeta}>
                      <span>{item.time}</span>
                      <em>{item.status}</em>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linksCard}>
              <p className={styles.cardLabel}>Related Deep Dives</p>
              <ul>
                {deepLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={styles.deviceStage}>
            <div className={styles.embedFrame}>
              <iframe src={embedSrc} title="AppShell Preview" className={styles.embedIframe} loading="lazy" />
            </div>
          </div>

          <aside className={styles.rightRail}>
            <div className={styles.tutorialCard}>
              <p className={styles.cardLabel}>Tutorial Walkthrough</p>
              <h3>Try the full role sequence</h3>
              <p className={styles.cardText}>
                Start an end-to-end pass from Issuer task issuance through Civic Participant execution and Redeemer
                redemption.
              </p>
              <div className={styles.tutorialActions}>
                <button type="button">Start Tutorial</button>
                <button type="button" className={styles.secondaryAction}>
                  Reset Tutorial
                </button>
              </div>
            </div>

            <div className={styles.panelCardImage}>
              <Image
                src="/pitch/image-1.png"
                alt="City/Sync civic landscape"
                fill
                sizes="(max-width: 1100px) 100vw, 24vw"
              />
            </div>

            <div className={styles.panelCardImage}>
              <Image
                src="/pitch/image-9.png"
                alt="Issuer participant redeemer loop"
                fill
                sizes="(max-width: 1100px) 100vw, 24vw"
              />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
