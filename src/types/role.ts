export const USER_ROLES = {
  ADMIN: "admin",
  SEEKER: "seeker",
  PROVIDER: "provider",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ALL_USER_ROLES: UserRole[] = Object.values(USER_ROLES);
