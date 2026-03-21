"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import AppShell from "../_components/AppShell";
import type { NavTab } from "../_components/BottomNav";
import styles from "./page.module.css";

const TABS: NavTab[] = [
  { key: "profile", label: "Profile", icon: <span className={styles.tabIcon}>●</span> },
  { key: "tasks", label: "Tasks", icon: <span className={styles.tabIcon}>◻</span> },
  { key: "community", label: "Community", icon: <span className={styles.tabIcon}>◎</span> },
  { key: "verify", label: "Verify", icon: <span className={styles.tabIcon}>✓</span> },
  { key: "mce", label: "MCE", icon: <span className={styles.tabIcon}>△</span> },
];

const MOCK_TASKS = [
  { name: "Neighborhood Garden Support", rate: "8 CITY/hr", status: "Issued" },
  { name: "Transit Accessibility Survey", rate: "6 CITY/hr", status: "Claimed" },
  { name: "Community Library Setup", rate: "5 CITY/hr", status: "Completed" },
] as const;

const TAB_CONTENT: Record<string, { title: string; subtitle: string }> = {
  profile: {
    title: "A Cleaner, Mobile-First Dashboard",
    subtitle: "Priority metrics and quick actions stay visible while visual noise is reduced.",
  },
  tasks: {
    title: "Task Operations, Refined",
    subtitle: "Task issuance and verification blocks are clearer, denser, and easier to scan on small screens.",
  },
  community: {
    title: "Community as a Product Surface",
    subtitle: "MyCity content is framed as structured civic signal, not a generic social feed.",
  },
  verify: {
    title: "Verification With Better State Clarity",
    subtitle: "Pending, confirmed, and rejected states become unmistakable through consistent chips and layout.",
  },
  mce: {
    title: "MCE Governance in One Pane",
    subtitle: "Proposal context, vote flow, and planning status are presented as one coherent control surface.",
  },
};

function LeftPanel() {
  return (
    <div className={styles.sideStack}>
      <article className={styles.sideCard}>
        <p className={styles.sideLabel}>Prototype Scope</p>
        <h3>Live shell, mock internals</h3>
        <p>This route uses the real demo phone AppShell and keeps all role logic untouched.</p>
      </article>

      <article className={styles.sideCard}>
        <p className={styles.sideLabel}>Compare</p>
        <div className={styles.sideLinks}>
          <Link href="/demo">Current Demo Landing</Link>
          <Link href="/demo/issuer">Current Issuer App</Link>
          <Link href="/demo/redeemer">Current Redeemer App</Link>
        </div>
      </article>

      <article className={styles.sideCard}>
        <p className={styles.sideLabel}>Visual Goals</p>
        <ul>
          <li>Lighter surfaces with stronger hierarchy</li>
          <li>Less visual clutter in primary actions</li>
          <li>Wallet-like interaction rhythm</li>
        </ul>
      </article>
    </div>
  );
}

function RightPanel() {
  return (
    <div className={styles.sideStack}>
      <article className={styles.imageCard}>
        <Image src="/pitch/image-1.png" alt="City civic landscape" fill sizes="280px" />
      </article>
      <article className={styles.imageCard}>
        <Image src="/pitch/image-9.png" alt="Issuer participant redeemer loop" fill sizes="280px" />
      </article>
    </div>
  );
}

export default function RedesignPhonePrototype() {
  const [activeTab, setActiveTab] = React.useState<string>("profile");
  const content = TAB_CONTENT[activeTab] ?? TAB_CONTENT.profile;

  return (
    <AppShell
      role="issuer"
      orgName="Community Works Collective"
      address="0x2Ae5dfa5cbA317fbF92664559de0c56a9C47E18C"
      cityBalance={418}
      voteBalance={418}
      mceBalance={26}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      accentColor="#DD9E33"
      title="Redesign Prototype"
      leftPanel={<LeftPanel />}
      rightPanel={<RightPanel />}
      phoneFrame
    >
      <div className={styles.canvas}>
        <section className={styles.heroCard}>
          <div>
            <p className={styles.heroEyebrow}>Redesign Concept</p>
            <h2>{content.title}</h2>
            <p>{content.subtitle}</p>
            <div className={styles.heroActions}>
              <button type="button">Start Tutorial</button>
              <button type="button" className={styles.secondary}>
                View Tokens
              </button>
            </div>
          </div>
          <div className={styles.heroImageWrap}>
            <Image src="/pitch/image-4.png" alt="Prototype hero visual" fill sizes="(max-width: 430px) 90vw, 300px" />
          </div>
        </section>

        <section className={styles.metricGrid}>
          <article>
            <p>Issued This Epoch</p>
            <strong>184 CITY</strong>
          </article>
          <article>
            <p>Redemption Throughput</p>
            <strong>78%</strong>
          </article>
          <article>
            <p>Verification SLA</p>
            <strong>4h 12m</strong>
          </article>
        </section>

        <section className={styles.boardCard}>
          <div className={styles.boardHeader}>
            <h3>Live Task Board</h3>
            <button type="button">+ Issue Tasks</button>
          </div>

          <ul>
            {MOCK_TASKS.map(task => (
              <li key={task.name} className={styles.taskRow}>
                <div>
                  <strong>{task.name}</strong>
                  <p>{task.rate}</p>
                </div>
                <span>{task.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.noteCard}>
          <p>
            This screen is intentionally UI-only. It lets us test visual hierarchy, card rhythm, and shell feel before
            applying the design language to the live role flows.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
