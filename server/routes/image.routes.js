import express from "express";

import { getImage } from "../controllers/image.controllers.js";

export const router = express.Router();

router.get("/", getImage);
