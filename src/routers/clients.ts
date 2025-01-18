import express from "express";
import _middleware from "@middleware";
import { ClientController } from "@controllers";
import { createClientSchema } from "@validation/schemas";

export default express
  .Router()
  .get("/", ClientController.getAll)
  .post(
    "/",
    _middleware.validateAuthToken,
    _middleware.validateBody(createClientSchema),
    ClientController.createClient
  );
