"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DEMO_TUTORIAL_EXTERNAL_START_STORAGE_KEY, ISSUER_TUTORIAL_STEP_STORAGE_KEY } from "../_utils/tutorialRun";
import styles from "./page.module.css";

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

const roleLabelByKey: Record<RoleKey, string> = {
  issuer: "Issuer",
  participant: "Civic Participant",
  redeemer: "Redeemer",
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

const EMBED_SRC = "/demo/issuer?embed=1&skin=redesign";
const BOX_STEP_PATTERN = /^box(\d+)$/;

const getTutorialBody = (step: string) => {
  if (step === "intro") {
    return "Press Start Tutorial to begin Step 1 with in-app highlights.";
  }
  if (step === "box1") {
    return "Step 1: Use the highlighted role switcher/cancel flow in the app to begin.";
  }
  if (BOX_STEP_PATTERN.test(step)) {
    return "Follow the highlighted controls inside the app to advance to the next step.";
  }
  if (step === "dismissed") {
    return "Tutorial is currently closed.";
  }
  return "Tutorial status is syncing.";
};

export default function RedesignClientPage() {
  const [activeRole, setActiveRole] = React.useState<RoleKey>("issuer");
  const [isTourStarted, setIsTourStarted] = React.useState(false);
  const [tutorialStep, setTutorialStep] = React.useState<string>("dismissed");
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  const postRoleToEmbed = React.useCallback((role: RoleKey) => {
    if (typeof window === "undefined") return;
    iframeRef.current?.contentWindow?.postMessage({ type: "citysync:set-role", role }, window.location.origin);
  }, []);

  React.useEffect(() => {
    postRoleToEmbed(activeRole);
  }, [activeRole, postRoleToEmbed]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const readStep = () => {
      try {
        return window.localStorage.getItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY) ?? "dismissed";
      } catch {
        return "dismissed";
      }
    };
    const syncStep = () => {
      const step = readStep();
      setTutorialStep(step);
      if (step !== "dismissed") setIsTourStarted(true);
    };

    syncStep();
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ISSUER_TUTORIAL_STEP_STORAGE_KEY) return;
      syncStep();
    };
    window.addEventListener("storage", handleStorage);
    const intervalId = window.setInterval(syncStep, 400);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(intervalId);
    };
  }, []);

  const openGuidedTour = React.useCallback(() => {
    setIsTourStarted(true);
  }, []);

  const startTutorial = React.useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourStarted(true);
    setActiveRole("issuer");
    const postStartTutorial = () => {
      postRoleToEmbed("issuer");
      iframeRef.current?.contentWindow?.postMessage(
        { type: "citysync:start-tutorial", step: "box1" },
        window.location.origin,
      );
    };
    try {
      window.localStorage.setItem(DEMO_TUTORIAL_EXTERNAL_START_STORAGE_KEY, "1");
      window.localStorage.setItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY, "intro");
    } catch {
      // Ignore localStorage write failures.
    }
    postStartTutorial();
    window.setTimeout(postStartTutorial, 120);
    window.setTimeout(postStartTutorial, 420);
  }, [postRoleToEmbed]);

  const resetTutorial = React.useCallback(() => {
    if (typeof window === "undefined") return;
    setIsTourStarted(false);
    setTutorialStep("dismissed");
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY, "dismissed");
      window.localStorage.removeItem(DEMO_TUTORIAL_EXTERNAL_START_STORAGE_KEY);
    } catch {
      // Ignore localStorage failures.
    }
    iframeRef.current?.contentWindow?.postMessage({ type: "citysync:tutorial-reset" }, window.location.origin);
  }, []);

  const boxMatch = tutorialStep.match(BOX_STEP_PATTERN);
  const tutorialCardTitle = boxMatch
    ? `Step ${boxMatch[1]}`
    : tutorialStep === "intro"
      ? "Tutorial Walkthrough"
      : "Tutorial Walkthrough";
  const tutorialActive = Boolean(boxMatch);

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
          </div>
          <div className={styles.topActions}>
            <button className={styles.primaryBtn} type="button">
              Request Pilot for your City
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
              <button className={styles.primaryBtn} type="button" onClick={openGuidedTour}>
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
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setActiveRole(role.key)}
                  className={`${styles.roleCard} ${styles[role.accent]} ${
                    activeRole === role.key ? styles.roleCardActive : ""
                  }`}
                >
                  <h3>{role.title}</h3>
                  <p>{role.blurb}</p>
                </button>
              ))}
            </div>

            <div className={styles.panelCard}>
              <p className={styles.cardLabel}>Onchain Activity Panel</p>
              <h3>Global {roleLabelByKey[activeRole]} Activity</h3>
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
          </aside>

          <div className={styles.deviceStage}>
            <div className={styles.embedFrame}>
              <iframe
                ref={iframeRef}
                src={EMBED_SRC}
                title="AppShell Preview"
                className={styles.embedIframe}
                loading="lazy"
                onLoad={() => postRoleToEmbed(activeRole)}
              />
            </div>
          </div>

          <aside className={styles.rightRail}>
            {isTourStarted && (
              <div className={styles.tutorialCard}>
                <p className={styles.cardLabel}>City/Sync Demo</p>
                <h3>{tutorialCardTitle}</h3>
                <p className={styles.cardText}>{getTutorialBody(tutorialStep)}</p>
                <div className={styles.tutorialActions}>
                  {!tutorialActive ? (
                    <button type="button" onClick={startTutorial}>
                      Start Tutorial
                    </button>
                  ) : (
                    <button type="button" onClick={startTutorial}>
                      Restart Tutorial
                    </button>
                  )}
                  <button type="button" className={styles.secondaryAction} onClick={resetTutorial}>
                    Exit Tutorial
                  </button>
                </div>
              </div>
            )}
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
        </section>
      </main>
    </div>
  );
}
