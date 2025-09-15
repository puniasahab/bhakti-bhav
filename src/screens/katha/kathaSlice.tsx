import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface KathaState {
    katha: Object[]; // Array to hold katha data
}

const initialState: KathaState = {
    katha: [],
}

export const kathaSlice = createSlice({
    name: 'katha',
    initialState,
    reducers: {
        setKatha: (state, action: PayloadAction<Object[]>) => {
            state.katha = action.payload;
        },
        addKatha: (state, action: PayloadAction<Object>) => {
            state.katha.push(action.payload);
        },
        removeKatha: (state, action: PayloadAction<number>) => {
            state.katha.splice(action.payload, 1);
        },
    },
})

export const { addKatha,
     removeKatha,
     setKatha } = kathaSlice.actions;

export default kathaSlice.reducer;