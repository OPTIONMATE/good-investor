import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-[260px] w-full flex items-center justify-center">
        <Image
          src="/privacy-banner.jpg" // place banner image in public/
          alt="Privacy Policy"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold">
          Privacy Policy
        </h1>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-10 text-gray-800 leading-relaxed">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Introduction</h2>
          <p>
            This Privacy Policy describes how <b>MS Sasikumar Peyyala</b> (“we”,
            “our”, “us”) collect, use, share, protect or otherwise process your
            personal data through our website{" "}
            <a
              href="https://trademilaan.in/"
              target="_blank"
              className="text-blue-600 underline"
            >
              https://trademilaan.in/
            </a>{" "}
            (“Platform”). By using this Platform, you agree to be governed by
            this Privacy Policy and the laws of India. If you do not agree,
            please do not use the Platform.
          </p>
        </section>

        {/* Collection */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Collection of Information</h2>
          <p>
            We collect your personal data when you register, use our services,
            or otherwise interact with us. This may include your name, date of
            birth, address, phone number, email ID, and identity/address proofs.
          </p>
          <p className="mt-2">
            With your consent, we may also collect sensitive personal data such
            as bank details, payment instrument information, or biometric data,
            in accordance with applicable laws. You may choose not to provide
            certain information by not using specific features.
          </p>
          <p className="mt-2">
            We may track your behaviour and preferences on our Platform for
            analytics and service improvement. We may also receive information
            from third-party partners, governed by their respective privacy
            policies.
          </p>
          <p className="mt-2">
            Beware of fraudulent communications seeking sensitive information.
            We will never ask for your debit/credit card PIN or passwords.
          </p>
        </section>

        {/* Usage */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Use of Information</h2>
          <p>
            We use your personal data to provide requested services, enhance
            customer experience, process transactions, resolve disputes,
            customize content, detect fraud, enforce terms, conduct research,
            and inform you about offers and updates.
          </p>
          <p className="mt-2">
            You may opt-out of marketing communications. Certain services may
            not be available if required permissions are not provided.
          </p>
        </section>

        {/* Sharing */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Sharing of Information</h2>
          <p>
            We may share your personal data within our group entities,
            affiliates, sellers, business partners, and third-party service
            providers to deliver services, comply with legal obligations, and
            prevent fraud.
          </p>
          <p className="mt-2">
            We may disclose data to government or law enforcement agencies when
            required by law or to protect rights, safety, and property.
          </p>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Security Precautions</h2>
          <p>
            We adopt reasonable security practices to protect your personal
            data. However, internet transmissions are not completely secure, and
            users accept inherent risks while using the Platform.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding your login credentials.
          </p>
        </section>

        {/* Retention */}
        <section>
          <h2 className="text-2xl font-bold mb-3">
            Data Deletion and Retention
          </h2>
          <p>
            You may delete your account through Platform settings or by writing
            to us. We may delay deletion if there are pending grievances or
            obligations.
          </p>
          <p className="mt-2">
            We retain data only as long as necessary or required by law. We may
            retain anonymized data for analytics and research purposes.
          </p>
        </section>

        {/* Rights */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Your Rights</h2>
          <p>
            You may access, rectify, and update your personal data through the
            functionalities available on the Platform.
          </p>
        </section>

        {/* Consent */}
        <section>
          <h2 className="text-2xl font-bold mb-3">Consent</h2>
          <p>
            By using the Platform, you consent to the collection, use, storage,
            and processing of your data in accordance with this Privacy Policy.
            You may withdraw consent by writing to our Grievance Officer with
            the subject line{" "}
            <b>“Withdrawal of consent for processing personal data”</b>.
          </p>
          <p className="mt-2">
            Withdrawal of consent is not retrospective and may affect your
            access to certain services.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="text-2xl font-bold mb-3">
            Changes to this Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Significant
            changes will be notified as required by applicable laws. Please
            review this page periodically.
          </p>
        </section>
      </div>
    </div>
  );
}
