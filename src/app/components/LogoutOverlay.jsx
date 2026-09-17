"use client";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "motion/react";

export default function LogoutOverlay() {
  const { loggingOut } = useAuth();

  return (
    <AnimatePresence>
      {loggingOut && (
        <motion.div
          className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-12 w-12 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin" />
            <p className="text-sm font-semibold text-white">Signing out...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
