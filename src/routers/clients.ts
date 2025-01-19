import express from "express";
import _middleware from "@middleware";
import { ClientController } from "@controllers";
import {
  createClientSchema,
  idParamSchema,
  updateClientSchema,
} from "@validation/schemas";

export default express
  .Router()
  .get("/", ClientController.getAll)
  .post(
    "/",
    _middleware.validateAuthToken,
    _middleware.validateBody(createClientSchema),
    ClientController.createClient
  )
  .put(
    "/:id",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    _middleware.validateBody(updateClientSchema),
    ClientController.updateClient
  )
  .delete(
    "/:id",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
  )
  .get(
    "/:id/projects",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    ClientController.getProjectsById
  );
