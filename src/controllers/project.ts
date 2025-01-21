import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ClientService, ProjectService } from '@services'
import { createProjectPayload } from '@validation/schemas'

class ProjectController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json({ success: true, data: await ProjectService.getAll() })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, clientId, amount } = req.body as createProjectPayload

      if (!(await ClientService.existsById(clientId))) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: 'The client does not exist.',
        })
        return
      }

      const token = (req as any).authToken
      const project = await ProjectService.create({
        name,
        clientId,
        amount: amount.toFixed(2),
        createdBy: token.id,
      })

      res.status(StatusCodes.CREATED).json({
        success: true,
        project,
      })
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
      await ProjectService.delete(parseInt(id, 10))

      res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10)
      const projectByName = await ProjectService.getByName(req.body.name.trim())

      if (projectByName && projectByName.id !== id) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: 'The name already exist.',
        })
        return
      }
      await ProjectService.update(id, req.body)

      res.status(StatusCodes.OK).json({ success: true })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }
}

export default new ProjectController()
