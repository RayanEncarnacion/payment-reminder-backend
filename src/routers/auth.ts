import express from 'express'
import { AuthController } from '@src/controllers'
import Middleware from '@src/middleware'
import {
  userRegistrationSchema,
  userSignInSchema,
} from '@src/validation/schemas'

export default express
  .Router()
  .post(
    '/signup',
    Middleware.validateBody(userRegistrationSchema),
    AuthController.signUp,
  )
  .post(
    '/signin',
    Middleware.validateBody(userSignInSchema),
    AuthController.signIn,
  )
  .post('/refresh', AuthController.refreshToken)
  .post('/logout', AuthController.logout)
