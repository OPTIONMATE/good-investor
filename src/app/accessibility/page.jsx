export const metadata = {
  title: "Accessibility Statement - trademilaan",
  description:
    "trademilaan accessibility commitment, WCAG 2.1 compliance goal, and how to report accessibility issues.",
};

export default function AccessibilityPage() {
  return (
    <div className="w-full bg-white">
      <section className="bg-neutral-900 py-14 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white">
          Accessibility Statement
        </h1>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-8 text-neutral-800 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold mb-3">Our Commitment</h2>
          <p>
            trademilaan is committed to ensuring digital accessibility for people
            with disabilities. We continually improve the user experience for
            everyone and apply relevant accessibility standards so that our
            website can be used by the widest possible audience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Conformance Goal</h2>
          <p>
            We aim to conform with the{" "}
            <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1
            Level AA standard. Our ongoing accessibility work includes keyboard
            navigation, semantic structure, form labels, color contrast,
            descriptive link text, and screen reader compatibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Measures We Take</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Include skip navigation and logical heading structure</li>
            <li>Provide text alternatives for informative images</li>
            <li>Ensure forms have visible labels and accessible error messages</li>
            <li>Maintain sufficient color contrast and visible focus indicators</li>
            <li>Review pages with accessibility testing tools and manual checks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Feedback and Assistance</h2>
          <p>
            If you experience difficulty accessing any part of this website, or
            if you require content in an alternative format, please contact us:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Email:{" "}
              <a
                href="mailto:spkumar.researchanalyst@gmail.com"
                className="text-blue-700 underline"
              >
                spkumar.researchanalyst@gmail.com
              </a>
            </li>
            <li>Phone: +91 7702262206</li>
          </ul>
          <p className="mt-3">
            When contacting us, please describe the page or feature you were
            trying to use and the assistive technology involved, if applicable.
            We will make reasonable efforts to respond and address the issue.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Assessment Approach</h2>
          <p>
            Accessibility is evaluated through a combination of automated testing,
            manual keyboard testing, and review against WCAG 2.1 Level A and AA
            success criteria. We update this statement as improvements are made.
          </p>
        </section>
      </div>
    </div>
  );
}
