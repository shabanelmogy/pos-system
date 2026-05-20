import { create } from "zustand";
import { Role } from "../types";

interface AuthorizationState {
  roles: string[];
  permissions: string[];
  allRoles: Role[];
  deactivatedRoleIds: string[];
  initialized: boolean;
  setAuthData: (roles: string[], permissions: string[]) => void;
  setAllRoles: (roles: Role[]) => void;
  toggleRoleActive: (roleId: string, active: boolean) => void;
  initialize: () => void;
  clear: () => void;
  getEffectivePermissions: () => Set<string>;
  getEffectiveRoles: () => Set<string>;
}

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const useAuthorizationStore = create<AuthorizationState>((set, get) => ({
  roles: [],
  permissions: [],
  allRoles: [],
  deactivatedRoleIds: JSON.parse(localStorage.getItem("deactivated-roles") || "[]"),
  initialized: false,

  setAuthData: (roles, permissions) => {
    set({ roles, permissions, initialized: true });
  },

  setAllRoles: (allRoles) => {
    set({ allRoles });
  },

  toggleRoleActive: (roleId, active) => {
    set((state) => {
      let nextDeactivated = [...state.deactivatedRoleIds];
      if (active) {
        nextDeactivated = nextDeactivated.filter((id) => id !== roleId);
      } else {
        if (!nextDeactivated.includes(roleId)) {
          nextDeactivated.push(roleId);
        }
      }
      localStorage.setItem("deactivated-roles", JSON.stringify(nextDeactivated));
      return { deactivatedRoleIds: nextDeactivated };
    });
  },

  initialize: () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        set({
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          initialized: true,
        });
        return;
      }
    }
    set({ roles: [], permissions: [], initialized: true });
  },

  clear: () => {
    set({ roles: [], permissions: [], initialized: true });
  },

  getEffectivePermissions: () => {
    const { permissions, roles, allRoles, deactivatedRoleIds } = get();
    
    // Find if any of the user's roles are deactivated
    const activeRoles = allRoles.filter(
      (r) => roles.includes(r.name) && !deactivatedRoleIds.includes(r.id)
    );
    const deactivatedUserRoles = allRoles.filter(
      (r) => roles.includes(r.name) && deactivatedRoleIds.includes(r.id)
    );

    // If the user has some deactivated roles, we subtract permissions that belong ONLY to deactivated roles
    if (deactivatedUserRoles.length > 0) {
      const activePermissionsSet = new Set<string>();
      
      // Add permissions of active roles
      activeRoles.forEach((r) => {
        r.permissions?.forEach((p) => activePermissionsSet.add(p.key));
      });
      
      // If we don't have allRoles loaded yet, default to standard permissions minus deactivated ones
      if (allRoles.length === 0) {
        return new Set(permissions);
      }

      return activePermissionsSet;
    }

    return new Set(permissions);
  },

  getEffectiveRoles: () => {
    const { roles, allRoles, deactivatedRoleIds } = get();
    const activeRoles = roles.filter((roleName) => {
      const roleObj = allRoles.find((r) => r.name === roleName);
      if (roleObj && deactivatedRoleIds.includes(roleObj.id)) {
        return false;
      }
      return true;
    });
    return new Set(activeRoles);
  },
}));
