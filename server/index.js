import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware.js";
import { router as authRouter } from "./routes/auth.routes.js";
import { router as accountRouter } from "./routes/account.routes.js";
import { router as userRouter } from "./routes/user.routes.js";
import { router as imageRouter } from "./routes/image.routes.js";
import { router as storeRouter } from "./routes/store.routes.js";
import { router as reviewRouter } from "./routes/review.routes.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/accounts", accountRouter);
app.use("/users", userRouter);
app.use("/images", imageRouter);
app.use("/stores", storeRouter);
app.use("/reviews", reviewRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`the server is listening on port ${port}`);
});
