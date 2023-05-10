export const trimValues = (...values) => {
    const trimmedValues = [];

    values.forEach((value) => {
        trimmedValues.push(value ? value.trim() : undefined);
    });

    return trimmedValues;
};
