"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const INTRO_DURATION = 2000;

export default function PageIntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), INTRO_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] to-[#1a1a1e] text-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          role="dialog"
          aria-label="Page loading animation"
        >
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center"
            initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-lime-400/80 via-white/40 to-transparent blur-3xl"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            />
            <motion.div
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-400/15 backdrop-blur"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.9, ease: "easeInOut" }}
            >
              <motion.span
                className="text-lg font-bold tracking-wide uppercase"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.8, ease: "easeInOut" }}
              >
                trademilaan
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
