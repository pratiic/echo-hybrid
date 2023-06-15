import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { BsReplyFill } from "react-icons/bs";

import { getHowLongAgo } from "../lib/date-time";
import { capitalizeFirstLetter } from "../lib/strings";
import { openGallery } from "../redux/slices/gallery-slice";

import Avatar from "./avatar";
import Icon from "./icon";
import CommentsContainer from "./comments-container";
import CommentMenu from "./comment-menu";

const Comment = ({
    id,
    text,
    user,
    createdAt,
    image,
    commentType = "review",
    handleCommentDeletion,
}) => {
    const [showReplies, setShowReplies] = useState(false);

    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleReplyClick = (event) => {
        // scroll down to show the replies part
        setShowReplies(!showReplies);

        setTimeout(() => {
            const { clientY } = event;
            window.scrollTo(0, clientY + 150);
        }, 50);
    };

    const handleImageClick = () => {
        dispatch(openGallery({ images: [image] }));
    };

    return (
        <div
            className={`px-4 pt-5 w-full ${
                commentType === "reply"
                    ? "border border-gray-four pt-3 mb-3 rounded dark:border-gray-800"
                    : "border-b border-gray-four dark:border-gray-800"
            }`}
        >
            {/* user details  */}
            <div className="flex items-center dark-light">
                <Avatar
                    avatar={user?.avatar}
                    alt={user?.fullName}
                    small={commentType === "reply"}
                />

                <div className="ml-2 flex-1">
                    <p className="capitalize black-white">
                        {user?.id === authUser?.id ? "me" : user?.fullName}
                    </p>
                    <p className=" text-xs">{user?.email}</p>
                </div>

                <p className="text-sm">{getHowLongAgo(createdAt)}</p>
            </div>

            {/* text of the comment */}
            <p className=" pt-3 pb-1 dark-light whitespace-pre-wrap">
                {capitalizeFirstLetter(text)}
            </p>

            {/* image of the comment */}
            {image && (
                <div className="mt-2 cursor-pointer" onClick={handleImageClick}>
                    <img
                        src={image}
                        alt="review-image"
                        className="rounded block max-w-[200px] max-h-[200px]"
                    />
                </div>
            )}

            {/* footer of the comment  */}
            <div className="flex items-center justify-end space-x-3">
                {commentType === "review" && (
                    // icon to reply to a review
                    <Icon toolName="reply" onClick={handleReplyClick}>
                        <BsReplyFill
                            className={` ${
                                showReplies ? "icon-active" : "icon"
                            }`}
                        />
                    </Icon>
                )}

                <CommentMenu
                    id={id}
                    text={text}
                    image={image}
                    user={user}
                    handleCommentDeletion={handleCommentDeletion}
                    commentType={commentType}
                />
            </div>

            {/* replies of the comment  */}
            {showReplies && (
                <div className="mt-3">
                    <CommentsContainer
                        commentType="reply"
                        baseCommentId={id}
                        baseCommentUserId={user?.id}
                        contentId={router.query.id}
                    />
                </div>
            )}
        </div>
    );
};

export default Comment;
