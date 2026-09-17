import Image from "next/image";

export default function TermsCondition() {
  return (
    <div className="w-full bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-[260px] w-full flex items-center justify-center">
        <Image
          src="/terms-banner.jpg" // put banner image in public/
          alt="Terms & Conditions"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold">
          Terms & Conditions
        </h1>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-10 text-gray-800 leading-relaxed">
        {/* INTRODUCTION */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            <b>Research Analyst (RA):</b> Sasikumar Peyyala, registered with
            SEBI under Registration No. <b>INH000019327</b>, having registered
            address at 1-2/4-29/4, Near DSM High School, Kummaripalem Center,
            Vidhyadharapuram, Vijayawada, Krishna District - 520012.
          </p>
          <p className="mt-2">
            <b>User/Client:</b> The individual or entity subscribing to or
            availing our research services, who meets eligibility requirements
            under Indian law.
          </p>
        </section>

        {/* PURPOSE */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. Purpose</h2>
          <p>
            These Terms & Conditions (“T&C”) govern your use or subscription of
            our research services including digital platforms.
          </p>
          <p className="mt-2">
            This document incorporates provisions of SEBI Circular
            SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2025/004 dated January 08, 2025 and
            SEBI (Research Analysts) Regulations, 2014. In case of conflict,
            SEBI guidelines shall prevail.
          </p>
        </section>

        {/* DEFINITIONS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <b>Client/User:</b> Any person/entity registered to avail
              Services.
            </li>
            <li>
              <b>Services:</b> Research reports, data, model portfolios, and
              related communications.
            </li>
            <li>
              <b>Digital Platform:</b> Websites, mobile/web apps used to deliver
              Services.
            </li>
            <li>
              <b>KYC:</b> Know Your Customer process mandated by SEBI.
            </li>
          </ul>
        </section>

        {/* SCOPE OF SERVICES */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. Scope of Services</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Research and analysis only. We do not execute trades or hold
              client funds.
            </li>
            <li>
              Model portfolios are for informational purposes and carry no
              guarantee.
            </li>
            <li>
              Use of AI may involve risks including data issues, bias, and
              system vulnerabilities.
            </li>
            <li>
              No guarantee of returns. Past performance is not indicative of
              future results.
            </li>
          </ul>
        </section>

        {/* ELIGIBILITY */}
        <section>
          <h2 className="text-2xl font-bold mb-4">5. Eligibility</h2>
          <p>
            Only individuals above 18 years or legally incorporated entities may
            register. Clients must complete KYC as per SEBI norms.
          </p>
        </section>

        {/* REGISTRATION */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            6. Registration & Accounts
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Clients must provide accurate registration details.</li>
            <li>Login credentials must be kept confidential by the Client.</li>
            <li>
              Content may not be copied, redistributed, or sold without written
              consent.
            </li>
          </ul>
        </section>

        {/* FEES */}
        <section>
          <h2 className="text-2xl font-bold mb-4">7. Fees & Payment</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Max fee for Individual/HUF: ₹1,51,000 per annum (excluding taxes).
            </li>
            <li>Fees for corporates/accredited investors may be negotiated.</li>
            <li>Fees are generally non-refundable.</li>
            <li>
              Refund applicable if SEBI registration is suspended/cancelled.
            </li>
          </ul>
        </section>

        {/* MANDATORY TERMS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            8. Mandatory Terms as per SEBI
          </h2>
          <p>
            By using our services, you acknowledge market risks, absence of
            assured returns, and agree that investments are at your own
            discretion.
          </p>
          <p className="mt-2">
            For grievances, contact: <b>spkumar.researchanalyst@gmail.com</b>.
            If unresolved, you may approach SEBI via SCORES.
          </p>
        </section>

        {/* CONFIDENTIALITY */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            10. Confidentiality & Data Protection
          </h2>
          <p>
            We respect client privacy and comply with applicable data protection
            laws. However, internet transmissions may not be fully secure.
          </p>
        </section>

        {/* LIABILITY */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            11. Limitation of Liability
          </h2>
          <p>
            We are not liable for losses arising from reliance on research,
            third-party data inaccuracies, or force majeure events.
          </p>
        </section>

        {/* TERMINATION */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            13. Suspension & Termination
          </h2>
          <p>
            We may suspend or terminate services for breach of T&C, non-payment
            of fees, or regulatory directions.
          </p>
        </section>

        {/* GOVERNING LAW */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            14. Governing Law & Jurisdiction
          </h2>
          <p>
            These T&C are governed by laws of India. Disputes shall be subject
            to jurisdiction of courts/tribunals in New Delhi or as directed by
            SEBI.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section className="border-t pt-6">
          <h2 className="text-xl font-bold mb-3">Disclaimer</h2>
          <p>
            SEBI registration and NISM certification do not guarantee
            performance or assured returns. Investments are subject to market
            risks. Read all documents carefully before investing and consult a
            qualified financial advisor.
          </p>
        </section>
      </div>
    </div>
  );
}
