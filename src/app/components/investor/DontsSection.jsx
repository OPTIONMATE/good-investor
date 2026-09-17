const donts = [
  "Do not provide funds for investment to the Research Analyst.",
  "Don't fall prey to luring advertisements or market rumors.",
  "Do not get attracted to limited period discounts, incentives, gifts, etc. offered by Research Analyst.",
  "Do not share login credentials and password of your trading, demat or bank accounts with the Research Analyst.",
];

export default function DontsSection() {
  return (
    <div className="w-full bg-gray-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
          Don&apos;ts for an Investor
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {donts.map((text, index) => (
            <li
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col items-center list-none"
            >
              <div
                className="w-12 h-12 rounded-full bg-teal-400 mb-4 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white text-xl font-bold">✕</span>
              </div>
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
