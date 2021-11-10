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
  'required-fields': { code: 'invalid-argument', message: 'Required field is missing' },
  'invalid-argument': { code: 'invalid-argument', message: 'Invalid arguments' },
  'missing-relation': { code: 'internal', message: 'A required relation is missing' },
  'too-many-requests': { code: 'resource-exhausted', message: 'Too many requests' },

  'apps/invalid-auth': { code: 'permission-denied', message: 'Auth is no longer valud' },
  'apps/missing-auth': { code: 'permission-denied', message: 'Refresh oauth token required' },
  'apps/refresh-required': { code: 'permission-denied', message: 'Refresh oauth token required' },
  'apps/halted': { code: 'cancelled', message: 'Process was terminated early' },
  'apps/rate-limit': { code: 'resource-exhausted', message: 'Exceeded rate limit' },
  'apps/invalid-connection': { code: 'internal', message: 'No response received from server' },
  'apps/internal': { code: 'internal', message: 'An internal error occured in the app handler' },
  'apps/redeploy-version': { code: 'already-exists', message: 'You cannot redeploy a previously published version' },
  'apps/not-found': { code: 'not-found', message: 'App does not exist' },
  'apps/invalid-account-inputs': { code: 'invalid-argument', message: 'Invalid inputs for specified app' },
  'apps/invalid-auth-type': { code: 'failed-precondition', message: 'Cannot perform operation on auth type' },
  'apps/required-fields': { code: 'invalid-argument', message: 'Required input fields for resource are missing' },
  'apps/unknown-app': { code: 'invalid-argument', message: 'Unknown app' },
  'apps/unknown-resource': { code: 'invalid-argument', message: 'Unknown resource' },

  'auth/login-with-email': { code: 'unauthenticated', message: 'Login with email to continue' },
  'auth/email-not-validated': { code: 'unauthenticated', message: 'E-mail is not validated' },
  'auth/permission-denied': { code: 'permission-denied', message: 'You do not have permission to access this resource' },
  'auth/unauthenticated': { code: 'unauthenticated', message: 'You must be logged in to perform this action' },
  'auth/invalid-token': { code: 'unauthenticated', message: 'Authentication token provided is invalid' },
  'auth/email-already-exists': { code: 'already-exists', message: 'User already exists' },
  'auth/invalid-password': { code: 'invalid-argument', message: 'Password is incorrect' },
  'auth/invalid-email': { code: 'invalid-argument', message: 'Email is incorrectly formatted' },
  'auth/user-not-found': { code: 'not-found', message: 'User not found' },

  'billing/no-subscription': { code: 'not-found', message: 'No active subscription is present for workspace' },
  'billing/card-declined': { code: 'failed-precondition', message: 'Card declined' },

  'codes/invalid-code-type': { code: 'failed-precondition', message: 'Code was used in the incorrect context' },
  'codes/already-used': { code: 'failed-precondition', message: 'Code can only be used once, and it has already been used' },
  'codes/expired': { code: 'failed-precondition', message: 'Code has expired, please request a new code' },

  'invites/token-already-used': { code: 'failed-precondition', message: 'Token has already been used' },
  'invites/token-revoked': { code: 'failed-precondition', message: 'Token has been revoked }' },
  'invites/token-expired': { code: 'failed-precondition', message: 'Token has expired' },
  'invites/email-mismatch': { code: 'invalid-argument', message: 'E-mail does not match invited e-mail' },

  'oauth/not-configured': { code: 'failed-precondition', message: 'App is not configured for oauth' },
  'oauth/mismatch': { code: 'failed-precondition', message: 'Mismatch between requested account and account selected during authentication' }

}
