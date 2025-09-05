import { createSlice } from "@reduxjs/toolkit";

interface GlobalSliceInitialState {
  loading: boolean;
}

const initialState: GlobalSliceInitialState = {
  loading: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setGlobalLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // These Matchers look for the loading state in the action type, therefore setting the loading state to true when an action is pending, and false when it is fulfilled or rejected.
      .addMatcher(
        (action) =>
          action.type.includes("/pending") &&
          action.type.includes(":load") &&
          action.meta?.arg?.skipLoading !== true, // Correctly check skipLoading in meta.arg
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.includes("/fulfilled") &&
          action.type.includes(":load") &&
          action.meta?.arg?.skipLoading !== true, // Correctly check skipLoading in meta.arg
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.includes("/rejected") && action.type.includes(":load"),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const { setGlobalLoading } = globalSlice.actions;
export default globalSlice.reducer;
