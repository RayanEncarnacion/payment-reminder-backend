import express from "express";
import bodyParser from "body-parser";
import { AuthRouter, ClientRouter, ProjectRouter, UserRouter } from "@routers";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/client", ClientRouter);
app.use("/project", ProjectRouter);

app.listen(port, () => console.log(`Server listening on port ${port}`));
