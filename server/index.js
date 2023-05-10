import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware.js";
import { router as authRouter } from "./routes/auth.routes.js";
import { router as accountRouter } from "./routes/account.routes.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/accounts", accountRouter);

// error handler middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`the server is listening on port ${port}`);
});
