const dos = [
  "Always deal with SEBI registered Research Analyst.",
  "Ensure that the Research Analyst has a valid registration certificate.",
  "Check for SEBI registration number.",
  "Always pay attention towards disclosures made in the research reports before investing.",
  "Pay your Research Analyst through banking channels only and maintain duly signed receipts mentioning the details of your payments. You may make payment of fees through Centralized Fee Collection Mechanism (CeFCoM) of RAASB if research analyst has opted for the mechanism. (Applicable for fee paying clients only)",
  "Before buying/ selling securities or applying in public offer, check for the research recommendation provided by your Research Analyst.",
  "Ask all relevant questions and clear your doubts with your Research Analyst before acting on recommendation.",
  "Seek clarifications and guidance on research recommendations from your Research Analyst, especially if it involves complex and high risk financial products and services.",
  "Always be aware that you have the right to stop availing the service of a Research Analyst as per the terms of service agreed between you and your Research Analyst.",
  "Always be aware that you have the right to provide feedback to your Research Analyst in respect of the services received.",
  "Always be aware that you will not be bound by any clause, prescribed by the research analyst, which is contravening any regulatory provisions.",
  "Inform SEBI about Research Analyst offering assured or guaranteed returns.",
];

export default function DosSection() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">Do&apos;s for an Investor</h2>

      <ul className="list-disc list-inside space-y-4 text-gray-700">
        {dos.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
