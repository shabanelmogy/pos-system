import { RuleEngine } from './RuleEngine.js';

/**
 * FINAL Enterprise ValidationEngine
 * Validates against the strongly-typed validationDsl.
 */
export class ValidationEngine {
  static validate(profile, rules, session) {
    const errors = [];
    const activeState = RuleEngine.resolve(rules, session);

    profile.components.forEach(comp => {
      if (activeState.hidden.includes(comp.id)) return;

      const val = session.selections[comp.id]?.value;
      const isReq = comp.isRequired || activeState.required.includes(comp.id);
      const dsl = comp.validationDsl || {};

      // 1. Requirement check
      if (isReq && this.isEmpty(val)) {
        errors.push({ id: comp.id, code: 'REQ', msg: 'Required field' });
        return;
      }

      if (this.isEmpty(val)) return;

      // 2. Type/DSL validation
      this.checkDsl(comp, val, dsl, errors);
    });

    return { isValid: errors.length === 0, errors };
  }

  static isEmpty(v) {
    return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
  }

  static checkDsl(comp, val, dsl, errors) {
    const err = (code, msg) => errors.push({ id: comp.id, code, msg });

    // Text Validation
    if (dsl.text) {
      if (dsl.text.min && val.length < dsl.text.min) err('MIN_LEN', `Min ${dsl.text.min} chars`);
      if (dsl.text.max && val.length > dsl.text.max) err('MAX_LEN', `Max ${dsl.text.max} chars`);
      if (dsl.text.regex && !new RegExp(dsl.text.regex).test(val)) err('REGEX', dsl.text.msg || 'Invalid format');
    }

    // Number Validation
    if (dsl.number) {
      const n = parseFloat(val);
      if (dsl.number.min !== undefined && n < dsl.number.min) err('MIN_VAL', `Min ${dsl.number.min}`);
      if (dsl.number.max !== undefined && n > dsl.number.max) err('MAX_VAL', `Max ${dsl.number.max}`);
      if (dsl.number.precision !== undefined) {
        const d = (n.toString().split('.')[1] || '').length;
        if (d > dsl.number.precision) err('PRECISION', `Max ${dsl.number.precision} decimals`);
      }
    }

    // Date Validation
    if (dsl.date) {
      const d = new Date(val);
      if (dsl.date.min && d < new Date(dsl.date.min)) err('MIN_DATE', `Cannot be before ${dsl.date.min}`);
      if (dsl.date.blackout?.includes(val.split('T')[0])) err('BLACKOUT', 'Date not available');
    }

    // Selection Validation
    if (dsl.selection) {
      if (dsl.selection.min && val.length < dsl.selection.min) err('MIN_SEL', `Select at least ${dsl.selection.min}`);
      if (dsl.selection.max && val.length > dsl.selection.max) err('MAX_SEL', `Select no more than ${dsl.selection.max}`);
    }
  }
}
