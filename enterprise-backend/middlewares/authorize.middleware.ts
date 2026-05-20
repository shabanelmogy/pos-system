import type { Request, Response, NextFunction } from "express";

// 1. Require a single permission
export const authorize = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized"
      });
      return;
    }
    
    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden: Missing permission: " + permission
      });
      return;
    }
    next();
  };
};

// 2. Require at least one permission from a list (OR logic)
export const authorizeAny = (required: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized"
      });
      return;
    }
    
    const userPermissions = req.user.permissions || [];
    const hasAny = required.some((p) => userPermissions.includes(p));
    if (!hasAny) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden: One of the required permissions is missing"
      });
      return;
    }
    next();
  };
};

// 3. Require all listed permissions (AND logic)
export const authorizeAll = (required: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized"
      });
      return;
    }
    
    const userPermissions = req.user.permissions || [];
    const missing = required.filter((p) => !userPermissions.includes(p));
    if (missing.length > 0) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden: Missing permissions: " + missing.join(", ")
      });
      return;
    }
    next();
  };
};
