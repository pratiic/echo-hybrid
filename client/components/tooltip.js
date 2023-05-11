import React from "react";
import { BsFillTriangleFill } from "react-icons/bs";
import { capitalizeFirstLetter } from "../lib/strings";

const Tooltip = ({ toolName, toolPosition }) => {
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-30 bg-gray-one dark:bg-gray-700 text-gray-200 dark:text-gray-300 px-2 py-1 rounded animate-[tooltip_0.5s] whitespace-nowrap ${
        toolPosition === "bottom" ? "-bottom-[42px]" : "-top-[42px]"
      }`}
    >
      {capitalizeFirstLetter(toolName)}
      <div>
        <BsFillTriangleFill
          className={`absolute text-gray-one dark:text-gray-700 left-1/2 -translate-x-1/2 ${
            toolPosition === "bottom"
              ? "-top-[7px] rotate-[240deg]"
              : "-bottom-[7px] rotate-[60deg]"
          }`}
        />
      </div>
    </div>
  );
};

export default Tooltip;
