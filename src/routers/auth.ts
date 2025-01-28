import express from 'express'
import { AuthController } from '@controllers'
import Middleware from '@middleware'
import { userRegistrationSchema, userSignInSchema } from '@validation/schemas'

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
