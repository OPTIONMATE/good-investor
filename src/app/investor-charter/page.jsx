import InvestorHero from "@/app/components/investor/InvestorHero";
import VisionMission from "@/app/components/investor/VisionMission";
import BusinessDetails from "@/app/components/investor/BusinessDetails";
import ServicesOnboarding from "@/app/components/investor/ServicesOnboarding";
import DisclosureToClients from "@/app/components/investor/DisclosureToClients";
import GrievanceRedressal from "@/app/components/investor/GrievanceRedressal";
import RightsOfInvestors from "@/app/components/investor/RightsOfInvestors";
import DosSection from "@/app/components/investor/DosSection";
import DontsSection from "@/app/components/investor/DontsSection";

export const metadata = {
  title: "Investor Charter - Good Investor",
  description:
    "Investor charter, rights, and responsibilities for Good Investor clients.",
};

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
