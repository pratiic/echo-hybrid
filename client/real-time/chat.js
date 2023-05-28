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
        if (authUser) {
            fetchChats();
        }
    }, [authUser]);

    useEffect(() => {
        socket.on("new-message", (message) => {
            if (authUser) {
                if (
                    message.userId !== authUser?.id &&
                    message.destinationId === authUser?.id
                ) {
                    dispatch(
                        setUnseenMsgsCount({
                            chatId: message.chatId,
                            userId: message.destinationId,
                            unseenCount: message.unseenCount,
                        })
                    );
                }
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
