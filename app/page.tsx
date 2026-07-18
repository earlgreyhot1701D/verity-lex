/** Composes the staged Verity Lex interface from independent acts. */

import { MarqueeTicker } from "@/components/MarqueeTicker";
import { ObservationAct } from "@/components/ObservationAct";
import { ScanAct } from "@/components/ScanAct";
import { SurfaceAct } from "@/components/SurfaceAct";
import { VerificationAct } from "@/components/VerificationAct";
import { mockScan } from "@/data/mockScan";

export default function Home() {
  return (
    <main>
      <ScanAct institution={mockScan.institution} />
      <MarqueeTicker />
      <ObservationAct runLog={mockScan.runLog} />
      <SurfaceAct findings={mockScan.findings} score={mockScan.score} />
      <VerificationAct findings={mockScan.findings} />
    </main>
  );
}
