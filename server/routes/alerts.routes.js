import express from "express";

export const alertsRouter = () => {
    const router = express.Router();

    router.post("/", createAlertsInstances);
};
