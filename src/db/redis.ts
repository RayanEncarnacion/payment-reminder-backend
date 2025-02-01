import { createClient } from 'redis'

export const redisClient = createClient()

// ! Initialize redis client
;(async () => {
  redisClient.on('error', (error) =>
    console.log('[Redis]: Error starting client -> ', error),
  )
  redisClient.on('ready', () => console.log('[Redis]: Client started'))

  await redisClient.connect()
  await redisClient.ping()
})()
