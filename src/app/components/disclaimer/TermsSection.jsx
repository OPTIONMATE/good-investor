export default function TermsSection() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="w-full h-96 rounded-xl overflow-hidden">
        <img
          src="/terms.jpg"
          alt="Terms and conditions for issuance of research reports by Sasikumar Peyyala"
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Terms & Conditions of issuance of Research Report issued by SASIKUMAR
          PEYYALA: INH000019327
        </h2>

        <p className="text-gray-600 mb-3">
          The Research report is issued to the registered clients. The Research
          Report or Research recommendations is based on facts, figures, and
          information that are considered true, correct, and reliable. The
          information contained herein is from publicly available data or other
          sources believed to be reliable.
        </p>

        <p className="text-gray-600 mb-3">
          We have also reviewed the research report or Research for any untrue
          statements of material facts or any false or misleading information.
        </p>

        <p className="text-gray-600">
          The report or recommendations are prepared solely for informational
          purposes and do not constitute an offer document or solicitation to
          buy or sell or hold or subscribe for securities or other financial
          instruments for clients.
        </p>
      </div>
    </div>
  );
}
