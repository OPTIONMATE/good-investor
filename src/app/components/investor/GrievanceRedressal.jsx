"use client";

import { motion } from "framer-motion";
import { FiGlobe, FiMail } from "react-icons/fi";

const cards = [
  {
    title: "Mode of filing the complaint on SCORES or with Research Analyst",
    body: [
      "Administration and Supervisory Body (RAASB)",
      "SCORES 2.0 (a web based centralized grievance redressal system of SEBI for facilitating effective grievance redressal in time-bound manner)",
      "Two level review for complaint/grievance against Research Analyst: i) First review done by designated body (RAASB) ii) Second review done by SEBI",
    ],
    icon: FiGlobe,
  },
  {
    title: "Email to designated email ID of RAASB",
    body: [
      "If the Investor is not satisfied with the resolution provided by the Market Participants, then the Investor has the option to file the complaint/ grievance on SMART ODR platform for its resolution through online conciliation or arbitration.",
      "With regard to physical complaints, investors may send their complaints to: Office of Investor Assistance and Education, Securities and Exchange Board of India, SEBI Bhavan, Plot No. C4-A, 'G' Block, Bandra-Kurla Complex, Bandra (E), Mumbai - 400 051",
    ],
    icon: FiMail,
  },
];

export default function GrievanceRedressal() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5f8ff] to-white py-16 px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden="true">
        <div className="absolute left-6 top-12 h-48 w-48 rounded-full bg-[#9BE749]/22" />
        <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-[#6d5bff]/18" />
        <div className="absolute left-1/2 top-1/4 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-300/10" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Grievance Support
          </p>
          <h2 className="text-center text-3xl md:text-4xl font-bold text-neutral-900">
            Details of grievance redressal mechanism and how to access it
          </h2>

          <div className="text-center text-gray-600 space-y-4">
            <p className="font-bold">
              Investor can lodge complaint/grievance against Research Analyst in the following ways:
            </p>

            <p>
              In case of any grievance / complaint, an investor may approach the concerned
              Research Analyst who shall strive to redress the grievance immediately, but not
              later than 21 days of the receipt of the grievance.
            </p>

            <p>
              File complaints through the{" "}
              <a
                href="https://scores.sebi.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-semibold"
              >
                SEBI SCORES grievance portal
              </a>{" "}
              or escalate unresolved disputes via the{" "}
              <a
                href="https://smartodr.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-semibold"
              >
                SMART ODR online dispute resolution platform
              </a>
              .
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
          {cards.map(({ title, body, icon: Icon }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, rotate: -0.25 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(17,24,39,0.08)] backdrop-blur"
            >
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#9BE749]/10 transition-transform duration-500 group-hover:scale-150" aria-hidden="true" />

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#6d5bff]/30 bg-white text-[#6d5bff] shadow-sm">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="space-y-3 text-left">
                  <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{title}</h3>
                  <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                    {body.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
