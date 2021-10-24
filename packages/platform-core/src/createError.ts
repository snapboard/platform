import { ERROR_CODES, ERROR_REASONS } from './errors'

export interface SnapErrorOtherData {
  log?: boolean

  // Will be sent with
  data?: any

  [key: string]: any
}

export class SnapError extends Error {
  statusCode: number

  code: keyof typeof ERROR_CODES

  reason?: keyof typeof ERROR_REASONS

  log?: boolean

  data?: any

  internal?: any

  originalError: any

  constructor (
    code: keyof typeof ERROR_CODES,
    reason: keyof typeof ERROR_REASONS,
    message: string,
    other?: SnapErrorOtherData
  ) {
    const statusCode = ERROR_CODES[code]
    super(message || `${statusCode} error: ${code}`)
    this.code = code
    this.statusCode = statusCode
    this.reason = reason

    const {
      log, data, originalError, ...internal
    } = other ?? {}
    this.log = log
    this.data = data
    this.originalError = originalError
    this.internal = internal
  }

  toJSON = () => {
    return {
      message: this.message,
      code: this.code,
      reason: this.reason,
      stack: this.originalError?.stack || this.stack,
      originalError: this.originalError?.message,
      data: this.data,
      internal: this.internal,
      log: this.log
    }
  }
}

export interface CreateErrorOtherData extends SnapErrorOtherData {
  message: string
}

export function createError (reason: keyof typeof ERROR_REASONS, other?: SnapErrorOtherData) {
  const {
    code,
    message
  } = ERROR_REASONS[reason] as { code: keyof typeof ERROR_CODES, message: string }
  const { message: overwriteMessage, ...rest } = other ?? {}
  return new SnapError(code, reason, overwriteMessage || message, rest)
}
