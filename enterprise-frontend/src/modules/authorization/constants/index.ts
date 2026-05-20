export const PERMISSION_MODULES = [
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
  { key: "products", label: "Products" },
  { key: "inventory", label: "Inventory" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "pos", label: "POS" },
  { key: "accounting", label: "Accounting" },
  { key: "hr", label: "HR" },
  { key: "reporting", label: "Reports" },
  { key: "system", label: "Settings" },
  { key: "ecommerce", label: "Ecommerce" },
  { key: "marketing", label: "Marketing" },
  { key: "shipping", label: "Shipping" },
  { key: "recruitment", label: "Recruitment" },
] as const;

export type PermissionModuleKey = typeof PERMISSION_MODULES[number]["key"];

export const SYSTEM_ROLES = {
  ADMIN: "Admin",
  MEMBER: "Member",
} as const;

export const SYSTEM_PERMISSIONS = {
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_MANAGE_ROLES: "users:manage_roles",
  
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
} as const;
