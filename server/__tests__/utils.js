import supertest from "supertest";
import { getVerificationCode } from "../lib/verification.lib";

export const signInAsAdmin = async (app) => {
    const response = await supertest(app).post("/api/auth/signin").send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    });

    return response.body.user.token;
};

export const createNewUser = async (app) => {
    const response = await supertest(app)
        .post("/api/auth/signup")
        .send({
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`, // getVerificationCode -> unique email
            password: "prat123!",
        });

    // verify user
    const adminToken = await signInAsAdmin(app);
    await supertest(app)
        .patch(`/api/users/${response.body.user.id}/verification`)
        .set("Authorization", `Bearer ${adminToken}`);

    return response.body.user;
};

export const deleteCreatedUser = async (app, userId, adminToken) => {
    await supertest(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
};
