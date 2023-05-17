import supertest from "supertest";

import { app } from "../../index.js";

describe("GET /api/addresses SET ADDRESS", () => {
    let token;

    beforeAll(async () => {
        // sign in and get a JWT token to use in the tests
        const response = await supertest(app).post("/api/auth/signin").send({
            email: "johndoe@gmail.com",
            password: "prat123!",
        });

        token = response.body.user.token;
    });

    it("should set user address when provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/addresses/user`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                province: "province no 1",
                city: "jhapa",
                area: "birtamode",
                description: "near hanuman complex",
            });

        expect(response.statusCode).toBe(200);
    });

    it("should set business address when provided valid data", async () => {
        const response = await supertest(app)
            .post(`/api/addresses/business`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                province: "bagmati",
                district: "bhaktapur",
                city: "bhaktapur",
                area: "kaushaltar",
                description: "near hanuman complex",
            });

        expect(response.statusCode).toBe(200);
    });
});
