import MITCHero from "@/app/components/MITCHero";
import MITCContent from "@/app/components/MITCContent";

export const metadata = {
  title: "MITC - Good Investor",
  description:
    "Most Important Terms and Conditions for Good Investor trading services.",
};

export default function MITCPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <MITCHero />

      {/* Main Content */}
      <section className="w-full py-16 md:py-24 px-6 bg-neutral-50">
        <MITCContent />
      </section>
    </div>
  );
}
