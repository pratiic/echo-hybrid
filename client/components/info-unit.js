import React from "react";
import { convertToMoney } from "../lib/money";

import { addCommas, capitalizeFirstLetter } from "../lib/strings";

const InfoUnit = ({
    label,
    value,
    hasMoney = false,
    highlight,
    direction = "col",
    size = "small",
    toMoney,
    textBlue = true,
    capitalize,
}) => {
    return (
        <div
            className={`flex leading-tight mr-3 flex-${direction} ${direction ===
                "row" &&
                "items-center w-fit justify-between border-b border-faint py-[5px] px-1 space-x-5"}`}
        >
            <span
                className={`${
                    highlight
                        ? "text-md"
                        : size === "small"
                        ? "text-sm"
                        : "text-base"
                } ${highlight ? "black-white" : "dark-light"}`}
            >
                {capitalizeFirstLetter(label)}
            </span>
            <span
                className={`whitespace-pre-wrap ${
                    highlight
                        ? "text-xl"
                        : size === "small"
                        ? "text-sm"
                        : "text-base"
                } ${textBlue ? "text-blue-400" : "font-semibold dark-light"} ${
                    capitalize ? "capitalize" : ""
                }`}
            >
                {hasMoney && "Rs. "}
                {hasMoney
                    ? addCommas(toMoney ? convertToMoney(value) : value)
                    : capitalizeFirstLetter(value)}
            </span>
        </div>
    );
};

export default InfoUnit;
