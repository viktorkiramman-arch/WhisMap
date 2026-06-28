export const userRoles = ['USER', 'CAREGIVER', 'MODERATOR', 'ADMIN'] as const
export type UserRole = (typeof userRoles)[number]

export const householdRoles = ['OWNER', 'MEMBER', 'SITTER'] as const
export type HouseholdRole = (typeof householdRoles)[number]

const rank: Record<UserRole, number> = {
  USER: 1,
  CAREGIVER: 2,
  MODERATOR: 3,
  ADMIN: 4
}

export const hasMinimumRole = (role: UserRole, minimumRole: UserRole): boolean => rank[role] >= rank[minimumRole]
