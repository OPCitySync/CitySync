import type { Metadata } from "next";
import RedesignPhonePrototype from "../redesign/RedesignPhonePrototype";

export const metadata: Metadata = {
  title: "City/Sync Redesign Shell",
  description: "Embedded AppShell preview for the redesign page.",
};

export default function RedesignShellPage() {
  return <RedesignPhonePrototype shellOnly />;
}
