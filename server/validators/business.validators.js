import Joi from "joi";
import { validate } from "./base.validators.js";
import { causeSchema } from "./report.validators.js";
import { addressSchema } from "./address.validators.js";

const businessSchema = Joi.object({
    name: Joi.string().min(5).max(50).required().trim(),
    PAN: Joi.string().length(9).required().trim(),
    phone: Joi.string()
        .pattern(/^\d{9,10}$/)
        .message("enter a valid 9 or 10-digit phone number")
        .required(),
});
const registrationControlSchema = Joi.object({
    action: Joi.string().valid("accept", "reject").required().trim(),
    cause: Joi.when("action", {
        is: "reject",
        then: causeSchema,
        otherwise: Joi.string().allow("").allow(null),
    }),
});

export const validateBusiness = (businessInfo, regImage) => {
    // 1. validate business details
    // 2. validate business address

    const detailsValidationError = validate(businessInfo, businessSchema);

    if (detailsValidationError) {
        return detailsValidationError;
    }

    if (!regImage) {
        return "business registration certificate must be provided";
    }

    const addressValidationError = validate(businessInfo, addressSchema);

    return addressValidationError;
};

export const validateBusinessRegistrationControl = (controlInfo) => {
    return validate(controlInfo, registrationControlSchema);
};
