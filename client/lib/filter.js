export const getFilterMap = (locationFilter) => {
    return {
        all: "all products",
        recommended: "recommended products",
        location: `products of your ${locationFilter}`,
        delivered: "products that are delivered to your location",
        "second hand": "second hand products",
        "brand new": "brand new products",
    };
};
