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