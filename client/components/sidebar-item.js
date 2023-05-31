import React from "react";
import { useSelector } from "react-redux";

import CustomLink from "./custom-link";

const SidebarItem = ({
    name,
    count,
    active,
    link,
    countFlat,
    onClick,
    children,
}) => {
    const { showSidebar } = useSelector((state) => state.sidebar);

    return (
        <CustomLink
            className={`${
                showSidebar ? "hidden 1000:flex" : "flex"
            } items-center w-fit px-5 py-2 mb-4 last:mb-0 rounded-full hover: cursor-pointer hover:bg-gray-two active:bg-gray-300 transition-all duration-200 dark:hover:bg-gray-700 dark:active:bg-gray-800 ${
                active
                    ? "text-blue-three bg-gray-four font-semibold dark:bg-gray-800"
                    : "dark-light"
            }`}
            onClick={() => onClick(name, link)}
        >
            <div className="relative">
                {count > 0 && (
                    <span
                        className={`absolute -top-1 -right-[2px] count ${!countFlat &&
                            "animate-bounce"}`}
                    >
                        {count}
                    </span>
                )}

                {children}
            </div>

            <span className="capitalize ml-3">{name}</span>
        </CustomLink>
    );
};

export default SidebarItem;
