"use client";

import { motion } from "framer-motion";

const conflicts = [
  {
    category: "Financial Interest",
    text: "Sasikumar Peyyala: INH000019327 or its research analysts or his/her relative or associate don't have any direct or indirect financial interest in the subject company",
  },
  {
    category: "Material Conflicts",
    text: "Sasikumar Peyyala: INH000019327 or its research analysts, or his/her relative or associate don't have any other material conflict of interest at the time of publication of the research report.",
  },
  {
    category: "Securities Ownership",
    text: "Sasikumar Peyyala: INH000019327 or its research analysts, or his/her relative or associates don't have actual ownership of 1% or more securities of the subject company",
  },
  {
    category: "Compensation",
    text: "Sasikumar Peyyala: INH000019327 or its associates have received any compensation from the subject company in the past twelve months",
  },
  {
    category: "Public Offerings",
    text: "Sasikumar Peyyala: INH000019327 or its associates have managed or co-managed public offering of securities for the subject in the past twelve months",
  },
  {
    category: "Investment Banking",
    text: "Sasikumar Peyyala: INH000019327 or its associates have received any compensation for investment banking or merchant banking or brokerage services from the subject company in the past twelve months",
  },
  {
    category: "Other Services",
    text: "Sasikumar Peyyala: INH000019327 or its associates have received any compensation for products or services other than investment banking or merchant banking or brokerage services from the subject company in the past twelve months",
  },
  {
    category: "Additional Benefits",
    text: "Sasikumar Peyyala: INH000019327 or its associates have received any compensation or other benefits from the subject company or third party in connection with the research report The research analyst has not served as an officer, director, and employee of the subject company",
  },
  {
    category: "Market-Making",
    text: "Sasikumar Peyyala: INH000019327 or its research analyst has been engaged in the market-making activity for the subject company",
  },
  {
    category: "Past Compensation",
    text: "Sasikumar Peyyala: INH000019327 or its associates have received any compensation from the subject company in the past twelve months",
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

export default function OwnershipConflicts() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-16 px-4">
      {/* Background decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 blur-3xl"
        aria-hidden
      >
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-green-300/10" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-blue-300/8" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-green-600">
            Regulatory Compliance
          </p>
          <h2 className="text-3xl md:text-3xl lg:text-3xl font-bold text-neutral-900 leading-tight">
            Ownership & Material Conflicts of Interest
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Full disclosure of ownership stakes and material conflicts in
            accordance with SEBI regulations
          </p>
        </div>

        {/* Conflicts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12"
        >
          {conflicts.map((item, index) => (
            <motion.div key={index} variants={cardVariants} className="h-full">
              <div className="h-full border border-green-200/50 rounded-xl p-6 bg-gradient-to-br from-green-50/40 to-emerald-50/30 hover:border-green-300/70 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-700 text-base leading-snug pt-0.5">
                    {item.category}
                  </h3>
                </div>
                <p className="text-gray-900 text-sm leading-relaxed flex-grow">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
