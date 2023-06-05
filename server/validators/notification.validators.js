import Joi from "joi";

import { validate } from "./base.validators.js";

const notificationSchema = Joi.object({
    text: Joi.string().required().trim(),
    destinationId: Joi.number().integer().required(),
    linkTo: Joi.string().allow("").allow(null).trim(),
});

export const validateNotification = (notificationInfo) => {
    return validate(notificationInfo, notificationSchema);
};
