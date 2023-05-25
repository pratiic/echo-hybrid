import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

const CustomLink = ({
    href,
    className,
    children,
    widthFit = true,
    onClick,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const router = useRouter();
    const linkRef = useRef();

    useEffect(() => {
        if (linkRef.current && isFocused) {
            linkRef.current?.addEventListener("keydown", (event) => {
                if (event.keyCode === 13) {
                    linkRef.current?.click();
                    setIsFocused(false);
                }
            });
        }
    }, [isFocused, linkRef]);

    const handleButtonFocus = (event) => {
        setIsFocused(true);
    };

    const handleButtonBlur = () => {
        setIsFocused(false);
    };

    const handleLinkClick = (event) => {
        setIsFocused(false);

        if (href) {
            router.push(href);
        }

        if (onClick) {
            onClick(event);
        }
    };

    if (!href && !onClick) {
        throw new Error("href or onClick is required");
    }

    return (
        <div
            className={`${className} h-fit outline-none border active:border-transparent  ${
                isFocused ? "border-blue-four" : "border-transparent"
            } ${widthFit && "w-fit"}`}
            tabIndex={0}
            ref={linkRef}
            onClick={handleLinkClick}
            onFocus={handleButtonFocus}
            onBlur={handleButtonBlur}
        >
            {children}
        </div>
    );
};

export default CustomLink;
