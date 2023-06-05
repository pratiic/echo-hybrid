import bcrypt from "bcrypt";

import { HttpError } from "../models/http-error.models.js";
import {
    validateNewPassword,
    validateUser,
} from "../validators/user.validators.js";
import prisma from "../lib/prisma.lib.js";
import { prepareImageData } from "../lib/image.lib.js";

export const updateUser = async (request, response, next) => {
    // only username and avatar can be updated directly
    const user = request.user;
    const updateInfo = request.body;

    const errorMsg = validateUser({ ...user, ...updateInfo }, "update");

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        let newAvatar = "";

        if (request.file) {
            // create a new avatar if it does not already exist
            // update an avatar if it exists
            const avatarData = prepareImageData("user", user.id, request.file);
            const createdAvatar = await prisma.image.upsert({
                where: { userId: user.id },
                update: avatarData,
                create: avatarData,
            });
            newAvatar = createdAvatar.src;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: updateInfo.firstName,
                lastName: updateInfo.lastName,
                avatar: newAvatar || user.avatar,
            },
        });
        response.json({ user: updatedUser });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};

export const resetPassword = async (request, response, next) => {
    const user = request.user;
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword) {
        return next(new HttpError("current password is required", 400));
    }

    // validate new password
    const errorMsg = validateNewPassword(newPassword);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const pwCorrect = await bcrypt.compare(currentPassword, user.password);

        if (!pwCorrect) {
            return next(new HttpError("password is incorrect", 400));
        }

        // hash new password
        const salt = await bcrypt.genSalt(9);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update user password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

        response.json({ message: "password has been reset" });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};

export const deleteAvatar = async (request, response, next) => {
    const user = request.user;

    if (user.avatar.includes("dicebear")) {
        return next(new HttpError("you have no avatar", 404));
    }

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                avatar: `https://avatars.dicebear.com/api/initials/${user.firstName}${user.lastName}.svg`,
            },
        });
        await prisma.image.delete({
            where: {
                userId: user.id,
            },
        });

        response.json({ avatar: updatedUser.avatar });
    } catch (error) {
        next(new HttpError());
    }
};

export const getUserDetails = async (request, response, next) => {
    // for test purposes
    const email = request.params.email;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });

        response.json({
            user,
        });
    } catch (error) {
        next(new HttpError());
    }
};

export const getSelfDetails = async (request, response, next) => {
    const user = request.user;

    response.json({ user });
};
