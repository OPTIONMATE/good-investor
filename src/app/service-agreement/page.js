import ServiceAgreement from "@/components/ServiceAgreement";

export const metadata = {
  title: "Service Agreement - Good Investor",
  description:
    "Service Agreement for Good Investor's research and advisory services",
};

export default function ServiceAgreementPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <ServiceAgreement />
      </div>
    </main>
  );
}
