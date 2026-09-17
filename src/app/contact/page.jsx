import ContactHero from "@/app/components/ContactHero";
import ContactDetails from "@/app/components/ContactDetails";
import ContactForm from "@/app/components/ContactForm";

export const metadata = {
  title: "Contact Us - trademilaan",
  description:
    "Get in touch with trademilaan. We're here to help with your trading queries and support needs.",
};

export default function ContactPage() {
  return (
    <div className="w-full">
      <section className="w-full bg-neutral-900 py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
      </section>
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
}
