import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizationApi } from "../api";
import { getUsers } from "@/shared/api/services/authApi";
import { Permission, Role } from "../types";
import { PERMISSION_MODULES } from "../constants";
import { useAuthorizationStore } from "../store/useAuthorizationStore";
import { useAuthorization } from "../hooks/useAuthorization";
import BackButton from "@/shared/components/BackButton";
import BottomNav from "@/shared/components/BottomNav";
import { 
  MdSecurity, 
  MdPeople, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdSearch, 
  MdCheck, 
  MdClose, 
  MdSave, 
  MdToggleOn, 
  MdToggleOff,
  MdShield
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { enqueueSnackbar } from "notistack";

interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[]; // mapped from DB rbac
}

const PermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { can } = useAuthorization();
  const setAllRoles = useAuthorizationStore((state) => state.setAllRoles);
  const deactivatedRoleIds = useAuthorizationStore((state) => state.deactivatedRoleIds);
  const toggleRoleActive = useAuthorizationStore((state) => state.toggleRoleActive);

  // Tabs: "roles" or "user-assignments"
  const [activeTab, setActiveTab] = useState<"roles" | "user-assignments">("roles");

  // Filter States
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [permissionSearchQuery, setPermissionSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Selection States
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Edit / Add Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "clone">("create");
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  // User assignment state
  const [userRoleIds, setUserRoleIds] = useState<string[]>([]);

  // 1. Fetch System Permissions
  const { data: permissionsRes, isLoading: isLoadingPerms } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => authorizationApi.getPermissions(),
  });
  const allPermissions = useMemo(() => permissionsRes?.data?.data || [], [permissionsRes]);

  // 2. Fetch System Roles
  const { data: rolesRes, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => authorizationApi.getRoles(),
  });
  const allRoles = useMemo(() => rolesRes?.data?.data || [], [rolesRes]);

  // Keep authorization store in sync with all roles to allow dynamic permission deactivation filters
  useEffect(() => {
    if (allRoles.length > 0) {
      setAllRoles(allRoles);
    }
  }, [allRoles, setAllRoles]);

  // Set default selected role
  useEffect(() => {
    if (allRoles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(allRoles[0].id);
    }
  }, [allRoles, selectedRoleId]);

  const selectedRole = useMemo(() => {
    return allRoles.find((r) => r.id === selectedRoleId) || null;
  }, [allRoles, selectedRoleId]);

  // Initialize selected permissions for selected role
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissionIds(selectedRole.permissions?.map((p) => p.id) || []);
    } else {
      setSelectedPermissionIds([]);
    }
  }, [selectedRole]);

  // 3. Fetch Users
  const { data: usersRes, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["rbac-users"],
    queryFn: () => getUsers(),
  });
  const allUsers = useMemo(() => (usersRes?.data?.data || []) as UserWithRoles[], [usersRes]);

  // Set default selected user
  useEffect(() => {
    if (allUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(allUsers[0].id);
    }
  }, [allUsers, selectedUserId]);

  const selectedUser = useMemo(() => {
    return allUsers.find((u) => u.id === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  // Fetch roles of selected user
  const { data: userRolesRes, refetch: refetchUserRoles } = useQuery({
    queryKey: ["rbac-user-roles", selectedUserId],
    queryFn: () => authorizationApi.getUserRoles(selectedUserId!),
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    if (userRolesRes?.data?.data) {
      setUserRoleIds(userRolesRes.data.data.map((r) => r.id));
    } else {
      setUserRoleIds([]);
    }
  }, [userRolesRes]);

  // Mutation: Create / Edit Role
  const roleMutation = useMutation({
    mutationFn: (data: { id?: string; name: string; description: string; permissionIds: string[] }) => {
      if (data.id) {
        return authorizationApi.updateRole(data.id, {
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        });
      } else {
        return authorizationApi.createRole({
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        });
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      enqueueSnackbar(res.data.message || "Role saved successfully!", { variant: "success" });
      setIsRoleModalOpen(false);
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || "Failed to save role.", { variant: "error" });
    },
  });

  // Mutation: Delete Role
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => authorizationApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      enqueueSnackbar("Role deleted successfully", { variant: "success" });
      setSelectedRoleId(null);
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || "Failed to delete role.", { variant: "error" });
    },
  });

  // Mutation: Assign User Roles
  const assignUserRolesMutation = useMutation({
    mutationFn: (data: { userId: string; roleIds: string[] }) =>
      authorizationApi.assignUserRoles(data.userId, data.roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-user-roles", selectedUserId] });
      enqueueSnackbar("User roles updated successfully!", { variant: "success" });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.response?.data?.message || "Failed to assign roles.", { variant: "error" });
    },
  });

  // Group Permissions by Category Module
  const groupedPermissions = useMemo(() => {
    const groups: { [category: string]: Permission[] } = {};
    allPermissions.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      
      // Filter permissions by search query
      const matchSearch = 
        p.name.toLowerCase().includes(permissionSearchQuery.toLowerCase()) || 
        p.key.toLowerCase().includes(permissionSearchQuery.toLowerCase());
      
      if (matchSearch) {
        groups[p.category].push(p);
      }
    });
    return groups;
  }, [allPermissions, permissionSearchQuery]);

  // Compute Effective Permissions of the Selected User (real-time preview)
  const userEffectivePermissions = useMemo(() => {
    const selectedRoles = allRoles.filter((r) => userRoleIds.includes(r.id));
    const permsSet = new Set<string>();
    selectedRoles.forEach((role) => {
      // Exclude if deactivated
      if (deactivatedRoleIds.includes(role.id)) return;
      role.permissions?.forEach((p) => permsSet.add(p.key));
    });
    return Array.from(permsSet);
  }, [userRoleIds, allRoles, deactivatedRoleIds]);

  // Role Action Helpers
  const handleOpenRoleModal = (mode: "create" | "edit" | "clone") => {
    setModalMode(mode);
    if (mode === "create") {
      setRoleForm({ name: "", description: "" });
    } else if (selectedRole) {
      setRoleForm({
        name: mode === "clone" ? `${selectedRole.name} (Copy)` : selectedRole.name,
        description: selectedRole.description || "",
      });
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      enqueueSnackbar("Role name is required", { variant: "warning" });
      return;
    }
    roleMutation.mutate({
      id: modalMode === "edit" && selectedRole ? selectedRole.id : undefined,
      name: roleForm.name,
      description: roleForm.description,
      permissionIds: modalMode === "create" ? [] : selectedPermissionIds,
    });
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm("Are you sure you want to delete this role? Any users assigned to this role will lose its permissions.")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissionMatrix = () => {
    if (!selectedRole) return;
    roleMutation.mutate({
      id: selectedRole.id,
      name: selectedRole.name,
      description: selectedRole.description || "",
      permissionIds: selectedPermissionIds,
    });
  };

  const handleToggleModulePermissions = (category: string, selectAll: boolean) => {
    const modulePermIds = groupedPermissions[category]?.map((p) => p.id) || [];
    if (selectAll) {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...modulePermIds])));
    } else {
      setSelectedPermissionIds((prev) => prev.filter((id) => !modulePermIds.includes(id)));
    }
  };

  const handleToggleUserRole = (roleId: string) => {
    setUserRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveUserRoles = () => {
    if (!selectedUserId) return;
    assignUserRolesMutation.mutate({
      userId: selectedUserId,
      roleIds: userRoleIds,
    });
  };

  const filteredRoles = useMemo(() => {
    return allRoles.filter((r) => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()));
  }, [allRoles, roleSearchQuery]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [allUsers, userSearchQuery]);

  const isSavingMatrix = roleMutation.isPending;
  const isSavingUserRoles = assignUserRolesMutation.isPending;

  return (
    <section className="bg-[var(--bg-main)] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-10 py-5 gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-[var(--text-main)] text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <MdShield className="text-[var(--primary)]" /> Authorization & Access Control
            </h1>
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">
              Configure system roles, permissions, and security scope mappings
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-main)] self-stretch md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "roles"
                ? "bg-[var(--primary)] text-black font-black"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <MdSecurity size={14} /> Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab("user-assignments")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "user-assignments"
                ? "bg-[var(--primary)] text-black font-black"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            <MdPeople size={14} /> User Role Assignments
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 md:px-10 pb-24 lg:pb-10 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* LEFT PANEL: LISTS */}
        <div className="w-full lg:w-1/3 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] flex flex-col overflow-hidden max-h-[300px] lg:max-h-full shadow-lg">
          {activeTab === "roles" ? (
            <>
              {/* Roles Header */}
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/30 flex items-center justify-between">
                <h2 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                  Active System Roles
                </h2>
                {can("roles:create") && (
                  <button
                    onClick={() => handleOpenRoleModal("create")}
                    className="p-1.5 bg-[var(--primary)] text-black rounded-lg hover:bg-[var(--primary-hover)] transition-all shadow-md"
                    title="Create New Role"
                  >
                    <MdAdd size={16} />
                  </button>
                )}
              </div>

              {/* Roles Search */}
              <div className="p-3 border-b border-[var(--border-main)]">
                <div className="relative">
                  <MdSearch className="absolute start-3 top-2.5 text-[var(--text-muted)]" size={16} />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl ps-9 pe-4 py-2 text-xs font-bold focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)] placeholder-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Roles List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {isLoadingRoles ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    Loading Roles...
                  </div>
                ) : filteredRoles.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    No roles found
                  </div>
                ) : (
                  filteredRoles.map((role) => {
                    const isActive = !deactivatedRoleIds.includes(role.id);
                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          selectedRoleId === role.id
                            ? "bg-[var(--primary)] text-black border-transparent shadow-lg shadow-[var(--primary)]/10"
                            : "bg-[var(--bg-main)] border-transparent text-[var(--text-main)] hover:border-[var(--primary)]/30"
                        }`}
                      >
                        <div className="text-start flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight leading-none">
                            {role.name}
                          </p>
                          <p
                            className={`text-[8px] font-bold mt-1.5 truncate max-w-[180px] ${
                              selectedRoleId === role.id ? "text-black/60" : "text-[var(--text-dim)]"
                            }`}
                          >
                            {role.description || "No description"}
                          </p>
                        </div>

                        {/* Status Toggle & Actions */}
                        <div className="flex items-center gap-1 onClick-stopPropagation" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleRoleActive(role.id, !isActive)}
                            className={`p-1 rounded ${
                              selectedRoleId === role.id ? "text-black" : "text-[var(--text-muted)]"
                            }`}
                            title={isActive ? "Deactivate Role" : "Activate Role"}
                          >
                            {isActive ? <MdToggleOn size={22} className="text-green-500" /> : <MdToggleOff size={22} className="text-red-500" />}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              {/* Users Header */}
              <div className="p-4 border-b border-[var(--border-main)] bg-[var(--bg-card-alt)]/30">
                <h2 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                  System Users
                </h2>
              </div>

              {/* Users Search */}
              <div className="p-3 border-b border-[var(--border-main)]">
                <div className="relative">
                  <MdSearch className="absolute start-3 top-2.5 text-[var(--text-muted)]" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl ps-9 pe-4 py-2 text-xs font-bold focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)] placeholder-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {isLoadingUsers ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    Loading Users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                        selectedUserId === user.id
                          ? "bg-[var(--primary)] text-black border-transparent shadow-lg shadow-[var(--primary)]/10"
                          : "bg-[var(--bg-main)] border-transparent text-[var(--text-main)] hover:border-[var(--primary)]/30"
                      }`}
                    >
                      <div className="text-start flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-tight leading-none">
                          {user.name}
                        </p>
                        <p
                          className={`text-[8px] font-bold mt-1.5 truncate max-w-[200px] ${
                            selectedUserId === user.id ? "text-black/60" : "text-[var(--text-dim)]"
                          }`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL: DETAILS & ASSIGNMENTS */}
        <div className="flex-1 overflow-hidden h-full flex flex-col">
          {activeTab === "roles" ? (
            <AnimatePresence mode="wait">
              {selectedRole ? (
                <motion.div
                  key={selectedRole.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-lg overflow-hidden"
                >
                  {/* Role Header Panel */}
                  <div className="p-6 border-b border-[var(--border-main)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-[var(--text-main)] text-lg font-black uppercase tracking-tighter">
                          {selectedRole.name}
                        </h2>
                        {!deactivatedRoleIds.includes(selectedRole.id) ? (
                          <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Inactive (Excluded)
                          </span>
                        )}
                      </div>
                      <p className="text-[var(--text-muted)] text-[10px] font-medium mt-1 leading-relaxed">
                        {selectedRole.description || "No description provided."}
                      </p>
                    </div>

                    {/* Role Actions */}
                    <div className="flex items-center gap-2">
                      {can("roles:update") && (
                        <>
                          <button
                            onClick={() => handleOpenRoleModal("edit")}
                            className="bg-[var(--bg-main)] text-[var(--text-main)] p-2.5 rounded-xl border border-[var(--border-main)] hover:border-[var(--primary)] transition-all flex items-center justify-center"
                            title="Edit Role Details"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenRoleModal("clone")}
                            className="bg-[var(--bg-main)] text-[var(--text-main)] p-2.5 rounded-xl border border-[var(--border-main)] hover:border-[var(--primary)] transition-all flex items-center justify-center"
                            title="Clone Role"
                          >
                            <MdContentCopy size={16} />
                          </button>
                        </>
                      )}
                      {can("roles:delete") && (
                        <button
                          onClick={() => handleDeleteRole(selectedRole.id)}
                          className="bg-red-500/10 text-red-500 border border-red-500/20 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          title="Delete Role"
                        >
                          <MdDelete size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search and Action Bar */}
                  <div className="p-4 bg-[var(--bg-card-alt)]/30 border-b border-[var(--border-main)] flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-64">
                      <MdSearch className="absolute start-3 top-2 text-[var(--text-muted)]" size={14} />
                      <input
                        type="text"
                        placeholder="Search permissions..."
                        value={permissionSearchQuery}
                        onChange={(e) => setPermissionSearchQuery(e.target.value)}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-lg ps-8 pe-3 py-1 text-xs focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)] placeholder-[var(--text-muted)]"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={handleSavePermissionMatrix}
                        disabled={isSavingMatrix}
                        className="flex-1 md:flex-none bg-[var(--primary)] text-black px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[var(--primary)]/10 disabled:opacity-50"
                      >
                        <MdSave size={14} /> {isSavingMatrix ? "Saving..." : "Save Scope Mapping"}
                      </button>
                    </div>
                  </div>

                  {/* Matrix Box */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {isLoadingPerms ? (
                      <div className="text-center py-10 font-bold uppercase tracking-wider text-xs text-[var(--text-muted)]">
                        Loading System Scopes...
                      </div>
                    ) : Object.keys(groupedPermissions).length === 0 ? (
                      <div className="text-center py-10 font-bold uppercase tracking-wider text-xs text-[var(--text-muted)]">
                        No permissions match search filter
                      </div>
                    ) : (
                      PERMISSION_MODULES.map((module) => {
                        const modulePermissions = groupedPermissions[module.key] || [];
                        if (modulePermissions.length === 0) return null;

                        const allChecked = modulePermissions.every((p) => selectedPermissionIds.includes(p.id));
                        const someChecked = modulePermissions.some((p) => selectedPermissionIds.includes(p.id));

                        return (
                          <div
                            key={module.key}
                            className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] p-4 space-y-4 hover:border-[var(--primary)]/20 transition-colors"
                          >
                            {/* Module Header */}
                            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2.5">
                              <span className="text-[10px] text-[var(--text-main)] font-black uppercase tracking-[0.15em] border-s-2 border-[var(--primary)] ps-2.5">
                                {module.label}
                              </span>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleToggleModulePermissions(module.key, !allChecked)}
                                  className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)] transition-all"
                                >
                                  {allChecked ? "Unselect All" : "Select All"}
                                </button>
                              </div>
                            </div>

                            {/* Permission Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {modulePermissions.map((p) => {
                                const isChecked = selectedPermissionIds.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                      isChecked
                                        ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--text-main)]"
                                        : "bg-[var(--bg-card)] border-transparent text-[var(--text-muted)] hover:border-[var(--border-main)]"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleTogglePermission(p.id)}
                                      className="sr-only"
                                    />
                                    <div
                                      className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                        isChecked
                                          ? "bg-[var(--primary)] border-[var(--primary)] text-black"
                                          : "border-[var(--border-main)] bg-[var(--bg-main)]"
                                      }`}
                                    >
                                      {isChecked && <MdCheck size={10} />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[9px] font-black uppercase tracking-tight leading-none text-[var(--text-main)]">
                                        {p.name}
                                      </span>
                                      <span className="text-[7px] font-bold text-[var(--text-dim)] mt-1 tracking-wider leading-relaxed">
                                        {p.key}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] border-dashed flex flex-col items-center justify-center p-10 text-center opacity-35">
                  <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-6">
                    <MdShield size={32} className="text-[var(--primary)]" />
                  </div>
                  <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter mb-2">
                    Scope Configurator
                  </h2>
                  <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em] max-w-[220px]">
                    Select a security role from the left panel to configure its permissions matrix
                  </p>
                </div>
              )}
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key={selectedUser.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-lg overflow-hidden"
                >
                  {/* User Profile Panel */}
                  <div className="p-6 border-b border-[var(--border-main)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-[var(--text-main)] text-lg font-black uppercase tracking-tighter">
                        {selectedUser.name}
                      </h2>
                      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-1">
                        Email: {selectedUser.email}
                      </p>
                    </div>

                    <button
                      onClick={handleSaveUserRoles}
                      disabled={isSavingUserRoles}
                      className="bg-[var(--primary)] text-black px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[var(--primary)]/10 disabled:opacity-50"
                    >
                      <MdSave size={14} /> {isSavingUserRoles ? "Saving..." : "Save Role Assignments"}
                    </button>
                  </div>

                  {/* Selection and Preview Split */}
                  <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-main)]">
                    {/* Role checklist (Left) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                      <h3 className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest border-s-2 border-[var(--primary)] ps-2">
                        Assigned Security Roles
                      </h3>

                      <div className="space-y-2">
                        {allRoles.map((role) => {
                          const isAssigned = userRoleIds.includes(role.id);
                          const isActive = !deactivatedRoleIds.includes(role.id);

                          return (
                            <label
                              key={role.id}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                                isAssigned
                                  ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--text-main)]"
                                  : "bg-[var(--bg-main)] border-transparent text-[var(--text-muted)] hover:border-[var(--border-main)]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => handleToggleUserRole(role.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                    isAssigned
                                      ? "bg-[var(--primary)] border-[var(--primary)] text-black"
                                      : "border-[var(--border-main)] bg-[var(--bg-card)]"
                                  }`}
                                >
                                  {isAssigned && <MdCheck size={12} />}
                                </div>
                                <div className="text-start">
                                  <span className="text-xs font-black uppercase tracking-tight text-[var(--text-main)] block">
                                    {role.name}
                                  </span>
                                  <span className="text-[8px] font-medium text-[var(--text-dim)] mt-0.5 block truncate max-w-[180px]">
                                    {role.description || "No description"}
                                  </span>
                                </div>
                              </div>

                              {!isActive && (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                  Inactive
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview Effective Permissions (Right) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[var(--bg-card-alt)]/20 space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2.5">
                        <h3 className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest border-s-2 border-orange-500 ps-2">
                          Effective Scopes Preview
                        </h3>
                        <span className="bg-[var(--bg-main)] border border-[var(--border-main)] text-[8px] font-black uppercase px-2 py-0.5 rounded text-[var(--text-muted)]">
                          {userEffectivePermissions.length} Scopes Active
                        </span>
                      </div>

                      {userEffectivePermissions.length === 0 ? (
                        <div className="text-center py-10 font-bold uppercase tracking-wider text-[10px] text-[var(--text-dim)]">
                          No active permissions from roles
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {userEffectivePermissions.map((key) => {
                            const pObj = allPermissions.find((p) => p.key === key);
                            return (
                              <div
                                key={key}
                                className="bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl p-2.5 flex items-center justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black uppercase text-[var(--text-main)] leading-none">
                                    {pObj?.name || key.split(":")[1] || key}
                                  </p>
                                  <p className="text-[7px] font-bold text-[var(--text-dim)] mt-1 tracking-wider leading-none">
                                    {key}
                                  </p>
                                </div>
                                <div className="w-4 h-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                                  <MdCheck size={10} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] border-dashed flex flex-col items-center justify-center p-10 text-center opacity-35">
                  <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-6">
                    <MdPeople size={32} className="text-[var(--primary)]" />
                  </div>
                  <h2 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter mb-2">
                    Security Mapping Preview
                  </h2>
                  <p className="text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em] max-w-[220px]">
                    Select a user from the left panel to assign roles and preview active scopes
                  </p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>

      {/* MODAL: Create / Edit / Clone Role */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute end-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <MdClose size={20} />
            </button>

            <h3 className="text-[var(--text-main)] text-xl font-black uppercase tracking-tighter mb-5">
              {modalMode === "create" ? "Create Security Role" : modalMode === "edit" ? "Edit Role Info" : "Clone Role"}
            </h3>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest block">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Regional Manager"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest block">
                  Role Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief explanation of roles scope..."
                  rows={3}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-xs font-bold focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1 bg-[var(--bg-main)] text-[var(--text-main)] py-2.5 rounded-xl border border-[var(--border-main)] font-black uppercase tracking-widest text-[9px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleMutation.isPending}
                  className="flex-1 bg-[var(--primary)] text-black py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--primary)]/10"
                >
                  {roleMutation.isPending ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default PermissionManagement;
