import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { ClientService, ProjectService } from '@services'
import { APIResponse } from '@utils/classes'
import { createProjectPayload } from '@validation/schemas'

class ProjectController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json(new APIResponse(StatusCodes.OK, await ProjectService.getAll()))
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
      const { name, clientId, amount } = req.body as createProjectPayload

      // TODO: Move validation to "ProjectService.create" method
      if (!(await ClientService.existsById(clientId))) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new APIResponse(
              StatusCodes.NOT_FOUND,
              null,
              'The client does not exist',
            ),
          )
        return
      }

      const token = (req as any).authToken
      const project = await ProjectService.create({
        name,
        clientId,
        amount: amount.toFixed(2),
        createdBy: token.id,
      })

      res
        .status(StatusCodes.CREATED)
        .json(new APIResponse(StatusCodes.CREATED, project))
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
      await ProjectService.delete(parseInt(req.params.id, 10))

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

      // TODO: Move validation to "ProjectService.update" method (72 - 80)
      const projectByName = await ProjectService.getByName(req.body.name.trim())

      if (projectByName && projectByName.id !== id) {
        res
          .status(StatusCodes.CONFLICT)
          .json(
            new APIResponse(
              StatusCodes.CONFLICT,
              null,
              'The name already exist',
            ),
          )
        return
      }

      await ProjectService.update(id, req.body)

      res.status(StatusCodes.OK).json(new APIResponse(StatusCodes.OK))
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

export default new ProjectController()
