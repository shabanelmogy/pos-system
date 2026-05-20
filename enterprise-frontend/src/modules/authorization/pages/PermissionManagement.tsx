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
  MdShield,
  MdLock,
  MdLockOpen,
  MdPerson,
  MdAdminPanelSettings,
  MdInfo,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { enqueueSnackbar } from "notistack";

interface UserWithRoles {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
}

// ── Module icon map ──────────────────────────────────────────
const MODULE_ICONS: Record<string, React.ReactNode> = {
  users:       <MdPeople size={14} />,
  roles:       <MdShield size={14} />,
  products:    <span style={{fontSize:12}}>📦</span>,
  inventory:   <span style={{fontSize:12}}>🗃️</span>,
  orders:      <span style={{fontSize:12}}>🧾</span>,
  customers:   <MdPerson size={14} />,
  pos:         <span style={{fontSize:12}}>🖥️</span>,
  accounting:  <span style={{fontSize:12}}>💰</span>,
  hr:          <span style={{fontSize:12}}>👥</span>,
  reporting:   <span style={{fontSize:12}}>📊</span>,
  system:      <MdAdminPanelSettings size={14} />,
  ecommerce:   <span style={{fontSize:12}}>🛒</span>,
  marketing:   <span style={{fontSize:12}}>📣</span>,
  shipping:    <span style={{fontSize:12}}>🚚</span>,
  recruitment: <span style={{fontSize:12}}>🧩</span>,
};

const MODULE_COLORS: Record<string, string> = {
  users:       "var(--primary)",
  roles:       "#8b5cf6",
  products:    "#f59e0b",
  inventory:   "#10b981",
  orders:      "#3b82f6",
  customers:   "#ec4899",
  pos:         "#06b6d4",
  accounting:  "#84cc16",
  hr:          "#f97316",
  reporting:   "#6366f1",
  system:      "#ef4444",
  ecommerce:   "#14b8a6",
  marketing:   "#e879f9",
  shipping:    "#0ea5e9",
  recruitment: "#a78bfa",
};

// ── Progress Bar Component ───────────────────────────────────
const ProgressBar: React.FC<{ value: number; total: number; color?: string }> = ({ value, total, color = "var(--primary)" }) => {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ flex:1, height:3, background:"var(--bg-main)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.4s ease" }} />
      </div>
      <span style={{ fontSize:8, fontWeight:900, color:"var(--text-muted)", letterSpacing:"0.1em", whiteSpace:"nowrap", minWidth:28 }}>
        {value}/{total}
      </span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const PermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { can } = useAuthorization();
  const setAllRoles = useAuthorizationStore((s) => s.setAllRoles);
  const deactivatedRoleIds = useAuthorizationStore((s) => s.deactivatedRoleIds);
  const toggleRoleActive = useAuthorizationStore((s) => s.toggleRoleActive);

  const [activeTab, setActiveTab] = useState<"roles" | "user-assignments">("roles");
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "clone">("create");
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [userRoleIds, setUserRoleIds] = useState<string[]>([]);
  const [hoveredRoleId, setHoveredRoleId] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────
  const { data: permsRes, isLoading: loadingPerms } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: () => authorizationApi.getPermissions(),
  });
  const allPerms: Permission[] = useMemo(() => permsRes?.data?.data || [], [permsRes]);

  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: () => authorizationApi.getRoles(),
  });
  const allRoles: Role[] = useMemo(() => rolesRes?.data?.data || [], [rolesRes]);

  useEffect(() => { if (allRoles.length > 0) setAllRoles(allRoles); }, [allRoles, setAllRoles]);
  useEffect(() => { if (allRoles.length > 0 && !selectedRoleId) setSelectedRoleId(allRoles[0].id); }, [allRoles, selectedRoleId]);

  const selectedRole = useMemo(() => allRoles.find((r) => r.id === selectedRoleId) || null, [allRoles, selectedRoleId]);

  useEffect(() => {
    setSelectedPermIds(selectedRole?.permissions?.map((p) => p.id) || []);
  }, [selectedRole]);

  const { data: usersRes, isLoading: loadingUsers } = useQuery({
    queryKey: ["rbac-users"],
    queryFn: () => getUsers(),
  });
  const allUsers = useMemo(() => (usersRes?.data?.data || []) as UserWithRoles[], [usersRes]);

  useEffect(() => { if (allUsers.length > 0 && !selectedUserId) setSelectedUserId(allUsers[0].id); }, [allUsers, selectedUserId]);

  const selectedUser = useMemo(() => allUsers.find((u) => u.id === selectedUserId) || null, [allUsers, selectedUserId]);

  const { data: userRolesRes, refetch: refetchUserRoles } = useQuery({
    queryKey: ["rbac-user-roles", selectedUserId],
    queryFn: () => authorizationApi.getUserRoles(selectedUserId!),
    enabled: !!selectedUserId,
  });
  useEffect(() => {
    setUserRoleIds(userRolesRes?.data?.data?.map((r: Role) => r.id) || []);
  }, [userRolesRes]);

  // ── Mutations ─────────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: (d: { id?: string; name: string; description: string; permissionIds: string[] }) =>
      d.id ? authorizationApi.updateRole(d.id, { name: d.name, description: d.description, permissionIds: d.permissionIds })
           : authorizationApi.createRole({ name: d.name, description: d.description, permissionIds: d.permissionIds }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      enqueueSnackbar(res.data.message || "Role saved!", { variant: "success" });
      setIsRoleModalOpen(false);
    },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || "Failed to save role.", { variant: "error" }),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => authorizationApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      enqueueSnackbar("Role deleted", { variant: "success" });
      setSelectedRoleId(null);
    },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || "Failed to delete role.", { variant: "error" }),
  });

  const assignUserRolesMutation = useMutation({
    mutationFn: (d: { userId: string; roleIds: string[] }) => authorizationApi.assignUserRoles(d.userId, d.roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac-user-roles", selectedUserId] });
      enqueueSnackbar("User roles updated!", { variant: "success" });
    },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || "Failed to assign roles.", { variant: "error" }),
  });

  // ── Helpers ───────────────────────────────────────────────────
  const getMappedCategory = (cat: string) => {
    if (cat === "catalog") return "products";
    if (cat === "crm") return "customers";
    return cat;
  };

  const groupedPerms = useMemo(() => {
    const groups: { [cat: string]: Permission[] } = {};
    allPerms.forEach((p) => {
      const cat = getMappedCategory(p.category);
      if (!groups[cat]) groups[cat] = [];
      const q = permSearch.toLowerCase();
      if (!q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)) {
        groups[cat].push(p);
      }
    });
    return groups;
  }, [allPerms, permSearch]);

  const userEffectivePerms = useMemo(() => {
    const set = new Set<string>();
    allRoles.filter((r) => userRoleIds.includes(r.id) && !deactivatedRoleIds.includes(r.id))
      .forEach((r) => r.permissions?.forEach((p) => set.add(p.key)));
    return Array.from(set);
  }, [userRoleIds, allRoles, deactivatedRoleIds]);

  const filteredRoles = useMemo(
    () => allRoles.filter((r) => r.name.toLowerCase().includes(roleSearch.toLowerCase())),
    [allRoles, roleSearch]
  );

  const filteredUsers = useMemo(
    () => allUsers.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())),
    [allUsers, userSearch]
  );

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
    if (!roleForm.name.trim()) { enqueueSnackbar("Role name is required", { variant: "warning" }); return; }
    roleMutation.mutate({
      id: modalMode === "edit" && selectedRole ? selectedRole.id : undefined,
      name: roleForm.name,
      description: roleForm.description,
      permissionIds: modalMode === "create" ? [] : selectedPermIds,
    });
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm("Delete this role? Users assigned to it will lose its permissions.")) {
      deleteRoleMutation.mutate(id);
    }
  };

  const handleTogglePerm = (id: string) =>
    setSelectedPermIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSaveMatrix = () => {
    if (!selectedRole) return;
    roleMutation.mutate({ id: selectedRole.id, name: selectedRole.name, description: selectedRole.description || "", permissionIds: selectedPermIds });
  };

  const handleModuleToggle = (cat: string, all: boolean) => {
    const ids = groupedPerms[cat]?.map((p) => p.id) || [];
    if (all) setSelectedPermIds((prev) => Array.from(new Set([...prev, ...ids])));
    else setSelectedPermIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleSaveUserRoles = () => {
    if (!selectedUserId) return;
    assignUserRolesMutation.mutate({ userId: selectedUserId, roleIds: userRoleIds });
  };

  // ────────────────────────────────────────────────────────────
  return (
    <section style={{ background: "var(--bg-main)", height: "calc(100vh - 5rem)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid var(--border-main)", background: "var(--bg-card)", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BackButton />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdShield size={20} color="#000" />
            </div>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--text-main)", lineHeight: 1 }}>
                Access Control
              </h1>
              <p style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 3 }}>
                Roles · Permissions · User Assignments
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "var(--bg-main)", borderRadius: 12, padding: 3, border: "1px solid var(--border-main)", gap: 3 }}>
          {([
            { key: "roles", icon: <MdSecurity size={13} />, label: "Roles & Permissions" },
            { key: "user-assignments", icon: <MdPeople size={13} />, label: "User Assignments" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                borderRadius: 9, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                border: "none", cursor: "pointer", transition: "all 0.2s",
                background: activeTab === tab.key ? "var(--primary)" : "transparent",
                color: activeTab === tab.key ? "#000" : "var(--text-muted)",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", gap: 0 }}>

        {/* ── LEFT SIDEBAR ──────────────────────────── */}
        <div style={{
          width: 260, flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid var(--border-main)", background: "var(--bg-card)", overflow: "hidden",
        }}>
          {/* Sidebar header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-main)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)" }}>
              {activeTab === "roles" ? `Roles (${filteredRoles.length})` : `Users (${filteredUsers.length})`}
            </span>
            {activeTab === "roles" && can("roles:create") && (
              <button
                onClick={() => handleOpenRoleModal("create")}
                title="New Role"
                style={{ width: 24, height: 24, background: "var(--primary)", border: "none", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <MdAdd size={14} color="#000" />
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-main)" }}>
            <div style={{ position: "relative" }}>
              <MdSearch style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} size={14} />
              <input
                type="text"
                placeholder={activeTab === "roles" ? "Search roles…" : "Search users…"}
                value={activeTab === "roles" ? roleSearch : userSearch}
                onChange={(e) => activeTab === "roles" ? setRoleSearch(e.target.value) : setUserSearch(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-main)", border: "1px solid var(--border-main)",
                  borderRadius: 8, paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
                  fontSize: 11, color: "var(--text-main)", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
            {activeTab === "roles" ? (
              loadingRoles ? (
                <SidebarSkeleton count={5} />
              ) : filteredRoles.length === 0 ? (
                <EmptyState label="No roles found" />
              ) : (
                filteredRoles.map((role) => {
                  const isActive = !deactivatedRoleIds.includes(role.id);
                  const isSelected = selectedRoleId === role.id;
                  const permCount = role.permissions?.length || 0;
                  const isHovered = hoveredRoleId === role.id;

                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      onMouseEnter={() => setHoveredRoleId(role.id)}
                      onMouseLeave={() => setHoveredRoleId(null)}
                      style={{
                        padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border-main)",
                        background: isSelected ? "var(--primary)" : isHovered ? "var(--bg-card-alt)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        {/* Name + badge */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: isSelected ? "#000" : "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {role.name}
                            </span>
                            {!isActive && (
                              <span style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 4px", whiteSpace: "nowrap" }}>
                                Off
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 8, color: isSelected ? "rgba(0,0,0,0.55)" : "var(--text-dim)", marginTop: 2, fontWeight: 700 }}>
                            {permCount} permission{permCount !== 1 ? "s" : ""}
                          </div>
                        </div>

                        {/* Inline actions (visible on hover or selected) */}
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 2, opacity: isHovered || isSelected ? 1 : 0, transition: "opacity 0.15s" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggleRoleActive(role.id, !isActive)}
                            title={isActive ? "Deactivate" : "Activate"}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, display: "flex" }}
                          >
                            {isActive
                              ? <MdToggleOn size={18} style={{ color: isSelected ? "#000" : "#22c55e" }} />
                              : <MdToggleOff size={18} style={{ color: "#ef4444" }} />}
                          </button>
                          {can("roles:update") && (
                            <button
                              onClick={() => handleOpenRoleModal("edit")}
                              title="Edit"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 4, display: "flex", color: isSelected ? "#000" : "var(--text-muted)" }}
                            >
                              <MdEdit size={13} />
                            </button>
                          )}
                          {can("roles:update") && (
                            <button
                              onClick={() => handleOpenRoleModal("clone")}
                              title="Clone"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 4, display: "flex", color: isSelected ? "#000" : "var(--text-muted)" }}
                            >
                              <MdContentCopy size={13} />
                            </button>
                          )}
                          {can("roles:delete") && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              title="Delete"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 3, borderRadius: 4, display: "flex", color: isSelected ? "#000" : "#ef4444" }}
                            >
                              <MdDelete size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // User list
              loadingUsers ? <SidebarSkeleton count={5} /> : filteredUsers.length === 0 ? <EmptyState label="No users found" /> :
                filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  const isHovered = hoveredRoleId === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      onMouseEnter={() => setHoveredRoleId(user.id)}
                      onMouseLeave={() => setHoveredRoleId(null)}
                      style={{
                        padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--border-main)",
                        background: isSelected ? "var(--primary)" : isHovered ? "var(--bg-card-alt)" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: isSelected ? "#000" : "var(--text-main)" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 8, color: isSelected ? "rgba(0,0,0,0.55)" : "var(--text-dim)", marginTop: 2, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* ── RIGHT CONTENT ──────────────────────────── */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
          <AnimatePresence mode="wait">
            {activeTab === "roles" ? (
              selectedRole ? (
                <motion.div key={selectedRole.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

                  {/* ── Role Toolbar ──── */}
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-main)", background: "var(--bg-card)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {/* Role name + status */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: deactivatedRoleIds.includes(selectedRole.id) ? "rgba(239,68,68,0.1)" : "rgba(var(--primary-rgb, 234,179,8), 0.1)",
                        border: `1px solid ${deactivatedRoleIds.includes(selectedRole.id) ? "rgba(239,68,68,0.2)" : "var(--primary)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {deactivatedRoleIds.includes(selectedRole.id) ? <MdLock size={15} color="#ef4444" /> : <MdLockOpen size={15} color="var(--primary)" />}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--text-main)" }}>
                            {selectedRole.name}
                          </span>
                          <span style={{
                            fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                            padding: "2px 6px", borderRadius: 4,
                            background: deactivatedRoleIds.includes(selectedRole.id) ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                            color: deactivatedRoleIds.includes(selectedRole.id) ? "#ef4444" : "#22c55e",
                            border: `1px solid ${deactivatedRoleIds.includes(selectedRole.id) ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
                          }}>
                            {deactivatedRoleIds.includes(selectedRole.id) ? "Inactive" : "Active"}
                          </span>
                        </div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>
                          {selectedRole.description || "No description"} · {selectedPermIds.length}/{allPerms.length} permissions
                        </div>
                      </div>
                    </div>

                    {/* Perm search */}
                    <div style={{ position: "relative" }}>
                      <MdSearch style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} size={13} />
                      <input
                        type="text"
                        placeholder="Search permissions…"
                        value={permSearch}
                        onChange={(e) => setPermSearch(e.target.value)}
                        style={{
                          width: 200, background: "var(--bg-main)", border: "1px solid var(--border-main)",
                          borderRadius: 8, paddingLeft: 26, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
                          fontSize: 11, color: "var(--text-main)", outline: "none",
                        }}
                      />
                    </div>

                    {/* Bulk actions */}
                    <button
                      onClick={() => setSelectedPermIds(allPerms.map((p) => p.id))}
                      style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border-main)", background: "var(--bg-main)", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedPermIds([])}
                      style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border-main)", background: "var(--bg-main)", color: "var(--text-muted)", cursor: "pointer" }}
                    >
                      Clear All
                    </button>

                    {/* Save */}
                    <button
                      onClick={handleSaveMatrix}
                      disabled={roleMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                        background: "var(--primary)", color: "#000", border: "none", borderRadius: 8,
                        fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                        opacity: roleMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <MdSave size={13} />
                      {roleMutation.isPending ? "Saving…" : "Save Changes"}
                    </button>
                  </div>

                  {/* ── Permission Matrix ──── */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }} className="custom-scrollbar">
                    {loadingPerms ? (
                      <MatrixSkeleton />
                    ) : Object.keys(groupedPerms).length === 0 ? (
                      <EmptyState label="No permissions match filter" />
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                        {PERMISSION_MODULES.map((mod) => {
                          const perms = groupedPerms[mod.key] || [];
                          if (perms.length === 0) return null;
                          const checkedCount = perms.filter((p) => selectedPermIds.includes(p.id)).length;
                          const allChecked = checkedCount === perms.length;
                          const color = MODULE_COLORS[mod.key] || "var(--primary)";

                          return (
                            <div
                              key={mod.key}
                              style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
                            >
                              {/* Module header */}
                              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-main)", display: "flex", alignItems: "center", gap: 8, background: `${color}08` }}>
                                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                                  {MODULE_ICONS[mod.key] ?? <MdShield size={13} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-main)" }}>
                                      {mod.label}
                                    </span>
                                    <button
                                      onClick={() => handleModuleToggle(mod.key, !allChecked)}
                                      style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 5, border: `1px solid ${color}40`, background: allChecked ? `${color}15` : "transparent", color: allChecked ? color : "var(--text-muted)", cursor: "pointer", transition: "all 0.15s" }}
                                    >
                                      {allChecked ? "Unselect All" : "Select All"}
                                    </button>
                                  </div>
                                  <div style={{ marginTop: 4 }}>
                                    <ProgressBar value={checkedCount} total={perms.length} color={color} />
                                  </div>
                                </div>
                              </div>

                              {/* Permission pills */}
                              <div style={{ padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {perms.map((p) => {
                                  const on = selectedPermIds.includes(p.id);
                                  return (
                                    <label
                                      key={p.id}
                                      title={p.key}
                                      style={{
                                        display: "flex", alignItems: "center", gap: 5, padding: "5px 9px",
                                        borderRadius: 8, cursor: "pointer", userSelect: "none", transition: "all 0.15s",
                                        background: on ? `${color}15` : "var(--bg-main)",
                                        border: `1px solid ${on ? `${color}40` : "var(--border-main)"}`,
                                      }}
                                    >
                                      <input type="checkbox" checked={on} onChange={() => handleTogglePerm(p.id)} style={{ display: "none" }} />
                                      <div style={{
                                        width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${on ? color : "var(--border-main)"}`,
                                        background: on ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                                      }}>
                                        {on && <MdCheck size={8} color="#000" />}
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: on ? "var(--text-main)" : "var(--text-muted)", lineHeight: 1 }}>
                                          {p.name}
                                        </div>
                                        <div style={{ fontSize: 7, color: "var(--text-dim)", marginTop: 1.5, fontFamily: "monospace", letterSpacing: "0.04em" }}>
                                          {p.key}
                                        </div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <EmptyContentState icon={<MdShield size={36} />} title="Select a Role" subtitle="Choose a role from the sidebar to configure its permission matrix" />
              )
            ) : (
              // ── USER ASSIGNMENTS TAB ─────────────────────
              selectedUser ? (
                <motion.div key={selectedUser.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

                  {/* User Toolbar */}
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-main)", background: "var(--bg-card)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-main)", border: "1px solid var(--border-main)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MdPerson size={20} color="var(--text-muted)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--text-main)" }}>
                          {selectedUser.name}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>
                          {selectedUser.email} · {userRoleIds.length} role{userRoleIds.length !== 1 ? "s" : ""} assigned · {userEffectivePerms.length} effective permissions
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveUserRoles}
                      disabled={assignUserRolesMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 16px",
                        background: "var(--primary)", color: "#000", border: "none", borderRadius: 8,
                        fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                        opacity: assignUserRolesMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <MdSave size={13} /> {assignUserRolesMutation.isPending ? "Saving…" : "Save Assignments"}
                    </button>
                  </div>

                  {/* Two-column: role checklist + effective perms preview */}
                  <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

                    {/* Role Checklist */}
                    <div style={{ width: "45%", overflowY: "auto", padding: "16px", borderRight: "1px solid var(--border-main)" }} className="custom-scrollbar">
                      <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-main)", display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 3, height: 12, background: "var(--primary)", borderRadius: 2 }} />
                        Assign Roles
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {allRoles.map((role) => {
                          const assigned = userRoleIds.includes(role.id);
                          const active = !deactivatedRoleIds.includes(role.id);
                          const color = MODULE_COLORS.roles;
                          return (
                            <label
                              key={role.id}
                              style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                                borderRadius: 10, cursor: "pointer", userSelect: "none", transition: "all 0.15s",
                                background: assigned ? `${color}10` : "var(--bg-card)",
                                border: `1px solid ${assigned ? `${color}30` : "var(--border-main)"}`,
                              }}
                            >
                              <input type="checkbox" checked={assigned} onChange={() => setUserRoleIds((prev) => prev.includes(role.id) ? prev.filter((x) => x !== role.id) : [...prev, role.id])} style={{ display: "none" }} />
                              <div style={{
                                width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${assigned ? color : "var(--border-main)"}`,
                                background: assigned ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              }}>
                                {assigned && <MdCheck size={10} color="#000" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "var(--text-main)" }}>
                                    {role.name}
                                  </span>
                                  {!active && (
                                    <span style={{ fontSize: 7, fontWeight: 900, textTransform: "uppercase", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, padding: "1px 4px" }}>
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2 }}>
                                  {role.permissions?.length || 0} permissions · {role.description || "No description"}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Effective Permissions Preview */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "var(--bg-card-alt, var(--bg-main))" }} className="custom-scrollbar">
                      <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-main)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 3, height: 12, background: "#f97316", borderRadius: 2 }} />
                          Effective Permissions
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 900, background: "var(--bg-card)", border: "1px solid var(--border-main)", borderRadius: 5, padding: "2px 6px", color: "var(--text-muted)" }}>
                          {userEffectivePerms.length} active
                        </span>
                      </div>

                      {userEffectivePerms.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 8, opacity: 0.4 }}>
                          <MdInfo size={24} color="var(--text-muted)" />
                          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
                            Assign roles to see effective permissions
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {userEffectivePerms.map((key) => {
                            const pObj = allPerms.find((p) => p.key === key);
                            const cat = getMappedCategory(pObj?.category || "");
                            const color = MODULE_COLORS[cat] || "var(--primary)";
                            return (
                              <div
                                key={key}
                                style={{
                                  display: "flex", alignItems: "center", gap: 6, padding: "5px 9px",
                                  background: "var(--bg-card)", border: "1px solid var(--border-main)",
                                  borderRadius: 8,
                                }}
                              >
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", color: "var(--text-main)", lineHeight: 1 }}>
                                    {pObj?.name || key.split(":")[1] || key}
                                  </div>
                                  <div style={{ fontSize: 7, color: "var(--text-dim)", fontFamily: "monospace", marginTop: 1 }}>
                                    {key}
                                  </div>
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
                <EmptyContentState icon={<MdPeople size={36} />} title="Select a User" subtitle="Choose a user from the sidebar to assign roles and preview their active permissions" />
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CREATE / EDIT / CLONE MODAL ─────────────── */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", padding: 16 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-main)", width: "100%", maxWidth: 420, borderRadius: 20, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", position: "relative" }}
            >
              <button
                onClick={() => setIsRoleModalOpen(false)}
                style={{ position: "absolute", right: 14, top: 14, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
              >
                <MdClose size={18} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {modalMode === "create" ? <MdAdd size={18} color="#000" /> : modalMode === "edit" ? <MdEdit size={16} color="#000" /> : <MdContentCopy size={16} color="#000" />}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--text-main)" }}>
                  {modalMode === "create" ? "New Role" : modalMode === "edit" ? "Edit Role" : "Clone Role"}
                </h3>
              </div>

              <form onSubmit={handleSaveRole} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 6 }}>
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Regional Manager"
                    style={{ width: "100%", background: "var(--bg-main)", border: "1px solid var(--border-main)", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "var(--text-main)", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 6 }}>
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief explanation of this role's scope…"
                    rows={3}
                    style={{ width: "100%", background: "var(--bg-main)", border: "1px solid var(--border-main)", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "var(--text-main)", outline: "none", resize: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border-main)", background: "var(--bg-main)", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", color: "var(--text-main)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={roleMutation.isPending}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "var(--primary)", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", color: "#000", opacity: roleMutation.isPending ? 0.6 : 1 }}
                  >
                    {roleMutation.isPending ? "Saving…" : "Save Role"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </section>
  );
};

// ── Sub-components ────────────────────────────────────────────
const SidebarSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-main)" }}>
        <div style={{ height: 10, width: "60%", background: "var(--bg-card-alt)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
        <div style={{ height: 8, width: "40%", background: "var(--bg-card-alt)", borderRadius: 4 }} />
      </div>
    ))}
  </>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ padding: "30px 14px", textAlign: "center", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-dim)" }}>
    {label}
  </div>
);

const MatrixSkeleton: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={{ background: "var(--bg-card)", borderRadius: 16, height: 180, animation: "pulse 1.5s infinite", border: "1px solid var(--border-main)" }} />
    ))}
  </div>
);

const EmptyContentState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.3, padding: 40 }}>
    <div style={{ color: "var(--primary)" }}>{icon}</div>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--text-main)" }}>{title}</div>
      <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6, maxWidth: 260 }}>{subtitle}</div>
    </div>
  </motion.div>
);

export default PermissionManagement;
