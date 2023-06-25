export const convertToMoney = (num) => {
    if (!num.toString().includes(".")) {
        return num;
    }

    const fl = parseFloat(num);
    return parseFloat(fl.toFixed(2));
};

export const addCommas = (num = 0) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getSubtotal = (
    unitPrice,
    quantity,
    deliveryCharge,
    commas = true,
    isDelivered = true
) => {
    if (!deliveryCharge || !isDelivered) {
        deliveryCharge = 0;
    }

    const subtotal = convertToMoney(
        deliveryCharge + (quantity || 1) * unitPrice
    );

    return commas ? addCommas(subtotal) : subtotal;
};
