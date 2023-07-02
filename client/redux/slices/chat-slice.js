import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: [],
        activeChat: null,
        chatMessages: [],
        outgoingMsgs: [],
        loadingChats: false,
        chatError: "",
        deleteMode: false,
    },
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload;
            state.loadingChats = false;
            state.chatError = "";
        },
        setActiveChat: (state, action) => {
            state.activeChat = action.payload;
        },
        addChat: (state, action) => {
            // make sure the same chat does not get added more than once
            if (state.chats.find((chat) => chat.id === action.payload.id)) {
                return;
            }

            state.chats = [action.payload, ...state.chats];
        },
        deleteChat: (state, action) => {
            state.chats = state.chats.filter(
                (chat) => chat.id !== action.payload
            );
        },
        setLoadingChats: (state, action) => {
            state.loadingChats = action.payload;
        },
        setChatError: (state, action) => {
            state.chatError = action.payload;
            state.loadingChats = false;
        },
        resetUnseenMsgsCount: (state, action) => {
            const { chatId, userId } = action.payload;

            state.chats = state.chats.map((chat) => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        unseenMsgsCounts: chat.unseenMsgsCounts
                            ? {
                                  ...chat.unseenMsgsCounts,
                                  [userId]: 0,
                              }
                            : { [userId]: 0 },
                    };
                }

                return chat;
            });
        },
        setUnseenMsgsCount: (state, action) => {
            const { chatId, userId, unseenCount } = action.payload;

            if (chatId === state.activeChat?.id) {
                return;
            }

            state.chats = state.chats.map((chat) => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        unseenMsgsCounts: chat.unseenMsgsCounts
                            ? {
                                  ...chat.unseenMsgsCounts,
                                  [userId]: unseenCount,
                              }
                            : { [userId]: unseenCount },
                    };
                }

                return chat;
            });
            state.soundCounter += 1;
        },
        toggleDeleteMode: (state) => {
            state.deleteMode = !state.deleteMode;
        },
    },
});

export const {
    setChats,
    setLoadingChats,
    addChat,
    deleteChat,
    setChatError,
    setActiveChat,
    resetUnseenMsgsCount,
    setUnseenMsgsCount,
    toggleDeleteMode,
} = chatSlice.actions;
export default chatSlice.reducer;
