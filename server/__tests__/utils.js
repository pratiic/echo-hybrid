import supertest from "supertest";
import { getVerificationCode } from "../lib/verification.lib.js";

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

export const signInAsAdmin = async (app) => {
    const response = await supertest(app).post("/api/auth/signin").send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    });

    return response.body.user.token;
};

export const deleteCreatedUser = async (app, userId, adminToken) => {
    if (!adminToken) {
        adminToken = await signInAsAdmin(app);
    }

    await supertest(app)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
};

export const deleteCreatedStore = async (app, token) => {
    const response = await supertest(app)
        .delete(`/api/stores`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};

export const createBusiness = async (app, token) => {
    await supertest(app)
        .post("/api/stores/?type=BUS")
        .set("Authorization", `Bearer ${token}`);

    const response = await supertest(app)
        .post("/api/businesses")
        .set("Authorization", `Bearer ${token}`)
        .field("name", "new business")
        .field("PAN", "152347865")
        .field("phone", "9810222399")
        .attach("image", "images/profile.jpeg");

    const adminToken = await signInAsAdmin(app);

    await supertest(app)
        .patch(
            `/api/businesses/registration/${response.body.business.id}/?action=accept`
        )
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ cause: "this is not necessary" });

    return response.body.business;
};

export const createProduct = async (
    app,
    token,
    createStore = true,
    imagesCount = 2,
    stockType = "varied"
) => {
    if (imagesCount > 2) {
        imagesCount = 2;
    }

    if (createStore) {
        await supertest(app)
            .post("/api/stores/?type=IND")
            .set("Authorization", `Bearer ${token}`);
    }

    const request = supertest(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .field("name", "new product")
        .field(
            "description",
            "this has to be a minimum of 50 characters and i think it is now"
        )
        .field("price", 1500)
        .field("deliveryCharge", 100)
        .field("category", "electronics")
        .field("subCategory", "phone")
        .field("stockType", stockType);

    for (let i = 1; i <= imagesCount; i++) {
        request.attach("images", `images/products/${i}.jpeg`);
    }

    const response = await request;

    return response;
};

export const setProductVariations = async (
    app,
    token,
    productId,
    createB = true,
    variations = [
        {
            label: "one",
            options: ["one", "two"],
        },
    ]
) => {
    if (createB) {
        await createBusiness(app, token);
    }

    if (!productId) {
        const createdProduct = (
            await createProduct(app, token, false, 2, "varied")
        ).body.product;

        productId = createdProduct.id;
    }

    const response = await supertest(app)
        .post(`/api/product-variations/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            variations,
        });

    return response;
};

export const setStock = async (app, token, productId, data, setVariations) => {
    if (setVariations) {
        await setProductVariations(app, token, productId, false, [
            {
                label: "color",
                options: ["red", "blue", "yellow"],
            },
        ]);
    }

    const response = await supertest(app)
        .post(`/api/stocks/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(data);

    return response;
};
