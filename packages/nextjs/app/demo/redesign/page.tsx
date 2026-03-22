import type { Metadata } from "next";
import RedesignClientPage from "./RedesignClientPage";

export const metadata: Metadata = {
  title: "City/Sync Redesign Prototype",
  description: "Civic Wallet OS concept page with an embedded live demo shell.",
};

export default function DemoRedesignPage() {
  return <RedesignClientPage />;
}
