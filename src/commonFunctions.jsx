// const wallpaper = require('wallpaper');

export const setTokenInLS = (token) => {
    localStorage.setItem('authToken', token);
}

export const getTokenFromLS = () => {
    return localStorage.getItem('authToken');
}

export const removeTokenFromLS = () => {
    localStorage.removeItem('authToken');
}

export const isAuthenticated = () => {
    return !!getTokenFromLS();
}

// export async function setWallpaper(imagePath) {
//     await wallpaper.set(imagePath);
// }