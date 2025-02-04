import express from 'express'
import { UserController } from '@src/controllers'
import Middleware from '@src/middleware'
import { idParamSchema } from '@src/validation/schemas'

export default express
  .Router()
  .get('/', UserController.getAll)
  .delete(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    UserController.delete,
  )
