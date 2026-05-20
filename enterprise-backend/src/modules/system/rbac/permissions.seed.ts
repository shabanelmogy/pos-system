export const PERMISSIONS = [
  // User Management
  { key: "users:view", name: "View Users", description: "View system user list and details", category: "users" },
  { key: "users:create", name: "Create Users", description: "Create new system users", category: "users" },
  { key: "users:update", name: "Update Users", description: "Update system user information", category: "users" },
  { key: "users:delete", name: "Delete Users", description: "Delete system users", category: "users" },
  { key: "users:manage_roles", name: "Manage User Roles", description: "Assign or revoke roles from users", category: "users" },

  // Role Management
  { key: "roles:view", name: "View Roles", description: "View role list and details", category: "roles" },
  { key: "roles:create", name: "Create Roles", description: "Create custom roles", category: "roles" },
  { key: "roles:update", name: "Update Roles", description: "Update role permissions", category: "roles" },
  { key: "roles:delete", name: "Delete Roles", description: "Delete roles from the system", category: "roles" },

  // POS Management
  { key: "pos:manage_tables", name: "Manage Tables", description: "Create, update, and manage dining tables", category: "pos" },
  { key: "pos:manage_shifts", name: "Manage Shifts", description: "Start, end, and view cashier shifts", category: "pos" },
  { key: "pos:manage_kitchen", name: "Manage Kitchen", description: "Manage kitchen stations and categories", category: "pos" },
  { key: "pos:manage_settings", name: "Manage POS Settings", description: "Configure POS terminal details and settings", category: "pos" },

  // Catalog Management
  { key: "catalog:view", name: "View Catalog", description: "View menu items and categories", category: "catalog" },
  { key: "catalog:manage", name: "Manage Catalog", description: "Create, edit, or delete items, categories, and modifiers", category: "catalog" },
  { key: "catalog:coupons", name: "Manage Coupons", description: "Create and manage coupons and discounts", category: "catalog" },

  // Order & Billing Operations
  { key: "orders:view", name: "View Orders", description: "View POS order history and details", category: "orders" },
  { key: "orders:create", name: "Create Orders", description: "Open new dining, takeaway, or delivery orders", category: "orders" },
  { key: "orders:update", name: "Update Orders", description: "Modify items in active orders", category: "orders" },
  { key: "orders:void", name: "Void Orders", description: "Void items or entire orders", category: "orders" },
  { key: "payments:create", name: "Process Payments", description: "Record payments for orders", category: "orders" },
  { key: "bills:view", name: "View Bills", description: "Generate and view bills or invoices", category: "orders" },

  // CRM Management
  { key: "crm:view", name: "View Customers", description: "View customer profiles and history", category: "crm" },
  { key: "crm:manage", name: "Manage Customers", description: "Create and edit customer details", category: "crm" },

  // Reports
  { key: "reporting:view", name: "View Reports", description: "View sales, catalog, shift, and branch reports", category: "reporting" },

  // System Configs
  { key: "system:settings", name: "System Settings", description: "Manage global settings", category: "system" },
  { key: "system:branches", name: "Manage Branches", description: "Manage branch information", category: "system" },
] as const;

export const DEFAULT_ROLES = {
  ADMIN: {
    name: "Admin",
    description: "Full system administrator - has all access",
    permissions: PERMISSIONS.map(p => p.key),
  },
  MEMBER: {
    name: "Member",
    description: "Standard staff user with POS register capabilities",
    permissions: [
      "catalog:view",
      "orders:view",
      "orders:create",
      "orders:update",
      "payments:create",
      "bills:view",
      "crm:view",
      "pos:manage_tables"
    ],
  },
} as const;
