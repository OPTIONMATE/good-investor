import DisclaimerHero from "@/app/components/disclaimer/DisclaimerHero";
import RiskCards from "@/app/components/disclaimer/RiskCards";
import ReportSection from "@/app/components/disclaimer/ReportSection";
import MaterialDisclosureCards from "@/app/components/disclaimer/MaterialDisclosureCards";
import TermsSection from "@/app/components/disclaimer/TermsSection";
import RiskDisclosureSection from "@/app/components/disclaimer/RiskDisclosureSection";
import OwnershipConflicts from "@/app/components/disclaimer/OwnershipConflicts";
import AIToolsSection from "@/app/components/disclaimer/AIToolsSection";

export const metadata = {
  title: "Disclaimer & Disclosure - Good Investor",
  description:
    "Important disclaimers, risk disclosures, and material information for Good Investor clients.",
};

export default function DisclaimerPage() {
  return (
    <>
      <DisclaimerHero />
      <RiskCards />
      <ReportSection />
      <MaterialDisclosureCards />
      <TermsSection />
      <RiskDisclosureSection />
      <OwnershipConflicts />
      <AIToolsSection />
    </>
  );
}
