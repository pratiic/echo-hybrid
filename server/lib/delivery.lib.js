export const checkWithinValley = (consumerAddr, sellerAddr) => {
    const validDistricts = ["kathmandu", "bhatkapur", "lalitpur"];

    if (
        consumerAddr.province !== "bagmati" ||
        sellerAddr.province !== "bagmati"
    ) {
        return false;
    }
};
