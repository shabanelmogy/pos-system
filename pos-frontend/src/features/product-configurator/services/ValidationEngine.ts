import { ConfigProfile } from '../types';
import { RuleEngine } from './RuleEngine';

/**
 * Frontend ValidationEngine
 * Provides real-time validation feedback in the configurator UI.
 */
export class ValidationEngine {
  static validate(profile: ConfigProfile, rules: any[], selections: Record<string, any>) {
    const errors: { id: string; code: string; msg: string }[] = [];
    const activeState = RuleEngine.resolve(rules, selections);

    profile.components.forEach(comp => {
      if (activeState.hidden.includes(comp.id)) return;

      const val = selections[comp.id]?.value;
      const isReq = comp.isRequired || activeState.required.includes(comp.id);
      const dsl = comp.validationDsl || {};

      if (isReq && this.isEmpty(val)) {
        errors.push({ id: comp.id, code: 'REQ', msg: 'This field is required' });
        return;
      }

      if (this.isEmpty(val)) return;

      this.checkDsl(comp, val, dsl, errors);
    });

    return { isValid: errors.length === 0, errors };
  }

  static isEmpty(v: any): boolean {
    return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
  }

  static checkDsl(comp: any, val: any, dsl: any, errors: any[]) {
    const err = (code: string, msg: string) => errors.push({ id: comp.id, code, msg });

    if (dsl.text) {
      if (dsl.text.min && val.length < dsl.text.min) err('MIN_LEN', `Minimum ${dsl.text.min} characters`);
      if (dsl.text.max && val.length > dsl.text.max) err('MAX_LEN', `Maximum ${dsl.text.max} characters`);
      if (dsl.text.regex && !new RegExp(dsl.text.regex).test(val)) err('REGEX', dsl.text.msg || 'Invalid format');
    }

    if (dsl.number) {
      const n = parseFloat(val);
      if (dsl.number.min !== undefined && n < dsl.number.min) err('MIN_VAL', `Minimum value is ${dsl.number.min}`);
      if (dsl.number.max !== undefined && n > dsl.number.max) err('MAX_VAL', `Maximum value is ${dsl.number.max}`);
    }

    if (dsl.selection) {
      if (dsl.selection.min && val.length < dsl.selection.min) err('MIN_SEL', `Select at least ${dsl.selection.min} options`);
      if (dsl.selection.max && val.length > dsl.selection.max) err('MAX_SEL', `Select no more than ${dsl.selection.max} options`);
    }
  }
}
