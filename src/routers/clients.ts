import express from "express";
import _middleware from "@middleware";
import { ClientController } from "@controllers";
import { createClientSchema, idParamSchema } from "@validation/schemas";

export default express
  .Router()
  .get("/", ClientController.getAll)
  .post(
    "/",
    _middleware.validateAuthToken,
    _middleware.validateBody(createClientSchema),
    ClientController.createClient
  )
  .delete(
    "/:id",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    ClientController.deleteClient
  );
