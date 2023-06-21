import supertest from "supertest";
import { getVerificationCode } from "../lib/verification.lib.js";
import { setAddress } from "./utils/address.utils.js";

const genericUserData = {
    firstName: "john",
    lastName: "doe",
    password: "prat123!",
};

export const createNewUser = async (
    app,
    createAddress = true,
    withinDelivery,
    verifyU = true
) => {
    const response = await supertest(app)
        .post("/api/auth/signup")
        .send({
            ...genericUserData,
            email: `johndoe${getVerificationCode()}@gmail.com`,
        });

    if (verifyU) {
        await verifyUser(app, response.body.user?.id);
    }

    if (createAddress) {
        const addressResponse = await setAddress(
            app,
            response.body.user.token,
            "user",
            withinDelivery
        );

        response.body.user.address = addressResponse.body.address;
    }

    return response.body.user;
};

export const verifyUser = async (app, userId) => {
    const adminToken = await signInAsAdmin(app);
    await supertest(app)
        .patch(`/api/users/${userId}/verification`)
        .set("Authorization", `Bearer ${adminToken}`);
};

export const signInAsAdmin = async (app) => {
    const response = await signInAsStaff(app);

    return response.body.user.token;
};

export const signInAsDeliveryPersonnel = async (app) => {
    const response = await signInAsStaff(app, "delivery personnel");

    return response.body.user.token;
};

export const signInAsStaff = async (app, role = "admin") => {
    const signInData = {
        email:
            role === "admin"
                ? process.env.ADMIN_EMAIL
                : process.env.DELIVERY_EMAIL,
        password:
            role === "admin"
                ? process.env.ADMIN_PASSWORD
                : process.env.DELIVERY_PASSWORD,
    };

    const response = await supertest(app)
        .post("/api/auth/signin")
        .send(signInData);

    return response;
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

export const createBusiness = async (
    app,
    token,
    withinDelivery,
    verifyBusiness = true
) => {
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

    const addressResponse = await setAddress(
        app,
        token,
        "business",
        withinDelivery
    );
    response.body.business.address = addressResponse.body.address;

    if (verifyBusiness) {
        await supertest(app)
            .patch(
                `/api/businesses/registration/${response.body.business.id}/?action=accept`
            )
            .set("Authorization", `Bearer ${adminToken}`);
    }

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

export const createDeliveryPersonnel = async (
    app,
    token,
    personnelData = {
        ...genericUserData,
        email: `johndoe${getVerificationCode()}@gmail.com`,
        phone: "9810222399",
    }
) => {
    const response = await supertest(app)
        .post("/api/delivery/personnel")
        .set("Authorization", `Bearer ${token}`)
        .send(personnelData);

    if (response.body.user?.id) {
        await verifyUser(app, response.body.user?.id);
    }

    return response;
};

export const deleteDeliveryPersonnel = async (app, token, personnelId) => {
    const response = await supertest(app)
        .delete(`/api/delivery/personnel/${personnelId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
