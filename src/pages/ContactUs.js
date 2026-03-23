import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { contactUsApis } from "../api";

export default function ContactUs() {
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [city, setCity] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [apiError, setApiError] = useState("");

  // Auto-redirect after success
  useEffect(() => {
    if (!submitted) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!/^\d{10}$/.test(mobileNo.trim())) {
      newErrors.mobileNo = "Enter a valid 10-digit mobile number.";
    }
    if (!city.trim()) {
      newErrors.city = "City is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await contactUsApis.submitContactForm({
        fullName: (firstName.trim() + (lastName.trim() ? " " + lastName.trim() : "")),
        mobileNumber: mobileNo.trim(),
        city: city.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-cover bg-top bg-no-repeat min-h-screen w-full"
      style={{ backgroundImage: "url('/img/home_bg.png')" }}
    >
      <Header pageName={{ hi: "lEidZ djsa", en: "Contact Us" }} />

      <div className="container mx-auto px-4 py-6">

        {/* ── Success Screen ─────────────────────────────────── */}
        {submitted ? (
          <div className="max-w-sm mx-auto mt-10 bg-[rgba(255,250,244,0.92)] backdrop-blur-sm rounded-3xl shadow-xl px-6 py-10 flex flex-col items-center text-center">

            {/* Animated tick */}
            <div className="relative flex items-center justify-center mb-6">
              <span className="absolute w-28 h-28 rounded-full bg-[#9A283D]/10 animate-ping" style={{ animationDuration: "1.5s" }} />
              <span className="absolute w-20 h-20 rounded-full bg-[#9A283D]/20" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-[#9A283D] flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 52 52" className="w-9 h-9" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="14,27 22,35 38,18" style={{ strokeDasharray: 40, strokeDashoffset: 0, transition: "stroke-dashoffset 0.5s ease" }} />
                </svg>
              </div>
            </div>

            <h2 className="font-hindi text-2xl theme_text font-semibold mb-1">धन्यवाद! 🙏</h2>
            <p className="font-eng text-[#9A283D] text-lg font-semibold mb-3">Thank You!</p>
            <p className="font-eng text-gray-500 text-sm mb-6">
              Your query has been submitted. We'll get back to you soon.
            </p>

            {/* Countdown progress */}
            <div className="w-full mb-5">
              <p className="font-eng text-sm text-gray-400 mb-2">
                Redirecting to home in{" "}
                <span className="font-semibold text-[#9A283D]">{countdown}s</span>…
              </p>
              <div className="w-full h-1.5 bg-[#9A283D]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9A283D] rounded-full"
                  style={{ width: `${(countdown / 3) * 100}%`, transition: "width 1s linear" }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate("/", { replace: true })}
              className="w-full bg-[#9A283D] text-white font-eng font-semibold py-3 rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>

        ) : (

          /* ── Form ─────────────────────────────────────────── */
          <div className="max-w-sm mx-auto bg-[rgba(255,250,244,0.92)] backdrop-blur-sm rounded-3xl shadow-xl">

            {/* Header strip — rounded-t-3xl keeps top corners intact */}
            <div className="theme_bg px-6 py-5 rounded-t-3xl">
              <h1 className="font-eng text-[#9A283D] text-xl font-bold text-center">Contact Us</h1>
              <p className="font-hindi text-[#9A283D]/80 text-sm text-center mt-0.5">हमसे संपर्क करें</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-4">

              {/* First Name — mandatory */}
              <div>
                <label className="block font-eng text-sm font-semibold text-[#9A283D] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }}
                  placeholder="Enter your first name"
                  className={`w-full px-4 py-3 rounded-xl border font-eng text-sm text-gray-700 bg-white outline-none transition-all
                    ${errors.firstName ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-[#9A283D]/25 focus:border-[#9A283D] focus:ring-2 focus:ring-[#9A283D]/20"}`}
                />
                {errors.firstName && (
                  <p className="mt-1 font-eng text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name — optional */}
              <div>
                <label className="block font-eng text-sm font-semibold text-[#9A283D] mb-1">
                  Last Name <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-3 rounded-xl border border-[#9A283D]/25 font-eng text-sm text-gray-700 bg-white outline-none focus:border-[#9A283D] focus:ring-2 focus:ring-[#9A283D]/20 transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block font-eng text-sm font-semibold text-[#9A283D] mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobileNo}
                    onChange={(e) => { setMobileNo(e.target.value.replace(/\D/g, "")); setErrors((p) => ({ ...p, mobileNo: "" })); }}
                    placeholder="10-digit mobile number"
                    className={`w-full px-4 py-3 rounded-xl border font-eng text-sm text-gray-700 bg-white outline-none transition-all
                      ${errors.mobileNo ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-[#9A283D]/25 focus:border-[#9A283D] focus:ring-2 focus:ring-[#9A283D]/20"}`}
                  />
                {errors.mobileNo && (
                  <p className="mt-1 font-eng text-xs text-red-500">{errors.mobileNo}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block font-eng text-sm font-semibold text-[#9A283D] mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }}
                  placeholder="Enter your city"
                  className={`w-full px-4 py-3 rounded-xl border font-eng text-sm text-gray-700 bg-white outline-none transition-all
                    ${errors.city ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-[#9A283D]/25 focus:border-[#9A283D] focus:ring-2 focus:ring-[#9A283D]/20"}`}
                />
                {errors.city && (
                  <p className="mt-1 font-eng text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* API error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="font-eng text-sm text-red-600 text-center">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-2xl font-eng font-semibold text-white shadow-md transition-all duration-300
                  ${loading ? "bg-[#9A283D]/60 cursor-not-allowed" : "bg-[#9A283D] hover:scale-105"}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </div>
                ) : (
                  "Submit 🙏"
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
