import { getErrorMessage } from "./utils.js";

export const validate = (data, schema) => {
    const validationRes = schema.validate(data, { allowUnknown: true });

    if (validationRes.error) {
        return getErrorMessage(validationRes);
    }
};
