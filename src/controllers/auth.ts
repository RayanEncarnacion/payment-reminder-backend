import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@logger/index'
import { AuthService, UserService } from '@services'
import { APIResponse } from '@utils/classes'
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

      res
        .status(StatusCodes.CREATED)
        .json(new APIResponse(StatusCodes.CREATED, user))
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

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

  async logout(req: Request, res: Response) {
    try {
      res.status(StatusCodes.OK).json(
        new APIResponse(StatusCodes.OK, {
          token: AuthService.createExpiredToken(),
        }),
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

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body as userRegistrationPayload

      // TODO: Create method to validate (49 - 53)
      const user = await UserService.getUserByEmail(email)

      if (
        !user ||
        (await AuthService.checkUserPassword(password, user.passwordHash))
      ) {
        const token = AuthService.createAuthToken({
          id: user!.id,
          username: user!.username,
          email,
        })
        res
          .status(StatusCodes.CREATED)
          .json(
            new APIResponse(
              StatusCodes.CREATED,
              { token },
              'Logged in successfully',
            ),
          )
        return
      }

      res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new APIResponse(StatusCodes.BAD_REQUEST, null, 'Invalid credentials'),
        )
    } catch (error: any) {
      logEndpointError(error?.message, req, { body: req.body })

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

export default new AuthController()
