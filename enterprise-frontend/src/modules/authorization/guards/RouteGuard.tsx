import React, { useMemo } from "react";
import { useAuthorization } from "../hooks/useAuthorization";
import { ProtectedRouteConfig } from "../types";
import { MdLock } from "react-icons/md";
import BackButton from "@/shared/components/BackButton";

interface RouteGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
}) => {
  const { canAny, canAll, hasAnyRole, hasAllRoles, initialized } = useAuthorization();

  const hasAccess = useMemo(() => {
    // If not initialized, allow rendering loader or wait
    if (!initialized) return true;

    // Check permissions
    if (permissions.length > 0) {
      const allowed = requireAll ? canAll(permissions) : canAny(permissions);
      if (!allowed) return false;
    }

    // Check roles
    if (roles.length > 0) {
      const allowed = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
      if (!allowed) return false;
    }

    return true;
  }, [initialized, permissions, roles, requireAll, canAny, canAll, hasAnyRole, hasAllRoles]);

  if (!initialized) {
    return (
      <div className="bg-[var(--bg-main)] h-screen flex items-center justify-center text-[var(--text-main)] font-black uppercase tracking-widest opacity-25">
        Authorizing Session...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-[var(--bg-main)] min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-[var(--text-main)] p-10 text-center select-none">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <MdLock size={40} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-3">
          Access Denied
        </h1>
        <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest max-w-md mb-8 leading-relaxed">
          Your active security role does not have the permissions required to view this system resource. Please contact your administrator.
        </p>
        <BackButton />
      </div>
    );
  }

  return <>{children}</>;
};
