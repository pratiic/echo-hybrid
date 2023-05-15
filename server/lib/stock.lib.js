export const createValuesStr = (obj, variationLabels) => {
    let valuesStr = "";

    for (let label of variationLabels) {
        valuesStr = valuesStr + obj[label];
    }

    return valuesStr;
};
