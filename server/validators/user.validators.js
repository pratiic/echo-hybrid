import Joi from "joi";
import { validate } from "./base.validators.js";

const createNameSchema = (min) => {
    return Joi.string()
        .min(min)
        .max(15)
        .pattern(/^[a-zA-Z]/)
        .required()
        .trim();
};

const firstNameSchema = createNameSchema(3);
const lastNameSchema = createNameSchema(2);
const emailSchema = Joi.string().email().required().trim();
const passwordSchema = Joi.string()
    .min(7)
    .pattern(/^[a-zA-Z]/)
    .required();

const getUserSignUpSchema = (isDeliveryPersonnel) => {
    let schemaObj = {
        firstName: firstNameSchema,
        lastName: lastNameSchema,
        email: emailSchema,
        password: passwordSchema,
    };

    if (isDeliveryPersonnel) {
        schemaObj = attachPhoneSchema(schemaObj);
    }

    return Joi.object(schemaObj);
};

const getUserUpdateSchema = (isDeliveryPersonnel) => {
    let schemaObj = {
        firstName: firstNameSchema,
        lastName: lastNameSchema,
    };

    if (isDeliveryPersonnel) {
        schemaObj = attachPhoneSchema(schemaObj);
    }

    return Joi.object(schemaObj);
};

const userSignInSchema = Joi.object({
    email: emailSchema,
    password: Joi.string()
        .min(7)
        .pattern(/^[a-zA-Z]/),
});

const attachPhoneSchema = (schemaObj) => {
    return {
        ...schemaObj,
        phone: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required(),
    };
};

export const validateUser = (
    userInfo,
    type = "signin",
    isDeliveryPersonnel
) => {
    const schemaMap = {
        signin: userSignInSchema,
        signup: getUserSignUpSchema(isDeliveryPersonnel),
        update: getUserUpdateSchema(isDeliveryPersonnel),
    };

    // type may be "signin", "signup" or "update"
    const schema = schemaMap[type];

    if (!schema) {
        return "provide a valid type - 'signin', 'signup' or 'update'";
    }

    return validate(userInfo, schemaMap[type]);
};

export const validateNewPassword = (newPassword) => {
    const schema = Joi.object({
        "new password": passwordSchema,
    });

    return validate({ "new password": newPassword }, schema);
};
