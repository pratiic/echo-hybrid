import { createSlice } from "@reduxjs/toolkit";

export const reportsSlice = createSlice({
    name: "reports",
    initialState: {
        reports: [],
        loading: false,
        loadingMore: false,
        error: "",
        needToFetch: true,
        targetType: "all",
    },
    reducers: {
        setReportsProp: (state, action) => {
            const { prop, value } = action.payload;

            state[prop] = value;

            if (prop === "reports") {
                state.needToFetch = false;
            }
        },
        addReport: (state, action) => {
            if (
                !state.reports.find((report) => report.id === action.payload.id)
            ) {
                state.reports = [action.payload, ...state.reports];
            }
        },
        acknowledgeReports: (state, action) => {
            state.reports = state.reports.map((report) => {
                return { ...report, isAcknowledged: true };
            });
        },
        deleteReport: (state, action) => {
            state.reports = state.reports.filter(
                (report) => report.id !== action.payload
            );
        },
    },
});

export default reportsSlice.reducer;
export const {
    setReportsProp,
    addReport,
    acknowledgeReports,
    deleteReport,
} = reportsSlice.actions;
