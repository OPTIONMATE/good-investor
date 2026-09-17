import Image from "next/image";

export default function RefundPolicy() {
  return (
    <div className="w-full bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-[260px] w-full flex items-center justify-center">
        <Image
          src="/refund-banner.jpg" // put banner image in public/
          alt="Refund Policy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold">
          Refund Policy
        </h1>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-8 text-gray-800 leading-relaxed">
        <p>
          At <b>trademilaan</b>, we believe in transparency and fairness when it
          comes to the fees you pay for our research and advisory services.
          Please read the following refund policy carefully before subscribing
          to our services:
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-3">Non-Refundable Fees</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              All subscription fees paid are strictly non-refundable, except in
              cases where the Research Analyst’s (RA) registration is suspended
              or cancelled by SEBI.
            </li>
            <li>
              Once services are activated, no request for cancellation or refund
              will be entertained due to dissatisfaction, change of mind, or
              non-usage of services.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Incorrect KYC Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Clients must provide accurate and complete KYC information at the
              time of registration.
            </li>
            <li>
              If false, incomplete, or incorrect KYC details are provided,
              services will not be delivered and no refund will be made.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Partial-Month or Pro-Rata Refunds
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Subscription fees are charged on fixed cycles (monthly, quarterly,
              annually).
            </li>
            <li>
              Partial-month or pro-rata refunds are not provided, except at the
              sole discretion of the RA or if required by SEBI regulations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Suspension or Cancellation of SEBI Registration
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              If the RA’s SEBI registration is suspended for more than 60 days
              or permanently cancelled, clients are eligible for a refund of the
              unutilized subscription amount from the effective date.
            </li>
            <li>
              Refunds will be processed within a reasonable time after proper
              verification.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Refund Timeline and Process
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Eligible refunds will be credited to the original payment method
              used by the client.
            </li>
            <li>
              Refunds typically take <b>7–15 working days</b> depending on the
              bank/payment gateway.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            No Guarantee of Investment Returns
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Fees are charged strictly for research/advisory services and do
              not guarantee profits or returns.
            </li>
            <li>
              No refunds will be entertained for market losses or
              dissatisfaction with investment outcomes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Dispute Resolution</h2>
          <p>
            Any disputes regarding fees or refunds will be handled as per SEBI
            guidelines and other applicable regulatory authorities.
          </p>
        </section>
      </div>
    </div>
  );
}
