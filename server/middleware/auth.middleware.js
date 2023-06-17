import jwt from "jsonwebtoken";

import { HttpError } from "../models/http-error.models.js";
import prisma from "../lib/prisma.lib.js";

const auth = async (request, response, next) => {
    const bearerHeader = request.header("Authorization");
    const errorMsg = "a valid token is required";
    const url = request.originalUrl;
    console.log(request.method, url);

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
                    isDeliveryPersonnel: true,
                    suspension: {
                        select: {
                            id: true,
                            cause: true,
                            createdAt: true,
                        },
                    },
                    ...(request.select || {}), // fields within user to select
                },
            });

            if (!requestingUser) {
                return next(new HttpError(404, "user not found"));
            }

            if (
                !requestingUser.isVerified &&
                !(url.includes("accounts") || url.includes("users"))
            ) {
                // unverified users can only access their account and profile
                return next(
                    new HttpError("your account has not been verified yet", 401)
                );
            }

            if (requestingUser.suspension && !url.includes("users")) {
                // suspended users can only access their profile
                return next(
                    new HttpError("your account is currently suspended", 401)
                );
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

            if (
                request.validateDeliveryPersonnel &&
                !requestingUser.isDeliveryPersonnel
            ) {
                // need to be a delivery personnel
                return next(
                    new HttpError(
                        "you need to be a delivery personnel to perform this action",
                        401
                    )
                );
            }

            if (
                request.checkSellerSuspension &&
                requestingUser.store?.suspension
            ) {
                return next(
                    new HttpError(
                        "your seller profile is currently suspended",
                        401
                    )
                );
            }

            if (
                request.restrictStaff &&
                (requestingUser.isAdmin || requestingUser.isDeliveryPersonnel)
            ) {
                return next(
                    new HttpError(
                        "admin and delivery personnel are not allowed to perform this action",
                        401
                    )
                );
            }

            request.user = requestingUser;
        } else {
            return next(new HttpError(errorMsg, 401));
        }
    } catch (error) {
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
