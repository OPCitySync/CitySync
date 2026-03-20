import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { MarkdownDeepDivePage } from "../_components/MarkdownDeepDivePage";

export const metadata: Metadata = {
  title: "Pilot Calibration Sequence — City/Sync Demo",
  description: "Phased calibration sequence for launching, observing, and expanding a City/Sync civic-credit system.",
};

const sourcePath = path.join(process.cwd(), "app/demo/pilot-calibration-sequence/content.md");
const markdown = readFileSync(sourcePath, "utf8");

export default function PilotCalibrationSequencePage() {
  return (
    <MarkdownDeepDivePage
      chipLabel="Pilot Calibration"
      pageTitle="Civic-Credit Economy: Pilot Calibration Sequence"
      description="A phased protocol for launching, observing, calibrating, and growing from first issuance through managed expansion."
      markdown={markdown}
    />
  );
}
