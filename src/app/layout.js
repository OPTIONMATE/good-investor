import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";

import { AuthProvider } from "./context/AuthContext";
import AppFrame from "./components/AppFrame";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s",
    default: "trademilaan - AI-Powered Market Insights",
  },
  description:
    "Empowering traders with AI-driven market insights. SEBI-registered research analyst providing expert trading strategies for equity, options, and commodities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppFrame>{children}</AppFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
