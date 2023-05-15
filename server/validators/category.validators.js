import Joi from "joi";

import { validate } from "./base.validators.js";

const categorySchema = Joi.object({
    name: Joi.string().required(),
});
const categoriesSchema = Joi.object({
    categories: Joi.array().items(categorySchema).required(),
});

export const validateCategories = (categories) => {
    return validate({ categories }, categoriesSchema);
};

export const validateCategoryName = (name) => {
    return validate({ name }, categorySchema);
};
