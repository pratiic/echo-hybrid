import React, { useState } from "react";

const Button = ({
    loading,
    type = "primary",
    full,
    center,
    small,
    smaller,
    large,
    disabled = false,
    children,
    rounded = false,
    textAsIs,
    className,
    onClick,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleButtonFocus = () => {
        setIsFocused(true);
    };

    const handleButtonBlur = () => {
        setIsFocused(false);
    };

    const classNameMap = {
        primary: `text-white hover:bg-blue-four active:bg-blue-three ${
            loading ? "bg-blue-two" : "bg-blue-three"
        }`,
        secondary: `border border-gray-300 hover:bg-gray-100 hover:border-gray-100 active:bg-gray-200 active:border-gray-200 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-800 dark:active:bg-gray-700 dark:active:border-gray-700 ${
            loading ? "text-blue-two dark:text-gray-500" : "text-gray-one"
        }`,
        tertiary: `bg-gray-100 active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700 ${
            loading
                ? "text-blue-two dark:text-gray-500"
                : "text-gray-500 dark:text-gray-300"
        }`,
    };

    return (
        <button
            className={`flex items-center justify-center h-fit min-w-[75px] outline-blue-three transition-all duration-200 ${
                classNameMap[type]
            } ${full && "w-full"} ${center && "mx-auto"} ${
                small
                    ? "px-3 py-[7px]"
                    : smaller
                    ? "px-3 py-[5px]"
                    : large
                    ? "py-[12px] px-9 text-lg"
                    : "py-[9px] px-5"
            } ${disabled && "opacity-80 pointer-events-none"} ${
                loading && "pointer-events-none"
            } ${rounded ? "rounded-full" : "rounded"} ${
                !textAsIs && "capitalize"
            } ${className}`}
            onClick={(event) => {
                !loading && onClick && onClick(event);
            }}
            onFocus={handleButtonFocus}
            onBlur={handleButtonBlur}
        >
            {children}
        </button>
    );
};

export default Button;
