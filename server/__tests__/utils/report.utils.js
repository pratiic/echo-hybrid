import supertest from "supertest";

export const reportTarget = async (app, token, targetType, targetId, cause) => {
    const response = await supertest(app)
        .post(`/api/reports/${targetType}/${targetId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            cause,
        });

    return response;
};

export const deleteReport = async (app, token, reportId) => {
    const response = await supertest(app)
        .delete(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
