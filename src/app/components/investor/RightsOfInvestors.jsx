"use client";
import { motion } from "framer-motion";
import { WobbleCard } from "../ui/wobble-card";

const rights = [
    "Right to Privacy and Confidentiality",
    "Right to Transparent Practices",
    "Right to fair and Equitable Treatment",
    "Right to Adequate Information",
    "Right to Initial and Continuing Disclosure",
    "Right to receive information about all the statutory and regulatory disclosures",
    "Right to Fair & True Advertisement",
    "Right to Awareness about Service Parameters and Turnaround Times",
    "Right to be informed of the timelines for each service",
    "Right to be Heard and Satisfactory Grievance Redressal",
    "Right to Exit from Financial product or service in accordance with the terms and conditions agreed with the research analyst",
    "Right to receive clear guidance and caution notice when dealing in Complex and High-Risk Financial Products and Services",
    "Additional Rights to vulnerable consumers",
    "Right to get access to services in a suitable manner even if differently abled",
    "Right to provide feedback on the financial products and services used",
    "Right against coercive, unfair, and one-sided clauses in financial agreements",
  ];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function RightsOfInvestors() {
  return (
    <section className="w-full py-12 md:py-20 lg:py-24 px-5 sm:px-8 bg-gradient-to-b from-[#f8fafc] via-white to-[#f8fafc]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-4xl mx-auto mb-14 md:mb-16 space-y-3"
      >
        <p className="text-xs md:text-sm tracking-[0.3em] text-lime-600 font-semibold uppercase">
          Investor Protection
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
          Rights of Investors
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          Each right is backed by our SEBI-compliant processes to keep your trading journey transparent, fair, and secure.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto"
      >
        {rights.map((text, i) => (
          <motion.div key={i} variants={cardVariants} className="h-full">
            <WobbleCard
              containerClassName="h-full border border-purple-400 bg-purple-200/60"
              className="flex h-full flex-col gap-4 justify-start items-start text-left"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9BE749] to-[#6d5bff] text-neutral-900 font-semibold shadow-[0_10px_30px_rgba(109,91,255,0.18)]">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Right</p>
                  <p className="text-sm font-semibold text-neutral-500">Investor Protection</p>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-slate-900">
                {text}
              </p>
            </WobbleCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
  