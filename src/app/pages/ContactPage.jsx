// File: trademilaan/src/pages/ContactPage.jsx
import React from "react";
import ContactHero from "@/components/ContactHero";
import ContactDetails from "@/components/ContactDetails";
import ContactForm from "@/components/ContactForm";

const ContactPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <ContactHero />

      {/* Main Content */}
      <section className="w-full py-16 md:py-24 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Contact Details */}
            <div>
              <ContactDetails />
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
