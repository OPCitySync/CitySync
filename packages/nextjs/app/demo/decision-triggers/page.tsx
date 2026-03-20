import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { MarkdownDeepDivePage } from "../_components/MarkdownDeepDivePage";

export const metadata: Metadata = {
  title: "Decision Triggers — City/Sync Demo",
  description:
    "Governance decision triggers for issuance, capacity expansion, rate changes, and stabilization in the civic-credit economy.",
};

const sourcePath = path.join(process.cwd(), "app/demo/decision-triggers/content.md");
const markdown = readFileSync(sourcePath, "utf8");

export default function DecisionTriggersPage() {
  return (
    <MarkdownDeepDivePage
      chipLabel="Decision Triggers"
      pageTitle="Civic-Credit Economy: Decision Triggers"
      description="A governance playbook for Issuer, Redeemer, and Rate Setting Committees."
      markdown={markdown}
    />
  );
}
