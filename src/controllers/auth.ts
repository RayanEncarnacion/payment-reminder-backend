import { Response, Request } from "express";
import { userRegistrationPayload } from "@validation/schemas";
import { AuthService, UserService } from "@services";

class AuthController {
  async signUp(req: Request, res: Response) {
    const { email, username, password } = req.body as userRegistrationPayload;

    const user = await UserService.createUser({
      email,
      username,
      passwordHash: await AuthService.hashPassword(password),
    });

    res.status(201).json({
      success: true,
      user,
    });
  }

  async logout(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
      token: AuthService.createExpiredToken(),
    });
  }

  async signIn(req: Request, res: Response) {
    const { email, password } = req.body as userRegistrationPayload;

    const user = await UserService.getUserByEmail(email);

    if (await AuthService.passwordsMatch(password, user.passwordHash)) {
      res.status(201).json({
        success: true,
        message: "Logged in successfully!",
        token: AuthService.createAuthToken({
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
