import supertest from "supertest";

export const postReview = async (
    app,
    token,
    targetType,
    targetId,
    text,
    image
) => {
    const request = supertest(app)
        .post(`/api/reviews/${targetType}/${targetId}`)
        .set("Authorization", `Bearer ${token}`)
        .field("text", text || "");

    if (image) {
        request.attach("image", `images/${image}`);
    }

    const response = await request;

    return response;
};

export const deleteReview = async (app, token, reviewId) => {
    const response = await supertest(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
