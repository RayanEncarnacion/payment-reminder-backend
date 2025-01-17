import express from "express";

import _middleware from "@middleware";
import { userRegistrationSchema, userSignInSchema } from "@validation/schemas";
import _authController from "@controllers/auth";

export default express
  .Router()
  .post(
    "/signup",
    _middleware.validateBody(userRegistrationSchema),
    _authController.signUp
  )
  .post(
    "/signin",
    _middleware.validateBody(userSignInSchema),
    _authController.signIn
  )
  .post("/logout", _authController.logout);
