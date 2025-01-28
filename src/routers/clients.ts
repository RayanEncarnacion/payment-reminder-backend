import express from 'express'
import { ClientController } from '@controllers'
import Middleware from '@middleware'
import {
  createClientSchema,
  idParamSchema,
  updateClientSchema,
} from '@validation/schemas'

export default express
  .Router()
  .get('/', Middleware.rateLimit({ limit: 3 }), ClientController.getAll)
  .post(
    '/',
    Middleware.validateAuthToken,
    Middleware.validateBody(createClientSchema),
    ClientController.create,
  )
  .put(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    Middleware.validateBody(updateClientSchema),
    ClientController.update,
  )
  .delete(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    ClientController.delete,
  )
  .get(
    '/:id/projects',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    ClientController.getProjectsById,
  )
