import express from 'express'

import { AuthController } from '@controllers'
import _middleware from '@middleware'
import { userRegistrationSchema, userSignInSchema } from '@validation/schemas'

export default express
  .Router()
  .post(
    '/signup',
    _middleware.validateBody(userRegistrationSchema),
    AuthController.signUp,
  )
  .post(
    '/signin',
    _middleware.validateBody(userSignInSchema),
    AuthController.signIn,
  )
  .post('/refresh', AuthController.refreshToken)
  .post('/logout', AuthController.logout)
