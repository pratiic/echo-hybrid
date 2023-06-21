import supertest from "supertest";

export const deleteTransaction = async (app, token, transactionId) => {
    const response = await supertest(app)
        .delete(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${token}`);

    return response;
};
