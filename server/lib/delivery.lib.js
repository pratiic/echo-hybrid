const valleyDistricts = ["kathmandu", "bhaktapur", "lalitpur"];

export const checkDelivery = (consumerAddr, sellerAddr) => {
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

export const checkDeliverySingle = (address) => {
    if (
        address?.province === "bagmati" &&
        valleyDistricts.indexOf(address?.city) > -1
    ) {
        return true;
    }

    return false;
};
