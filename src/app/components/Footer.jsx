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
      name: "Follow trademilaan on Facebook",
      icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
      url: "https://www.facebook.com/trademilaan",
    },
    {
      name: "Follow trademilaan on Twitter",
      icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
      url: "https://twitter.com/trademilaan",
    },
    {
      name: "Follow trademilaan on YouTube",
      icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
      url: "https://www.youtube.com/@trademilaan",
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
              Sasikumar Peyyala is a SEBI-registered research analyst with a
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
              <a href="tel:07702262206" className={linkClass}>
                7702262206
              </a>
              <a href="mailto:spkumar.researchanalyst@gmail.com" className={`${linkClass} break-all`}>
                spkumar.researchanalyst@gmail.com
              </a>
              <p className="text-white leading-relaxed">
                1 24,29 4 Kummaripalem Centerr, Near D S M, High School,
                Vidyadharapuram, Vijayawada, VIJAYAWADA, ANDHRA PRADESH, 520012
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
              <a href="mailto:spkumar.researchanalyst@gmail.com" className="underline hover:opacity-90">
                spkumar.researchanalyst@gmail.com
              </a>{" "}
              to report an issue.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white">
            <p className="text-center md:text-left">
              trademilaan Copyright©{currentYear}. All Right Reserved.
            </p>
            <p className="text-center md:text-right">
              Design & Developed by{" "}
              <span className="font-semibold">trademilaan</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-lime-600" aria-hidden="true" />
    </footer>
  );
};

export default Footer;
