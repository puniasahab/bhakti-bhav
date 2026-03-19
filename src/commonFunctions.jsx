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