import { createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 10;

export const authSlice = createSlice({
    name: "delivery",
    initialState: {
        pending: [],
        completed: [],
        needToFetch: {
            pending: true,
            completed: true,
        },
        loading: {
            pending: false,
            completed: false,
        },
        loadingMore: {
            pending: false,
            completed: false,
        },
        error: {
            pending: false,
            completed: false,
        },
        noMoreData: {
            pending: false,
            completed: false,
        },
        pendingPage: 1,
        completedPage: 1,
        pendingQuery: "",
        completedQuery: "",
        addedCount: {
            pending: 0,
            completed: 0,
        },
        totalCount: {
            pending: 0,
            completed: 0,
        },
        PAGE_SIZE: {
            pending: PAGE_SIZE,
            completed: PAGE_SIZE,
        },
        // delivery personnel portion
        personnel: {
            list: [],
            loading: false,
            error: "",
            needToFetch: true,
        },
        personnelQuery: "",
    },
    reducers: {
        setDeliveries: (state, action) => {
            const { type, deliveries } = action.payload;

            state[type] = deliveries;
            state.needToFetch[type] = false;
        },
        addDelivery: (state, action) => {
            const { type, delivery } = action.payload;

            if (!state[type].find((del) => del.id === delivery.id)) {
                state[type] = [delivery, ...state[type]];
                state.addedCount[type] += 1;
            }
        },
        setProp: (state, action) => {
            const { type, prop, value } = action.payload;

            state[prop][type] = value;

            if (prop === "error") {
                state[`${type}Page`] -= 1;
            }
        },
        setPage: (state, action) => {
            const { page, type } = action.payload;

            state[`${type}Page`] = page;
        },
        setQuery: (state, action) => {
            const { query, type } = action.payload;

            state[`${type}Query`] = query;
        },
        updateDelivery: (state, action) => {
            const { type, id, updateInfo } = action.payload;

            state[type] = state[type].map((delivery) => {
                if (delivery.id === id) {
                    return { ...delivery, ...updateInfo };
                }

                return delivery;
            });
        },
        deleteDelivery: (state, action) => {
            const { type, id } = action.payload;

            state[type] = state[type].filter((delivery) => delivery.id !== id);
            state.addedCount[type] -= 1;
            state.PAGE_SIZE[type] -= 1;
        },
        acknowledgeDeliveries: (state, action) => {
            state.completed = state.completed.map((delivery) => {
                return { ...delivery, isAcknowledged: true };
            });
        },
        resetPageSize: (state, action) => {
            state.PAGE_SIZE[action.payload] = PAGE_SIZE;
        },
        // delivery personnel portion
        setDeliveryPersonnelProp: (state, action) => {
            const { prop, value } = action.payload;

            state.personnel[prop] = value;

            if (prop === "list") {
                state.personnel.needToFetch = false;
            }
        },
        addDeliveryPersonnel: (state, action) => {
            if (
                !state.personnel.list.find(
                    (personnel) => personnel.id === action.payload.id
                )
            ) {
                state.personnel.list = [
                    action.payload,
                    ...state.personnel.list,
                ];
            }
        },
        updateDeliveryPersonnel: (state, action) => {
            const { id, updateInfo } = action.payload;

            state.personnel.list = state.personnel.list.map((personnel) => {
                if (personnel.id === id) {
                    return {
                        ...personnel,
                        ...updateInfo,
                    };
                }

                return personnel;
            });
        },
        deleteDeliveryPersonnel: (state, action) => {
            state.personnel.list = state.personnel.list.filter(
                (personnel) => personnel.id !== action.payload
            );
        },
    },
});

export default authSlice.reducer;
export const {
    setDeliveries,
    addDelivery,
    setProp,
    setPage,
    setQuery,
    updateDelivery,
    deleteDelivery,
    acknowledgeDeliveries,
    resetPageSize,
    setDeliveryPersonnelProp,
    addDeliveryPersonnel,
    updateDeliveryPersonnel,
    deleteDeliveryPersonnel,
} = authSlice.actions;
