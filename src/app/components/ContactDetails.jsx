export default function ContactDetails() {
  return (
    <div className="w-full space-y-6">
      {/* Contact Information Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
          Get in Touch
        </h2>

        <div className="space-y-6">
          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Phone
              </h3>
              <a
                href="tel:9704648777"
                className="text-lg text-neutral-900 hover:text-purple-600 transition-colors"
              >
                +91 97046 48777
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Email
              </h3>
              <a
                href="mailto:damu.researchanalyst@gmail.com"
                className="text-lg text-neutral-900 hover:text-purple-600 transition-colors break-all"
              >
                damu.researchanalyst@gmail.com
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Address
              </h3>
              <p className="text-sm text-neutral-900">
                T2601, MY HOME TRIDASA, TELLAPUR, SANGA REDDY, HYDERABAD,
                TELANGANA, 502032
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="w-full h-[300px] md:h-[400px]">
          <iframe
            src="https://maps.google.com/maps?q=T2601%2C%20MY%20HOME%20TRIDASA%2C%20TELLAPUR%2C%20SANGA%20REDDY%2C%20HYDERABAD%2C%20TELANGANA%20502032&z=17&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Good Investor Location"
            className="w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
