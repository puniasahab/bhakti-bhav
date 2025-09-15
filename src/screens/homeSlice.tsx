
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface HomeState {
    thought: Object[],
    todayThought: string,
    authour: string,
    
}

const initialState: HomeState = {
  thought: [],
  todayThought: '',
  authour: '',
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setThoughts: (state, action: PayloadAction<Object[]>) => {
      state.thought = action.payload;
    },
    setTodayThought: (state, action: PayloadAction<string>) => {
      state.todayThought = action.payload;
    },
    setAuthour: (state, action: PayloadAction<string>) => {
      state.authour = action.payload;
    },
  },
});


export const { setThoughts, setTodayThought, setAuthour } = homeSlice.actions;

export default homeSlice.reducer;