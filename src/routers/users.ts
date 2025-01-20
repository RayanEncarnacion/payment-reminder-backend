import express from "express";
import _middleware from "@middleware";
import { UserController } from "@controllers";
import { idParamSchema } from "@validation/schemas";

export default express
  .Router()
  .get("/", UserController.getAll)
  .delete(
    "/:id",
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    UserController.delete
  );
