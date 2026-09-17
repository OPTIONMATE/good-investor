import Image from "next/image";
import BuyNowButton from "@/app/components/buy/BuyNowButton";

export default function IndexOptionsPro() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      {/* Image */}
      <div>
        <Image
          src="/service2.jpg"
          alt="trademilaan Index Options Pro"
          width={600}
          height={400}
          className="rounded-2xl w-full h-auto object-cover"
        />
      </div>

      {/* Content */}
      <div>
        <h2 className="text-3xl font-bold mb-4">
          trademilaan Index Options Pro
        </h2>

        <h4 className="italic underline mb-4 font-semibold">
          Subscription Details
        </h4>

        <ul className="space-y-2 text-gray-700">
          <li>
            <b>Segment:</b> Focus on Future & Options, specifically Index
            Options.
          </li>
          <li>
            <b>Call Frequency:</b> Weekly (3–10 Calls).
          </li>
          <li>
            <b>Capital Required:</b> ₹1,00,000.
          </li>
          <li>
            <b>Average Stop-Loss:</b> 12%–15%.
          </li>
          <li>
            <b>Subscription Type:</b> Regular.
          </li>
          <li>
            <b>Specialities:</b> AI-based strike and price selection.
          </li>
        </ul>

        {/* Buy Now Button */}
        <div className="mt-6">
          <BuyNowButton />
        </div>
      </div>
    </section>
  );
}
