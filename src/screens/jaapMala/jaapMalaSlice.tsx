import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface JaapMalaState {
  jaapMala: Object[];
}

const initialState: JaapMalaState = {
  jaapMala: [],
};

export const jaapMalaSlice = createSlice({
    name: "jaapMala",
    initialState,
    reducers: {
        setJaapMala: (state, action: PayloadAction<Object[]>) => {
            state.jaapMala = action.payload;
        },
        addJaapMala: (state, action: PayloadAction<Object>) => {
            state.jaapMala.push(action.payload);
        },
        removeJaapMala: (state, action: PayloadAction<number>) => {
            state.jaapMala.splice(action.payload, 1);
        },
    },
});

export const { addJaapMala,
     removeJaapMala,
      setJaapMala } = jaapMalaSlice.actions;

export default jaapMalaSlice.reducer;