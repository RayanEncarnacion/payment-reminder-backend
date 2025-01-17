import express from "express";
import _userController from "@controllers/user";
import _middleware from "@middleware";

export default express
  .Router()
  .get("/", _userController.getAll)
  .get("/protected", _middleware.validateAuthToken, _userController.getAll);
