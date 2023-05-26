import { convertToMoney } from "./money";
import { addCommas } from "./strings";

export const getSubtotal = (
    unitPrice,
    quantity,
    deliveryCharge,
    commas = true
) => {
    if (!deliveryCharge) {
        deliveryCharge = 0;
    }

    const subtotal = convertToMoney(deliveryCharge + quantity * unitPrice);

    return commas ? addCommas(subtotal) : subtotal;
};
