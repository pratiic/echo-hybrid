export const checkDelivery = (consumerAddr, sellerAddr) => {
    const valleyDistricts = ["kathmandu", "bhaktapur", "lalitpur"];

    if (
        consumerAddr?.province !== "bagmati" ||
        sellerAddr?.province !== "bagmati"
    ) {
        return false;
    }

    if (
        valleyDistricts.find((district) => district === consumerAddr?.city) &&
        valleyDistricts.find((district) => district === consumerAddr?.city)
    ) {
        return true;
    }

    return false;
};
