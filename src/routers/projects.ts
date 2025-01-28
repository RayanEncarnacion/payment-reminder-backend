import express from 'express'
import { ProjectController } from '@controllers'
import Middleware from '@middleware'
import {
  createProjectSchema,
  idParamSchema,
  updateProjectSchema,
} from '@validation/schemas'

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
