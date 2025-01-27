export class APIError extends Error {
  statusCode: number
  data: any
  success: boolean

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    stack: any = '',
  ) {
    super(message)
    this.statusCode = statusCode
    this.message = message
    this.data = null
    this.success = false

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
