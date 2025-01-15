import { Response, Request } from "express";
import { userRegistrationPayload } from "@validation/schemas";

export function signIn(req: Request, res: Response) {
  const { email, password, confirmPassword } =
    req.body as userRegistrationPayload;

  res.status(201).json({
    message: "User signed up successfully",
    user: { id: Date.now(), email },
  });
}
