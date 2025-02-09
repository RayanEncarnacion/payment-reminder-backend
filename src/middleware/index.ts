import { Request, Response, NextFunction } from 'express'
import { rateLimit } from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import { TokenExpiredError } from 'jsonwebtoken'
import { z, ZodError, ZodIssue } from 'zod'
import { JwtService } from '@src/services'
import { APIResponse } from '@src/utils/classes'

class Middleware {
  validateParams(schema: z.ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.params)
        next()
      } catch (error: any) {
        handleError(error, res)
      }
    }
  }

  validateBody(schema: z.ZodEffects<any, any> | z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body)
        next()
      } catch (error) {
        handleError(error, res)
      }
    }
  }

  validateAuthToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json(new APIResponse(StatusCodes.UNAUTHORIZED, null, 'Access Denied'))
      return
    }

    try {
      const decoded = JwtService.verifyAccessToken(token)
      // ! Attach token to the request
      ;(req as any).authToken = decoded
      next()
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json(
            new APIResponse(
              StatusCodes.UNAUTHORIZED,
              null,
              'Token has expired',
            ),
          )
        return
      }
      res
        .status(StatusCodes.FORBIDDEN)
        .json(new APIResponse(StatusCodes.FORBIDDEN, null, 'Invalid token'))
    }
  }

  rateLimit({
    windowMs = 600000, // ! 10 minutes window
    limit = 20,
    message = 'Too many requests, please try again later.',
  }) {
    return rateLimit({
      windowMs,
      limit,
      legacyHeaders: false,
      message: {
        message,
        success: false,
        statusCode: 429,
        data: null,
      },
    })
  }
}

export default new Middleware()

function handleError(error: any, res: Response) {
  if (error instanceof ZodError) {
    const errorsDictionary = error.errors.reduce(
      (acc: Record<string, any>, issue: ZodIssue) => {
        acc[issue.path[0]] = issue.message
        return acc
      },
      {},
    )

    res
      .status(StatusCodes.BAD_REQUEST)
      .json(
        new APIResponse(StatusCodes.BAD_REQUEST, { errors: errorsDictionary }),
      )
  } else {
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
