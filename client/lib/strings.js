import { convertToMoney } from "./money";

export const capitalizeFirstLetter = (str = "") => {
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const singularOrPlural = (list = [], strOne, strTwo) => {
    if (list.length === 0 || list.length > 1) {
        return strTwo;
    }

    return strOne;
};

export const addCommas = (num = 0) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const capitalizeAll = (str = "") => {
    return str
        .split(" ")
        .map((word) => capitalizeFirstLetter(word))
        .join(" ");
};

export const renderCharLimit = (minChars, maxChars, currentChars) => {
    if ((!minChars && !maxChars) || currentChars.length === 0) {
        return null;
    }

    const renderMin = () => {
        return `${currentChars.length} / ${minChars} (min)`;
    };

    const renderMax = () => {
        return `${currentChars.length} / ${maxChars} (max)`;
    };

    if (minChars && !maxChars) {
        if (currentChars.length >= minChars) {
            return null;
        }
    }

    return (
        <span
            className={`ml-1 text-xs ${
                currentChars.length < minChars || currentChars.length > maxChars
                    ? "text-red-400"
                    : "dark-light"
            }
            `}
        >
            {minChars && maxChars
                ? currentChars.length < minChars
                    ? renderMin()
                    : renderMax()
                : minChars
                ? renderMin()
                : renderMax()}
        </span>
    );
};
