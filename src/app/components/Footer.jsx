"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Grievance Redressal", path: "/grievance-redressal" },
    { name: "Accessibility Statement", path: "/accessibility" },
    { name: "MITC", path: "/mitc" },
    { name: "Terms and Condition", path: "/terms-and-condition" },
    { name: "Refund Policy", path: "/refund-policy" },
    { name: "Complaint Board", path: "/complaint-board" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];

  const socialLinks = [
    {
      name: "Follow Good Investor on Facebook",
      icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
      url: "https://www.facebook.com/optionmate/",
    },
    {
      name: "Follow Good Investor on Instagram",
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      url: "https://instagram.com/optionmateeducation/",
    },
    {
      name: "Follow Good Investor on YouTube",
      icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
      url: "https://youtube.com/@optionmateeducation",
    },
  ];

  const linkClass =
    "text-white hover:opacity-90 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-opacity duration-300 text-sm flex items-center group underline underline-offset-2";

  return (
    <footer className="footer-dark relative bottom-0 w-full bg-neutral-900 text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">About Us</h2>
            <p className="text-white leading-relaxed text-sm">
              Eeda Damodara Rao is a SEBI-registered research analyst with a
              deep passion for AI and machine learning-driven trading
              strategies. With over nine years of experience in financial
              markets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Quick Links</h2>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className={linkClass}>
                    <span className="mr-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300" aria-hidden="true">
                      →
                    </span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Follow Us</h2>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center hover:bg-neutral-600 hover:scale-110 transition-all duration-300 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={social.name}
                >
                  <svg
                    className="w-5 h-5 fill-white"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
            <div className="space-y-3 text-sm">
              <a href="tel:9704648777" className={linkClass}>
                9704648777
              </a>
              <a href="mailto:damu.researchanalyst@gmail.com" className={`${linkClass} break-all`}>
                damu.researchanalyst@gmail.com
              </a>
              <p className="text-white leading-relaxed">
                T2601, MY HOME TRIDASA, TELLAPUR, SANGA REDDY, HYDERABAD,
                TELANGANA, 502032
              </p>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-neutral-700 pt-8">
          <div className="mb-8 p-6 bg-neutral-800 border border-neutral-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-white">Accessibility Statement</h2>
            <p className="text-white text-sm leading-relaxed">
              We are committed to digital accessibility for people with disabilities and aim to meet{" "}
              <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1 Level AA.{" "}
              <Link href="/accessibility" className="underline hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Read our full accessibility statement
              </Link>
              {" "}or email{" "}
              <a href="mailto:damu.researchanalyst@gmail.com" className="underline hover:opacity-90">
                damu.researchanalyst@gmail.com
              </a>{" "}
              to report an issue.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white">
            <p className="text-center md:text-left">
              Good Investor Copyright©{currentYear}. All Right Reserved.
            </p>
            <p className="text-center md:text-right">
              Design & Developed by{" "}
              <span className="font-semibold">Good Investor</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-lime-600" aria-hidden="true" />
    </footer>
  );
};

export default Footer;
