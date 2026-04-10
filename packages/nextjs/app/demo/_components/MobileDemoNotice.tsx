import Image from "next/image";

export function MobileDemoNotice() {
  return (
    <>
      <div className="citysync-mobile-demo-gate" role="dialog" aria-modal="true" aria-labelledby="mobile-demo-title">
        <div className="citysync-mobile-demo-card">
          <Image
            src="/brand/citysync-wordmark-light.svg"
            alt="City/Sync"
            width={150}
            height={44}
            className="citysync-mobile-demo-logo"
            priority
          />
          <p className="citysync-mobile-demo-eyebrow">Desktop demo recommended</p>
          <h1 id="mobile-demo-title">The City/Sync demo is not optimized for mobile viewing yet.</h1>
          <p>
            Please open the demo on a laptop or desktop screen for the full guided walkthrough, role-switching flow, and
            onchain activity panels.
          </p>
          <a href="https://www.city-sync.org">Return to City/Sync</a>
        </div>
      </div>

      <style>{`
        .citysync-mobile-demo-gate {
          display: none;
        }

        @media (max-width: 860px) {
          .citysync-mobile-demo-gate {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: 24px;
            background:
              radial-gradient(circle at 20% 0%, rgba(221, 158, 51, 0.22), transparent 34rem),
              radial-gradient(circle at 90% 20%, rgba(65, 105, 225, 0.18), transparent 30rem),
              #15151e;
            color: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .citysync-mobile-demo-card {
            width: min(100%, 390px);
            display: grid;
            justify-items: center;
            text-align: center;
            gap: 16px;
            padding: 30px 24px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.075);
            border: 1px solid rgba(255, 255, 255, 0.13);
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
            backdrop-filter: blur(18px);
          }

          .citysync-mobile-demo-logo {
            width: 150px;
            height: auto;
            margin-bottom: 4px;
          }

          .citysync-mobile-demo-eyebrow {
            margin: 0;
            color: #dd9e33;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .citysync-mobile-demo-card h1 {
            margin: 0;
            color: #ffffff;
            font-size: clamp(1.65rem, 8vw, 2.2rem);
            line-height: 1.04;
            letter-spacing: -0.04em;
          }

          .citysync-mobile-demo-card p:not(.citysync-mobile-demo-eyebrow) {
            margin: 0;
            color: rgba(255, 255, 255, 0.72);
            font-size: 0.96rem;
            line-height: 1.6;
          }

          .citysync-mobile-demo-card a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            margin-top: 4px;
            padding: 0 18px;
            border-radius: 999px;
            background: #dd9e33;
            color: #15151e;
            font-size: 0.9rem;
            font-weight: 800;
            text-decoration: none;
            box-shadow: 0 12px 28px rgba(221, 158, 51, 0.28);
          }
        }
      `}</style>
    </>
  );
}
