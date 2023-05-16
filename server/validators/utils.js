import Joi from "joi";
import { validate } from "./base.validators.js";

const nameRegex = new RegExp(/^[a-zA-Z]/);

const formatLabel = (label) => {
    switch (label) {
        case "firstName":
            label = "first name";
            break;
        case "lastName":
            label = "last name";
            break;
    }

    return label;
};

export const getErrorMessage = (validationRes) => {
    const {
        type,
        context: { label, limit, regex },
        message,
    } = validationRes.error.details[0];

    if (regex) {
        if (regex.toString() === nameRegex.toString()) {
            return `${label} must start with a character`;
        }
    }

    if (type.includes("min")) {
        return `${label} must be atleast ${limit} characters long`;
    }

    if (type.includes("max")) {
        return `${label} cannot be more than ${limit} characters long`;
    }

    if (type.includes("empty") || type.includes("required")) {
        return `${formatLabel(label)} cannot be empty`;
    }

    if (type.includes("email")) {
        return "email must be valid";
    }

    if (type === "string.length") {
        return `${label} must be ${limit} characters long`;
    }

    return message;
};

export const idSchema = Joi.number().integer().positive().required();

export const validateId = (id) => {
    const schema = Joi.object({
        id: idSchema,
    });

    return validate({ id }, schema);
};
