"use client";

import { useState } from "react";
import BuyDetailsForm from "./BuyDetailsForm";
import BuyOtpForm from "./BuyOtpForm";
import AgreementModal from "./AgreementModal";
import BuyFlowShell, {
  BuyActions,
  buyPrimaryButtonClass,
  buySecondaryButtonClass,
} from "./BuyFlowShell";

/**
 * Service-purchase flow.
 *
 * Step order follows the existing purchase logic:
 *   1 Terms → 2 Your Details → 3 OTP → 4 Agreement → 5 Payment
 * The emailed OTP is issued by POST /api/buy/start together with the details
 * (that is the existing API contract), so verification can only follow the
 * details step.
 */
export default function BuyNowModal({ onClose, planData }) {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [userDetails, setUserDetails] = useState(null); // confirmed details

  // Agreement + payment manage their own steps (E-Sign then payment).
  if (step === 4) {
    return (
      <AgreementModal
        onClose={onClose}
        planData={planData}
        userDetails={userDetails}
      />
    );
  }

  return (
    <>
      {/* STEP 1: TERMS & CONDITIONS */}
      {step === 1 && (
        <BuyFlowShell
          title="Terms & Conditions"
          subtitle="Please read the terms of service and accept them to continue."
          step={1}
          planData={planData}
          onClose={onClose}
          maxWidth="max-w-4xl"
        >
          <div className="min-h-80 max-h-[52vh] overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700 sm:min-h-[400px] sm:p-6">
            <div id="definitions" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    1. DEFINITIONS
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      <span className="font-semibold text-neutral-900">
                        a. Owner / We / Us / Our:
                      </span>{" "}
                      Refers to Eeda Damodara Rao, the SEBI-registered Research
                      Analyst entity providing research and advisory services,
                      including its employees and affiliates.
                    </li>

                    <li>
                      <span className="font-semibold text-neutral-900">
                        b. User / Client / You / Your:
                      </span>{" "}
                      Any individual or legal entity subscribing to or using the
                      research services provided by Eeda Damodara Rao.
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">c. Parties:</span>{" "}
                      Collectively refers to Eeda Damodara Rao and the
                      User/Client.
                    </li>
                  </ul>
                </div>

                {/* Section 2: USER ELIGIBILITY AND REGISTRATION TERMS */}
                <div id="eligibility" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    2. Assent & Acceptance
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) By subscribing to or utilizing the research services,
                      you confirm that you have read, understood, and agreed to
                      these Terms of Service (TOS).
                    </li>
                    <li>
                      (b) If you do not agree with these terms, you should not
                      avail the services and may seek a refund immediately if
                      applicable.
                    </li>
                    <li>
                      (c) Access to research services is granted only upon
                      acceptance of these Terms and any additional relevant
                      terms associated with specific services.
                    </li>
                  </ul>
                </div>

                {/* Section 3: AGREEMENT SCOPE */}
                <div id="scope" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    3. Service Subscription and Obligations
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) Subscription Confirmation: By accepting the research
                      services from Eeda Damodara Rao, you acknowledge voluntary
                      subscription and acceptance of the terms complying with
                      SEBI (Research Analyst) Regulations, 2014.
                    </li>
                    <li>
                      (b) Regulatory Compliance: Both the Client and Eeda
                      Damodara Rao must comply with all applicable SEBI
                      laws, RA Regulations, and government notifications as
                      amended from time to time.
                    </li>
                  </ul>
                </div>

                {/* Section 4: USER DECLARATIONS */}
                <div id="user-decl" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    Research Report Terms & Conditions
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) The recommendations provided in this report are based
                      on publicly available information we believe to be
                      reliable and accurate at the time of publication.
                    </li>
                    <li>
                      (b) Unless otherwise stated, our recommendations are
                      intended for a 12-month investment horizon.
                    </li>
                    <li>
                      (c) Ratings provided are based on absolute returns
                      (positive or negative) and should be interpreted
                      accordingly.
                    </li>
                    <li>
                      (c) Ratings provided are based on absolute returns
                      (positive or negative) and should be interpreted
                      accordingly.
                    </li>
                    <li>
                      (e) We reserve the right to revise or withdraw ratings due
                      to reassessment of valuation, market events, or lack of
                      clarity.
                    </li>
                    <li>
                      (f) Opinions expressed are subject to change without
                      notice, and we are under no obligation to inform clients
                      of such changes.
                    </li>
                    <li>
                      (g) Clients are advised to carefully assess market risks,
                      including the possibility of partial or permanent capital
                      loss.
                    </li>
                    <li>
                      (h) There is absolutely no scope for refunding losses
                      incurred from acting on any research report or commentary.
                    </li>
                    <li>
                      (i) While pro-rata refunds may be considered for
                      subscriptions due to dissatisfaction, these are not tied
                      to investment outcomes.
                    </li>
                    <li>
                      (j) Eeda Damodara Rao, along with its partners, employees,
                      officers, and affiliates, expressly disclaims any
                      liability for loss or damages arising from unintentional
                      errors or omissions in any information or recommendations
                      contained in the research reports.
                    </li>
                    <li>
                      (k) All reports, including third-party reports,
                      are carefully reviewed prior to dissemination to ensure
                      accuracy and to avoid misleading statements.
                    </li>
                    <li>
                      (l) A daily closing chart of securities is available at
                      NSE: https://charting.nseindia.com/ and BSE:
                      https://charting.bseindia.com/{" "}
                    </li>
                    <li>
                      (m) The view on securities is based on both technical and
                      fundamental analysis.
                    </li>
                    <li>
                      (n) Eeda Damodara Rao adheres strictly to SEBI (Research
                      Analyst) Regulations, 2014, and does not offer investment
                      advisory or PMS (Portfolio Management Services).{" "}
                    </li>
                    <li>
                      (o) All participants must follow the instructions provided
                      during our group calls. We do not offer any one-on-one
                      investment or trading services, as this is against RA
                      regulations.{" "}
                    </li>
                    <li>
                      (p) Please note that personal queries related to group
                      calls will not be entertained. Members are responsible for
                      their own profits and losses.
                    </li>
                  </ul>
                </div>

                {/* PAGE 2 */}
                <div className="mt-10 border-t border-neutral-300 pt-6">
                  {/* Section 5: SERVICE PROVIDER DECLARATIONS */}
                  <div id="provider-decl" className="mb-6 text-sm">
                    <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      4. Client Information & KYC
                    </h3>
                    <ul className="space-y-1 ml-4">
                      <li>
                        (a) Clients must provide complete and accurate personal
                        and financial details as required by Eeda Damodara Rao
                        standard KYC format.
                      </li>
                      <li>
                        (b) Supporting documentation as per SEBI and RAASB
                        guidelines must be submitted and will be verified with
                        the KYC Registration Agency (KRA) regularly.
                      </li>
                    </ul>
                  </div>

                  {/* Section 6: SCOPE OF SERVICES */}
                  <div id="services" className="mb-6 text-sm">
                    <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      5. Standard Terms of Service & Client Consent
                    </h3>
                    <h5 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      Clients agree and certify:
                    </h5>
                    <ul className="space-y-1 ml-4">
                      <li>
                        (a) I / We have read and understood the provisions of
                        the SEBI (Research Analyst) Regulations, 2014.
                      </li>
                      <li>
                        (b) I / We have subscribed to the research service for
                        personal use only and will exercise independent judgment
                        before relying on the report&apos;s conclusions.
                      </li>
                      <h3>
                        Awareness of the following risk factors and disclaimers:
                      </h3>
                      <li>
                        (a) “Investment in securities market are subject to
                        market risks. Read all the related documents carefully
                        before investing.”
                      </li>
                      <li>
                        (b) Holding open positions without stop-loss or target
                        prices can lead to significant losses; clients should
                        exit such positions if a 20% loss threshold is reached.
                      </li>
                      <li>
                        (c) Market conditions can cause partial or total loss of
                        invested capital.
                      </li>
                      <li>
                        (d) “Registration granted by SEBI and certification from
                        NISM do not guarantee the performance of the
                        intermediary nor assure returns to investors.”
                      </li>
                      <li>
                        (e) Past performance is not indicative of future
                        results.
                      </li>
                      <li>
                        (f) There is no guarantee of returns on recommendations.
                      </li>
                      <li>
                        (g) No claims or compensation can be made for losses
                        arising from acting on research recommendations.
                      </li>
                      <li>
                        (f) Strictly follow our group/platform instructions; no
                        specific and separate instructions based on personal
                        queries.{" "}
                      </li>
                    </ul>
                  </div>

                  {/* Section 7: USER OBLIGATIONS */}
                  <div id="obligations" className="mb-6 text-sm">
                    <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      6. Disclosures by Eeda Damodara Rao:
                    </h3>
                    <ul className="space-y-1 ml-4">
                      <li>
                        (a) SEBI Registration Name:
                        <span className="font-semibold text-neutral-900">
                          {" "}
                          Eeda Damodara Rao
                        </span>{" "}
                      </li>
                      <li>
                        (b) SEBI Registration Number:
                        <span className="font-semibold text-neutral-900"> INH000024967</span>{" "}
                      </li>
                      <li>
                        (c) Registration Date:{" "}
                        <span className="font-semibold text-neutral-900">Jan 07, 2025 </span>{" "}
                      </li>
                      <li>
                        (d) Trade Name or Website:
                        <span className="font-semibold text-neutral-900">Jan 07, 2025 </span> (Note:
                        Official Eeda Damodara Rao Website)
                      </li>
                      <li>
                        (f) Maximum fee charged: ₹1.51 Lakhs plus GST per annum
                        (from Individual clients, not applicable to
                        non-individual clients as per current SEBI RA
                        regulations)
                      </li>
                      <li>
                        (g) No assurance or guarantee of return is provided on
                        research recommendations.
                      </li>
                      <li>
                        (h) The Research Analyst declares no conflict of
                        interest and no other professional businesses adversely
                        affecting independence.
                      </li>
                    </ul>
                  </div>

                  {/* Section 8: RISK DISCLOSURES */}
                  <div id="risks" className="mb-6 text-sm">
                    <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      7. Payment Terms
                    </h3>
                    <ul className="space-y-1 ml-4">
                      <li>
                        (a) Fees for services must be paid promptly using the
                        authorized modes and channels prescribed by Eeda
                        Damodara Rao.
                      </li>
                      <li>
                        (b) Accepted payment methods and details are available
                        on the official website.
                      </li>
                      <li>
                        (c) Clients requesting service termination and refunds
                        will be eligible for pro-rata refunds as per SEBI
                        guidelines and Eeda Damodara Rao Refund Policy.
                      </li>
                      <li>
                        <span className="font-semibold text-neutral-900">
                          (d) If you engage with such unauthorized persons,
                          including our employees or associates, or accept
                          return guarantees without officially informing the
                          company, the company will not be liable for any
                          resulting losses or liabilities.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* PAGE 3 */}
                <div className="mt-10 border-t border-neutral-300 pt-6">
                  {/* Section 9: DISCLAIMERS */}
                  <div id="disclaimers" className="mb-6 text-sm">
                    <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                      8. Risk Factors
                    </h3>
                    <ul className="space-y-1 ml-4">
                      <li>
                        (a) Investments carry inherent market, financial,
                        operational, regulatory, litigation, and credit risks,
                        among others. Detailed examples include fluctuations in
                        market conditions, changes in laws, cyber risks, supply
                        chain issues, and legal disputes.
                      </li>
                      <li>
                        (b) Market Risk Warning: Investment in securities
                        markets is subject to market risks. Read all related
                        documents carefully before investing.
                      </li>
                      <li>
                        (c) Open Positions Risk: Positions without specified
                        stop-loss or target levels are riskier with
                        significantly higher loss potential.
                      </li>
                      <li>
                        (d) Futures & Options Risks: High risk involved;
                        suitable only for investors with appropriate risk
                        appetite.
                      </li>
                      <li>
                        (d) Futures & Options Risks: High risk involved;
                        suitable only for investors with appropriate risk
                        appetite.
                      </li>
                      <li>
                        <span className="font-semibold text-neutral-900">
                          (f) There is no recourse or right to claim
                          compensation for losses arising from investment
                          decisions based on research recommendations/calls.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Section 10: GRIEVANCE REDRESSAL */}
                <div id="grievance" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    9. Additional Warnings and Disclaimers
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) No warranties or guarantees are made regarding the
                      accuracy, results, or reliability of research, including
                      on social media platforms.
                    </li>
                    <li>
                      (b) AI and Algo Tools are used occasionally, supporting
                      fundamental and technical analysis; risks include data
                      bias, system failures, and security breaches, which can
                      cause Investments or Portfolio loss.
                    </li>
                    <li>
                      (c) Client confidentiality and data security are strictly
                      maintained.
                    </li>
                  </ul>
                </div>

                {/* Section 11: FORCE MAJEURE CLAUSE */}
                <div id="conflict" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    10. Conflict of Interest and Compliance
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) Eeda Damodara Rao fully complies with SEBI’s
                      disclosure and conflict of interest policies.
                    </li>
                    <li>
                      (b) There are no conflicts, financial interests, or
                      compensation arrangements from subject companies
                      influencing research reports.
                    </li>
                  </ul>
                </div>

                {/* Section 12: SEVERABILITY & FINAL TERMS */}
                <div id="model-portfolio" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    11. Model Portfolio
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) When applicable, model portfolios will be recommended
                      in strict adherence to SEBI guidelines, but should be used
                      for informational purposes only.
                    </li>
                  </ul>
                </div>

                <div id="client-segregation" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    12. Client-Level Segregation
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) Existing clients cannot receive both research and
                      distribution services from the same group/family.
                    </li>
                    <li>
                      (b) New clients must select only one service at
                      onboarding, either research or distribution.
                    </li>
                  </ul>
                </div>

                <div id="grievance-redressal" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    13. Grievance Redressal
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) Clients should report issues such as non-receipt or
                      deficiencies in reports to the designated personnel:
                    </li>
                    <li>
                      Name:
                      <span className="font-semibold text-neutral-900"> Eeda Damodara Rao</span>
                    </li>
                    <li>
                      Email:
                      <span className="font-semibold text-neutral-900">
                        {" "}
                        damu.researchanalyst@gmail.com
                      </span>
                    </li>
                    <li>
                      Phone:
                      <span className="font-semibold text-neutral-900"> +91 97046 48777</span>
                    </li>
                    <li>
                      Complaints will be addressed within 7 business days or as
                      per SEBI timelines.
                    </li>
                    <li>
                      Unresolved complaints can be escalated to SEBI through:
                    </li>
                    <li>
                      {" "}
                      SEBI SCORES:{" "}
                      <span className="font-semibold text-neutral-900">
                        https://scores.sebi.gov.in/
                      </span>
                    </li>
                    <li>
                      SEBI ODR:{" "}
                      <span className="font-semibold text-neutral-900">https://smartodr.in/</span>
                    </li>
                    <li>
                      SEBI Toll-Free:
                      <span className="font-semibold text-neutral-900">
                        1800 22 7575 or 1800 266 7575
                      </span>
                    </li>
                  </ul>
                </div>
                {/* PAGE 4 - ANNEXURE-I */}
                <div id="service-suspension" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    14. Service Suspension & Termination
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      Eeda Damodara Rao reserves the right to suspend or
                      terminate service with or without notice in case of:
                    </li>
                    <li>(a) Violation of TOS (Terms and Conditions)</li>
                    <li>(b) Regulatory direction</li>
                    <li>(c) Non-payment beyond grace periods</li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        Refunds on termination or registration suspension will
                        be made on a pro-rata basis as per applicable SEBI
                        regulations.
                      </span>
                    </li>
                  </ul>
                </div>

                <div id="jurisdiction" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    15. Jurisdiction and Governing Law
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) These Terms of Service are governed by Indian law,
                      specifically SEBI regulations.
                    </li>
                    <li>
                      (b) Any disputes will be subject to the exclusive
                      jurisdiction of courts located in HYDERABAD, TELANGANA.
                    </li>
                  </ul>
                </div>

                <div id="amendments" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    16. Amendments
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) The Owner may update or modify these Terms in
                      accordance with SEBI regulations.
                    </li>
                    <li>
                      (b) Material changes will be notified on the website or
                      via email.
                    </li>
                    <li>
                      (c) Continued use of services signifies acceptance of
                      updated terms.
                    </li>
                  </ul>
                </div>

                <div id="indemnification" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    17. Indemnification
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) You agree to indemnify and hold harmless Eeda Damodara
                      Rao, its officers, and employees against all claims
                      arising from your breach of these Terms or misuse of the
                      service.
                    </li>
                  </ul>
                </div>
                <div id="fatca" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    18. Residency and Tax Status Confirmation - FATCA
                    Declaration:
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      <span className="font-semibold text-neutral-900">
                        I am a resident of India.
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        {" "}
                        I am NOT a politically exposed person.
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        {" "}
                        I am a tax resident of India.
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        Any changes in residency, tax status, or political
                        circumstances must be updated promptly—usually within 30
                        days.{" "}
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        The client bears full responsibility for any
                        misrepresentation.{" "}
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-neutral-900">
                        Data will be disclosed to the authorized Indian
                        authorities upon request to ensure compliance.{" "}
                      </span>
                    </li>
                  </ul>
                </div>

                <div id="cdd" className="mt-10 border-t border-neutral-300 pt-6">
                  <h3 className="mb-4 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    19. Customer Due Diligence (CDD)
                  </h3>
                  <h4>
                    Customer Due Diligence (CDD) Procedure as per SEBI
                    Guidelines
                  </h4>
                  <h4>Key Features of the SEBI CDD Procedure</h4>
                  <div className="mb-4 text-sm">
                    <li>
                      Identification and verification of the client and
                      beneficial owner through prescribed KYC documents at the
                      onset of any account-based relationship or for
                      transactions exceeding ₹50,000.
                    </li>

                    <li>
                      Gathering information regarding the purpose and intended
                      nature of the business relationship from the client.
                    </li>

                    <li>
                      Assessing the client&apos;s business, ownership structure, and
                      control patterns to evaluate risk.
                    </li>

                    <li>
                      Special due diligence (Enhanced Due Diligence - EDD) is
                      required for clients belonging to special categories
                      (CSC), which include non-residents, politically exposed
                      persons (PEPs), high-net-worth individuals, trusts, NGOs,
                      and clients from high-risk jurisdictions.
                    </li>

                    <li>
                      Ongoing monitoring of transactions throughout the
                      relationship to ensure alignment with the client&apos;s
                      profile, source of funds, and risk rating.
                    </li>

                    <li>
                      Reliance on third parties for CDD is allowed if they are
                      regulated, supervised, and adhere to AML/CFT regulations,
                      along with maintaining proper records and transparency.
                    </li>
                    <li>
                      Digital KYC processes have been implemented, including
                      in-person verification via video and electronic Aadhaar
                      authentication, to facilitate seamless client onboarding.
                    </li>
                    <h2>Important Note</h2>
                    <p>
                      According to the Research Analyst Regulations, there are
                      certain restrictions on collecting client data, such as
                      investment amounts, goals, liabilities, and more, as these
                      fall under the jurisdiction of the Investment Adviser
                      Regulation.{" "}
                    </p>
                    <p>
                      To protect everyone&apos;s best interests, we will maintain a
                      record of each client&apos;s KYC for future reference and
                      report any suspicious activities to the Financial
                      Intelligence Unit (FIU).
                    </p>
                  </div>
                </div>

                <div id="mlro" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    20. Money Laundering Reporting Officer (MLRO)
                  </h3>
                  <h4>
                    Report any suspicious transaction to our MLRO
                    department:{" "}
                  </h4>
                  <ul className="space-y-1 ml-4">
                    <li>
                      Name:
                      <span className="font-semibold text-neutral-900"> Eeda Damodara Rao</span>
                    </li>
                    <li>
                      Email:
                      <span className="font-semibold text-neutral-900">
                        {" "}
                        damu.researchanalyst@gmail.com
                      </span>
                    </li>
                    <li>
                      Phone:
                      <span className="font-semibold text-neutral-900"> +91 9704648777</span>
                    </li>
                  </ul>
                </div>
                <div id="additional-info" className="mb-6 text-sm">
                  <h3 className="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">
                    21. Additional Information
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>
                      (a) Full terms, disclaimers, disclosures, investor
                      charters, MITC, refund policies, and regulatory
                      disclosures are available on the official website: Good
                      Investor
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Most Important Terms and Conditions (MITC)
                    </h3>
                    <li>
                      Applicable to Research Services by Eeda Damodara Rao
                    </li>
                    <li>SEBI Registration Number: INH000024967</li>
                    <h3 className="font-semibold text-neutral-900">Non-Execution of Trades</h3>
                    <li>
                      (a) Eeda Damodara Rao does not execute or carry out any
                      purchase or sell transactions on behalf of clients.
                    </li>
                    <li>
                      (b) Clients are strictly advised NOT to permit the
                      Research Analyst (RA) or its representatives to execute
                      trades on their behalf.
                    </li>
                    <h3 className="font-semibold text-neutral-900"> Fee Limits and Payment Terms</h3>
                    <li>
                      (a) Fees charged to individual and Hindu Undivided Family
                      (HUF) clients shall not exceed the limits prescribed by
                      SEBI/RAASB.
                    </li>
                    <li>
                      (b) Currently, the maximum fee is ₹1,51,000 per annum per
                      family for all research services combined.
                    </li>
                    <li>(c) This fee limit excludes statutory charges.</li>
                    <li>
                      (d) Fee limits do not apply to non-individual clients or
                      accredited investors.
                    </li>
                    <li>
                      (e) Fees may be charged in advance for a period not
                      exceeding one Year unless otherwise agreed.
                    </li>
                    <li>
                      (f) In case of premature termination, clients will receive
                      a refund of fees on a pro-rata basis for the unexpired
                      service period.
                    </li>
                    <li>
                      (g) Acceptable modes of payment include cheque, online
                      bank transfer, UPI, and other SEBI-approved methods. Cash
                      payments are strictly prohibited.
                    </li>
                    <li>
                      (h) Optionally, clients can use the Centralized Fee
                      Collection Mechanism (CeFCoM) managed by BSE Limited
                      (recognized RAASB) to make payments securely.
                    </li>
                    <h3 className="font-semibold text-neutral-900"> Conflict of Interest</h3>
                    <li>
                      (a) The RA strictly abides by SEBI and RAASB regulations
                      requiring timely disclosure and mitigation of any actual
                      or potential conflicts of interest.
                    </li>
                    <li>
                      (b) Clients will be promptly informed of any conflict that
                      may affect their research services.
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      {" "}
                      Prohibition of Guaranteed Returns
                    </h3>
                    <li>
                      (a) Any schemes involving assured, guaranteed, or fixed
                      returns are expressly prohibited by law and shall never be
                      offered by the RA.
                    </li>
                    <li>
                      (b) The RA does not guarantee profits, accuracy, or
                      risk-free investments through its research.
                    </li>
                    <h3 className="font-semibold text-neutral-900">Investor SAFETY REMINDERS</h3>
                    <h3 className="font-semibold text-neutral-900">
                      {" "}
                      Make all fee payments ONLY through:
                    </h3>
                    <li>(a) The official website of Eeda Damodara Rao.</li>
                    <li>(b) Direct bank account in the firm&apos;s name</li>
                    <li>
                      (c) CeFCoM link or SEBI-authorized payment methods like
                      valid UPI
                    </li>
                    <li>
                      (d) Never make payments to personal UPI IDs, unofficial
                      bank accounts, or through unverified third-party links.
                    </li>
                    <li>
                      If you have any doubt, contact our Compliance Officer
                      immediately:
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      {" "}
                      Security and Privacy Reminders
                    </h3>
                    <li>
                      (a) The RA will never request client&apos;s login credentials
                      or OTPs for trading/demat/bank accounts.
                    </li>
                    <li>
                      (b) Clients must never share such sensitive information
                      with anyone, including the RA.
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Optional Centralized Fee Collection Mechanism (CeFCoM)
                    </h3>
                    <li>
                      (a) CeFCoM helps investors direct payments securely to
                      legitimate SEBI-registered advisors.
                    </li>
                    <li>
                      (b) Enables investors to track payments made to research
                      analysts.
                    </li>
                    <li>
                      (c) Investors can request CeFCoM payment links directly
                      from registered Research Analysts and pay using authorized
                      channels.
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Protection Against Social Media Scams
                    </h3>
                    <h4 className="font-semibold text-neutral-900">
                      {" "}
                      Common Scam Tactics to Watch For:
                    </h4>
                    <li>
                      (a) Unsolicited Invitations: Beware of unsolicited
                      messages or links inviting you to WhatsApp groups offering
                      “VIP” trading tips or free courses.
                    </li>
                    <li>
                      (b) Fake Profiles: Scammers may create fraudulent
                      identities impersonating market experts or RA
                      representatives.
                    </li>
                    <li>
                      (c) Impersonations: Persons may masquerade as
                      SEBI-registered intermediaries, well-known CEOs, or public
                      figures.
                    </li>
                    <li>
                      (d) Fake Testimonials: Fraudulent groups show fabricated
                      success stories to lure investors into transferring funds
                      with false promises of high returns.
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Guidelines to Protect Yourself:
                    </h3>
                    <li>
                      (a) Engage only with SEBI-registered intermediaries whose
                      credentials are verified.
                    </li>
                    <li>
                      (b) Verify registration at SEBI’s official portal:
                      https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14
                    </li>
                    <li>
                      (c) Perform financial transactions only through official
                      trading apps of SEBI-registered intermediaries:
                      https://investor.sebi.gov.in/Investor-support.html
                    </li>
                    <li>
                      (d) Always communicate via authentic email addresses
                      provided on SEBI’s portal.
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Tips from the RA to Avoid Scams:
                    </h3>
                    <li>
                      1. Search the registered name of your RA on SEBI’s
                      official website.
                    </li>
                    <li>
                      2. Obtain RA’s official email/phone details from SEBI’s
                      listing.
                    </li>
                    <li>
                      3. Initiate communication using the official email only.
                    </li>
                    <li>
                      4. If you receive communication from an unrecognized or
                      personal email, disregard it as a potential scam.
                    </li>
                    <li>
                      5. Always pay after verifying details through SEBI check:
                      https://siportal.sebi.gov.in/intermediary/sebi-check and
                      to a @valid UPI-ID and through Centralized Fee Collection
                      Mechanism for Investment Advisers and Research Analysts
                      (CeFCoM).{" "}
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      SEBI again advises investors to exercise extreme caution:
                    </h3>
                    <li>
                      (1) Verify registration of entities before investing at:
                      https://www.sebi.gov.in/intermediaries.html{" "}
                    </li>
                    <li>
                      (2) Carry out transactions only through authentic trading
                      apps of SEBI-registered intermediaries after verification
                      at:
                      https://investor.sebi.gov.in/Investor-support.html{" "}
                    </li>
                    <li>
                      (3) Use “Validated UPI Handles” (“@valid” UPI IDs of
                      SEBI-registered investor-facing intermediaries) and the
                      “SEBI Check” platform by visiting
                      https://siportal.sebi.gov.in/intermediary/sebi-check or
                      through the Saarthi app, for secure investor payments
                      (refer Press Release No. 64/2025)
                    </li>
                    <li>
                      Cyber Crime Reporting Portal:
                      https://cybercrime.gov.in/{" "}
                    </li>
                    <li>
                      Report online financial fraud at the National Cybercrime
                      Helpline number 1930
                    </li>
                    <li>
                      Register Your Financial Fraud complaint:
                      https://cybercrime.gov.in/Webform/Accept.aspx{" "}
                    </li>
                    <li>
                      Cyber Crime Help:
                      https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx{" "}
                    </li>
                    <li>
                      Register Your Financial Fraud complaint:
                      https://cybercrime.gov.in/Webform/Accept.aspx{" "}
                    </li>
                    <li>
                      Cyber Crime Help:
                      https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx{" "}
                    </li>
                    <li>
                      Learning Video Gallery:
                      https://cybercrime.gov.in/Webform/video-category.aspx{" "}
                    </li>
                    <li>
                      For Investor charter, MITC, risk, disclosures, and
                      disclaimers, refund policy, t&c, Fraud Awareness, and
                      other, please visit our website: RAWEBSITE and read
                      everything to avoid any future conflict of interest.{" "}
                    </li>
                    <h3 className="font-semibold text-neutral-900">
                      Note: This requirement is in accordance with SEBI RA
                      regulations of 2014, aimed at protecting investor
                      interests. Any inaccuracies or discrepancies in retrieving
                      KYC from the KRA agency will result in an immediate
                      termination of Research Services, and you will be removed
                      from the group without prior notice.{" "}
                    </h3>
                    <li>Read SEBI Circular for more information: </li>
                    <li>
                      Verify registration at SEBI’s official portal:
                      https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14
                    </li>
                    <li>
                      MITC:
                      https://www.sebi.gov.in/legal/circulars/feb-2025/most-important-terms-and-conditions-mitc-for-research-analysts_91965.html{" "}
                    </li>
                    <li>
                      Investor Charter for Research Analysts:
                      https://www.sebi.gov.in/legal/circulars/jun-2025/investor-charter-for-research-analysts_94355.html
                    </li>
                    <li>
                      Guidelines for Research Analyst:
                      https://www.sebi.gov.in/legal/circulars/jan-2025/guidelines-for-research-analysts_90634.html
                    </li>
                  </ul>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-[#9BE749]"
            />
            <span>
              I have read and accept the <span className="font-semibold text-purple-500">Terms &amp; Conditions</span>, <span className="font-semibold text-purple-500">MITC</span> and the <span> </span>
               <span className="font-semibold text-purple-500">refund policy</span>.
            </span>
          </label>

          <BuyActions>
            <button
              type="button"
              onClick={onClose}
              className={buySecondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!agreed}
              onClick={() => setStep(2)}
              className={buyPrimaryButtonClass}
            >
              Accept &amp; continue
            </button>
          </BuyActions>
        </BuyFlowShell>
      )}

      {/* STEP 2: YOUR DETAILS */}
      {step === 2 && (
        <BuyFlowShell
          title="Complete Your Details"
          subtitle="These details are used for KYC, the service agreement and your invoice."
          step={2}
          planData={planData}
          onClose={onClose}
        >
          <BuyDetailsForm
            onBack={() => setStep(1)}
            onSuccess={(formData) => {
              // Attach planName to userDetails for downstream use
              setUserDetails({ ...formData, planName: planData?.planName });
              setStep(3);
            }}
          />
        </BuyFlowShell>
      )}

      {/* STEP 3: OTP VERIFICATION */}
      {step === 3 && (
        <BuyFlowShell
          title="Verify Your Email"
          subtitle="Enter the 6-digit code we emailed you to verify your details."
          step={3}
          planData={planData}
          onClose={onClose}
        >
          <BuyOtpForm
            email={userDetails?.email || ""}
            details={userDetails}
            onBack={() => setStep(2)}
            onSuccess={() => setStep(4)}
          />
        </BuyFlowShell>
      )}
    </>
  );
}
