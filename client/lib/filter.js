export const getFilterMap = (
    locationFilter,
    sellerFilter,
    showingShopProducts
) => {
    return {
        all: "all products from all categories",
        recommended: "recommended products",
        location: `products of your ${
            !showingShopProducts ? locationFilter : sellerFilter.locationFilter
        }`,
        delivered: "products that are delivered to your location",
        "second hand": "second hand products",
        "brand new": "brand new products",
    };
};
