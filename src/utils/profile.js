const text = (value) => value == null ? "" : String(value).trim();

export const normalizeBirthDate = (value) => {
  const raw = text(value);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  const local = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  if (local) return `${local[3]}-${local[2]}-${local[1]}`;
  return "";
};

export const normalizeBirthTime = (value) => {
  const match = text(value).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (!match) return "";
  let hour = Number(match[1]);
  if (Number(match[2]) > 59 || hour > (match[3] ? 12 : 23)) return "";
  if (match[3]) hour = hour % 12 + (match[3].toLowerCase() === "pm" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

export const normalizeProfile = (response) => {
  const data = response?.data || response || {};
  return {
    _id: data._id,
    name: text(data.name),
    mobileNumber: text(data.mobileNumber),
    email: text(data.email),
    state: text(data.state || (typeof data.location === "string" ? data.location : "")),
    dateOfBirth: normalizeBirthDate(data.dateOfBirth),
    birthPlace: text(data.birthPlace),
    timeOfBirth: normalizeBirthTime(data.timeOfBirth),
    gender: text(data.gender).toLowerCase(),
    imageUrl: text(data.imageUrl),
  };
};

export const formatBirthDate = (value) => value ? value.split("-").reverse().join("/") : "";

export const formatBirthTime = (value) => {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  return `${Number(hour) % 12 || 12}:${minute} ${Number(hour) >= 12 ? "PM" : "AM"}`;
};

export const profileImageUrl = (value) => !value ? "" : /^https?:\/\//i.test(value) ? value : `https://api.bhaktibhav.app${value.startsWith("/") ? "" : "/"}${value}`;
