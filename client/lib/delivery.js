export const checkDelivery = (consumerAddr, sellerAddr) => {
    const valleyDistricts = ["kathmandu", "bhaktapur", "lalitpur"];

    if (
        consumerAddr?.province !== "bagmati" ||
        sellerAddr?.province !== "bagmati"
    ) {
        return false;
    }

    if (
        valleyDistricts.find(
            (district) => district === consumerAddr?.district
        ) &&
        valleyDistricts.find((district) => district === consumerAddr?.district)
    ) {
        return true;
    }

    return false;
};
