import React, { useState } from "react";

const Button = ({
  loading,
  type = "primary",
  full,
  center,
  small,
  large,
  disabled = false,
  children,
  rounded,
  textAsIs,
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
    secondary: `bg-gray-50 border hover:bg-blue-one hover:border-blue-one active:bg-blue-two active:text-blue-four active:border-blue-two dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:active:bg-gray-800 ${
      loading ? "text-blue-two dark:text-gray-500" : "text-blue-three"
    }`,
    tertiary: `bg-blue-one border border-blue-one hover:bg-blue-one active:bg-blue-two active:text-blue-four active:border-blue-two dark:bg-gray-700 dark:border-gray-700 dark:active:bg-gray-800 dark:active:border-gray-800 ${
      loading
        ? "text-blue-two dark:text-gray-500"
        : "text-blue-three dark:text-gray-300"
    }`,
  };

  return (
    <button
      className={`flex items-center justify-center rounded h-fit min-w-[75px] outline-blue-three transition-all duration-200 ${
        classNameMap[type]
      } ${full && "w-full"} ${center && "mx-auto"} ${
        small
          ? "px-3 py-[7px]"
          : large
          ? "py-[12px] px-9 text-lg"
          : "py-[9px] px-5"
      } ${disabled && "opacity-80 pointer-events-none"} ${loading &&
        "pointer-events-none"} ${
        rounded ? "rounded-full" : "rounded"
      } ${!textAsIs && "capitalize"}`}
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
