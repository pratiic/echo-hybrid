import Joi from "joi";

import { validate } from "./base.validators.js";

const cartItemSchema = Joi.object({
    productId: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
});

const variedCartItemSchema = Joi.object({
    productId: Joi.number().integer().required(),
    quantity: Joi.number().integer().required(),
    variantId: Joi.string().required(),
});

export const validateCartItem = (itemInfo, stockType) => {
    return validate(
        itemInfo,
        stockType === "flat" ? cartItemSchema : variedCartItemSchema
    );
};
