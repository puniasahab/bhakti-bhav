import React, { useEffect, useRef, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { getMobileNoFromLS, removeMobileNoFromLS, removeSubscriptionStatusFromLS, removeTokenFromLS, removeUserIdFromLS, removeUserName } from "../commonFunctions";
import useGA4BaseParams from "../hooks/useGA4BaseParams";
import useGA4Tracker from "../hooks/useGA4Tracker";
import { GA4Events } from "../utils/ga4Events.enum";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import "./ProfileLayout.css";

export default function ProfileLayout({ title, children }) {
  return (
    <div className="profile-page min-h-screen font-eng">
      <div className="profile-page-header">
        <Header showBrandBackHeader inlineHeader hideProfileAction />
        <h1 className="profile-page-title">{title}</h1>
      </div>
      <main className="profile-page-content">{children}</main>
    </div>
  );
}

export function ProfileSettingsMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const navigate = useNavigate();
  const baseParams = useGA4BaseParams("Header Component");
  const { trackEvent } = useGA4Tracker(baseParams);

  useEffect(() => {
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "keydown" || !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const logout = () => {
    trackCustomEvent(PIXEL_STANDARD_EVENTS.LOGOUT, { message: "Logout button Clicked", mobileNumber: getMobileNoFromLS() });
    trackEvent(GA4Events.logout_clicked, { event_label: "logout_clicked_from_header_on_edit_profile_screen" });
    removeTokenFromLS();
    removeUserName();
    removeUserIdFromLS();
    removeSubscriptionStatusFromLS();
    removeMobileNoFromLS();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative" ref={root}>
      <button type="button" className="profile-action" aria-label="Account settings" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Settings size={26} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 min-w-36 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9A283D] hover:bg-rose-50">
            <LogOut size={18} aria-hidden="true" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
