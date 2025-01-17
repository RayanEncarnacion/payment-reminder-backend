import express from "express";
import _userController from "@controllers/user";

export default express.Router().get("/", _userController.getAll);
