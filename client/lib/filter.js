export const getFilterMap = (
    locationFilter,
    sellerFilter,
    showingShopProducts
) => {
    return {
        all: "all products",
        location: `products of your ${
            !showingShopProducts ? locationFilter : sellerFilter.locationFilter
        }`,
        delivered: "products that are delivered to your location",
        "second hand": "second hand products",
    };
};
