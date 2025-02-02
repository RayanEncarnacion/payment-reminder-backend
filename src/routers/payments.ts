import express from 'express'
import { PaymentController } from '@controllers'
import Middleware from '@middleware'
import { idParamSchema, updatePaymentSchema } from '@validation/schemas'

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
