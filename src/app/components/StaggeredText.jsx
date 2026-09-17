"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.035,
    },
  },
};

const word = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function StaggeredText({ text, className }) {
  return (
    <motion.p
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {text.split(" ").map((wordText, index) => (
        <motion.span
          key={index}
          variants={word}
          className="inline-block mr-2"
        >
          {wordText}
        </motion.span>
      ))}
    </motion.p>
  );
}
