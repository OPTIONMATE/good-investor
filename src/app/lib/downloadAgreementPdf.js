/**
 * Download agreement as PDF from agreement data
 * Uses client-side PDF generation with html2pdf
 */
export async function downloadAgreementPDF(
  agreementData,
  filename = "agreement.pdf",
) {
  try {
    // Dynamically import html2pdf since it's browser-only
    const html2pdf = (await import("html2pdf.js")).default;

    // Create HTML content for PDF
    const element = document.createElement("div");
    element.innerHTML = `
      <html>
        <head>
          <style>
            /* Reset/override complex CSS that html2canvas may not support (e.g. lab()) */
            *, *::before, *::after {
              color: #111 !important;
              background: transparent !important;
              box-shadow: none !important;
              filter: none !important;
              -webkit-filter: none !important;
            }
            body { background: #ffffff; }

            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
            }
            h1 {
              text-align: center;
              font-size: 24px;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .content {
              margin-left: 10px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .signature-section {
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .signature-section h3 {
              text-align: center;
              font-size: 14px;
              margin-bottom: 15px;
            }
            .signature-image {
              display: block;
              margin: 0 auto;
              max-width: 200px;
              margin-bottom: 15px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>SERVICE AGREEMENT</h1>
          
          <div class="section">
            <span class="label">Signed by:</span>
            <div class="content">${agreementData.signedName || "N/A"}</div>
          </div>
          
          <div class="section">
            <span class="label">Signed on:</span>
            <div class="content">${new Date(agreementData.signedTimestamp).toLocaleString("en-IN")}</div>
          </div>
          
          <div class="section">
            <span class="label">Client Name:</span>
            <div class="content">${agreementData.clientName || "Unknown"}</div>
          </div>
          
          <div class="section">
            <span class="label">Client PAN:</span>
            <div class="content">${agreementData.clientPan || "NOT_PROVIDED"}</div>
          </div>
          
          <div class="section">
            <span class="label">File Hash:</span>
            <div class="content">${agreementData.fileHash ? agreementData.fileHash.substring(0, 32) : "N/A"}...</div>
          </div>
          
          <div class="section">
            <span class="label">Agreement Content:</span>
            <div class="content">
              ${
                agreementData.agreementHtml
                  ? agreementData.agreementHtml
                      .replace(/<[^>]*>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .replace(/&lt;/g, "<")
                      .replace(/&gt;/g, ">")
                      .replace(/&amp;/g, "&")
                  : "⚠️ AGREEMENT CONTENT NOT CAPTURED ⚠️\nThis is a digitally signed service agreement between the Service Provider and the User.\nNote: The actual agreement content was not captured during signing."
              }
            </div>
          </div>
          
          <div class="signature-section">
            <h3>Digital Signature</h3>
            ${
              agreementData.signatureData &&
              agreementData.signatureData.startsWith("data:image")
                ? "[Signature Image]"
                : "<p style='text-align: center; font-size: 12px;'>[Signature Image]</p>"
            }
          </div>
          
          <div class="footer">
            <p>This document is digitally signed and certified.</p>
            <p>Document ID: ${agreementData.agreementId || "N/A"}</p>
            <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
            <p>This is an electronically generated document and does not require a physical signature.</p>
          </div>
        </body>
      </html>
    `;

    // Configure PDF options
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    // Use an isolated iframe to avoid inherited page CSS (lab() colors etc.)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "9999px";
    iframe.style.width = "800px";
    iframe.style.height = "1120px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(element.innerHTML);
    doc.close();

    // Wait for iframe content to load images/fonts
    await new Promise((resolve) => {
      const onLoad = () => setTimeout(resolve, 100);
      if (doc.readyState === "complete") return setTimeout(resolve, 50);
      iframe.onload = onLoad;
      // fallback in case onload doesn't fire
      setTimeout(resolve, 500);
    });

    try {
      await html2pdf().set(opt).from(doc.body).save();
    } finally {
      // clean up iframe
      document.body.removeChild(iframe);
    }

    return true;
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    // Fallback: download as text file
    downloadAsJSON(agreementData, filename.replace(".pdf", ".json"));
    return false;
  }
}

/**
 * Fallback: Download agreement data as JSON
 */
export function downloadAsJSON(data, filename = "agreement.json") {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Failed to download JSON:", err);
    alert("Failed to download agreement. Error: " + err.message);
    return false;
  }
}
