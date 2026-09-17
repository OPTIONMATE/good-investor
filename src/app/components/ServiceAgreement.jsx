"use client";

import { useAuth } from "../context/AuthContext";

export default function ServiceAgreement({ serviceName, signingDate }) {
  const { user } = useAuth();

  // Fallbacks if user info is missing
  const clientName = user?.fullName || user?.name || "[Client Name]";
  const clientPAN = user?.panNumber || user?.pan || "[Client PAN]";
  const date = signingDate || new Date().toLocaleDateString("en-IN");
  const service = serviceName || "[Service Name]";

  return (
    <div className="agreement-text p-6 text-sm leading-relaxed">
      <h2 className="text-xl font-bold mb-4">SERVICE AGREEMENT</h2>
      <p>
        This Agreement (“Agreement”) is made and entered into as of{" "}
        <b>{date}</b> (the “Signing Date”)
      </p>
      <p>
        This Service Agreement (“Agreement”) is made between
        <br />
        Sasikumar Peyyala, having registered office at
        <br />
        1-2/4, 29/4, Kummaripalem center, Near DSM High School, Vidyadharapuram,
        Krishna, (hereinafter referred to as “Service Provider” or “RA”)
        <br />
        And
        <br />
        <b>{clientName}</b> with PAN Number: <b>{clientPAN}</b>, (hereinafter
        referred to as “User”)
      </p>
      <p>
        The Service Provider and the User are hereinafter individually referred
        to as a “Party” and collectively referred to as the “Parties”.
      </p>
      <hr className="my-4" />
      <div className="space-y-2">
        <p>
          <b>1. DEFINITIONS</b>
        </p>
        <p>
          a. “User”: Any individual who avails services after consenting to this
          agreement.
        </p>
        <p>
          b. “Service Provider”: A SEBI-registered Research Analyst (RA) with
          Registration Name: Sasikumar Peyyala and Registration Number:
          INH000019327
        </p>
        <p>
          <b>2. USER ELIGIBILITY AND REGISTRATION TERMS</b>
        </p>
        <p>
          a. Legal Competency: Only individuals who are legally competent to
          enter into contracts under applicable law are permitted to register
          and use the services.
        </p>
        <p>
          b. Minimum Age & KYC Compliance: The User affirms that they are at
          least 18 years of age and that all Know Your Customer (KYC) details
          submitted are accurate, current, and complete.
        </p>
        <p>
          c. Registration Requirements: Registration on the platform requires
          the submission of accurate personal and financial information,
          successful completion of KYC verification, and acceptance of these
          terms and conditions.
        </p>
        <p>
          d. Policy & Fee Modifications: Algotest and the Service Provider
          reserve the right to modify their operational policies and fee
          structures at any time. All such changes will be duly published and
          made accessible on the platform for the User’s reference.
        </p>
        <p>
          <b>3. AGREEMENT SCOPE</b>
        </p>
        <p>
          a. Nature of Services: The User desires to access non-exclusive,
          non-binding recommendations by a black-box algorithm designed by the
          Service Provider.
        </p>
        <p>
          b. Regulatory Compliance: The Service Provider is registered with the
          Securities and Exchange Board of India (SEBI) as a Research Analyst
          under Registration Number INH000019327, valid from 07-01-2025.
        </p>
        <p>
          c. Use and Risk Disclosure: The User understands that all investments
          are subject to market risks, and past performance is not indicative of
          future results. The Service Provider does not offer any guarantee on
          returns or assume responsibility for investment outcomes.
        </p>
        <p>
          <b>4. USER DECLARATIONS:</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            The User acknowledges that they understand the inherent risks
            involved in financial markets and make all investment decisions
            independently. The User agrees not to hold the Service Provider or
            the Algotest platform liable for any financial loss arising from
            such decisions.
          </li>
          <li>
            Any investments made based on research reports, signals, or
            automated trading systems are subject to market risks. The outputs
            provided do not guarantee returns or financial outcomes.
          </li>
          <li>
            The User waives any right to claim compensation for losses incurred
            on investments made based on the research service, insights,
            automated black box, automated white box algo systems or content
            provided by the Service Provider.
          </li>
          <li>
            Any reliance placed on the research content or reports is entirely
            at the discretion of the User. The User is solely responsible for
            evaluating the conclusions and insights shared.
          </li>
          <li>
            The User agrees to keep their contact details updated and shall not
            share the confidential research content, login credentials, or any
            access provided with third parties.
          </li>
          <li>
            In the event of suspension or regulatory action against the Service
            Provider by SEBI, any prepaid fees shall be refunded proportionately
            for the unutilized period of service.
          </li>
          <li>
            The User shall comply with all applicable laws, SEBI regulations,
            and the Algotest platform’s terms and conditions.
          </li>
          <li>
            The User agrees to disclose to the Service Provider any information
            related to family members (as defined by SEBI) who have availed or
            are availing services from the Service Provider during the current
            financial year.
          </li>
          <li>
            The Service Provider shall never ask for the User’s login
            credentials, OTPs, or access to Trading, Demat, or Bank accounts.
            The User shall never share such information with the Service
            Provider or authorize the Service Provider to execute trades on
            their behalf.
          </li>
          <li>
            In case of premature termination of services by either party, the
            User may seek a refund of proportionate fees for the remaining
            tenure, after deducting acquisition and statutory expenses incurred
            by the Service Provider.
          </li>
          <li>
            The User understands that SEBI registration, RAASB enlistment, or
            NISM certification of the Service Provider does not imply assurance
            of performance or guarantee of investment returns.
          </li>
        </ul>
        <p>
          <b>5. SERVICE PROVIDER DECLARATIONS</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            SEBI Registration: The Service Provider is duly registered with the
            Securities and Exchange Board of India (SEBI) as a Research Analyst
            pursuant to the SEBI (Research Analysts) Regulations, 2014.
          </li>
          <li>Registration Number: INH000019327</li>
          <li>Registration Date: 07-January-2025</li>
          <li>
            This registration is valid and subsisting as of the date of
            execution of this Agreement.
          </li>
          <li>
            Research-Based Signals Without Return Guarantee: The algorithms or
            signals provided by the Service Provider are generated through
            data-driven analysis and research methodologies. However, such
            insights do not constitute guaranteed recommendations and do not
            assure any specific returns.
          </li>
          <li>
            Fee Compliance and Advance Collection: The fees charged by the
            Service Provider shall be in accordance with the maximum limits
            prescribed by SEBI or the Research Analyst Administration and
            Supervisory Body (RAASB), as applicable. The Service Provider
            charges fees in advance as agreed by the User. This advance fee does
            not exceed the duration prescribed by SEBI regulations. In the event
            of premature termination of services, the User shall be entitled to
            a proportionate refund for the unexpired period, subject to
            deduction of reasonable acquisition costs and statutory liabilities
            incurred by the Service Provider.
          </li>
        </ul>
        <p>
          <b>6. SCOPE OF SERVICES</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            Access to Services: Research services, including algorithmic signals
            and related outputs, shall be provided exclusively to registered
            Users for the duration of their active subscription, and strictly
            through the Algotest platform.
          </li>
          <li>
            Binding Terms: By availing the services, Users agree to be bound by
            the Terms of Service available on the official website of Algotest.
            Terms of Service can be accessed at:{" "}
            <a
              href="https://algotest.in/tnc"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://algotest.in/tnc
            </a>
          </li>
        </ul>
        <p>
          <b>7. USER OBLIGATIONS</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            Sole Discretion in Use: The User may choose to act upon the
            algorithmic signals or research outputs at their sole discretion.
            The Service Provider or Algotest shall not be responsible for any
            consequences arising from such actions.
          </li>
          <li>
            Compliance Obligations: The User agrees to furnish any information
            or documentation reasonably requested by the Service Provider or
            Algotest for regulatory, compliance, or KYC purposes.
          </li>
          <li>
            Restriction on Redistribution: The User shall not copy, share,
            distribute, forward, reproduce, or transmit any part of the service
            content—including research reports, signals, analysis, or access
            credentials—through any medium without prior written authorization
            from the Service Provider and Algotest.
          </li>
          <li>
            Intellectual Property Rights: All trademarks, branding elements,
            research content, platform materials, and proprietary tools
            associated with Algotest and the Service Provider are legally
            protected. Any reproduction, use, or modification without expressing
            of written consent is strictly prohibited and may lead to legal
            action.
          </li>
        </ul>
        <p>
          <b>8. RISK DISCLOSURES</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            Market Risks Warning: “Investment in securities market are subject
            to market risks. Read all the related documents carefully before
            investing.”
          </li>
          <li>
            Loss Possibility: Market risks may result in partial or permanent
            loss of investments under certain market conditions.
          </li>
          <li>
            SEBI Registration: Registration granted by SEBI and certification
            from NISM do not guarantee the performance of the intermediary nor
            assure returns to investors.
          </li>
          <li>
            Past Performance: Past performance is not indicative of future
            results
          </li>
          <li>
            Risk Associated with Open Positions: Our recommendations may be
            open; we may not provide any stop-loss or target price in securities
            recommendations. This will cause a huge loss on your portfolio in
            adverse market conditions, company events or any event that may
            impact market movement.
          </li>
          <li>
            Technical Risk: Algorithmic trading systems depend on technology,
            including internet connectivity, server uptime, broker APIs, and
            third-party software. Any failure, delay, or malfunction in these
            components may result in unintended trades or losses.
          </li>
          <li>
            Operational Risk: There is a risk that the algorithm may not
            function as intended due to bugs, logic errors, incorrect parameter
            settings, or misinterpretation of market data. Manual intervention
            may be required at times, especially in extreme conditions.
          </li>
          <li>
            Regulatory and Broker Compliance: All users must ensure that their
            algorithmic activities comply with SEBI rules, exchange guidelines,
            and broker requirements. Unauthorised access, misuse of systems, or
            violation of margin norms can result in penalties or suspension.
          </li>
          <li>
            Discretion and Responsibility: Users must understand that executing
            trades based on signals or algorithms is at their own discretion. It
            is your responsibility to assess suitability based on your financial
            condition, risk tolerance, and trading knowledge.
          </li>
          <li>
            No Fiduciary Duty: The service provider does not act as a portfolio
            manager or fiduciary. The role is limited to providing tools,
            infrastructure, or signals, not managing client funds in any case.
          </li>
        </ul>
        <p>
          <b>9. DISCLAIMERS</b>
        </p>
        <ul className="list-disc ml-6">
          <li>Neither the Service Provider nor Algotest guarantees returns.</li>
          <li>
            Algotest is not responsible for accuracy of the content provided by
            Service Provider or the advices given outside of Algotest platform
          </li>
        </ul>
        <p>
          <b>10. GRIEVANCE REDRESSAL</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            Step 1: Email initial complaints to
            spkumar.researchanalyst@gmail.com
          </li>
          <li>
            Step 2: Escalate unresolved issues to
            spkumar.researchanalyst@gmail.com.
          </li>
          <li>
            Step 3: If unresolved, lodge with SEBI via SCORES
            (www.scores.sebi.gov.in) or Smart ODR (https://smartodr.in).
          </li>
          <li>
            All grievances will be addressed within 21 (twenty-one) business
            days or as per latest SEBI RA Regulations
          </li>
        </ul>
        <p>
          <b>11. FORCE MAJEURE CLAUSE</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            If the User's KYC (Know Your Customer) details are not available or
            registered with a KYC Registration Agency (KRA) at the time of
            subscribing to a Service Provider, the User will not be able to
            avail the services until the KYC is registered/approved by KRA
            agency.
          </li>
          <li>
            KYC verification with the relevant KRA is mandatory before
            subscribing to any service on Algotest.
          </li>
          <li>
            Users must ensure their KYC is successfully registered with a KRA
            before proceeding with any subscription
          </li>
          <li>
            Neither Service Provider nor Algotest will be liable for service
            disruptions due to force majeure events.
          </li>
          <li>
            The Service provider including its principals, partners, employees,
            affiliates, agents, representatives, and subcontractors, shall not
            be liable for losses or damages caused by or resulting from any
            event of force majeure beyond its control including, but not limited
            to, acts of civil or military authority, national emergencies, fire,
            flood, catastrophe, act of God, explosion, war, riot, theft,
            accident, nationalization, expropriation, currency restrictions,
            pandemic, lock-down imposed by governmental authorities, other
            measures taken by any government or agency of any country, state or
            territory in the world, actions taken by any regulatory authority
            regulating asset managers, amendments to Applicable Laws, industrial
            action or labour disturbances of any nature amongst employees of
            Service provider or of its agents or of any third parties, boycotts,
            work stoppages, power failures or breakdowns in communication links
            or equipment(including, but not limited to, loss of electronic
            data), international conflicts, violent or armed actions, acts of
            terrorism, insurrection, revolution, or failure or disruption of any
            relevant stock exchange, clearinghouse, clearing or settlement
            systems or market.
          </li>
          <li>
            In the event of equipment breakdowns beyond Service provider’s and
            Algotest’s control, the Service provider shall take reasonable steps
            to minimize service interruptions but shall have no liability with
            respect thereto.
          </li>
          <li>
            The Service provider also disclaim any liability for future
            consequences arising under the Prevention of Money Laundering Act,
            2002, or any analogous legislation, regulations, or rules.
          </li>
        </ul>
        <p>
          <b>12. SEVERABILITYS FINAL TERMS</b>
        </p>
        <ul className="list-disc ml-6">
          <li>
            If any part of the Agreement is held unenforceable, the remaining
            provisions will remain in effect.
          </li>
          <li>
            Key terms regarding tenure, jurisdiction, termination, and
            arbitration are defined in Appendix 1.
          </li>
          <li>
            The User acknowledges that they have reviewed and understood these
            description as provided by the Service provider of subscription.
          </li>
          <li>
            Any changes or updates to the subscription description by the
            Service provider shall be communicated to the User and shall become
            part of this agreement.
          </li>
        </ul>
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mt-4 mb-2">ANNEXURE - I</h3>
        <p>
          This Agreement shall be effective as of <b>{date}</b> (the “Effective
          Date”).
        </p>
        <ul className="list-disc ml-6">
          <li>
            <b>Acceptance:</b> This Agreement shall be deemed accepted by the
            User upon acknowledgement or signature. However, the Agreement shall
            not become operational until the User has completed both the payment
            and KYC (Know Your Customer) process.
          </li>
          <li>
            <b>Pre-Service Period:</b> If the User accepts this Agreement but
            does not complete the subscription purchase (including payment and
            KYC), the Agreement shall remain valid for a period of thirty (30)
            calendar days from the date of acceptance and User fulfill the
            payment and KYC requirements within this period, the Agreement shall
            be activated and the start and end dates of the services will be
            communicated to the User via email or other written communication.
          </li>
          <li>
            <b>Service Activation:</b> The service period will commence only
            upon successful completion of payment and KYC. The activation date
            shall be the date on which both conditions are fulfilled. The end
            date of the services will be calculated based on the agreed service
            duration from the activation date. These dates shall be officially
            communicated to the User and shall form an integral part of this
            Agreement.
          </li>
          <li>
            <b>Expiry:</b> If the payment and KYC are not completed within the
            thirty (30) day window, the Agreement shall automatically expire,
            and neither party shall hold any rights or obligations under this
            Agreement unless a new agreement is executed.
          </li>
          <li>
            <b>Fees:</b> The User agrees to pay the Service Provider the
            applicable fees for the services, including any statutory taxes or
            levies. The payments shall be made through the designated payment
            gateways or processors as specified by Algotest. The Research
            Analyst (RA) shall collect the total fee from the User. The fee will
            be processed through Algotest’s configured payment gateway, which
            will split the payment—allocating the advisory fee to the RA and the
            facilitation/delivery charges to Algotest.
          </li>
          <li>
            <b>Arbitration:</b> The Parties agree to act in good faith to
            resolve any disputes or differences arising under or related to this
            Agreement through mutual discussion. If disputes remain unresolved,
            they shall be submitted to arbitration per SEBI’s grievance
            redressal mechanism, if applicable. In cases beyond SEBI's
            jurisdiction, arbitration will be conducted as per the Arbitration
            and Conciliation Act, 1996, including amendments thereto.
          </li>
          <li>
            <b>Governing Law and Jurisdiction:</b> This Agreement shall be
            governed and interpreted in accordance with the laws of India. The
            Parties agree to submit to the exclusive jurisdiction of the courts
            of Andhra Pradesh for any legal proceedings
          </li>
          <li>
            <b>Service Identification:</b> This Agreement specifically pertains
            to the service titled ‘<b>{service}</b> as displayed on Algotest’,
            hereinafter referred to as ‘the Service’.
          </li>
          <li>
            The Service is being provided by Sasikumar Peyyala (hereinafter
            referred to as ‘the Service Provider’) and purchased by the User.
            This clause ensures clarity by explicitly stating that the Agreement
            applies only to the above-mentioned service among the various
            offerings by the Service Provider.
          </li>
          <li>
            <b>Termination Process and Refund Timeline:</b> The User shall be
            eligible for a pro-rata refund as per the refund clause. Any
            eligible refund shall be processed by the Service Provider within 15
            business days from the date of confirmation of termination. Access
            to subscription services shall cease at the end of the notice
            period. Refunds will be applicable only to the advisory fee
            component; delivery and facilitation charges are non-refundable,
            being costs already incurred for service activation.
          </li>
          <li>
            <b>Subscription Description:</b> The subscription availed by the
            User is governed by the description and scope provided by the
            Service Provider. This includes features, limitations, and specific
            deliverables associated with the subscription and is hereby
            incorporated into this Agreement by reference. The Service Provider
            reserves the right to revise or update the subscription description
            due to changes in scope, structure, or regulatory compliance. Users
            will be notified of such changes via their registered email.
            Continued use of the services for more than 7 days post-notification
            shall be considered acceptance of the new terms. If the User
            disagrees, they may opt to discontinue and seek a proportionate
            refund in line with the refund policy.
          </li>
          <li>
            <b>Subscription Details and Service Selection:</b> The final
            combination of services, mentorship arrangements, and related
            subscription specifics shall be selected by the User at the time of
            payment, not at the time of executing the Most Important Terms and
            Conditions (MITC). MITC execution is done at the subscription level
            and does not imply finalization of service combinations. The exact
            subscription start and end dates will be confirmed and communicated
            via email upon activation and shall be considered a binding part of
            this Agreement.
          </li>
        </ul>
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mt-4 mb-2">
          MOST IMPORTANT TERMS AND CONDITIONS (MITC)
        </h3>
        <ul className="list-disc ml-6">
          <li>
            These terms and conditions, and consent thereon, are for the
            research services provided by the Research Analyst (RA) and RA
            cannot execute/carry out any trade (purchase/sell transaction) on
            behalf of, the client. Thus, the clients are advised not to permit
            RA to execute any trade on their behalf.
          </li>
          <li>
            The fee charged by RA to the client will be subject to the maximum
            of amount prescribed by SEBI/ Research Analyst Administration and
            Supervisory Body (RAASB) from time to time (applicable only for
            Individual and HUF Clients).
          </li>
          <li>
            The current fee limit is Rs 1,51,000/- per annum per family of
            client for all research services of the RA. The fee limit does not
            include statutory charges. The fee limits do not apply to a
            non-individual client / accredited investor.
          </li>
          <li>
            RA may charge fees in advance if agreed by the client. Such advance
            shall not exceed the period stipulated by SEBI; presently it is one
            quarter. In case of pre-mature termination of the RA services by
            either the client or the RA, the client shall be entitled to seek
            refund of proportionate fees only for unexpired period.
          </li>
          <li>
            Fees to RA may be paid by the client through any of the specified
            modes like cheque, online bank transfer, UPI, etc. Cash payment is
            not allowed. Optionally the client can make payments through
            Centralized Fee Collection Mechanism (CeFCoM) managed by BSE Limited
            (i.e. currently recognized RAASB).
          </li>
          <li>
            The RA is required to abide by the applicable regulations/
            circulars/ directions specified by SEBI and RAASB from time to time
            in relation to disclosure and mitigation of any actual or potential
            conflict of interest. The RA will endeavor to promptly inform the
            client of any conflict of interest that may affect the services
            being rendered to the client.
          </li>
          <li>
            Any assured/guaranteed/fixed returns schemes or any other schemes of
            similar nature are prohibited by law. No scheme of this nature shall
            be offered to the client by the RA.
          </li>
          <li>
            The RA cannot guarantee returns, profits, accuracy, or risk-free
            investments from the use of the RA’s research services. All
            opinions, projections, estimates of the RA are based on the analysis
            of available data under certain assumptions as of the date of
            preparation/publication of research report.
          </li>
          <li>
            Any investment made based on recommendations in research reports are
            subject to market risks, and recommendations do not provide any
            assurance of returns. There is no recourse to claim any losses
            incurred on the investments made based on the recommendations in the
            research report. Any reliance placed on the research report provided
            by the RA shall be as per the client’s own judgement and assessment
            of the conclusions contained in the research report.
          </li>
          <li>
            The SEBI registration, Enlistment with RAASB, and NISM certification
            do not guarantee the performance of the RA or assure any returns to
            the client.
          </li>
          <li>
            For any grievances, Step 1: the client should first contact the RA
            using the details on its website or following contact details: (RA
            to provide details as per ‘Grievance Redressal / Escalation
            Matrix’). Step 2: If the resolution is unsatisfactory, the client
            can also lodge grievances through SEBI’s SCORES platform at
            www.scores.sebi.gov.in. Step 3: The client may also consider the
            Online Dispute Resolution (ODR) through the Smart ODR portal at
            https://smartodr.in
          </li>
          <li>
            Clients are required to keep contact details, including email id and
            mobile number/s updated with the RA at all times.
          </li>
          <li>
            The RA shall never ask for the client’s login credentials and OTPs
            for the client’s Trading Account Demat Account and Bank Account.
            Never share such information with anyone including RA
          </li>
        </ul>
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mt-4 mb-2">Investor Charter</h3>
        <p>
          For investor charter please visit :{" "}
          <a
            href="www.trademilaan.in/investor-charter"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.trademilaan.in/investor-charter
          </a>
        </p>
      </div>
    </div>
  );
}
