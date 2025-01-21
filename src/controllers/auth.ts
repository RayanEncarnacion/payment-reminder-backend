import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
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

      res.status(201).json({
        success: true,
        user,
      })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully!',
        token: AuthService.createExpiredToken(),
      })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body as userRegistrationPayload

      const user = await UserService.getUserByEmail(email)

      if (await AuthService.passwordsMatch(password, user.passwordHash)) {
        res.status(201).json({
          success: true,
          message: 'Logged in successfully!',
          token: AuthService.createAuthToken({
            id: user.id,
            username: user.username,
            email,
          }),
        })
        return
      }

      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error?.message || 'Something went wrong. Try again later.',
      })
    }
  }
}

export default new AuthController()
