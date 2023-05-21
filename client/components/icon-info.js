import React from "react";

const IconInfo = ({ icon, className, children }) => {
  return (
    <div className={`${className} flex items-center`}>
      <span className="mr-1">{icon}</span>
      {children}
    </div>
  );
};

export default IconInfo;
