"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const line = {
  hidden: {
    y: 40,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // premium easing
    },
  },
};

export default function StaggeredLines({ lines, className }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {lines.map((text, i) => (
        <div key={i} className="overflow-hidden">
          <motion.h2 variants={line}>{text}</motion.h2>
        </div>
      ))}
    </motion.div>
  );
}
