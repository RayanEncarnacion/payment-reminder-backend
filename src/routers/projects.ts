import express from "express";
import _middleware from "@middleware";
import { ProjectController } from "@controllers";
import { createProjectSchema, idParamSchema } from "@validation/schemas";

export default express
  .Router()
  .get("/", ProjectController.getAll)
  .post(
    "/",
    _middleware.validateAuthToken,
    _middleware.validateBody(createProjectSchema),
    ProjectController.create
  )
  .delete(
    "/:id",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    ProjectController.delete
  );
