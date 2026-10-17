import React, { useEffect, useState } from "react";
import { Award, CalendarDays, ChevronRight, Clock3, Mail, MapPin, Mars, Phone, SquarePen, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProfileLayout, { ProfileSettingsMenu } from "../components/ProfileLayout";
import { profileApis } from "../api";
import { getTokenFromLS, getSubscriptionStatusFromLS, setUserName, setUserIdInLS } from "../commonFunctions";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import { formatBirthDate, formatBirthTime, normalizeProfile, profileImageUrl } from "../utils/profile";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => normalizeProfile());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    trackCustomEvent(PIXEL_STANDARD_EVENTS.PROFILE_PAGE_VISITED, { message: "User visited profile page", mobileNumber: getTokenFromLS() ? "Yes" : "No" });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    profileApis.getProfile().then((response) => {
      if (!active) return;
      const data = normalizeProfile(response);
      setProfile(data);
      if (data._id) setUserIdInLS(data._id);
      setUserName(data.name === "New User" ? "" : data.name);
    }).catch(() => {
      if (active) setError("Unable to load your profile. Please try again.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [retry]);

  const fields = [
    { label: "Full Name*", value: profile.name, Icon: UserRound },
    { label: "Mobile Number*", value: profile.mobileNumber, Icon: Phone },
    { label: "Email*", value: profile.email, Icon: Mail },
    { label: "Location", value: profile.state, Icon: MapPin },
    { label: "Date of Birth", value: formatBirthDate(profile.dateOfBirth), Icon: CalendarDays },
    { label: "Birth Place", value: profile.birthPlace, Icon: MapPin },
    { label: "Time of Birth", value: formatBirthTime(profile.timeOfBirth), Icon: Clock3 },
    { label: "Gender", value: profile.gender, Icon: Mars },
  ];

  return (
    <ProfileLayout title="My Profile">
      {loading ? <p className="py-16 text-center" role="status">Loading profile...</p> : error ? (
        <div role="alert" className="rounded-xl bg-white p-5 text-center">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 underline">Try again</button>
        </div>
      ) : (
        <>
          <button type="button" className="profile-premium" onClick={() => navigate("/transactions")}>
            <span className="profile-premium-medal"><Award size={25} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-relaxed">BHAKTI BHAV PREMIUM</span>
              <span className="block text-xs leading-relaxed text-white/70">
                {getTokenFromLS() && getSubscriptionStatusFromLS() ? "Your Premium Plan is Active" : "Upgrade to premium for enhanced features"}
              </span>
            </span>
            <ChevronRight size={25} className="shrink-0" aria-hidden="true" />
          </button>
          <div className="profile-actions">
            {profile.imageUrl && <img src={profileImageUrl(profile.imageUrl)} alt="Profile" className="mr-auto h-12 w-12 rounded-full object-cover" />}
            <Link to="/edit-profile" className="profile-action" aria-label="Edit profile"><SquarePen size={27} aria-hidden="true" /></Link>
            <ProfileSettingsMenu />
          </div>
          <dl className="profile-details">
            {fields.map(({ label, value, Icon }) => (
              <div className="profile-info-row" key={label}>
                <span className="profile-info-icon"><Icon size={26} strokeWidth={2} aria-hidden="true" /></span>
                <div className="min-w-0 flex-1"><dt>{label}</dt><dd>{value || "Not Provided"}</dd></div>
              </div>
            ))}
          </dl>
        </>
      )}
    </ProfileLayout>
  );
}
