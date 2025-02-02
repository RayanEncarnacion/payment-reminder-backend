import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { PaymentService } from '@services'
import { APIResponse } from '@utils/classes'

class PaymentController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json(
          new APIResponse(StatusCodes.OK, await PaymentService.getWithDates()),
        )
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

  async update(req: Request, res: Response) {
    try {
      await PaymentService.markAsPayed(parseInt(req.params.id, 10))

      res.status(StatusCodes.NO_CONTENT).end()
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
}

export default new PaymentController()
