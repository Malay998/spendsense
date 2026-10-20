import { AppShell } from "@/components/app-shell";
import InvestmentsCalculator from "@/components/investments-calculator";

export default function InvestmentsPage() {
  return (
    <AppShell active="/investments">
      <InvestmentsCalculator />
    </AppShell>
  );
}