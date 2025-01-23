import express from 'express'
import { dailyCheck } from '@jobs/dailyCheck'
import { useMorgan } from '@logger/index'
import { AuthRouter, ClientRouter, ProjectRouter, UserRouter } from '@routers'
import 'dotenv/config'

const app = express()
const port = process.env.PORT || 3000

app.use(useMorgan())
app.use(express.json())

app.use('/auth', AuthRouter)
app.use('/user', UserRouter)
app.use('/client', ClientRouter)
app.use('/project', ProjectRouter)

dailyCheck()

app.listen(port, () => console.log(`Server listening on port ${port}`))
