import { sendEmail } from "../lib/email.lib.js";
import prisma from "../lib/prisma.lib.js";
import { getVerificationCode } from "../lib/verification.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateCode } from "../validators/account.validators.js";

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
        console.log(error);

        next(new HttpError());
    }
};
