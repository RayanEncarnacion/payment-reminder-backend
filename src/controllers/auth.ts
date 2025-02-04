import { Response, Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logEndpointError } from '@src/logger/index'
import { JwtService, UserService } from '@src/services'
import { APIResponse } from '@src/utils/classes'
import { hashPassword } from '@src/utils/encryption'
import { userRegistrationPayload } from '@src/validation/schemas'

class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body as userRegistrationPayload

      const user = await UserService.create({
        email,
        username,
        passwordHash: await hashPassword(password),
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
          token: JwtService.createExpiredToken(),
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
      const user = await UserService.getByCredentials(
        req.body.email.trim(),
        req.body.password.trim(),
      )

      if (!user) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json(
            new APIResponse(StatusCodes.NOT_FOUND, null, 'Invalid credentials'),
          )
        return
      }

      const token = JwtService.createAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
      })

      res
        .cookie('refreshToken', await JwtService.createRefreshToken(user.id), {
          httpOnly: true,
          sameSite: 'strict',
        })
        .status(StatusCodes.OK)
        .header('Authorization', token)
        .json(
          new APIResponse(StatusCodes.OK, { token }, 'Logged in successfully'),
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

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies
      const authToken = req.headers.authorization?.split(' ')[1]

      if (!refreshToken || !authToken) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json(
            new APIResponse(
              StatusCodes.UNAUTHORIZED,
              null,
              'Refresh and Auth tokens must be provided',
            ),
          )
        return
      }

      const decodedAuthToken = JwtService.decodeAccessToken(authToken)
      const decodedRefreshToken = await JwtService.getRefreshToken(refreshToken)

      if (decodedRefreshToken.used) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json(
            new APIResponse(
              StatusCodes.UNAUTHORIZED,
              null,
              'Invalid refresh token',
            ),
          )
        return
      }

      const payload = {
        id: decodedAuthToken!.id,
        username: decodedAuthToken!.username,
        email: decodedAuthToken.email,
      }
      const newAccessToken = JwtService.createAccessToken(payload)
      const newRefreshToken = await JwtService.createRefreshToken(payload.id)

      await JwtService.markRefreshTokenAsUsed(decodedRefreshToken.id)

      res
        .cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          sameSite: 'strict',
        })
        .status(StatusCodes.CREATED)
        .header('Authorization', newAccessToken)
        .json(
          new APIResponse(
            StatusCodes.CREATED,
            { token: newAccessToken },
            'Token refreshed successfully',
          ),
        )
    } catch (error: any) {
      logEndpointError(error?.message, req, {
        cookies: req.cookies,
        headers: req.headers,
      })

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
