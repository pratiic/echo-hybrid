import React from "react";

import { ArrowLeftIcon } from "@heroicons/react/solid";

import CustomLink from "./custom-link";
import Icon from "./icon";
import { useRouter } from "next/router";

const Form = ({
    heading,
    subheading,
    subheadingLink,
    hasBackArrow = true,
    onSubmit,
    centered = true,
    children,
}) => {
    const router = useRouter();

    const onBackArrowClick = () => {
        router.back();
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();

        onSubmit(event);
    };
    return (
        <form
            className={`rounded-md box-content ${centered && "mx-auto"}`}
            onSubmit={handleFormSubmit}
        >
            {heading && (
                <div className="normal-case mb-3 text-center mt-2">
                    <div className="flex items-center justify-center">
                        {hasBackArrow && (
                            <Icon
                                onClick={onBackArrowClick}
                                className="mr-2 -ml-2"
                            >
                                <ArrowLeftIcon className="icon" />
                            </Icon>
                        )}
                        <h2 className="black-white text-3xl font-semibold mb-1 text-left leading-none">
                            {heading}
                        </h2>
                    </div>

                    {subheading && (
                        <p className="flex justify-center items-center dark-light">
                            {subheading}{" "}
                            <CustomLink
                                href={`/${subheadingLink}`}
                                className="ml-1 rounded"
                            >
                                <span className="capitalize border-b border-blue-three link   hover:border-blue-four">
                                    {subheadingLink}
                                </span>
                            </CustomLink>
                        </p>
                    )}
                </div>
            )}

            <div className={`w-[20rem] ${centered && "mx-auto"}`}>
                {children}
            </div>
        </form>
    );
};

export default Form;
