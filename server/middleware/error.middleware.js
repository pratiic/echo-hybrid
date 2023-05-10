export const errorHandler = (error, request, response, next) => {
    const { message, statusCode } = error;

    if (response.headerSent) {
        return next(error);
    }

    response.status(statusCode || 500).json({
        error: message || "a network error occurred, please try again",
    });
};
