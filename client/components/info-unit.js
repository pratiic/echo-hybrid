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
}) => {
    return (
        <div
            className={`flex leading-tight mr-3 flex-${direction} ${direction ===
                "row" &&
                "items-center w-full justify-between border-b border-faint py-[5px] px-1"}`}
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
                className={`text-blue-four ${
                    highlight
                        ? "text-xl"
                        : size === "small"
                        ? "text-sm"
                        : "text-base"
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
