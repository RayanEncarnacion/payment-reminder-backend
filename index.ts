import express, { Express, Response } from "express";
import bodyParser from "body-parser";
import authRouter from "routers/auth";

const app: Express = express();
const port = 3000;

app.use(bodyParser.json());

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
