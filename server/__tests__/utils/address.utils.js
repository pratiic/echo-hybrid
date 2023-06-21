import supertest from "supertest";

export const setAddress = async (
    app,
    token,
    type = "user",
    withinDelivery = true
) => {
    const response = await supertest(app)
        .post(`/api/addresses/${type}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            province: withinDelivery ? "bagmati" : "province no 1",
            city: withinDelivery ? "kathmandu" : "jhapa",
            area: withinDelivery ? "koteshwor" : "birtamode",
        });

    return response;
};
