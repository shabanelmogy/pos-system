export interface LocalizedString {
  en: string;
  ar: string;
  [key: string]: string;
}

export type LocalizedField = string | LocalizedString;

export type ComponentType = 
  | "SINGLE_SELECT" 
  | "MULTI_SELECT" 
  | "TOGGLE" 
  | "TEXT_INPUT" 
  | "NUMBER_INPUT" 
  | "WARRANTY" 
  | "SUBSCRIPTION";

export type RuleAction = 
  | "HIDE" 
  | "SHOW" 
  | "ENABLE" 
  | "DISABLE" 
  | "REQUIRE";

export interface ConfigOption {
  id: string;
  name: LocalizedField;
  description?: LocalizedField;
  internalCode: string;
  price?: number | string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface ConfigComponent {
  id: string;
  name: LocalizedField;
  type: ComponentType;
  isRequired: boolean;
  sortOrder: number;
  options: ConfigOption[];
  validationDsl?: Record<string, any>;
  uiMetadata?: Record<string, any>;
}

export interface LogicRule {
  id: string;
  name?: string;
  conditionDsl: {
    componentId: string;
    operator: "EQ" | "NEQ" | "IN" | "NIN";
    value: any;
  };
  action: RuleAction;
  targetType: "COMPONENT" | "OPTION";
  targetId: string;
}

export interface PriceRule {
  id: string;
  name?: string;
  strategy: "FIXED" | "PERCENTAGE";
  targetType: "COMPONENT" | "OPTION" | "GLOBAL";
  targetId?: string;
  amount: number | string;
  strategyData?: Record<string, any>;
}

export interface ConfigProfile {
  id: string;
  name: LocalizedField;
  description?: LocalizedField;
  internalCode: string;
  versionNumber: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  components: ConfigComponent[];
  logicRules: LogicRule[];
  priceRules: PriceRule[];
}

export interface ConfiguratorProps {
  profile: ConfigProfile;
  basePrice: number;
  locale?: string;
  onComplete: (data: any) => void;
  onCancel?: () => void;
}
