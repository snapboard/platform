export const ERROR_CODES = {
  'invalid-argument': 400,
  'failed-precondition': 400,
  'out-of-range': 400,
  unauthenticated: 401,
  'permission-denied': 403,
  'not-found': 404,
  aborted: 409,
  'already-exists': 409,
  'resource-exhausted': 429,
  cancelled: 499,
  unavailable: 500,
  internal: 500,
  'deadline-exceeded': 504
}

export const ERROR_REASONS = {
  'not-found': { code: 'not-found', message: 'Not found' },
  internal: { code: 'internal', message: 'Unknown error' },
  'invalid-request': { code: 'invalid-argument', message: 'Required field is missing' },
  'auth/invalid-auth': { code: 'permission-denied', message: 'Auth is no longer valud' },
  'auth/missing-auth': { code: 'permission-denied', message: 'Refresh oauth token required' },
  'auth/refresh-required': { code: 'permission-denied', message: 'Refresh oauth token required' },
  'apps/halted': { code: 'cancelled', message: 'Process was terminated early' },
  'apps/rate-limit': { code: 'resource-exhausted', message: 'Exceeded rate limit' },
  'apps/invalid-connection': { code: 'internal', message: 'No response received from server' },
  'apps/internal': { code: 'internal', message: 'An internal error occured in the app handler' }
}
