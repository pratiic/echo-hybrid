import supertest from "supertest";

import { app } from "../index.js";
import {
    createBusiness,
    createNewUser,
    deleteCreatedUser,
    signInAsAdmin,
} from "./utils.js";
import {
    controlBusinessRegistration,
    deleteBusiness,
    registerBusiness,
} from "./utils/business.utils.js";
import { setAddress } from "./utils/address.utils.js";

describe("POST /api/businesses REGISTER BUSINESS", () => {
    let createdUser;

    beforeAll(async () => {
        createdUser = await createNewUser(app);
    });

    it("should return 400 status code if name is not provided", async () => {
        const response = await registerBusiness(app, createdUser.token);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("name cannot be empty");
    });

    it("should return 400 status code if PAN is not provided", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("PAN cannot be empty");
    });

    it("should return 400 status code if PAN is less than 9 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "98143789"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("PAN must be 9 characters long");
    });

    it("should return 400 status code if PAN is more 9 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "9814378931"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("PAN must be 9 characters long");
    });

    it("should return 400 status code if phone is not provided", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "981437893"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("phone cannot be empty");
    });

    it("should return 400 status code if phone is less than 9 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "981437893",
            "98102223"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "enter a valid 9 or 10-digit phone number"
        );
    });

    it("should return 400 status code if phone is more than 10 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "981437893",
            "98102223991"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "enter a valid 9 or 10-digit phone number"
        );
    });

    it("should return 400 status code if business certificate image is not provided", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "business registration certificate must be provided"
        );
    });

    it("should return 400 status code if province is not provided", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"province" must be one of [province no 1, madhesh, bagmati, gandaki, lumbini, karnali, sudurpaschim]'
        );
    });

    it("should return 400 status code if province is invalid", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "something else"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"province" must be one of [province no 1, madhesh, bagmati, gandaki, lumbini, karnali, sudurpaschim]'
        );
    });

    it("should return 400 status code if city is not provided - PROVINCE NOT BAGMATI", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "province no 1"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("city cannot be empty");
    });

    it("should return 400 status code if city is less than 5 characters - PROVINCE NOT BAGMATI", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "province no 1",
            "city"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "city must be atleast 5 characters long"
        );
    });

    it("should return 400 status code if city is more than 20 characters - PROVINCE NOT BAGMATI", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "province no 1",
            "city city city city city"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "city cannot be more than 20 characters long"
        );
    });

    it("should return 400 status code if city is not provided - PROVINCE BAGMATI", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"city" must be one of [bhaktapur, dhading, kathmandu, kavrepalanchowk, lalitpur, makwanpur, nuwakot, rasuwa, ramechhap, sindhuli, sindhupalchowk, chitwan, dolakha]'
        );
    });

    it("should return 400 status code if city is invalid - PROVINCE BAGMATI", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "something else"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"city" must be one of [bhaktapur, dhading, kathmandu, kavrepalanchowk, lalitpur, makwanpur, nuwakot, rasuwa, ramechhap, sindhuli, sindhupalchowk, chitwan, dolakha]'
        );
    });

    it("should return 400 status code if area is not provided", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("area cannot be empty");
    });

    it("should return 400 status code if area is less than 5 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "area"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "area must be atleast 5 characters long"
        );
    });

    it("should return 400 status code if area is more than 20 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "area area area area area"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "area cannot be more than 20 characters long"
        );
    });

    it("should return 400 status code if description is more than 100 characters long", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "description description description description description description description description description description description description description description description description description"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "description cannot be more than 100 characters long"
        );
    });

    it("should return 400 status code if tried to register business without registering as a seller", async () => {
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "near the old fine temple"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you need to register as a seller first"
        );
    });

    it("should return 400 status code if tried to register business by an individual seller", async () => {
        await supertest(app)
            .post("/api/stores/?type=IND")
            .set("Authorization", `Bearer ${createdUser.token}`);
        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "near the old fine temple"
        );

        await deleteCreatedUser(app, createdUser.id);
        createdUser = await createNewUser(app);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "you are already registered as an individual seller"
        );
    });

    it("should return 400 status code if tried to register business more than once", async () => {
        await supertest(app)
            .post("/api/stores/?type=BUS")
            .set("Authorization", `Bearer ${createdUser.token}`);
        await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "near the old fine temple"
        );

        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "near the old fine temple"
        );

        await deleteCreatedUser(app, createdUser.id);
        createdUser = await createNewUser(app);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "there is already a business registered with this account"
        );
    });

    it("should register a business if all above conditions are false", async () => {
        await supertest(app)
            .post("/api/stores/?type=BUS")
            .set("Authorization", `Bearer ${createdUser.token}`);

        const response = await registerBusiness(
            app,
            createdUser.token,
            "new business",
            "152347982",
            "9810222399",
            true,
            "bagmati",
            "kathmandu",
            "koteshwor",
            "near the old fine temple"
        );

        expect(response.statusCode).toBe(201);
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});

// describe("PATCH /api/businesses/registration/:businessId CONTROL BUSINESS REGISTRATION", () => {
//     let createdUser, adminToken, regBusiness;

//     beforeAll(async () => {
//         adminToken = await signInAsAdmin(app);
//         createdUser = await createNewUser(app);
//         await supertest(app)
//             .post("/api/stores/?type=BUS")
//             .set("Authorization", `Bearer ${createdUser.token}`);
//         regBusiness = (
//             await registerBusiness(
//                 app,
//                 createdUser.token,
//                 "new business",
//                 "152347981",
//                 "9810222399",
//                 true
//             )
//         ).body.business;
//     });

//     it("should return 401 status code if the requesting user is not admin", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             createdUser.token
//         );

//         expect(response.statusCode).toBe(401);
//         expect(response.body.error).toBe(
//             "you need to be an admin to perform this action"
//         );
//     });

//     it("should return 404 status code if the business does not exist", async () => {
//         const response = await controlBusinessRegistration(app, adminToken, -1);

//         expect(response.statusCode).toBe(404);
//         expect(response.body.error).toBe("business not found");
//     });

//     it("should return 400 status code if business address has not been set", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "the address of the business has not been set yet"
//         );
//     });

//     it("should return 400 status code if action is not provided", async () => {
//         await setAddress(app, createdUser.token, "business");

//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             '"action" must be one of [accept, reject]'
//         );
//     });

//     it("should return 400 status code if action is invalid", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "invalid-action"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             '"action" must be one of [accept, reject]'
//         );
//     });

//     it("should return 400 status code if action is 'reject' and cause is not provided", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "reject"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe("cause cannot be empty");
//     });

//     it("should return 400 status code if action is 'reject' and cause is less than 20 characters", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "reject",
//             "cause"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "cause must be atleast 20 characters long"
//         );
//     });

//     it("should return 400 status code if action is 'reject' and cause is more than 150 characters", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "reject",
//             "cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause cause"
//         );

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "cause cannot be more than 150 characters long"
//         );
//     });

//     it("should verify the business if action is 'accept' and above conditions are false", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "accept"
//         );

//         await deleteCreatedUser(app, createdUser.id);
//         createdUser = await createNewUser(app);
//         regBusiness = await createBusiness(app, createdUser.token, true);

//         expect(response.statusCode).toBe(200);
//     });

//     it("should return 400 status if the business is already verified", async () => {
//         await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "accept"
//         );

//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "accept"
//         );

//         await deleteCreatedUser(app, createdUser.id);
//         createdUser = await createNewUser(app);
//         regBusiness = await createBusiness(app, createdUser.token, true, false);

//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(
//             "the business has already been verified"
//         );
//     });

//     it("should reject the business if action is 'reject' and above conditions are false", async () => {
//         const response = await controlBusinessRegistration(
//             app,
//             adminToken,
//             regBusiness.id,
//             "reject",
//             "the records do not match"
//         );

//         expect(response.statusCode).toBe(200);
//     });

//     afterAll(async () => {
//         await deleteCreatedUser(app, createdUser.id);
//     });
// });

// describe("DELETE /api/businesses/:businessId DELETE BUSINESS", () => {
//     let createdUser, regBusiness;

//     beforeAll(async () => {
//         createdUser = await createNewUser(app);
//         regBusiness = await createBusiness(app, createdUser.token, true);
//     });

//     it("should return 400 status code if the business does not exist", async () => {
//         const response = await deleteBusiness(app, createdUser.token, -1);

//         expect(response.statusCode).toBe(404);
//         expect(response.body.error).toBe("business not found");
//     });

//     it("should return 401 status code if the business does not belong to the requesting user", async () => {
//         const anotherUser = await createNewUser(app);

//         const response = await deleteBusiness(
//             app,
//             anotherUser.token,
//             regBusiness.id
//         );

//         await deleteCreatedUser(app, anotherUser.id);

//         expect(response.statusCode).toBe(401);
//         expect(response.body.error).toBe(
//             "only the owner is allowed to delete a business"
//         );
//     });

//     it("should delete the business if provided valid data", async () => {
//         const response = await deleteBusiness(
//             app,
//             createdUser.token,
//             regBusiness.id
//         );

//         expect(response.statusCode).toBe(200);
//     });

//     afterAll(async () => {
//         await deleteCreatedUser(app, createdUser.id);
//     });
// });
