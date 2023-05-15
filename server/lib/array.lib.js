export const trimArrValues = (arr) => {
    if (!Array.isArray(arr)) {
        return undefined;
    }

    const trimmedArr = [];

    arr.forEach((ele) => {
        trimmedArr.push(ele ? ele.trim() : undefined);
    });

    return trimmedArr;
};
