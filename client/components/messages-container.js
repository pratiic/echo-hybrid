import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetcher } from "../lib/fetcher";

import { resetUnseenMsgsCount } from "../redux/slices/chat-slice";
import {
    resetSlice,
    setMessages,
    setProp as setMessagesProp,
} from "../redux/slices/messages-slice";

import Human from "./human";
import Message from "./message";
import Button from "./button";
import Spinner from "./spinner";

const MessageContainer = ({ chatId }) => {
    const { authUser } = useSelector((state) => state.auth);
    const {
        messages,
        outgoingMsgs,
        loading,
        loadingMore,
        page,
        error,
        noMoreMessages,
        addedMsgsCount,
        PAGE_SIZE,
    } = useSelector((state) => state.messages);

    const dispatch = useDispatch();
    const scrollRef = useRef();

    useEffect(() => {
        if (chatId) {
            fetchMessages();
        }
    }, [chatId, page]);

    useEffect(() => {
        return () => {
            dispatch(resetSlice());
        };
    }, []);

    const setProp = (prop, value) => {
        dispatch(setMessagesProp({ prop, value }));
    };

    const fetchMessages = async () => {
        if (loading || loadingMore) {
            return;
        }

        setProp(page === 1 ? "loading" : "loadingMore", true);

        try {
            const data = await fetcher(
                `messages/${chatId}/?page=${page}&skip=${addedMsgsCount}`
            );

            dispatch(
                setMessages(
                    page === 1 ? data.messages : [...data.messages, ...messages]
                )
            );
            dispatch(resetUnseenMsgsCount({ chatId, userId: authUser?.id }));

            if (data.messages.length < PAGE_SIZE) {
                setProp("noMoreMessages", true);
            }

            try {
                fetcher(`chats/unseen/${chatId}`, "PATCH");
            } catch (error) {}
        } catch (error) {
            setProp("error", error.message);
        } finally {
            setProp("loading", false);
            setProp("loadingMore", false);
        }
    };

    const renderMessages = () => {
        setTimeout(() => {
            scrollRef?.current?.scrollIntoView();
        }, 100);

        return messages.map((message, index) => {
            return (
                <Message
                    {...message}
                    authUser={authUser}
                    msgIndex={index}
                    key={index}
                />
            );
        });
    };

    const incrementPageNumber = () => {
        setProp("page", page + 1);
    };

    return (
        <div className="flex flex-col max-w-[800px] mx-auto overflow-y-scroll h-[calc(100%-100px)] my-3">
            {loading ? (
                <p className="status my-auto">Loading chat messages...</p>
            ) : error ? (
                <p className="status my-auto">{error}</p>
            ) : messages.length === 0 && outgoingMsgs.length === 0 ? (
                <Human
                    name="say-hi"
                    message="There are no messages in this chat"
                />
            ) : (
                <React.Fragment>
                    {!noMoreMessages && (
                        <div className="w-fit mx-auto">
                            {loadingMore ? (
                                <Spinner />
                            ) : (
                                <Button
                                    type="secondary"
                                    smaller
                                    rounded
                                    center
                                    className="text-sm"
                                    onClick={incrementPageNumber}
                                >
                                    load more
                                </Button>
                            )}
                        </div>
                    )}

                    {renderMessages()}

                    {outgoingMsgs.length > 0 &&
                        outgoingMsgs.map((outgoingMsg, i) => (
                            <Message
                                {...outgoingMsg}
                                authUser={authUser}
                                isOutgoing="true"
                                key={i}
                            />
                        ))}

                    <div ref={scrollRef}></div>
                </React.Fragment>
            )}
        </div>
    );
};

export default MessageContainer;
