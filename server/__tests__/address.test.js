import supertest from "supertest";

import { app } from "../index.js";
import { createNewUser, deleteCreatedUser, signInAsAdmin } from "./utils.js";

describe("GET /api/addresses SET ADDRESS", () => {
    let createdUser;
    const validAddress = {
        province: "province no 1",
        city: "jhapa",
        area: "birtamode",
        description: "near hanuman complex",
    };

    beforeAll(async () => {
        createdUser = await createNewUser(app);

        await supertest(app)
            .post("/api/stores/?type=BUS")
            .set("Authorization", `Bearer ${createdUser.token}`);
        await supertest(app)
            .post("/api/businesses")
            .set("Authorization", `Bearer ${createdUser.token}`)
            .field("name", "new business")
            .field("PAN", "154329879")
            .field("phone", "9810222399")
            .attach("image", "images/business.jpeg");
    });

    it("should set address when provided valid data - USER", async () => {
        const response = await setAddress(app, createdUser.token, validAddress);

        expect(response.statusCode).toBe(200);
    });

    it("should set address when provided valid data - BUSINESS", async () => {
        const response = await setAddress(
            app,
            createdUser.token,
            validAddress,
            "business"
        );

        expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code when targetType is invalid", async () => {
        const response = await setAddress(
            app,
            createdUser.token,
            validAddress,
            "invalid-target"
        );

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("invalid target type");
    });

    it("should return 400 status code when province is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"province" must be one of [province no 1, madhesh, bagmati, gandaki, lumbini, karnali, sudurpaschim]'
        );
    });

    it("should return 400 status code when province is invalid", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "invalid-province",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"province" must be one of [province no 1, madhesh, bagmati, gandaki, lumbini, karnali, sudurpaschim]'
        );
    });

    it("should return 400 status code when city is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            city: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("city cannot be empty");
    });

    it("should return 400 status code when province is 'bagmati' and city is not one of the districts of bagmati province", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "bagmati",
            city: "birtamode",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            '"city" must be one of [bhaktapur, dhading, kathmandu, kavrepalanchowk, lalitpur, makwanpur, nuwakot, rasuwa, ramechhap, sindhuli, sindhupalchowk, chitwan, dolakha]'
        );
    });

    it("should return 400 status code when province is not 'bagmati' and city is less than 5 characters", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "province no 1",
            city: "test",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "city must be atleast 5 characters long"
        );
    });

    it("should return 400 status code when province is not 'bagmati' and city is more than 20 characters", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            province: "province no 1",
            city: "test address test address",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "city cannot be more than 20 characters long"
        );
    });

    it("should return 400 status code when area is not provided", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("area cannot be empty");
    });

    it("should return 400 status code when area is less than 5 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "test",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "area must be atleast 5 characters long"
        );
    });

    it("should return 400 status code when area is more than 20 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            area: "test address test address",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "area cannot be more than 20 characters long"
        );
    });

    it("should return 400 status code when description is more than 100 characters long", async () => {
        const response = await setAddress(app, createdUser.token, {
            ...validAddress,
            description:
                "test description test description test description test description test description test description test description test description test description test description test test description",
        });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "description cannot be more than 100 characters long"
        );
    });

    afterAll(async () => {
        await deleteCreatedUser(app, createdUser.id);
    });
});

async function setAddress(app, token, data, type = "user") {
    const response = await supertest(app)
        .post(`/api/addresses/${type}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data);

    return response;
}
