import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UserService } from '@services'

class UserController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json({ success: true, data: await UserService.getUsers() })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      await UserService.delete(parseInt(id, 10))

      res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }
}

export default new UserController()
