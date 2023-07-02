import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/outline";
import { useSelector, useDispatch } from "react-redux";
import { BsFillTriangleFill } from "react-icons/bs";
import { BiCheck, BiCheckDouble } from "react-icons/bi";

import { getMessageTime } from "../lib/date-time";
import { fetcher } from "../lib/fetcher";
import {
    closeModal,
    showConfirmationModal,
    showLoadingModal,
} from "../redux/slices/modal-slice";
import { setErrorAlert } from "../redux/slices/alerts-slice";
import { openGallery } from "../redux/slices/gallery-slice";

const Message = ({
    id,
    text,
    image,
    deleted,
    userId,
    authUser,
    seen,
    createdAt,
    isOutgoing = false,
    msgIndex,
}) => {
    const [isUserMsg, setIsUserMsg] = useState(true);

    const { deleteMode } = useSelector((state) => state.chat);
    const { messages } = useSelector((state) => state.messages);
    const dispatch = useDispatch();

    const deletedMsgStyle =
        "border border-gray-two text-gray-400 italic dark:border-gray-500";
    const outMsgStyle = `mr-2 ${
        !deleted ? "bg-blue-two mr-2" : deletedMsgStyle
    } ml-auto`;
    const inMsgStyle = `ml-2 ${
        !deleted
            ? `bg-gray-200 ml-2 dark:bg-gray-700 black-white`
            : deletedMsgStyle
    } mr-auto`;

    useEffect(() => {
        setIsUserMsg(userId === authUser?.id);
    }, [userId, authUser]);

    useEffect(() => {
        if (id) {
            setMessageSeen();
        }
    }, [id, isUserMsg, seen]);

    const setMessageSeen = async () => {
        if (isUserMsg || seen) {
            return;
        }

        try {
            fetcher(`messages/${id}`, "PATCH");
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteClick = () => {
        dispatch(
            showConfirmationModal({
                title: "message deletion",
                message: "Are you sure you want to delete this message?",
                handler: async () => {
                    dispatch(showLoadingModal("deleting your message..."));

                    try {
                        await fetcher(`messages/${id}`, "DELETE");
                    } catch (error) {
                        dispatch(setErrorAlert(error.message));
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const getMarginBottom = () => {
        // the margin of the last message before another user's messages start is a little bigger
        const nextMsg = messages[msgIndex + 1];
        if (nextMsg && nextMsg.userId !== userId) {
            return "mb-3";
        }

        return "mb-1";
    };

    const hasPointer = () => {
        // the first message of a user's message has a point at its left or right
        if (deleted || isOutgoing || image) {
            return false;
        }

        const prevMsg = messages[msgIndex - 1];
        if (!prevMsg || prevMsg.userId !== userId) {
            return true;
        }

        return false;
    };

    return (
        <div
            className={`w-fit rounded-md last:mb-0 relative ${
                isUserMsg || isOutgoing ? outMsgStyle : inMsgStyle
            } ${isOutgoing && `opacity-50`} ${getMarginBottom()} ${
                image ? "max-w-[275px] 500:max-w-[300px]" : "max-w-[70%]"
            }`}
        >
            {image && !deleted && (
                <img
                    src={image}
                    alt="chat img"
                    className={`rounded-t max-w-full max-h-[350px] block cursor-pointer ${
                        !isOutgoing && "mb-1"
                    } ${isOutgoing && !text && "rounded-b"}`}
                    onClick={() => dispatch(openGallery({ images: [image] }))}
                />
            )}

            {(text || deleted) && (
                <p className="leading-snug px-3 py-1">
                    {deleted ? "this message was deleted" : text}
                </p>
            )}

            {!isOutgoing && !deleted && (
                <div className="flex px-2 mb-1">
                    <span
                        className={`block w-fit text-xs ml-auto mr-2 ${
                            !isUserMsg ? "dark-light" : "text-gray-one"
                        }`}
                    >
                        {getMessageTime(createdAt)}
                    </span>

                    {isUserMsg && (
                        <span>
                            {seen ? (
                                <BiCheckDouble className="icon-msg" />
                            ) : (
                                <BiCheck className="icon-msg" />
                            )}
                        </span>
                    )}
                </div>
            )}

            {deleteMode && !deleted && (
                <TrashIcon
                    className="icon-small absolute top-1/2 -translate-y-1/2 -left-12"
                    onClick={handleDeleteClick}
                />
            )}

            {hasPointer() && (
                <BsFillTriangleFill
                    className={`absolute h-3 w-3 rotate-[180deg]  -top-[0.75px]  ${
                        !isUserMsg
                            ? "-left-1 text-gray-200 dark:text-gray-700"
                            : "-right-1 text-blue-two"
                    }`}
                />
            )}
        </div>
    );
};

export default Message;
