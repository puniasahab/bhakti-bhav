// const wallpaper = require('wallpaper');

export const setTokenInLS = (token) => {
    localStorage.setItem('authToken', token);
}

export const getTokenFromLS = () => {
    return localStorage.getItem('authToken');
}


export const setSubscriptionStatusInLS = (status) => {
    localStorage.setItem('isSubscribed', status);
}

export const getSubscriptionStatusFromLS = () => {
    const status = localStorage.getItem('isSubscribed');
    return status === 'true';
} 

export const removeSubscriptionStatusFromLS = () => {
    localStorage.removeItem('isSubscribed');
}

export const removeTokenFromLS = () => {
    localStorage.removeItem('authToken');
}

export const isAuthenticated = () => {
    return !!getTokenFromLS();
}

export const setMobileNoInLS = (mobile) => {
    localStorage.setItem("mobileNo", mobile);
}

export const getMobileNoFromLS = () => {
    return localStorage.getItem("mobileNo");
}

export const removeMobileNoFromLS = () => {
    localStorage.removeItem("mobileNo");
}
// export async function setWallpaper(imagePath) {
//     await wallpaper.set(imagePath);
// }

export const clearAllLS = () => {
    localStorage.clear();
}


export const formatNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

// ── Analytics helpers ──────────────────────────────────────────────────────

/** Persist & retrieve a stable device fingerprint for this browser profile */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

/** New session ID each time the app is opened (stored in sessionStorage) */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

/** Store user ID (backend _id) after login */
export const setUserIdInLS = (id) => {
  localStorage.setItem("userId", id);
};
export const getUserIdFromLS = () => {
  return localStorage.getItem("userId");
};
export const removeUserIdFromLS = () => {
  localStorage.removeItem("userId");
};


export const setUserName = (name) => {
  localStorage.setItem("userName", name);
};
export const getUserName = () => {
  return localStorage.getItem("userName");
};
export const removeUserName = () => {
  localStorage.removeItem("userName");
};

/** Store active subscription plan details after login / profile fetch */
export const setSubscriptionPlanInLS = (planName, planPrice) => {
  localStorage.setItem("subscriptionPlanName", planName || "");
  localStorage.setItem("subscriptionPlanPrice", planPrice || "");
};
export const getSubscriptionPlanFromLS = () => {
  const name = localStorage.getItem("subscriptionPlanName");
  const price = localStorage.getItem("subscriptionPlanPrice");
  if (!name && !price) return "none";
  return `${name}_${price}`;
};
export const removeSubscriptionPlanFromLS = () => {
  localStorage.removeItem("subscriptionPlanName");
  localStorage.removeItem("subscriptionPlanPrice");
};

/** Detect the current browser name */
export const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Trident\//.test(ua)) return "IE";
  return "Unknown";
};