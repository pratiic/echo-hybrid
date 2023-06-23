import React, { useEffect } from "react";

const Dropdown = ({
    show,
    toggleDropdown,
    position = "bottom",
    hasShadow = true,
    children,
}) => {
    if (!show) {
        return null;
    }

    useEffect(() => {
        document.body.addEventListener("click", (event) => {
            if (show) {
                toggleDropdown(event);
            }
        });
    }, []);

    return (
        <ul
            className={`absolute right-0 rounded-lg shadow-gray-two dark:shadow-none z-20 max-h-[300px] overflow-y-scroll scrollbar-thin scrollbar-thumb-scrollbar-light
            scrollbar-thumb-rounded-full dark:scrollbar-thumb-scrollbar-dark ${
                position === "bottom" ? "mt-1" : "-top-full -mt-3"
            } ${hasShadow && "shadow-lg"}`}
            id="dropdown"
        >
            {children}
        </ul>
    );
};

export default Dropdown;
