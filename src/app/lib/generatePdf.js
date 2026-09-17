import PDFDocument from "pdfkit";

export async function generateSignedAgreementPDF(agreementData) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting PDF generation for agreement:", agreementData._id);

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      let pdfBuffer = [];

      // Handle data chunks
      doc.on("data", (chunk) => {
        pdfBuffer.push(chunk);
      });

      // Handle completion
      doc.on("end", () => {
        try {
          const finalBuffer = Buffer.concat(pdfBuffer);
          console.log(
            "PDF generation complete. Size:",
            finalBuffer.length,
            "bytes",
          );
          resolve(finalBuffer);
        } catch (err) {
          console.error("Error concatenating PDF buffer:", err);
          reject(err);
        }
      });

      // Handle errors
      doc.on("error", (err) => {
        console.error("PDF document error:", err);
        reject(err);
      });

      // Add header - Clean and compact
      doc.fontSize(18).font("Helvetica-Bold").text("SERVICE AGREEMENT", {
        align: "center",
      });
      doc.moveDown(0.2);

      // Add a single-line metadata header
      const signDate = new Date(
        agreementData.signedTimestamp,
      ).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      doc.fontSize(8).font("Helvetica");
      doc.text(
        `Signed by: ${agreementData.signedName || "N/A"} | Signed on: ${signDate} | Client: ${agreementData.clientName || "Unknown"} | PAN: ${agreementData.clientPan || "N/A"}`,
        {
          align: "center",
        },
      );
      doc.moveDown(0.3);

      // Add separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.4);

      // Add agreement content
      doc.fontSize(9).font("Helvetica");
      let agreementText = "";

      if (agreementData.agreementHtml) {
        // Clean HTML and extract main content
        agreementText = agreementData.agreementHtml
          .replace(/<\/p>/g, "\n") // Convert closing p tags to line breaks
          .replace(/<\/?[^>]*>/g, "") // Strip all remaining HTML tags
          .replace(/&nbsp;/g, " ")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();

        // Remove duplicate headers from ServiceAgreement component
        // Look for the actual agreement start
        const lines = agreementText.split("\n");
        let startIdx = 0;

        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].includes("This Service Agreement") &&
            lines[i].includes("is made and entered into")
          ) {
            startIdx = i;
            break;
          }
        }

        agreementText = lines.slice(startIdx).join("\n").trim();

        // Limit text to fit on a reasonable number of pages
        // Keep first 4000 characters to leave room for signature blocks
        if (agreementText.length > 4000) {
          agreementText = agreementText.substring(0, 4000).trim() + "\n\n...";
        }
      } else {
        agreementText =
          "This is a digitally signed service agreement between the Service Provider and the User. By signing this agreement, the user acknowledges and accepts all terms and conditions outlined herein.";
      }

      doc.text(agreementText, {
        align: "left",
        width: 495,
        lineGap: 1,
      });

      doc.moveDown(1.2);

      // Add separator before signatures
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.8);

      // ============================================
      // SERVICE PROVIDER SIGNATURE BLOCK
      // ============================================
      doc.fontSize(9).font("Helvetica-Bold").text("SIGNED AND DELIVERED", {
        align: "center",
      });
      doc.moveDown(0.2);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text('By the within named "Service Provider"', {
          align: "center",
        });
      doc.moveDown(0.5);

      doc.fontSize(8).font("Helvetica");
      doc.text("Name: Sasikumar Peyyala", { align: "left", indent: 50 });
      doc.moveDown(0.3);
      doc.text("Sign of Service Provider: _____________________", {
        align: "left",
        indent: 50,
      });
      doc.moveDown(0.2);
      doc.fontSize(7).font("Helvetica");
      doc.text("SEBI RA: INH000019327 | Registration Date: 07-January-2025", {
        align: "left",
        indent: 50,
      });

      doc.moveDown(1.2);

      // ============================================
      // USER SIGNATURE BLOCK
      // ============================================
      doc.fontSize(9).font("Helvetica-Bold").text("SIGNED AND DELIVERED", {
        align: "center",
      });
      doc.moveDown(0.2);
      doc.fontSize(9).font("Helvetica").text('By the within named "User"', {
        align: "center",
      });
      doc.moveDown(0.5);

      doc.fontSize(8).font("Helvetica");
      // Dynamically show user information
      doc.text(`Name: ${agreementData.clientName || "Client"}`, {
        align: "left",
        indent: 50,
      });
      doc.moveDown(0.3);
      doc.text("Sign of the User: _____________________", {
        align: "left",
        indent: 50,
      });
      doc.moveDown(0.2);
      doc.fontSize(7).font("Helvetica");
      doc.text(
        `PAN: ${agreementData.clientPan || "N/A"} | Signed by: ${agreementData.signedName || "N/A"}`,
        {
          align: "left",
          indent: 50,
        },
      );

      doc.moveDown(1.2);

      // Add separator before footer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.4);

      // Digital Certificate Section
      doc.fontSize(9).font("Helvetica-Bold").text("DIGITAL CERTIFICATE", {
        align: "center",
      });
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font("Helvetica")
        .text("[Electronic Signature Verified]", {
          align: "center",
        });
      doc.moveDown(0.4);

      // Footer information
      doc.fontSize(7).font("Helvetica");
      doc.text("This document has been digitally signed and certified.", {
        align: "center",
      });
      doc.moveDown(0.2);
      doc.text(`Document ID: ${agreementData._id || "N/A"}`, {
        align: "center",
      });
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, {
        align: "center",
      });
      doc.moveDown(0.2);
      doc.fontSize(6).font("Helvetica");
      doc.text(
        "This is an electronically generated document and does not require a physical signature.",
        {
          align: "center",
        },
      );

      // Finalize the PDF
      console.log("Finalizing PDF document");
      doc.end();
    } catch (err) {
      console.error("PDF generation exception:", err);
      reject(err);
    }
  });
}
