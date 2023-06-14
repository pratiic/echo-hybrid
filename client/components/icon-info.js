import React from "react";

const IconInfo = ({ icon, className, capitalize, children }) => {
    return (
        <div
            className={`${className} flex items-center ${
                capitalize ? "capitalize" : ""
            }`}
        >
            <span className={"mr-2"}>{icon}</span>
            {children}
        </div>
    );
};

export default IconInfo;
