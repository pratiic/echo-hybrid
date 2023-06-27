import bcrypt from "bcrypt";

import { HttpError } from "../models/http-error.models.js";
import {
    validateNewPassword,
    validateUser,
} from "../validators/user.validators.js";
import prisma from "../lib/prisma.lib.js";
import { prepareImageData } from "../lib/image.lib.js";

export const updateUser = async (request, response, next) => {
    // only username, avatar and phone (delivery personnel) can be updated directly
    const user = request.user;
    const updateInfo = request.body;

    const errorMsg = validateUser(
        { ...user, ...updateInfo },
        "update",
        user.isDeliveryPersonnel
    );

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
                phone: user.isDeliveryPersonnel ? updateInfo.phone : undefined,
                avatar: newAvatar || user.avatar,
            },
        });
        response.json({ user: updatedUser });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
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
    } finally {
        await prisma.$disconnect();
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
                avatar: `https://avatars.dicebear.com/api/initials/${user.firstName[0]}${user.lastName[0]}.svg`,
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
    } finally {
        await prisma.$disconnect();
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
    } finally {
        await prisma.$disconnect();
    }
};

export const getSelfDetails = async (request, response, next) => {
    const user = request.user;

    response.json({ user });
};

// for testing purposes only

export const deleteUser = async (request, response, next) => {
    const userId = parseInt(request.params.userId) || -1;

    try {
        await Promise.all([
            prisma.user.delete({
                where: {
                    id: userId,
                },
            }),
            prisma.store.deleteMany({
                where: {
                    userId,
                },
            }),
            prisma.store.deleteMany({
                where: {
                    userId: null,
                },
            }),
            prisma.product.deleteMany({
                where: {
                    name: "new product",
                    isDeleted: true,
                    storeId: null,
                },
            }),
            prisma.chat.deleteMany({
                where: {
                    userIds: {
                        has: userId,
                    },
                },
            }),
        ]);

        response.json({});
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const verifyUser = async (request, response, next) => {
    const userId = parseInt(request.params.userId) || -1;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isVerified: true,
            },
        }),
            response.json({});
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
