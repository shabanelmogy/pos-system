import { httpClient } from "@/shared/api/httpClient";
import { Role, Permission, RoleDto } from "../types";

export const authorizationApi = {
  /**
   * Fetch all system permissions
   */
  getPermissions() {
    return httpClient.get<{ success: boolean; data: Permission[] }>("/api/rbac/permissions");
  },

  /**
   * Fetch all roles (including assigned permissions)
   */
  getRoles() {
    return httpClient.get<{ success: boolean; data: Role[] }>("/api/rbac/roles");
  },

  /**
   * Fetch single role by ID
   */
  getRoleById(roleId: string) {
    return httpClient.get<{ success: boolean; data: Role }>(`/api/rbac/roles/${roleId}`);
  },

  /**
   * Create a new role
   */
  createRole(roleData: RoleDto) {
    return httpClient.post<{ success: boolean; data: Role }>("/api/rbac/roles", roleData);
  },

  /**
   * Update an existing role
   */
  updateRole(roleId: string, roleData: RoleDto) {
    return httpClient.put<{ success: boolean; data: Role }>(`/api/rbac/roles/${roleId}`, roleData);
  },

  /**
   * Delete a role
   */
  deleteRole(roleId: string) {
    return httpClient.delete<{ success: boolean }>(`/api/rbac/roles/${roleId}`);
  },

  /**
   * Fetch roles assigned to a specific user
   */
  getUserRoles(userId: string) {
    return httpClient.get<{ success: boolean; data: Role[] }>(`/api/rbac/users/${userId}/roles`);
  },

  /**
   * Assign roles to a user
   */
  assignUserRoles(userId: string, roleIds: string[]) {
    return httpClient.post<{ success: boolean }>(`/api/rbac/users/${userId}/roles`, { roleIds });
  },
};
