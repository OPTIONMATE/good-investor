export default function MITCContent() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8 md:p-12">
        <div className="max-w-none text-neutral-800 space-y-10">
          <p className="leading-relaxed">
            The following are the Most Important Terms & Conditions (MITC)
            governing your subscription to the research/advisory services
            provided by Trade Milaan, a SEBI-registered Research Analyst. By
            subscribing to our services, you agree to the following:
          </p>

          {/* 1. Regulatory Compliance */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              1. Regulatory Compliance
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                We are registered with the Securities and Exchange Board of
                India (SEBI) as a Research Analyst and comply with all
                applicable laws and regulations.
              </li>
              <li>
                Clients are expected to follow all rules and regulations issued
                by SEBI from time to time.
              </li>
            </ul>
          </section>

          {/* 2. Client Onboarding & KYC */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              2. Client Onboarding & KYC
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Clients must complete the KYC (Know Your Client) process with
                accurate, valid, and updated information.
              </li>
              <li>
                Services may be suspended or withheld if incomplete or incorrect
                details are provided.
              </li>
              <li>
                Misrepresentation of identity or information shall lead to
                immediate termination of services without refund.
              </li>
            </ul>
          </section>

          {/* 3. Nature of Services */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              3. Nature of Services
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Services offered are limited to research and advisory
                recommendations only.
              </li>
              <li>
                We do not provide portfolio management, execution, or assured
                return services.
              </li>
              <li>
                All recommendations are based on independent analysis, market
                research, and publicly available data.
              </li>
            </ul>
          </section>

          {/* 4. Fees & Refund Policy */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              4. Fees & Refund Policy
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                All fees paid are non-refundable, except in cases where the RA’s
                SEBI registration is suspended for more than 60 days or
                cancelled, in which case unutilized fees shall be refunded.
              </li>
              <li>
                Partial or pro-rata refunds are generally not applicable except
                at the RA’s sole discretion.
              </li>
              <li>
                Incorrect KYC information will lead to cancellation of services
                without refund.
              </li>
            </ul>
          </section>

          {/* 5. Risk Disclosure */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              5. Risk Disclosure
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Investments in equity, derivatives, commodities, or other
                securities involve market risk.
              </li>
              <li>Past performance is not indicative of future results.</li>
              <li>
                Clients are responsible for their own investment decisions and
                must assess their risk appetite before acting on
                recommendations.
              </li>
            </ul>
          </section>

          {/* 6. Confidentiality & Usage */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              6. Confidentiality & Usage
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                All reports, recommendations, and research material are for the
                exclusive personal use of the registered client.
              </li>
              <li>
                Clients shall not copy, reproduce, distribute, or share our
                proprietary content with any third party without prior written
                consent.
              </li>
            </ul>
          </section>

          {/* 7. No Guarantee of Returns */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              7. No Guarantee of Returns
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                We do not guarantee or promise profits, returns, or performance
                of any investment.
              </li>
              <li>
                Any claims of assured returns are strictly prohibited and should
                be reported immediately.
              </li>
            </ul>
          </section>

          {/* 8. Complaint Redressal */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              8. Complaint Redressal
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Email: spkumar.researchanalyst@gmail.com</li>
              <li>Phone: +91 770 226 2206</li>
              <li>
                Complaints will be acknowledged within 2 working days and
                resolved within 30 days.
              </li>
              <li>
                If unsatisfied, clients may escalate to SEBI SCORES
                (https://scores.gov.in/).
              </li>
            </ul>
          </section>

          {/* 9. Termination of Services */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              9. Termination of Services
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                We reserve the right to suspend or terminate services in cases
                of non-compliance, misuse, misrepresentation, or regulatory
                restrictions.
              </li>
              <li>
                Clients may choose not to renew services after their
                subscription period ends.
              </li>
            </ul>
          </section>

          {/* 10. Governing Law & Jurisdiction */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              10. Governing Law & Jurisdiction
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                These terms and conditions are governed by the laws of India.
              </li>
              <li>
                Any disputes shall be subject to the jurisdiction of the courts.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
