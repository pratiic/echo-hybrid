import Joi from "joi";

import { validate } from "./base.validators.js";
import { causeSchema, targetTypeSchema } from "./report.validators.js";

const suspensionSchema = Joi.object({
    targetType: targetTypeSchema,
    action: Joi.string().valid("suspend", "reinstate").required().trim(),
    cause: Joi.when("action", {
        is: "suspend",
        then: causeSchema,
        otherwise: Joi.string().allow("").allow(null),
    }),
});

export const validateSuspension = (suspensionInfo) => {
    return validate(suspensionInfo, suspensionSchema);
};
