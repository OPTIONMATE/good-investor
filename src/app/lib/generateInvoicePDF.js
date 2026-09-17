import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF(invoiceData) {
  // Helper to format date as DD/MM/YYYY
  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const {
    clientName = "Client Name",
    email = "client@email.com",
    mobile = "xxxxxxxxxx",
    state = "State",
    pan = "PAN0000000X",
    service = "KMR LargeMidCap Services",
    price = "Rs. 4,000",
    gst = "Rs. 399",
    subtotal = "Rs. 4,399",
    total = "Rs. 12,000",
    qty = "1",
    startDate = "",
    endDate = "",
    planName = "Plan Name",
  } = invoiceData;

  // Dates may arrive as Date objects or pre-formatted DD/MM/YYYY strings.
  // NO synthetic defaults: the caller must pass the stored service period so
  // this PDF renderer can never silently bake in "today + 1 month".
  const startDateLabel =
    startDate instanceof Date ? formatDate(startDate) : startDate;
  const endDateLabel =
    endDate instanceof Date ? formatDate(endDate) : endDate;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]);

  /* Pastel palette — cohesive, print-friendly */
  const pastel = {
    pageTint: rgb(0.99, 0.99, 0.995),
    topBar: rgb(0.88, 0.78, 0.82),
    topBarText: rgb(0.32, 0.22, 0.28),
    headingName: rgb(0.35, 0.42, 0.55),
    invoiceWord: rgb(0.52, 0.42, 0.72),
    sebiAccent: rgb(0.58, 0.4, 0.48),
    divider: rgb(0.72, 0.62, 0.88),
    tableHeader: rgb(0.62, 0.78, 0.86),
    tableHeaderText: rgb(0.18, 0.28, 0.34),
    tableRowTint: rgb(0.97, 0.99, 1),
    tableRowBorder: rgb(0.82, 0.88, 0.94),
    paymentLabel: rgb(0.62, 0.45, 0.52),
    contactLabel: rgb(0.45, 0.55, 0.65),
    bodyMuted: rgb(0.22, 0.24, 0.28),
    gstMuted: rgb(0.32, 0.32, 0.38),
    termsHeading: rgb(0.38, 0.35, 0.48),
    totalAccent: rgb(0.48, 0.42, 0.62),
    footerLeft: rgb(0.78, 0.93, 0.9),
    footerRight: rgb(0.9, 0.86, 0.96),
    footerLeftText: rgb(0.16, 0.34, 0.38),
    footerRightText: rgb(0.26, 0.22, 0.4),
    footerDivider: rgb(0.96, 0.95, 0.99),
    grievanceTitle: rgb(0.42, 0.34, 0.58),
  };

  page.drawRectangle({
    x: 0,
    y: 0,
    width: 595,
    height: 842,
    color: pastel.pageTint,
  });

  let y = 810;
  const margin = 40;
  const lineGap = 14;

  /* ---------- TEXT WRAP FUNCTION ---------- */

  function drawWrappedText(
    text,
    x,
    startY,
    size,
    maxWidth,
    lineHeight = 12,
    textColor = rgb(0, 0, 0),
    fontToUse = font,
  ) {
    const words = text.split(" ");
    let line = "";
    let yPos = startY;

    for (const word of words) {
      const testLine = line + word + " ";
      const width = fontToUse.widthOfTextAtSize(testLine, size);

      if (width > maxWidth) {
        page.drawText(line, {
          x,
          y: yPos,
          size,
          font: fontToUse,
          color: textColor,
        });

        line = word + " ";
        yPos -= lineHeight;
      } else {
        line = testLine;
      }
    }

    page.drawText(line, {
      x,
      y: yPos,
      size,
      font: fontToUse,
      color: textColor,
    });

    return yPos - lineHeight;
  }

  /* ---------- TOP DISCLAIMER BAR ---------- */

  page.drawRectangle({
    x: 0,
    y: 820,
    width: 595,
    height: 22,
    color: pastel.topBar,
  });

  page.drawText(
    "Investment in securities market are subject to market risks. Read all the related documents carefully before investing.",
    {
      x: 40,
      y: 826,
      size: 9,
      font,
      color: pastel.topBarText,
    },
  );

  /* ---------- HEADER ---------- */

  y -= 20;

  page.drawText("Sasikumar Peyyala", {
    x: margin,
    y,
    size: 22,
    font: bold,
    color: pastel.headingName,
  });

  page.drawText("INVOICE", {
    x: 430,
    y: y + 6,
    size: 28,
    font: bold,
    color: pastel.invoiceWord,
  });

  y -= 20;

  page.drawText("SEBI® Research Analyst: INH000019327", {
    x: margin,
    y,
    size: 11,
    font: bold,
    color: pastel.sebiAccent,
  });

  page.drawText("Trade Name or Website: www.trademilaan.in", {
    x: 310,
    y,
    size: 10,
    font,
    color: pastel.bodyMuted,
  });

  /* ---------- ACCENT LINE ---------- */

  y -= 10;

  page.drawRectangle({
    x: margin,
    y,
    width: 520,
    height: 3,
    color: pastel.divider,
  });

  /* ---------- CLIENT DETAILS ---------- */

  y -= 22;

  page.drawText(`Client Name : ${clientName}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  y -= lineGap;
  page.drawText(`Email : ${email}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  y -= lineGap;
  page.drawText(`Mobile : +91 ${mobile}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  y -= lineGap;
  page.drawText(`State : ${state}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  y -= lineGap;
  page.drawText(`PAN : ${pan}`, {
    x: margin,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  page.drawText(`SERVICE START DATE : ${startDateLabel}`, {
    x: 340,
    y: y + lineGap * 4,
    size: 11,
    font: bold,
    color: pastel.bodyMuted,
  });

  page.drawText(`SERVICE END DATE : ${endDateLabel}`, {
    x: 340,
    y: y + lineGap * 3,
    size: 11,
    font: bold,
    color: pastel.bodyMuted,
  });

  page.drawText(`GST No: 37CNSPP5410Q2Z2`, {
    x: 340,
    y: y + lineGap * 2,
    size: 11,
    font: bold,
    color: pastel.gstMuted,
  });

  /* ---------- SERVICE TABLE ---------- */

  y -= 30;

  page.drawRectangle({
    x: margin,
    y,
    width: 515,
    height: 22,
    color: pastel.tableHeader,
  });

  page.drawText("PRODUCT/SERVICE", {
    x: margin + 8,
    y: y + 6,
    size: 11,
    font: bold,
    color: pastel.tableHeaderText,
  });
  page.drawText("PRICE", {
    x: 260,
    y: y + 6,
    size: 11,
    font: bold,
    color: pastel.tableHeaderText,
  });
  page.drawText("QTY", {
    x: 370,
    y: y + 6,
    size: 11,
    font: bold,
    color: pastel.tableHeaderText,
  });
  page.drawText("TOTAL", {
    x: 460,
    y: y + 6,
    size: 11,
    font: bold,
    color: pastel.tableHeaderText,
  });

  y -= 22;

  page.drawRectangle({
    x: margin,
    y,
    width: 515,
    height: 22,
    color: pastel.tableRowTint,
    borderColor: pastel.tableRowBorder,
    borderWidth: 0.5,
  });

  page.drawText(planName || service, {
    x: margin + 8,
    y: y + 6,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });
  page.drawText(price, {
    x: 260,
    y: y + 6,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });
  page.drawText(qty || "1", {
    x: 370,
    y: y + 6,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });
  page.drawText(total, {
    x: 460,
    y: y + 6,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  /* ---------- PAYMENT DETAILS ---------- */

  y -= 30;

  page.drawText("PAYMENT DETAILS", {
    x: margin,
    y,
    size: 10,
    font: bold,
    color: pastel.paymentLabel,
  });

  y -= 12;

  y = drawWrappedText(
    "Please make payments for our services through our website. Any payments made outside of the specified bank account or payment gateway will not be considered as payment for our services.",
    margin,
    y,
    8,
    520,
    10,
    pastel.bodyMuted,
  );

  /* ---------- TOTALS ---------- */

  y -= 10;

  page.drawText("SUBTOTAL", {
    x: 370,
    y,
    size: 11,
    font: bold,
    color: pastel.bodyMuted,
  });
  page.drawText(subtotal, {
    x: 470,
    y,
    size: 11,
    font,
    color: pastel.bodyMuted,
  });

  y -= 14;

  page.drawText("GST@18%", {
    x: 370,
    y,
    size: 11,
    font: bold,
    color: pastel.bodyMuted,
  });
  page.drawText(gst, { x: 470, y, size: 11, font, color: pastel.bodyMuted });

  y -= 14;

  page.drawText("TOTAL", {
    x: 370,
    y,
    size: 11,
    font: bold,
    color: pastel.totalAccent,
  });
  page.drawText(total, {
    x: 470,
    y,
    size: 11,
    font: bold,
    color: pastel.totalAccent,
  });

  /* ---------- TERMS ---------- */

  y -= 20;

  page.drawText(
    "PLEASE READ TERMS AND CONDITIONS TO AVOID ANY FUTURE CONFLICT OF INTEREST:",
    {
      x: margin,
      y,
      size: 11,
      font: bold,
      color: pastel.termsHeading,
    },
  );

  y -= 18;

  const terms = [
    "1.Registration by SEBI and certification from NISM do not guarantee the performance of the intermediary or assure returns for investors.",
    "2. Market Risks may result in partial or permanent losses to your investments or portfolio due to unfavorable market conditions or company-specific events.",
    "3. Past performance does not predict future results.",
    "4. We are SEBI Registered as a 'Research Analyst', not as 'Investment Advisers.'",
    "5. We do not provide any assurances or guarantees regarding returns on investments or trading. If anyone claims to do so on our behalf, please contact our Compliance Officer through our website or mail: spkumar.researchanalyst@gmail.com for assistance. We are not liable for any consequences arising from such activities, as investing in the securities market carries significant risks.",
    "6. Sasikumar Peyyala has a designated compliance officer to address all trader/investor complaints. Please send all complaints to spkumar.researchanalyst@gmail.com, and we aim to resolve them within 7 days.",
    "7. Sasikumar Peyyala is a SEBI registered Research Analyst with registration number INH000019327. We do not offer profit-sharing, PMS-based services, or Demat Account handling services. Our offerings are strictly research-based recommendations available on a prepaid subscription basis.",
    "8. We will provide Buy/Sell/Hold ratings and other research-based calls/model portfolios based on Technical and/or Fundamental analysis during the validity period.",
    "9. Investors are encouraged to act in accordance with their risk tolerance, and we do not provide Investment Advisory Services.",
    "10. Please avoid hot or stop-loss measures to mitigate open losses on your investments or portfolio.",
    "11. If you wish to activate our various package services, please contact us to proceed.",
    "12. The services are valid for the specified duration from the payment date.",
    "13. If the services are not activated due to technical reasons, you can reach us for a refund within 2 additional months of research services will be provided. In the event of a refund, one month's service will be held as a retention fee.",
    "14. To review the terms and conditions for each of our research services, please visit our website at www.trademilaan.in.",
  ];

  for (const t of terms) {
    y = drawWrappedText(t, margin, y, 8, 520, 14, pastel.bodyMuted);

    y -= 4;
  }

  /* ---------- CONTACT ROW ---------- */

  const contactY = 115;

  page.drawText("Phone.", {
    x: 40,
    y: contactY,
    size: 10,
    font: bold,
    color: pastel.contactLabel,
  });

  page.drawText("+91 77022 62206", {
    x: 90,
    y: contactY,
    size: 10,
    font,
    color: pastel.bodyMuted,
  });

  page.drawText("Email.", {
    x: 210,
    y: contactY,
    size: 10,
    font: bold,
    color: pastel.contactLabel,
  });

  page.drawText("spkumar.researchanalyst@gmail.com", {
    x: 260,
    y: contactY,
    size: 10,
    font,
    color: pastel.bodyMuted,
  });

  page.drawText("Address.", {
    x: 440,
    y: contactY,
    size: 10,
    font: bold,
    color: pastel.contactLabel,
  });

  drawWrappedText(
    "1 24,29 4 Kummaripalem Centerr, Near D S M, High School, Vidyadharapuram, Vijayawada, VIJAYAWADA,ANDHRA PRADESH, 520012",
    440,
    contactY - 12,
    8,
    140,
    10,
    pastel.bodyMuted,
  );
  y -= 32;

  /* ---------- FOOTER BOXES (pastel mint + pastel lilac) ---------- */
  const boxY = 0;
  const boxHeight = 70;

  page.drawRectangle({
    x: 0,
    y: boxY,
    width: 300,
    height: boxHeight,
    color: pastel.footerLeft,
  });
  page.drawRectangle({
    x: 300,
    y: boxY,
    width: 295,
    height: boxHeight,
    color: pastel.footerRight,
  });

  let blueY = boxY + boxHeight - 18;
  blueY = drawWrappedText(
    "In case you are not satisfied with our response you can lodge your grievance with SEBI SCORES, Phone and ODR.",
    15,
    blueY,
    9,
    260,
    12,
    pastel.footerLeftText,
  );
  blueY = drawWrappedText(
    "Compliance Team: spkumar.researchanalyst@gmail.com",
    15,
    blueY - 5,
    9,
    260,
    12,
    pastel.footerLeftText,
  );
  drawWrappedText(
    "Phone: +91 77022 62206",
    15,
    blueY - 5,
    9,
    260,
    12,
    pastel.footerLeftText,
  );

  let blackY = boxY + boxHeight - 18;
  const blackBoxPadding = 12;
  const blackBoxX = 300;
  const blackBoxWidth = 295;
  const blackTextX = blackBoxX + blackBoxPadding;
  const blackTextWidth = blackBoxWidth - 2 * blackBoxPadding;

  blackY = drawWrappedText(
    "For any queries, feedback or assistance contact SEBI office on toll free Helpline:1800 22 7575 / 1800 266 7575",
    blackTextX,
    blackY,
    9,
    blackTextWidth,
    12,
    pastel.footerRightText,
  );
  blackY = drawWrappedText(
    "SEBI SCORES: https://scores.sebi.gov.in/",
    blackTextX,
    blackY - 5,
    7,
    blackTextWidth,
    12,
    pastel.footerRightText,
  );
  drawWrappedText(
    "SEBI ODR: https://smartodr.in/",
    blackTextX,
    blackY - 5,
    7,
    blackTextWidth,
    12,
    pastel.footerRightText,
  );

  page.drawSvgPath(
    `M300 ${boxY} L330 ${boxY + boxHeight} L300 ${boxY + boxHeight} L270 ${boxY} Z`,
    {
      color: pastel.footerDivider,
    },
  );
  /* ---------- SAVE PDF ---------- */

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
