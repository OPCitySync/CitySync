"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEMO_TUTORIAL_EXTERNAL_START_STORAGE_KEY,
  ISSUER_TUTORIAL_STEP_STORAGE_KEY,
  SHARED_TUTORIAL_INTRO_TEXT,
} from "../_utils/tutorialRun";
import { LearnInfoCard, LearnMorePanel } from "../_components/LearnMore";
import { OnchainActivityPanel } from "../_components/OnchainActivityPanel";
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

const roleAccentByKey: Record<RoleKey, string> = {
  issuer: "#DD9E33",
  participant: "#4169E1",
  redeemer: "#34eeb6",
};

const deepLinks = [
  { href: "/demo/mce", label: "Mass Coordination Events" },
  { href: "/demo/public-sector-economy", label: "Public-Sector Economy" },
  { href: "/demo/task-management", label: "Task Management" },
] as const;

const EMBED_SRC = "/demo/issuer?embed=1&skin=redesign";
const BOX_STEP_PATTERN = /^box(\d+)$/;

type TutorialContent = {
  stepLabel: string;
  title: string;
  body: string;
};

type RoleLearnCard = LearnInfoCard & { key: string };
type LearnMoreStateByRole = Record<
  RoleKey,
  {
    cards: RoleLearnCard[];
    relatedLinks: Array<{ label: string; href: string }>;
  }
>;

const TUTORIAL_CONTENT_BY_STEP: Record<string, TutorialContent> = {
  intro: {
    stepLabel: "Tutorial",
    title: "Welcome to the City/Sync Demo",
    body: SHARED_TUTORIAL_INTRO_TEXT,
  },
  box1: {
    stepLabel: "Step 1",
    title: "Switch Roles in the Demo",
    body: "In the demo, users are able to switch between roles, acting as Issuer organizations, Civic-Participants, or Redeemer organizations.\n\nAfter the tutorial, feel free to switch between roles to explore full functionality.",
  },
  box2: {
    stepLabel: "Step 2",
    title: "Let's start with Issuers",
    body: "Issuers are public-sector organizations that facilitate volunteer programs and are well-suited for issuing and verifying civic-labor tasks.\n\nTo start, please give your Issuer Organization a name using the edit profile button highlighted in the Profile tab.",
  },
  box3: {
    stepLabel: "Step 3",
    title: "Welcome!",
    body: "Issuer organizations can begin to issue tasks by selecting the Tasks Tab at the bottom.",
  },
  box5: {
    stepLabel: "Step 4",
    title: "Propose a New Task",
    body: "Issuer Organizations can propose the creation of a new task to be added to their catalog at any time. There is a standardized template for proposing tasks. Let's create one by clicking the + Propose New Task for Approval button.\n\nWe will auto-fill this task for you to start. When you're ready, let's talk about how they are approved.",
  },
  box6: {
    stepLabel: "Step 5",
    title: "Approve Your Proposed Task",
    body: "Great. Your proposed task is now ready for catalog approval.\n\nGo ahead and approve your task for the catalog.",
  },
  box7: {
    stepLabel: "Step 6",
    title: "Issue from Your Catalog",
    body: "Once a task has been approved, it is placed within your organizational task catalog. You can issue tasks from your catalog at any time.",
  },
  box8: {
    stepLabel: "Step 7",
    title: "Choose Issuance Slots",
    body: "When issuing tasks, Issuers are able to create multiple instances of that task to be made available for the public to claim.\n\nGo ahead and approve the 3 tasks for issuance.",
  },
  box11: {
    stepLabel: "Step 8",
    title: "Claim Two Tasks",
    body: "Civic-Participants are able to Browse all issued tasks and claim up to 2 tasks at any given time.\nPlease go ahead and claim 2 of the 3 tasks you issued.",
  },
  box13: {
    stepLabel: "Step 9",
    title: "Execute a Claimed Task",
    body: "When executing a task, Civic-Participants will be able to submit proof of task completion and provide feedback to Issuers about their experience. Go ahead and Execute on of your two tasks.",
  },
  box14: {
    stepLabel: "Step 10",
    title: "Return to Issuer Verification",
    body: "Now, lets take a look again at how the Issuers are handling the Claimed and executed tasks.",
  },
  box15: {
    stepLabel: "Step 11",
    title: "Issued, Claimed, and Completed",
    body: "All issued task will be in one of three states: Issued, Claimed, and Completed. Issued tasks can be unissued by the Issuer. Unissued tasks are removed from circulation.\n\nGo ahead an Unissue one of your tasks.",
  },
  box16: {
    stepLabel: "Step 12",
    title: "Handling No-Shows",
    body: "If a Civic-Participant fails to show up for their claimed task, Issuers can select the No Show button to remove the claimed task out of circulation. No Shows by Civic-Participants are tracked to prevent abuse.\n\nGo ahead and select Mark No-Show for this task.",
  },
  box17: {
    stepLabel: "Step 13",
    title: "Verify or Reject with Mint",
    body: "Issuers are responsible for verifying that the work was actually completed by the Civic-Participant. Once verification is complete they can either reject completion as unsatisfactory with feedback or verify. Rejections are designed to keep Civic-Participants accountable. In both circumstances, credits will be minted to the Civic-Participant.\n\nGo ahead and Verify & Mint.",
  },
  box19: {
    stepLabel: "Step 14",
    title: "Offering Catalog",
    body: "Redeemer Organizations also have an offering Catalog to keep track of past offerings and the ability to issue new offerings for each Epoch.",
  },
  box20: {
    stepLabel: "Step 15",
    title: "Create Your Offering",
    body: "For each offering, Redeemer organizations can name their offering, set the credit rate for that offering, or add any stipulations for redeeming that offer.\n\nGo ahead and name your offering and submit it to the catalog.",
  },
  box21: {
    stepLabel: "Step 16",
    title: "Commit and Lock",
    body: "Once an offering is added to their catalog, Redeemer organizations can modify their offering before they commit it. Once a commitment is made, Redeemers agree to honor that offering until the end of the current Epoch.\n\nGo ahead and Commit the offering.",
  },
  box22: {
    stepLabel: "Step 17",
    title: "How QR Redemption Works",
    body: "QR Codes are issued for each offering, and Redeemer organizations can present these QR codes near their Point-of-Sale systems. When a civic-participant scans the QR code, it calls the burn function for CITY for the amount offered, and the credits can then be redeemed for the offer.",
  },
  box23: {
    stepLabel: "Step 18",
    title: "Your Wallet and Balances",
    body: "After completed tasks are verified, users are Minted CITY and VOTE. Civic-Participants can keep track of their balances in their wallet.",
  },
  box24: {
    stepLabel: "Step 19",
    title: "Redeem an Offering",
    body: "Civic-Participants can spend their credits on available offerings. Go ahead and spend your credits on the offering you created by clicking redeem.",
  },
  box25: {
    stepLabel: "Step 20",
    title: "Point-of-Sale Confirmation",
    body: "When a Civic-Participant scans a QR code to redeem an offer, a visual and audible cue will flash on their screen to show Redeemer Organization employees that the CITY has been burned and they are permitted to provide those goods and services.",
  },
  box26: {
    stepLabel: "Step 21",
    title: "You’re Ready to Explore",
    body: "Now that you have a good understanding of the major functions that facilitate the City/Sync protocol, feel free to explore more of the application and learn more about the abilities of the different roles.",
  },
  dismissed: {
    stepLabel: "Tutorial",
    title: "City/Sync Demo",
    body: "Start the tutorial whenever you're ready.",
  },
};

const getTutorialContent = (step: string): TutorialContent => {
  const mapped = TUTORIAL_CONTENT_BY_STEP[step];
  if (mapped) return mapped;
  const boxMatch = step.match(BOX_STEP_PATTERN);
  if (boxMatch) {
    return {
      stepLabel: `Step ${boxMatch[1]}`,
      title: "Tutorial Walkthrough",
      body: "Follow the highlighted controls inside the app to advance to the next step.",
    };
  }
  return TUTORIAL_CONTENT_BY_STEP.dismissed;
};

export default function RedesignClientPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = React.useState<RoleKey>("issuer");
  const [isTourStarted, setIsTourStarted] = React.useState(false);
  const [tutorialStep, setTutorialStep] = React.useState<string>("dismissed");
  const [learnMoreByRole, setLearnMoreByRole] = React.useState<LearnMoreStateByRole>({
    issuer: { cards: [], relatedLinks: [] },
    participant: { cards: [], relatedLinks: [] },
    redeemer: { cards: [], relatedLinks: [] },
  });
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
    const handleTutorialMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;
      if ((payload as { type?: string }).type !== "citysync:tutorial-step") return;
      const step = (payload as { step?: string }).step;
      if (typeof step !== "string") return;
      setTutorialStep(step);
      if (step !== "dismissed") setIsTourStarted(true);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("message", handleTutorialMessage);
    const intervalId = window.setInterval(syncStep, 400);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("message", handleTutorialMessage);
      window.clearInterval(intervalId);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleExitDemoMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;
      if ((payload as { type?: string }).type !== "citysync:exit-demo") return;
      router.push("/demo/landing");
    };
    window.addEventListener("message", handleExitDemoMessage);
    return () => window.removeEventListener("message", handleExitDemoMessage);
  }, [router]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleLearnMoreState = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;
      if ((payload as { type?: string }).type !== "citysync:learn-more-state") return;
      const role = (payload as { role?: string }).role;
      if (role !== "issuer" && role !== "participant" && role !== "redeemer") return;
      const cardsRaw = (payload as { cards?: unknown }).cards;
      const relatedLinksRaw = (payload as { relatedLinks?: unknown }).relatedLinks;
      const cards: RoleLearnCard[] = [];
      if (Array.isArray(cardsRaw)) {
        for (const entry of cardsRaw) {
          if (!entry || typeof entry !== "object") continue;
          const card = entry as Partial<RoleLearnCard>;
          if (
            typeof card.key !== "string" ||
            typeof card.title !== "string" ||
            typeof card.subtitle !== "string" ||
            typeof card.body !== "string"
          ) {
            continue;
          }
          const relatedLinks = Array.isArray(card.relatedLinks)
            ? card.relatedLinks.filter(
                link => !!link && typeof link.label === "string" && typeof link.href === "string",
              )
            : undefined;
          cards.push({
            key: card.key,
            title: card.title,
            subtitle: card.subtitle,
            body: card.body,
            relatedLinks,
          });
        }
      }
      const relatedLinks = Array.isArray(relatedLinksRaw)
        ? relatedLinksRaw.filter(link => !!link && typeof link.label === "string" && typeof link.href === "string")
        : [];
      setLearnMoreByRole(prev => ({
        ...prev,
        [role]: { cards, relatedLinks },
      }));
    };
    window.addEventListener("message", handleLearnMoreState);
    return () => window.removeEventListener("message", handleLearnMoreState);
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

  const tutorialContent = getTutorialContent(tutorialStep);
  const tutorialActive = /^box\d+$/.test(tutorialStep);
  const activeLearnState = learnMoreByRole[activeRole];
  const activeLearnCardKeys = React.useMemo(
    () => activeLearnState.cards.map(card => card.key),
    [activeLearnState.cards],
  );
  const activeLearnCardMap = React.useMemo(() => {
    const map: Record<string, LearnInfoCard> = {};
    activeLearnState.cards.forEach(card => {
      map[card.key] = {
        title: card.title,
        subtitle: card.subtitle,
        body: card.body,
        relatedLinks: card.relatedLinks,
      };
    });
    return map;
  }, [activeLearnState.cards]);
  const activeRelatedLinks = activeLearnState.relatedLinks.length > 0 ? activeLearnState.relatedLinks : deepLinks;

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

            <OnchainActivityPanel role={activeRole} accent={roleAccentByKey[activeRole]} />
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
                <p className={styles.cardLabel}>{tutorialContent.stepLabel}</p>
                <h3>{tutorialContent.title}</h3>
                <p className={styles.cardText} style={{ whiteSpace: "pre-line" }}>
                  {tutorialContent.body}
                </p>
                <div className={styles.tutorialActions}>
                  {!tutorialActive && (
                    <button type="button" onClick={startTutorial}>
                      Start Tutorial
                    </button>
                  )}
                  <button type="button" className={styles.secondaryAction} onClick={resetTutorial}>
                    Exit Tutorial
                  </button>
                </div>
              </div>
            )}
            {activeLearnCardKeys.length > 0 ? (
              <LearnMorePanel
                keys={activeLearnCardKeys}
                cards={activeLearnCardMap}
                onClose={key => {
                  setLearnMoreByRole(prev => ({
                    ...prev,
                    [activeRole]: {
                      ...prev[activeRole],
                      cards: prev[activeRole].cards.filter(card => card.key !== key),
                    },
                  }));
                }}
                accent={roleAccentByKey[activeRole]}
              />
            ) : (
              <div className={styles.linksCard}>
                <p className={styles.cardLabel}>Information Boxes</p>
                <p className={styles.cardText}>Use Learn More links in the app to load contextual cards here.</p>
              </div>
            )}
            <div className={styles.linksCard}>
              <p className={styles.cardLabel}>Related Deep Dives</p>
              <ul>
                {activeRelatedLinks.map(link => (
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
