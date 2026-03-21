import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "City/Sync Redesign Prototype",
  description: "Standalone visual redesign prototype for City/Sync. UI-only, no onchain wiring.",
};

const roleCards = [
  { title: "Issuer", blurb: "Define, issue, and verify civic tasks.", accent: "gold" },
  { title: "Civic Participant", blurb: "Claim tasks, execute work, earn CITY + VOTE.", accent: "blue" },
  { title: "Redeemer", blurb: "Commit offerings and process redemption flows.", accent: "mint" },
] as const;

const taskPreview = [
  { name: "Neighborhood Garden Support", status: "Issued", rate: "8 CITY/hr" },
  { name: "Transit Accessibility Survey", status: "Claimed", rate: "6 CITY/hr" },
  { name: "Community Library Setup", status: "Completed", rate: "5 CITY/hr" },
] as const;

const mockMetrics = [
  { label: "Issued This Epoch", value: "184 CITY" },
  { label: "Redemption Throughput", value: "78%" },
  { label: "Task Verification SLA", value: "4h 12m" },
] as const;

const deepLinks = [
  { href: "/demo/mce", label: "Mass Coordination Events" },
  { href: "/demo/public-sector-economy", label: "Public-Sector Economy" },
  { href: "/demo/task-management", label: "Task Management" },
] as const;

export default function DemoRedesignPage() {
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
            <p className={styles.eyebrow}>Concept Direction</p>
            <h1 className={styles.title}>Civic Wallet OS</h1>
            <p className={styles.subtitle}>
              A full aesthetic exploration of a cleaner, lighter, and more tactile City/Sync product. This page is
              intentionally decoupled from live contract logic so we can test look-and-feel first.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.primaryBtn} type="button">
                Start Guided Tour
              </button>
              <button className={styles.ghostBtn} type="button">
                View Style Tokens
              </button>
            </div>
          </div>
          <div className={styles.heroArt}>
            <div className={styles.heroImageFrame}>
              <Image src="/pitch/image-4.png" alt="City/Sync concept art" fill sizes="(max-width: 900px) 90vw, 38vw" />
            </div>
            <div className={styles.heroFloatingCard}>
              <p className={styles.cardLabel}>Design Intent</p>
              <p className={styles.cardText}>
                Mobile-native motion, calmer contrast, clearer hierarchy, and stateful cards.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.workspace}>
          <aside className={styles.leftRail}>
            <h2 className={styles.railTitle}>Role Modes</h2>
            <div className={styles.roleStack}>
              {roleCards.map(role => (
                <article key={role.title} className={`${styles.roleCard} ${styles[role.accent]}`}>
                  <h3>{role.title}</h3>
                  <p>{role.blurb}</p>
                </article>
              ))}
            </div>

            <div className={styles.issuanceCard}>
              <p className={styles.cardLabel}>Epoch Control</p>
              <h3>Issuance Cap</h3>
              <p className={styles.cardText}>2,800 CITY available / 1,942 issued</p>
              <div className={styles.progressTrack}>
                <span style={{ width: "69%" }} />
              </div>
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
            <div className={styles.deviceMock}>
              <div className={styles.deviceTopBar}>
                <button type="button" className={styles.iconPill}>
                  Switch Roles
                </button>
                <span className={styles.balanceChip}>418 CITY</span>
              </div>

              <div className={styles.deviceBody}>
                <div className={styles.deviceHeader}>
                  <div>
                    <p className={styles.deviceSectionEyebrow}>Issuer Dashboard</p>
                    <h3>Good morning, Community Works</h3>
                  </div>
                  <Image src="/citysync-logo-120.png" alt="City/Sync icon" width={32} height={32} />
                </div>

                <div className={styles.metricGrid}>
                  {mockMetrics.map(metric => (
                    <div key={metric.label} className={styles.metricCard}>
                      <p>{metric.label}</p>
                      <strong>{metric.value}</strong>
                    </div>
                  ))}
                </div>

                <div className={styles.taskBoard}>
                  <div className={styles.sectionHeaderRow}>
                    <h4>Live Task Board</h4>
                    <button type="button">+ Issue Tasks</button>
                  </div>
                  <ul>
                    {taskPreview.map(task => (
                      <li key={task.name} className={styles.taskRow}>
                        <div>
                          <strong>{task.name}</strong>
                          <p>{task.rate}</p>
                        </div>
                        <span>{task.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.deviceTabBar}>
                <span className={styles.activeTab}>Profile</span>
                <span>Tasks</span>
                <span>Community</span>
                <span>Verify</span>
                <span>MCE</span>
              </div>

              <div className={styles.sheetMock}>
                <div className={styles.sheetHandle} />
                <h5>Issue Tasks</h5>
                <p>Select a catalog item and create instances for this epoch.</p>
                <button className={styles.primaryBtn} type="button">
                  Continue
                </button>
              </div>
            </div>
          </div>

          <aside className={styles.rightRail}>
            <div className={styles.panelCard}>
              <p className={styles.cardLabel}>System Notes</p>
              <h3>What changed in this visual pass</h3>
              <ul>
                <li>Light app canvas with high-legibility text contrast.</li>
                <li>Unified card language and rounded in-app sheets.</li>
                <li>Clear transaction state chips and tighter metric hierarchy.</li>
                <li>Role accents without changing information architecture.</li>
              </ul>
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
