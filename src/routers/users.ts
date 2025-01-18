import express from "express";
import _middleware from "@middleware";
import { UserController } from "@controllers";

export default express
  .Router()
  .get("/", UserController.getAll)
  .get("/protected", _middleware.validateAuthToken, UserController.getAll);
