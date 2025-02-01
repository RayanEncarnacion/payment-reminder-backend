import express from 'express'
import { PaymentController } from '@controllers'

export default express.Router().get('/', PaymentController.getAll)
