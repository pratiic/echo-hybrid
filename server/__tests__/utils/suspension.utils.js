import supertest from "supertest";

export const controlSuspension = async (
    app,
    token,
    targetType,
    targetId,
    action,
    cause
) => {
    const response = await supertest(app)
        .post(`/api/suspensions/${targetType}/${targetId}/?action=${action}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            cause,
        });

    return response;
};
