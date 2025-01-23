import morgan from 'morgan'
import { createLogger, format, transports } from 'winston'
const { combine, timestamp, json, colorize } = format

export const logger = createLogger({
  level: 'info',
  format: combine(colorize(), timestamp(), json()),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => `${level}: ${message}`),
      ),
    }),
    new transports.File({ filename: 'app.log' }),
  ],
})

export const useMorgan = () =>
  morgan(':method :url :status :response-time ms', {
    stream: {
      write: (message) => {
        const [method, url, status, responseTime] = message.split(' ')
        logger.info(
          JSON.stringify({
            method,
            url,
            status,
            responseTime,
          }),
        )
      },
    },
  })
