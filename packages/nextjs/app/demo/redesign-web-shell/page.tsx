import type { Metadata } from "next";
import RedesignWebShellClient from "./RedesignWebShellClient";

export const metadata: Metadata = {
  title: "City/Sync Redesign Web Shell (Experimental)",
  description: "Experimental web-shell concept for the City/Sync redesign workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedesignWebShellPage() {
  return <RedesignWebShellClient />;
}
