import express from "express";

import _authController from "@controllers/auth";
import { validateData } from "@middleware/validation";

import { userRegistrationSchema, userSignInSchema } from "@validation/schemas";

export default express
  .Router()
  .post("/signup", validateData(userRegistrationSchema), _authController.signUp)
  .post("/signin", validateData(userSignInSchema), _authController.signIn);
