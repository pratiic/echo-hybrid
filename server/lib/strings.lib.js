export const trimValues = (...values) => {
    const trimmedValues = [];

    values.forEach((value) => {
        trimmedValues.push(value ? value.trim() : undefined);
    });

    return trimmedValues;
};

export const capitalizeFirstLetter = (str = "") => {
    str = String(str);
    return str.charAt(0).toUpperCase() + str.slice(1);
};
