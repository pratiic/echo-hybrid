import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { TrashIcon } from "@heroicons/react/outline";

import { fetcher } from "../lib/fetcher";
import {
    addComment,
    deleteComment,
    setComments,
} from "../redux/slices/comments-slice";
import {
    showConfirmationModal,
    showLoadingModal,
    closeModal,
} from "../redux/slices/modal-slice";
import { setAlert } from "../redux/slices/alerts-slice";
import { capitalizeFirstLetter } from "../lib/strings";
import useSocket from "../hooks/use-socket";

import CommentAdder from "./comment-adder";
import Comment from "./comment";
import Icon from "./icon";

const CommentsContainer = ({
    contentId,
    contentOwner,
    contentName,
    commentType = "review",
    baseCommentId,
    baseCommentUserId,
    isTargetBusiness,
}) => {
    const [loadingComments, setLoadingComments] = useState(false);
    const [disabledMsg, setDisabledMsg] = useState("");
    const [reviewExists, setReviewExists] = useState(false);
    const [userReviewId, setUserReviewId] = useState(null);
    const [error, setError] = useState("");

    const { reviews, replies, activeComment } = useSelector(
        (state) => state.comments
    );
    const { authUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    const socket = useSocket();

    const pluralMap = {
        review: "reviews",
        reply: "replies",
    };

    const contentType = router.pathname.includes("products")
        ? "product"
        : "store";

    useEffect(() => {
        if (commentType !== "review") {
            return;
        }

        if (contentOwner?.id === authUser?.id) {
            return setDisabledMsg(`You cannot review your own ${contentType}`);
        }

        const existingReview = reviews?.find((review) => {
            return review?.user?.id === authUser?.id;
        });

        if (existingReview) {
            setReviewExists(true);
            setUserReviewId(existingReview.id);
            return setDisabledMsg(
                "Delete your existing review to add another one"
            );
        } else {
            setReviewExists(false);
        }

        setDisabledMsg("");
    }, [contentOwner, authUser, reviews, commentType]);

    useEffect(() => {
        if (!contentId && contentType === "review") {
            return;
        }

        getComments();
    }, [contentId, contentType]);

    useEffect(() => {
        socket.on("comment", (commentInfo) => {
            if (commentInfo.targetId === contentId) {
                // review belongs to the current product or seller
                dispatch(addComment(commentInfo));
            }
        });

        socket.on("comment-delete", (data) => {
            dispatch(deleteComment(data));
        });
    }, []);

    const getComments = async () => {
        // if replies to a review exist, no need to get them again
        if (commentType === "reply" && replies[baseCommentId]) {
            return;
        }

        setLoadingComments(true);
        setError("");

        const urlMap = {
            review: `reviews/${contentType}/${contentId}`,
            reply: `replies/${baseCommentId}/replies`,
        };

        try {
            const data = await fetcher(urlMap[commentType]);

            dispatch(
                setComments({
                    comments: data[pluralMap[commentType]],
                    type: commentType,
                    baseCommentId,
                })
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingComments(false);
        }
    };

    const renderCommentAdder = () => {
        // if a comment is being edited, show the comment adder
        if (disabledMsg && !activeComment) {
            return (
                <p className="dark-light text-sm italic -mt-2">{disabledMsg}</p>
            );
        }

        return (
            <div className="mb-3">
                <CommentAdder
                    contentId={contentId}
                    contentType={contentType}
                    contentName={contentName}
                    commentType={commentType}
                    baseCommentId={baseCommentId}
                    contentOwnerId={contentOwner?.id}
                    baseCommentUserId={baseCommentUserId}
                    isTargetBusiness={isTargetBusiness}
                />
            </div>
        );
    };

    const handleCommentDeletion = (id) => {
        if (!id) {
            return;
        }

        dispatch(
            showConfirmationModal({
                message: `are you sure you want to delete your ${commentType} ?`,
                handler: async () => {
                    dispatch(
                        showLoadingModal(`deleting your ${commentType}...`)
                    );
                    try {
                        await fetcher(
                            `${
                                commentType === "review" ? "reviews" : "replies"
                            }/${id}`,
                            "DELETE"
                        );

                        dispatch(
                            setAlert({
                                message: `your ${commentType} has been deleted`,
                            })
                        );
                    } catch (error) {
                        dispatch(
                            setAlert({ message: error.message, type: "error" })
                        );
                    } finally {
                        dispatch(closeModal());
                    }
                },
            })
        );
    };

    const renderComments = () => {
        if (error) {
            return <p className="status">{capitalizeFirstLetter(error)}</p>;
        }

        if (commentType === "review") {
            if (reviews.length === 0) {
                return (
                    <p className="status-smaller mt-5">
                        No reviews in this{" "}
                        {contentType === "product" ? contentType : "seller"} yet
                    </p>
                );
            }

            return reviews.map((comment) => {
                return (
                    <Comment
                        {...comment}
                        commentType={commentType}
                        key={comment.id}
                        handleCommentDeletion={handleCommentDeletion}
                    />
                );
            });
        }

        const reviewReplies = replies[baseCommentId] || [];

        if (reviewReplies.length === 0) {
            return <p className="status-smaller mb-3">No replies yet</p>;
        }

        return reviewReplies.map((comment) => {
            return (
                <Comment
                    {...comment}
                    commentType={commentType}
                    baseCommentId={baseCommentId}
                    key={comment.id}
                    handleCommentDeletion={handleCommentDeletion}
                />
            );
        });
    };

    return (
        <div className={`${commentType === "review" && "mb-5"} max-w-[450px]`}>
            {commentType === "review" && (
                <div className="flex items-center justify-between mb-3">
                    <h2 className="black-white text-xl font-semibold">
                        Reviews{" "}
                        <span className="dark-light text-lg">
                            ({reviews.length})
                        </span>
                    </h2>

                    {reviewExists && (
                        <Icon
                            toolName="delete your review"
                            onClick={() => handleCommentDeletion(userReviewId)}
                        >
                            <TrashIcon className="icon-small" />
                        </Icon>
                    )}
                </div>
            )}

            {/* if loading reviews, do not show comment adder or disabled message */}
            {!loadingComments && renderCommentAdder()}

            {loadingComments ? (
                <p className="status">Loading {pluralMap[commentType]}...</p>
            ) : (
                renderComments()
            )}
        </div>
    );
};

export default CommentsContainer;
