"use client";
import { motion } from "framer-motion";

export default function TextPara() {
  return (
    <section id="our-approach" className="relative h-[70vh] flex items-center">
      <div className="mx-auto px-6 max-w-5xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="mb-6 text-md font-medium tracking-wide text-lime-600 uppercase"
        >
          Our Approach
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-4xl leading-snug text-neutral-900"
        >
          Sasikumar Peyyala leverages advanced AI and machine learning to simplify
          complex market data into actionable insights. With nine years of financial
          expertise, he develops research-driven models that help traders and
          investors make smarter, faster, and more confident decisions in dynamic
          markets.
        </motion.p>
      </div>
    </section>
  );
}
