import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { fetcher } from "../lib/fetcher";
import {
    addChat,
    setChatError,
    setChats,
    setLoadingChats,
    setUnseenMsgsCount,
} from "../redux/slices/chat-slice";
import useSocket from "../hooks/use-socket";

const Chat = () => {
    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const socket = useSocket();

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        socket.on("new-message", (msgInfo) => {
            if (
                msgInfo.userId !== authUser?.id &&
                msgInfo.destinationId === authUser?.id
            ) {
                dispatch(
                    setUnseenMsgsCount({
                        chatId: msgInfo.chatId,
                        userId: msgInfo.destinationId,
                        unseenCount: msgInfo.unseenCount,
                    })
                );
            }
        });
    }, [authUser]);

    useEffect(() => {
        socket.on("new-chat", (chat) => {
            if (
                chat.userIds.find((userId) => {
                    if (userId === authUser?.id) {
                        return true;
                    }
                })
            ) {
                dispatch(addChat(chat));
            }
        });
    }, [authUser]);

    const fetchChats = async () => {
        try {
            dispatch(setLoadingChats(true));
            const data = await fetcher("chats");

            dispatch(setChats(data.chats));
        } catch (error) {
            dispatch(setChatError(error.message));
        } finally {
            dispatch(setLoadingChats(false));
        }
    };

    return <></>;
};

export default Chat;
