"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const items = [
  "To disclose, information that is material for the client to make an informed decision, including details of its business activity, disciplinary history, the terms and conditions of research services, details of associates, risks and conflicts of interest, if any",
  "To disclose the extent of use of Artificial Intelligence tools in providing research services",
  "To disclose, while distributing a third party research report, any material conflict of interest of such third party research provider or provide web address that directs a recipient to the relevant disclosures",
  "To disclose any conflict of interest of the activities of providing research services with other activities of the research analyst.",
  "To distribute research reports and recommendations to the clients without discrimination.",
  "To maintain confidentiality w.r.t publication of the research report until made available in the public domain.",
  "To respect data privacy rights of clients and take measures to protect unauthorized use of their confidential information",
  "To disclose the timelines for the services provided by the research analyst to clients and ensure adherence to the said timelines",
  "To provide clear guidance and adequate caution notice to clients when providing recommendations for dealing in complex and high-risk financial products/services",
  "To treat all clients with honesty and integrity",
  "To ensure confidentiality of information shared by clients unless such information is required to be provided in furtherance of discharging legal obligations or a client has provided specific consent to share such information.",
];

export default function DisclosureToClients() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f9fafb] to-[#f0f4ff] py-16 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-50 blur-3xl" aria-hidden>
        <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-[#9BE749]/20" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#6d5bff]/15" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-blue-300/10" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-neutral-600">
            What We Commit To
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neutral-900 via-[#6d5bff] to-neutral-900 bg-clip-text text-transparent">
            Disclosure to Clients
          </h2>
         
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {items.map((text, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <button
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full text-left group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-[0_8px_20px_rgba(17,24,39,0.06)] backdrop-blur transition hover:border-[#6d5bff]/40 hover:shadow-[0_12px_28px_rgba(109,91,255,0.12)]">
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#6d5bff]/8 transition-all duration-500 group-hover:scale-150" aria-hidden />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#9BE749] text-neutral-900 font-bold text-sm shadow-md">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm md:text-base leading-relaxed text-neutral-800 font-medium">
                          {text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
  