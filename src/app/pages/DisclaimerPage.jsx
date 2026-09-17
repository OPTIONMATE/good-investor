import DisclaimerHero from "../components/disclaimer/DisclaimerHero";
import RiskCards from "../components/disclaimer/RiskCards";
import ReportSection from "../components/disclaimer/ReportSection";
import MaterialDisclosureCards from "../components/disclaimer/MaterialDisclosureCards";
import TermsSection from "../components/disclaimer/TermsSection";
import RiskDisclosureSection from "../components/disclaimer/RiskDisclosureSection";
import OwnershipConflicts from "../components/disclaimer/OwnershipConflicts";
import AIToolsSection from "../components/disclaimer/AIToolsSection";

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
