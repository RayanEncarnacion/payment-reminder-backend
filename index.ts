import express from "express";
import cron from "node-cron";
import { AuthRouter, ClientRouter, ProjectRouter, UserRouter } from "@routers";
import { handleDailyCheck } from "@jobs/dailyCheck";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/client", ClientRouter);
app.use("/project", ProjectRouter);

cron.schedule("0 0 * * *", handleDailyCheck);

app.listen(port, () => console.log(`Server listening on port ${port}`));
