import { Response, Request } from "express";
import { createClientPayload } from "@validation/schemas";
import { ClientService } from "@services";

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientService.getClients();
      res.status(200).json({ success: true, data: clients });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || "Something went wrong. Try again later.",
      });
    }
  }

  async createClient(req: Request, res: Response) {
    const { email, name } = req.body as createClientPayload;

    const client = await ClientService.createClient({
      email,
      name,
      createdBy: 1, // TODO: Get id of user from token
    });

    res.status(201).json({
      success: true,
      client,
    });
  }
}

export default new ClientController();
