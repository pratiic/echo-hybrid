import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import { errorHandler } from "./middleware/error.middleware.js";
import { router as authRouter } from "./routes/auth.routes.js";
import { router as accountRouter } from "./routes/account.routes.js";
import { router as userRouter } from "./routes/user.routes.js";
import { router as imageRouter } from "./routes/image.routes.js";
import { router as storeRouter } from "./routes/store.routes.js";
import { router as reviewRouter } from "./routes/review.routes.js";
import { router as replyRouter } from "./routes/reply.routes.js";
import { router as businessRouter } from "./routes/business.routes.js";
import { router as addressRouter } from "./routes/address.routes.js";
import { router as productRouter } from "./routes/product.routes.js";
import { router as notificationRouter } from "./routes/notification.routes.js";
import { router as ratingRouter } from "./routes/rating.routes.js";
import { router as categoryRouter } from "./routes/category.routes.js";
import { router as productVariationRouter } from "./routes/product-variation.routes.js";
import { router as stockRouter } from "./routes/stock.routes.js";

dotenv.config();

export const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/users", userRouter);
app.use("/api/images", imageRouter);
app.use("/api/stores", storeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/replies", replyRouter);
app.use("/api/businesses", businessRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/products", productRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/product-variations", productVariationRouter);
app.use("/api/stocks", stockRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`the server is listening on port ${port}`);
});
