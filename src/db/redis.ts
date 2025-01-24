import { createClient } from 'redis'
import 'dotenv/config'

export const redisClient = createClient()

// ! Initialize redis client
;(async () => {
  redisClient.on('error', (err) => {
    console.log('Redis client error: ', err)
  })

  redisClient.on('ready', () => {
    console.log('Redis client started')
  })

  await redisClient.connect()
  await redisClient.ping()
})()
