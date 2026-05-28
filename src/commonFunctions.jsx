// const wallpaper = require('wallpaper');

export const AUTH_TOKEN_KEY = 'bhaktiBhav:authToken';
const LEGACY_AUTH_TOKEN_KEYS = ['authToken', 'token', 'bhaktiBhav:userToken'];

const normalizeTokenValue = (token) => {
    if (typeof token === 'string') {
        const trimmedToken = token.trim();
        return trimmedToken && trimmedToken !== 'undefined' && trimmedToken !== 'null' ? trimmedToken : null;
    }

    if (token && typeof token === 'object') {
        return normalizeTokenValue(token.token || token.accessToken || token.authToken || token.value);
    }

    return null;
};

export const setTokenInLS = (token) => {
    const normalizedToken = normalizeTokenValue(token);
    if (!normalizedToken) {
        console.warn('setTokenInLS skipped because token is missing or invalid:', token);
        return null;
    }

    localStorage.setItem(AUTH_TOKEN_KEY, normalizedToken);
    return normalizedToken;
}

export const getTokenFromLS = () => {
    const token = normalizeTokenValue(localStorage.getItem(AUTH_TOKEN_KEY));
    if (token) return token;

    for (const key of LEGACY_AUTH_TOKEN_KEYS) {
        const legacyToken = normalizeTokenValue(localStorage.getItem(key));
        if (legacyToken) {
            setTokenInLS(legacyToken);
            localStorage.removeItem(key);
            return legacyToken;
        }
    }

    return null;
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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    LEGACY_AUTH_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
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

const DEVICE_ID_KEY = "deviceId";
const DEVICE_TOKEN_KEY = "deviceToken";
const FIREBASE_APP_INSTANCE_ID_KEY = "firebaseAppInstanceId";

const createUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    const value = char === "x" ? random : ((random & 0x3) | 0x8);
    return value.toString(16);
  });
};

const isUuid = (value) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");
};

export const setDeviceIdInLS = (deviceId) => {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
};

/** Persist & retrieve a stable UUID device ID for this browser profile */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!isUuid(deviceId)) {
    deviceId = createUuid();
    setDeviceIdInLS(deviceId);
  }
  return deviceId;
};

export const getDeviceIdFromLS = getDeviceId;

export const setDeviceTokenInLS = (deviceToken) => {
  localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
};

export const getDeviceTokenFromLS = () => {
  let deviceToken = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!deviceToken) {
    deviceToken = getDeviceId();
    setDeviceTokenInLS(deviceToken);
  }
  return deviceToken;
};

export const setFirebaseAppInstanceIdInLS = (firebaseAppInstanceId) => {
  localStorage.setItem(FIREBASE_APP_INSTANCE_ID_KEY, firebaseAppInstanceId);
};

export const getFirebaseAppInstanceIdFromLS = () => {
  const deviceId = getDeviceId();
  let firebaseAppInstanceId = localStorage.getItem(FIREBASE_APP_INSTANCE_ID_KEY);
  if (!firebaseAppInstanceId || !firebaseAppInstanceId.startsWith(`${deviceId}_`)) {
    firebaseAppInstanceId = `${deviceId}_${createUuid()}`;
    setFirebaseAppInstanceIdInLS(firebaseAppInstanceId);
  }
  return firebaseAppInstanceId;
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
  localStorage.setItem("bhaktiBhav:userId", id);
};
export const getUserIdFromLS = () => {
  return localStorage.getItem("bhaktiBhav:userId");
};
export const removeUserIdFromLS = () => {
  localStorage.removeItem("bhaktiBhav:userId");
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


export const replaceSpecialChars = (text) => {
  if(typeof text != 'string') return text;
  // const updatedText = text
  //   .replace(/[？؟¿�]/g, "?")
  //   .replace(/[（﹙｟¼]/g, "(")
  //   .replace(/[）﹚｠½]/g, ")");
  return text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/[？؟¿�]/g, "?")
             .replace(/[（﹙｟¼]/g, "(")
             .replace(/[）﹚｠½]/g, ")")
             .replace(/&#39;/g, "'")
             .replace(/\.\.\./g, "---")
             .replace(/\./g, "-")
             .replace(/\.\.\.\./g, "----")
             .replace(/\.\./g, "--")
             .replace(/,/g, "]")
             .replace(/^'(.*)'$/, "“$1”")
             .replace(/-/g, " ")
             .replace(/\:/g, "ः")
             .replace(/\;/g, " ")
             .replace(/[؛ꣾ]/g, ";")
             .replace(/``|''/g, "”")
            //  .replace(/“/g, "").replace(/”/g, "")
            //  .replace(/,/g, "]")
            //  .replace(/\(/g, "¼").replace(/\)/g, "½").replace(/\:/g, "%").replace(/:/g, "ः")         // Replace colon with visarga
            //                     .replace(/ँ/g, "ं")          // Normalize chandrabindu if misencoded
            //                     .replace(/\u200D|\u200C/g, "  ").replace(/[.,;!?'"“”‘’]/g, " ")    // Remove English punctuation
            //                     .replace(/[\[\]{}()]/g, "")       // Remove brackets and parentheses
            //                     .replace(/[*/\\#%^+=_|<>~`@$₹]/g, " ").replace(/[^\u0900-\u097F\s।॥]/g, "") // remove non-Devanagari chars except space & punctuation
            //                     .replace(/\u00A0/g, " ") // replace non-breaking space with normal space
            //                     .replace(/\u200B|\u200C|\u200D/g, " ") // remove zero-width chars
            //                     .replace(/\s+/g, " ")
                                // .normalize("NFC")
                                // .replace(/[०-९]/g, digit => hindiToEnglishMap[digit])// Remove zero-width joiners

};

/**
 * Fixes KrutiDev font rendering issues in HTML content.
 * KrutiDev is a legacy ASCII-mapped font where standard ASCII characters
 * render as different Devanagari glyphs. This remaps problematic characters
 * ONLY inside text nodes (not inside HTML tag attributes).
 *
 * KrutiDev mappings for common problem chars:
 *   (  →  ¼   (renders as left parenthesis in KrutiDev)
 *   )  →  ½   (renders as right parenthesis in KrutiDev)
 *   ?  →  \   (renders as question mark in KrutiDev)
 */
export const fixKrutiDevHtml = (html) => {
  if (!html || typeof html !== "string") return html;

  // Replace only inside text nodes — skip content inside < > HTML tags
  return html.replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
    if (tag) return tag;
    if (!text) return match;
    return text
      .replace(/\(/g, "¼")
      .replace(/\)/g, "½")
      .replace(/\?/g, "\\");
  });
};
