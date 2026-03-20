import Link from "next/link";
import type { Metadata } from "next";
import GovernanceDashboardClient from "./GovernanceDashboardClient";

export const metadata: Metadata = {
  title: "CitySync Governance Dashboard — City/Sync Demo",
  description: "Interactive governance dashboard for assessing civic-credit system health and decision actions.",
};

export default function CitySyncGovernanceDashboardPage() {
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
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(15,23,42,0.18)",
            color: "#1e3a8a",
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
      <GovernanceDashboardClient />
    </main>
  );
}
