import React, { useState } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { EyeOffIcon, EyeIcon } from "@heroicons/react/solid";
import { useDispatch } from "react-redux";

import { capitalizeFirstLetter, renderCharLimit } from "../lib/strings";
import { showGenericModal } from "../redux/slices/modal-slice";

const InputGroup = ({
    label,
    placeholder,
    value,
    error,
    type = "text",
    view = "input",
    options,
    min,
    max,
    info,
    step = 1,
    minChars,
    maxChars,
    disabled,
    showRequired = true,
    className,
    onChange,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();

    const inputClassName = `border rounded px-2 w-full outline-none block my-[2px] black-white dark:bg-gray-eight ${
        isFocused
            ? "border-blue-three"
            : error
            ? "border-red-400"
            : "border-gray-two dark:border-gray-700"
    }`;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (event) => {
        onChange(event.target.value);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
    };

    const handleInputBlur = () => {
        setIsFocused(false);
    };

    return (
        <div className={`mb-5 ${className}`}>
            {label && (
                <div className="flex items-center">
                    <label
                        className={`ml-1 block capitalize transition-all duration-200 ${
                            isFocused ? "font-medium black-white" : "dark-light"
                        }`}
                    >
                        {label}
                    </label>

                    {showRequired && <span className="ml-1 dark-light">*</span>}

                    {info && (
                        <MdOutlineInfo
                            className="icon-small"
                            onClick={() => dispatch(showGenericModal(info))}
                        />
                    )}
                </div>
            )}

            <div className="relative">
                {view === "input" && (
                    <input
                        type={
                            type === "password"
                                ? showPassword
                                    ? "text"
                                    : "password"
                                : type
                        }
                        placeholder={placeholder}
                        value={value}
                        disabled={disabled}
                        className={`py-[10px] ${inputClassName}`}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                )}

                {view === "select" && (
                    <select
                        className="block mt-[2px] capitalize border rounded py-[11px] outline-none cursor-pointer dark:bg-gray-eight black-white dark:border-gray-700"
                        value={value}
                        onChange={handleInputChange}
                    >
                        {options.map((option) => {
                            return (
                                <option value={option.value} key={option.label}>
                                    {option.label}
                                </option>
                            );
                        })}
                    </select>
                )}

                {view === "textarea" && (
                    <React.Fragment>
                        <textarea
                            placeholder={placeholder}
                            value={value}
                            className={`resize-none h-28 py-1 ${inputClassName}`}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        ></textarea>

                        {renderCharLimit(minChars, maxChars, value)}
                    </React.Fragment>
                )}

                {view === "number" && (
                    <input
                        type="number"
                        value={value}
                        min={min}
                        max={max}
                        step={step}
                        className={`border rounded px-2 py-[10px] dark:bg-gray-eight black-white dark:border-gray-700 ${
                            value.length > 6 ? "w-[150px]" : "w-[100px]"
                        }`}
                        onChange={handleInputChange}
                    />
                )}

                {/* show and hide password */}
                {type === "password" && (
                    <div
                        className="absolute top-1/2 right-0 -translate-y-1/2"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? (
                            <EyeOffIcon className="icon-small" />
                        ) : (
                            <EyeIcon className="icon-small" />
                        )}
                    </div>
                )}
            </div>

            {error && (
                <span className="error">{capitalizeFirstLetter(error)}</span>
            )}
        </div>
    );
};

export default InputGroup;
