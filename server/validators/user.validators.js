import Joi from "joi";
import { validate } from "./base.validators.js";

const createNameSchema = (min) => {
    return Joi.string()
        .min(min)
        .max(25)
        .pattern(/^[a-zA-Z]/)
        .required()
        .trim();
};

const firstNameSchema = createNameSchema(3);
const lastNameSchema = createNameSchema(2);
const emailSchema = Joi.string().email().required().trim();

const userSignUpSchema = Joi.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: Joi.string()
        .min(7)
        .pattern(/^[a-zA-Z]/)
        .required(),
});

const userSignInSchema = Joi.object({
    email: emailSchema,
    password: Joi.string()
        .min(7)
        .pattern(/^[a-zA-Z]/),
});

const schemaMap = {
    signin: userSignInSchema,
    signup: userSignUpSchema,
};

export const validateUser = (userInfo, type = "signin") => {
    // type may be "signin", "signup" or "update"
    const schema = schemaMap[type];

    if (!schema) {
        return "provide a valid type - 'signin', 'signup' or 'update'";
    }

    return validate(userInfo, schemaMap[type]);
};
