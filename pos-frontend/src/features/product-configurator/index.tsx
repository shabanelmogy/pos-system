import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  ConfigProfile, 
  ConfigComponent, 
  ConfigOption, 
  LocalizedString, 
  LocalizedField 
} from "./types";
import { RuleEngine } from "./services/RuleEngine";
import { PricingEngine } from "./services/PricingEngine";
import { ValidationEngine } from "./services/ValidationEngine";
import { ChevronLeft, ChevronRight, Check, ShoppingCart } from "lucide-react";

interface ProductConfiguratorProps {
  profile: ConfigProfile;
  basePrice: number;
  locale?: string;
  className?: string;
  onComplete: (data: { selections: any; pricing: any; version: number }) => void;
  onCancel?: () => void;
}

export function ProductConfigurator({ 
  profile, 
  basePrice, 
  locale = "en", 
  className,
  onComplete,
  onCancel
}: ProductConfiguratorProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selections, setSelections] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<any[]>([]);
  const [engineResult, setEngineResult] = React.useState<any>({
    hidden: [],
    disabled: [],
    required: [],
    overrides: {}
  });

  // Helper for localization
  const t = (field: LocalizedField): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return (field as LocalizedString)[locale] || (field as LocalizedString)["en"] || "";
  };

  // Run Rule Engine on selection change
  React.useEffect(() => {
    const result = RuleEngine.resolve(profile.logicRules, selections);
    setEngineResult(result);
  }, [selections, profile.logicRules]);

  // Calculate Pricing
  const pricing = React.useMemo(() => {
    const selectionList = Object.entries(selections).map(([compId, val]) => ({
      componentId: compId,
      optionId: typeof val === "object" ? val.id : null,
      value: typeof val === "object" ? val.value : val
    }));

    return PricingEngine.calculate({
      basePrice,
      selections: selectionList,
      priceRules: profile.priceRules
    });
  }, [selections, basePrice, profile.priceRules]);

  // Filter visible components
  const visibleComponents = React.useMemo(() => {
    return profile.components
      .filter((c: ConfigComponent) => !engineResult.hidden.includes(c.id))
      .sort((a: ConfigComponent, b: ConfigComponent) => a.sortOrder - b.sortOrder);
  }, [profile.components, engineResult.hidden]);

  const activeComponent = visibleComponents[currentStep];
  const isLastStep = currentStep === visibleComponents.length - 1;

  const handleSelect = (componentId: string, value: any, metadata: any = {}) => {
    setSelections(prev => ({
      ...prev,
      [componentId]: typeof value === "object" ? value : { value, ...metadata }
    }));
  };

  const nextStep = () => {
    // Basic validation for required fields before moving next
    if (activeComponent.isRequired || engineResult.required.includes(activeComponent.id)) {
        if (!selections[activeComponent.id]) {
            setErrors([{ id: activeComponent.id, msg: "This selection is required to continue" }]);
            return;
        }
    }
    setErrors([]);
    if (!isLastStep) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrors([]);
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    const result = ValidationEngine.validate(profile, profile.logicRules, selections);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    onComplete({ 
      selections, 
      pricing, 
      version: profile.versionNumber 
    });
  };

  if (!profile) {
    return (
      <div className="p-12 text-center bg-[var(--bg-card)] rounded-[2.5rem] border-2 border-dashed border-[var(--border-main)]">
        <AlertCircle className="size-12 mx-auto text-[var(--status-error)] mb-4" />
        <p className="font-black uppercase tracking-widest text-sm text-[var(--text-main)]">Missing Profile</p>
        <p className="text-xs text-[var(--text-muted)] mt-2">The configuration engine could not find a valid profile to load.</p>
      </div>
    );
  }

  if (visibleComponents.length === 0) {
    return (
      <div className="p-12 text-center bg-[var(--bg-card)] rounded-[2.5rem] border-2 border-dashed border-[var(--border-main)]">
        <Info className="size-12 mx-auto text-[var(--primary)] mb-4" />
        <p className="font-black uppercase tracking-widest text-sm text-[var(--text-main)]">Empty Configuration</p>
        <p className="text-xs text-[var(--text-muted)] mt-2">This profile exists but has no visible components or options yet.</p>
        <div className="mt-8 pt-8 border-t border-[var(--border-main)]">
            <p className="text-[10px] font-black uppercase text-[var(--text-dim)]">Debug Info</p>
            <p className="text-[10px] text-[var(--text-dim)] mt-1">Profile ID: {profile.id}</p>
            <p className="text-[10px] text-[var(--text-dim)]">Total Components: {profile.components?.length || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn("w-full max-w-3xl border-none shadow-none bg-transparent text-[var(--text-main)] rounded-3xl", className)} 
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Header & Step Indicator */}
      <CardHeader className="px-0 pb-0">
        <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
                {visibleComponents.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={cn("h-1.5 transition-all duration-500 rounded-full", 
                            idx === currentStep ? "w-8 bg-[var(--primary)]" : idx < currentStep ? "w-4 bg-[var(--status-success)]" : "w-4 bg-[var(--bg-card-alt)]")
                        } 
                    />
                ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Step {currentStep + 1} of {visibleComponents.length}</span>
        </div>
        <CardTitle className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">
          {t(activeComponent.name)}
        </CardTitle>
        {activeComponent.uiMetadata?.helpText && (
          <CardDescription className="text-[var(--text-muted)] font-medium mt-2 italic">
            {t(activeComponent.uiMetadata.helpText)}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-0 py-10 min-h-[300px]">
        <ComponentRenderer
            component={activeComponent}
            value={selections[activeComponent.id]?.value || selections[activeComponent.id]?.id}
            isDisabled={engineResult.disabled.includes(activeComponent.id)}
            error={errors.find((e) => e.id === activeComponent.id)?.msg}
            onChange={(val, meta) => handleSelect(activeComponent.id, val, meta)}
            t={t}
        />
      </CardContent>

      <CardFooter className="px-0 pt-10 border-t border-[var(--border-main)] flex flex-col sm:flex-row items-center justify-between gap-8 mt-12">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] mb-1.5">
            Running Total
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-[var(--text-main)] tracking-tighter">
              ${pricing.finalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? onCancel : prevStep} 
            className="flex-1 sm:flex-none h-14 px-8 font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl border-[var(--border-main)] hover:bg-[var(--bg-hover)] gap-2"
          >
            <ChevronLeft className="size-4" />
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          {isLastStep ? (
            <Button 
                onClick={handleComplete} 
                className="flex-1 sm:flex-none h-14 px-10 font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl bg-[var(--status-success)] hover:bg-[var(--status-success-hover)] text-white shadow-xl shadow-[var(--status-success)]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2"
            >
                <ShoppingCart className="size-4" />
                Add to Order
            </Button>
          ) : (
            <Button 
                onClick={nextStep} 
                className="flex-1 sm:flex-none h-14 px-10 font-black uppercase tracking-[0.15em] text-[10px] rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black shadow-xl shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2"
            >
                Next Step
                <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function ComponentRenderer({
  component,
  value,
  isDisabled,
  error,
  onChange,
  t
}: {
  component: ConfigComponent;
  value: any;
  isDisabled: boolean;
  error?: string;
  onChange: (val: any, meta?: any) => void;
  t: (field: LocalizedField) => string;
}) {
  if (isDisabled) {
    return (
      <div className="text-[var(--text-muted)] italic text-sm py-8 px-10 bg-[var(--bg-card-alt)] rounded-[2.5rem] border-2 border-[var(--border-main)] border-dashed text-center">
        This selection is currently restricted by your other choices.
      </div>
    );
  }

  const renderInput = () => {
    switch (component.type) {
      case "SINGLE_SELECT":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {component.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChange(opt.id, opt)}
                className={cn(
                  "relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left",
                  value === opt.id 
                    ? "bg-[var(--primary-light)] border-[var(--primary)] shadow-[0_20px_40px_rgba(246,177,0,0.1)]" 
                    : "bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--text-dim)]"
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                   <span className={cn("text-xl font-black uppercase tracking-tight", value === opt.id ? "text-[var(--primary)]" : "text-[var(--text-main)]")}>
                      {t(opt.name)}
                    </span>
                    {value === opt.id && <div className="size-6 rounded-full bg-[var(--primary)] flex items-center justify-center"><Check className="size-3.5 text-black" /></div>}
                </div>
                {opt.description && (
                  <span className="text-[11px] text-[var(--text-dim)] font-medium line-clamp-2">
                    {t(opt.description)}
                  </span>
                )}
                {opt.price && parseFloat(opt.price as string) > 0 && (
                    <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--status-success)]">+ ${opt.price}</div>
                )}
              </button>
            ))}
          </div>
        );

      case "MULTI_SELECT":
        const current = Array.isArray(value) ? value : [];
        const toggle = (opt: ConfigOption) => {
          const next = current.includes(opt.id) 
            ? current.filter((v) => v !== opt.id) 
            : [...current, opt.id];
          onChange(next, { options: next });
        };

        return (
          <div className="grid grid-cols-1 gap-3">
            {component.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggle(opt)}
                className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300",
                  current.includes(opt.id) 
                    ? "bg-[var(--bg-card-alt)] border-[var(--primary)] shadow-sm" 
                    : "bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--text-dim)]"
                )}
              >
                <div className="flex items-center gap-5">
                  <div className={cn("size-7 rounded-xl border-2 flex items-center justify-center transition-all", 
                    current.includes(opt.id) ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border-main)]")}>
                    {current.includes(opt.id) && <Check className="size-4 text-black" />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={cn("text-sm font-black uppercase tracking-tight", current.includes(opt.id) ? "text-[var(--text-main)]" : "text-[var(--text-muted)]")}>
                        {t(opt.name)}
                    </span>
                    {opt.price && parseFloat(opt.price as string) > 0 && (
                        <span className="text-[9px] font-black text-[var(--status-success)] uppercase mt-0.5">+ ${opt.price}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "TEXT_INPUT":
        return (
          <div className="space-y-4">
             <Input 
                value={value || ""} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder="Type your requirements here..." 
                className="h-20 px-8 rounded-3xl bg-[var(--bg-input)] border-2 border-[var(--border-main)] text-[var(--text-main)] font-bold text-lg placeholder:text-[var(--text-dim)] focus:border-[var(--primary)] transition-all" 
            />
            <p className="text-[10px] text-[var(--text-dim)] font-medium px-2">Example: No onions, extra spicy, etc.</p>
          </div>
        );

      default:
        return <div className="text-[var(--text-dim)] text-xs italic">Custom renderer required for {component.type}</div>;
    }
  };

  return (
    <div className="space-y-4">
      {renderInput()}
      {error && (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--status-error)] px-4 py-3 bg-[var(--status-error-bg)] rounded-xl border border-[var(--status-error)]/20 animate-pulse">
            <Info className="size-3" />
            {error}
        </div>
      )}
    </div>
  );
}

function Info(props: any) {
    return <AlertCircle {...props} />
}
