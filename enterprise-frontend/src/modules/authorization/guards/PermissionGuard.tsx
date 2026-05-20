import React, { useMemo } from "react";
import { useAuthorization } from "../hooks/useAuthorization";
import { PermissionGuardProps } from "../types";

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}) => {
  const { can, canAny, canAll } = useAuthorization();

  const searchList = useMemo(() => {
    const list = [...permissions];
    if (permission) list.push(permission);
    return list;
  }, [permission, permissions]);

  const hasAccess = useMemo(() => {
    if (searchList.length === 0) return true;
    if (requireAll) {
      return canAll(searchList);
    }
    return canAny(searchList);
  }, [searchList, requireAll, canAny, canAll]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

