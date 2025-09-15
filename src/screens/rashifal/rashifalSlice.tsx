import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface RashifalState {
    rashifal: Object[];
}

const initialState: RashifalState = {
    rashifal: [],
};

export const rashifalSlice = createSlice({

    name: "rashifal",
    initialState,
    reducers: {
        setRashifal: (state, action: PayloadAction<Object[]>) => {
            state.rashifal = action.payload;
        }
        ,
        addRashifal: (state, action: PayloadAction<Object>) => {
            state.rashifal.push(action.payload);
        }
        ,
        removeRashifal: (state, action: PayloadAction<number>) => {
            state.rashifal.splice(action.payload, 1);
        }
    },
});

export const { addRashifal,
    removeRashifal,
    setRashifal } = rashifalSlice.actions;
export default rashifalSlice.reducer;
