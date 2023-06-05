import React from "react";

const IconInfo = ({ icon, className, children }) => {
    return (
        <div className={`${className} flex items-center`}>
            <span className="mr-2">{icon}</span>
            {children}
        </div>
    );
};

export default IconInfo;
