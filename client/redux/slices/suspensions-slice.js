import { createSlice } from "@reduxjs/toolkit";

export const suspensionsSlice = createSlice({
    name: "suspensions",
    initialState: {
        suspensions: [],
        loading: false,
        error: "",
        needToFetch: true,
        targetType: "all",
        query: "",
    },
    reducers: {
        setSuspensionsProp: (state, action) => {
            const { prop, value } = action.payload;

            state[prop] = value;

            if (prop === "suspensions") {
                state.needToFetch = false;
            }

            if (prop === "targetType") {
                state.query = ""; // reset query every time the targetType is changed
            }
        },
        addSuspension: (state, action) => {
            if (
                !state.suspensions.find(
                    (suspension) => suspension.id === action.payload.id
                )
            ) {
                state.suspensions = [action.payload, ...state.suspensions];
            }
        },
        deleteSuspension: (state, action) => {
            state.suspensions = state.suspensions.filter(
                (suspension) => suspension.id !== action.payload
            );
        },
    },
});

export default suspensionsSlice.reducer;
export const {
    setSuspensionsProp,
    addSuspension,
    deleteSuspension,
} = suspensionsSlice.actions;
