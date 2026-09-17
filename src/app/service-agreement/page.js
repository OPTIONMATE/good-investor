import ServiceAgreement from "@/components/ServiceAgreement";

export const metadata = {
  title: "Service Agreement - trademilaan",
  description:
    "Service Agreement for trademilaan's research and advisory services",
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
