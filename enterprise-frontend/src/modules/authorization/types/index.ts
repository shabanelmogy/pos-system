export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface AuthenticatedUser {
  id: string | null;
  name: string | null;
  email: string | null;
  roles: string[];
  permissions: string[];
}

export interface RoleDto {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface PermissionDto {
  key: string;
  name: string;
  category: string;
  description?: string;
}

export interface AuthorizationContext {
  roles: string[];
  permissions: string[];
  loading: boolean;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

export interface GuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface PermissionGuardProps extends GuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}

export interface RoleGuardProps extends GuardProps {
  role?: string;
  roles?: string[];
  requireAll?: boolean;
}

export interface ProtectedRouteConfig {
  path: string;
  element: React.ReactNode;
  permissions?: string[];
  roles?: string[];
}

export interface NavigationItemConfig {
  label: string;
  path: string;
  icon?: string;
  permissions?: string[];
  roles?: string[];
  children?: NavigationItemConfig[];
}
