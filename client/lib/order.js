import { convertToMoney } from "./money";
import { addCommas } from "./strings";

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
