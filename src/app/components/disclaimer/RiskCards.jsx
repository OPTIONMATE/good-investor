"use client";
const risks = [
  {
    title: "MARKET RISKS WARNING",
    desc: "Investment in securities market are subject to market risks. Read all the related documents carefully before investing",
  },
  {
    title: "LOSS POSSIBILITY",
    desc: "Market risks may result in partial or permanent loss of investments under certain market conditions.",
  },
  {
    title: "SEBI REGISTRATION",
    desc: "Registration granted by SEBI and certification from NISM do not guarantee the performance of intermediary returns to investors",
  },
  {
    title: "PAST PERFORMANCE",
    desc: "Past performance is not indicative of future results.",
  },
  {
    title: "NO WARRANTIES",
    desc: "search Analyst does not guarantee the accuracy, results, or reliability of content on its website, including merchantability, suitability, and non-infringement.",
  },
  {
    title: "EXERCISE CAUTION",
    desc: "We provide research analysis and specific securities but do not offer portfolio management services, personal account handling, profit sharing, or risk-profiling-based investment advisory services",
  },
  {
    title: "RISK ASSOCIATED IN OPEN POSITIONS",
    desc: "Our recommendations may stay open without stop-loss or target prices, possibly causing major portfolio losses in adverse markets.",
  },
  {
    title: "SEBI SPECIFIED MECHANISM FOR FEE COLLECTION",
    desc: "All research service fees must be paid online via Sasikumar Peyyala account gateway or CeFCoM other payments aren’t valid",
  },
];

import { motion } from "framer-motion";
import { WobbleCard } from "../ui/wobble-card";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
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

export default function RiskCards() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-white py-16 px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
        aria-hidden
      >
        <div className="absolute left-10 top-20 h-56 w-56 rounded-full bg-red-300/15" />
        <div className="absolute right-10 bottom-20 h-64 w-64 rounded-full bg-orange-300/12" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-lime-600">
            Important Disclosures
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Risk Warnings & Important Disclaimers
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {risks.map((item, i) => (
            <motion.div key={i} variants={cardVariants} className="h-full">
              <WobbleCard
                containerClassName="h-full border border-red-200/50 bg-gradient-to-br from-red-100/60 to-orange-100/30 hover:border-red-300/70"
                className="flex h-full flex-col gap-3 justify-start items-start text-left"
              >
                <h3 className="font-bold text-base md:text-lg text-neutral-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                  {item.desc}
                </p>
              </WobbleCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
