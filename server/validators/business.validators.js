import Joi from "joi";
import { validate } from "./base.validators.js";

const businessSchema = Joi.object({
    name: Joi.string().min(5).max(50).required().trim(),
    ownerName: Joi.string().min(5).max(25).required().trim(),
    PAN: Joi.string().max(12).required().trim(),
    phone: Joi.number()
        .integer()
        .required()
        .when(Joi.number().min(100000000).max(999999999), {
            then: Joi.number().integer().min(100000000).max(999999999),
        })
        .when(Joi.number().min(1000000000).max(9999999999), {
            then: Joi.number().integer().min(1000000000).max(9999999999),
        })
        .min(100000000)
        .max(9999999999),
});

export const validateBusiness = (businessInfo) => {
    return validate(businessInfo, businessSchema);
};
