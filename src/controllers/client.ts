import { Response, Request } from "express";
import { ClientService } from "@services";
import { StatusCodes } from "http-status-codes";

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(200)
        .json({ success: true, data: await ClientService.getAll() });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const name = req.body.name.trim();
      const email = req.body.email.trim();
      const clientWithNameOrEmail = await ClientService.getByNameOrEmail(
        name,
        email
      );

      if (clientWithNameOrEmail) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: "The name or email already exist.",
        });
        return;
      }

      const token = (req as any).authToken;
      const client = await ClientService.create({
        email,
        name,
        createdBy: token.id,
      });

      res.status(201).json({
        success: true,
        client,
      });
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
      await ClientService.delete(parseInt(id, 10));

      res.status(204).send();
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const name = req.body.name.trim();
      const email = req.body.email.trim();

      const propsUsedByAnotherClient = (
        await ClientService.getByNameOrEmail(name, email)
      ).some((client) => client.id !== id);

      if (propsUsedByAnotherClient) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: "The name or email already exist.",
        });
        return;
      }
      await ClientService.update(id, req.body);

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async getProjectsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const projects = await ClientService.getProjectsById(parseInt(id, 10));

      res.status(200).json({ success: true, projects });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }
}

export default new ClientController();
