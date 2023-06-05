import Joi from "joi";

import { validate } from "./base.validators.js";

const monthYearSchema = Joi.object({
    month: Joi.number().integer().min(0).max(11).required(),
    year: Joi.number().integer().required(),
});

export const validateMonthYear = (monthYearInfo) => {
    return validate(monthYearInfo, monthYearSchema);
};
