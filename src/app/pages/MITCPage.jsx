// File: trademilaan/src/pages/MITCPage.jsx
import React from "react";
import MITCHero from "@/components/MITCHero";
import MITCContent from "@/components/MITCContent";

const MITCPage = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <MITCHero />

      {/* Main Content */}
      <section className="w-full py-16 md:py-24 px-6 bg-neutral-50">
        <MITCContent />
      </section>
    </div>
  );
};

export default MITCPage;
