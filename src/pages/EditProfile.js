import React, { useState, useEffect } from "react";
import { BadgeCheck, Camera, ChevronDown, LocateFixed, Mail, Map, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileLayout, { ProfileSettingsMenu } from "../components/ProfileLayout";
import { profileApis } from "../api";
import { setUserName, setUserIdInLS } from "../commonFunctions";
import { trackCustomEvent } from "../utils/metaPixel";
import { PIXEL_STANDARD_EVENTS } from "../utils/pixelEvents";
import { normalizeProfile, profileImageUrl } from "../utils/profile";

function Field({ label, name, errors, children }) {
  return (
    <div className="profile-field">
      <label htmlFor={`profile-${name}`} className="profile-field-label">{label}</label>
      {children}
      {errors[name] && <p id={`profile-${name}-error`} className="profile-error" role="alert">{errors[name]}</p>}
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => normalizeProfile());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [retry, setRetry] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let active = true;
    setInitialLoading(true);
    setLoadError("");
    profileApis.getProfile().then((response) => {
      if (active) setFormData(normalizeProfile(response));
    }).catch(() => {
      if (active) setLoadError("Unable to load your profile. Please try again before editing.");
    }).finally(() => {
      if (active) setInitialLoading(false);
    });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    if (!imageFile) return;
    const preview = URL.createObjectURL(imageFile);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [imageFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const inputProps = (name) => ({
    id: `profile-${name}`, name, value: formData[name], onChange: handleChange,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `profile-${name}-error` : undefined,
  });

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setErrors((previous) => ({ ...previous, state: "Location is unavailable. Please enter your location manually." }));
      return;
    }
    setLocating(true);
    setErrors((previous) => ({ ...previous, state: "" }));
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setFormData((previous) => ({ ...previous, state: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` }));
      setLocating(false);
    }, () => {
      setErrors((previous) => ({ ...previous, state: "Couldn't fetch your location. You can enter it manually." }));
      setLocating(false);
    }, { timeout: 10000, maximumAge: 60000 });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || locating) return;
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.mobileNumber) nextErrors.mobileNumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobileNumber)) nextErrors.mobileNumber = "Mobile number must be 10 digits";
    if (!formData.email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) nextErrors.email = "Email is invalid";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setSaveError("");
    const body = new FormData();
    ["name", "mobileNumber", "email", "state", "dateOfBirth", "birthPlace", "timeOfBirth", "gender"].forEach((name) => body.append(name, formData[name].trim()));
    if (imageFile) body.append("imageUrl", imageFile, imageFile.name);
    try {
      await profileApis.updateProfile(body);
      setUserName(formData.name === "New User" ? "" : formData.name.trim());
      if (formData._id) setUserIdInLS(formData._id);
      trackCustomEvent(PIXEL_STANDARD_EVENTS.PROFILE_UPDATED, { message: "User updated profile successfully", mobileNumber: formData.mobileNumber });
      // The profile screen fetches the saved record again through GET profile.
      navigate("/profile");
    } catch {
      setSaveError("Unable to update your profile. Your changes are still here; please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileLayout title="Edit Profile">
      {initialLoading ? <p className="py-16 text-center" role="status">Loading profile data...</p> : loadError ? (
        <div role="alert" className="rounded-xl bg-white p-5 text-center">
          <p>{loadError}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 underline">Try again</button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="profile-form" noValidate>
            <fieldset disabled={loading}>
              <Field label="FULL NAME*" name="name" errors={errors}>
                <div className="profile-input-wrap">
                  <input {...inputProps("name")} type="text" autoComplete="name" className="profile-input" required />
                  <UserRound className="profile-input-icon" aria-hidden="true" />
                </div>
              </Field>
              <Field label="MOBILE NUMBER*" name="mobileNumber" errors={errors}>
                <div className="profile-input-wrap">
                  <input {...inputProps("mobileNumber")} type="tel" autoComplete="tel-national" className="profile-input profile-mobile" readOnly />
                  {formData.mobileNumber && <span className="profile-verified"><BadgeCheck size={16} aria-hidden="true" /> VERIFIED</span>}
                </div>
              </Field>
              <Field label="EMAIL*" name="email" errors={errors}>
                <div className="profile-input-wrap">
                  <input {...inputProps("email")} type="email" autoComplete="email" className="profile-input" required />
                  <Mail className="profile-input-icon" aria-hidden="true" />
                </div>
              </Field>
              <Field label="LOCATION" name="state" errors={errors}>
                <div className="profile-input-wrap">
                  <input {...inputProps("state")} type="text" autoComplete="address-level1" className="profile-input" placeholder="Tap to fetch current location" />
                  <button type="button" className="profile-location-button" aria-label="Fetch current location" onClick={fetchLocation} disabled={locating}>
                    <LocateFixed size={28} aria-hidden="true" />
                  </button>
                </div>
                {locating && <p className="mt-2 text-xs" role="status">Fetching your location...</p>}
              </Field>
              <div className="profile-birth-fields">
                <Field label="DATE OF BIRTH" name="dateOfBirth" errors={errors}>
                  <input {...inputProps("dateOfBirth")} type="date" className="profile-input" />
                </Field>
                <Field label="TIME OF BIRTH" name="timeOfBirth" errors={errors}>
                  <input {...inputProps("timeOfBirth")} type="time" className="profile-input" />
                </Field>
              </div>
              <Field label="BIRTH PLACE" name="birthPlace" errors={errors}>
                <div className="profile-input-wrap">
                  <input {...inputProps("birthPlace")} type="text" className="profile-input" />
                  <Map className="profile-input-icon" aria-hidden="true" />
                </div>
              </Field>
              <Field label="GENDER" name="gender" errors={errors}>
                <div className="profile-input-wrap">
                  <select {...inputProps("gender")} className="profile-input appearance-none">
                    <option value=""></option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    {formData.gender && !["male", "female", "other"].includes(formData.gender) && <option value={formData.gender}>{formData.gender}</option>}
                  </select>
                  <ChevronDown className="profile-input-icon" aria-hidden="true" />
                </div>
              </Field>
              <details className="mb-4 rounded-2xl border border-[#eadde1] bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold">Profile photo</summary>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {(imagePreview || formData.imageUrl) && <img src={imagePreview || profileImageUrl(formData.imageUrl)} alt="Profile preview" className="h-16 w-16 rounded-full object-cover" />}
                  <label htmlFor="profile-image-input" className="flex cursor-pointer items-center gap-2 text-sm"><Camera size={20} aria-hidden="true" /> Choose photo</label>
                  <input type="file" id="profile-image-input" accept="image/*" onChange={(event) => { if (event.target.files[0]) setImageFile(event.target.files[0]); }} className="w-full min-w-0 text-xs" />
                </div>
              </details>
              {saveError && <p role="alert" className="profile-error">{saveError}</p>}
              <button type="submit" className="profile-update-button" disabled={loading || locating}>{loading ? "Updating..." : "Update Changes"}</button>
            </fieldset>
          </form>
          <div className="profile-actions"><ProfileSettingsMenu /></div>
        </>
      )}
    </ProfileLayout>
  );
}
