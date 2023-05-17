import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showModal: false,
  type: "",
  message: "",
  confirmationHandler: null,
  childern: null,
  overflowScroll: true,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showLoadingModal: (state, action) => {
      state.showModal = true;
      state.type = "loading";
      state.message = action.payload;
    },
    showConfirmationModal: (state, action) => {
      state.showModal = true;
      state.type = "confirmation";
      state.message = action.payload.message;
      state.confirmationHandler = action.payload.handler;
    },
    showGenericModal: (state, action) => {
      state.showModal = true;
      state.type = "generic";
      state.message = action.payload;
    },
    setOverflowScroll: (state, action) => {
      state.overflowScroll = action.payload;
    },
    closeModal: (state, action) => {
      state.showModal = false;
      state.overflowScroll = true;
    },
  },
});

export const {
  showLoadingModal,
  showConfirmationModal,
  showGenericModal,
  setOverflowScroll,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;
