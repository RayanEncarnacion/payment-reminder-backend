import { Response, Request } from "express";
import { createClientPayload } from "@validation/schemas";
import { ClientService } from "@services";

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientService.getAll();
      res.status(200).json({ success: true, data: clients });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async create(req: Request, res: Response) {
    const { email, name } = req.body as createClientPayload;

    const client = await ClientService.create({
      email,
      name,
      createdBy: 1, // TODO: Get id of user from token
    });

    res.status(201).json({
      success: true,
      client,
    });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await ClientService.delete(parseInt(id, 10));

    res.status(204).send();
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    await ClientService.update(parseInt(id, 10), req.body);

    res.status(200).json({ success: true });
  }

  async getProjectsById(req: Request, res: Response) {
    const { id } = req.params;
    const projects = await ClientService.getProjectsById(parseInt(id, 10));

    res.status(200).json({ success: true, projects });
  }
}

export default new ClientController();
