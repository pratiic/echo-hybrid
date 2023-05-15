import React from "react";

const InfoBanner = ({ liftUp = true, className, children }) => {
    return (
        <div
            className={`bg-gray-100 rounded-sm px-3 py-2 dark:bg-gray-800 dark-light max-w-[500px] mb-5 ${liftUp &&
                "-mt-2"} ${className}`}
        >
            {children}
        </div>
    );
};

export default InfoBanner;
