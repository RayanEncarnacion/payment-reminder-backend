import cookieParser from 'cookie-parser'
import express, { json } from 'express'
import { dailyCheck } from '@jobs/dailyCheck'
import { useMorgan } from '@logger/index'
import {
  AuthRouter,
  ClientRouter,
  PaymentRouter,
  ProjectRouter,
  UserRouter,
} from '@routers'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.use(cookieParser())
app.use(json())
app.use(useMorgan())

app.use('/auth', AuthRouter)
app.use('/client', ClientRouter)
app.use('/project', ProjectRouter)
app.use('/user', UserRouter)
app.use('/payment', PaymentRouter)

dailyCheck()

app.listen(port, () => console.log(`Server listening on port ${port}`))
