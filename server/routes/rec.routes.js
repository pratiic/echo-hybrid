import express from "express";

import { exportRecDataset } from "../controllers/rec.controllers.js";

export const recRouter = () => {
    const router = express.Router();

    router.get("/dataset", exportRecDataset);

    return router;
};
