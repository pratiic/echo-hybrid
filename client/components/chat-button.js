import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { ChatAlt2Icon } from "@heroicons/react/outline";
import { capitalizeFirstLetter } from "../lib/strings";

import Button from "./button";
import Icon from "./icon";

const ChatButton = ({
    small,
    fullText = false,
    role = "seller",
    isDisabled,
}) => {
    // const router = useRouter();
    const { theme } = useSelector((state) => state.theme);

    const openChat = () => {
        // router.push(`/chats/${userId}`);
        console.log("chat");
    };

    return small ? (
        <Icon onClick={openChat} toolName={isDisabled ? "" : "chat"}>
            <ChatAlt2Icon
                className={`${isDisabled ? "icon-disabled" : "icon"} `}
            />
        </Icon>
    ) : (
        <Button
            small
            type={theme === "light" ? "secondary" : "tertiary"}
            textAsIs={true}
            disabled={isDisabled}
            onClick={openChat}
        >
            <span className="flex items-center">
                <ChatAlt2Icon className="icon-no-bg mr-1 text-blue-400" />
                {!fullText
                    ? "Chat Now"
                    : `Chat with ${capitalizeFirstLetter(role)}`}
            </span>
        </Button>
    );
};

export default ChatButton;
