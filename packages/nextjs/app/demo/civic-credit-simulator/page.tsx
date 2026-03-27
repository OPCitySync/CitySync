import type { Metadata } from "next";
import CivicCreditSimulatorClient from "./CivicCreditSimulatorClient";

export const metadata: Metadata = {
  title: "Civic-Credit Simulator — City/Sync Demo",
  description: "Interactive simulator for issuance, redemption, dormancy, and calibration dynamics.",
};

export default function CivicCreditSimulatorPage() {
  return (
    <main>
      <CivicCreditSimulatorClient />
    </main>
  );
}
