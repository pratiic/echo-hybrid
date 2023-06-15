import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DotsHorizontalIcon, FlagIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { setActiveComment } from "../redux/slices/comments-slice";
import { showGenericModal } from "../redux/slices/modal-slice";

import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";
import TargetReporter from "./target-reporter";
import Icon from "./icon";

const CommentMenu = ({
    id,
    text,
    image,
    user,
    commentType,
    handleCommentDeletion,
}) => {
    const [isMyComment, setIsMyComment] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const { authUser } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        setIsMyComment(user?.id === authUser?.id);
    }, [authUser]);

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    const handleUpdateClick = () => {
        dispatch(setActiveComment({ id, text, image }));
    };

    const handleReportClick = () => {
        dispatch(
            showGenericModal(
                <TargetReporter targetType="review" targetId={id} />
            )
        );
    };

    const handleChatClick = () => {
        router.push(`/chats/${user?.id}`);
    };

    return (
        <React.Fragment>
            <div className="relative">
                <Icon onClick={toggleDropdown} toolName="options">
                    <DotsHorizontalIcon className="icon" />
                </Icon>

                <Dropdown
                    show={showDropdown}
                    position="top"
                    toggleDropdown={toggleDropdown}
                >
                    {isMyComment ? (
                        <React.Fragment>
                            {commentType === "review" && (
                                <DropdownItem
                                    action="update"
                                    onClick={handleUpdateClick}
                                >
                                    update {commentType}
                                </DropdownItem>
                            )}

                            <DropdownItem
                                action="delete"
                                onClick={() => handleCommentDeletion(id)}
                            >
                                delete {commentType}
                            </DropdownItem>
                        </React.Fragment>
                    ) : (
                        commentType === "review" && (
                            <React.Fragment>
                                <DropdownItem
                                    action="chat"
                                    textAsIs
                                    onClick={handleChatClick}
                                >
                                    Chat with User
                                </DropdownItem>

                                {!(
                                    authUser?.isAdmin ||
                                    authUser?.isDeliveryPersonnel
                                ) && (
                                    <DropdownItem
                                        action="report"
                                        onClick={handleReportClick}
                                    >
                                        report review
                                    </DropdownItem>
                                )}
                            </React.Fragment>
                        )
                    )}
                </Dropdown>
            </div>
        </React.Fragment>
    );
};

export default CommentMenu;
