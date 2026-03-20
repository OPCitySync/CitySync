import Link from "next/link";
import type { Metadata } from "next";
import CivicCreditSimulatorClient from "./CivicCreditSimulatorClient";

export const metadata: Metadata = {
  title: "Civic-Credit Simulator — City/Sync Demo",
  description: "Interactive simulator for issuance, redemption, dormancy, and calibration dynamics.",
};

export default function CivicCreditSimulatorPage() {
  return (
    <main>
      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 50,
        }}
      >
        <Link
          href="/demo"
          style={{
            display: "inline-block",
            background: "rgba(10,10,16,0.82)",
            border: "1px solid rgba(255,255,255,0.24)",
            color: "#d8e4ff",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            backdropFilter: "blur(8px)",
          }}
        >
          ← Back to Demo
        </Link>
      </div>
      <CivicCreditSimulatorClient />
    </main>
  );
}
