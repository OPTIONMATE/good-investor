import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { computeFinalServiceDate } from "./planValidity";
import { getRASignatureJpegBuffer } from "./raSignature";

function formatSignedDateDisplay(input) {
  if (input === undefined || input === null || input === "") {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) {
    return String(input);
  }
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export async function generateCompleteAgreementPDF(agreementData) {
  try {
    const clientName = agreementData.clientName || "CLIENT NAME";
    const clientPan = agreementData.clientPan || "NOT_PROVIDED";
    /** "Signed by:" shows legal/KYC name — not text typed on the signature pad */
    const signedByDisplayName = (clientName || "").trim() || "Signatory";
    const signedDateDisplay = formatSignedDateDisplay(
      agreementData.signedTimestamp ?? agreementData.signedDate,
    );
    const signatureData = agreementData.signatureData || "";

    // --- PLAN DATES LOGIC ---
    // agreementData.planType (e.g. 'monthly'), agreementData.planDuration (days), agreementData.planStartDate (ISO or Date)
    // The AGREEMENT is a renderer, not the source of truth: planDuration must
    // come from the purchased snapshot (Payment.planDuration /
    // SignedAgreement.signedPlanDuration), which the caller resolves first.
    // The type->days mapping below is a legacy fallback ONLY for records that
    // predate the snapshot fields AND have no stored planEndDate — never
    // recalculate an old agreement from the current Plan configuration, and
    // never override a stored end date with a recomputed one.
    let planType = agreementData.planType || "monthly";
    let planDuration = Number(agreementData.planDuration);
    if (!Number.isInteger(planDuration) || planDuration <= 0) {
      planDuration = undefined;
    }
    // If not provided AND no stored end date exists, fallback to common durations
    const hasStoredPlanEndDate =
      agreementData.planEndDate !== undefined &&
      agreementData.planEndDate !== null &&
      agreementData.planEndDate !== "";
    if (!planDuration && !hasStoredPlanEndDate) {
      switch (planType) {
        case "weekly":
          planDuration = 7;
          break;
        case "monthly":
          planDuration = 30;
          break;
        case "quarterly":
          planDuration = 90;
          break;
        case "halfYearly":
          planDuration = 182;
          break;
        case "yearly":
          planDuration = 365;
          break;
        default:
          planDuration = 30;
      }
    }
    let planStartDate = agreementData.planStartDate
      ? new Date(agreementData.planStartDate)
      : new Date();
    // Reconstruct a missing end date with the inclusive calendar-day rule:
    // end = start + (duration - 1) days. A stored planEndDate is used as-is.
    let planEndDate = agreementData.planEndDate
      ? new Date(agreementData.planEndDate)
      : Number.isInteger(planDuration) && planDuration > 0
        ? computeFinalServiceDate(planStartDate, planDuration)
        : new Date(planStartDate);
    if (Number.isNaN(planEndDate.getTime())) {
      planEndDate = Number.isInteger(planDuration) && planDuration > 0
        ? computeFinalServiceDate(planStartDate, planDuration)
        : new Date(planStartDate);
    }
    // Format as DD/MM/YYYY. Missing/invalid dates render blank — the PDF must
    // never fabricate historical agreement dates.
    function formatDate(d) {
      if (d === undefined || d === null || d === "") return "";
      const parsed = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(parsed.getTime())) return "";
      return `${parsed.getDate()}/${parsed.getMonth() + 1}/${parsed.getFullYear()}`;
    }
    const agreementStartDateDisplay = formatDate(planStartDate);
    const agreementEndDateDisplay = formatDate(planEndDate);

    const raName = "Eeda Damodara Rao"; // agreementData.raName || "RA NAME";

    let raNumber = "INH000024967";
    /** Constant RA / firm identifiers (not per-user) */
    const raRegistrationDate = "07-January-2025";

    const bseEnlistment = agreementData.bseEnlistment || "6469";
    const raWebsite = "trademilaan";

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    if (!font || !fontBold) {
      throw new Error("Failed to load required fonts for PDF generation.");
    }
    let currentPage = pdfDoc.addPage([595, 842]); // A4 size
    const pageHeight = 842;
    const pageWidth = 595;
    const margin = 50;
    const textWidth = pageWidth - 2 * margin;
    let yPosition = pageHeight - margin;

    const drawHeader = (page) => {
      const headerFontSize = 18;
      const subFontSize = 14;
      const infoFontSize = 12;
      const blue = rgb(0.38, 0.67, 0.87); // #61b3de
      let y = pageHeight - 40;

      const raNameText = ` ${raName} `;
      const raNameWidth = fontBold.widthOfTextAtSize(
        raNameText,
        headerFontSize,
      );
      page.drawText(raNameText, {
        x: (pageWidth - raNameWidth) / 2,
        y,
        size: headerFontSize,
        font: fontBold,
        color: blue,
      });
      y -= headerFontSize + 2;

      const raNumberText = `${raNumber}`;
      const raNumberWidth = fontBold.widthOfTextAtSize(
        raNumberText,
        subFontSize,
      );
      page.drawText(raNumberText, {
        x: (pageWidth - raNumberWidth) / 2,
        y,
        size: subFontSize,
        font: fontBold,
        color: blue,
      });
      y -= subFontSize + 2;

      const raTitle = "Research Analyst";
      const raTitleWidth = fontBold.widthOfTextAtSize(raTitle, subFontSize);
      page.drawText(raTitle, {
        x: (pageWidth - raTitleWidth) / 2,
        y,
        size: subFontSize,
        font: fontBold,
        color: blue,
      });
      y -= subFontSize + 2;

      const bseText = `BSE Enlistment No.: ${bseEnlistment}`;
      const bseWidth = font.widthOfTextAtSize(bseText, infoFontSize);
      page.drawText(bseText, {
        x: (pageWidth - bseWidth) / 2,
        y,
        size: infoFontSize,
        font: font,
        color: blue,
      });
      y -= infoFontSize + 2;

      const tradeText = `Trade Name: ${raWebsite}`;
      const tradeWidth = font.widthOfTextAtSize(tradeText, infoFontSize);
      page.drawText(tradeText, {
        x: (pageWidth - tradeWidth) / 2,
        y,
        size: infoFontSize,
        font: font,
        color: blue,
      });
      y -= infoFontSize + 2;
      // Draw a line below header
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        color: rgb(0.4, 0.4, 0.4),
        thickness: 1,
      });

      yPosition = y - 28;
    };

    const addNewPage = () => {
      currentPage = pdfDoc.addPage([595, 842]);
      drawHeader(currentPage);

      let y = pageHeight - 40;
      y -= 18 + 2;
      y -= 14 + 2;
      y -= 14 + 2;
      y -= 12 + 2;
      y -= 12 + 2;
      y -= 8;
      yPosition = y;
    };

    drawHeader(currentPage);

    const drawWrappedText = (
      text,
      fontSize = 11,
      indent = 0,
      bold = false,
      lineSpacing = 4,
    ) => {
      const words = text.split(" ");
      let line = "";
      let x = margin + indent;
      let fontObj = bold ? fontBold : font;
      if (!fontObj) {
        throw new Error(
          "Font object is undefined in drawWrappedText. Check font loading.",
        );
      }
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        let width = fontObj.widthOfTextAtSize(testLine, fontSize);
        if (x + width > pageWidth - margin) {
          if (yPosition < margin + fontSize + 10) addNewPage();
          currentPage.drawText(line.trim(), {
            x,
            y: yPosition,
            size: fontSize,
            font: fontObj,
            color: rgb(0, 0, 0),
          });
          yPosition -= fontSize + lineSpacing;
          line = words[i] + " ";
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        if (yPosition < margin + fontSize + 10) addNewPage();
        currentPage.drawText(line.trim(), {
          x,
          y: yPosition,
          size: fontSize,
          font: fontObj,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize + lineSpacing;
      }
    };

    // Helper: Draw section heading
    const drawSectionHeading = (text, fontSize = 13, center = false) => {
      if (yPosition < margin + fontSize + 20) addNewPage();
      yPosition -= 8;
      if (center) {
        // Center align heading
        const width = fontBold.widthOfTextAtSize(text, fontSize);
        currentPage.drawText(text, {
          x: (pageWidth - width) / 2,
          y: yPosition,
          size: fontSize,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize + 2;
      } else {
        drawWrappedText(text, fontSize, 0, true, 6);
        yPosition -= 2;
      }
    };

    const drawList = (items, fontSize = 11, bullet = "•", indent = 18) => {
      for (let i = 0; i < items.length; i++) {
        let prefix = typeof bullet === "string" ? bullet : `${i + 1}.`;
        drawWrappedText(`${prefix} ${items[i]}`, fontSize, indent, false, 2);
      }
      yPosition -= 2;
    };

    const addSpace = (amount = 10) => {
      yPosition -= amount;
      if (yPosition < margin + 20) addNewPage();
    };

    // --- AGREEMENT PERIOD SECTION ---
    drawSectionHeading("Service Agreement Period", 16, true);
    drawWrappedText(
      `This agreement is valid for the selected plan period.`,
      11,
    );
    drawWrappedText(`Start Date: ${agreementStartDateDisplay}`, 11);
    drawWrappedText(`End Date: ${agreementEndDateDisplay}`, 11);
    addSpace(10);

    drawSectionHeading("Terms of Service(TOS) or Client Consent", 18, true);

    drawSectionHeading("1. DEFINITIONS");

    drawWrappedText(
      `(a) Owner/ We/ US/ Our: Refers to ${raName}, the SEBI-registered Research Analyst entity providing research and advisory services, including its employees and affiliates.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) User / Client / You / Your: Any individual or legal entity subscribing to or using the research services provided by ${raName}`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Parties: Collectively refers to ${raName} and the User/Client.`,
      11,
      0,
      false,
      2,
    );
    addSpace(8);

    drawSectionHeading("2. Assent & Acceptance");

    drawWrappedText(
      "(a) By subscribing to or utilizing the research services, you confirm that you have read, understood, and agreed to these Terms of Service (TOS).",
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) If you do not agree with these terms, you should not avail the services and may seek a refund immediately if applicable.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Access to research services is granted only upon acceptance of these Terms and any additional relevant terms associated with specific services.`,
      11,
      0,
      false,
      2,
    );
    addSpace(8);

    drawSectionHeading("3. Service Subscription and Obligations");

    drawWrappedText(
      `(a)Subscription Confirmation: By accepting the research services from ${raName}, you acknowledge voluntary subscription and acceptance of the terms complying with SEBI (Research Analyst) Regulations, 2014.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b).Regulatory Compliance: Both the Client and ${raName} must comply with all applicable SEBI laws, RA Regulations, and government notifications as amended from time to time.`,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    drawSectionHeading("Research Report Terms & Conditions");

    drawWrappedText(
      "(a) The recommendations provided in this report are based on publicly available information we believe to be reliable and accurate at the time of publication.",
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Unless otherwise stated, our recommendations are intended for a 12-month investment horizon. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Ratings provided are based on absolute returns (positive or negative) and should be interpreted accordingly. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(d) Security prices may fluctuate due to market volatility or company-specific events, and returns may vary dramatically over time. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(e) We reserve the right to revise or withdraw ratings due to reassessment of valuation, market events, or lack of clarity.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(f) Opinions expressed are subject to change without notice, and we are under no obligation to inform clients of such changes.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(g) Clients are advised to carefully assess market risks, including the possibility of partial or permanent capital loss.  `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(h) There is absolutely no scope for refunding losses incurred from acting on any research report or commentary.  `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(i) While pro-rata refunds may be considered for subscriptions due to dissatisfaction, these are not tied to investment outcomes.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(j) ${raName}, along with its partners, employees, officers, and affiliates, expressly disclaims any liability for loss or damages arising from unintentional errors or omissions in any information or recommendations contained in the research reports. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(k) All reports, including third-party reports, are carefully reviewed prior to dissemination to ensure accuracy and to avoid misleading statements. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(l) A daily closing chart of securities is available at NSE: https://charting.nseindia.com/ and BSE: https://charting.bseindia.com/  `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(m) The view on securities is based on both technical and fundamental analysis. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(n) ${raName} adheres strictly to SEBI (Research Analyst) Regulations, 2014, and does not offer investment advisory or PMS (Portfolio Management Services).  `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(o) All participants must follow the instructions provided during our group calls. We do not offer any one-on-one investment or trading services, as this is against RA regulations. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(p) Please note that personal queries related to group calls will not be entertained. Members are responsible for their own profits and losses. `,
      11,
      0,
      false,
      2,
    );
    addSpace(8);
    // 5. SERVICE PROVIDER DECLARATIONS
    drawSectionHeading("4. Client Information & KYC");
    // Render as plain paragraphs, not a list
    drawWrappedText(
      `(a) Clients must provide complete and accurate personal and financial details as required by ${raName} standard KYC format.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Supporting documentation as per SEBI and RAASB guidelines must be submitted and will be verified with the KYC Registration Agency (KRA) regularly.`,
      11,
      0,
      false,
      2,
    );
    addSpace(8);

    // 6. SCOPE OF SERVICES
    drawSectionHeading("5. Standard Terms of Service & Client Consent");
    drawWrappedText(
      "(a).  I / We have read and understood the provisions of the SEBI (Research Analyst) Regulations, 2014.",
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b). I / We have subscribed to the research service for personal use only and will exercise independent judgment before relying on the report's conclusions.`,
      11,
      0,
      false,
      2,
    );
    addSpace(8);
    drawSectionHeading(
      "Awareness of the following risk factors and disclaimers:",
    );
    drawWrappedText(
      "(a). “Investment in securities market are subject to market risks. Read all the related documents carefully before investing.”",
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Holding open positions without stop-loss or target prices can lead to significant losses; clients should exit such positions if a 20% loss threshold is reached.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Market conditions can cause partial or total loss of invested capital.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(d) “Registration granted by SEBI and certification from NISM do not guarantee the performance of the intermediary nor assure returns to investors.”`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(e) Past performance is not indicative of future results.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(f) There is no guarantee of returns on recommendations.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(g) No claims or compensation can be made for losses arising from acting on research recommendations.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(h) Strictly follow our group/platform instructions; no specific and separate instructions based on personal queries. `,
      11,
      0,
      false,
      2,
    );
    addSpace(8);

    drawSectionHeading(`6. Disclosures by ${raName}`);
    drawWrappedText(`(a) SEBI Registration Name: ${raName} `, 11, 0, false, 2);
    drawWrappedText(
      `(b) SEBI Registration Number: ${raNumber} `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(`(c) Registration Date: Jan 07, 2025  `, 11, 0, false, 2);
    drawWrappedText(
      `(d) Trade Name or Website: trademilaan (Note: Official ${raName} Website) `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(f) Maximum fee charged: Rs.1.51 Lakhs plus GST per annum (from Individual clients, not applicable to non-individual clients as per current SEBI RA regulations) `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(g) No assurance or guarantee of return is provided on research recommendations. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(h) The Research Analyst declares no conflict of interest and no other professional businesses adversely affecting independence. `,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    // 8. DISCLAIMERS
    drawSectionHeading("7. Payment Terms");
    drawWrappedText(
      `(a) Fees for services must be paid promptly using the authorized modes and channels prescribed by ${raName}. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Accepted payment methods and details are available on the official website. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Clients requesting service termination and refunds will be eligible for pro-rata refunds as per SEBI guidelines and ${raName}'s Refund Policy. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(d) If you engage with such unauthorized persons, including our employees or associates, or accept return guarantees without officially informing the company, the company will not be liable for any resulting losses or liabilities. `,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    drawSectionHeading("8. Risk Factors");
    drawWrappedText(
      `(a) Investments carry inherent market, financial, operational, regulatory, litigation, and credit risks, among others. Detailed examples include fluctuations in market conditions, changes in laws, cyber risks, supply chain issues, and legal disputes. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Market Risk Warning: Investment in securities markets is subject to market risks. Read all related documents carefully before investing.(b) Market Risk Warning: Investment in securities markets is subject to market risks. Read all related documents carefully before investing. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Open Positions Risk: Positions without specified stop-loss or target levels are riskier with significantly higher loss potential. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(d) Futures & Options Risks: High risk involved; suitable only for investors with appropriate risk appetite. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(e) “Registration granted by SEBI, membership of a SEBI recognized supervisory body (if any), and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.”. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(f) There is no recourse or right to claim compensation for losses arising from investment decisions based on research recommendations/calls. `,
      11,
      0,
      false,
      2,
    );

    drawSectionHeading("9. Additional Warnings and Disclaimers");
    drawWrappedText(
      `(a) No warranties or guarantees are made regarding the accuracy, results, or reliability of research, including on social media platforms. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) AI and Algo Tools are used occasionally, supporting fundamental and technical analysis; risks include data bias, system failures, and security breaches, which can cause Investments or Portfolio loss. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Client confidentiality and data security are strictly maintained. `,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    drawSectionHeading("10. Conflict of Interest and Compliance");
    drawWrappedText(
      `(a) ${raName} fully complies with SEBI’s disclosure and conflict of interest policies. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) There are no conflicts, financial interests, or compensation arrangements from subject companies influencing research reports. `,
      11,
      0,
      false,
      2,
    );

    addSpace(8);
    // 12. SEVERABILITY & FINAL TERMS
    drawSectionHeading("11. Model Portfolio");
    drawWrappedText(
      `(a) When applicable, model portfolios will be recommended in strict adherence to SEBI guidelines, but should be used for informational purposes only. `,
      11,
      0,
      false,
      2,
    );
    addSpace(8);
    drawSectionHeading("12. Client-Level Segregation");
    drawWrappedText(
      `(a) Existing clients cannot receive both research and distribution services from the same group/family. `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) New clients must select only one service at onboarding, either research or distribution. `,
      11,
      0,
      false,
      2,
    );
    addSpace(8);
    drawSectionHeading("13. Grievance Redressal");
    drawWrappedText(
      `(a) Clients should report issues such as non-receipt or deficiencies in reports to the designated personnel:`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(`Name: ${raName} `, 11, 0, false, 2);
    drawWrappedText(
      `Email: damu.researchanalyst@gmail.com `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(`Phone: +91 97046 48777 `, 11, 0, false, 2);
    drawWrappedText(
      `Complaints will be addressed within 7 business days or as per SEBI timelines. Unresolved complaints can be escalated to SEBI through:`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `SEBI SCORES: https://scores.sebi.gov.in/ `,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(`SEBI ODR: https://smartodr.in/`, 11, 0, false, 2);
    drawWrappedText(
      `SEBI Toll-Free: 1800 22 7575 or 1800 266 7575`,
      11,
      0,
      false,
      2,
    );
    addSpace(8);
    drawSectionHeading("14. Service Suspension & Termination");
    drawWrappedText(
      `${raName} reserves the right to suspend or terminate service with or without notice in case of:`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(a) Violation of TOS (Terms and Conditions)`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(`(b) Regulatory direction`, 11, 0, false, 2);
    drawWrappedText(`(c) Non-payment beyond grace periods`, 11, 0, false, 2);
    drawWrappedText(
      `Refunds on termination or registration suspension will be made on a pro-rata basis as per applicable SEBI regulations.`,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    drawSectionHeading("15. Jurisdiction and Governing Law");
    drawWrappedText(
      `(a) These Terms of Service are governed by Indian law, specifically SEBI regulations.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Any disputes will be subject to the exclusive jurisdiction of courts located in HYDERABAD, TELANGANA.`,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    // MITC
    drawSectionHeading("16. Amendments");
    drawWrappedText(
      `(a) The Owner may update or modify these Terms in accordance with SEBI regulations.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(b) Material changes will be notified on the website or via email.`,
      11,
      0,
      false,
      2,
    );
    drawWrappedText(
      `(c) Continued use of services signifies acceptance of updated terms.`,
      11,
      0,
      false,
      2,
    );

    addSpace(8);

    drawSectionHeading("17. Indemnification");
    drawWrappedText(
      `(a) You agree to indemnify and hold harmless ${raName}, its officers, and employees against all claims arising from your breach of these Terms or misuse of the service.`,
    );
    addSpace(8);
    drawSectionHeading(
      "18. Residency and Tax Status Confirmation - FATCA Declaration:",
    );
    drawWrappedText("I am a resident of India.");
    drawWrappedText("I am NOT a politically exposed person.");
    drawWrappedText("I am a tax resident of India.");
    drawWrappedText(
      "Any changes in residency, tax status, or political circumstances must be updated promptly—usually within 30 days. ",
    );
    drawWrappedText(
      "The client bears full responsibility for any misrepresentation. ",
    );
    drawWrappedText(
      "Data will be disclosed to the authorized Indian authorities upon request to ensure compliance.",
    );

    addSpace(8);
    drawSectionHeading("19. Customer Due Diligence (CDD)");
    addSpace(8);
    drawWrappedText(
      "Customer Due Diligence (CDD) Procedure as per SEBI Guidelines",
    );
    drawSectionHeading("Key Features of the SEBI CDD Procedure");
    drawWrappedText(
      "Identification and verification of the client and beneficial owner through prescribed KYC documents at the onset of any account-based relationship or for transactions exceeding Rs.50,000.",
    );
    drawWrappedText(
      "Gathering information regarding the purpose and intended nature of the business relationship from the client.",
    );
    drawWrappedText(
      "Assessing the client's business, ownership structure, and control patterns to evaluate risk.",
    );
    drawWrappedText(
      "Special due diligence (Enhanced Due Diligence - EDD) is required for clients belonging to special categories (CSC), which include non-residents, politically exposed persons (PEPs), high-net-worth individuals, trusts, NGOs, and clients from high-risk jurisdictions.",
    );
    drawWrappedText(
      "Ongoing monitoring of transactions throughout the relationship to ensure alignment with the client's profile, source of funds, and risk rating.",
    );
    drawWrappedText(
      "Reliance on third parties for CDD is allowed if they are regulated, supervised, and adhere to AML/CFT regulations, along with maintaining proper records and transparency.",
    );
    drawWrappedText(
      "Anonymous or fictitious accounts are prohibited; continuous updates of KYC information are essential.",
    );
    drawWrappedText(
      "Digital KYC processes have been implemented, including in-person verification via video and electronic Aadhaar authentication, to facilitate seamless client onboarding.",
    );

    addSpace(8);
    drawSectionHeading("Important Note");
    drawWrappedText(
      "According to the Research Analyst Regulations, there are certain restrictions on collecting client data, such as investment amounts, goals, liabilities, and more, as these fall under the jurisdiction of the Investment Adviser Regulation. ",
    );
    drawWrappedText(
      "To protect everyone's best interests, we will maintain a record of each client's KYC for future reference and report any suspicious activities to the Financial Intelligence Unit (FIU).",
    );

    addSpace(8);
    drawSectionHeading("20. Money Laundering Reporting Officer (MLRO)");
    drawWrappedText(`Name: ${raName}`);
    drawWrappedText("Phone: +91 97046 48777");
    drawWrappedText("Mail: damu.researchanalyst@gmail.com");
    addSpace(8);
    drawSectionHeading("21. Additional Information");
    drawWrappedText(
      "(a) Full terms, disclaimers, disclosures, investor charters, MITC, refund policies, and regulatory disclosures are available on the official website: trademilaan ",
    );
    addSpace(8);
    drawSectionHeading("Most Important Terms and Conditions (MITC)");
    drawWrappedText(`Applicable to Research Services by ${raName}`);
    drawWrappedText(`SEBI Registration Number: ${raNumber}`);
    addSpace(8);
    drawSectionHeading("Non-Execution of Trades");
    drawWrappedText(
      `(a) ${raName} does not execute or carry out any purchase or sell transactions on behalf of clients.`,
    );
    drawWrappedText(
      "(b) Clients are strictly advised NOT to permit the Research Analyst (RA) or its representatives to execute trades on their behalf.",
    );
    addSpace(8);
    drawSectionHeading("Fee Limits and Payment Terms");
    drawWrappedText(
      "(a) Fees charged to individual and Hindu Undivided Family (HUF) clients shall not exceed the limits prescribed by SEBI/RAASB.",
    );
    drawWrappedText(
      "(b) Currently, the maximum fee is Rs.1,51,000 per annum per family for all research services combined.",
    );
    drawWrappedText("(c) This fee limit excludes statutory charges.");
    drawWrappedText(
      "(d) Fee limits do not apply to non-individual clients or accredited investors.",
    );
    drawWrappedText(
      "(e) Fees may be charged in advance for a period not exceeding one Year unless otherwise agreed.",
    );
    drawWrappedText(
      "(f) In case of premature termination, clients will receive a refund of fees on a pro-rata basis for the unexpired service period.",
    );
    drawWrappedText(
      "(g) Acceptable modes of payment include cheque, online bank transfer, UPI, and other SEBI-approved methods. Cash payments are strictly prohibited.",
    );
    drawWrappedText(
      "(h) Optionally, clients can use the Centralized Fee Collection Mechanism (CeFCoM) managed by BSE Limited (recognized RAASB) to make payments securely.",
    );
    addSpace(8);
    drawSectionHeading("Conflict of Interest");
    drawWrappedText(
      "(a) The RA strictly abides by SEBI and RAASB regulations requiring timely disclosure and mitigation of any actual or potential conflicts of interest.",
    );
    drawWrappedText(
      "(b) Clients will be promptly informed of any conflict that may affect their research services.",
    );
    addSpace(8);
    drawSectionHeading("Prohibition of Guaranteed Returns");
    drawWrappedText(
      "(a) Any schemes involving assured, guaranteed, or fixed returns are expressly prohibited by law and shall never be offered by the RA.",
    );
    drawWrappedText(
      "(b) The RA does not guarantee profits, accuracy, or risk-free investments through its research.",
    );
    addSpace(8);
    drawSectionHeading(" Regulatory Registration and Certification");
    drawWrappedText(
      "(a) SEBI registration as a Research Analyst, enlistment with RAASB, and NISM certification do not guarantee the RA’s performance or assure returns.",
    );
    addSpace(8);
    drawSectionHeading("Investor SAFETY REMINDERS");
    drawSectionHeading("Make all fee payments ONLY through:");
    drawWrappedText(`(a) The official website of ${raName}`);
    drawWrappedText("(b) Direct bank account in the firm's name");
    drawWrappedText(
      "(c) CeFCoM link or SEBI-authorized payment methods like valid UPI",
    );
    drawWrappedText(
      "(d) Never make payments to personal UPI IDs, unofficial bank accounts, or through unverified third-party links.",
    );
    drawWrappedText(
      "If you have any doubt, contact our Compliance Officer immediately:",
    );
    addSpace(8);
    drawSectionHeading("Security and Privacy Reminders");

    drawWrappedText(
      "(a) The RA will never request clients’ login credentials or OTPs for trading/demat/bank accounts.",
    );
    drawWrappedText(
      "(b) Clients must never share such sensitive information with anyone, including the RA.",
    );
    addSpace(8);
    drawSectionHeading(
      "Optional Centralized Fee Collection Mechanism (CeFCoM)",
    );
    drawWrappedText(
      "(a) CeFCoM helps investors direct payments securely to legitimate SEBI-registered advisors.",
    );
    drawWrappedText(
      "(b) Enables investors to track payments made to research analysts.",
    );
    drawWrappedText(
      "(c) Investors can request CeFCoM payment links directly from registered Research Analysts and pay using authorized channels.",
    );
    addSpace(8);
    drawSectionHeading("Protection Against Social Media Scams");
    drawSectionHeading("Common Scam Tactics to Watch For:");
    drawWrappedText(
      "(a) Unsolicited Invitations: Beware of unsolicited messages or links inviting you to WhatsApp groups offering “VIP” trading tips or free courses.",
    );
    drawWrappedText(
      "(b) Fake Profiles: Scammers may create fraudulent identities impersonating market experts or RA representatives.",
    );
    drawWrappedText(
      "(c) Impersonations: Persons may masquerade as SEBI-registered intermediaries, well-known CEOs, or public figures.",
    );
    drawWrappedText(
      "(d) Fake Testimonials: Fraudulent groups show fabricated success stories to lure investors into transferring funds with false promises of high returns.",
    );
    addSpace(8);
    drawSectionHeading("Guidelines to Protect Yourself:");
    drawWrappedText(
      "(a) Engage only with SEBI-registered intermediaries whose credentials are verified.",
    );
    drawWrappedText(
      "(b) Verify registration at SEBI’s official portal: https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14",
    );
    drawWrappedText(
      "(c) Perform financial transactions only through official trading apps of SEBI-registered intermediaries: https://investor.sebi.gov.in/Investor-support.html ",
    );
    drawWrappedText(
      "(d) Always communicate via authentic email addresses provided on SEBI’s portal.",
    );
    addSpace(8);
    drawSectionHeading("Tips from the RA to Avoid Scams:");
    drawWrappedText(
      "1. Search the registered name of your RA on SEBI’s official website.",
    );
    drawWrappedText(
      "2. Obtain RA’s official email/phone details from SEBI’s listing.",
    );
    drawWrappedText("3. Initiate communication using the official email only.");
    drawWrappedText(
      "4. If you receive communication from an unrecognized or personal email, disregard it as a potential scam.",
    );
    drawWrappedText(
      "5. Always pay after verifying details through SEBI check: https://siportal.sebi.gov.in/intermediary/sebi-check and to a @valid UPI-ID and through Centralized Fee Collection Mechanism for Investment Advisers and Research Analysts (CeFCoM). ",
    );
    addSpace(8);
    drawSectionHeading(
      "SEBI again advises investors to exercise extreme caution:",
    );
    drawWrappedText(
      "(1) Verify registration of entities before investing at: https://www.sebi.gov.in/intermediaries.html ",
    );
    drawWrappedText(
      "(2) Carry out transactions only through authentic trading apps of SEBI-registered intermediaries after verification at: https://investor.sebi.gov.in/Investor-support.html ",
    );
    drawWrappedText(
      "(3) Use “Validated UPI Handles” (“@valid” UPI IDs of SEBI-registered investor-facing intermediaries) and the “SEBI Check” platform by visiting https://siportal.sebi.gov.in/intermediary/sebi-check or through the Saarthi app, for secure investor payments (refer Press Release No. 64/2025)",
    );
    drawWrappedText(
      "Cyber Crime Reporting Portal: https://cybercrime.gov.in/ ",
    );
    drawWrappedText(
      "Report online financial fraud at the National Cybercrime Helpline number 1930",
    );
    drawWrappedText(
      "Register Your Financial Fraud complaint: https://cybercrime.gov.in/Webform/Accept.aspx",
    );
    drawWrappedText(
      "Cyber Crime Help: https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx ",
    );
    drawWrappedText(
      "Learning Video Gallery: https://cybercrime.gov.in/Webform/video-category.aspx ",
    );
    drawWrappedText(
      "For Investor charter, MITC, risk, disclosures, and disclaimers, refund policy, t&c, Fraud Awareness, and other, please visit our website: trademilaan and read everything to avoid any future conflict of interest. ",
    );

    // SIGNATURE SECTION - Two Column Table (Client left, RA right)
    addSpace(20);
    // Table dimensions (taller bottom area for PAN / dates below signature lines)
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / 2;
    const tableHeight = 185;
    const tableTop = yPosition;
    const tableLeft = margin;
    const rowHeight = tableHeight / 2;

    // Draw outer border
    currentPage.drawRectangle({
      x: tableLeft,
      y: tableTop - tableHeight,
      width: tableWidth,
      height: tableHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.2,
    });
    // Draw vertical divider
    currentPage.drawLine({
      start: { x: tableLeft + colWidth, y: tableTop },
      end: { x: tableLeft + colWidth, y: tableTop - tableHeight },
      color: rgb(0, 0, 0),
      thickness: 1.2,
    });
    // Draw horizontal divider
    currentPage.drawLine({
      start: { x: tableLeft, y: tableTop - rowHeight },
      end: { x: tableLeft + tableWidth, y: tableTop - rowHeight },
      color: rgb(0, 0, 0),
      thickness: 1.2,
    });

    // --- HEADERS ---
    const headerFontSize = 11;
    const cellPaddingX = 12;
    const cellPaddingY = 8;
    // Header row
    currentPage.drawText("SIGNED AND DELIVERED", {
      x: tableLeft + cellPaddingX,
      y: tableTop - cellPaddingY - 2,
      size: headerFontSize,
      font: fontBold,
    });
    currentPage.drawText('By the within named "User"', {
      x: tableLeft + cellPaddingX,
      y: tableTop - cellPaddingY - 18,
      size: 10,
      font: font,
    });
    currentPage.drawText("SIGNED AND DELIVERED", {
      x: tableLeft + colWidth + cellPaddingX,
      y: tableTop - cellPaddingY - 2,
      size: headerFontSize,
      font: fontBold,
    });
    currentPage.drawText('By the within named "Service provider"', {
      x: tableLeft + colWidth + cellPaddingX,
      y: tableTop - cellPaddingY - 18,
      size: 10,
      font: font,
    });

    // --- SIGNATURES (centered in upper cell) ---
    // Calculate signature image area
    const sigAreaTop = tableTop - rowHeight;
    const sigAreaHeight = rowHeight - 28;
    // Client signature (left)
    let clientSigW = colWidth - 2 * cellPaddingX;
    let clientSigH = sigAreaHeight - 10;
    let clientSigX =
      tableLeft +
      cellPaddingX +
      (clientSigW > 120 ? (clientSigW - 120) / 2 : 0);
    let clientSigY = sigAreaTop + (sigAreaHeight - clientSigH) / 2 + 8;
    let hasClientSignature = false;
    if (signatureData && typeof signatureData === "string") {
      try {
        let imageBuffer = null;
        console.log("[PDF] signatureData type:", typeof signatureData);
        if (signatureData.startsWith("data:image")) {
          const matches = signatureData.match(/base64,(.+)/);
          if (matches && matches[1]) {
            imageBuffer = Buffer.from(matches[1], "base64");
            console.log(
              "[PDF] Extracted base64 from data URL, buffer length:",
              imageBuffer.length,
            );
          } else {
            console.error("[PDF] No base64 match in data URL signatureData");
          }
        } else {
          imageBuffer = Buffer.from(signatureData, "base64");
          console.log(
            "[PDF] Used raw base64, buffer length:",
            imageBuffer.length,
          );
        }
        if (!imageBuffer || imageBuffer.length === 0) {
          console.error("[PDF] signature imageBuffer is empty or invalid");
        } else {
          const signatureImage = await pdfDoc.embedPng(imageBuffer);
          // Maintain aspect ratio, max width 120, max height clientSigH
          let pngDims = signatureImage.scale(1);
          let scale = Math.min(
            120 / pngDims.width,
            clientSigH / pngDims.height,
            1,
          );
          let drawW = pngDims.width * scale;
          let drawH = pngDims.height * scale;
          let drawX = tableLeft + (colWidth - drawW) / 2;
          let drawY = sigAreaTop + (sigAreaHeight - drawH) / 2 + 8;
          currentPage.drawImage(signatureImage, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
          hasClientSignature = true;
          console.log(
            "[PDF] Client signature image drawn at",
            drawX,
            drawY,
            drawW,
            drawH,
          );
        }
      } catch (imgErr) {
        console.error("[PDF] Error embedding client signature:", imgErr);
        // Draw placeholder line
        currentPage.drawLine({
          start: {
            x: tableLeft + cellPaddingX,
            y: sigAreaTop + sigAreaHeight / 2,
          },
          end: {
            x: tableLeft + colWidth - cellPaddingX,
            y: sigAreaTop + sigAreaHeight / 2,
          },
          color: rgb(0, 0, 0),
          thickness: 1.2,
        });
      }
    }
    if (!hasClientSignature) {
      currentPage.drawLine({
        start: {
          x: tableLeft + cellPaddingX,
          y: sigAreaTop + sigAreaHeight / 2,
        },
        end: {
          x: tableLeft + colWidth - cellPaddingX,
          y: sigAreaTop + sigAreaHeight / 2,
        },
        color: rgb(0, 0, 0),
        thickness: 1.2,
      });
    }

    // RA signature (right)
    let raSigW = colWidth - 2 * cellPaddingX;
    let raSigH = sigAreaHeight - 10;
    // --- RA signature (right) ---
    // The RA (Service Provider) signature is a fixed company asset. Its bytes are
    // bundled with the server code (see ./raSignature) instead of being read from
    // public/ at render time, because public/ is a static-asset directory that a
    // deployed server (serverless function / standalone build) does not
    // necessarily have on its filesystem - that is why the RA signature used to
    // be missing from production PDFs while still working locally.
    // RA_SIGNATURE_PATH (optional) can still override it with a file path.
    let raImageDrawn = false;
    try {
      const raSigBuffer = getRASignatureJpegBuffer();
      if (raSigBuffer && raSigBuffer.length > 0) {
        // pdf-lib 1.17.1 parses the JPEG with `new DataView(imageData.buffer)`,
        // which ignores the typed array's byteOffset/byteLength. A Node Buffer (or
        // any Uint8Array view) can point into a larger pooled ArrayBuffer, in which
        // case pdf-lib reads from the start of that ArrayBuffer instead of the
        // image and throws "SOI not found in JPEG" even though the buffer itself
        // begins with FF D8. Copying into a standalone Uint8Array (byteOffset 0)
        // makes the SOI check read the real JPEG header.
        const raJpegBytes = new Uint8Array(raSigBuffer);
        const raSigImage = await pdfDoc.embedJpg(raJpegBytes);
        // Maintain aspect ratio, max width 120, max height raSigH
        let jpgDims = raSigImage.scale(1);
        let scale = Math.min(120 / jpgDims.width, raSigH / jpgDims.height, 1);
        let drawW = jpgDims.width * scale;
        let drawH = jpgDims.height * scale;
        let drawX = tableLeft + colWidth + (colWidth - drawW) / 2;
        // Move signature further down by increasing offset (was +8, now +28)
        let drawY = sigAreaTop + (sigAreaHeight - drawH) / 2;
        currentPage.drawImage(raSigImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
        raImageDrawn = true;
      }
    } catch (err) {
      // Never fail the whole agreement, but never hide the failure either: log it
      // so a missing RA signature is visible instead of silently disappearing.
      console.error(
        "[PDF] RA signature could not be embedded - agreement generated without it:",
        err.message,
      );
    }
    // Only draw line if image was not drawn
    if (!raImageDrawn) {
      currentPage.drawLine({
        start: {
          x: tableLeft + colWidth + cellPaddingX,
          y: sigAreaTop + sigAreaHeight / 2,
        },
        end: {
          x: tableLeft + tableWidth - cellPaddingX,
          y: sigAreaTop + sigAreaHeight / 2,
        },
        color: rgb(0, 0, 0),
        thickness: 1.2,
      });
    }

    // --- Footer below signature: user (dynamic) | RA (constants) ---
    const footerFontSize = 9;
    const footerLineGap = 12;
    const footerBaseY = tableTop - tableHeight + cellPaddingY + 4;

    const drawLabeledLine = (page, x, y, boldLabel, rest) => {
      page.drawText(boldLabel, {
        x,
        y,
        size: footerFontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      const lw = fontBold.widthOfTextAtSize(boldLabel, footerFontSize);
      page.drawText(rest ?? "", {
        x: x + lw,
        y,
        size: footerFontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    };

    // Left column: client PAN, signatory, date (dynamic)
    let fy = footerBaseY;
    drawLabeledLine(
      currentPage,
      tableLeft + cellPaddingX,
      fy,
      "PAN: ",
      String(clientPan).toUpperCase(),
    );
    fy += footerLineGap;
    currentPage.drawText(`Signed by: ${signedByDisplayName}`, {
      x: tableLeft + cellPaddingX,
      y: fy,
      size: footerFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    fy += footerLineGap;
    currentPage.drawText(`Date: ${signedDateDisplay}`, {
      x: tableLeft + cellPaddingX,
      y: fy,
      size: footerFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Right column: SEBI / registration (constant), date line for RA sign
    let ry = footerBaseY;
    const rightX = tableLeft + colWidth + cellPaddingX;
    drawLabeledLine(currentPage, rightX, ry, "SEBI RA Number: ", raNumber);
    ry += footerLineGap;
    currentPage.drawText(`Registration Date: ${raRegistrationDate}`, {
      x: rightX,
      y: ry,
      size: footerFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    ry += footerLineGap;

    // Move yPosition below table for next content
    yPosition = tableTop - tableHeight - 20;

    // Finalize and return
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    return pdfBuffer;
  } catch (err) {
    throw err;
  }
}
