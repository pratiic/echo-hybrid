import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/outline";

import CustomLink from "../components/custom-link";
import Dropdown from "./dropdown";
import DropdownItem from "./dropdown-item";

const OptionsToggle = ({
    options,
    active,
    type = "flat",
    rounded = true,
    centered = false,
    dropdownHasShadow = true,
    onClick,
}) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = (event) => {
        event.stopPropagation();

        setShowDropdown(!showDropdown);
    };

    if (type === "flat") {
        return (
            <div
                className={`flex max-w-[400px] hover:cursor-pointer mx-auto ${
                    centered ? "mx-auto" : "550:mx-0"
                }`}
            >
                {options.map((option) => {
                    return (
                        <CustomLink
                            className={`flex items-center justify-center flex-1 capitalize py-1.5 active:bg-gray-300 transition-all duration-200 ${
                                active === option.name
                                    ? "bg-gray-100 font-semibold text-blue-three dark:bg-gray-800"
                                    : "bg-gray-50 text-gray-one dark:bg-gray-700 dark:text-gray-400"
                            } ${
                                rounded
                                    ? "first:rounded-l-full last:rounded-r-full"
                                    : "first:rounded-l last:rounded-r"
                            }`}
                            key={option.name}
                            onClick={() => {
                                onClick(option.name);
                            }}
                        >
                            <h2 className="flex items-center">
                                {option.icon && option.icon}
                                <span className="mx-3">{option.name}</span>
                                {/* {option.count > 0 && (
                  <span
                    className={`flex items-center justify-center text-sm text-gray-one border h-5 w-5 rounded-full ${
                      active === option.name
                        ? "border-blue-three text-blue-three"
                        : "border-gray-one"
                    }`}
                  >
                    {option.count}
                  </span>
                )} */}
                            </h2>
                        </CustomLink>
                    );
                })}
            </div>
        );
    }

    // type is dropdown
    return (
        <div className="relative">
            <CustomLink className="toggle-face" onClick={toggleDropdown}>
                {active}{" "}
                <ChevronDownIcon className="icon-general h-4 w-4 ml-3" />
            </CustomLink>

            <Dropdown
                show={showDropdown}
                toggleDropdown={toggleDropdown}
                hasShadow={dropdownHasShadow}
            >
                {options.map((option) => {
                    return (
                        <DropdownItem
                            active={active === option.name}
                            icon={option.icon}
                            disabled={option.disabled}
                            key={option.name}
                            onClick={() => onClick(option.name)}
                        >
                            {option.value || option.name}
                        </DropdownItem>
                    );
                })}
            </Dropdown>
        </div>
    );
};

export default OptionsToggle;
