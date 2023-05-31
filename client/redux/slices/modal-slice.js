import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showModal: false,
    type: "",
    message: "",
    title: "",
    confirmationHandler: null,
    children: null,
    overflowScroll: false,
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
            const { title, message, handler } = action.payload;

            state.showModal = true;
            state.type = "confirmation";
            state.title = title || "";
            state.message = message;
            state.confirmationHandler = handler;
        },
        showGenericModal: (state, action) => {
            state.showModal = true;
            state.type = "generic";
            state.children = action.payload;
        },
        setOverflowScroll: (state, action) => {
            state.overflowScroll = action.payload;
        },
        closeModal: (state, action) => {
            state.showModal = false;
            // state.overflowScroll = true;
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
