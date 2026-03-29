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

type AppDemoPageProps = {
  searchParams?: Promise<{
    role?: string | string[];
  }>;
};

const normalizeRole = (value: string | string[] | undefined): "issuer" | "participant" | "redeemer" => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate === "participant" || candidate === "redeemer") return candidate;
  return "issuer";
};

export default async function AppDemoPage({ searchParams }: AppDemoPageProps) {
  const params = await searchParams;

  return <RedesignClientPage initialRole={normalizeRole(params?.role)} />;
}
