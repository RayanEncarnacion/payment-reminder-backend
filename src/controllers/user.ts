import { Response, Request } from "express";
import { UserService } from "@services";
import { StatusCodes } from "http-status-codes";

class UserController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(200)
        .json({ success: true, data: await UserService.getUsers() });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserService.delete(parseInt(id, 10));

      res.status(204).send();
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }
}

export default new UserController();
