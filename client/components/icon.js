import React, { useState, useEffect, useRef } from "react";
import Tooltip from "./tooltip";

const Icon = ({ children, className, toolName, toolPosition, onClick }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const iconRef = useRef();

  useEffect(() => {
    if (iconRef.current && isFocused) {
      iconRef.current?.addEventListener("keydown", (event) => {
        if (event.keyCode === 13) {
          iconRef.current?.click();
          setIsFocused(false);
        }
      });
    }
  }, [isFocused, iconRef]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    setIsFocused(false);
  };

  const handleIconClick = (event) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div
      className={`${className} relative outline-none border rounded-full active:border-transparent hover:border-transparent ${
        isFocused ? "border-blue-400" : "border-transparent"
      }`}
      tabIndex={0}
      ref={iconRef}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      onClick={handleIconClick}
    >
      {toolName && (isFocused || isMouseEntered) && (
        <Tooltip toolName={toolName} toolPosition={toolPosition} />
      )}

      {children}
    </div>
  );
};

export default Icon;
