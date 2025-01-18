import express from "express";

import _middleware from "@middleware";
import { userRegistrationSchema, userSignInSchema } from "@validation/schemas";
import { AuthController } from "@controllers";

export default express
  .Router()
  .post(
    "/signup",
    _middleware.validateBody(userRegistrationSchema),
    AuthController.signUp
  )
  .post(
    "/signin",
    _middleware.validateBody(userSignInSchema),
    AuthController.signIn
  )
  .post("/logout", AuthController.logout);
