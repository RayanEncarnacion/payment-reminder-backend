import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@src/logger/index'
import { ClientService, ProjectService } from '@src/services'
import { APIResponse } from '@src/utils/classes'
import { createProjectPayload } from '@src/validation/schemas'

class ProjectController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json(
          new APIResponse(StatusCodes.OK, await ProjectService.getWithDates()),
        )
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
      const { name, clientId, amount, dates } = req.body as createProjectPayload

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
        dates,
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
