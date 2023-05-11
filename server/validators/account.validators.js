import Joi from "joi";

import { validate } from "./base.validators.js";

export const validateCode = (inputCode, actualCode, createdAt) => {
    // the verification code may be incorrect or expired

    if (inputCode.trim() !== actualCode) {
        return "the verification code is incorrect";
    }

    // check if the code is older than 1 hour
    const validAge = validateAge(createdAt, 1);

    if (!validAge) {
        return `the verification code has expired, each code has an age of 1 hour`;
    }
};

export const validatePasswordReset = (resetInfo) => {
    const { email, password, code } = resetInfo;

    if (!email) {
        return "provide the email to the account to be recovered";
    }

    if (!code) {
        return "you need to provide the recovery code";
    }

    return validatePassword(password);
};

export const validateAge = (createdAt, age) => {
    const currentMilliSecs = Date.now();
    const createdDate = new Date(createdAt);
    const createdAtMilliSecs = createdDate.getTime(createdAt);
    const diffMilliSecs = currentMilliSecs - createdAtMilliSecs;

    if (Math.floor(diffMilliSecs / 1000 / 60 / 60) > age) {
        return false;
    }

    return true;
};

const passwordSchema = Joi.object({
    password: Joi.string().min(7).required().trim(),
});

export const validatePassword = (password) => {
    return validate({ password }, passwordSchema);
};
