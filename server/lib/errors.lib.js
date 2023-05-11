import { HttpError } from "../models/http-error.models.js";

export const notFoundHandler = (errorMsg, contentType, next) => {
    if (errorMsg.toLowerCase().includes("record to delete does not exist")) {
        return next(new HttpError(`${contentType} does not exist`, 404));
    }
};
