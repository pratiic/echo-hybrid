import Joi from "joi";

import { validate } from "./base.validators.js";

export const targetTypeSchema = Joi.string()
    .valid("product", "store", "user", "review")
    .required()
    .trim();
export const causeSchema = Joi.string().min(20).max(150).required().trim();
const reportSchema = Joi.object({
    targetType: targetTypeSchema,
    cause: causeSchema,
});

export const validateReport = (reportInfo) => {
    return validate(reportInfo, reportSchema);
};

export const validateTargetType = (targetType) => {
    const schema = Joi.object({
        targetType: targetTypeSchema,
    });

    return validate({ targetType }, schema);
};

export const validateCause = (cause) => {
    const schema = Joi.object({
        cause: causeSchema,
    });

    return validate({ cause }, schema);
};
