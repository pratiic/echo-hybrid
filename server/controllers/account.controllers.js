import bcrypt from "bcrypt";

import { sendEmail } from "../lib/email.lib.js";
import prisma from "../lib/prisma.lib.js";
import { getVerificationCode } from "../lib/verification.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateCode,
    validatePasswordReset,
} from "../validators/account.validators.js";

const errorMsg = "the account is already verified";

export const createAccountVerification = async (request, response, next) => {
    const user = request.user;

    if (user.isVerified) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const verificationData = {
            code: getVerificationCode(),
            userId: user.id,
        };

        const accountVerification = await prisma.accountVerification.upsert({
            where: { userId: user.id },
            create: verificationData,
            update: verificationData,
        });

        // send the verification code in an email
        sendEmail(
            user.email,
            "account verification",
            `the code to verify your account is ${accountVerification.code}`
        );

        response.json({
            message: "verification code has been sent",
        });
    } catch (error) {
        next(new HttpError());
    }
};

export const verifyAccount = async (request, response, next) => {
    const user = request.user;
    const code = request.query.code;

    if (user.isVerified) {
        return next(new HttpError(errorMsg, 400));
    }

    if (!code) {
        return next(new HttpError("provide a verification code", 400));
    }

    try {
        const accountVerification = await prisma.accountVerification.findUnique(
            { where: { userId: user.id } }
        );

        const errorMsg = validateCode(
            code,
            accountVerification.code,
            accountVerification.updatedAt
        );

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        await Promise.all([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                },
            }),
            prisma.accountVerification.delete({
                where: { userId: user.id },
            }),
        ]);

        response.json({
            message: "the account has been verified",
        });
    } catch (error) {
        next(new HttpError());
    }
};

export const createAccountRecovery = async (request, response, next) => {
    const email = request.body.email;

    if (!email) {
        return next(new HttpError("email is required", 400));
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email.trim(),
            },
        });

        if (!user) {
            return next(new HttpError("user not found", 404));
        }

        const resetData = {
            code: getVerificationCode(),
            userId: user.id,
        };

        await prisma.accountRecovery.upsert({
            where: {
                userId: user.id,
            },
            create: resetData,
            update: resetData,
        });

        sendEmail(
            user.email,
            "password reset",
            `the code to reset your password is ${resetData.code}`
        );

        response.json({ message: "code to reset password has been sent" });
    } catch (error) {
        next(new HttpError());
    }
};

export const recoverAccount = async (request, response, next) => {
    const { email, code, password } = request.body;
    let errorMsg = validatePasswordReset(request.body);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email.trim(),
            },
        });

        if (!user) {
            return next(new HttpError("user not found", 404));
        }

        const accountRecovery = await prisma.accountRecovery.findUnique({
            where: {
                userId: user.id,
            },
        });

        if (!accountRecovery) {
            return next(
                new HttpError(
                    "you need to request for an account recovery first",
                    400
                )
            );
        }

        errorMsg = validateCode(
            code,
            accountRecovery.code,
            accountRecovery.updatedAt
        );

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        // hash the new password
        const salt = await bcrypt.genSalt(9);
        const hashedPassword = await bcrypt.hash(password, salt);

        await Promise.all([
            prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password: hashedPassword,
                },
            }),
            prisma.accountRecovery.delete({
                where: {
                    userId: user.id,
                },
            }),
        ]);

        response.json({ message: "the password has been reset" });
    } catch (error) {
        next(new HttpError());
    }
};
