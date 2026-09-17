"use client";

import { motion } from "framer-motion";
import { FiUser, FiAward, FiShield } from "react-icons/fi";
import { WobbleCard } from "../ui/wobble-card";

const cards = [
  {
    title: "Sasikumar Peyyala",
    desc: "Sasikumar Peyyala is engaged in the business of Research Analyst activities by providing Buy/Sell/Hold calls or other ratings defined to their clients.",
    icon: FiUser,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "SEBI Registration",
    desc: "Sasikumar Peyyala is registered as a Research Analyst under SEBI (Research Analyst) Regulations, 2014. SEBI Reg. No. INH000019327",
    icon: FiAward,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Disciplinary History",
    desc: "No disciplinary actions, penalties, or regulatory issues have ever been levied against Sasikumar Peyyala: INH000019327, partners, or associates",
    icon: FiShield,
    color: "from-emerald-500 to-teal-500",
  },
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

export default function MaterialDisclosureCards() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5f8ff] to-white py-16 px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
        aria-hidden
      >
        <div className="absolute left-8 top-10 h-56 w-56 rounded-full bg-blue-300/15" />
        <div className="absolute right-10 bottom-12 h-64 w-64 rounded-full bg-purple-300/12" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mx-auto mb-14 space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-lime-600">
            Material Information
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Disclosures of all material information Sasikumar Peyyala:
            INH000019327
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {cards.map(({ icon: Icon, color, title, desc }, idx) => (
            <motion.div key={idx} variants={cardVariants} className="h-full">
              <WobbleCard
                containerClassName={`h-full border border-slate-200/70 bg-gradient-to-br from-white/90 to-slate-500/20 hover:border-slate-300`}
                className="flex h-full flex-col gap-6 justify-start items-center text-center"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
                >
                  <Icon size={32} />
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-neutral-900 leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </WobbleCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
