import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { UserService } from '@services'
import { APIResponse } from '@utils/classes'

class UserController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json(new APIResponse(StatusCodes.OK, await UserService.getAll()))
    } catch (error: any) {
      logEndpointError(error?.message, req)

      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
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
      const { id } = req.params
      await UserService.delete(parseInt(id, 10))

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
}

export default new UserController()
