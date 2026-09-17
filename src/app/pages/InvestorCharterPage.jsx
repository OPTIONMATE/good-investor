import InvestorHero from "../components/investor/InvestorHero";
import VisionMission from "../components/investor/VisionMission";
import BusinessDetails from "../components/investor/BusinessDetails";
import ServicesOnboarding from "../components/investor/ServicesOnboarding";
import DisclosureToClients from "../components/investor/DisclosureToClients";
import GrievanceRedressal from "../components/investor/GrievanceRedressal";
import RightsOfInvestors from "../components/investor/RightsOfInvestors";
import DosSection from "../components/investor/DosSection";
import DontsSection from "../components/investor/DontsSection";

export default function InvestorCharterPage() {
  return (
    <>
      <InvestorHero />
      <VisionMission />
      <BusinessDetails />
      <ServicesOnboarding />
      <DisclosureToClients />
      <GrievanceRedressal />
      <RightsOfInvestors />
      <DosSection />
      <DontsSection />
    </>
  );
}
