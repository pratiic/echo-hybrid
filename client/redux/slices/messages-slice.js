import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    outgoingMsgs: [],
    loading: false,
    loadingMore: false,
    error: "",
    page: 1,
    addedMsgsCount: 0,
    totalCount: 0,
    noMoreMessages: false,
    PAGE_SIZE: 25,
};

export const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            let existing = false;

            for (let i = 0; i < state.messages.length; i++) {
                if (state.messages[i].id === action.payload.id) {
                    existing = true;
                    break;
                }
            }

            if (!existing) {
                state.messages = [...state.messages, action.payload];
                state.addedMsgsCount += 1;
            }
        },
        setProp: (state, action) => {
            const { prop, value } = action.payload;

            state[prop] = value;

            if (prop === "error") {
                state.page -= 1;
            }
        },
        addOutgoingMsg: (state, action) => {
            state.outgoingMsgs = [...state.outgoingMsgs, action.payload];
        },
        removeOutgoingMsg: (state) => {
            state.outgoingMsgs.shift();
        },
        deleteMessage: (state, action) => {
            if (
                state.messages.find((message) => message.id === action.payload)
            ) {
                state.messages = state.messages.map((message) => {
                    if (message.id === action.payload) {
                        return {
                            ...message,
                            text: "",
                            image: "",
                            deleted: true,
                        };
                    }

                    return message;
                });
                state.addedMsgsCount -= 1;
            }
        },
        updateMessage: (state, action) => {
            state.messages = state.messages.map((message) => {
                const { id, updateInfo } = action.payload;
                if (message.id === id) {
                    return {
                        ...message,
                        ...updateInfo,
                    };
                }

                return message;
            });
        },
        resetSlice: (state, action) => {
            state.messages = [];
            state.outgoingMsgs = [];
            state.loading = false;
            state.loadingMore = false;
            state.error = "";
            state.page = 1;
            state.addedMsgsCount = 0;
            state.totalCount = 0;
            state.noMoreMessages = false;
        },
    },
});

export default messagesSlice.reducer;
export const {
    setMessages,
    addMessage,
    setProp,
    addOutgoingMsg,
    removeOutgoingMsg,
    deleteMessage,
    updateMessage,
    resetSlice,
} = messagesSlice.actions;
