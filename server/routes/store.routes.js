import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
  deleteStore,
  getStoreDetails,
  registerStore,
} from "../controllers/store.controllers.js";

export const router = express.Router();

router.post("/", auth, registerStore);

router.get("/:storeId", auth, getStoreDetails);

router.delete("/", auth, deleteStore);
