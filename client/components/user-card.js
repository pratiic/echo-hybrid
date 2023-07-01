import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { setActiveChat } from "../redux/slices/chat-slice";
import { closeModal } from "../redux/slices/modal-slice";
import { capitalizeAll } from "../lib/strings";

import Avatar from "./avatar";
import ChatButton from "./chat-button";
import Rating from "./rating";
import CustomLink from "./custom-link";

const UserCard = ({
    id,
    firstName,
    lastName,
    email,
    avatar,
    chatId,
    isLink,
    hasChatOption,
    counts,
    stars,
    fullName,
    isDeliveryPersonnel,
    isAdmin,
}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { authUser } = useSelector((state) => state.auth);

    const handleUserClick = () => {
        if (!isLink) {
            return;
        }

        if (router.pathname.includes("chats")) {
            router.push(`/chats/${id}`);
            dispatch(
                setActiveChat({
                    id: chatId,
                    user: {
                        id,
                        firstName,
                        lastName,
                        email,
                        avatar,
                        fullName,
                        isDeliveryPersonnel,
                        isAdmin,
                    },
                })
            );
        }
    };

    const renderCount = () => {
        const authUserCount = counts && counts[authUser.id];

        if (authUserCount > 0) {
            return <span className="count ml-auto">{authUserCount}</span>;
        }
    };

    const handleChatClick = () => {
        // user card may be displayed on a modal - need to close modal
        dispatch(closeModal());
    };

    return (
        <CustomLink
            onClick={handleUserClick}
            className="w-full 450:w-96 first:-mt-3 last:mb-0"
        >
            <div
                className={`py-4 dark-light ${
                    isLink ? "card-small" : "card-small-no-link"
                }`}
            >
                <div className="flex items-center space-x-3 px-2">
                    {/* user avatar */}
                    <Avatar avatar={avatar} small />

                    <div>
                        {/* user's name */}
                        <p className="capitalize black-white">
                            {id === authUser.id
                                ? "me"
                                : capitalizeAll(fullName)}
                        </p>

                        {/* user's email */}
                        <p className="text-sm">{email}</p>

                        {/* when showing ratings, show stars */}
                        {stars && (
                            <div className="flex items-center mt-2 -mb-2">
                                <Rating avgRating={stars} onlyStars small />
                                <span className="dark-light text-xs ml-3">
                                    {stars} / 5
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {renderCount()}

                {hasChatOption && id !== authUser?.id && (
                    <div className="ml-auto" onClick={handleChatClick}>
                        <ChatButton userId={id} small />
                    </div>
                )}
            </div>
        </CustomLink>
    );
};

export default UserCard;
