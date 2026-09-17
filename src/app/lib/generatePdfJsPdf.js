/**
 * Generate PDF using jsPDF - converts captured HTML to clean PDF
 */
export async function generateSignedAgreementPDFJsPdf(agreementData) {
  try {
    // Import jsPDF dynamically
    const { default: jsPDF } = await import("jspdf");

    // Create PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const lineHeight = 3.5;
    let currentY = margin;

    // Helper function to add text with wrapping
    const addText = (
      text,
      fontSize = 9,
      isBold = false,
      maxWidth = pageWidth - 2 * margin,
    ) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, "bold");
      } else {
        doc.setFont(undefined, "normal");
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line) => {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
      doc.setFont(undefined, "normal");
    };

    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("SERVICE AGREEMENT", pageWidth / 2, currentY, { align: "center" });
    currentY += lineHeight * 2.5;

    // Signing information
    const signedDate = new Date(agreementData.signedTimestamp);
    const formattedDate = signedDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(
      `Signed by: ${agreementData.signedName || "N/A"}`,
      margin,
      currentY,
    );
    currentY += lineHeight;
    doc.text(`Signed on: ${formattedDate}`, margin, currentY);
    currentY += lineHeight;
    doc.text(
      `Client Name: ${agreementData.clientName || "Unknown"}`,
      margin,
      currentY,
    );
    currentY += lineHeight;
    doc.text(
      `Client PAN: ${agreementData.clientPan || "NOT_PROVIDED"}`,
      margin,
      currentY,
    );
    currentY += lineHeight * 2;

    // Extract text from captured HTML
    let agreementText = "";

    if (agreementData.agreementHtml) {
      // Remove HTML tags and decode entities
      agreementText = agreementData.agreementHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
        .replace(/<[^>]*>/g, " ") // Remove HTML tags
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();
    }

    if (agreementText) {
      // Add the actual agreement content
      addText(agreementText, 8);
    } else {
      // Fallback message if no HTML captured
      addText(
        "Agreement content was not captured. " +
          "This document is electronically signed and certified. " +
          `Signed by: ${agreementData.signedName || "Unknown"} on ${formattedDate}. ` +
          "This is an electronically generated document and does not require a physical signature.",
        9,
      );
    }

    currentY += lineHeight * 2;

    // Footer separator
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = margin;
    }

    doc.setLineWidth(0.5);
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight * 1.5;

    // Digital Signature section
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("[Electronic Signature Verified]", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += lineHeight * 1.5;

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(
      `Signed by: ${agreementData.signedName || "N/A"}`,
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );
    currentY += lineHeight * 1.5;
    doc.text(
      "This document has been digitally signed and certified.",
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );
    currentY += lineHeight;
    doc.text(
      `Document ID: ${agreementData._id || "N/A"}`,
      pageWidth / 2,
      currentY,
      {
        align: "center",
      },
    );
    currentY += lineHeight;
    doc.text(
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      pageWidth / 2,
      currentY,
      { align: "center" },
    );
    currentY += lineHeight;
    doc.text(
      "This is an electronically generated document and does not require a physical signature.",
      pageWidth / 2,
      currentY,
      { align: "center", maxWidth: pageWidth - 20 },
    );

    // Get PDF as buffer
    const pdfBytes = doc.output("arraybuffer");
    const buffer = Buffer.from(pdfBytes);

    console.log("PDF generated successfully. Size:", buffer.length, "bytes");
    return buffer;
  } catch (err) {
    console.error("PDF generation error:", err);
    throw err;
  }
}
