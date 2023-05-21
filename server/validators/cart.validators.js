import Joi from "joi";

import { validate } from "./base.validators.js";

const quantitySchema = Joi.number().integer().positive().required();
const cartItemSchema = Joi.object({
    quantity: quantitySchema,
});
const variedCartItemSchema = Joi.object({
    quantity: quantitySchema,
    variantId: Joi.string().required(),
});

export const validateCartItem = (itemInfo, stockType) => {
    return validate(
        itemInfo,
        stockType === "flat" ? cartItemSchema : variedCartItemSchema
    );
};
