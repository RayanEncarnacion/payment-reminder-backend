import express from "express";

import { signIn } from "@controllers/auth";
import { validateData } from "@middleware/validation";
import { userRegistrationSchema } from "@validation/schemas";

export default express
  .Router()
  .post("/signup", validateData(userRegistrationSchema), signIn);
