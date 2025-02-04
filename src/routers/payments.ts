import express from 'express'
import { PaymentController } from '@src/controllers'
import Middleware from '@src/middleware'
import { idParamSchema, updatePaymentSchema } from '@src/validation/schemas'

export default express
  .Router()
  .get('/', PaymentController.getAll)
  .put(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    Middleware.validateBody(updatePaymentSchema),
    PaymentController.update,
  )
