export const removeDuplicates = (arr) => {
    const newArr = [];

    for (let ele of arr) {
        ele = ele.trim();

        if (newArr.indexOf(ele) === -1) {
            newArr.push(ele);
        }
    }

    return newArr;
};
