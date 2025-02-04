import cookieParser from 'cookie-parser'
import express, { json } from 'express'
import { dailyCheck } from '@src/jobs/dailyCheck'
import { useMorgan } from '@src/logger/index'
import {
  AuthRouter,
  ClientRouter,
  PaymentRouter,
  ProjectRouter,
  UserRouter,
} from '@src/routers'
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
app.get('/health', (_, res) => {
  res.status(200).send()
})

dailyCheck()

app.listen(port, () => console.log(`Server listening on port ${port}`))
