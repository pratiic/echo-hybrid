import Joi from "joi";

import { validate } from "./base.validators.js";
import { validateAddress } from "./address.validators.js";

const flatOrderSchema = Joi.object({
    quantity: Joi.number().integer().positive().required(),
});
const variedOrderSchema = Joi.object({
    quantity: Joi.number().integer().positive().required(),
    variantId: Joi.string().required(),
});
const orderControlSchema = Joi.object({
    orderId: Joi.number().integer().positive().required(),
    action: Joi.string()
        .valid("confirm", "reject", "cancel", "package")
        .required()
        .trim(),
});

export const validateOrder = (orderInfo, orderType) => {
    if (orderType === "flat") {
        return validate(orderInfo, flatOrderSchema);
    }

    return validate(orderInfo, variedOrderSchema);
};

export const validateOrderControl = (orderControlInfo) => {
    return validate(orderControlInfo, orderControlSchema);
};
