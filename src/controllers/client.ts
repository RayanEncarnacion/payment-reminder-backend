import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { ClientService } from '@services'

class ClientController {
  async getAll(req: Request, res: Response) {
    try {
      res
        .status(StatusCodes.OK)
        .json({ success: true, data: await ClientService.getAll() })
    } catch (error: any) {
      logEndpointError(error?.message, req)

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
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
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: 'The name or email already exist.',
        })
        return
      }

      const token = (req as any).authToken
      const client = await ClientService.create({
        email,
        name,
        createdBy: token.id,
      })

      res.status(StatusCodes.CREATED).json({
        success: true,
        client,
      })
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await ClientService.delete(parseInt(req.params.id, 10))

      res.status(StatusCodes.NO_CONTENT).send()
    } catch (error: any) {
      logEndpointError(error?.message, req, { params: req.params })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
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
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          error: 'The name or email already exist.',
        })
        return
      }
      await ClientService.update(id, req.body)

      res.status(StatusCodes.OK).json({ success: true })
    } catch (error: any) {
      logEndpointError(error?.message, req, {
        body: req.body,
        params: req.params,
      })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async getProjectsById(req: Request, res: Response) {
    try {
      res.status(StatusCodes.OK).json({
        success: true,
        projects: await ClientService.getProjectsById(
          parseInt(req.params.id, 10),
        ),
      })
    } catch (error: any) {
      logEndpointError(error?.message, req, { params: req.params })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }
}

export default new ClientController()
