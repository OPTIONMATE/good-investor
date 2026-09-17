"use client";

import { motion } from "framer-motion";
import { FiMail, FiPhone } from "react-icons/fi";

export default function ReportSection() {
  const contacts = [
    {
      icon: FiMail,
      label: "Email",
      value: "spkumar.researchanalyst@gmail.com",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FiPhone,
      label: "Contact Number",
      value: "+91 770 226 2206",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden py-16 px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
        aria-hidden
      >
        <div className="absolute left-8 top-12 h-56 w-56 rounded-full bg-blue-300/15" />
        <div className="absolute right-8 bottom-12 h-64 w-64 rounded-full bg-emerald-300/12" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Compliance & Support
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Report any unethical practices to our support/compliance team or
            SEBI.
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            We're committed to maintaining the highest ethical standards. Reach
            out anytime.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {contacts.map(({ icon: Icon, label, value, color }, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(17,24,39,0.08)] backdrop-blur"
            >
              <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${color} opacity-10 transition-transform duration-500 group-hover:scale-150`}
                aria-hidden
              />

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
                >
                  <Icon size={24} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {label}
                  </h3>
                  <p className="text-sm md:text-base font-medium text-slate-700 break-all">
                    {value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
