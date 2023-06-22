import { app } from "../index.js";
import {
    createDeliveryPersonnel,
    createNewUser,
    deleteCreatedUser,
    deleteDeliveryPersonnel,
    signInAsAdmin,
} from "./utils.js";
import { getVerificationCode } from "../lib/verification.lib.js";

describe("POST /api/delivery CREATE DELIVERY PERSONNEL", () => {
    let adminToken;

    beforeAll(async () => {
        adminToken = await signInAsAdmin(app);
    });

    it("should return 401 status code if requested by a non-admin user", async () => {
        const createdUser = await createNewUser(app);

        const response = await createDeliveryPersonnel(app, createdUser.token);

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(401);
    });

    it("should create a delivery personnel if provided valid data", async () => {
        const response = await createDeliveryPersonnel(app, adminToken);

        await deleteCreatedUser(app, response.body.user.id);

        expect(response.statusCode).toBe(201);
    });

    it("should return 400 status code if first name is not provided", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("first name cannot be empty");
    });

    it("should return 400 status code if first name is less than 3 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "ab",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name must be atleast 3 characters long"
        );
    });

    it("should return 400 status code if first name is more than 15 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john john john john john",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "first name cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if last name is not provided", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("last name cannot be empty");
    });

    it("should return 400 status code if last name is less than 2 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "d",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name must be atleast 2 characters long"
        );
    });

    it("should return 400 status code if last name is more than 15 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe doe doe doe doe",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "last name cannot be more than 15 characters long"
        );
    });

    it("should return 400 status code if email is not provided", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email cannot be empty");
    });

    it("should return 400 status code if email is invalid", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: "invalidemail",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("email must be valid");
    });

    it("should return 400 status code if password is not provided", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("password cannot be empty");
    });

    it("should return 400 status code if password less than 7 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
            password: "pass",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "password must be atleast 7 characters long"
        );
    });

    it("should return 400 status code if password does not start with a character", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
            password: "1prat123!",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "password must start with a character"
        );
    });

    it("should return 400 status code if phone is not provided", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
            password: "prat123!",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone cannot be empty");
    });

    it("should return 400 status code if phone is less than 10 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
            password: "pass123!",
            phone: "981022239",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone must be 10 characters long");
    });

    it("should return 400 status code if phone is more than 10 characters", async () => {
        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            email: `johndoe${getVerificationCode()}@gmail.com`,
            password: "pass123!",
            phone: "98102223991",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone must be 10 characters long");
    });

    it("should return 400 status code if email belongs to an existing user", async () => {
        const createdUser = await createNewUser(app);

        const response = await createDeliveryPersonnel(app, adminToken, {
            firstName: "john",
            lastName: "doe",
            password: "prat123!",
            phone: "9810222399",
            email: createdUser.email,
        });

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("user with this email already exists");
    });
});

describe("DELETE /api/delivery/personnel/:personnelId DELETE DELIVERY PERSONNEL", () => {
    let adminToken, deliveryPersonnel;

    beforeAll(async () => {
        adminToken = await signInAsAdmin(app);
        deliveryPersonnel = await createDeliveryPersonnel(app, adminToken);
    });

    it("should return 401 status code if requested by a non-admin user", async () => {
        const createdUser = await createNewUser(app);

        const response = await deleteDeliveryPersonnel(
            app,
            createdUser.token,
            deliveryPersonnel.id
        );

        await deleteCreatedUser(app, createdUser.id);

        expect(response.statusCode).toBe(401);
    });

    it("should return 404 status code if delivery personnel does not exist", async () => {
        const response = await deleteDeliveryPersonnel(app, adminToken, -1);

        expect(response.statusCode).toBe(404);
    });

    it("should delete the delivery personnel if provided valid data", async () => {
        const deliveryPersonnelResponse = await createDeliveryPersonnel(
            app,
            adminToken
        );

        const response = await deleteDeliveryPersonnel(
            app,
            adminToken,
            deliveryPersonnelResponse.body.user.id
        );

        expect(response.statusCode).toBe(200);
    });
});
