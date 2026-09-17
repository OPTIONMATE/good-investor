"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function DisclaimerGate() {
  const router = useRouter();
  const { user, loading, fetchMe } = useAuth();

  useEffect(() => {
    if (!loading && user?.disclaimerAccepted) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const accept = async () => {
    await fetchWithCsrf("/api/user/accept-disclaimer", { method: "POST" });
    await fetchMe();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/70 px-4">
      <div className="bg-white rounded-xl overflow-hidden max-w-3xl w-full p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Important Disclaimer
        </h2>

        <p className="text-gray-700 mb-4">
          Registration granted by SEBI and certification from NISM in no way
          guarantee the performance of the intermediary or provide any assurance
          of returns to investors. Investments in securities are subject to
          market risks. Please read all related documents carefully before
          investing.
        </p>

        <p className="text-gray-700 mb-6">
          By clicking <b>“Proceed”</b>, you confirm that you have read,
          understood, and agreed to our{" "}
          <Link
            href="/terms-and-condition"
            target="_blank"
            className="text-blue-600 underline font-medium"
          >
            Terms & Conditions
          </Link>
          .
        </p>

        <button
          onClick={accept}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Proceed to Website
        </button>
      </div>
    </div>
  );
}
