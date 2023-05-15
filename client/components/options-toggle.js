import React from "react";

import CustomLink from "../components/custom-link";

const OptionsToggle = ({
  options,
  active,
  type = "flat",
  rounded = true,
  dropdownHasShadow = true,
  centered = false,
  onClick,
}) => {
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
};

export default OptionsToggle;
