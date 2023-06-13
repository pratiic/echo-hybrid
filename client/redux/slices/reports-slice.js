import { createSlice } from "@reduxjs/toolkit";

export const reportsSlice = createSlice({
    name: "reports",
    initialState: {
        reports: [],
        loading: false,
        loadingMore: false,
        error: "",
        page: 1,
        totalCount: 0,
        addedReportsCount: 0,
        noMoreData: false,
        PAGE_SIZE: 10,
        targetType: "all reports",
    },
    reducers: {
        setReportsProp: (state, action) => {
            const { prop, value } = action.payload;

            state[prop] = value;

            if (prop === "error") {
                state.page -= 1;
            }

            if (prop === "reports") {
                state.needToFetch = false;
            }
        },
        addReport: (state, action) => {
            if (
                !state.reports.find((report) => report.id === action.payload.id)
            ) {
                state.reports = [action.payload, ...state.reports];
                state.addedReportsCount++;
            }
        },
        deleteReport: (state, action) => {
            state.reports = state.reports.filter(
                (report) => report.id !== action.payload
            );
            state.addedReportsCount -= 1;
        },
    },
});

export default reportsSlice.reducer;
export const { setReportsProp, addReport, deleteReport } = reportsSlice.actions;
