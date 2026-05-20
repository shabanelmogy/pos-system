/**
 * Centralized authorization engine using Set-based lookups for O(1) performance.
 */
export const authService = {
  /**
   * Check if user has a specific permission
   */
  can(userPermissions: Set<string>, permission: string): boolean {
    // Admin override (if user has direct admin role or wildcard permission, modify accordingly)
    // Here we check for the exact permission
    return userPermissions.has(permission);
  },

  /**
   * Check if user has at least one of the specified permissions
   */
  canAny(userPermissions: Set<string>, permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.some((permission) => userPermissions.has(permission));
  },

  /**
   * Check if user has all of the specified permissions
   */
  canAll(userPermissions: Set<string>, permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.every((permission) => userPermissions.has(permission));
  },

  /**
   * Check if user has a specific role
   */
  hasRole(userRoles: Set<string>, role: string): boolean {
    // Case-insensitive/consistent match
    const lowerRole = role.toLowerCase();
    for (const r of userRoles) {
      if (r.toLowerCase() === lowerRole) return true;
    }
    return false;
  },

  /**
   * Check if user has at least one of the specified roles
   */
  hasAnyRole(userRoles: Set<string>, roles: string[]): boolean {
    if (roles.length === 0) return true;
    return roles.some((role) => this.hasRole(userRoles, role));
  },

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(userRoles: Set<string>, roles: string[]): boolean {
    if (roles.length === 0) return true;
    return roles.every((role) => this.hasRole(userRoles, role));
  },
};
