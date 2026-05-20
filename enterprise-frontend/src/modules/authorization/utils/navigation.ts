import { NavigationItemConfig } from "../types";

/**
 * Centralized utility to filter navigation menus recursively.
 * It filters out any navigation item if the user lacks the required roles or permissions.
 */
export const filterNavigation = (
  items: NavigationItemConfig[],
  can: (permission: string) => boolean,
  hasRole: (role: string) => boolean
): NavigationItemConfig[] => {
  return items
    .filter((item) => {
      // Check permissions: User must have AT LEAST ONE of the allowed permissions if specified
      if (item.permissions && item.permissions.length > 0) {
        const hasPerm = item.permissions.some((p) => can(p));
        if (!hasPerm) return false;
      }

      // Check roles: User must have AT LEAST ONE of the allowed roles if specified
      if (item.roles && item.roles.length > 0) {
        const hasRl = item.roles.some((r) => hasRole(r));
        if (!hasRl) return false;
      }

      return true;
    })
    .map((item) => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavigation(item.children, can, hasRole),
        };
      }
      return item;
    });
};
