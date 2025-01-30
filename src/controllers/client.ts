import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { ClientService } from '@services'
import { APIResponse } from '@utils/classes'

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json(new APIResponse(StatusCodes.OK, await ClientService.getAll()))
    } catch (error: any) {
      logEndpointError(error?.message, req)

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new APIResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            error.message,
          ),
        )
    }
  }

  async create(req: Request, res: Response) {
    try {
      const name = req.body.name.trim()
      const email = req.body.email.trim()
      const clientWithNameOrEmail = await ClientService.getByNameOrEmail(
        name,
        email,
      )

      if (clientWithNameOrEmail) {
        res
          .status(StatusCodes.CONFLICT)
          .json(
            new APIResponse(
              StatusCodes.CONFLICT,
              null,
              'The name or email already exist.',
            ),
          )
        return
      }

      const token = (req as any).authToken
      const client = await ClientService.create({
        email,
        name,
        createdBy: token.id,
      })

      res
        .status(StatusCodes.CREATED)
        .json(new APIResponse(StatusCodes.CREATED, client))
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new APIResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            error.message,
          ),
        )
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const client = await ClientService.getById(parseInt(req.params.id, 10))
      if (!client)
        res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new APIResponse(StatusCodes.NOT_FOUND, null, 'Client not found.'),
          )
      await ClientService.delete(client.id)

      res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
      logEndpointError(error?.message, req, { params: req.params })

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new APIResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            error.message,
          ),
        )
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10)
      const name = req.body.name.trim()
      const email = req.body.email.trim()

      const propsUsedByAnotherClient = (
        await ClientService.getByNameOrEmail(name, email)
      ).some((client) => client.id !== id)

      if (propsUsedByAnotherClient) {
        res
          .status(StatusCodes.CONFLICT)
          .json(
            new APIResponse(
              StatusCodes.CONFLICT,
              null,
              'The name or email already exist.',
            ),
          )
        return
      }
      await ClientService.update(id, req.body)

      res.status(StatusCodes.OK).json(new APIResponse(StatusCodes.OK))
    } catch (error: any) {
      logEndpointError(error?.message, req, {
        body: req.body,
        params: req.params,
      })

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new APIResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            error.message,
          ),
        )
    }
  }

  async getProjectsById(req: Request, res: Response) {
    try {
      const projectsOfClient = await ClientService.getWithProjects(
        parseInt(req.params.id, 10),
      )
      res
        .status(StatusCodes.OK)
        .json(new APIResponse(StatusCodes.OK, projectsOfClient))
    } catch (error: any) {
      logEndpointError(error?.message, req, { params: req.params })

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new APIResponse(
            error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            null,
            error.message,
          ),
        )
    }
  }
}

export default new ClientController()
