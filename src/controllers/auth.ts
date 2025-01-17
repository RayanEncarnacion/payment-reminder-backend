import { Response, Request } from "express";
import { userRegistrationPayload } from "@validation/schemas";
import _userService from "@services/user";
import _authService from "@services/auth";

class AuthController {
  async signUp(req: Request, res: Response) {
    const { email, username, password } = req.body as userRegistrationPayload;

    const user = await _userService.createUser({
      email,
      username,
      passwordHash: await _authService.hashPassword(password),
      createdBy: 1,
    });

    res.status(200).json({
      success: true,
      user,
    });
  }

  async signIn(req: Request, res: Response) {
    const { email, password } = req.body as userRegistrationPayload;

    const user = await _userService.getUserByEmail(email);

    if (await _authService.passwordsMatch(password, user.passwordHash)) {
      res.status(200).json({
        success: true,
        message: "Logged in successfully!",
        token: _authService.createAuthToken({
          id: user.id,
          username: user.username,
          email,
        }),
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
}

export default new AuthController();
