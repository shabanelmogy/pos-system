import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Plus, 
  Trash2, 
  BrainCircuit, 
  DollarSign, 
  ListTree, 
  Check, 
  Settings2,
  Tag,
  Loader2,
  Package,
  Eye,
  Send,
  Search,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { configApi } from "../../api/configApi";

interface ProfileBuilderProps {
  profileId?: string;
  onBack: () => void;
}

const STEPS = [
  { id: "identity", title: "1. Identity", icon: Tag },
  { id: "layout", title: "2. Layout", icon: ListTree },
  { id: "logic", title: "3. Logic", icon: BrainCircuit },
  { id: "assignments", title: "4. Assignment", icon: Settings2 },
  { id: "pricing", title: "5. Pricing", icon: DollarSign },
  { id: "inventory", title: "6. Inventory", icon: Package },
  { id: "preview", title: "7. Preview", icon: Eye },
  { id: "publish", title: "8. Publish", icon: Send },
];

export default function ProfileBuilder({ profileId, onBack }: ProfileBuilderProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(!!profileId);
  const [saving, setSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<any>({
    name: "New Configuration",
    internalCode: "",
    components: [],
    logicRules: [],
    priceRules: [],
    inventoryRules: [],
  });
  const [assignments, setAssignments] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (profileId) {
      const fetchData = async () => {
        try {
          const [profRes, assignRes] = await Promise.all([
            configApi.getProfile(profileId),
            configApi.getAssignments(profileId)
          ]);
          setProfile({
            ...profRes.data.data,
            components: profRes.data.data?.components || [],
            logicRules: profRes.data.data?.logicRules || [],
            priceRules: profRes.data.data?.priceRules || [],
            inventoryRules: profRes.data.data?.inventoryRules || [],
          });
          setAssignments(assignRes.data.data || []);
        } catch (err) {
          console.error("Failed to fetch profile details", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [profileId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (profileId) {
        await configApi.updateProfile(profileId, profile);
      } else {
        await configApi.createProfile(profile);
      }
      onBack();
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => { 
    // Only auto-save if we are in "Create" mode and haven't gotten an ID yet
    if (currentStep === 0 && !profileId && !profile.id) {
        setSaving(true);
        try {
            const res = await configApi.createProfile(profile);
            setProfile(res.data.data);
        } catch (err) {
            console.error("Auto-save failed", err);
            alert("Failed to initialize profile. Please check your connection.");
            return;
        } finally {
            setSaving(false);
        }
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1); 
  };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="size-10 animate-spin text-[var(--primary)]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Initializng Enterprise Engine…</p>
    </div>
  );

  const activeStepId = STEPS[currentStep].id;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      {/* 8-Step Stepper */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 px-4">
        {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                    <div 
                        className={cn(
                            "size-10 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                            isCompleted ? "bg-[var(--status-success)] border-[var(--status-success)] text-white" :
                            isActive ? "bg-[var(--primary)] border-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20" :
                            "bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-dim)]"
                        )}
                    >
                        {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                    </div>
                    <span className={cn("text-[7px] font-black uppercase tracking-widest text-center", 
                        isActive ? "text-[var(--text-main)]" : "text-[var(--text-dim)]")
                    }>
                        {step.title.split('. ')[1]}
                    </span>
                </div>
            );
        })}
      </div>

      {/* Builder Content Area */}
      <div className="min-h-[500px]">
        {activeStepId === "identity" && <StepIdentity profile={profile} setProfile={setProfile} />}
        {activeStepId === "layout" && <StepLayout profile={profile} setProfile={setProfile} />}
        {activeStepId === "logic" && <StepLogic profile={profile} setProfile={setProfile} />}
        {activeStepId === "assignments" && <StepAssignments profileId={profile.id} assignments={assignments} setAssignments={setAssignments} onRefresh={() => configApi.getAssignments(profile.id).then(res => setAssignments(res.data.data))} />}
        {activeStepId === "pricing" && <StepPricing profile={profile} setProfile={setProfile} assignments={assignments} />}
        {activeStepId === "inventory" && <StepInventory profile={profile} setProfile={setProfile} />}
        {activeStepId === "preview" && <StepPreview profile={profile} />}
        {activeStepId === "publish" && <StepPublish profile={profile} assignments={assignments} handleSave={handleSave} saving={saving} />}
      </div>

      {/* Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-main)]/80 backdrop-blur-xl border-t border-[var(--border-main)] p-6 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button onClick={currentStep === 0 ? onBack : prevStep} variant="outline" className="h-12 px-6 font-black uppercase tracking-widest text-[9px] rounded-xl border-[var(--border-main)] gap-2">
                <ChevronLeft className="size-4" /> {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            <div className="flex items-center gap-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">Phase {currentStep + 1} of 8</p>
                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={nextStep} className="h-12 px-10 font-black uppercase tracking-widest text-[9px] rounded-xl bg-[var(--primary)] text-black shadow-xl shadow-[var(--primary)]/20 gap-2">
                        Continue <ChevronRight className="size-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={saving} className="h-12 px-10 font-black uppercase tracking-widest text-[9px] rounded-xl bg-[var(--status-success)] text-white shadow-xl shadow-[var(--status-success)]/20 gap-2">
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Finalize Platform
                    </Button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

/* --- REFACTORED STEP COMPONENTS WITH CONTEXTUAL EXAMPLES --- */

function StepIdentity({ profile, setProfile }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Card className="lg:col-span-2 bg-[var(--bg-card)] border-none p-10 space-y-12 rounded-[2.5rem]">
                <div className="space-y-3">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-main)]">Configuration Identity</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Define the global blueprint for this commerce capability</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-2">Platform Name</Label>
                        <Input 
                            value={typeof profile.name === 'object' ? (profile.name?.en || "") : profile.name} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (typeof profile.name === 'object') {
                                    setProfile({...profile, name: { ...profile.name, en: val }});
                                } else {
                                    setProfile({...profile, name: val});
                                }
                            }} 
                            placeholder="e.g., Premium Pizza Builder" 
                            className="h-14 px-6 rounded-2xl bg-[var(--bg-input)] border-2 border-[var(--border-main)] font-bold text-lg focus:border-[var(--primary)] transition-all" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-2">Internal System Code</Label>
                        <Input value={profile.internalCode} onChange={(e) => setProfile({...profile, internalCode: e.target.value.toUpperCase()})} placeholder="e.g., PIZZA_CFG_001" className="h-14 px-6 rounded-2xl bg-[var(--bg-input)] border-2 border-[var(--border-main)] font-mono text-lg focus:border-[var(--primary)] transition-all" />
                    </div>
                </div>
            </Card>
            <Card className="bg-[var(--primary)]/5 border-2 border-dashed border-[var(--primary)]/20 p-8 rounded-[2.5rem] flex flex-col gap-4">
                <div className="size-10 rounded-xl bg-[var(--primary)] text-black flex items-center justify-center"><Info className="size-5" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">Example Identity</h3>
                <p className="text-[10px] text-[var(--text-dim)] leading-relaxed italic font-bold uppercase">"If you are building a topping configurator for pizzas, use 'Pizza Toppings' as the name and 'FOOD_TOPPING_PIZZA' as the internal code for API traceability."</p>
            </Card>
        </div>
    );
}

function StepLayout({ profile, setProfile }: any) {
    const components = profile.components || [];
    const addComponent = () => {
        const newComp = { id: `c_${Date.now()}`, name: "New Block", type: "SINGLE_SELECT", options: [], sortOrder: components.length + 1 };
        setProfile({ ...profile, components: [...components, newComp] });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Structural Layout</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Design the options blueprint without prices</p>
                </div>
                <Button onClick={addComponent} className="bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl h-10 px-6 gap-2">
                    <Plus className="size-4" /> Add Structural Block
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 gap-4">
                    {components.map((comp: any) => (
                        <Card key={comp.id} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl p-8 space-y-6">
                            <div className="flex items-start justify-between">
                                <Input value={comp.name} onChange={(e) => setProfile({...profile, components: components.map((c: any) => c.id === comp.id ? {...c, name: e.target.value} : c)})} className="text-xl font-black uppercase bg-transparent border-none p-0 h-auto focus-visible:ring-0" />
                                <Button onClick={() => setProfile({...profile, components: components.filter((c: any) => c.id !== comp.id)})} variant="ghost" className="text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-xl"><Trash2 className="size-4" /></Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {comp.options?.map((opt: any, idx: number) => (
                                    <div key={opt.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card-alt)] border border-[var(--border-main)]">
                                        <Input value={opt.name} onChange={(e) => {
                                            const newOpts = [...comp.options]; newOpts[idx].name = e.target.value;
                                            setProfile({...profile, components: components.map((c: any) => c.id === comp.id ? {...c, options: newOpts} : c)});
                                        }} className="bg-transparent border-none text-[10px] font-black uppercase p-0 h-auto focus-visible:ring-0 flex-1" />
                                        <Trash2 onClick={() => {
                                             const newOpts = comp.options.filter((_: any, i: number) => i !== idx);
                                             setProfile({...profile, components: components.map((c: any) => c.id === comp.id ? {...c, options: newOpts} : c)});
                                        }} className="size-3 text-[var(--status-error)] opacity-50 cursor-pointer" />
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const newOpt = { id: `o_${Date.now()}`, name: "New Option" };
                                    setProfile({...profile, components: components.map((c: any) => c.id === comp.id ? {...c, options: [...(c.options || []), newOpt]} : c)});
                                }} className="p-3 rounded-xl border-2 border-dashed border-[var(--border-main)] text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">+ Add Option</button>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="space-y-4">
                    <Card className="bg-[var(--bg-card-alt)]/50 border border-[var(--border-main)] p-6 rounded-3xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-3">Layout Example</h4>
                        <div className="space-y-4 text-[9px] font-bold text-[var(--text-dim)] uppercase leading-relaxed">
                            <p>Component: <span className="text-[var(--text-main)]">Crust Type</span></p>
                            <div className="pl-4 space-y-1">
                                <p>• Option: Classic</p>
                                <p>• Option: Thin & Crispy</p>
                                <p>• Option: Stuffed</p>
                            </div>
                            <div className="pt-2 border-t border-[var(--border-main)] opacity-50">
                                Note: Do not add prices here. Prices are contextual and added in Step 5.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StepLogic({ profile, setProfile }: any) {
    const components = profile.components || [];
    const logicRules = profile.logicRules || [];

    const addRule = () => {
        const newRule = { id: `lr_${Date.now()}`, condition: { componentId: "", value: "" }, action: "HIDE", targetId: "" };
        setProfile({ ...profile, logicRules: [...logicRules, newRule] });
    };

    const updateRule = (id: string, updates: any) => {
        setProfile({ ...profile, logicRules: logicRules.map((r: any) => r.id === id ? { ...r, ...updates } : r) });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between px-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Intelligence Engine</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mt-1">Define structural visibility and requirement dependencies</p>
                    </div>
                    <Button onClick={addRule} className="bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl h-10 px-6 gap-2 shadow-xl shadow-[var(--primary)]/10">
                        <BrainCircuit className="size-4" /> Add Rule
                    </Button>
                </div>

                <div className="space-y-4">
                    {profile.logicRules?.map((rule: any) => {
                        const selectedComp = components.find((c: any) => c.id === rule.condition.componentId);
                        return (
                            <Card key={rule.id} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <span className="text-[10px] font-black uppercase text-[var(--text-dim)]">IF</span>
                                    <select className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 flex-1 focus:border-[var(--primary)] outline-none" value={rule.condition.componentId} onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, componentId: e.target.value, value: "" } })}>
                                        <option value="">Select Block</option>
                                        {components.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <span className="text-[10px] font-black uppercase text-[var(--text-dim)]">IS</span>
                                    {selectedComp && selectedComp.options?.length > 0 ? (
                                        <select 
                                            className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 w-32 focus:border-[var(--primary)] outline-none"
                                            value={rule.condition.value}
                                            onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, value: e.target.value } })}
                                        >
                                            <option value="">Select Value</option>
                                            {selectedComp.options.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                                        </select>
                                    ) : (
                                        <Input placeholder="Value" value={rule.condition.value} onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, value: e.target.value } })} className="h-10 text-[10px] font-black bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] w-32 rounded-xl" />
                                    )}
                                </div>
                                <div className="flex items-center gap-4 flex-1 w-full">
                                    <span className="text-[10px] font-black uppercase text-[var(--text-dim)]">THEN</span>
                                    <select className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 w-32 focus:border-[var(--primary)] outline-none" value={rule.action} onChange={(e) => updateRule(rule.id, { action: e.target.value })}>
                                        <option value="HIDE">HIDE</option>
                                        <option value="DISABLE">DISABLE</option>
                                        <option value="REQUIRE">REQUIRE</option>
                                    </select>
                                    <select className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 flex-1 focus:border-[var(--primary)] outline-none" value={rule.targetId} onChange={(e) => updateRule(rule.id, { targetId: e.target.value })}>
                                        <option value="">Target Block</option>
                                        {components.filter((c: any) => c.id !== rule.condition.componentId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <Button onClick={() => setProfile({...profile, logicRules: profile.logicRules.filter((r: any) => r.id !== rule.id)})} variant="ghost" className="text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-xl"><Trash2 className="size-4" /></Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <Card className="bg-[var(--primary)]/5 border-2 border-dashed border-[var(--primary)]/20 p-8 rounded-[2.5rem] flex flex-col gap-4">
                <div className="size-10 rounded-xl bg-[var(--primary)] text-black flex items-center justify-center"><BrainCircuit className="size-5" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">Logic Example</h3>
                <div className="text-[10px] text-[var(--text-dim)] space-y-4 font-bold uppercase italic">
                    <p>"IF <span className="text-[var(--text-main)]">Size</span> IS <span className="text-[var(--text-main)]">Small</span> THEN <span className="text-[var(--text-main)]">HIDE</span> <span className="text-[var(--text-main)]">Extra Large Toppings</span>"</p>
                    <p className="text-[8px] opacity-70">This ensures users can only see relevant options based on their previous selections.</p>
                </div>
            </Card>
        </div>
    );
}

function StepAssignments({ profileId, assignments, onRefresh }: any) {
    const [query, setQuery] = React.useState("");
    const [targetType, setTargetType] = React.useState<"PRODUCT" | "CATEGORY">("PRODUCT");
    const [results, setResults] = React.useState<any[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState("");

    // Load categories for drill-down
    React.useEffect(() => {
        configApi.getCategories().then(res => {
            setCategories(res.data.data || []);
        });
    }, []);

    // Debounced search logic
    React.useEffect(() => {
        if (!query.trim()) {
            if (!selectedCategory) setResults([]);
            return;
        }
        setSelectedCategory(""); // Clear category filter if typing

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await configApi.searchTargets(query, targetType);
                setResults(res.data.data || []);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, targetType]);

    // Category drill-down logic
    const handleCategoryChange = async (catId: string) => {
        setSelectedCategory(catId);
        setQuery("");
        if (!catId) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await configApi.getItemsByCategory(catId);
            setResults(res.data.data || []);
        } finally {
            setSearching(false);
        }
    };

    const handleAssign = async (target: any) => {
        setSearching(true);
        try {
            await configApi.createAssignment({ 
                profileId, 
                targetId: target.id, 
                targetType,
                contextConfig: { name: target.name }
            } as any);
            await onRefresh();
            setQuery("");
            setResults([]);
            setSelectedCategory("");
        } catch (error) {
            console.error("Assignment failed:", error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 p-4">
            <Card className="lg:col-span-2 bg-[var(--bg-card)] border-2 border-[var(--border-main)] p-10 rounded-[2.5rem] space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Global Target Finder</h2>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]">Search and link this blueprint to your catalog</p>
                    </div>
                    <div className="flex bg-[var(--bg-card-alt)] p-1.5 rounded-2xl border border-[var(--border-main)] w-fit self-start">
                        <button 
                            onClick={() => { setTargetType("PRODUCT"); setQuery(""); setResults([]); }} 
                            className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2", targetType === "PRODUCT" ? "bg-[var(--primary)] text-black shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-main)]")}
                        >
                            <Tag className="size-3" /> Item
                        </button>
                        <button 
                            onClick={() => { setTargetType("CATEGORY"); setQuery(""); setResults([]); }} 
                            className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2", targetType === "CATEGORY" ? "bg-[var(--primary)] text-black shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-main)]")}
                        >
                            <ListTree className="size-3" /> Category
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative group flex-1">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className={cn("size-5 transition-colors", searching ? "text-[var(--primary)] animate-pulse" : "text-[var(--text-dim)] group-focus-within:text-[var(--primary)]")} />
                            </div>
                            <Input 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                placeholder={`Type to search...`} 
                                className="h-16 pl-14 pr-6 bg-[var(--bg-input)] rounded-2xl border-2 border-[var(--border-main)] font-bold text-lg focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-dim)]/30" 
                            />
                        </div>
                        
                        {targetType === "PRODUCT" && (
                            <select 
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="h-16 px-6 bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-2xl text-[10px] font-black uppercase outline-none focus:border-[var(--primary)] transition-all min-w-[200px]"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar min-h-[100px]">
                        {!query && !selectedCategory && (
                            <div className="py-20 text-center opacity-30">
                                <Search className="size-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select a category or start typing</p>
                            </div>
                        )}
                        {searching && (
                            <div className="py-20 text-center">
                                <Loader2 className="size-10 animate-spin mx-auto text-[var(--primary)] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Mapping Catalog context...</p>
                            </div>
                        )}
                        {(query || selectedCategory) && results.length === 0 && !searching && (
                            <div className="py-20 text-center bg-[var(--bg-card-alt)]/30 rounded-[2rem] border-2 border-dashed border-[var(--border-main)]">
                                <Info className="size-10 mx-auto text-[var(--text-dim)] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">No matches found in this context</p>
                            </div>
                        )}
                        {!searching && results.map(r => (
                            <button 
                                key={r.id} 
                                onClick={() => handleAssign(r)} 
                                className="w-full text-left px-8 py-5 text-[10px] font-black uppercase bg-[var(--bg-card-alt)] border-2 border-transparent rounded-[1.5rem] hover:border-[var(--primary)] hover:bg-[var(--primary)]/[0.03] transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[var(--primary)]/30">
                                        {targetType === "PRODUCT" ? <Tag className="size-4" /> : <ListTree className="size-4" />}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{r.name}</span>
                                        <p className="text-[8px] text-[var(--text-dim)] opacity-50 font-mono">ID: {r.id.slice(0,8)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-black text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">LINK TARGET</span>
                                    <Plus className="size-4 text-[var(--primary)]" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="space-y-8">
                <Card className="bg-[var(--primary)]/5 border-2 border-dashed border-[var(--primary)]/20 p-6 rounded-[2rem] flex flex-col gap-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">Assignment Example</h4>
                    <p className="text-[9px] text-[var(--text-dim)] font-bold italic leading-relaxed uppercase">"Search for 'Pizza' to link this configuration to all pizza variants. You can assign the same structure to 'Small Margherita' and 'Large Pepperoni'."</p>
                </Card>
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] pl-2">Active Target Contexts</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {assignments.map((a: any) => (
                            <div key={a.id} className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{a.contextConfig?.name || a.targetId}</span>
                                    <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase opacity-50">{a.targetType}</span>
                                </div>
                                <Button onClick={() => configApi.deleteAssignment(a.id).then(() => onRefresh())} variant="ghost" className="text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-xl"><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepPricing({ profile, setProfile, assignments }: any) {
    const updatePrice = (assignmentId: string, optionId: string, amount: number) => {
        const existingRuleIdx = (profile.priceRules || []).findIndex((r: any) => r.targetId === optionId && r.assignmentId === assignmentId);
        let newRules = [...(profile.priceRules || [])];
        if (existingRuleIdx > -1) newRules[existingRuleIdx].amount = amount;
        else newRules.push({ id: `pr_${Date.now()}`, profileId: profile.id, assignmentId, targetType: "OPTION", targetId: optionId, strategy: "FIXED", amount: amount });
        setProfile({ ...profile, priceRules: newRules });
    };

    const getPrice = (assignmentId: string, optionId: string) => {
        const rule = (profile.priceRules || []).find((r: any) => r.targetId === optionId && r.assignmentId === assignmentId);
        return rule?.amount || 0;
    };

    return (
        <div className="space-y-8">
            <div className="px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Context-Aware Pricing Overrides</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] mt-1">Define how much each structural option costs in specific product contexts</p>
                </div>
                <Card className="bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 px-6 py-3 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-[var(--status-success)]">Pro-Tip: Set <span className="text-[var(--text-main)]">+$2.00</span> for <span className="text-[var(--text-main)]">Stuffed Crust</span> in <span className="text-[var(--text-main)]">Large</span> context</p>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {assignments.map((a: any) => (
                    <Card key={a.id} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-[2.5rem] p-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center"><Tag className="size-4 text-[var(--primary)]" /></div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">{a.contextConfig?.name || a.targetId} Context</span>
                            </div>
                            <Badge className="bg-[var(--bg-card-alt)] text-[var(--text-dim)] text-[8px] font-black uppercase border-none px-3 py-1">Manual Overrides</Badge>
                        </div>
                        <div className="space-y-8">
                            {(profile.components || []).map((c: any) => (
                                <div key={c.id} className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] pl-2">{c.name}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {c.options.map((o: any) => (
                                            <div key={o.id} className="p-5 rounded-2xl bg-[var(--bg-card-alt)]/40 border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-all group">
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-tight text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{o.name}</span>
                                                    <div className="flex items-center gap-2 bg-[var(--bg-card)] px-3 py-2 rounded-xl border border-[var(--border-main)] focus-within:border-[var(--primary)] transition-all">
                                                        <span className="text-[10px] font-black text-[var(--text-dim)]">$</span>
                                                        <Input type="number" value={getPrice(a.id, o.id)} onChange={(e) => updatePrice(a.id, o.id, parseFloat(e.target.value) || 0)} className="h-6 bg-transparent border-none text-[11px] font-black text-[var(--status-success)] p-0 text-right focus-visible:ring-0" placeholder="0.00" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function StepInventory({ profile, setProfile }: any) {
    const addInvRule = () => {
        const newRule = { id: `inv_${Date.now()}`, optionId: "", targetId: "", behavior: "DEDUCT" };
        setProfile({ ...profile, inventoryRules: [...(profile.inventoryRules || []), newRule] });
    };
    const allOptions = (profile.components || []).flatMap((c: any) => (c.options || []).map((o: any) => ({ ...o, compName: c.name })));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between px-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-main)]">Inventory Sync Engine</h2>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] mt-1">Link configuration options to physical stock levels</p>
                    </div>
                    <Button onClick={addInvRule} className="bg-[var(--primary)] text-black font-black uppercase tracking-widest text-[9px] rounded-xl h-10 px-6 gap-2 shadow-xl shadow-[var(--primary)]/10">
                        <Package className="size-4" /> Link SKU
                    </Button>
                </div>
                <div className="space-y-4">
                    {profile.inventoryRules?.map((rule: any, idx: number) => (
                        <Card key={rule.id} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 flex-1 w-full">
                                <span className="text-[10px] font-black uppercase text-[var(--text-dim)]">IF</span>
                                <select className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 flex-1 focus:border-[var(--primary)] outline-none" value={rule.optionId} onChange={(e) => {
                                    const newRules = [...profile.inventoryRules]; newRules[idx].optionId = e.target.value; setProfile({...profile, inventoryRules: newRules});
                                }}>
                                    <option value="">Select Option</option>
                                    {allOptions.map((o: any) => <option key={o.id} value={o.id}>{o.compName} : {o.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-4 flex-1 w-full">
                                <span className="text-[10px] font-black uppercase text-[var(--text-dim)]">DEDUCT</span>
                                <Input placeholder="Example: SKU-12345" value={rule.targetId} onChange={(e) => {
                                    const newRules = [...profile.inventoryRules]; newRules[idx].targetId = e.target.value; setProfile({...profile, inventoryRules: newRules});
                                }} className="h-10 text-[10px] font-black bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] flex-1 rounded-xl" />
                                <select className="bg-[var(--bg-card-alt)] border-2 border-[var(--border-main)] rounded-xl text-[10px] font-black uppercase px-4 py-2.5 w-32 focus:border-[var(--primary)] outline-none" value={rule.behavior} onChange={(e) => {
                                    const newRules = [...profile.inventoryRules]; newRules[idx].behavior = e.target.value; setProfile({...profile, inventoryRules: newRules});
                                }}>
                                    <option value="DEDUCT">DEDUCT</option>
                                    <option value="RESERVE">RESERVE</option>
                                    <option value="VALIDATE">VALIDATE</option>
                                </select>
                                <Button onClick={() => setProfile({...profile, inventoryRules: profile.inventoryRules.filter((r: any) => r.id !== rule.id)})} variant="ghost" className="text-[var(--status-error)] hover:bg-[var(--status-error-bg)] rounded-xl"><Trash2 className="size-4" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
            <Card className="bg-[var(--bg-card-alt)]/50 border border-[var(--border-main)] p-8 rounded-[2.5rem] flex flex-col gap-4">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Package className="size-5 text-[var(--text-dim)]" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">Inventory Example</h3>
                <p className="text-[10px] text-[var(--text-dim)] font-bold italic leading-relaxed uppercase">"Link 'Stuffed Crust' to SKU 'DOUGH_001'. Every time a user selects this option, the system will deduct 1 unit from that SKU's stock."</p>
            </Card>
        </div>
    );
}

function StepPreview({ profile }: any) {
    const [selections, setSelections] = React.useState<Record<string, string>>({});

    const isHidden = (componentId: string) => {
        return (profile.logicRules || []).some((rule: any) => {
            if (rule.action !== "HIDE") return false;
            if (rule.targetId !== componentId) return false;
            
            const conditionMet = selections[rule.condition.componentId] === rule.condition.value;
            return conditionMet;
        });
    };

    return (
        <Card className="bg-black border-none p-10 rounded-[2.5rem] space-y-10 min-h-[500px]">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Runtime Simulation</h2>
                    <p className="text-[8px] font-black uppercase text-white/30 mt-1">Interactive Sandbox: Logic rules are live-simulated below</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setSelections({})} variant="ghost" className="text-[8px] font-black uppercase text-white/50 hover:text-white">Reset Simulation</Button>
                    <span className="px-4 py-1.5 rounded-full bg-white/10 text-[var(--primary)] text-[9px] font-black uppercase">Sandbox Mode</span>
                </div>
            </div>
            <div className="max-w-md mx-auto space-y-10">
                {(profile.components || []).map((c: any) => {
                    if (isHidden(c.id)) return null;
                    
                    return (
                        <div key={c.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">{c.name}</Label>
                                {selections[c.id] && <Check className="size-3 text-[var(--primary)]" />}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {c.options.map((o: any) => {
                                    const isSelected = selections[c.id] === o.id;
                                    return (
                                        <button 
                                            key={o.id} 
                                            onClick={() => setSelections(prev => ({ ...prev, [c.id]: o.id }))}
                                            className={cn(
                                                "w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                                                isSelected 
                                                    ? "bg-[var(--primary)] border-[var(--primary)] text-black" 
                                                    : "bg-white/5 border-white/10 text-white hover:border-white/30"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase">{o.name}</span>
                                            {isSelected && <div className="size-2 rounded-full bg-black" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
                {(profile.components || []).every((c: any) => isHidden(c.id)) && (
                    <div className="p-20 text-center space-y-4 opacity-50">
                        <BrainCircuit className="size-10 mx-auto text-white" />
                        <p className="text-[10px] font-black uppercase text-white tracking-widest">All components hidden by logic</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

function StepPublish({ profile, assignments, handleSave, saving }: any) {
    const validations = [
        { 
            label: "Structural Integrity", 
            status: (profile.components || []).length > 0 ? "PASS" : "FAIL",
            detail: (profile.components || []).length > 0 ? `${profile.components.length} Blocks defined` : "No components added to layout"
        },
        { 
            label: "Option Density", 
            status: (profile.components || []).every((c: any) => c.options?.length > 0) ? "PASS" : "WARN",
            detail: "Checking for empty selection blocks"
        },
        { 
            label: "Global Reach", 
            status: assignments.length > 0 ? "PASS" : "WARN",
            detail: assignments.length > 0 ? `Linked to ${assignments.length} targets` : "Not assigned to any products yet"
        },
        { 
            label: "Logic Intelligence", 
            status: profile.logicRules?.length > 0 ? "INFO" : "INFO",
            detail: `${profile.logicRules?.length || 0} active structural rules`
        }
    ];

    const canPublish = (profile.components || []).length > 0;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="bg-[var(--bg-card)] border-none p-10 rounded-[3rem] space-y-8 flex flex-col justify-center items-center text-center">
                    <div className="size-24 rounded-[2rem] bg-[var(--status-success)]/10 flex items-center justify-center mb-6 animate-pulse">
                        <Send className="size-10 text-[var(--status-success)]" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-main)]">Finalize Deployment</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Create versioned immutable snapshot</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving || !canPublish} className="w-full h-16 rounded-[1.5rem] bg-[var(--status-success)] text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[var(--status-success)]/20 gap-3 mt-6">
                        {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />} Deploy to Production
                    </Button>
                    {!canPublish && <p className="text-[9px] font-black uppercase text-[var(--status-error)] mt-4">Structural integrity check failed: Add components first</p>}
                </Card>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] pl-4">System Health Check</h3>
                    <div className="space-y-3">
                        {validations.map((v, i) => (
                            <Card key={i} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] p-6 rounded-2xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-[var(--text-main)]">{v.label}</p>
                                    <p className="text-[8px] font-black uppercase text-[var(--text-dim)]">{v.detail}</p>
                                </div>
                                <Badge className={cn(
                                    "border-none text-[8px] font-black uppercase px-3 py-1",
                                    v.status === "PASS" ? "bg-[var(--status-success)]/10 text-[var(--status-success)]" :
                                    v.status === "WARN" ? "bg-orange-500/10 text-orange-500" :
                                    v.status === "FAIL" ? "bg-[var(--status-error)]/10 text-[var(--status-error)]" :
                                    "bg-[var(--bg-card-alt)] text-[var(--text-dim)]"
                                )}>{v.status}</Badge>
                            </Card>
                        ))}
                    </div>
                    <Card className="bg-[var(--primary)]/5 border-2 border-dashed border-[var(--primary)]/20 p-6 rounded-[2rem]">
                         <p className="text-[9px] text-[var(--text-dim)] font-bold italic leading-relaxed uppercase">
                            "Deployment will generate a unique version hash. All structural rules and price contextualization will be locked for this snapshot."
                         </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
