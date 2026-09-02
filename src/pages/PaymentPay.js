import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { paymentApis, profileApis } from "../api";
import {
  getMobileNoFromLS,
  setSubscriptionStatusInLS,
  setUserIdInLS,
  setUserName,
} from "../commonFunctions";
import { useAppStoreRedirect } from "../hooks/useAppStoreRedirect";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40;
const SUCCESS_STATUSES = ["ACTIVE"];
const WAITING_STATUSES = ["INITIALIZED", "PENDING", "BANK_APPROVAL_PENDING", "VERIFYING"];
const FAILURE_STATUSES = ["FAILED", "CANCELLED", "AUTHORIZATION_CANCELLED", "EXPIRED"];

const getStatusFromResponse = (response) => {
  return (
    response?.data?.status ||
    response?.data?.subscriptionStatus ||
    response?.data?.subscription_status ||
    response?.data?.cashfree?.subscription_status ||
    response?.status ||
    response?.subscriptionStatus ||
    response?.subscription_status ||
    ""
  ).toUpperCase();
};

export default function PaymentPay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { deviceType, redirectToStore, storeUrls } = useAppStoreRedirect();
  const subscriptionId = searchParams.get("subscription_id") || localStorage.getItem("cashfreeSubscriptionId") || "";
  const pollingStopped = useRef(false);
  const [status, setStatus] = useState("VERIFYING");
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("Confirming your auto-pay mandate...");
  const [checking, setChecking] = useState(true);

  const refreshProfile = async () => {
    const profile = await profileApis.getProfile();
    if (profile?._id) setUserIdInLS(profile._id);
    if (profile?.name) setUserName(profile.name === "New User" ? "" : profile.name);
    if (profile?.hasActivePlan) {
      setSubscriptionStatusInLS("true");
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!subscriptionId) {
      setChecking(false);
      setStatus("FAILED");
      setMessage("Subscription ID is missing. Please start payment again.");
      return;
    }

    localStorage.setItem("cashfreeSubscriptionId", subscriptionId);
    pollingStopped.current = false;

    const pollStatus = async () => {
      for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
        if (pollingStopped.current) return;
        setAttempts(attempt);

        try {
          const response = await paymentApis.getSubscriptionStatus(subscriptionId);
          const nextStatus = getStatusFromResponse(response) || "PENDING";
          localStorage.setItem("cashfreeSubscriptionStatus", nextStatus);
          setStatus(nextStatus);

          if (SUCCESS_STATUSES.includes(nextStatus)) {
            setMessage("Subscription confirmed. Refreshing your profile...");
            await refreshProfile();
            setSubscriptionStatusInLS("true");
            trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_SUCCESSFUL, {
              subscriptionId,
              status: nextStatus,
              mobileNumber: getMobileNoFromLS(),
            });
            setChecking(false);
            setMessage("Your Bhakti Bhav Plus subscription is active.");
            return;
          }

          if (FAILURE_STATUSES.includes(nextStatus)) {
            setSubscriptionStatusInLS("false");
            trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_FAILED, {
              subscriptionId,
              status: nextStatus,
              mobileNumber: getMobileNoFromLS(),
            });
            setChecking(false);
            setMessage("Payment was not confirmed. Please try again.");
            return;
          }
        } catch (error) {
          console.error("PaymentPay subscription polling failed:", error);
        }

        try {
          const hasActivePlan = await refreshProfile();
          if (hasActivePlan) {
            localStorage.setItem("cashfreeSubscriptionStatus", "ACTIVE");
            setStatus("ACTIVE");
            trackCustomEvent(PIXEL_STANDARD_EVENTS.PAYMENT_SUCCESSFUL, {
              subscriptionId,
              status: "ACTIVE",
              mobileNumber: getMobileNoFromLS(),
            });
            setChecking(false);
            setMessage("Your Bhakti Bhav Plus subscription is active.");
            return;
          }
        } catch (profileError) {
          console.error("PaymentPay profile refresh failed:", profileError);
        }

        if (attempt < MAX_POLL_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      }

      if (!pollingStopped.current) {
        setChecking(false);
        setStatus("PENDING");
        localStorage.setItem("cashfreeSubscriptionStatus", "PENDING");
        setMessage("Payment is still pending. We will confirm it shortly.");
      }
    };

    pollStatus();

    return () => {
      pollingStopped.current = true;
    };
  }, [subscriptionId]);

  const handleDownloadApp = () => {
    if (deviceType === "ios" || deviceType === "android") {
      redirectToStore();
      return;
    }
    window.location.href = storeUrls.android;
  };

  const isSuccess = SUCCESS_STATUSES.includes(status);
  const isFailed = FAILURE_STATUSES.includes(status);
  const isPendingConfirmation = !checking && WAITING_STATUSES.includes(status);
  const isWaiting = checking;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-4 py-8 font-eng">
      <div className="w-full max-w-md rounded-[28px] bg-white px-6 py-8 text-center shadow-xl">
        <img src="/img/logo_splash.png" alt="Bhakti Bhav" className="mx-auto h-28 w-32 object-contain" />

        <div className="mt-6 flex justify-center">
          {isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-600" />
          ) : isFailed ? (
            <XCircle className="h-16 w-16 text-red-600" />
          ) : isPendingConfirmation ? (
            <Clock className="h-16 w-16 text-[#9A283D]" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#F2D7A4] border-t-[#9A283D] animate-spin" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-[#9A283D]">
          {isSuccess
            ? "Payment Confirmed"
            : isFailed
              ? "Payment Not Confirmed"
              : isPendingConfirmation
                ? "Confirmation Pending"
                : "Verifying Payment"}
        </h1>
        <p className="mt-3 text-sm font-medium text-gray-600">{message}</p>

        {subscriptionId && (
          <div className="mt-5 rounded-2xl border border-[#F0D4DA] bg-[#FFF8F0] px-4 py-3 text-left">
            <p className="text-xs text-gray-500">Subscription ID</p>
            <p className="break-all text-sm font-bold text-[#9A283D]">{subscriptionId}</p>
            <p className="mt-3 text-xs text-gray-500">Status</p>
            <p className="text-sm font-bold text-[#9A283D]">{status}</p>
          </div>
        )}

        {isWaiting && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Checking every 3 seconds ({attempts}/{MAX_POLL_ATTEMPTS})
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {isSuccess && (
            <button
              type="button"
              onClick={handleDownloadApp}
              className="w-full rounded-2xl bg-[#9A283D] py-4 text-lg font-bold text-white shadow-lg"
            >
              Download App
            </button>
          )}

          {!checking && !isSuccess && (
            <button
              type="button"
              onClick={() => navigate("/payment")}
              className="w-full rounded-2xl bg-[#9A283D] py-4 text-lg font-bold text-white shadow-lg"
            >
              Try Again
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/app-events1", { replace: true })}
            className="w-full rounded-2xl border border-[#9A283D] py-3 text-base font-bold text-[#9A283D]"
          >
            Back to App Event
          </button>
        </div>
      </div>
    </div>
  );
}
