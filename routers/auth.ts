import express, { Request, Response } from "express";
import { validateData } from "middleware/validation";
import {
  userRegistrationPayload,
  userRegistrationSchema,
} from "validation/schemas";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateData(userRegistrationSchema),
  (req: Request, res: Response) => {
    const { email, password, confirmPassword } =
      req.body as userRegistrationPayload;

    res.status(201).json({
      message: "User signed up successfully",
      user: { id: Date.now(), email },
    });
  }
);

export default authRouter;
