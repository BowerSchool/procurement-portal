import { Role } from "@prisma/client";

export const roleRank: Record<Role, number> = {
  EMPLOYEE: 1,
  REPORTING_MANAGER: 2,
  FINANCE: 3,
  FINANCE_HEAD: 4,
  FOUNDER_CEO: 5,
  ADMIN: 6
};

export type Permission =
  | "vendor:read"
  | "vendor:write"
  | "pr:read"
  | "pr:create"
  | "pr:approve-manager"
  | "pr:approve-finance"
  | "po:write"
  | "receipt:write"
  | "bill:write"
  | "payment:approve"
  | "budget:override"
  | "reports:read"
  | "admin:manage";

const permissions: Record<Role, Permission[]> = {
  EMPLOYEE: ["vendor:read", "pr:read", "pr:create"],
  REPORTING_MANAGER: ["vendor:read", "pr:read", "pr:create", "pr:approve-manager", "receipt:write"],
  FINANCE: ["vendor:read", "vendor:write", "pr:read", "pr:approve-finance", "po:write", "receipt:write", "bill:write", "reports:read"],
  FINANCE_HEAD: ["vendor:read", "vendor:write", "pr:read", "pr:approve-finance", "po:write", "receipt:write", "bill:write", "payment:approve", "budget:override", "reports:read"],
  FOUNDER_CEO: ["vendor:read", "pr:read", "pr:approve-finance", "payment:approve", "budget:override", "reports:read"],
  ADMIN: ["vendor:read", "vendor:write", "pr:read", "pr:create", "pr:approve-manager", "pr:approve-finance", "po:write", "receipt:write", "bill:write", "payment:approve", "budget:override", "reports:read", "admin:manage"]
};

export function can(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}

export function canSeeAll(role: Role) {
  return ["FINANCE", "FINANCE_HEAD", "FOUNDER_CEO", "ADMIN"].includes(role);
}

export function assertPermission(role: Role, permission: Permission) {
  if (!can(role, permission)) {
    throw new Error(`RBAC_DENIED:${permission}`);
  }
}
