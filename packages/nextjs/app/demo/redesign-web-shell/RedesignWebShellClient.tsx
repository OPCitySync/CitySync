"use client";

import React from "react";
import styles from "./page.module.css";

type RoleKey = "issuer" | "participant" | "redeemer";

type SheetKind = "issue" | "claim" | "redeem" | "commit" | "review" | null;

const ROLE_META: Record<RoleKey, { label: string; accent: string; city: number; vote: number; mce: number }> = {
  issuer: { label: "Issuer", accent: "#DD9E33", city: 418, vote: 0, mce: 0 },
  participant: { label: "Civic Participant", accent: "#4169E1", city: 128, vote: 128, mce: 9 },
  redeemer: { label: "Redeemer", accent: "#34eeb6", city: 44, vote: 0, mce: 0 },
};

const ROLE_TABS: Record<RoleKey, string[]> = {
  issuer: ["Profile", "Tasks", "Community", "Verify", "MCE"],
  participant: ["Profile", "Explore", "Community", "Vote", "Redeem"],
  redeemer: ["Profile", "Offerings", "Community", "Dashboard", "MCE"],
};

const TAB_COPY: Record<
  string,
  { title: string; subtitle: string; action: string; secondary: string; defaultSheet: SheetKind }
> = {
  "issuer:Profile": {
    title: "Issuer Operations Dashboard",
    subtitle: "Monitor issuance, participant behavior, and verification throughput from one command surface.",
    action: "Open Task Queue",
    secondary: "Review Sanctions",
    defaultSheet: "review",
  },
  "issuer:Tasks": {
    title: "Task Catalog and Issuance",
    subtitle: "Create from catalog, set slots, and move opportunities into the open task pool.",
    action: "Issue Tasks",
    secondary: "Propose New Task",
    defaultSheet: "issue",
  },
  "participant:Explore": {
    title: "Task Discovery and Claiming",
    subtitle: "Browse available work, compare CITY rates, and claim up to two opportunities at once.",
    action: "Claim Tasks",
    secondary: "View Claimed",
    defaultSheet: "claim",
  },
  "participant:Redeem": {
    title: "Redemption Workbench",
    subtitle: "Find offerings, scan redeem flows, and confirm burn transactions with clear status feedback.",
    action: "Redeem Offering",
    secondary: "View History",
    defaultSheet: "redeem",
  },
  "redeemer:Offerings": {
    title: "Offering Catalog and Commitments",
    subtitle: "Set commitment rates and publish active epoch offerings with QR-enabled redemption flows.",
    action: "Commit Offering",
    secondary: "Generate QR",
    defaultSheet: "commit",
  },
};

const SHEET_CONTENT: Record<Exclude<SheetKind, null>, { title: string; body: string; cta: string }> = {
  issue: {
    title: "Issue Task Slots",
    body: "Pick a catalog task, confirm slot count, and write issuance onchain with sponsored gas.",
    cta: "Confirm Issue",
  },
  claim: {
    title: "Claim Task",
    body: "Review task requirements, lock your claim, and move the task from Issued to Claimed.",
    cta: "Confirm Claim",
  },
  redeem: {
    title: "Redeem CITY Credits",
    body: "Select the offering, verify wallet balance, and execute the burn transaction.",
    cta: "Redeem Now",
  },
  commit: {
    title: "Commit Offering",
    body: "Finalize the offering rate and lock the commitment for the active epoch period.",
    cta: "Confirm Commit",
  },
  review: {
    title: "Verification Review",
    body: "Use Verify & Mint or Reject & Mint workflows with required feedback for rejected submissions.",
    cta: "Open Review Queue",
  },
};

function resolveTabConfig(role: RoleKey, tab: string) {
  return (
    TAB_COPY[`${role}:${tab}`] ?? {
      title: `${ROLE_META[role].label} · ${tab}`,
      subtitle: "Web layout concept preserving mobile role logic while expanding visibility and controls.",
      action: "Primary Action",
      secondary: "Secondary Action",
      defaultSheet: "review" as SheetKind,
    }
  );
}

export default function RedesignWebShellClient() {
  const [role, setRole] = React.useState<RoleKey>("issuer");
  const [activeTab, setActiveTab] = React.useState(ROLE_TABS.issuer[0]);
  const [openSheet, setOpenSheet] = React.useState<SheetKind>(null);

  React.useEffect(() => {
    setActiveTab(ROLE_TABS[role][0]);
    setOpenSheet(null);
  }, [role]);

  const roleMeta = ROLE_META[role];
  const tabConfig = resolveTabConfig(role, activeTab);

  const tableRows = [
    { label: "Neighborhood Garden Support", state: "Issued", rate: "8 CITY/hr" },
    { label: "Transit Accessibility Survey", state: "Claimed", rate: "6 CITY/hr" },
    { label: "Community Library Setup", state: "Completed", rate: "5 CITY/hr" },
  ];

  const timeline = [
    "Task issue confirmed · 2m ago",
    "Claim submitted · 8m ago",
    "Redemption burn confirmed · 14m ago",
    "MCE vote tally refreshed · 25m ago",
  ];

  return (
    <div className={styles.frame}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.rolePills}>
            {(Object.keys(ROLE_META) as RoleKey[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`${styles.rolePill} ${role === key ? styles.rolePillActive : ""}`}
                style={role === key ? { borderColor: ROLE_META[key].accent, color: ROLE_META[key].accent } : undefined}
              >
                {ROLE_META[key].label}
              </button>
            ))}
          </div>

          <div className={styles.walletChips}>
            <span>CITY {roleMeta.city}</span>
            <span>VOTE {roleMeta.vote}</span>
            <span>MCE {roleMeta.mce}</span>
          </div>
        </header>

        <div className={styles.bodyGrid}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>Navigation</p>
            {ROLE_TABS[role].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`${styles.navButton} ${activeTab === tab ? styles.navButtonActive : ""}`}
                style={activeTab === tab ? { borderColor: roleMeta.accent, color: roleMeta.accent } : undefined}
              >
                {tab}
              </button>
            ))}
          </aside>

          <section className={styles.mainPane}>
            <div className={styles.panelTop}>
              <div>
                <p className={styles.eyebrow}>Web Application Concept</p>
                <h2>{tabConfig.title}</h2>
                <p>{tabConfig.subtitle}</p>
              </div>
              <div className={styles.panelActions}>
                <button type="button" onClick={() => setOpenSheet(tabConfig.defaultSheet)}>
                  {tabConfig.action}
                </button>
                <button type="button" className={styles.secondaryAction}>
                  {tabConfig.secondary}
                </button>
              </div>
            </div>

            <div className={styles.metrics}>
              <article>
                <p>Active Items</p>
                <strong>24</strong>
              </article>
              <article>
                <p>Today Throughput</p>
                <strong>87%</strong>
              </article>
              <article>
                <p>Average Confirm Time</p>
                <strong>48s</strong>
              </article>
            </div>

            <article className={styles.tableCard}>
              <div className={styles.tableHead}>
                <h3>Operational Queue</h3>
                <button
                  type="button"
                  className={styles.tableAction}
                  onClick={() => setOpenSheet(tabConfig.defaultSheet)}
                >
                  Open Workflow
                </button>
              </div>
              <ul>
                {tableRows.map(row => (
                  <li key={`${row.label}-${row.state}`}>
                    <div>
                      <strong>{row.label}</strong>
                      <p>{row.rate}</p>
                    </div>
                    <span>{row.state}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <aside className={styles.contextPane}>
            <article className={styles.contextCard}>
              <p className={styles.eyebrow}>Quick Actions</p>
              <button type="button" onClick={() => setOpenSheet("issue")}>
                Issue / Commit
              </button>
              <button type="button" onClick={() => setOpenSheet("claim")}>
                Claim / Execute
              </button>
              <button type="button" onClick={() => setOpenSheet("redeem")}>
                Redeem / Burn
              </button>
            </article>

            <article className={styles.contextCard}>
              <p className={styles.eyebrow}>Live Activity</p>
              <ul className={styles.timeline}>
                {timeline.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </aside>
        </div>

        {openSheet && (
          <div className={styles.sheetBackdrop} onClick={() => setOpenSheet(null)}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
              <div className={styles.sheetHandle} />
              <h4>{SHEET_CONTENT[openSheet].title}</h4>
              <p>{SHEET_CONTENT[openSheet].body}</p>
              <div className={styles.sheetActions}>
                <button type="button" onClick={() => setOpenSheet(null)}>
                  {SHEET_CONTENT[openSheet].cta}
                </button>
                <button type="button" className={styles.sheetSecondary} onClick={() => setOpenSheet(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
