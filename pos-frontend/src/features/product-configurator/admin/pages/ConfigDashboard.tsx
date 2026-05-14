import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  History,
  Share2,
  MoreVertical,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ListTree,
  Tag,
  DollarSign,
  BrainCircuit,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { configApi } from "../../api/configApi";
import ProfileBuilder from "../components/ProfileBuilder";

// The data categories that will be cascade-deleted
const FORCE_DELETE_ITEMS = [
  { icon: ListTree,    label: "All Structural Components", detail: "Every block and grouping defined in the layout" },
  { icon: Tag,         label: "All Options & Variants",    detail: "Every selectable choice within each component" },
  { icon: Settings2,   label: "All Catalog Assignments",   detail: "Links to products and categories" },
  { icon: DollarSign,  label: "All Pricing Rules",         detail: "Context-aware price overrides" },
  { icon: BrainCircuit,label: "All Logic Rules",           detail: "Visibility and dependency conditions" },
];

export default function ConfigDashboard() {
  const [profiles, setProfiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeProfileId, setActiveProfileId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  // Two-step delete state
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [deleteStep, setDeleteStep] = React.useState<"confirm" | "force">("confirm");
  const [deleting, setDeleting] = React.useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await configApi.getProfiles();
      setProfiles(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch profiles", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchProfiles(); }, []);

  // Step 1: open the first confirmation dialog
  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(id);
    setDeleteStep("confirm");
  };

  // Step 2: advance to the force-delete warning dialog
  const handleAdvanceToForce = () => setDeleteStep("force");

  // Final: execute the cascade delete
  const handleForceDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await configApi.deleteProfile(deleteTarget);
      setProfiles(profiles.filter(p => p.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete profile", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDialog = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteStep("confirm");
  };

  const handleEdit   = (id: string) => { setActiveProfileId(id); setIsCreating(false); };
  const handleCreate = () => { setActiveProfileId(null); setIsCreating(true); };
  const handleBack   = () => { setActiveProfileId(null); setIsCreating(false); fetchProfiles(); };

  const getDisplayName = (name: any) =>
    typeof name === "object" ? (name?.en || name?.ar || "Unnamed") : name;

  const deleteTargetProfile = profiles.find(p => p.id === deleteTarget);

  if (activeProfileId || isCreating) {
    return <ProfileBuilder profileId={activeProfileId || undefined} onBack={handleBack} />;
  }

  return (
    <div className="space-y-8 bg-[var(--bg-main)] p-4 sm:p-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-[var(--text-main)]">Configuration Engine</h1>
          <p className="text-[var(--text-muted)] font-medium text-sm mt-1">Manage complex product logic and pricing rules.</p>
        </div>
        <Button onClick={handleCreate} className="font-black uppercase tracking-widest text-xs h-12 px-8 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black shadow-lg shadow-[var(--primary)]/10 gap-2 rounded-2xl transition-all hover:-translate-y-0.5">
          <Plus className="size-4" /> Create Profile
        </Button>
      </div>

      {/* Profile Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} onClick={() => handleEdit(profile.id)} className="group bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--primary)] transition-all cursor-pointer overflow-hidden shadow-none rounded-[2rem]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 p-6">
                <div className="space-y-2">
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                    {getDisplayName(profile.name)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 h-5 rounded-full",
                      profile.status === "PUBLISHED" ? "bg-[var(--status-success)] text-white" : "bg-[var(--bg-card-alt)] text-[var(--text-muted)]")}>
                      {profile.status || "DRAFT"}
                    </Badge>
                    <span className="text-[10px] text-[var(--text-dim)] font-black uppercase tracking-widest">v{profile.versionNumber || 1}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-9 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-xl">
                  <MoreVertical className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5"><Share2 className="size-3.5 text-[var(--primary)]" /><span>Assignments Ready</span></div>
                  <div className="flex items-center gap-1.5"><History className="size-3.5" /><span>{new Date(profile.updatedAt).toLocaleDateString()}</span></div>
                </div>
                <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Button onClick={() => handleEdit(profile.id)} size="sm" variant="outline" className="flex-1 font-black uppercase tracking-widest text-[9px] h-10 border-[var(--border-main)] hover:bg-[var(--bg-hover)] gap-2 rounded-xl">
                    <Edit3 className="size-3.5" /> Edit Logic
                  </Button>
                  <Button
                    onClick={(e) => handleDeleteRequest(profile.id, e)}
                    size="sm" variant="outline"
                    className="size-10 p-0 border-[var(--border-main)] hover:bg-[var(--status-error-bg)] hover:text-[var(--status-error)] rounded-xl"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <button onClick={handleCreate} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-card)]/50 p-8 hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all text-[var(--text-muted)] hover:text-[var(--primary)] group shadow-none">
            <div className="size-16 rounded-[1.5rem] bg-[var(--bg-card-alt)] border border-[var(--border-main)] flex items-center justify-center group-hover:border-[var(--primary)] group-hover:bg-[var(--bg-card)] transition-all">
              <Plus className="size-8" />
            </div>
            <div className="text-center">
              <p className="font-black uppercase tracking-widest text-xs">Add New Template</p>
              <p className="text-[10px] font-medium opacity-70 mt-1">Start building a new config profile</p>
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 1: Initial Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget && deleteStep === "confirm"} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent showCloseButton={false} className="max-w-md bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-[2rem] p-8">
          <DialogHeader className="items-center text-center gap-4">
            <div className="size-16 rounded-[1.5rem] bg-[var(--status-error-bg)] flex items-center justify-center">
              <AlertTriangle className="size-8 text-[var(--status-error)]" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-[var(--text-main)]">
              Delete Configuration?
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] leading-relaxed">
              You are about to delete{" "}
              <span className="text-[var(--text-main)]">
                "{getDisplayName(deleteTargetProfile?.name)}"
              </span>
              . This profile may have linked components, assignments, and pricing rules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-none bg-transparent mt-4 flex-row gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleCloseDialog} className="flex-1 h-12 font-black uppercase tracking-widest text-[9px] border-[var(--border-main)] rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleAdvanceToForce} className="flex-1 h-12 font-black uppercase tracking-widest text-[9px] bg-[var(--status-error)] text-white hover:opacity-90 rounded-xl gap-2">
              <Trash2 className="size-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── STEP 2: Force Delete — shows all related data ── */}
      <Dialog open={!!deleteTarget && deleteStep === "force"} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent showCloseButton={false} className="max-w-lg bg-[var(--bg-card)] border-2 border-[var(--status-error)]/40 rounded-[2rem] p-8">
          <DialogHeader className="items-center text-center gap-4">
            <div className="size-16 rounded-[1.5rem] bg-[var(--status-error)] flex items-center justify-center shadow-xl shadow-[var(--status-error)]/30">
              <ShieldAlert className="size-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-[var(--status-error)]">
              Force Delete — Cannot Be Undone
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] leading-relaxed">
              The following data will be permanently and irreversibly destroyed:
            </DialogDescription>
          </DialogHeader>

          {/* Related data list */}
          <div className="space-y-2 my-4">
            {FORCE_DELETE_ITEMS.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--status-error-bg)] border border-[var(--status-error)]/20">
                <div className="size-8 rounded-lg bg-[var(--status-error)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="size-4 text-[var(--status-error)]" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-main)]">{label}</p>
                  <p className="text-[8px] font-bold text-[var(--text-dim)] uppercase opacity-70">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="border-none bg-transparent flex-row gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => setDeleteStep("confirm")} disabled={deleting} className="flex-1 h-12 font-black uppercase tracking-widest text-[9px] border-[var(--border-main)] rounded-xl">
              Go Back
            </Button>
            <Button onClick={handleForceDelete} disabled={deleting} className="flex-1 h-12 font-black uppercase tracking-widest text-[9px] bg-[var(--status-error)] text-white hover:opacity-90 rounded-xl gap-2 shadow-lg shadow-[var(--status-error)]/20">
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
              Force Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
