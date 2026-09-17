"use client";

import { motion } from "framer-motion";

export default function ServicesOnboarding() {
  const services = [
    "A. Sharing of terms & conditions of research services",
    "B. Completing KYC of fee paying clients",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f6f9ff] to-white py-16 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Onboarding Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Details of services provided to investors (No Indicative Timelines) Onboarding of Clients
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-5 justify-center">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              whileHover={{ y: -3 }}
              className="rounded-full border border-slate-200/70 bg-orange-100 px-8 py-4 text-center shadow-[0_12px_30px_rgba(17,24,39,0.06)] backdrop-blur transition"
            >
              <p className="text-sm md:text-base font-semibold text-neutral-800">
                {service}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
  