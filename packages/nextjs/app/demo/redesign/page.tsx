import type { Metadata } from "next";
import RedesignClientPage from "./RedesignClientPage";

export const metadata: Metadata = {
  title: "City/Sync Redesign Prototype (Experimental)",
  description: "Experimental Civic Wallet OS concept page with an embedded live demo shell.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemoRedesignPage() {
  return <RedesignClientPage />;
}
