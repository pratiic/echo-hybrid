import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { ChatAlt2Icon } from "@heroicons/react/outline";
import { capitalizeFirstLetter } from "../lib/strings";

import Button from "./button";
import Icon from "./icon";

const ChatButton = ({
    userId,
    small,
    fullText = false,
    role = "seller",
    isDisabled,
    type = "secondary",
}) => {
    const router = useRouter();
    const { theme } = useSelector((state) => state.theme);

    const openChat = () => {
        if (isDisabled) {
            return null;
        }

        router.push(`/chats/${userId}`);
    };

    return small ? (
        <Icon onClick={openChat} toolName="chat" isDisabled={isDisabled}>
            <ChatAlt2Icon
                className={`${isDisabled ? "icon-disabled" : "icon"} `}
            />
        </Icon>
    ) : (
        <Button
            small
            type={theme === "light" ? type : "tertiary"}
            textAsIs={true}
            disabled={isDisabled}
            onClick={openChat}
        >
            <span className="flex items-center">
                <ChatAlt2Icon
                    className={`icon-no-bg mr-2 ${
                        type === "primary" ? "text-white" : ""
                    }`}
                />
                {!fullText
                    ? "Chat Now"
                    : `Chat with ${capitalizeFirstLetter(role)}`}
            </span>
        </Button>
    );
};

export default ChatButton;
