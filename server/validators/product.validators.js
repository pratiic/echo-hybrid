import Joi from "joi";

import { validate } from "./base.validators.js";

const priceSchema = Joi.number().positive().required();
const productSchema = Joi.object({
    name: Joi.string()
        .min(5)
        .max(50)
        .required()
        .pattern(/^[a-zA-Z]/)
        .trim(),
    description: Joi.string()
        .min(50)
        .max(150)
        .required()
        .pattern(/^[a-zA-Z]/)
        .trim(),
    price: priceSchema,
    per: Joi.string().max(20).allow("").allow(null).trim(),
    brand: Joi.string().max(30).allow("").allow(null).trim(),
    madeIn: Joi.string().max(30).allow("").allow(null).trim(),
    deliveryCharge: Joi.number().integer().positive().required(),
    category: Joi.string().required(),
    subCategory: Joi.string().min(3).max(15).required(),
});

export const validateProduct = (productInfo, isSecondHand) => {
    const stockTypeSchema = Joi.object({
        stockType: Joi.string().valid("flat", "varied").required().trim(),
    });

    if (!isSecondHand) {
        const errorMsg = validate(productInfo, stockTypeSchema);

        if (errorMsg) {
            return errorMsg;
        }
    }

    return validate(productInfo, productSchema);
};
