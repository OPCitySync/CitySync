import type { Metadata } from "next";
import RedesignPhonePrototype from "./RedesignPhonePrototype";

export const metadata: Metadata = {
  title: "City/Sync Redesign Prototype",
  description: "Redesign concept rendered inside the real demo phone app shell.",
};

export default function DemoRedesignPage() {
  return <RedesignPhonePrototype />;
}
