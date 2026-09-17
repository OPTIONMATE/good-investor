const points = [
  "To publish research report based on the research activities of the RA",
  "To provide an independent unbiased view on securities.",
  "To offer unbiased recommendation, disclosing the financial interests in recommended securities.",
  "To provide research recommendation, based on analysis of publicly available information and known observations.",
  "To conduct audit annually",
  "To ensure that all advertisements are in adherence to the provisions of the Advertisement Code for Research Analysts.",
  "To maintain records of interactions, with all clients including prospective clients (prior to onboarding), where any conversation related to the research services has taken place."
];

export default function BusinessDetails() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f9ff] to-white py-16 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden>
        <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-[#9BE749]/55" />
        <div className="absolute right-10 bottom-12 h-64 w-64 rounded-full bg-[#6d5bff]/18" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Business Details
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Details of business transacted by the Research Analyst with respect to the investors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {points.map((text, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)] backdrop-blur transition hover:-translate-y-1 group"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-500/10 transition-all duration-500 group-hover:scale-[3] group-hover:right-0 group-hover:top-0" aria-hidden />
              <div className="relative z-10 flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#9BE749] text-[#9BE749] font-semibold text-sm leading-none">
                  {i + 1}
                </div>
                <p className="text-sm md:text-base leading-relaxed text-slate-900">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
  