import supertest from "supertest";

export const replyToReview = async (app, token, reviewId, text) => {
    const response = await supertest(app)
        .post(`/api/replies/${reviewId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            text,
        });

    return response;
};

export const deleteReply = async (app, token, replyId) => {
    const response = await supertest(app)
        .delete(`/api/replies/${replyId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
