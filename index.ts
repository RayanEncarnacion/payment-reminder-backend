import express, { Express, Response } from "express";
const app: Express = express();
const port = 3000;

app.get("/", (_, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
