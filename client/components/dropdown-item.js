import React from "react";
import {
    PencilAltIcon,
    TrashIcon,
    InformationCircleIcon,
    FlagIcon,
    ChatAlt2Icon,
} from "@heroicons/react/outline";

const DropdownItem = ({
    action,
    icon,
    active,
    children,
    disabled,
    hasAction = true,
    propagateEvent = true,
    textAsIs,
    onClick,
}) => {
    // common icons
    const actionIconMap = {
        update: <PencilAltIcon className="icon-no-bg" />,
        delete: <TrashIcon className="icon-no-bg" />,
        info: <InformationCircleIcon className="icon-no-bg" />,
        report: <FlagIcon className="icon-no-bg" />,
        chat: <ChatAlt2Icon className="icon-no-bg" />,
    };

    const handleClick = (event) => {
        if (disabled || !propagateEvent) {
            event.stopPropagation();
        }

        onClick && onClick(event);
    };

    return (
        <li
            className={`flex items-center whitespace-nowrap px-5 py-[10px] first:rounded-tl-lg first:rounded-tr-lg last:rounded-bl-lg last:rounded-br-lg min-w-[100px] ${hasAction &&
                "cursor-pointer hover:bg-gray-two dark:hover:bg-gray-800 hover:text-t-black dark:hover:text-gray-100 active:bg-gray-300 dark:active:bg-gray-700"} ${
                active
                    ? "bg-gray-two dark:bg-gray-800 black-white"
                    : "bg-gray-four dark:bg-gray-700 text-gray-one dark:text-gray-300"
            } ${disabled && "pointer-events-none"} ${
                !textAsIs ? "capitalize" : ""
            }`}
            onClick={handleClick}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {action && <span className="mr-2">{actionIconMap[action]}</span>}
            {children}
        </li>
    );
};

export default DropdownItem;
