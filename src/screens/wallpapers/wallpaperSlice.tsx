
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WallpaperState {
    wallpapers: Object[]; // Array to hold wallpaper URLs or paths
}

const initialState: WallpaperState = {
    wallpapers: [],
}

export const wallpaperSlice = createSlice({
    name: 'wallpapers',
    initialState,
    reducers: {
        setWallpapers: (state, action: PayloadAction<Object[]>) => {
            state.wallpapers = action.payload;
        },
        addWallpaper: (state, action: PayloadAction<Object>) => {
            state.wallpapers.push(action.payload);
        },
        removeWallpaper: (state, action: PayloadAction<number>) => {
            state.wallpapers.splice(action.payload, 1);
        },
    },
})

export const { addWallpaper,
     removeWallpaper,
     setWallpapers } = wallpaperSlice.actions;

export default wallpaperSlice.reducer;