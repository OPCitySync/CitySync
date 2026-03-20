import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { MarkdownDeepDivePage } from "../_components/MarkdownDeepDivePage";

export const metadata: Metadata = {
  title: "Civic-Credit Formal Model — City/Sync Demo",
  description:
    "Formal equilibrium model for issuance, redemption, dormancy, and governance in the City/Sync civic-credit economy.",
};

const sourcePath = path.join(process.cwd(), "app/demo/civic-credit-formal-model/content.md");
const markdown = readFileSync(sourcePath, "utf8");

export default function CivicCreditFormalModelPage() {
  return (
    <MarkdownDeepDivePage
      chipLabel="Formal Model"
      pageTitle="Civic-Credit Economy: Formal Equilibrium Model"
      description="A mathematical framework for governing issuance, redemption, and growth in a bounded civic-labor credit system."
      markdown={markdown}
    />
  );
}
