import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { AuthService, UserService } from '@services'
import { userRegistrationPayload } from '@validation/schemas'

class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body as userRegistrationPayload

      const user = await UserService.create({
        email,
        username,
        passwordHash: await AuthService.hashPassword(password),
      })

      res.status(StatusCodes.CREATED).json({
        success: true,
        user,
      })
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully!',
        token: AuthService.createExpiredToken(),
      })
    } catch (error: any) {
      logEndpointError(error?.message, req)

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body as userRegistrationPayload

      // TODO: Create method to validate (49 - 53)
      const user = await UserService.getUserByEmail(email)

      if (
        !user ||
        (await AuthService.checkUserPassword(password, user.passwordHash))
      ) {
        res.status(StatusCodes.CREATED).json({
          success: true,
          message: 'Logged in successfully!',
          token: AuthService.createAuthToken({
            id: user!.id,
            username: user!.username,
            email,
          }),
        })
        return
      }

      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid credentials',
      })
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }
}

export default new AuthController()
