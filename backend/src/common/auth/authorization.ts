import { appErrors } from '../errors/app-error.js'
import { hasMinimumRole, type UserRole } from './roles.js'

export const assertMinimumRole = (actualRole: UserRole, minimumRole: UserRole): void => {
  if (!hasMinimumRole(actualRole, minimumRole)) {
    throw appErrors.forbidden()
  }
}
