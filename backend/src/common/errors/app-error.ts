export type AppErrorCode =
  | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: AppErrorCode

  public constructor(statusCode: number, code: AppErrorCode, message: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

export const appErrors = {
  authenticationRequired: () => new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'),
  forbidden: () => new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'),
  conflict: (message: string) => new AppError(409, 'CONFLICT', message),
  notFound: (message = 'The requested resource was not found.') => new AppError(404, 'NOT_FOUND', message)
}
