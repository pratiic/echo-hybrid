import supertest from "supertest";

export const registerBusiness = async (
    app,
    token,
    name = "",
    PAN = "",
    phone = "",
    image,
    province = "",
    city = "",
    area = "",
    description = ""
) => {
    const request = supertest(app)
        .post("/api/businesses")
        .set("Authorization", `Bearer ${token}`)
        .field("name", name)
        .field("PAN", PAN)
        .field("phone", phone)
        .field("province", province)
        .field("city", city)
        .field("area", area)
        .field("description", description);

    if (image) {
        request.attach("image", "images/business.jpeg");
    }

    const response = await request;

    return response;
};

export const controlBusinessRegistration = async (
    app,
    token,
    businessId,
    action,
    cause
) => {
    const response = await supertest(app)
        .patch(`/api/businesses/registration/${businessId}/?action=${action}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            cause,
        });

    return response;
};

export const deleteBusiness = async (app, token, businessId) => {
    const response = await supertest(app)
        .delete(`/api/businesses/${businessId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
