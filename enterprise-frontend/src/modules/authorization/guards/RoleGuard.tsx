import React, { useMemo } from "react";
import { useAuthorization } from "../hooks/useAuthorization";
import { RoleGuardProps } from "../types";

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  role,
  roles = [],
  requireAll = false,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuthorization();

  const searchList = useMemo(() => {
    const list = [...roles];
    if (role) list.push(role);
    return list;
  }, [role, roles]);

  const hasAccess = useMemo(() => {
    if (searchList.length === 0) return true;
    if (requireAll) {
      return hasAllRoles(searchList);
    }
    return hasAnyRole(searchList);
  }, [searchList, requireAll, hasAnyRole, hasAllRoles]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
