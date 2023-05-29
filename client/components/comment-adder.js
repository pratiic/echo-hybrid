import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PaperAirplaneIcon, XCircleIcon } from "@heroicons/react/outline";

import {
    addComment,
    setActiveComment,
    updateComment,
} from "../redux/slices/comments-slice";
import { renderCharLimit, capitalizeFirstLetter } from "../lib/strings";
import { clearErrors } from "../lib/validation";
import { setAlert } from "../redux/slices/alerts-slice";
import { generateFormData } from "../lib/form-data";
import { fetcher } from "../lib/fetcher";
import { setPreview } from "../lib/files";
import { getCommentNotificationData } from "../lib/notification";

import Image from "./image";
import FileSelector from "./file-selector";
import Icon from "./icon";
import Spinner from "./spinner";

const CommentAdder = ({
    contentId,
    contentType = "product",
    contentName,
    commentType = "review",
    baseCommentId,
    contentOwnerId,
    baseCommentUserId,
    isTargetBusiness,
}) => {
    const { activeComment } = useSelector((state) => state.comments);
    const { selectedFiles } = useSelector((state) => state.files);
    const { authUser } = useSelector((state) => state.auth);

    const [isFocused, setIsFocused] = useState(false);
    const [text, setText] = useState(activeComment?.text || "");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(activeComment?.image);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedFiles.length > 0) {
            setImage(selectedFiles[0]);
            setPreview(selectedFiles[0], setImagePreview);
        }
    }, [selectedFiles]);

    useEffect(() => {
        return () => {
            dispatch(setActiveComment(null));
        };
    }, []);

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        clearErrors([setError]);
        setAdding(true);

        try {
            // generate form data from text and image
            const formData = generateFormData({ text });
            if (image) {
                formData.append("image", image);
            }

            const urlMap = {
                review: `reviews/${contentType}/${contentId}`,
                reply: `replies/${baseCommentId}`,
            };

            const data = await fetcher(urlMap[commentType], "POST", formData);

            dispatch(
                setAlert({
                    message: `your review has been ${
                        activeComment ? "updated" : "added"
                    } `,
                })
            );

            clearFieldValues();
            setImagePreview(null);

            if (activeComment) {
                dispatch(
                    updateComment({
                        commentId: data[commentType].id,
                        type: commentType,
                        baseCommentId,
                        updateInfo: data[commentType],
                    })
                );

                dispatch(setActiveComment(null));
            } else {
                dispatch(
                    addComment({
                        comment: data[commentType],
                        type: commentType,
                        baseCommentId,
                    })
                );

                // send a notification to the owner of the content
                try {
                    const notificationData = getCommentNotificationData(
                        authUser,
                        contentType,
                        contentId,
                        contentName,
                        contentOwnerId,
                        baseCommentId,
                        baseCommentUserId,
                        isTargetBusiness
                    );

                    if (notificationData.destinationId !== authUser?.id) {
                        fetcher("notifications", "POST", notificationData);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            setAdding(false);
        }
    };

    const clearFieldValues = () => {
        setText("");
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div
                className={`flex flex-col rounded min-h-32 mb-1 transition-all duration-200 `}
            >
                {/* show if editing  */}
                {activeComment && (
                    <p className="flex items-center mb-2 dark-light text-sm bg-gray-50 dark:bg-gray-800 rounded px-2 w-fit ">
                        Updating a {commentType}
                        <XCircleIcon
                            className="icon"
                            onClick={() => dispatch(setActiveComment(null))}
                        />
                    </p>
                )}

                <textarea
                    placeholder={`Write a ${commentType}...`}
                    className={`resize-none flex-1 px-2 py-2 outline-none rounded min-h-[7rem] transition-all duration-200 black-white ${
                        isFocused
                            ? "bg-gray-100 dark:bg-gray-700"
                            : "bg-gray-50 dark:bg-gray-800"
                    }`}
                    value={text}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(event) => setText(event.target.value)}
                ></textarea>

                <div className="mt-1">{renderCharLimit(5, 200, text)}</div>

                {error && (
                    <span className="error block">
                        {capitalizeFirstLetter(error)}
                    </span>
                )}

                {/* display preview of the selected image  */}
                {imagePreview && (
                    <Image
                        src={imagePreview}
                        className="rounded max-w-[200px] max-h-[200px]"
                        containerClassName="mt-3 w-fit"
                    />
                )}

                <div className="flex items-center justify-end px-2 space-x-1">
                    <FileSelector type="icon" />

                    {adding ? (
                        <div className="p-2">
                            <Spinner />
                        </div>
                    ) : (
                        <Icon toolName="send" onClick={handleFormSubmit}>
                            <PaperAirplaneIcon className="icon rotate-90" />
                        </Icon>
                    )}
                </div>
            </div>
        </form>
    );
};

export default CommentAdder;
