import { createSlice } from "@reduxjs/toolkit";

const NotificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        needToFetch: true,
        loading: false,
        loadingMore: false,
        error: "",
        soundCounter: 0,
        page: 1,
        addedNotificationsCount: 0,
        totalCount: 0,
        noMoreData: false,
        PAGE_SIZE: 25,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.needToFetch = false;
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            const { notification } = action.payload;

            if (
                state.notifications.find(
                    (notif) => notif.id === notification.id
                )
            ) {
                return;
            }

            state.notifications = [notification, ...state.notifications];
            state.soundCounter += 1;
            state.addedNotificationsCount += 1;
        },
        deleteNotification: (state, action) => {
            state.notifications = state.notifications.filter((notification) => {
                if (action.payload === notification.id) {
                    return false;
                }

                return true;
            });
            state.PAGE_SIZE -= 1;
            state.addedNotificationsCount -= 1;
        },
        deleteAllNotifications: (state, action) => {
            state.notifications = [];
        },
        seeNotifications: (state) => {
            state.notifications = state.notifications.map((notification) => {
                return { ...notification, seen: true };
            });
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
            state.error = "";
        },
        setLoadingMore: (state, action) => {
            state.loadingMore = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.page -= 1;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setNeedToFetch: (state, action) => {
            state.needToFetch = action.payload;
        },
        setTotalCount: (state, action) => {
            state.totalCount = action.payload;
        },
        setNoMoreData: (state, action) => {
            state.noMoreData = action.payload;
        },
        resetPageSize: (state, action) => {
            state.PAGE_SIZE = 25;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    deleteNotification,
    deleteAllNotifications,
    seeNotifications,
    setLoading,
    setLoadingMore,
    setError,
    setPage,
    setNeedToFetch,
    setTotalCount,
    setNoMoreData,
    resetPageSize,
} = NotificationsSlice.actions;

export default NotificationsSlice.reducer;
