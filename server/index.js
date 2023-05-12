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

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/users", userRouter);
app.use("/api/images", imageRouter);
app.use("/api/stores", storeRouter);
app.use("/api/reviews", reviewRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`the server is listening on port ${port}`);
});
