import { useRouter } from "next/router";
import React, { useReducer } from "react";
import { useDispatch } from "react-redux";
import { TrashIcon } from "@heroicons/react/outline";

import { capitalizeFirstLetter } from "../lib/strings";
import { getHowLongAgo } from "../lib/date-time";
import { closeModal, showLoadingModal } from "../redux/slices/modal-slice";
import { fetcher } from "../lib/fetcher";
import { deleteNotification } from "../redux/slices/notifications-slice";
import { setErrorAlert } from "../redux/slices/alerts-slice";

import CustomLink from "./custom-link";
import Avatar from "./avatar";

const NotificationCard = ({ id, origin, text, createdAt, linkTo }) => {
    const dispatch = useDispatch();
    const router = useRouter();

    const handleClick = () => {
        if (linkTo) {
            router.push(linkTo);
        }
    };

    const handleDeletion = async (e) => {
        e.stopPropagation();

        dispatch(showLoadingModal("deleting notification..."));

        try {
            await fetcher(`notifications/${id}`, "DELETE");

            dispatch(deleteNotification(id));
        } catch (error) {
            dispatch(setErrorAlert(error.message));
        } finally {
            dispatch(closeModal());
        }
    };

    return (
        <CustomLink onClick={handleClick} className="w-full 600:w-[500px]">
            <div
                className={`flex relative py-3 items-center 500:px-3 border-b border-gray-four group transition-all duration-200 ${linkTo &&
                    "hover:cursor-pointer hover:rounded hover:bg-gray-three dark:hover:bg-gray-700 active:bg-gray-four dark:active:bg-gray-800 "} dark:border-gray-800`}
            >
                {/* user avatar  */}
                <div className="w-9 h-9">
                    <Avatar avatar={origin.avatar} smaller />
                </div>

                {/* notification text  */}
                <div
                    className={`flex-1 dark-light ml-3 leading-tight max-w-[90%] transition-all duration-200 ${linkTo &&
                        "group-hover:text-t-black dark:group-hover:text-gray-100"}`}
                >
                    <p className="mb-1">{capitalizeFirstLetter(text)}</p>

                    {/* notification time  */}
                    <span className="text-xs dark-light font-semibold">
                        {getHowLongAgo(createdAt, true)} ago
                    </span>
                </div>

                {/* delete icon  */}
                <TrashIcon
                    className="icon icon-small"
                    onClick={handleDeletion}
                />
            </div>
        </CustomLink>
    );
};

export default NotificationCard;
