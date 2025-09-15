import { configureStore } from "@reduxjs/toolkit";
import wallpaperReducer from './src/screens/wallpapers/wallpaperSlice';
import jaapMalaReducer from './src/screens/jaapMala/jaapMalaSlice';
import kathaReducer from './src/screens/katha/kathaSlice';
import homeReducer from './src/screens/homeSlice';
import rashifalReducer from './src/screens/rashifal/rashifalSlice';

export const store = configureStore({
    reducer: {
        wallpapers: wallpaperReducer,
        jaapMala: jaapMalaReducer,
        katha: kathaReducer,
        home: homeReducer,
        rashifal: rashifalReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
