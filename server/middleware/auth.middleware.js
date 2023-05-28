import jwt from "jsonwebtoken";

import { HttpError } from "../models/http-error.models.js";
import prisma from "../lib/prisma.lib.js";

const auth = async (request, response, next) => {
    const bearerHeader = request.header("Authorization");
    const errorMsg = "a valid token is required";
    let checkVerified = true;

    // no verification required if url is related to accounts or users
    const url = request.originalUrl;
    if (url.includes("accounts") || url.includes("users")) {
        checkVerified = false;
    }

    if (!bearerHeader) {
        return next(new HttpError(errorMsg, 401));
    }

    const bearer = bearerHeader.split(" ");
    const token = bearer[1] || "";

    try {
        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenVerified) {
            // get the user that made the request and attach the user to the request
            const requestingUser = await prisma.user.findUnique({
                where: {
                    id: tokenVerified.id,
                },
                select: {
                    id: true,
                    isVerified: true,
                    isAdmin: true,
                    ...(request.select || {}), // fields within user to select
                },
            });

            if (!requestingUser) {
                return next(new HttpError(404, "user not found"));
            }

            if (request.validateAdmin && !requestingUser.isAdmin) {
                // need to be an admin
                return next(
                    new HttpError(
                        "you need to be an admin to perform this action",
                        401
                    )
                );
            }

            // if (!request.validateAdmin && requestingUser.isAdmin) {
            //     // cannot be an admin
            //     return next(
            //         new HttpError(
            //             "an admin is not allowed to perform this action",
            //             401
            //         )
            //     );
            // }

            if (checkVerified && !requestingUser.isVerified) {
                return next(
                    new HttpError("your account has not been verified yet", 401)
                );
            }

            request.user = requestingUser;
        } else {
            return next(new HttpError(errorMsg, 401));
        }
    } catch (error) {
        console.log(error);

        let msg = "",
            status = null;

        if (error.message === "jwt malformed") {
            msg = error.message;
            status = 401;
        }

        return next(new HttpError(msg, status));
    }

    next();
};

export default auth;
