"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FiArrowRight, FiMail, FiMapPin } from "react-icons/fi";

export const RevealBento = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#f7f9ff] to-white px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 blur-3xl"
        aria-hidden="true"
      >
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-[#9BE749]/30" />
        <div className="absolute right-12 bottom-28 h-72 w-72 rounded-full bg-[#6d5bff]/25" />
      </div>
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          staggerChildren: 0.05,
        }}
        className="relative mx-auto grid max-w-5xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <SocialsBlock />
        <LocationBlock />
        <EmailListBlock />
      </motion.div>
    </div>
  );
};

const Block = ({ className, ...rest }) => {
  return (
    <motion.div
      variants={{
        initial: {
          scale: 0.5,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "col-span-4 rounded-xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)] backdrop-blur",
        className,
      )}
      {...rest}
    />
  );
};

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <div className="mb-4 size-14 rounded-full bg-gradient-to-br from-[#9BE749] to-[#6d5bff] text-neutral-900 flex items-center justify-center text-3xl shadow-lg shadow-[#9BE749]/35">
      <span aria-hidden="true">📊</span>
    </div>
    <h2 className="mb-12 text-4xl font-semibold leading-tight text-neutral-900">
      trademilaan.{" "}
      <span className="text-slate-500 font-normal">
        AI-Powered Market Insights for Smarter Trading.
      </span>
    </h2>
    <a
      href="/contact"
      aria-label="Contact trademilaan for more information about our services"
      className="flex items-center gap-2 text-[#6d5bff] font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d5bff]"
    >
      Contact us <FiArrowRight aria-hidden="true" />
    </a>
  </Block>
);

const HoverLiftBlock = ({ title, description }) => {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { y: 0 },
        hover: { y: -4 },
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
      }}
      className="relative col-span-6 md:col-span-3 h-48 cursor-pointer rounded-xl"
    >
      <div className="relative h-full overflow-hidden rounded-xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#9BE749] hover:shadow-[0_18px_40px_rgba(109,91,255,0.22)]">
        <motion.h3
          variants={{
            rest: { opacity: 1, y: 0 },
            hover: { opacity: 0, y: -8 },
          }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center text-center text-lg font-semibold text-neutral-900"
        >
          {title}
        </motion.h3>

        <motion.p
          variants={{
            rest: { opacity: 0, y: 8 },
            hover: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm leading-relaxed text-slate-600"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
};

const SocialsBlock = () => (
  <>
    <HoverLiftBlock
      title="SEBI-Registered Expertise"
      description="Backed by trusted regulatory recognition and over nine years of market experience."
    />
    <HoverLiftBlock
      title="Data Driven Insights"
      description="Actionable research that empowers smarter and faster decision-making."
    />
    <HoverLiftBlock
      title="Transparency & Trust"
      description="A commitment to accuracy, reliability, and investor confidence."
    />
    <HoverLiftBlock
      title="Sustainable Growth"
      description="Focused on long-term consistency, not short-term gains."
    />
  </>
);

const LocationBlock = () => (
  <Block className="col-span-12 flex flex-col items-center gap-4 md:col-span-3">
    <FiMapPin className="text-3xl text-[#6d5bff]" aria-hidden="true" />
    <p className="text-center text-lg text-slate-600">
      Vijayawada, Andhra Pradesh
    </p>
  </Block>
);

const EmailListBlock = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!email.trim()) {
      setError("Enter your email address to subscribe.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address, for example name@example.com.");
      return;
    }

    setStatus("Thank you! You have been subscribed to market insights and updates.");
    setEmail("");
  };

  return (
    <Block className="col-span-12 md:col-span-9">
      <h2 className="mb-3 text-lg text-neutral-900">
        Get Market Insights & Updates
      </h2>
      <form onSubmit={handleSubscribe} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="w-full">
          <label htmlFor="email-subscribe" className="mb-1 block text-sm font-semibold text-neutral-800">
            Email address
          </label>
          <input
            id="email-subscribe"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            autoComplete="email"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "subscribe-error subscribe-help" : "subscribe-help"}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-inner shadow-slate-100 transition-colors focus:border-[#6d5bff] focus:ring-2 focus:ring-[#6d5bff]/25 focus:outline-0"
          />
          <p id="subscribe-help" className="mt-1 text-xs text-slate-600">
            We will send market insights and updates to this email address.
          </p>
          {error && (
            <p id="subscribe-error" role="alert" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
          {status && (
            <p role="status" aria-live="polite" className="mt-1 text-sm text-green-700">
              {status}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="mt-6 flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#4a8018] via-[#5a9e2e] to-[#6d5bff] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_30px_rgba(109,91,255,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a8018] sm:mt-7"
        >
          <FiMail aria-hidden="true" /> Subscribe
        </button>
      </form>
    </Block>
  );
};
