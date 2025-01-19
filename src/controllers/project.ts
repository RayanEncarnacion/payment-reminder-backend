import { Response, Request } from "express";
import { ProjectService } from "@services";

class ProjectController {
  async getAll(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAll();
      res.status(200).json({ success: true, data: projects });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }
}

export default new ProjectController();
