import express from 'express'
import { ClientController } from '@controllers'
import _middleware from '@middleware'
import {
  createClientSchema,
  idParamSchema,
  updateClientSchema,
} from '@validation/schemas'

export default express
  .Router()
  .get('/', _middleware.rateLimit({ limit: 3 }), ClientController.getAll)
  .post(
    '/',
    _middleware.validateAuthToken,
    _middleware.validateBody(createClientSchema),
    ClientController.create,
  )
  .put(
    '/:id',
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    _middleware.validateBody(updateClientSchema),
    ClientController.update,
  )
  .delete(
    '/:id',
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    ClientController.delete,
  )
  .get(
    '/:id/projects',
    _middleware.validateAuthToken,
    _middleware.validateParams(idParamSchema),
    ClientController.getProjectsById,
  )
