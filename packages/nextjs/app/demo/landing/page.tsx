"use client";

import { useEffect } from "react";
import { useAccount, useSignerStatus } from "@account-kit/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DemoLandingPage() {
  const router = useRouter();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { isAuthenticating } = useSignerStatus();

  useEffect(() => {
    if (!address && !isAuthenticating) {
      router.replace("/demo/login");
    }
  }, [address, isAuthenticating, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1428",
        color: "#f5f7ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 22,
          border: "1px solid rgba(102, 131, 214, 0.35)",
          background: "linear-gradient(180deg, rgba(31,45,86,0.92), rgba(17,25,52,0.94))",
          boxShadow: "0 24px 70px rgba(3,8,23,0.5)",
          padding: "34px 30px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <Image src="/citysync-wordmark-frame3.png" alt="City/Sync" width={196} height={44} priority />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(189,204,255,0.82)",
              fontWeight: 700,
            }}
          >
            Demo Landing
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 2.8vw, 2.1rem)", lineHeight: 1.2 }}>
            You&apos;re in. Start the live mobile demo.
          </h1>
          <p style={{ margin: 0, color: "rgba(225,233,255,0.82)", lineHeight: 1.6, maxWidth: 620 }}>
            This is the landing page before entering the live app shell. From here you can continue into the full
            multi-role demo.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/demo/redesign"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid rgba(255,204,112,0.55)",
              background: "linear-gradient(135deg, rgba(238,184,74,0.95), rgba(216,144,47,0.95))",
              color: "#1e1a10",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Enter Demo
          </Link>
          <Link
            href="/demo/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid rgba(189,204,255,0.4)",
              background: "rgba(189,204,255,0.12)",
              color: "rgba(230,238,255,0.95)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
