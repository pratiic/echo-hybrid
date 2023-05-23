import { createSlice } from "@reduxjs/toolkit";

export const alertsSlice = createSlice({
    name: "alerts",
    initialState: {
        alerts: [],
    },
    reducers: {
        setAlert: (state, action) => {
            state.alerts = [
                { ...action.payload, active: true },
                ...state.alerts,
            ];
        },
        setErrorAlert: (state, action) => {
            state.alerts = [
                { message: action.payload, type: "error", active: true },
                ...state.alerts,
            ];
        },
        removeAlert: (state, action) => {
            state.alerts = state.alerts.map((alert, i) => {
                if (i === action.payload) {
                    return { ...alert, active: false };
                }

                return alert;
            });
        },
    },
});

export const { setAlert, setErrorAlert, removeAlert } = alertsSlice.actions;

export default alertsSlice.reducer;
