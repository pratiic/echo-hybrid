import Joi from "joi";
import { validate } from "./base.validators.js";

const businessSchema = Joi.object({
    name: Joi.string().min(5).max(50).required().trim(),
    ownerName: Joi.string().min(5).max(25).required().trim(),
    PAN: Joi.string().length(9).required().trim(),
    phone: Joi.string()
        .pattern(/^\d{9,10}$/)
        .message("enter a valid 9 or 10-digit phone number"),
});

const statusSchema = Joi.string()
    .required()
    .valid("PENDING", "ACCEPTED", "REJECTED");

export const validateBusiness = (businessInfo) => {
    return validate(businessInfo, businessSchema);
};

export const validateStatus = (status) => {
    const schema = Joi.object({
        status: statusSchema,
    });

    return validate({ status }, schema);
};
