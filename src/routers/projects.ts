import express from "express";
import _middleware from "@middleware";
import { ProjectController } from "@controllers";

export default express.Router().get("/", ProjectController.getAll);
