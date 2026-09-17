"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ESignModal from "@/app/components/ESignModal";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

// Load AgreementViewer only in browser
const AgreementViewer = dynamic(
  () => import("@/app/components/AgreementViewer"),
  { ssr: false }
);

export default function AgreementPage() {
  const [fileUrl, setFileUrl] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);

  const router = useRouter();

  // Fetch latest agreement PDF uploaded by admin
  useEffect(() => {
    fetch("/api/agreement") // This must return { fileUrl: "cloudinary_url" }
      .then(res => res.json())
      .then(data => setFileUrl(data.fileUrl))
      .catch(err => console.error("PDF Load Failed:", err));
  }, []);

  const handleSubmit = async () => {
    await fetchWithCsrf("/api/agreement/accept", {
      method: "POST"
    });

    setAccepted(true);
    setShowSign(true);
  };

  const handleSigned = (signedPdfUrl) => {
    console.log("Signed PDF:", signedPdfUrl);

    // Redirect after signing (we improve this after stamping logic)
    router.push("/dashboard");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Agreement</h2>

      {/* PDF Loader Status */}
      {!fileUrl && <p className="text-gray-600">Loading PDF...</p>}

      {/* PDF Viewer */}
      {fileUrl && (
        <div className="border rounded-lg mb-6">
          <AgreementViewer fileUrl={fileUrl} />
        </div>
      )}

      {/* Checkbox + Submit */}
      {fileUrl && (
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            I have read and understood the agreement and will E-Sign it.
          </label>

          <button
            disabled={!checked}
            onClick={handleSubmit}
            className={`mt-4 px-4 py-2 rounded text-white ${
              checked ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400"
            }`}
          >
            Submit & Continue to E-Sign
          </button>
        </div>
      )}

      {/* E-Sign Modal */}
      {showSign && (
        <ESignModal
          pdfUrl={fileUrl}
          onClose={() => setShowSign(false)}
          onSaved={handleSigned}
        />
      )}
    </div>
  );
}
