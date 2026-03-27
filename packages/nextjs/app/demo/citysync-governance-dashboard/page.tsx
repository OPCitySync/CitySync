import type { Metadata } from "next";
import GovernanceDashboardClient from "./GovernanceDashboardClient";

export const metadata: Metadata = {
  title: "CitySync Governance Dashboard — City/Sync Demo",
  description: "Interactive governance dashboard for assessing civic-credit system health and decision actions.",
};

export default function CitySyncGovernanceDashboardPage() {
  return (
    <main>
      <GovernanceDashboardClient />
    </main>
  );
}
