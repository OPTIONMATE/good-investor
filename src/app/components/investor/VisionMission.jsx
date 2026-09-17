"use client";

import { motion } from "framer-motion";
import { FiEye, FiTarget } from "react-icons/fi";

export default function VisionMission() {
  const items = [
    {
      title: "Vision",
      text: "Invest with knowledge and safety to secure your financial future. Make informed decisions, minimize risks, and grow your wealth confidently with expert guidance and smart strategies.",
      icon: FiEye,
    },
    {
      title: "Mission",
      text: "Every investor should be able to invest in right investment products based on their needs, manage and monitor them to meet their goals, access reports and enjoy financial wellness.",
      icon: FiTarget,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f9ff] to-white py-16 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Strategic Direction
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Vision and Mission Statements for investors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {items.map(({ title, text, icon: Icon }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)] backdrop-blur hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#9BE749]/8 transition-all duration-500" aria-hidden />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#9BE749] to-[#6d5bff] text-white shadow-md">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">{title}</h3>
                </div>
                <p className="text-base leading-relaxed text-neutral-700">
                  {text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
