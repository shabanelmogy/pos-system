import { Router, Request, Response } from "express";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";
import { rbacRepository } from "./rbac.repository.js";
import { roleService } from "./role.service.js";

const rbacRouter = Router();

// Apply auth middleware globally to all rbac routes
rbacRouter.use(isVerifiedUser);

// 1. List all available permissions
rbacRouter.get("/permissions", authorize("roles:view"), async (req: Request, res: Response) => {
  try {
    const list = await rbacRepository.listPermissions();
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. List all roles
rbacRouter.get("/roles", authorize("roles:view"), async (req: Request, res: Response) => {
  try {
    const list = await rbacRepository.listRoles();
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get single role by ID
rbacRouter.get("/roles/:roleId", authorize("roles:view"), async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId as string;
    const role = await rbacRepository.getRoleById(roleId);
    if (!role) {
      res.status(404).json({ success: false, message: "Role not found" });
      return;
    }
    res.status(200).json({ success: true, data: role });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Create a role
rbacRouter.post("/roles", authorize("roles:create"), async (req: Request, res: Response) => {
  try {
    const { name, description, permissionIds } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, message: "Role name is required and must be a string" });
      return;
    }
    if (!Array.isArray(permissionIds)) {
      res.status(400).json({ success: false, message: "permissionIds must be an array of strings" });
      return;
    }

    const role = await roleService.createRole(name, description, permissionIds);
    res.status(201).json({ success: true, message: "Role created successfully", data: role });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. Update a role
rbacRouter.put("/roles/:roleId", authorize("roles:update"), async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId as string;
    const { name, description, permissionIds } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, message: "Role name is required and must be a string" });
      return;
    }
    if (!Array.isArray(permissionIds)) {
      res.status(400).json({ success: false, message: "permissionIds must be an array of strings" });
      return;
    }

    const role = await roleService.updateRole(roleId, name, description, permissionIds);
    res.status(200).json({ success: true, message: "Role updated successfully", data: role });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 6. Delete a role
rbacRouter.delete("/roles/:roleId", authorize("roles:delete"), async (req: Request, res: Response) => {
  try {
    const roleId = req.params.roleId as string;
    await roleService.deleteRole(roleId);
    res.status(200).json({ success: true, message: "Role deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 7. Assign roles to user
rbacRouter.post("/users/:userId/roles", authorize("users:manage_roles"), async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { roleIds } = req.body;
    if (!Array.isArray(roleIds)) {
      res.status(400).json({ success: false, message: "roleIds must be an array of strings" });
      return;
    }

    const assignedByUserId = req.user?.id as string | undefined;
    await rbacRepository.assignRolesToUser(userId, roleIds, assignedByUserId);
    res.status(200).json({ success: true, message: "Roles assigned successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 8. Get roles of a user
rbacRouter.get("/users/:userId/roles", authorize("users:manage_roles"), async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const rbacData = await rbacRepository.getUserWithRolesAndPermissions(userId);
    res.status(200).json({ success: true, data: rbacData.roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default rbacRouter;
