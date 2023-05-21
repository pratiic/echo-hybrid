import { createSlice } from "@reduxjs/toolkit";

const filesSlice = createSlice({
  name: "files",
  initialState: {
    selectedFiles: [],
  },
  reducers: {
    selectFiles: (state, action) => {
      state.selectedFiles = [
        ...state.selectedFiles,
        ...action.payload.files,
      ].slice(0, action.payload.max);
    },
    unselectFiles: (state, action) => {
      state.selectedFiles = state.selectedFiles.filter(
        (selectedFile, index) => index != action.payload
      );
    },
    resetFiles: (state, action) => {
      state.selectedFiles = [];
    },
  },
});

export default filesSlice.reducer;

export const { selectFiles, unselectFiles, resetFiles } = filesSlice.actions;
