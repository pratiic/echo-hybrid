import React from "react";

const Avatar = ({ avatar, small, smaller }) => {
    return (
        <div
            className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full ${
                small
                    ? "h-[40px] w-[40px]"
                    : smaller
                    ? "h-9 w-9"
                    : "h-9 w-9 500:h-11 500:w-11"
            }`}
        >
            {avatar ? (
                <img
                    src={`${avatar}`}
                    alt="av"
                    className="rounded-full w-full h-full object-cover"
                />
            ) : (
                <span className="text-xs dark-light">404</span>
            )}
        </div>
    );
};

export default Avatar;
