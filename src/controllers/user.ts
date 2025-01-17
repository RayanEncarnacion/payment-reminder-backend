import { Response, Request } from "express";
import _userService from "@services/user";

class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await _userService.getUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }
}

export default new UserController();
