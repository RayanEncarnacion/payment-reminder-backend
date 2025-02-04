import express from 'express'
import { ProjectController } from '@src/controllers'
import Middleware from '@src/middleware'
import {
  createProjectSchema,
  idParamSchema,
  updateProjectSchema,
} from '@src/validation/schemas'

export default express
  .Router()
  .get('/', ProjectController.getAll)
  .post(
    '/',
    Middleware.validateAuthToken,
    Middleware.validateBody(createProjectSchema),
    ProjectController.create,
  )
  .put(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    Middleware.validateBody(updateProjectSchema),
    ProjectController.update,
  )
  .delete(
    '/:id',
    Middleware.validateAuthToken,
    Middleware.validateParams(idParamSchema),
    ProjectController.delete,
  )
