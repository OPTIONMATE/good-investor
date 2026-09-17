"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    label: "Equity",
    title: "trademilaan Equity Pro",
    description:
      "AI-driven equity strategies with disciplined risk and consistent alpha hunting.",
    image: "/equity.jpeg",
    gradient: ["#5b3bdc", "#7b5af0"],
    accent: "#d8c9ff",
    points: [
      "Research-backed stock selection",
      "Risk-managed portfolio signals",
      "Consistent long-term approach",
    ],
  },
  {
    label: "options",
    title: "trademilaan Index Options Pro",
    description:
      "Precision option structures to navigate volatility with conviction.",
    image: "/options.jpg",
    gradient: ["#c53b6f", "#d65f9b"],
    accent: "#ffd8ec",
    points: [
      "Volatility-aware strategies",
      "Defined risk option structures",
      "High-probability trade setups",
    ],
  },
  {
    label: "Commodities",
    title: "trademilaan Commodities Pro",
    description:
      "Macro + data-backed insights for metals and energy momentum swings.",
    image: "/commodities.webp",
    gradient: ["#e0621d", "#f08c3a"],
    accent: "#ffe1c4",
    points: [
      "Gold, silver & crude coverage",
      "Trend + demand-supply analysis",
      "Institutional-style insights",
    ],
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

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
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

export default function Cards() {
  return (
    <section className="w-full py-24 md:py-28 px-5 sm:px-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-4xl mx-auto mb-14 md:mb-16"
      >
        <p className="text-xs md:text-sm tracking-[0.35em] text-lime-600 font-semibold uppercase mb-4">
          Our Services
        </p>
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
          Professional trading solutions across every market lane
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto"
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: {
                duration: 0.3,
              },
            }}
            className="relative overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(24,39,75,0.22)] min-h-[520px] md:min-h-[560px]"
            style={{
              background: `linear-gradient(165deg, ${service.gradient[0]}, ${service.gradient[1]})`,
            }}
          >
            <div className="flex h-full flex-col gap-6 px-6 md:px-8 pt-9 md:pt-10 pb-10 md:pb-12 text-white">
              <div className="w-full flex justify-start">
                <span
                  className="text-[11px] tracking-[0.25em] uppercase font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur"
                  style={{ color: service.accent }}
                >
                  {service.label}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold leading-snug">
                  {service.title}
                </h3>
                <p className="text-lg leading-relaxed text-white/90">
                  {service.description}
                </p>
              </div>

              <ul className="space-y-2 text-sm md:text-base text-white/85">
                {service.points.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: service.accent }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div>
                <Link
                  href="/services"
                  aria-label={`Learn more about ${service.title} trading service`}
                  className="mt-2 flex w-fit items-center justify-center gap-3 self-start rounded-full bg-white/15 px-5 py-3 text-sm font-semibold leading-none backdrop-blur transition-all duration-300 hover:bg-white hover:text-black group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Learn More
                  <svg
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentColor"
                  >
                    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                  </svg>
                </Link>
              </div>

              <div className="relative mt-auto flex justify-center">
                <div className="absolute inset-x-10 bottom-4 h-44 rounded-[26px] bg-black/10 blur-2xl" />
                <img
                  src={service.image}
                  alt={service.title}
                  className="relative z-10 h-48 w-full max-w-md object-cover rounded-[24px] shadow-2xl border border-white/15"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
