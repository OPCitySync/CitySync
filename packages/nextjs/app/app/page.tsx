import type { Metadata } from "next";
import RedesignClientPage from "../demo/redesign/RedesignClientPage";

export const metadata: Metadata = {
  title: "City/Sync Demo",
  description: "City/Sync demo with the live civic coordination application shell.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppDemoPage() {
  return <RedesignClientPage />;
}
