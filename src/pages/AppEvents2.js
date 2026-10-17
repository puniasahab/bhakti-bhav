import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getIsLoggedIn,
  getMobileNoFromLS,
  getTokenFromLS,
  getUserIdFromLS,
  setIsLoggedIn,
  setMobileNoInLS,
  setTokenInLS,
  setUserIdInLS,
} from "../commonFunctions";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.bhaktibhav.app/frontend/";
const APPSFLYER_URL =
  process.env.REACT_APP_APPSFLYER_URL ||
  process.env.NEXT_PUBLIC_APPSFLYER_URL ||
  "https://bhakti-bhav-referral.onelink.me/VOv8";

const getOrCreateAppEvents2DeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (deviceId) return deviceId;

  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    deviceId = crypto.randomUUID();
  } else {
    deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
      const random = (Math.random() * 16) | 0;
      const value = char === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
  }

  localStorage.setItem("deviceId", deviceId);
  return deviceId;
};

const buildApiUrl = (path) => `${API_BASE_URL.replace(/\/$/, "")}/${path}`;

async function generateAppEvents2Otp(mobileNumber) {
  const response = await fetch(buildApiUrl("generate-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mobileNumber,
      source: "web",
      deviceId: getOrCreateAppEvents2DeviceId(),
      userId: getUserIdFromLS(),
    }),
  });

  const data = await response.json();
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Failed to send OTP");
  }
  return data;
}

async function verifyAppEvents2Otp(mobileNumber, otp) {
  const response = await fetch(buildApiUrl("verify-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mobileNumber,
      otp,
      source: "web",
      deviceId: getOrCreateAppEvents2DeviceId(),
    }),
  });

  const data = await response.json();
  if (!response.ok || !data?.token) {
    throw new Error(data?.message || "OTP verification failed");
  }
  return data;
}

const WEB_LOGIN_TOKEN_URL =
  process.env.REACT_APP_WEB_LOGIN_TOKEN_URL ||
  "https://api.bhaktibhav.app/api/v2/users/web-login-token";

async function createAppEvents2WebLoginToken(userJwtToken) {
  const response = await fetch(WEB_LOGIN_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userJwtToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data?.token) {
    throw new Error(data?.message || "Unable to generate app login token");
  }
  return data.token;
}

const AppEvents2 = () => {
  const [mobile, setMobile] = useState(getMobileNoFromLS() || "");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState(getIsLoggedIn() && getTokenFromLS() ? "download" : "login");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const otpCode = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleGenerateOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const data = await generateAppEvents2Otp(mobile);
      setUserIdInLS(data?.userId);
      setMobileNoInLS(mobile);
      setOtp(["", "", "", ""]);
      setTimeLeft(30);
      setStep("otp");
      setMessage("OTP sent successfully.");
    } catch (err) {
      setError(err?.message || "Something went wrong while sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (otpCode.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const data = await verifyAppEvents2Otp(getMobileNoFromLS() || mobile, otpCode);
      setTokenInLS(data.token);
      setIsLoggedIn();
      setStep("download");
      setMessage("Login successful. You can download the app now.");
    } catch (err) {
      setError(err?.message || "OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpChange = (event, index) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 1);
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`app-events2-otp-${index + 1}`)?.focus();
    }

    if (value && updatedOtp.every((digit) => digit !== "")) {
      setTimeout(() => document.getElementById("app-events2-verify-btn")?.click(), 100);
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`app-events2-otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otp.length);
    if (!pasteData) return;

    const updatedOtp = [...otp];
    pasteData.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });
    setOtp(updatedOtp);

    const focusIndex = Math.min(pasteData.length - 1, otp.length - 1);
    document.getElementById(`app-events2-otp-${focusIndex}`)?.focus();

    if (updatedOtp.every((digit) => digit !== "")) {
      setTimeout(() => document.getElementById("app-events2-verify-btn")?.click(), 100);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || isSendingOtp) return;
    await handleGenerateOtp({ preventDefault: () => { } });
  };

  const handleDownloadAppClick = async () => {
    setError("");
    setMessage("");

    const userJwtToken = getTokenFromLS();
    if (!userJwtToken) {
      setStep("login");
      setError("Please login first to continue.");
      return;
    }

    setIsGeneratingLink(true);
    try {
      const token = await createAppEvents2WebLoginToken(userJwtToken);
      // const link = `${APPSFLYER_URL}?af_xp=custom&pid=web_login&deep_link_value=auto_login&web_token=${encodeURIComponent(token)}`;
      const link = `${APPSFLYER_URL}?pid=User_invite&af_click_lookback=30d&c=web_login&deep_link_value=auto_login&deep_link_sub1=${encodeURIComponent(token)}`;
      window.location.href = link;
    } catch (err) {
      console.error("Error generating app link:", err);
      setError(err?.message || "Unable to generate app link.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f0] text-gray-900 font-eng">
      <nav className="sticky top-0 z-40 border-b border-red-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex flex-col">
            <span className="text-xl font-black leading-none text-[#9A283D]">Bhakti Bhav</span>
            <span className="mt-1 text-[11px] font-semibold text-gray-500">Daily devotion, peaceful living</span>
          </Link>
          <button
            type="button"
            onClick={step === "download" ? handleDownloadAppClick : () => document.getElementById("app-events2-login-card")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-lg bg-[#9A283D] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#7a1f30] disabled:opacity-60"
            disabled={isGeneratingLink}
          >
            {step === "download" ? "App Download" : "Login"}
          </button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-14">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#9A283D] shadow-sm">
            App login in one tap
          </div>
          <h1 className="text-4xl font-black leading-tight text-gray-950 md:text-6xl">
            Log in and continue in the app with auto-login
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-gray-600 md:text-lg">
            After OTP verification, the download button will appear. A fresh web-login token is generated only when the button is clicked, then you will be redirected through the AppsFlyer link.
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["1", "Mobile"],
              ["2", "OTP"],
              ["3", "Download"],
            ].map(([count, label]) => (
              <div key={label} className="rounded-lg border border-red-100 bg-white p-4 text-center shadow-sm">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#9A283D] text-sm font-black text-white">
                  {count}
                </div>
                <div className="text-sm font-bold text-gray-700">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="app-events2-login-card" className="rounded-2xl border border-red-100 bg-white p-5 shadow-xl md:p-7">
          {step === "login" && (
            <form onSubmit={handleGenerateOtp}>
              <h2 className="text-2xl font-black text-[#9A283D]">Login</h2>
              <p className="mt-2 text-sm font-medium text-gray-500">Enter your mobile number to receive OTP.</p>

              <label className="mt-6 block text-sm font-bold text-gray-700" htmlFor="app-events2-mobile">
                Mobile Number
              </label>
              <div className="mt-2 flex overflow-hidden rounded-lg border border-red-200 bg-white focus-within:ring-2 focus-within:ring-[#9A283D]/30">
                <span className="flex items-center border-r border-red-100 px-4 text-base font-bold text-gray-700">+91</span>
                <input
                  id="app-events2-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 digit number"
                  className="min-h-12 w-full px-4 text-base font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="mt-6 w-full rounded-lg bg-[#9A283D] px-5 py-3 text-base font-black text-white shadow-md transition hover:bg-[#7a1f30] disabled:opacity-60"
              >
                {isSendingOtp ? "Sending OTP..." : "Generate OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div>
              <h2 className="text-2xl font-black text-[#9A283D]">Verify OTP</h2>
              <p className="mt-2 text-sm font-medium text-gray-500">
                Code sent to <span className="font-black text-gray-800">{getMobileNoFromLS() || mobile}</span>
              </p>

              <div className="mt-6 flex justify-between gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`app-events2-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(event) => handleOtpChange(event, index)}
                    onKeyDown={(event) => handleOtpKeyDown(event, index)}
                    className="h-14 w-full rounded-lg border border-red-200 text-center text-2xl font-black text-[#9A283D] outline-none focus:ring-2 focus:ring-[#9A283D]/30"
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-bold">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timeLeft > 0 || isSendingOtp}
                  className="text-[#9A283D] disabled:text-gray-400"
                >
                  Resend OTP
                </button>
                <span className="text-gray-500">{timeLeft > 0 ? `${timeLeft}s` : "0s"}</span>
              </div>

              <button
                id="app-events2-verify-btn"
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="mt-6 w-full rounded-lg bg-[#9A283D] px-5 py-3 text-base font-black text-white shadow-md transition hover:bg-[#7a1f30] disabled:opacity-60"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtp(["", "", "", ""]);
                  setError("");
                  setMessage("");
                }}
                className="mt-3 w-full rounded-lg border border-red-200 px-5 py-3 text-sm font-bold text-[#9A283D] transition hover:bg-red-50"
              >
                Change mobile number
              </button>
            </div>
          )}

          {step === "download" && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
              <h2 className="mt-5 text-2xl font-black text-[#9A283D]">Login successful</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                A fresh auto-login token will be generated when you click the download button. The token is not generated before that.
              </p>
              <button
                type="button"
                onClick={handleDownloadAppClick}
                disabled={isGeneratingLink}
                className="mt-7 w-full rounded-lg bg-gradient-to-r from-[#9A283D] to-[#590f1d] px-5 py-3 text-base font-black text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60"
              >
                {isGeneratingLink ? "Generating secure link..." : "Download App & Auto Login"}
              </button>
            </div>
          )}

          {(message || error) && (
            <div
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
                }`}
            >
              {error || message}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-red-100 bg-white px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            ["Token on click", "The web-login token is generated only when the download button is clicked."],
            ["JWT protected", "The request uses the stored user JWT in the Authorization header."],
            ["Auto login link", "The AppsFlyer link opens with the auto_login deep link value."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-red-100 bg-[#fff8f0] p-5 shadow-sm">
              <h3 className="text-base font-black text-[#9A283D]">{title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AppEvents2;
