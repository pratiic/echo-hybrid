import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/router";
import { XCircleIcon } from "@heroicons/react/outline";

import Icon from "./icon";

const SearchBar = ({
    show,
    placeholder,
    resultsCount = 0,
    contentType,
    className,
    focusOnLoad = false,
    value = "",
    clearSearch,
    onChange,
    onSubmit,
}) => {
    const router = useRouter();
    const inputRef = useRef();

    const [query, setQuery] = useState(router.query?.query || value);
    const [isFocused, setIsFocused] = useState(false);
    const pluralMap = {
        product: "products",
        shop: "shops",
    };

    useEffect(() => {
        setQuery(router.query?.query || "");
    }, [router]);

    useEffect(() => {
        if (focusOnLoad) {
            inputRef.current?.focus();
        }
    });

    useEffect(() => {
        if (onChange) {
            onChange(query.toLowerCase());
        }
    }, [query]);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (onChange) {
            return;
        }

        if (onSubmit) {
            return onSubmit(query);
        }

        router.query.query = query;
        router.push(router);
    };

    const handleSearchClearance = () => {
        setQuery("");
        clearSearch();
    };

    if (!show) {
        return null;
    }

    return (
        <form onSubmit={handleFormSubmit} className={className}>
            <div className="flex items-center">
                <div
                    className={`flex items-center border dark:border-gray-700 w-full 400:w-72 py-[9px] px-2 rounded-full transition-all duration-200 ${isFocused &&
                        "border-blue-three"}`}
                >
                    <FiSearch className="h-[18px] w-[18px] text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        ref={inputRef}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="outline-none block w-full bg-transparent black-white"
                    />
                </div>

                {clearSearch && query && (
                    <Icon
                        className="ml-1"
                        toolName="cancel search"
                        onClick={handleSearchClearance}
                    >
                        <XCircleIcon className="icon" />
                    </Icon>
                )}
            </div>

            {router.query.query && (
                <p className="mt-2 text-sm ml-3 dark-light">
                    Showing results for{" "}
                    <span className="font-semibold text-blue-400">
                        {router.query.query}
                    </span>{" "}
                    <span className="dark-light">
                        ({resultsCount}{" "}
                        {resultsCount === 0 || resultsCount > 1
                            ? pluralMap[contentType]
                            : contentType}{" "}
                        found)
                    </span>
                </p>
            )}
        </form>
    );
};

export default SearchBar;
