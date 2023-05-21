import { createSlice } from "@reduxjs/toolkit";

export const gallerySlice = createSlice({
  name: "gallery",
  initialState: {
    images: [],
    activeIndex: 0,
  },
  reducers: {
    setActiveIndex: (state, action) => {
      state.activeIndex = action.payload;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    openGallery: (state, action) => {
      const { images, activeIndex } = action.payload;
      state.images = images;
      state.activeIndex = activeIndex || 0;
    },
    closeGallery: (state) => {
      state.activeIndex = 0;
      state.images = [];
    },
  },
});

export default gallerySlice.reducer;
export const {
  setActiveIndex,
  setImages,
  openGallery,
  closeGallery,
} = gallerySlice.actions;
