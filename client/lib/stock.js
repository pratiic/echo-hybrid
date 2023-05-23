export const getVariantStr = (variant) => {
    let variantStr = "";

    Object.keys(variant).forEach((key) => {
        if (key !== "quantity" && key !== "id") {
            variantStr += `${key}${variant[key]}`;
        }
    });

    return variantStr;
};
