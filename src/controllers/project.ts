import { Response, Request } from "express";
import { ClientService, ProjectService } from "@services";
import { createProjectPayload } from "@validation/schemas";
import { StatusCodes } from "http-status-codes";

class ProjectController {
  async getAll(req: Request, res: Response) {
    try {
      const projects = await ProjectService.getAll();

      res.status(200).json({ success: true, data: projects });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, clientId } = req.body as createProjectPayload;
      const clientDoesNotExists = !(await ClientService.existsById(clientId));

      if (clientDoesNotExists) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "The client does not exist.",
        });
        return;
      }

      const token = (req as any).authToken;

      // ! In theory, this should not happen, because of the validation middleware, but i'll leave it here
      if (!token) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "The auth token was not provided",
        });
        return;
      }

      const project = await ProjectService.create({
        name,
        clientId,
        createdBy: token.id,
      });

      res.status(StatusCodes.CREATED).json({
        success: true,
        project,
      });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await ProjectService.delete(parseInt(id, 10));

    res.status(204).send();
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    await ProjectService.update(parseInt(id, 10), req.body);

    res.status(200).json({ success: true });
  }
}

export default new ProjectController();
