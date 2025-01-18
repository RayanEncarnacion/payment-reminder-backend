import express from "express";
import bodyParser from "body-parser";
import { AuthRouter, ClientRouter, UserRouter } from "@routers";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/client", ClientRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));
