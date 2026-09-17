import Image from "next/image";
import Link from "next/link";

export default function EquityPro() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Content */}
      <div>
        <h2 className="text-3xl font-bold mb-4">trademilaan Equity Pro</h2>
        <h4 className="italic underline mb-4 font-semibold">
          Subscription Details
        </h4>

        <ul className="space-y-2 text-gray-700">
          <li>
            <b>Segment:</b> Focus on Stocks.
          </li>
          <li>
            <b>Call Frequency:</b> Monthly (3–5 Research Calls).
          </li>
          <li>
            <b>Capital Required:</b> ₹100,000.
          </li>
          <li>
            <b>Average Stop-Loss:</b> 3%–10%.
          </li>
          <li>
            <b>Subscription Type:</b> Regular.
          </li>
          <li>
            <b>Specialities:</b> Data analysis & ML-based stock selection.
          </li>
        </ul>

        <Link href={"https://superprofile.bio/trademilaan/akWEMhzKEs"}>
          <button className="mt-6 bg-sky-500 text-white px-6 py-3 rounded-md hover:bg-sky-600 transition cursor-pointer">
            Buy Now
          </button>
        </Link>
      </div>

      {/* Image */}
      <div className=" rounded-2xl p-6 flex justify-center">
        <img
          src="/service1.jpg"
          alt="trademilaan Equity Pro"
          className="rounded-2xl w-full h-auto object-cover"
        />
      </div>
    </section>
  );
}
