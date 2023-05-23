import express from "express";

import { generateReceipt } from "../controllers/receipt.controllers.js";

export const router = express.Router();

router.get("/", generateReceipt);
