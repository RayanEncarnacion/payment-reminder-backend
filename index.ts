import express from "express";
import bodyParser from "body-parser";

import authRouter from "@routers/auth";
import userRouter from "@routers/users";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));
