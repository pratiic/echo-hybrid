import Joi from "joi";

import { validate } from "./base.validators.js";

const storeTypeSchema = Joi.object({
    "store type": Joi.string().required().valid("IND", "BUS").trim(),
});

export const validateStoreType = (storeType) => {
    return validate({ "store type": storeType }, storeTypeSchema);
};
