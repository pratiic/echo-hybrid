import React from "react";
import { useSelector } from "react-redux";

import { capitalizeFirstLetter } from "../lib/strings";

const Human = ({ name, message, contentType }) => {
    const { theme } = useSelector((state) => state.theme);

    const getCustomMessage = () => {
        if (message.includes("not found")) {
            return `Sorry, the ${contentType} you are looking for was not found`;
        } else if (message.includes("deleted")) {
            return `Sorry, the ${contentType} you are looking for was deleted`;
        }

        return message;
    };

    return (
        <div className="flex flex-col justify-center">
            <img
                src={`/humans/${name}/${theme}.svg`}
                className="image h-[350px] mx-auto mt-[20px]"
            />

            {message && (
                <span className="status">
                    {capitalizeFirstLetter(getCustomMessage(message))}
                </span>
            )}
        </div>
    );
};

export default Human;
