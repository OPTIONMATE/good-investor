export default function RiskDisclosureSection() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          RISK Disclosures “Sasikumar Peyyala: INH000019327
        </h2>

        <p className="text-gray-600 mb-3">
          its partners, employees, officers, and its affiliates are not
          responsible for any loss or damage that may arise to any person for
          any nonchalant error in the information represented in the research
          report or research. Investors may lose his/her entire amount or
          Investments or portfolio under certain market conditions so acting on
          any advice or from research reports, Investors should understand their
          risk appetite or consult their financial advisers. The report or
          Research recommendations do not take into account any specific
          investment objective, goal, or financial situation or any specific
          needs and objectives of any specific individual.
        </p>

        <p className="text-gray-600">
          The client obtaining the research report or Research recommendations
          should act according to his/her own risk appetite and financial
          position and should also understand the risk involved in capital
          markets while making investments.
        </p>
      </div>

      <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
        <img
          src="/riskDisclousre.jpg"
          alt="Risk disclosure and disclaimer information for Sasikumar Peyyala SEBI-registered investment advisor"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
