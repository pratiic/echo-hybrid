import supertest from "supertest";

export const provideRating = async (
    app,
    token,
    targetType,
    targetId,
    stars
) => {
    const response = await supertest(app)
        .post(`/api/ratings/${targetType}/${targetId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            stars,
        });

    return response;
};

export const deleteRating = async (app, token, ratingId) => {
    const response = await supertest(app)
        .delete(`/api/ratings/${ratingId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
