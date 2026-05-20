import { useCallback, useMemo } from "react";
import { useAuthorizationStore } from "../store/useAuthorizationStore";
import { authService } from "../services/authService";

export const useAuthorization = () => {
  const storeRoles = useAuthorizationStore((state) => state.roles);
  const storePermissions = useAuthorizationStore((state) => state.permissions);
  const initialized = useAuthorizationStore((state) => state.initialized);
  const getEffectivePermissions = useAuthorizationStore((state) => state.getEffectivePermissions);
  const getEffectiveRoles = useAuthorizationStore((state) => state.getEffectiveRoles);

  // Compute effective permissions and roles (after applying active/deactive status exclusions)
  const effectivePermissionsSet = useMemo(() => getEffectivePermissions(), [storePermissions, getEffectivePermissions]);
  const effectiveRolesSet = useMemo(() => getEffectiveRoles(), [storeRoles, getEffectiveRoles]);

  const can = useCallback(
    (permission: string) => {
      return authService.can(effectivePermissionsSet, permission);
    },
    [effectivePermissionsSet]
  );

  const canAny = useCallback(
    (permissions: string[]) => {
      return authService.canAny(effectivePermissionsSet, permissions);
    },
    [effectivePermissionsSet]
  );

  const canAll = useCallback(
    (permissions: string[]) => {
      return authService.canAll(effectivePermissionsSet, permissions);
    },
    [effectivePermissionsSet]
  );

  const hasRole = useCallback(
    (role: string) => {
      return authService.hasRole(effectiveRolesSet, role);
    },
    [effectiveRolesSet]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return authService.hasAnyRole(effectiveRolesSet, roles);
    },
    [effectiveRolesSet]
  );

  const hasAllRoles = useCallback(
    (roles: string[]) => {
      return authService.hasAllRoles(effectiveRolesSet, roles);
    },
    [effectiveRolesSet]
  );

  return {
    roles: useMemo(() => Array.from(effectiveRolesSet), [effectiveRolesSet]),
    permissions: useMemo(() => Array.from(effectivePermissionsSet), [effectivePermissionsSet]),
    initialized,
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};

export const usePermission = (permission: string) => {
  const { can } = useAuthorization();
  return useMemo(() => can(permission), [can, permission]);
};
