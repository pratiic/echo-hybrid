import Joi from "joi";

import { validate } from "./base.validators.js";

const monthSchema = Joi.number().integer().min(0).max(11).required();
const yearSchema = Joi.number().integer().required();

const monthYearSchema = Joi.object({
    month: monthSchema,
    year: yearSchema,
});

export const validateMonthYear = (monthYearInfo) => {
    return validate(monthYearInfo, monthYearSchema);
};

export const validateYear = (year) => {
    const schema = Joi.object({
        year: yearSchema,
    });

    return validate({ year }, schema);
};

export const validateMonth = (month) => {
    const schema = Joi.object({
        month: monthSchema,
    });

    return validate({ month }, schema);
};
