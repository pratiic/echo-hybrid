import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { errorHandler } from "./middleware/error.middleware.js";
import { router as authRouter } from "./routes/auth.routes.js";
import { router as accountRouter } from "./routes/account.routes.js";
import { router as userRouter } from "./routes/user.routes.js";
import { router as imageRouter } from "./routes/image.routes.js";
import { storeRouter } from "./routes/store.routes.js";
import { reviewRouter } from "./routes/review.routes.js";
import { replyRouter } from "./routes/reply.routes.js";
import { router as businessRouter } from "./routes/business.routes.js";
import { router as addressRouter } from "./routes/address.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { ratingRouter } from "./routes/rating.routes.js";
import { router as categoryRouter } from "./routes/category.routes.js";
import { router as productVariationRouter } from "./routes/product-variation.routes.js";
import { router as stockRouter } from "./routes/stock.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { messageRouter } from "./routes/message.routes.js";
import { router as cartRouter } from "./routes/cart.routes.js";
import { router as receiptRouter } from "./routes/receipt.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { statRouter } from "./routes/stat.routes.js";
import { reportRouter } from "./routes/report.routes.js";
import { suspensionRouter } from "./routes/suspension.routes.js";

dotenv.config();

export const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/users", userRouter);
app.use("/api/images", imageRouter);
app.use("/api/stores", storeRouter(io));
app.use("/api/reviews", reviewRouter(io));
app.use("/api/replies", replyRouter(io));
app.use("/api/businesses", businessRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/products", productRouter(io));
app.use("/api/notifications", notificationRouter(io));
app.use("/api/ratings", ratingRouter(io));
app.use("/api/categories", categoryRouter);
app.use("/api/product-variations", productVariationRouter);
app.use("/api/stocks", stockRouter);
app.use("/api/orders", orderRouter(io));
app.use("/api/chats", chatRouter(io));
app.use("/api/messages", messageRouter(io));
app.use("/api/carts", cartRouter);
app.use("/api/stats", statRouter());
app.use("/api/reports", reportRouter());
app.use("/api/suspensions", suspensionRouter());
app.use("/receipts", receiptRouter);

// error handler middleware
app.use(errorHandler);

const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`the server is listening on port ${port}`);
});
