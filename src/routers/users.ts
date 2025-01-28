import express from 'express'
import { UserController } from '@controllers'
import Middleware from '@middleware'
import { idParamSchema } from '@validation/schemas'

export default express
  .Router()
  .get('/', UserController.getAll)
  .delete(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    UserController.delete,
  )
