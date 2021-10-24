import { ERROR_CODES, ERROR_REASONS } from './constants'

export interface SnapErrorBase {
  /** The status code or error group */
  code?: keyof typeof ERROR_CODES

  /** Whether the error is loggable */
  log?: boolean

  /** Data that can be presented to the user */
  data?: any

  /** Internal data, not to be shared externally */
  internal?: any

  /** Original error message before normalization */
  originalError?: { name: string, message: string, stack: string }
}

export interface SnapErrorObject extends SnapErrorBase {
  /** A specific pre-defined reason for the error */
  reason: keyof typeof ERROR_REASONS

  /** Message that can be presented to the user */
  message?: string

  /** Stack trace for the error */
  stack?: string
}

export interface SnapErrorInput extends Omit<SnapErrorBase, 'originalError'> {
  /** Original error, before normalized */
  originalError?: any

  /** Message that can be presented to the user */
  message?: string
}

export class SnapError extends Error {
  error?: SnapErrorBase

  reason: keyof typeof ERROR_REASONS

  constructor (
    reason: keyof typeof ERROR_REASONS,
    input?: SnapErrorInput
  ) {
    super(`${reason} error`)
    this.reason = reason

    const { originalError, message, ...error } = input ?? {}

    this.error = error || {}

    if (originalError) {
      this.stack = originalError.stack
      this.error.originalError = {
        name: originalError.name,
        message: originalError.message,
        stack: originalError.stack
      }
    }

    if (message) {
      this.message = message
    }
  }

  toJSON = (): SnapErrorObject => {
    return {
      ...this.error,
      reason: this.reason,
      message: this.message,
      stack: this.stack
    }
  }

  static fromJSON = (err: SnapErrorObject): SnapError => {
    const { reason, ...rest } = err
    return new SnapError(reason, rest)
  }
}

export function createError (reason: keyof typeof ERROR_REASONS, other?: SnapErrorInput) {
  return new SnapError(reason, other)
}
