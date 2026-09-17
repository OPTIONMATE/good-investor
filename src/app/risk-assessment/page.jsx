"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Protected from "../components/Protected";
import { useAuth } from "../context/AuthContext";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function RiskAssessmentPage() {
  const router = useRouter();
  const { user, loading, fetchMe } = useAuth();

  const [riskForm, setRiskForm] = useState({
    years: "",
    job: "",
    savings: "",
    support: "",
    annual: "",
    objective: "",
    understanding: "",
    strategy: "",
    volatility: "",
    riskiest: "",
    reaction: "",
    taker: "",
  });

  const [formStatus, setFormStatus] = useState("");
  const [submittedAnswers, setSubmittedAnswers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Load saved risk profile on component mount or when user data is loaded
  useEffect(() => {
    if (!loading) {
      setIsPageLoading(false);
      if (user?.riskProfile) {
        const saved = user.riskProfile;
        setRiskForm(saved);
        setSubmittedAnswers(saved);
      }
    }
  }, [user, loading]);

  const handleRiskFormChange = (field, value) => {
    setRiskForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRiskFormSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (Object.values(riskForm).some((value) => !value)) {
      setFormStatus("Please answer all questions.");
      return;
    }

    setIsLoading(true);
    setFormStatus("");

    try {
      const response = await fetchWithCsrf("/api/risk-profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          riskProfile: riskForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Immediately show submitted state
        setSubmittedAnswers(riskForm);
        setFormStatus("Risk profile saved successfully!");
        
        // Refetch user data to sync with server
        if (fetchMe) {
          await fetchMe();
        }
      } else {
        setFormStatus(data.message || "Failed to save risk profile.");
      }
    } catch (error) {
      console.error("Error saving risk profile:", error);
      setFormStatus("An error occurred while saving your risk profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setSubmittedAnswers(null);
    setFormStatus("");
  };

  const goBack = () => {
    router.push("/profile");
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200/70 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Risk Assessment
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Complete this questionnaire to determine your risk profile
              </p>
            </div>
            <button
              onClick={goBack}
              className="hidden sm:inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition"
            >
              Back to Profile
            </button>
          </div>

          {!submittedAnswers ? (
            <form onSubmit={handleRiskFormSubmit} className="space-y-8">
              {/* Risk Capacity Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-3">
                  Risk Capacity
                </h2>

                {/* Question 1 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    1. The number of years you have until retirement is:
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Less than 5 years/ retired/ not applicable",
                      "About 5 - 15 years",
                      "About 15 - 25 years",
                      "More than 25 years",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="years"
                          value={option}
                          checked={riskForm.years === option}
                          onChange={() =>
                            handleRiskFormChange("years", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    2. Your present job or business is:
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Less secure/ Not Applicable",
                      "Relatively secure",
                      "Secure",
                      "Doesn't matter as you can easily find a good new job/ career",
                      "Doesn't matter as you already have enough wealth",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="job"
                          value={option}
                          checked={riskForm.job === option}
                          onChange={() => handleRiskFormChange("job", option)}
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 3 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    3. If your current source of income were to stop today, for
                    how long will your present savings support you?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Less than 3 months",
                      "3 - 6 months",
                      "6 months to 1 year",
                      "More than 1 year",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="savings"
                          value={option}
                          checked={riskForm.savings === option}
                          onChange={() =>
                            handleRiskFormChange("savings", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 4 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    4. You have to financially support:
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Only myself",
                      "Two people including myself",
                      "3 - 4 people other than myself",
                      "More than 4 people other than myself",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="support"
                          value={option}
                          checked={riskForm.support === option}
                          onChange={() =>
                            handleRiskFormChange("support", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 5 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    5. Your current annual family savings (income less expenses)
                    are:
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Under ₹2,00,000",
                      "Between ₹2,00,000 and ₹5,00,000",
                      "Between ₹5,00,000 and ₹10,00,000",
                      "Over ₹10,00,000",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="annual"
                          value={option}
                          checked={riskForm.annual === option}
                          onChange={() =>
                            handleRiskFormChange("annual", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 6 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    6. Which of these objectives is the most important to you
                    from an investment perspective?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Preserving wealth",
                      "Generating regular income to meet current requirements",
                      "Balance current income and long-term growth",
                      "Long-term growth",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="objective"
                          value={option}
                          checked={riskForm.objective === option}
                          onChange={() =>
                            handleRiskFormChange("objective", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Tolerance Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-neutral-900 border-b border-neutral-200 pb-3">
                  Risk Tolerance
                </h2>

                {/* Question 7 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    7. Which of the following best describes your understanding
                    of the investment market?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "An experienced investor, constantly keeps up to date with the investment market. Have exposure to various asset classes and fully aware of the risks involved to gain high returns",
                      "Awareness of the financial market is limited to information passed on by broker or financial planner. Rely on professionals to keep me updated",
                      "Little awareness of the investment market. However, want to build my knowledge and understanding",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="understanding"
                          value={option}
                          checked={riskForm.understanding === option}
                          onChange={() =>
                            handleRiskFormChange("understanding", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 8 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    8. Your preferred strategy for managing investment risk is:
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Do not want to reduce it as investment risk leads to higher returns over the long-term",
                      "To have a diversified investment portfolio across a range of asset classes to minimize risk.",
                      "To invest mainly in capital stable investments.",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="strategy"
                          value={option}
                          checked={riskForm.strategy === option}
                          onChange={() =>
                            handleRiskFormChange("strategy", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 9 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    9. An investment portfolio with high exposure to growth
                    assets tends to generate higher returns, albeit with some
                    volatility (fluctuations in value). To what extent are you
                    willing to experience shorter-term losses/ volatility to
                    generate higher returns?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Very comfortable. I understand higher returns may come with risk or fluctuation in the short term. However, over the long-term, there is a low risk of capital loss",
                      "Somewhat comfortable, assuming there is a limit to the volatility",
                      "Little uncomfortable seeing my investments fluctuate",
                      "More comfortable with investments that have minimal volatility",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="volatility"
                          value={option}
                          checked={riskForm.volatility === option}
                          onChange={() =>
                            handleRiskFormChange("volatility", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 10 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    10. Given below is a listing of investment choices from
                    least risky to most risky. Which is the riskiest option you
                    have invested in?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Savings Account, Fixed Deposit or Money Market Funds",
                      "Bonds or Debt Mutual Funds",
                      "Equity Mutual Funds",
                      "Real Estate Funds/ Commodity linked Products",
                      "Equity Shares/ Structured Products",
                      "Private Equity/ Venture Capital Funds",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="riskiest"
                          value={option}
                          checked={riskForm.riskiest === option}
                          onChange={() =>
                            handleRiskFormChange("riskiest", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 11 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    11. Over a three-month period, an investment you owned lost
                    20% and the overall stock market lost 20%. With the economic
                    climate ambiguous, it could plummet further or bounce right
                    back up, how would you react?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Sell all of my investments. (The preservation of capital is extremely important to me and I would rather not take the risk)",
                      "Sell some of the investment. (The climate is risky, and I would rather transfer my funds into more secure investments)",
                      "Do nothing with the investment. (This was a calculated risk, and I will leave the investments in place, expecting performance to improve)",
                      "Buy more of the investment. (I am a long-term investor and consider this sudden market correction as an opportunity to purchase additional shares at a lower cost basis)",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="reaction"
                          value={option}
                          checked={riskForm.reaction === option}
                          onChange={() =>
                            handleRiskFormChange("reaction", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 12 */}
                <div>
                  <p className="font-semibold text-neutral-900 mb-3">
                    12. How would you describe yourself as a risk-taker?
                  </p>
                  <div className="flex flex-col gap-2 ml-4">
                    {[
                      "Willing to take risks for higher return",
                      "Can take calculated risks",
                      "Low risk taking capability",
                      "Extremely averse to risk",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="taker"
                          value={option}
                          checked={riskForm.taker === option}
                          onChange={() =>
                            handleRiskFormChange("taker", option)
                          }
                          className="accent-lime-600 cursor-pointer"
                          required
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 rounded-full bg-lime-600 text-white font-semibold hover:bg-lime-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Submit Assessment"}
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-800 font-semibold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>

              {formStatus && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    formStatus.includes("successfully")
                      ? "bg-lime-50 border border-lime-200 text-lime-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <p className="font-semibold">{formStatus}</p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-lime-50 border border-lime-200 rounded-xl">
                <h3 className="font-bold text-lg text-lime-900 mb-4">
                  Your Risk Profile Submitted
                </h3>
                <p className="text-lime-800 mb-6">
                  Your risk assessment has been saved successfully. Review your
                  answers below.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lime-900 mb-3">
                      Risk Capacity
                    </h4>
                    <ul className="space-y-2 text-sm text-lime-900">
                      <li>
                        <span className="font-semibold">Years to retire:</span>{" "}
                        {submittedAnswers.years}
                      </li>
                      <li>
                        <span className="font-semibold">Job security:</span>{" "}
                        {submittedAnswers.job}
                      </li>
                      <li>
                        <span className="font-semibold">
                          Savings duration:
                        </span>{" "}
                        {submittedAnswers.savings}
                      </li>
                      <li>
                        <span className="font-semibold">
                          Financial dependents:
                        </span>{" "}
                        {submittedAnswers.support}
                      </li>
                      <li>
                        <span className="font-semibold">Annual savings:</span>{" "}
                        {submittedAnswers.annual}
                      </li>
                      <li>
                        <span className="font-semibold">Main objective:</span>{" "}
                        {submittedAnswers.objective}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lime-900 mb-3">
                      Risk Tolerance
                    </h4>
                    <ul className="space-y-2 text-sm text-lime-900">
                      <li>
                        <span className="font-semibold">
                          Market understanding:
                        </span>{" "}
                        {submittedAnswers.understanding}
                      </li>
                      <li>
                        <span className="font-semibold">Risk strategy:</span>{" "}
                        {submittedAnswers.strategy}
                      </li>
                      <li>
                        <span className="font-semibold">Volatility comfort:</span>{" "}
                        {submittedAnswers.volatility}
                      </li>
                      <li>
                        <span className="font-semibold">Riskiest investment:</span>{" "}
                        {submittedAnswers.riskiest}
                      </li>
                      <li>
                        <span className="font-semibold">Market reaction:</span>{" "}
                        {submittedAnswers.reaction}
                      </li>
                      <li>
                        <span className="font-semibold">Risk-taker profile:</span>{" "}
                        {submittedAnswers.taker}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 rounded-full bg-lime-600 text-white font-semibold hover:bg-lime-700 transition"
                >
                  Edit Assessment
                </button>
                <button
                  onClick={goBack}
                  className="px-6 py-3 rounded-full border border-neutral-200 text-neutral-800 font-semibold hover:bg-neutral-50 transition"
                >
                  Back to Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
