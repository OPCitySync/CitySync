import type { Metadata } from "next";
import RedesignPhonePrototype from "../redesign/RedesignPhonePrototype";

export const metadata: Metadata = {
  title: "City/Sync Redesign Shell (Experimental)",
  description: "Experimental embedded AppShell preview for the redesign page.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedesignShellPage() {
  return <RedesignPhonePrototype shellOnly />;
}
